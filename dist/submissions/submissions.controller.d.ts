import { SubmissionsService, SubmissionDto, CustomSubmissionDto, ChallengeSubmissionDto } from './submissions.service';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(dto: SubmissionDto): Promise<import("./submissions.service").SubmissionResult>;
    createCustom(dto: CustomSubmissionDto): Promise<import("./submissions.service").SubmissionResult>;
    createChallenge(dto: ChallengeSubmissionDto): Promise<import("./submissions.service").SubmissionResult>;
}
