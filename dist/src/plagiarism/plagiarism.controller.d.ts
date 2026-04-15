import { PlagiarismDetectionService } from './plagiarism-detection.service';
interface CheckPlagiarismDto {
    code: string;
    candidateId: string;
    interviewId: string;
    problemId: string;
    submissionId?: string;
    submissionTimeMs?: number;
    pasteDetected?: boolean;
}
export declare class PlagiarismController {
    private readonly plagiarismService;
    constructor(plagiarismService: PlagiarismDetectionService);
    check(dto: CheckPlagiarismDto): {
        success: boolean;
        data: import("./plagiarism-detection.service").PlagiarismReport;
    };
}
export {};
