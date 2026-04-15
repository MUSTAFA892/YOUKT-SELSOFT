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
exports.TabSwitchService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
let TabSwitchService = class TabSwitchService {
    constructor() {
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'tab-switch-incidents.json');
        this.incidents = [];
        this.loadFromDisk();
    }
    async loadFromDisk() {
        try {
            const data = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.incidents = JSON.parse(data);
        }
        catch (e) {
            this.incidents = [];
        }
    }
    async saveToDisk() {
        try {
            await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.incidents, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save tab switch incidents:', e);
        }
    }
    async reportTabSwitch(dto) {
        await this.loadFromDisk();
        const existingIndex = this.incidents.findIndex((i) => i.candidateId === dto.candidateId &&
            i.problemId === dto.problemId &&
            new Date(i.recordedAt).getTime() > Date.now() - 3600000);
        if (existingIndex !== -1) {
            const incident = this.incidents[existingIndex];
            incident.switchCount = dto.switchCount;
            incident.details.lastSwitchAt = new Date().toISOString();
            incident.details.totalSwitches = dto.switchCount;
            incident.status = dto.switchCount >= 3 ? 'terminated' : 'warning';
            await this.saveToDisk();
            return incident;
        }
        const incident = {
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
    async getAllIncidents() {
        await this.loadFromDisk();
        return [...this.incidents].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    }
    async getIncidentsByCandidate(candidateId) {
        await this.loadFromDisk();
        return this.incidents.filter((i) => i.candidateId === candidateId);
    }
    async getIncidentsByProblem(problemId) {
        await this.loadFromDisk();
        return this.incidents.filter((i) => i.problemId === problemId);
    }
    async getTerminatedSessions() {
        await this.loadFromDisk();
        return this.incidents.filter((i) => i.status === 'terminated');
    }
};
exports.TabSwitchService = TabSwitchService;
exports.TabSwitchService = TabSwitchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TabSwitchService);
//# sourceMappingURL=tab-switch.service.js.map