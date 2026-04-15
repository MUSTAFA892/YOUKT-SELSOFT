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
exports.ChallengesService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = require("crypto");
let ChallengesService = class ChallengesService {
    constructor() {
        this.dbFilePath = (0, path_1.join)(process.cwd(), 'challenges.json');
        this.challenges = [];
        this.loadFromDisk();
    }
    async loadFromDisk() {
        try {
            const data = await fs_1.promises.readFile(this.dbFilePath, 'utf-8');
            this.challenges = JSON.parse(data);
        }
        catch (e) {
            this.challenges = [];
        }
    }
    async saveToDisk() {
        try {
            await fs_1.promises.writeFile(this.dbFilePath, JSON.stringify(this.challenges, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save challenges database:', e);
        }
    }
    async createChallenge(title, description, testCases, starterCode, wrapperCode) {
        const newChallenge = {
            id: crypto.randomUUID(),
            title,
            description,
            testCases,
            starterCode,
            wrapperCode,
        };
        this.challenges.push(newChallenge);
        await this.saveToDisk();
        return newChallenge;
    }
    async getChallengeById(id) {
        await this.loadFromDisk();
        const challenge = this.challenges.find(c => c.id === id);
        if (!challenge) {
            throw new common_1.NotFoundException(`Challenge with ID "${id}" not found.`);
        }
        return challenge;
    }
};
exports.ChallengesService = ChallengesService;
exports.ChallengesService = ChallengesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ChallengesService);
//# sourceMappingURL=challenges.service.js.map