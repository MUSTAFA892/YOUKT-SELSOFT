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
    private readonly logger;
    private readonly dbFilePath;
    private conversations;
    private activeCandidates;
    private readonly GEMINI_API_KEY;
    constructor();
    private logGeminiStatus;
    private loadFromDisk;
    private saveToDisk;
    getConversation(candidateId: string, interviewId: string): Promise<Conversation>;
    addMessage(candidateId: string, interviewId: string, message: Omit<HelpMessage, 'id' | 'timestamp'>): Promise<HelpMessage>;
    private isGreeting;
    private isSafeReply;
    getAiResponse(query: string, candidateName: string, questionContext?: any): Promise<string>;
    getAllConversations(): Promise<Conversation[]>;
    pingCandidate(candidateId: string): Promise<void>;
    isCandidateActive(candidateId: string): boolean;
    getActiveCandidateIds(): string[];
}
