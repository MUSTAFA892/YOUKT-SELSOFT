import { ChallengesService, CodeTemplates } from './challenges.service';
import { CustomTestCase } from '../submissions/submissions.service';
interface CreateChallengeDto {
    title: string;
    description: string;
    testCases: CustomTestCase[];
    starterCode?: CodeTemplates;
    wrapperCode?: CodeTemplates;
}
export declare class ChallengesController {
    private readonly challengesService;
    constructor(challengesService: ChallengesService);
    create(dto: CreateChallengeDto): Promise<import("./challenges.service").Challenge>;
    getOne(id: string): Promise<import("./challenges.service").Challenge>;
}
export {};
