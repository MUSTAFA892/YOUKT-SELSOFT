import { HelpCenterService, HelpMessage } from './help-center.service';
export declare class HelpCenterController {
    private readonly helpCenterService;
    constructor(helpCenterService: HelpCenterService);
    getConversation(candidateId: string, interviewId: string): Promise<import("./help-center.service").Conversation>;
    sendMessage(body: {
        candidateId: string;
        interviewId: string;
        message: Omit<HelpMessage, 'id' | 'timestamp'>;
    }): Promise<HelpMessage>;
    getAiAssist(body: {
        query: string;
        questionContext: any;
        candidateId: string;
        interviewId: string;
        candidateName: string;
    }): Promise<{
        status: string;
        data?: undefined;
    } | {
        status: string;
        data: HelpMessage;
    }>;
    getAllConversations(): Promise<import("./help-center.service").Conversation[]>;
}
