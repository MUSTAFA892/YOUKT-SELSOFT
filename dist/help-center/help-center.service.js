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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCenterService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
let HelpCenterService = class HelpCenterService {
    constructor() {
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'help-center.json');
        this.conversations = [];
        this.loadFromDisk();
    }
    async loadFromDisk() {
        try {
            const data = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.conversations = JSON.parse(data);
        }
        catch (e) {
            this.conversations = [];
        }
    }
    async saveToDisk() {
        try {
            await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.conversations, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save help center database:', e);
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
            timestamp: new Date().toISOString()
        };
        conv.messages.push(newMessage);
        await this.saveToDisk();
        return newMessage;
    }
    async getAiResponse(query, questionContext) {
        const qLower = query.toLowerCase();
        if (qLower.includes('clarify') || qLower.includes('explain') || qLower.includes('understand')) {
            return `Sure! The problem "${questionContext.title}" requires you to ${questionContext.description.split('.')[0].toLowerCase()}. \n\nKey constraints to keep in mind:\n- Input Format: ${questionContext.inputFormat}\n- Output Format: ${questionContext.outputFormat}\n\nDoes that help clear things up?`;
        }
        if (qLower.includes('error') || qLower.includes('wrong') || qLower.includes('issue')) {
            return `I've analyzed the problem description and test cases for "${questionContext.title}". At the moment, the problem statements appear to be correct. If you believe there's a specific test case that is failing incorrectly, please describe it and I'll notify the recruiter.`;
        }
        if (qLower.includes('test') || qLower.includes('case')) {
            const examples = questionContext.examples || [];
            if (examples.length > 0) {
                return `Let's look at one of the test cases. In Example 1: \nInput: ${examples[0].input} \nExpected Output: ${examples[0].output} \n\n${examples[0].explanation || ''} \n\nTry testing your solution with this specific case!`;
            }
            return `Try walking through your code with a simple edge case, like empty input or very large values, to see if it behaves as expected.`;
        }
        return "TRANSFORM_TO_RECRUITER_MODE";
    }
    async getAllConversations() {
        await this.loadFromDisk();
        return this.conversations;
    }
};
exports.HelpCenterService = HelpCenterService;
exports.HelpCenterService = HelpCenterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HelpCenterService);
//# sourceMappingURL=help-center.service.js.map