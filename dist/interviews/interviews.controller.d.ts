import { InterviewsService, Question } from './interviews.service';
interface CreateInterviewDto {
    candidateId: string;
    candidateName: string;
    questions: Omit<Question, 'id'>[];
}
export declare class InterviewsController {
    private readonly interviewsService;
    constructor(interviewsService: InterviewsService);
    create(dto: CreateInterviewDto): Promise<import("./interviews.service").Interview>;
    getByCandidate(candidateId: string): Promise<import("./interviews.service").Interview[]>;
    getOne(id: string): Promise<import("./interviews.service").Interview>;
}
export {};
