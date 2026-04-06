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
export declare class InterviewsService {
    private readonly dbFilePath;
    private interviews;
    constructor();
    private loadFromDisk;
    private saveToDisk;
    createInterview(candidateId: string, candidateName: string, questions: Omit<Question, 'id'>[]): Promise<Interview>;
    getInterviewById(id: string): Promise<Interview>;
    getInterviewsByCandidate(candidateId: string): Promise<Interview[]>;
}
