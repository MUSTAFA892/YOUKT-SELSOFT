export interface PlagiarismMatch {
    candidateId: string;
    candidateName: string;
    interviewId: string;
    similarity: number;
    matchedLines: Array<{
        lineNumber: number;
        content: string;
    }>;
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
export declare class PlagiarismDetectionService {
    private submissionDatabase;
    registerSubmission(submissionId: string, code: string, candidateId: string, interviewId: string, problemId: string): void;
    checkPlagiarism(submitCode: string, candidateId: string, interviewId: string, problemId: string, submissionId?: string, submissionTimeMs?: number, pasteDetected?: boolean): PlagiarismReport;
    private detectAiRisk;
    private normalizeForSignature;
    private calculateSimilarity;
    private tokenizeCode;
    private cosineSimilarity;
    private getFrequencyMap;
    private findMatchingLines;
    private generateCodeHash;
    private calculateRiskLevel;
    getSubmissionReport(submissionId: string): PlagiarismReport | null;
}
