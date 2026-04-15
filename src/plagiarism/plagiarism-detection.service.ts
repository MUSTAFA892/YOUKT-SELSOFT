import { Injectable } from '@nestjs/common';
import { AI_PATTERNS } from './ai-patterns.constants';

export interface PlagiarismMatch {
  candidateId: string;
  candidateName: string;
  interviewId: string;
  similarity: number;
  matchedLines: Array<{ lineNumber: number; content: string }>;
  timestamp: Date;
}

export interface PlagiarismReport {
  submissionId: string;
  candidateId: string;
  codeHash: string;
  matches: PlagiarismMatch[];
  overallSimilarity: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

@Injectable()
export class PlagiarismDetectionService {
  private submissionDatabase: Map<
    string,
    {
      code: string;
      candidateId: string;
      interviewId: string;
      problemId: string;
      timestamp: Date;
    }
  > = new Map();

  registerSubmission(
    submissionId: string,
    code: string,
    candidateId: string,
    interviewId: string,
    problemId: string,
  ): void {
    this.submissionDatabase.set(submissionId, {
      code,
      candidateId,
      interviewId,
      problemId,
      timestamp: new Date(),
    });
  }

  checkPlagiarism(
    submitCode: string,
    candidateId: string,
    interviewId: string,
    problemId: string,
    submissionId?: string,
    submissionTimeMs?: number,
    pasteDetected?: boolean,
  ): PlagiarismReport {
    const matches: PlagiarismMatch[] = [];
    let maxSimilarity = 0;

    // ── 1. context-aware Time-based suspicion signal ────────────────────
    // A real developer needs time to type.
    if (submissionTimeMs !== undefined) {
      const signatureKey =
        AI_PATTERNS.PROBLEM_ID_MAP[problemId] ??
        AI_PATTERNS.PROBLEM_ID_MAP[problemId.toLowerCase()] ??
        problemId;

      const minTimeS =
        AI_PATTERNS.MIN_TIME_S[signatureKey] ?? AI_PATTERNS.MIN_TIME_S.DEFAULT;
      const minTimeMs = minTimeS * 1000;

      let timeSuspicion = 0;
      // If submitted in < 25% of minimum reasonable time
      if (submissionTimeMs < minTimeMs * 0.25) timeSuspicion = 0.75;
      // If submitted in < 50% of minimum reasonable time
      else if (submissionTimeMs < minTimeMs * 0.5) timeSuspicion = 0.55;
      // If submitted in < 75% of minimum reasonable time
      else if (submissionTimeMs < minTimeMs * 0.75) timeSuspicion = 0.35;

      maxSimilarity = Math.max(maxSimilarity, timeSuspicion);
    }

    // ── 2. Explicit Paste Detection Signal ───────────────────────────────
    // If the IDE detected a paste event, escalate risk based on speed.
    if (pasteDetected) {
      let pasteSuspicion = 0.4; // Base "medium" suspicion for any paste
      if (submissionTimeMs !== undefined) {
        if (submissionTimeMs < 30_000) pasteSuspicion = 0.95; // < 30s + Paste = Critical
        else if (submissionTimeMs < 60_000) pasteSuspicion = 0.8; // < 60s + Paste = High
        else if (submissionTimeMs < 180_000) pasteSuspicion = 0.6; // < 3m + Paste = Medium-High
        else pasteSuspicion = 0.45; // > 3m + Paste = Still suspicious (Medium)
      }
      maxSimilarity = Math.max(maxSimilarity, pasteSuspicion);
    }

    // ── 3. AI pattern / signature detection ─────────────────────────────
    const aiRiskResult = this.detectAiRisk(submitCode, problemId);
    const aiSimilarityNormalised = aiRiskResult.similarity / 100;
    maxSimilarity = Math.max(maxSimilarity, aiSimilarityNormalised);

    // ── 3. Peer-to-peer comparison ───────────────────────────────────────
    this.submissionDatabase.forEach((submission, storedId) => {
      if (submission.candidateId !== candidateId) {
        const similarity = this.calculateSimilarity(submitCode, submission.code);

        if (similarity > 0.4) {
          maxSimilarity = Math.max(maxSimilarity, similarity);
          matches.push({
            candidateId: submission.candidateId,
            candidateName: `Candidate ${submission.candidateId}`,
            interviewId: submission.interviewId,
            similarity: Math.round(similarity * 100),
            matchedLines: this.findMatchingLines(submitCode, submission.code),
            timestamp: submission.timestamp,
          });
        }
      }
    });

    const codeHash = this.generateCodeHash(submitCode);
    let riskLevel = this.calculateRiskLevel(maxSimilarity);

    // If we got an exact AI signature hit, always escalate to critical
    if (aiRiskResult.isAiSignature) {
      maxSimilarity = Math.max(maxSimilarity, aiRiskResult.similarity / 100);
      riskLevel = 'critical';
    }

    return {
      submissionId: submissionId || '',
      candidateId,
      codeHash,
      matches: matches.sort((a, b) => b.similarity - a.similarity),
      overallSimilarity: Math.round(maxSimilarity * 100),
      riskLevel,
      timestamp: new Date(),
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private detectAiRisk(
    code: string,
    problemId: string,
  ): { similarity: number; isAiSignature: boolean } {
    let score = 0;
    let isAiSignature = false;

    const normalized = this.normalizeForSignature(code);

    // Resolve real signature key via the ID map
    const signatureKey =
      AI_PATTERNS.PROBLEM_ID_MAP[problemId] ??
      AI_PATTERNS.PROBLEM_ID_MAP[problemId.toLowerCase()] ??
      problemId;

    const signatures = AI_PATTERNS.SIGNATURES[signatureKey] || [];

    for (const sig of signatures) {
      const normalizedSig = this.normalizeForSignature(sig);
      if (
        normalized.includes(normalizedSig) ||
        normalizedSig.includes(normalized)
      ) {
        score = 95;
        isAiSignature = true;
        break;
      }
    }

    if (!isAiSignature) {
      let heuristicHits = 0;

      // Variable names — 1 point each
      AI_PATTERNS.HEURISTICS.COMMON_VAR_NAMES.forEach((name) => {
        if (code.includes(name)) heuristicHits++;
      });

      // Comment styles — 2 points each (these are strongly AI-flavoured)
      AI_PATTERNS.HEURISTICS.COMMENT_STYLES.forEach((regex) => {
        if (regex.test(code)) heuristicHits += 2;
      });

      // Boilerplate patterns — 3 points each
      AI_PATTERNS.HEURISTICS.BOILERPLATE.forEach((regex) => {
        if (regex.test(code)) heuristicHits += 3;
      });

      // ── New: Comment Density Analysis ──────────────
      // AI tends to over-comment code. If > 25% of lines are comments,
      // it's a strong AI indicator.
      const lines = code.split('\n').filter((l) => l.trim().length > 0);
      const commentLines = lines.filter(
        (l) => l.trim().startsWith('#') || l.trim().startsWith('//'),
      );
      const commentDensity =
        lines.length > 0 ? commentLines.length / lines.length : 0;

      if (commentDensity > 0.25) {
        heuristicHits += 4; // High penalty for excessive comments
      }

      // Higher multiplier than before (was 15, now 20) so heuristics
      // actually push the score into the medium/high bands.
      score = Math.min(heuristicHits * 20, 85);
    }

    return { similarity: score, isAiSignature };
  }

  private normalizeForSignature(code: string): string {
    return code
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, '')
      .replace(/['";]/g, '')
      .toLowerCase();
  }

  private calculateSimilarity(code1: string, code2: string): number {
    const tokens1 = this.tokenizeCode(code1);
    const tokens2 = this.tokenizeCode(code2);
    return this.cosineSimilarity(tokens1, tokens2);
  }

  private tokenizeCode(code: string): string[] {
    const normalized = code
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/['";]/g, '')
      .trim();
    return normalized.split(/\s+/).filter((t) => t.length > 2);
  }

  private cosineSimilarity(tokens1: string[], tokens2: string[]): number {
    const freq1 = this.getFrequencyMap(tokens1);
    const freq2 = this.getFrequencyMap(tokens2);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const allTokens = new Set([...tokens1, ...tokens2]);

    allTokens.forEach((token) => {
      const f1 = freq1.get(token) || 0;
      const f2 = freq2.get(token) || 0;
      dotProduct += f1 * f2;
      norm1 += f1 * f1;
      norm2 += f2 * f2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private getFrequencyMap(tokens: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    tokens.forEach((token) => {
      freq.set(token, (freq.get(token) || 0) + 1);
    });
    return freq;
  }

  private findMatchingLines(
    code1: string,
    code2: string,
  ): Array<{ lineNumber: number; content: string }> {
    const lines1 = code1.split('\n');
    const lines2 = new Set(code2.split('\n').map((l) => l.trim()));
    const matches: Array<{ lineNumber: number; content: string }> = [];

    lines1.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.length > 5 && lines2.has(trimmed)) {
        matches.push({ lineNumber: idx + 1, content: trimmed });
      }
    });

    return matches.slice(0, 5);
  }

  private generateCodeHash(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 'HASH_' + Math.abs(hash).toString(16);
  }

  private calculateRiskLevel(
    similarity: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (similarity >= 0.8) return 'critical';
    if (similarity >= 0.6) return 'high';
    if (similarity >= 0.4) return 'medium';
    return 'low';
  }

  getSubmissionReport(submissionId: string): PlagiarismReport | null {
    const submission = this.submissionDatabase.get(submissionId);
    if (!submission) return null;
    return this.checkPlagiarism(
      submission.code,
      submission.candidateId,
      submission.interviewId,
      submission.problemId,
      submissionId,
      undefined, // submissionTimeMs
      false, // pasteDetected
    );
  }
}