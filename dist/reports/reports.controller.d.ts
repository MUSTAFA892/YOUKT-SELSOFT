import { ReportsService, AssessmentReport, QuestionReport } from './reports.service';
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
}
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(dto: CreateReportDto): Promise<AssessmentReport>;
    getAll(): Promise<AssessmentReport[]>;
    getByInterview(interviewId: string): Promise<AssessmentReport[]>;
}
export {};
