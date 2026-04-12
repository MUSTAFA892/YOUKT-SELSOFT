import { Injectable } from '@nestjs/common';

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
  private submissionDatabase: Map<string, { code: string; candidateId: string; interviewId: string; timestamp: Date }> = new Map();

  registerSubmission(submissionId: string, code: string, candidateId: string, interviewId: string): void {
    this.submissionDatabase.set(submissionId, {
      code,
      candidateId,
      interviewId,
      timestamp: new Date()
    });
  }

  checkPlagiarism(submitCode: string, candidateId: string, interviewId: string, submissionId?: string): PlagiarismReport {
    const matches: PlagiarismMatch[] = [];
    let maxSimilarity = 0;

    // Check against all previous submissions
    this.submissionDatabase.forEach((submission, submissionId) => {
      if (submission.candidateId !== candidateId) {
        const similarity = this.calculateSimilarity(submitCode, submission.code);
        
        if (similarity > 0.4) { // 40% threshold
          maxSimilarity = Math.max(maxSimilarity, similarity);
          matches.push({
            candidateId: submission.candidateId,
            candidateName: `Candidate ${submission.candidateId}`,
            interviewId: submission.interviewId,
            similarity: Math.round(similarity * 100),
            matchedLines: this.findMatchingLines(submitCode, submission.code),
            timestamp: submission.timestamp
          });
        }
      }
    });

    const codeHash = this.generateCodeHash(submitCode);
    const riskLevel = this.calculateRiskLevel(maxSimilarity);

    const report: PlagiarismReport = {
      submissionId: submissionId || '',
      candidateId,
      codeHash,
      matches: matches.sort((a, b) => b.similarity - a.similarity),
      overallSimilarity: Math.round(maxSimilarity * 100),
      riskLevel,
      timestamp: new Date()
    };

    return report;
  }

  private calculateSimilarity(code1: string, code2: string): number {
    const tokens1 = this.tokenizeCode(code1);
    const tokens2 = this.tokenizeCode(code2);
    
    return this.cosineSimilarity(tokens1, tokens2);
  }

  private tokenizeCode(code: string): string[] {
    // Normalize and tokenize code
    const normalized = code
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/['";]/g, '')
      .trim();

    return normalized.split(/\s+/).filter(t => t.length > 2);
  }

  private cosineSimilarity(tokens1: string[], tokens2: string[]): number {
    const freq1 = this.getFrequencyMap(tokens1);
    const freq2 = this.getFrequencyMap(tokens2);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const allTokens = new Set([...tokens1, ...tokens2]);

    allTokens.forEach(token => {
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
    tokens.forEach(token => {
      freq.set(token, (freq.get(token) || 0) + 1);
    });
    return freq;
  }

  private findMatchingLines(code1: string, code2: string): Array<{ lineNumber: number; content: string }> {
    const lines1 = code1.split('\n');
    const lines2 = code2.split('\n');
    const matches: Array<{ lineNumber: number; content: string }> = [];

    lines1.forEach((line, idx1) => {
      lines2.forEach((line2) => {
        if (line.trim() === line2.trim()) {
          matches.push({
            lineNumber: idx1 + 1,
            content: line.trim()
          });
        }
      });
    });

    return matches.slice(0, 5); // Return top 5 matches
  }

  private generateCodeHash(code: string): string {
    // Simple hash - in production use crypto.createHash('sha256')
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'HASH_' + Math.abs(hash).toString(16);
  }

  private calculateRiskLevel(similarity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (similarity >= 0.8) return 'critical';
    if (similarity >= 0.6) return 'high';
    if (similarity >= 0.4) return 'medium';
    return 'low';
  }

  // Method to get submission by ID (mock - in production would query database)
  getSubmissionReport(submissionId: string): PlagiarismReport | null {
    const submission = this.submissionDatabase.get(submissionId);
    if (!submission) return null;

    // Return a cached report or recalculate
    return this.checkPlagiarism(submission.code, submission.candidateId, submission.interviewId, submissionId);
  }
}
