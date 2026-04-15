export interface ActivityLog {
    id: string;
    candidateId: string;
    candidateName: string;
    problemId: string;
    problemTitle: string;
    language: string;
    passed: number;
    totalTests: number;
    allPassed: boolean;
    timeSpentSeconds: number;
    submittedAt: string;
}
export declare class ActivityLogsService {
    private readonly dbFilePath;
    private logs;
    constructor();
    private loadFromDisk;
    private saveToDisk;
    createOrUpdateLog(dto: Omit<ActivityLog, 'id' | 'submittedAt'>): Promise<ActivityLog>;
    getAllLogs(): Promise<ActivityLog[]>;
    getLogsByCandidate(candidateId: string): Promise<ActivityLog[]>;
}
