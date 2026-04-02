import { SubmissionsService, SubmissionDto } from './submissions.service';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(dto: SubmissionDto): Promise<import("./submissions.service").SubmissionResult>;
}
