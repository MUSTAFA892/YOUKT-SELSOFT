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

export interface Question {
  id: string;
  title: string;
  description: string;
  testCases: CustomTestCase[];
  starterCode?: CodeTemplates;
  wrapperCode?: CodeTemplates;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  questions: Question[];
  createdAt: string;
}

@Injectable()
export class InterviewsService {
  private readonly dbFilePath = join(process.cwd(), 'interviews.json');
  private interviews: Interview[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const data = await fs.readFile(this.dbFilePath, 'utf-8');
      this.interviews = JSON.parse(data);
    } catch (e) {
      this.interviews = [];
    }
  }

  private async saveToDisk() {
    try {
      await fs.writeFile(this.dbFilePath, JSON.stringify(this.interviews, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save interviews database:', e);
    }
  }

  async createInterview(
    candidateId: string,
    candidateName: string,
    questions: Omit<Question, 'id'>[]
  ): Promise<Interview> {
    const newInterview: Interview = {
      id: crypto.randomUUID(),
      candidateId,
      candidateName,
      questions: questions.map(q => ({ ...q, id: crypto.randomUUID() })),
      createdAt: new Date().toISOString(),
    };
    
    this.interviews.push(newInterview);
    await this.saveToDisk();
    return newInterview;
  }

  async getInterviewById(id: string): Promise<Interview> {
    await this.loadFromDisk();
    const interview = this.interviews.find(c => c.id === id);
    if (!interview) {
      throw new NotFoundException(`Interview with ID "${id}" not found.`);
    }
    return interview;
  }

  async getInterviewsByCandidate(candidateId: string): Promise<Interview[]> {
    await this.loadFromDisk();
    return this.interviews.filter(c => c.candidateId === candidateId);
  }
}
