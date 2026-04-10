import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

export interface TabSwitchIncident {
  id: string;
  candidateId: string;
  candidateName: string;
  problemId: string;
  problemTitle: string;
  switchCount: number;
  maxAllowed: number;
  status: 'warning' | 'terminated'; // warning on 1st/2nd, terminated on 3rd
  details: {
    firstSwitchAt: string;
    lastSwitchAt: string;
    totalSwitches: number;
  };
  recordedAt: string;
}

@Injectable()
export class TabSwitchService {
  private readonly dbFilePath = join(process.cwd(), 'tab-switch-incidents.json');
  private incidents: TabSwitchIncident[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const data = await fs.readFile(this.dbFilePath, 'utf-8');
      this.incidents = JSON.parse(data);
    } catch (e) {
      this.incidents = [];
    }
  }

  private async saveToDisk() {
    try {
      await fs.writeFile(this.dbFilePath, JSON.stringify(this.incidents, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save tab switch incidents:', e);
    }
  }

  async reportTabSwitch(dto: {
    candidateId: string;
    candidateName: string;
    problemId: string;
    problemTitle: string;
    switchCount: number;
  }): Promise<TabSwitchIncident> {
    await this.loadFromDisk();

    // Check if there's an existing incident for this session
    const existingIndex = this.incidents.findIndex(
      (i) =>
        i.candidateId === dto.candidateId &&
        i.problemId === dto.problemId &&
        new Date(i.recordedAt).getTime() > Date.now() - 3600000, // Same session (within 1 hour)
    );

    if (existingIndex !== -1) {
      // Update existing incident
      const incident = this.incidents[existingIndex];
      incident.switchCount = dto.switchCount;
      incident.details.lastSwitchAt = new Date().toISOString();
      incident.details.totalSwitches = dto.switchCount;
      incident.status = dto.switchCount >= 3 ? 'terminated' : 'warning';
      await this.saveToDisk();
      return incident;
    }

    // Create new incident
    const incident: TabSwitchIncident = {
      id: crypto.randomUUID(),
      candidateId: dto.candidateId,
      candidateName: dto.candidateName,
      problemId: dto.problemId,
      problemTitle: dto.problemTitle,
      switchCount: dto.switchCount,
      maxAllowed: 3,
      status: dto.switchCount >= 3 ? 'terminated' : 'warning',
      details: {
        firstSwitchAt: new Date().toISOString(),
        lastSwitchAt: new Date().toISOString(),
        totalSwitches: dto.switchCount,
      },
      recordedAt: new Date().toISOString(),
    };

    this.incidents.push(incident);
    await this.saveToDisk();
    return incident;
  }

  async getAllIncidents(): Promise<TabSwitchIncident[]> {
    await this.loadFromDisk();
    return [...this.incidents].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );
  }

  async getIncidentsByCandidate(candidateId: string): Promise<TabSwitchIncident[]> {
    await this.loadFromDisk();
    return this.incidents.filter((i) => i.candidateId === candidateId);
  }

  async getIncidentsByProblem(problemId: string): Promise<TabSwitchIncident[]> {
    await this.loadFromDisk();
    return this.incidents.filter((i) => i.problemId === problemId);
  }

  async getTerminatedSessions(): Promise<TabSwitchIncident[]> {
    await this.loadFromDisk();
    return this.incidents.filter((i) => i.status === 'terminated');
  }
}
