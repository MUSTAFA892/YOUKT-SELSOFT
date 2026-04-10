import { CustomTestCase } from '../submissions/submissions.service';
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
    difficulty: string;
    timeLimit: number;
    inputFormat: string;
    outputFormat: string;
    examples: any[];
    testCases: CustomTestCase[];
    starterCode?: CodeTemplates;
    wrapperCode?: CodeTemplates;
}
export interface QuestionPerformance {
    questionId: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    passed: boolean;
    timeMs: number;
}
export interface Interview {
    id: string;
    candidateId: string;
    candidateName: string;
    questions: Question[];
    history: QuestionPerformance[];
    completedCount: number;
    currentQuestionStartedAt: string | null;
    createdAt: string;
    isComplete: boolean;
}
import { ProblemsService } from '../problems/problems.service';
export declare class InterviewsService {
    private readonly problemsService;
    private readonly dbFilePath;
    private interviews;
    constructor(problemsService: ProblemsService);
    private loadFromDisk;
    private saveToDisk;
    createInterview(candidateId: string, candidateName: string, questions: Omit<Question, 'id'>[]): Promise<Interview>;
    getInterviewById(id: string): Promise<Interview>;
    getInterviewsByCandidate(candidateId: string): Promise<Interview[]>;
    getAllInterviews(): Promise<Interview[]>;
    processQuestionResult(interviewId: string, questionId: string, passed: boolean, timeMs: number): Promise<Interview>;
}
