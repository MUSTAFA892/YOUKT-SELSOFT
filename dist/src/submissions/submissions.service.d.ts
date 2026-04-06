import { ProblemsService } from '../problems/problems.service';
import { ChallengesService } from '../challenges/challenges.service';
import { InterviewsService } from '../interviews/interviews.service';
export type SupportedLanguage = 'python' | 'javascript' | 'java' | 'c';
export interface SubmissionDto {
    problemId: string;
    language: SupportedLanguage;
    code: string;
}
export interface CustomTestCase {
    input: string;
    expectedOutput: string;
}
export interface CustomSubmissionDto {
    language: SupportedLanguage;
    code: string;
    testCases: CustomTestCase[];
}
export interface ChallengeSubmissionDto {
    challengeId: string;
    language: SupportedLanguage;
    code: string;
}
export interface InterviewSubmissionDto {
    interviewId: string;
    questionId: string;
    language: SupportedLanguage;
    code: string;
}
export interface TestResult {
    testCase: number;
    description: string;
    status: 'pass' | 'fail' | 'error' | 'timeout';
    input: string;
    expectedOutput: string;
    actualOutput: string;
    errorMessage?: string;
}
export interface SubmissionResult {
    problemId: string;
    language: string;
    totalTests: number;
    passed: number;
    failed: number;
    results: TestResult[];
    allPassed: boolean;
}
export declare class SubmissionsService {
    private readonly problemsService;
    private readonly challengesService;
    private readonly interviewsService;
    constructor(problemsService: ProblemsService, challengesService: ChallengesService, interviewsService: InterviewsService);
    runSubmission(dto: SubmissionDto): Promise<SubmissionResult>;
    runCustomSubmission(dto: CustomSubmissionDto): Promise<SubmissionResult>;
    runChallengeSubmission(dto: ChallengeSubmissionDto): Promise<SubmissionResult>;
    runInterviewSubmission(dto: InterviewSubmissionDto): Promise<SubmissionResult>;
    private executeLocally;
    private executeRawLocally;
    private compareOutput;
    private handleExecError;
    private safeDelete;
    private normalize;
    private createResult;
}
