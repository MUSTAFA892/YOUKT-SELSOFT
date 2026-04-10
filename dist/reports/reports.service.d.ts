export interface QuestionReport {
    questionId: string;
    questionTitle: string;
    totalTests: number;
    passed: number;
    failed: number;
    allPassed: boolean;
    language: string;
    submittedCode?: string;
}
export interface AssessmentReport {
    id: string;
    interviewId: string;
    candidateId: string;
    candidateName: string;
    finishedAt: string;
    totalQuestions: number;
    questionsAttempted: number;
    totalTestsPassed: number;
    totalTestsAvailable: number;
    scorePercent: number;
    questions: QuestionReport[];
    violations?: {
        tabSwitches: number;
        terminated: boolean;
    };
}
export declare class ReportsService {
    private readonly dbFilePath;
    private reports;
    constructor();
    private loadFromDisk;
    private saveToDisk;
    createReport(dto: Omit<AssessmentReport, 'id' | 'finishedAt'>): Promise<AssessmentReport>;
    getAllReports(): Promise<AssessmentReport[]>;
    getReportsByInterview(interviewId: string): Promise<AssessmentReport[]>;
}
