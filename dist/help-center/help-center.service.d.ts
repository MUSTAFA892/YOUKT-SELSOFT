export interface HelpMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderType: 'candidate' | 'recruiter' | 'ai';
    content: string;
    timestamp: string;
    interviewId?: string;
}
export interface Conversation {
    candidateId: string;
    interviewId: string;
    messages: HelpMessage[];
    status: 'active' | 'archived';
}
export declare class HelpCenterService {
    private readonly dbFilePath;
    private conversations;
    constructor();
    private loadFromDisk;
    private saveToDisk;
    getConversation(candidateId: string, interviewId: string): Promise<Conversation>;
    addMessage(candidateId: string, interviewId: string, message: Omit<HelpMessage, 'id' | 'timestamp'>): Promise<HelpMessage>;
    getAiResponse(query: string, questionContext: any): Promise<string>;
    getAllConversations(): Promise<Conversation[]>;
}
