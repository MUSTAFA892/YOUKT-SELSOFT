import { TabSwitchService, TabSwitchIncident } from './tab-switch.service';
export declare class TabSwitchController {
    private readonly tabSwitchService;
    constructor(tabSwitchService: TabSwitchService);
    reportTabSwitch(dto: {
        candidateId: string;
        candidateName: string;
        problemId: string;
        problemTitle: string;
        switchCount: number;
    }): Promise<TabSwitchIncident>;
    getAllIncidents(): Promise<TabSwitchIncident[]>;
    getByCandidate(id: string): Promise<TabSwitchIncident[]>;
    getByProblem(id: string): Promise<TabSwitchIncident[]>;
    getTerminatedSessions(): Promise<TabSwitchIncident[]>;
}
