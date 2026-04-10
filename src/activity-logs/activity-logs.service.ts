import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

export interface ActivityLog {
  id: string;
  candidateId: string;
  candidateName: string;
  problemId: string;
  problemTitle: string;
  language: string;
  passed: number;
  totalTests: number;
  allPassed: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
}

@Injectable()
export class ActivityLogsService {
  private readonly dbFilePath = join(process.cwd(), 'activity-logs.json');
  private logs: ActivityLog[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const data = await fs.readFile(this.dbFilePath, 'utf-8');
      this.logs = JSON.parse(data);
    } catch (e) {
      this.logs = [];
    }
  }

  private async saveToDisk() {
    try {
      await fs.writeFile(this.dbFilePath, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save activity logs:', e);
    }
  }

  async createOrUpdateLog(dto: Omit<ActivityLog, 'id' | 'submittedAt'>): Promise<ActivityLog> {
    await this.loadFromDisk();

    // Check if a report exists for this candidate/problem
    const existingIndex = this.logs.findIndex(
      (l) => l.candidateId === dto.candidateId && l.problemId === dto.problemId,
    );

    if (existingIndex !== -1) {
      const existing = this.logs[existingIndex];
      // Only update if the new attempt is better or equal in score
      // Or if the score is already perfect, maybe the user solved it again in another language
      // Here we prioritize the "best attempt" (max `passed`)
      if (dto.passed >= existing.passed) {
        this.logs[existingIndex] = {
          ...existing,
          ...dto,
          submittedAt: new Date().toISOString(),
        };
        await this.saveToDisk();
        return this.logs[existingIndex];
      }
      return existing;
    }

    // New report
    const log: ActivityLog = {
      ...dto,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    this.logs.push(log);
    await this.saveToDisk();
    return log;
  }

  async getAllLogs(): Promise<ActivityLog[]> {
    await this.loadFromDisk();
    return [...this.logs].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }

  async getLogsByCandidate(candidateId: string): Promise<ActivityLog[]> {
    await this.loadFromDisk();
    return this.logs.filter((l) => l.candidateId === candidateId);
  }
}
