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
    
    // Simulate thinking delay in the frontend, so we return immediately here
    
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

    // Default: Transform to messaging mode (handled by frontend logic, but backend provides a transition msg)
    return "TRANSFORM_TO_RECRUITER_MODE";
  }

  async getAllConversations(): Promise<Conversation[]> {
    await this.loadFromDisk();
    return this.conversations;
  }
}
