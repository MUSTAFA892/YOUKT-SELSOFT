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
    description: string;
    inputFormat: string;
    outputFormat: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
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
}
export declare class ProblemsService {
    private readonly problems;
    findAll(): Omit<Problem, 'testCases' | 'wrapperCode'>[];
    findOne(id: string): Omit<Problem, 'testCases' | 'wrapperCode'>;
    findOneWithTestCases(id: string): Problem;
}
