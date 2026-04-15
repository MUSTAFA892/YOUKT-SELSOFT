export interface TestCase {
    input: string;
    expectedOutput: string;
    description: string;
}
export interface Example {
    input: string;
    output: string;
    explanation?: string;
}
export interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeLimit: number;
    description: string;
    inputFormat: string;
    outputFormat: string;
    examples: Example[];
    testCases: TestCase[];
    starterCode: {
        python: string;
        javascript: string;
        java: string;
        c: string;
    };
    wrapperCode: {
        python: string;
        javascript: string;
        java: string;
        c: string;
    };
    expectedTimeComplexity?: string;
    expectedSpaceComplexity?: string;
    hints?: string[];
    topics?: string[];
}
export declare class ProblemsService {
    private readonly problems;
    findAll(): Omit<Problem, 'testCases' | 'wrapperCode'>[];
    findAllWithTestCases(): Problem[];
    findOne(id: string): Omit<Problem, 'testCases' | 'wrapperCode'>;
    findOneWithTestCases(id: string): Problem;
    getNextProblem(currentProblemId: string, performanceMetrics: {
        allPassed: boolean;
        passed: number;
        totalTests: number;
        timeSpentSeconds: number;
        forceEasier?: boolean;
    }): Omit<Problem, 'testCases' | 'wrapperCode'>;
}
