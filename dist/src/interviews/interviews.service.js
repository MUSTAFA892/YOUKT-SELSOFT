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
exports.InterviewsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
let InterviewsService = class InterviewsService {
    constructor() {
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'interviews.json');
        this.interviews = [];
        this.loadFromDisk();
    }
    async loadFromDisk() {
        try {
            const data = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.interviews = JSON.parse(data);
        }
        catch (e) {
            this.interviews = [];
        }
    }
    async saveToDisk() {
        try {
            await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.interviews, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save interviews database:', e);
        }
    }
    async createInterview(candidateId, candidateName, questions) {
        const newInterview = {
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
    async getInterviewById(id) {
        await this.loadFromDisk();
        const interview = this.interviews.find(c => c.id === id);
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID "${id}" not found.`);
        }
        return interview;
    }
    async getInterviewsByCandidate(candidateId) {
        await this.loadFromDisk();
        return this.interviews.filter(c => c.candidateId === candidateId);
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map