import { InterviewsService, Question } from './interviews.service';
interface CreateInterviewDto {
    candidateId: string;
    candidateName: string;
    questions: Omit<Question, 'id'>[];
    recruiterId?: string;
    recruiterName?: string;
}
interface NextQuestionDto {
    questionId: string;
    passed: boolean;
    timeMs: number;
}
export declare class InterviewsController {
    private readonly interviewsService;
    constructor(interviewsService: InterviewsService);
    create(dto: CreateInterviewDto): Promise<import("./interviews.service").Interview>;
    getAll(): Promise<import("./interviews.service").Interview[]>;
    getByCandidate(candidateId: string): Promise<import("./interviews.service").Interview[]>;
    getOne(id: string): Promise<import("./interviews.service").Interview>;
    getNextQuestion(id: string, dto: NextQuestionDto): Promise<import("./interviews.service").Interview>;
    generateTemplates(dto: {
        title: string;
        description: string;
        inputFormat: string;
        outputFormat: string;
    }): Promise<{
        starterCode: import("./interviews.service").CodeTemplates;
        wrapperCode: import("./interviews.service").CodeTemplates;
    }>;
}
export {};
