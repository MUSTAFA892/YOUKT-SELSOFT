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
var PipelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineService = exports.PipelineStage = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
var PipelineStage;
(function (PipelineStage) {
    PipelineStage["APPLIED"] = "Applied";
    PipelineStage["ASSESSED"] = "Assessed";
    PipelineStage["INTERVIEWED"] = "Interviewed";
    PipelineStage["OFFER"] = "Offer";
    PipelineStage["REJECTED"] = "Rejected";
})(PipelineStage || (exports.PipelineStage = PipelineStage = {}));
let PipelineService = PipelineService_1 = class PipelineService {
    constructor() {
        this.logger = new common_1.Logger(PipelineService_1.name);
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'pipeline-data.json');
        this.data = [];
        this.loadFromDisk();
    }
    async loadFromDisk() {
        try {
            const raw = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.data = JSON.parse(raw);
        }
        catch {
            this.data = [];
            await this.autoSeedFromInterviews();
        }
    }
    async autoSeedFromInterviews() {
        try {
            const interviewsPath = (0, path_1.join)(process.cwd(), 'interviews.json');
            const raw = await fs_1.promises.readFile(interviewsPath, 'utf-8');
            const interviews = JSON.parse(raw);
            const uniqueCandidates = new Map();
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
        }
        catch (e) {
            this.logger.error('Failed to auto-seed pipeline data', e);
        }
    }
    async saveToDisk() {
        await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    }
    async getAll() {
        await this.loadFromDisk();
        return this.data;
    }
    async getByCandidateId(candidateId) {
        await this.loadFromDisk();
        return this.data.find(e => e.candidateId === candidateId) || null;
    }
    async updateStage(candidateId, stage, candidateName) {
        if (!Object.values(PipelineStage).includes(stage)) {
            throw new common_1.BadRequestException(`Invalid pipeline stage: ${stage}`);
        }
        await this.loadFromDisk();
        const idx = this.data.findIndex(e => e.candidateId === candidateId);
        const now = new Date().toISOString();
        if (idx !== -1) {
            this.data[idx].stage = stage;
            this.data[idx].updatedAt = now;
        }
        else {
            this.data.push({
                candidateId,
                candidateName: candidateName || `Candidate ${candidateId.substring(0, 5)}`,
                stage,
                createdAt: now,
                updatedAt: now,
            });
        }
        await this.saveToDisk();
        const entry = this.data.find(e => e.candidateId === candidateId);
        this.triggerEmailAutomation(entry);
        return entry;
    }
    async bulkUpdateStage(candidateIds, stage) {
        if (!Object.values(PipelineStage).includes(stage)) {
            throw new common_1.BadRequestException(`Invalid pipeline stage: ${stage}`);
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
    async bulkSendEmail(candidateIds, subject, body) {
        const entries = this.data.filter(e => candidateIds.includes(e.candidateId));
        entries.forEach(p => {
            this.logger.log(`[MOCK EMAIL] To: ${p.candidateName} (${p.candidateId}) | Subject: ${subject}`);
            this.logger.log(`[MOCK EMAIL BODY]:\n${body}`);
        });
    }
    triggerEmailAutomation(pipeline) {
        if (pipeline.stage === PipelineStage.ASSESSED) {
            this.logger.log(`[AUTOMATION] Sending Assessment Link Email to ${pipeline.candidateName}`);
        }
        else if (pipeline.stage === PipelineStage.OFFER) {
            this.logger.log(`[AUTOMATION] Sending Offer Letter Email to ${pipeline.candidateName}`);
        }
        else if (pipeline.stage === PipelineStage.REJECTED) {
            this.logger.log(`[AUTOMATION] Sending Rejection Email to ${pipeline.candidateName}`);
        }
    }
    async seedInitialData(candidates) {
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
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = PipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map