import { TestCase } from './problems.service';
export interface ProblemSession {
    id: string;
    problemId: string;
    candidateId: string;
    startedAt: Date;
    seed: number;
    visibleTestCases: TestCase[];
    hiddenTestCases: TestCase[];
    allTestCases: TestCase[];
}
export declare class ProblemSessionService {
    private sessions;
    createSession(problemId: string, candidateId: string, generatorType: any): ProblemSession;
    getOrCreateSession(problemId: string, candidateId: string, generatorType: any, sessionId?: string): ProblemSession;
    getValidationTestCases(sessionId: string): TestCase[];
    getVisibleTestCases(sessionId: string): TestCase[];
    cleanupOldSessions(): void;
    private generateSeed;
}
