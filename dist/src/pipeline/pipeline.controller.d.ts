import { PipelineService } from './pipeline.service';
import { PipelineStage } from './pipeline.service';
export declare class PipelineController {
    private readonly pipelineService;
    constructor(pipelineService: PipelineService);
    getAll(): Promise<import("./pipeline.service").PipelineEntry[]>;
    updateStage(candidateId: string, stage: PipelineStage): Promise<import("./pipeline.service").PipelineEntry>;
    bulkUpdateStage(candidateIds: string[], stage: PipelineStage): Promise<import("./pipeline.service").PipelineEntry[]>;
    bulkSendEmail(candidateIds: string[], subject: string, body: string): Promise<{
        success: boolean;
    }>;
}
