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
exports.ActivityLogsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
let ActivityLogsService = class ActivityLogsService {
    constructor() {
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'activity-logs.json');
        this.logs = [];
        this.loadFromDisk();
    }
    async loadFromDisk() {
        try {
            const data = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.logs = JSON.parse(data);
        }
        catch (e) {
            this.logs = [];
        }
    }
    async saveToDisk() {
        try {
            await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.logs, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save activity logs:', e);
        }
    }
    async createOrUpdateLog(dto) {
        await this.loadFromDisk();
        const existingIndex = this.logs.findIndex((l) => l.candidateId === dto.candidateId && l.problemId === dto.problemId);
        if (existingIndex !== -1) {
            const existing = this.logs[existingIndex];
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
        const log = {
            ...dto,
            id: crypto.randomUUID(),
            submittedAt: new Date().toISOString(),
        };
        this.logs.push(log);
        await this.saveToDisk();
        return log;
    }
    async getAllLogs() {
        await this.loadFromDisk();
        return [...this.logs].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    async getLogsByCandidate(candidateId) {
        await this.loadFromDisk();
        return this.logs.filter((l) => l.candidateId === candidateId);
    }
};
exports.ActivityLogsService = ActivityLogsService;
exports.ActivityLogsService = ActivityLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ActivityLogsService);
//# sourceMappingURL=activity-logs.service.js.map