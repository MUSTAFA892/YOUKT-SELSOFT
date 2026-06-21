import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { InterviewsService } from '../interviews/interviews.service';

export interface PlagiarismWarning {
  detected: boolean;
  similarityPercent: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matchCount?: number;
}

export interface QuestionReport {
  questionId: string;
  questionTitle: string;
  totalTests: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  language: string;
  submittedCode?: string;
  plagiarismWarning?: PlagiarismWarning;
}

export interface AssessmentReport {
  id: string;
  interviewId: string;
  candidateId: string;
  candidateName: string;
  finishedAt: string;
  totalQuestions: number;
  questionsAttempted: number;
  totalTestsPassed: number;
  totalTestsAvailable: number;
  scorePercent: number;
  questions: QuestionReport[];
  violations?: {
    tabSwitches: number;
    terminated: boolean;
  };
  plagiarismWarning?: PlagiarismWarning;
}

@Injectable()
export class ReportsService {
  private readonly dbFilePath = join(process.cwd(), 'reports.json');
  private reports: AssessmentReport[] = [];

  constructor(private readonly interviewsService: InterviewsService) {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const data = await fs.readFile(this.dbFilePath, 'utf-8');
      this.reports = JSON.parse(data);
    } catch (e) {
      this.reports = [];
    }
  }

  private async saveToDisk() {
    try {
      await fs.writeFile(this.dbFilePath, JSON.stringify(this.reports, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save reports database:', e);
    }
  }

  async createReport(dto: Omit<AssessmentReport, 'id' | 'finishedAt'>): Promise<AssessmentReport> {
    await this.loadFromDisk();
    const report: AssessmentReport = {
      ...dto,
      id: crypto.randomUUID(),
      finishedAt: new Date().toISOString(),
    };
    this.reports.push(report);
    await this.saveToDisk();
    await this.interviewsService.markAsComplete(dto.interviewId);
    return report;
  }

  async getAllReports(): Promise<AssessmentReport[]> {
    await this.loadFromDisk();
    return [...this.reports].sort(
      (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
    );
  }

  async getReportsByInterview(interviewId: string): Promise<AssessmentReport[]> {
    await this.loadFromDisk();
    return this.reports.filter(r => r.interviewId === interviewId);
  }
}
