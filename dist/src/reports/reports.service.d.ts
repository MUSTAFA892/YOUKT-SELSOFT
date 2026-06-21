import { InterviewsService } from '../interviews/interviews.service';
export interface PlagiarismWarning {
    detected: boolean;
    similarityPercent: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    matchCount?: number;
}
export interface QuestionReport {
    questionId: string;
    questionTitle: string;
    totalTests: number;
    passed: number;
    failed: number;
    allPassed: boolean;
    language: string;
    submittedCode?: string;
    plagiarismWarning?: PlagiarismWarning;
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
    plagiarismWarning?: PlagiarismWarning;
}
export declare class ReportsService {
    private readonly interviewsService;
    private readonly dbFilePath;
    private reports;
    constructor(interviewsService: InterviewsService);
    private loadFromDisk;
    private saveToDisk;
    createReport(dto: Omit<AssessmentReport, 'id' | 'finishedAt'>): Promise<AssessmentReport>;
    getAllReports(): Promise<AssessmentReport[]>;
    getReportsByInterview(interviewId: string): Promise<AssessmentReport[]>;
}
