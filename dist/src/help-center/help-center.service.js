"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HelpCenterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCenterService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
const HINT_LEAK_PATTERNS = [
    /you (should|can|need to|must) use (a |an )?(hash ?map|dictionary|set|stack|queue|two.pointer|sliding window|dynamic programming|recursion|bfs|dfs|binary search)/i,
    /time complexity (is|would be|of) O\(/i,
    /space complexity (is|would be|of) O\(/i,
    /step \d+:/i,
];
const CODE_PATTERNS = [
    /```/,
    /def [a-z_]+\(/i,
    /function [a-z_]+\(/i,
    /for\s*\(.*;\s*.*;\s*.*\)/,
];
let HelpCenterService = HelpCenterService_1 = class HelpCenterService {
    constructor() {
        this.logger = new common_1.Logger(HelpCenterService_1.name);
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'help-center.json');
        this.conversations = [];
        this.activeCandidates = new Map();
        this.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        this.loadFromDisk();
        this.logGeminiStatus();
    }
    logGeminiStatus() {
        if (this.GEMINI_API_KEY) {
            this.logger.log(`✨ Google Gemini API is configured. Ready for Help Center.`);
        }
        else {
            this.logger.warn(`⚠️  GEMINI_API_KEY is not set in .env. Help Center AI calls will fail.`);
        }
    }
    async loadFromDisk() {
        try {
            const data = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.conversations = JSON.parse(data);
        }
        catch {
            this.conversations = [];
        }
    }
    async saveToDisk() {
        try {
            await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.conversations, null, 2), 'utf-8');
        }
        catch (e) {
            this.logger.error('Failed to save help center database:', e);
        }
    }
    async getConversation(candidateId, interviewId) {
        await this.loadFromDisk();
        let conv = this.conversations.find(c => c.candidateId === candidateId && c.interviewId === interviewId);
        if (!conv) {
            conv = { candidateId, interviewId, messages: [], status: 'active' };
            this.conversations.push(conv);
            await this.saveToDisk();
        }
        return conv;
    }
    async addMessage(candidateId, interviewId, message) {
        await this.loadFromDisk();
        let conv = this.conversations.find(c => c.candidateId === candidateId && c.interviewId === interviewId);
        if (!conv) {
            conv = { candidateId, interviewId, messages: [], status: 'active' };
            this.conversations.push(conv);
        }
        const newMessage = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };
        conv.messages.push(newMessage);
        await this.saveToDisk();
        return newMessage;
    }
    isGreeting(query) {
        return /^(hi|hello|hey|howdy|yo|sup|good\s*(morning|afternoon|evening)|what'?s up)[!.,?]?\s*$/i.test(query.trim());
    }
    isSafeReply(reply) {
        for (const pattern of CODE_PATTERNS) {
            if (pattern.test(reply))
                return false;
        }
        for (const pattern of HINT_LEAK_PATTERNS) {
            if (pattern.test(reply))
                return false;
        }
        return true;
    }
    async getAiResponse(query, candidateName, questionContext) {
        const firstName = (candidateName || 'there').split(' ')[0];
        if (this.isGreeting(query)) {
            const greetings = [
                `Hi ${firstName}! 👋 I'm YOUKT AI, your assessment assistant. I can help clarify the problem statement, explain constraints, or answer questions about the input/output format. What would you like to know?`,
                `Hey ${firstName}! 😊 Great to see you here. Feel free to ask me anything about the problem — I'm here to help you understand it better, not solve it for you!`,
                `Hello ${firstName}! 🤖 I'm here to help you understand the problem. Ask me about the requirements, examples, or edge cases and I'll do my best to clarify!`,
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        const BLOCKED_PHRASES = [
            'give me the answer',
            'write the code',
            'write a function',
            'solve this for me',
            'solve it for me',
            'what is the solution',
            'what is the answer',
            'code for this',
            'code for the problem',
            'implementation',
            'implement this',
            'show me how to solve',
        ];
        const qLower = query.toLowerCase();
        if (BLOCKED_PHRASES.some(p => qLower.includes(p))) {
            return `I totally understand the urge, ${firstName}, but I'm not able to share answers or code — that would defeat the purpose of the assessment! 😄 I can help clarify what the problem is asking, explain what inputs look like, or help you understand the expected output format. What would you like to know?`;
        }
        const problemSection = questionContext
            ? `[CURRENT PROBLEM THE CANDIDATE IS WORKING ON]
Title: ${questionContext.title || 'Unknown'}
Difficulty: ${questionContext.difficulty || 'Unknown'}
Description: ${questionContext.description || '(no description)'}
Input format: ${questionContext.inputFormat || 'See examples'}
Output format: ${questionContext.outputFormat || 'See examples'}`
            : '[No problem context available — answer general coding questions only.]';
        const SYSTEM_PROMPT = `You are a friendly interview assistant chatbot integrated into a coding IDE.
${problemSection}

🎯 CORE PRINCIPLES:
1. MAINTAIN INTEGRITY: NEVER provide code, algorithms, logic, or hints. NEVER solve the problem.
2. ADAPT TO THE USER: The user might ask for a brief summary, a deep conceptual explanation, or an explanation for a 5-year-old. Adapt your tone and depth strictly based on how the user asks. If they don't specify, provide a clear, standard explanation.
3. CONTEXT AWARE: You know exactly what problem they are working on (see above). When they ask "clarify this question", "explain the problem", or refer to "this", they mean the CURRENT PROBLEM above. Explain it to them based on their request.

📋 GUIDELINES FOR CLARIFYING THE QUESTION:
- If they ask for a brief explanation, keep it very short and simple.
- If they ask for a deep explanation, explain the concepts, edge cases, and what the input/output means conceptually.
- ALWAYS use the candidate's first name (${firstName}).
- NEVER give away the answer or suggest data structures (e.g., don't say "use a hash map" or "use a loop").

🚨 GUIDELINES FOR UNSOLVABLE ISSUES & ERRORS:
If the user reports an issue you CANNOT solve (e.g., website crash, hardware issue, network problem, platform bugs, or an error in the question itself):
1. Acknowledge the issue clearly.
2. If the user asks to "Find errors in questions": You MUST strictly analyze the CURRENT PROBLEM first.
   - IF NO ERRORS EXIST: Tell ${firstName} directly that there are no errors in the problem, and then YOU must explain the problem to them clearly so they understand what is being asked. Do not refer to yourself or the candidate in the third person. Do not tell them to switch to human mode.
   - IF AN ACTUAL ERROR EXISTS (e.g., impossible constraints, contradictory examples): You must explicitly tell ${firstName} to "switch to human mode" and contact the recruiter to report the error.
3. For any other technical crash, network problem, or hardware issue: Instruct the user to "switch to human mode" to get help from the recruiter.`;
        const userPrompt = `${firstName} asks: "${query}"

Remember: Only clarify the problem. No hints, no algorithms, no code.`;
        try {
            if (!this.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is not configured');
            }
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: userPrompt }]
                        }
                    ],
                    systemInstruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    },
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 250
                    }
                })
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                this.logger.error(`Gemini HTTP ${response.status}: ${errorBody}`);
                throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
            }
            const data = await response.json();
            const reply = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
            if (!reply)
                throw new Error('Empty response from Gemini');
            if (!this.isSafeReply(reply)) {
                this.logger.warn(`🚨 Safety filter blocked a hint-leaking reply for "${query.substring(0, 60)}". Blocked Reply: ${reply}`);
                return `That's a great question, ${firstName}! However, answering it directly might give away too much about the solution. Try re-reading the problem description — it usually contains all the information you need to understand the expected input and output. Is there a specific part of the problem statement that's confusing? 😊`;
            }
            this.logger.log(`✨ Gemini replied (${reply.length} chars) to "${query.substring(0, 50)}"`);
            return reply;
        }
        catch (err) {
            const msg = err?.message || '';
            this.logger.error(`Gemini request failed: ${msg}`);
            if (msg.includes('abort') || msg.includes('Abort')) {
                return `Sorry ${firstName}, the request to AI timed out. Please wait a moment and try again! ⏳`;
            }
            if (msg.includes('GEMINI_API_KEY')) {
                return 'Google Gemini API is not configured. Please add GEMINI_API_KEY to your .env file.';
            }
            return `Something went wrong on my end, ${firstName}. Please try again in a moment! 🙏`;
        }
    }
    async getAllConversations() {
        await this.loadFromDisk();
        return this.conversations;
    }
    async pingCandidate(candidateId) {
        this.activeCandidates.set(candidateId, Date.now());
    }
    isCandidateActive(candidateId) {
        const lastPing = this.activeCandidates.get(candidateId);
        if (!lastPing)
            return false;
        return (Date.now() - lastPing) < 15000;
    }
    getActiveCandidateIds() {
        const active = [];
        const now = Date.now();
        for (const [candidateId, lastPing] of this.activeCandidates.entries()) {
            if (now - lastPing < 15000) {
                active.push(candidateId);
            }
        }
        return active;
    }
};
exports.HelpCenterService = HelpCenterService;
exports.HelpCenterService = HelpCenterService = HelpCenterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HelpCenterService);
//# sourceMappingURL=help-center.service.js.map