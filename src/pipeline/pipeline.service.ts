import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

export enum PipelineStage {
  APPLIED = 'Applied',
  ASSESSED = 'Assessed',
  INTERVIEWED = 'Interviewed',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
}

export interface PipelineEntry {
  candidateId: string;
  candidateName: string;
  stage: PipelineStage;
  recruiterId?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);
  private readonly dbFilePath = join(process.cwd(), 'pipeline-data.json');
  private data: PipelineEntry[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const raw = await fs.readFile(this.dbFilePath, 'utf-8');
      this.data = JSON.parse(raw);
    } catch {
      this.data = [];
      await this.autoSeedFromInterviews();
    }
  }

  private async autoSeedFromInterviews() {
    try {
      const interviewsPath = join(process.cwd(), 'interviews.json');
      const raw = await fs.readFile(interviewsPath, 'utf-8');
      const interviews = JSON.parse(raw);
      
      const uniqueCandidates = new Map<string, string>();
      for (const inv of interviews) {
        if (inv.candidateId && inv.candidateName) {
          uniqueCandidates.set(inv.candidateId, inv.candidateName);
        }
      }
      
      const candidatesToSeed = Array.from(uniqueCandidates.entries()).map(([id, name]) => ({ id, name }));
      
      if (candidatesToSeed.length > 0) {
        this.logger.log(`Auto-seeding pipeline with ${candidatesToSeed.length} candidates from interviews.json`);
        const now = new Date().toISOString();
        for (const c of candidatesToSeed) {
          this.data.push({
            candidateId: c.id,
            candidateName: c.name,
            stage: PipelineStage.APPLIED,
            createdAt: now,
            updatedAt: now,
          });
        }
        await this.saveToDisk();
      }
    } catch (e) {
      this.logger.error('Failed to auto-seed pipeline data', e);
    }
  }

  private async saveToDisk() {
    await fs.writeFile(this.dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async getAll(): Promise<PipelineEntry[]> {
    await this.loadFromDisk();
    return this.data;
  }

  async getByCandidateId(candidateId: string): Promise<PipelineEntry | null> {
    await this.loadFromDisk();
    return this.data.find(e => e.candidateId === candidateId) || null;
  }

  async updateStage(candidateId: string, stage: PipelineStage, candidateName?: string): Promise<PipelineEntry> {
    if (!Object.values(PipelineStage).includes(stage)) {
      throw new BadRequestException(`Invalid pipeline stage: ${stage}`);
    }
    await this.loadFromDisk();
    const idx = this.data.findIndex(e => e.candidateId === candidateId);
    const now = new Date().toISOString();

    if (idx !== -1) {
      this.data[idx].stage = stage;
      this.data[idx].updatedAt = now;
    } else {
      this.data.push({
        candidateId,
        candidateName: candidateName || `Candidate ${candidateId.substring(0, 5)}`,
        stage,
        createdAt: now,
        updatedAt: now,
      });
    }

    await this.saveToDisk();
    const entry = this.data.find(e => e.candidateId === candidateId)!;
    this.triggerEmailAutomation(entry);
    return entry;
  }

  async bulkUpdateStage(candidateIds: string[], stage: PipelineStage): Promise<PipelineEntry[]> {
    if (!Object.values(PipelineStage).includes(stage)) {
      throw new BadRequestException(`Invalid pipeline stage: ${stage}`);
    }
    await this.loadFromDisk();
    const now = new Date().toISOString();
    for (const id of candidateIds) {
      const idx = this.data.findIndex(e => e.candidateId === id);
      if (idx !== -1) {
        this.data[idx].stage = stage;
        this.data[idx].updatedAt = now;
      }
    }
    await this.saveToDisk();
    const updated = this.data.filter(e => candidateIds.includes(e.candidateId));
    updated.forEach(p => this.triggerEmailAutomation(p));
    return updated;
  }

  async bulkSendEmail(candidateIds: string[], subject: string, body: string): Promise<void> {
    const entries = this.data.filter(e => candidateIds.includes(e.candidateId));
    entries.forEach(p => {
      this.logger.log(`[MOCK EMAIL] To: ${p.candidateName} (${p.candidateId}) | Subject: ${subject}`);
      this.logger.log(`[MOCK EMAIL BODY]:\n${body}`);
    });
  }

  private triggerEmailAutomation(pipeline: PipelineEntry) {
    if (pipeline.stage === PipelineStage.ASSESSED) {
      this.logger.log(`[AUTOMATION] Sending Assessment Link Email to ${pipeline.candidateName}`);
    } else if (pipeline.stage === PipelineStage.OFFER) {
      this.logger.log(`[AUTOMATION] Sending Offer Letter Email to ${pipeline.candidateName}`);
    } else if (pipeline.stage === PipelineStage.REJECTED) {
      this.logger.log(`[AUTOMATION] Sending Rejection Email to ${pipeline.candidateName}`);
    }
  }

  async seedInitialData(candidates: { id: string; name: string }[]) {
    await this.loadFromDisk();
    const now = new Date().toISOString();
    for (const c of candidates) {
      const exists = this.data.find(e => e.candidateId === c.id);
      if (!exists) {
        this.data.push({
          candidateId: c.id,
          candidateName: c.name,
          stage: PipelineStage.APPLIED,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    await this.saveToDisk();
  }
}
