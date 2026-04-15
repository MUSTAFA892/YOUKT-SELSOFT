import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

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

@Injectable()
export class HelpCenterService {
  private readonly dbFilePath = join(process.cwd(), 'help-center.json');
  private conversations: Conversation[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const data = await fs.readFile(this.dbFilePath, 'utf-8');
      this.conversations = JSON.parse(data);
    } catch (e) {
      this.conversations = [];
    }
  }

  private async saveToDisk() {
    try {
      await fs.writeFile(this.dbFilePath, JSON.stringify(this.conversations, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save help center database:', e);
    }
  }

  async getConversation(candidateId: string, interviewId: string): Promise<Conversation> {
    await this.loadFromDisk();
    let conv = this.conversations.find(c => c.candidateId === candidateId && c.interviewId === interviewId);
    if (!conv) {
      conv = { candidateId, interviewId, messages: [], status: 'active' };
      this.conversations.push(conv);
      await this.saveToDisk();
    }
    return conv;
  }

  async addMessage(
    candidateId: string,
    interviewId: string,
    message: Omit<HelpMessage, 'id' | 'timestamp'>
  ): Promise<HelpMessage> {
    await this.loadFromDisk();
    let conv = this.conversations.find(c => c.candidateId === candidateId && c.interviewId === interviewId);
    if (!conv) {
      conv = { candidateId, interviewId, messages: [], status: 'active' };
      this.conversations.push(conv);
    }

    const newMessage: HelpMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    conv.messages.push(newMessage);
    await this.saveToDisk();
    return newMessage;
  }

  async getAiResponse(query: string, questionContext: any): Promise<string> {
    const qLower = query.toLowerCase();
    const title = questionContext.title || 'the current problem';
    
    // ── 1. CLARIFICATION & EXPLANATION ──────────────────────────────────
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

    // ── 2. ERROR & ISSUE ANALYSIS ──────────────────────────────────────
    if (qLower.includes('error') || qLower.includes('wrong') || qLower.includes('issue') || qLower.includes('bug')) {
      return `I've performed a quick audit of the specifications for **${title}**. 

The test cases and expected outputs are consistent with standard algorithmic patterns. If your code is failing, I recommend checking these common pitfalls:
1. **Edge Cases**: Have you handled empty, null, or unusually large inputs?
2. **Types**: Ensure your return type matches the expected output exactly (${questionContext.outputFormat || 'check requirements'}).
3. **Loop Boundaries**: Double-check for off-by-one errors in your iterations.

If you describe your specific error message, I can provide more targeted advice!`;
    }

    // ── 3. TEST CASES & EXAMPLES ────────────────────────────────────────
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

    // ── 4. HINTS ────────────────────────────────────────────────────────
    if (qLower.includes('hint') || qLower.includes('help') || qLower.includes('clue')) {
      const hints = questionContext.hints || [];
      if (hints.length > 0) {
        return `Here is a precise hint for **${title}**:
> ${hints[0]}

If you'd like another hint or a more direct clue about the algorithm, just let me know!`;
      }
      return `Think about the most efficient way to store and retrieve the data you've already seen. Would a Hash Map or a simple Array suffice?`;
    }

    // Default: Transition to human recruiter if AI doesn't feel confident
    if (qLower.length < 5) {
      return "Hi there! I'm your AI technical assistant. I can explain problem logic, clarify test cases, or give you hints. How can I assist you with the current task?";
    }

    return "TRANSFORM_TO_RECRUITER_MODE";
  }

  // ── Helper Logic for "Precision" ───────────────────────────────────────

  private simplifyDescription(desc: string): string {
    // Clear HTML and extract first logical sentence
    const plain = desc.replace(/<[^>]*>?/gm, '').split('.')[0];
    return plain.charAt(0).toLowerCase() + plain.slice(1);
  }

  private getSuggestedPattern(context: any): string {
    const desc = (context.description || '').toLowerCase();
    if (desc.includes('search') || desc.includes('find')) return "Hash Map (Dictionary)";
    if (desc.includes('sort') || desc.includes('order')) return "Two-pointer approach";
    if (desc.includes('sum') || desc.includes('total')) return "Accumulator pattern";
    return "Sliding Window or Iterative approach";
  }

  async getAllConversations(): Promise<Conversation[]> {
    await this.loadFromDisk();
    return this.conversations;
  }
}
