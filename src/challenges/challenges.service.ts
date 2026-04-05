import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { CustomTestCase } from '../submissions/submissions.service';

export interface CodeTemplates {
  python?: string;
  javascript?: string;
  java?: string;
  c?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  testCases: CustomTestCase[];
  starterCode?: CodeTemplates;
  wrapperCode?: CodeTemplates;
}

@Injectable()
export class ChallengesService {
  private readonly dbFilePath = join(process.cwd(), 'challenges.json');
  private challenges: Challenge[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const data = await fs.readFile(this.dbFilePath, 'utf-8');
      this.challenges = JSON.parse(data);
    } catch (e) {
      this.challenges = [];
    }
  }

  private async saveToDisk() {
    try {
      await fs.writeFile(this.dbFilePath, JSON.stringify(this.challenges, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save challenges database:', e);
    }
  }

  async createChallenge(
    title: string, 
    description: string, 
    testCases: CustomTestCase[],
    starterCode?: CodeTemplates,
    wrapperCode?: CodeTemplates
  ): Promise<Challenge> {
    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      title,
      description,
      testCases,
      starterCode,
      wrapperCode,
    };
    
    this.challenges.push(newChallenge);
    await this.saveToDisk();
    return newChallenge;
  }

  async getChallengeById(id: string): Promise<Challenge> {
    // Attempt lazy reload in case external edits were made
    await this.loadFromDisk();
    const challenge = this.challenges.find(c => c.id === id);
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID "${id}" not found.`);
    }
    return challenge;
  }
}
