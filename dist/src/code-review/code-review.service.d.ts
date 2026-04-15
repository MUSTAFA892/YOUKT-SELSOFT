export interface CodeReviewResult {
    overallScore: number;
    qualityRating: 'excellent' | 'good' | 'fair' | 'poor';
    complexity: {
        score: number;
        feedback: string;
    };
    readability: {
        score: number;
        feedback: string;
    };
    efficiency: {
        score: number;
        feedback: string;
        timeComplexity?: string;
        spaceComplexity?: string;
    };
    bestPractices: {
        score: number;
        feedback: string;
        violations: string[];
    };
    security: {
        score: number;
        issues: string[];
    };
    suggestions: string[];
    timestamp: Date;
}
export declare class CodeReviewService {
    analyzeCode(code: string, language: string): CodeReviewResult;
    private analyzeComplexity;
    private analyzeReadability;
    private analyzeEfficiency;
    private analyzeBestPractices;
    private analyzeSecurityIssues;
    private countMaxNestingLevels;
    private extractFunctions;
    private findUnusedVariables;
    private findDuplicatePatterns;
}
