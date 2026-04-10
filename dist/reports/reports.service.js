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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
let ReportsService = class ReportsService {
    constructor() {
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'reports.json');
        this.reports = [];
        this.loadFromDisk();
    }
    async loadFromDisk() {
        try {
            const data = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.reports = JSON.parse(data);
        }
        catch (e) {
            this.reports = [];
        }
    }
    async saveToDisk() {
        try {
            await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.reports, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save reports database:', e);
        }
    }
    async createReport(dto) {
        await this.loadFromDisk();
        const report = {
            ...dto,
            id: crypto.randomUUID(),
            finishedAt: new Date().toISOString(),
        };
        this.reports.push(report);
        await this.saveToDisk();
        return report;
    }
    async getAllReports() {
        await this.loadFromDisk();
        return [...this.reports].sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime());
    }
    async getReportsByInterview(interviewId) {
        await this.loadFromDisk();
        return this.reports.filter(r => r.interviewId === interviewId);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ReportsService);
//# sourceMappingURL=reports.service.js.map