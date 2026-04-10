export interface TabSwitchIncident {
    id: string;
    candidateId: string;
    candidateName: string;
    problemId: string;
    problemTitle: string;
    switchCount: number;
    maxAllowed: number;
    status: 'warning' | 'terminated';
    details: {
        firstSwitchAt: string;
        lastSwitchAt: string;
        totalSwitches: number;
    };
    recordedAt: string;
}
export declare class TabSwitchService {
    private readonly dbFilePath;
    private incidents;
    constructor();
    private loadFromDisk;
    private saveToDisk;
    reportTabSwitch(dto: {
        candidateId: string;
        candidateName: string;
        problemId: string;
        problemTitle: string;
        switchCount: number;
    }): Promise<TabSwitchIncident>;
    getAllIncidents(): Promise<TabSwitchIncident[]>;
    getIncidentsByCandidate(candidateId: string): Promise<TabSwitchIncident[]>;
    getIncidentsByProblem(problemId: string): Promise<TabSwitchIncident[]>;
    getTerminatedSessions(): Promise<TabSwitchIncident[]>;
}
