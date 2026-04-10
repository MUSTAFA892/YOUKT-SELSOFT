import { ProblemsService } from './problems.service';
import { ProblemSessionService } from './problem-session.service';
export declare class ProblemsController {
    private readonly problemsService;
    private readonly sessionService;
    constructor(problemsService: ProblemsService, sessionService: ProblemSessionService);
    findAll(): Omit<import("./problems.service").Problem, "testCases" | "wrapperCode">[];
    findOne(id: string, candidateId?: string): Omit<import("./problems.service").Problem, "testCases" | "wrapperCode"> | {
        examples: import("./problems.service").Example[];
        testCasesPreview: import("./problems.service").TestCase[];
        sessionId: string;
        _note: string;
        id: string;
        title: string;
        difficulty: "Easy" | "Medium" | "Hard";
        timeLimit: number;
        description: string;
        inputFormat: string;
        outputFormat: string;
        starterCode: {
            python: string;
            javascript: string;
            java: string;
            c: string;
        };
        expectedTimeComplexity?: string;
        expectedSpaceComplexity?: string;
        hints?: string[];
        topics?: string[];
    };
    getNextProblem(id: string, performanceMetrics: {
        allPassed: boolean;
        passed: number;
        totalTests: number;
        timeSpentSeconds: number;
        forceEasier?: boolean;
    }): Omit<import("./problems.service").Problem, "testCases" | "wrapperCode">;
}
