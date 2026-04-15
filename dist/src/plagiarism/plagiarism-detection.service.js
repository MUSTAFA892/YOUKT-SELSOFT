"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlagiarismDetectionService = void 0;
const common_1 = require("@nestjs/common");
const ai_patterns_constants_1 = require("./ai-patterns.constants");
let PlagiarismDetectionService = class PlagiarismDetectionService {
    constructor() {
        this.submissionDatabase = new Map();
    }
    registerSubmission(submissionId, code, candidateId, interviewId, problemId) {
        this.submissionDatabase.set(submissionId, {
            code,
            candidateId,
            interviewId,
            problemId,
            timestamp: new Date(),
        });
    }
    checkPlagiarism(submitCode, candidateId, interviewId, problemId, submissionId, submissionTimeMs, pasteDetected) {
        const matches = [];
        let maxSimilarity = 0;
        if (submissionTimeMs !== undefined) {
            const signatureKey = ai_patterns_constants_1.AI_PATTERNS.PROBLEM_ID_MAP[problemId] ??
                ai_patterns_constants_1.AI_PATTERNS.PROBLEM_ID_MAP[problemId.toLowerCase()] ??
                problemId;
            const minTimeS = ai_patterns_constants_1.AI_PATTERNS.MIN_TIME_S[signatureKey] ?? ai_patterns_constants_1.AI_PATTERNS.MIN_TIME_S.DEFAULT;
            const minTimeMs = minTimeS * 1000;
            let timeSuspicion = 0;
            if (submissionTimeMs < minTimeMs * 0.25)
                timeSuspicion = 0.75;
            else if (submissionTimeMs < minTimeMs * 0.5)
                timeSuspicion = 0.55;
            else if (submissionTimeMs < minTimeMs * 0.75)
                timeSuspicion = 0.35;
            maxSimilarity = Math.max(maxSimilarity, timeSuspicion);
        }
        if (pasteDetected) {
            let pasteSuspicion = 0.4;
            if (submissionTimeMs !== undefined) {
                if (submissionTimeMs < 30_000)
                    pasteSuspicion = 0.95;
                else if (submissionTimeMs < 60_000)
                    pasteSuspicion = 0.8;
                else if (submissionTimeMs < 180_000)
                    pasteSuspicion = 0.6;
                else
                    pasteSuspicion = 0.45;
            }
            maxSimilarity = Math.max(maxSimilarity, pasteSuspicion);
        }
        const aiRiskResult = this.detectAiRisk(submitCode, problemId);
        const aiSimilarityNormalised = aiRiskResult.similarity / 100;
        maxSimilarity = Math.max(maxSimilarity, aiSimilarityNormalised);
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
    detectAiRisk(code, problemId) {
        let score = 0;
        let isAiSignature = false;
        const normalized = this.normalizeForSignature(code);
        const signatureKey = ai_patterns_constants_1.AI_PATTERNS.PROBLEM_ID_MAP[problemId] ??
            ai_patterns_constants_1.AI_PATTERNS.PROBLEM_ID_MAP[problemId.toLowerCase()] ??
            problemId;
        const signatures = ai_patterns_constants_1.AI_PATTERNS.SIGNATURES[signatureKey] || [];
        for (const sig of signatures) {
            const normalizedSig = this.normalizeForSignature(sig);
            if (normalized.includes(normalizedSig) ||
                normalizedSig.includes(normalized)) {
                score = 95;
                isAiSignature = true;
                break;
            }
        }
        if (!isAiSignature) {
            let heuristicHits = 0;
            ai_patterns_constants_1.AI_PATTERNS.HEURISTICS.COMMON_VAR_NAMES.forEach((name) => {
                if (code.includes(name))
                    heuristicHits++;
            });
            ai_patterns_constants_1.AI_PATTERNS.HEURISTICS.COMMENT_STYLES.forEach((regex) => {
                if (regex.test(code))
                    heuristicHits += 2;
            });
            ai_patterns_constants_1.AI_PATTERNS.HEURISTICS.BOILERPLATE.forEach((regex) => {
                if (regex.test(code))
                    heuristicHits += 3;
            });
            const lines = code.split('\n').filter((l) => l.trim().length > 0);
            const commentLines = lines.filter((l) => l.trim().startsWith('#') || l.trim().startsWith('//'));
            const commentDensity = lines.length > 0 ? commentLines.length / lines.length : 0;
            if (commentDensity > 0.25) {
                heuristicHits += 4;
            }
            score = Math.min(heuristicHits * 20, 85);
        }
        return { similarity: score, isAiSignature };
    }
    normalizeForSignature(code) {
        return code
            .replace(/\/\/.*/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, '')
            .replace(/['";]/g, '')
            .toLowerCase();
    }
    calculateSimilarity(code1, code2) {
        const tokens1 = this.tokenizeCode(code1);
        const tokens2 = this.tokenizeCode(code2);
        return this.cosineSimilarity(tokens1, tokens2);
    }
    tokenizeCode(code) {
        const normalized = code
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/['";]/g, '')
            .trim();
        return normalized.split(/\s+/).filter((t) => t.length > 2);
    }
    cosineSimilarity(tokens1, tokens2) {
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
        if (norm1 === 0 || norm2 === 0)
            return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    getFrequencyMap(tokens) {
        const freq = new Map();
        tokens.forEach((token) => {
            freq.set(token, (freq.get(token) || 0) + 1);
        });
        return freq;
    }
    findMatchingLines(code1, code2) {
        const lines1 = code1.split('\n');
        const lines2 = new Set(code2.split('\n').map((l) => l.trim()));
        const matches = [];
        lines1.forEach((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.length > 5 && lines2.has(trimmed)) {
                matches.push({ lineNumber: idx + 1, content: trimmed });
            }
        });
        return matches.slice(0, 5);
    }
    generateCodeHash(code) {
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            const char = code.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return 'HASH_' + Math.abs(hash).toString(16);
    }
    calculateRiskLevel(similarity) {
        if (similarity >= 0.8)
            return 'critical';
        if (similarity >= 0.6)
            return 'high';
        if (similarity >= 0.4)
            return 'medium';
        return 'low';
    }
    getSubmissionReport(submissionId) {
        const submission = this.submissionDatabase.get(submissionId);
        if (!submission)
            return null;
        return this.checkPlagiarism(submission.code, submission.candidateId, submission.interviewId, submission.problemId, submissionId, undefined, false);
    }
};
exports.PlagiarismDetectionService = PlagiarismDetectionService;
exports.PlagiarismDetectionService = PlagiarismDetectionService = __decorate([
    (0, common_1.Injectable)()
], PlagiarismDetectionService);
//# sourceMappingURL=plagiarism-detection.service.js.map