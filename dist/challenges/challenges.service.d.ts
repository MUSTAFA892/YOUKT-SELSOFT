import { CustomTestCase } from '../submissions/submissions.service';
export interface CodeTemplates {
    python?: string;
    javascript?: string;
    java?: string;
    c?: string;
}
export interface Challenge {
    id: string;
    title: string;
    description: string;
    testCases: CustomTestCase[];
    starterCode?: CodeTemplates;
    wrapperCode?: CodeTemplates;
}
export declare class ChallengesService {
    private readonly dbFilePath;
    private challenges;
    constructor();
    private loadFromDisk;
    private saveToDisk;
    createChallenge(title: string, description: string, testCases: CustomTestCase[], starterCode?: CodeTemplates, wrapperCode?: CodeTemplates): Promise<Challenge>;
    getChallengeById(id: string): Promise<Challenge>;
}
