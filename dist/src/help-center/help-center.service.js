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
        const title = questionContext.title || 'the current problem';
        if (qLower.includes('clarify') || qLower.includes('explain') || qLower.includes('understand') || qLower.includes('logic')) {
            const summary = questionContext.description ?
                this.simplifyDescription(questionContext.description) :
                "evaluate the constraints and produce the required results.";
            const inputInfo = questionContext.inputFormat ? `\n- **Input**: ${questionContext.inputFormat}` : "";
            const outputInfo = questionContext.outputFormat ? `\n- **Output**: ${questionContext.outputFormat}` : "";
            const complexity = (questionContext.expectedTimeComplexity || questionContext.expectedSpaceComplexity) ?
                `\n- **Target Complexity**: ${questionContext.expectedTimeComplexity || 'O(n)'}` : "";
            return `Of course! Let's break down **${title}**. 

The goal here is to ${summary}

### Key Precise Details:
${inputInfo}${outputInfo}${complexity}

### Core Strategy:
Try thinking about how you would solve this manually with pen and paper first. For example, if you see a similar pattern, could a ${this.getSuggestedPattern(questionContext)} be useful here?

Does this focus help you structure your code?`;
        }
        if (qLower.includes('error') || qLower.includes('wrong') || qLower.includes('issue') || qLower.includes('bug')) {
            return `I've performed a quick audit of the specifications for **${title}**. 

The test cases and expected outputs are consistent with standard algorithmic patterns. If your code is failing, I recommend checking these common pitfalls:
1. **Edge Cases**: Have you handled empty, null, or unusually large inputs?
2. **Types**: Ensure your return type matches the expected output exactly (${questionContext.outputFormat || 'check requirements'}).
3. **Loop Boundaries**: Double-check for off-by-one errors in your iterations.

If you describe your specific error message, I can provide more targeted advice!`;
        }
        if (qLower.includes('test') || qLower.includes('case') || qLower.includes('example')) {
            const examples = questionContext.examples || [];
            if (examples.length > 0) {
                const ex = examples[0];
                return `Let's analyze **Example 1** to clarify the logic:
- **Given Input**: \`${ex.input}\`
- **Why Expected Output is**: \`${ex.output}\`
- **Reasoning**: ${ex.explanation || 'Following the problem constraints, this input must be transformed to match the output rule.'}

I suggest printing internal variables for this specific input to see where your logic might be diverging!`;
            }
            return `I recommend creating a simple test case for yourself:
- **Input**: Use the simplest possible valid value.
- **Expected**: Manually calculate the result.
Does your code return that value correctly?`;
        }
        if (qLower.includes('hint') || qLower.includes('help') || qLower.includes('clue')) {
            const hints = questionContext.hints || [];
            if (hints.length > 0) {
                return `Here is a precise hint for **${title}**:
> ${hints[0]}

If you'd like another hint or a more direct clue about the algorithm, just let me know!`;
            }
            return `Think about the most efficient way to store and retrieve the data you've already seen. Would a Hash Map or a simple Array suffice?`;
        }
        if (qLower.length < 5) {
            return "Hi there! I'm your AI technical assistant. I can explain problem logic, clarify test cases, or give you hints. How can I assist you with the current task?";
        }
        return "TRANSFORM_TO_RECRUITER_MODE";
    }
    simplifyDescription(desc) {
        const plain = desc.replace(/<[^>]*>?/gm, '').split('.')[0];
        return plain.charAt(0).toLowerCase() + plain.slice(1);
    }
    getSuggestedPattern(context) {
        const desc = (context.description || '').toLowerCase();
        if (desc.includes('search') || desc.includes('find'))
            return "Hash Map (Dictionary)";
        if (desc.includes('sort') || desc.includes('order'))
            return "Two-pointer approach";
        if (desc.includes('sum') || desc.includes('total'))
            return "Accumulator pattern";
        return "Sliding Window or Iterative approach";
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