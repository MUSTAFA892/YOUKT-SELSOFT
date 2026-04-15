import { ActivityLogsService, ActivityLog } from './activity-logs.service';
export declare class ActivityLogsController {
    private readonly activityLogsService;
    constructor(activityLogsService: ActivityLogsService);
    createOrUpdate(dto: Omit<ActivityLog, 'id' | 'submittedAt'>): Promise<ActivityLog>;
    getAll(): Promise<ActivityLog[]>;
    getByCandidate(id: string): Promise<ActivityLog[]>;
}
