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
    difficulty: "Easy" | "Medium" | "Hard";
    examples: Example[];
    starterCode: {
        python: string;
        javascript: string;
        java: string;
        c: string;
    };
}
export interface TestResult {
    testCase: number;
    description: string;
    status: "pass" | "fail" | "error" | "timeout";
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
export declare function fetchProblems(): Promise<Problem[]>;
export declare function fetchProblem(id: string): Promise<Problem>;
export declare function submitCode(problemId: string, language: string, code: string): Promise<SubmissionResult>;
export interface CustomTestCase {
    input: string;
    expectedOutput: string;
}
export declare function submitCustomCode(language: string, code: string, testCases: CustomTestCase[]): Promise<SubmissionResult>;
export interface CodeTemplates {
    python?: string;
    javascript?: string;
    java?: string;
    c?: string;
}
export interface Question {
    id: string;
    title: string;
    description: string;
    testCases: CustomTestCase[];
    starterCode?: CodeTemplates;
    wrapperCode?: CodeTemplates;
}
export interface Interview {
    id: string;
    candidateId: string;
    candidateName: string;
    questions: Question[];
    createdAt: string;
}
export declare function createInterview(candidateId: string, candidateName: string, questions: Omit<Question, 'id'>[]): Promise<Interview>;
export declare function getInterview(id: string): Promise<Interview>;
export declare function getCandidateInterviews(candidateId: string): Promise<Interview[]>;
export declare function submitInterviewCode(interviewId: string, questionId: string, language: string, code: string): Promise<SubmissionResult>;
