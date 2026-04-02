import { ProblemsService } from '../problems/problems.service';
export interface SubmissionDto {
    problemId: string;
    language: 'python' | 'javascript';
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
    constructor(problemsService: ProblemsService);
    runSubmission(dto: SubmissionDto): Promise<SubmissionResult>;
    private executeCode;
    private normalize;
    private createResult;
    private sleep;
}
