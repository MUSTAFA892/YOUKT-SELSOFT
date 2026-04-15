import { ReportsService, AssessmentReport, QuestionReport, PlagiarismWarning } from './reports.service';
interface CreateReportDto {
    interviewId: string;
    candidateId: string;
    candidateName: string;
    totalQuestions: number;
    questionsAttempted: number;
    totalTestsPassed: number;
    totalTestsAvailable: number;
    scorePercent: number;
    questions: QuestionReport[];
    plagiarismWarning?: PlagiarismWarning;
}
import { CandidateAnalysisService } from './candidate-analysis.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly analysisService;
    constructor(reportsService: ReportsService, analysisService: CandidateAnalysisService);
    create(dto: CreateReportDto): Promise<AssessmentReport>;
    getAll(): Promise<AssessmentReport[]>;
    getByInterview(interviewId: string): Promise<AssessmentReport[]>;
    getCandidateInsights(id: string): Promise<import("./candidate-analysis.service").CandidateInsights>;
}
export {};
