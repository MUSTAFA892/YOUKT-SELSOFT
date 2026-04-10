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
let PlagiarismDetectionService = class PlagiarismDetectionService {
    constructor() {
        this.submissionDatabase = new Map();
    }
    registerSubmission(submissionId, code, candidateId, interviewId) {
        this.submissionDatabase.set(submissionId, {
            code,
            candidateId,
            interviewId,
            timestamp: new Date()
        });
    }
    checkPlagiarism(submitCode, candidateId, interviewId) {
        const matches = [];
        let maxSimilarity = 0;
        this.submissionDatabase.forEach((submission, submissionId) => {
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
                        timestamp: submission.timestamp
                    });
                }
            }
        });
        const codeHash = this.generateCodeHash(submitCode);
        const riskLevel = this.calculateRiskLevel(maxSimilarity);
        const report = {
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
        return normalized.split(/\s+/).filter(t => t.length > 2);
    }
    cosineSimilarity(tokens1, tokens2) {
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
        if (norm1 === 0 || norm2 === 0)
            return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    getFrequencyMap(tokens) {
        const freq = new Map();
        tokens.forEach(token => {
            freq.set(token, (freq.get(token) || 0) + 1);
        });
        return freq;
    }
    findMatchingLines(code1, code2) {
        const lines1 = code1.split('\n');
        const lines2 = code2.split('\n');
        const matches = [];
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
        return matches.slice(0, 5);
    }
    generateCodeHash(code) {
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            const char = code.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
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
        return this.checkPlagiarism(submission.code, submission.candidateId, submission.interviewId);
    }
};
exports.PlagiarismDetectionService = PlagiarismDetectionService;
exports.PlagiarismDetectionService = PlagiarismDetectionService = __decorate([
    (0, common_1.Injectable)()
], PlagiarismDetectionService);
//# sourceMappingURL=plagiarism-detection.service.js.map