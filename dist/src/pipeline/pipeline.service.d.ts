export declare enum PipelineStage {
    APPLIED = "Applied",
    ASSESSED = "Assessed",
    INTERVIEWED = "Interviewed",
    OFFER = "Offer",
    REJECTED = "Rejected"
}
export interface PipelineEntry {
    candidateId: string;
    candidateName: string;
    stage: PipelineStage;
    recruiterId?: string;
    createdAt: string;
    updatedAt: string;
}
export declare class PipelineService {
    private readonly logger;
    private readonly dbFilePath;
    private data;
    constructor();
    private loadFromDisk;
    private autoSeedFromInterviews;
    private saveToDisk;
    getAll(): Promise<PipelineEntry[]>;
    getByCandidateId(candidateId: string): Promise<PipelineEntry | null>;
    updateStage(candidateId: string, stage: PipelineStage, candidateName?: string): Promise<PipelineEntry>;
    bulkUpdateStage(candidateIds: string[], stage: PipelineStage): Promise<PipelineEntry[]>;
    bulkSendEmail(candidateIds: string[], subject: string, body: string): Promise<void>;
    private triggerEmailAutomation;
    seedInitialData(candidates: {
        id: string;
        name: string;
    }[]): Promise<void>;
}
