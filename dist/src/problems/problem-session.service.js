"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemSessionService = void 0;
const common_1 = require("@nestjs/common");
const test_case_generator_1 = require("./test-case-generator");
let ProblemSessionService = class ProblemSessionService {
    constructor() {
        this.sessions = new Map();
    }
    createSession(problemId, candidateId, generatorType) {
        const sessionId = `${candidateId}-${problemId}-${Date.now()}`;
        const seed = this.generateSeed();
        const allTestCases = test_case_generator_1.TestCaseGenerator.generateTestCases({
            type: generatorType,
            seed
        });
        const visibleCount = Math.max(2, Math.min(3, Math.ceil(allTestCases.length / 2)));
        const visibleTestCases = allTestCases.slice(0, visibleCount);
        const hiddenTestCases = allTestCases.slice(visibleCount);
        const session = {
            id: sessionId,
            problemId,
            candidateId,
            startedAt: new Date(),
            seed,
            visibleTestCases,
            hiddenTestCases,
            allTestCases
        };
        this.sessions.set(sessionId, session);
        return session;
    }
    getOrCreateSession(problemId, candidateId, generatorType, sessionId) {
        if (sessionId && this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }
        return this.createSession(problemId, candidateId, generatorType);
    }
    getValidationTestCases(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? session.allTestCases : [];
    }
    getVisibleTestCases(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? session.visibleTestCases : [];
    }
    cleanupOldSessions() {
        const now = Date.now();
        const oneHourMs = 60 * 60 * 1000;
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.startedAt.getTime() > oneHourMs) {
                this.sessions.delete(sessionId);
            }
        }
    }
    generateSeed() {
        return Math.floor(Math.random() * 1000000) + Math.floor(Date.now() / 1000);
    }
};
exports.ProblemSessionService = ProblemSessionService;
exports.ProblemSessionService = ProblemSessionService = __decorate([
    (0, common_1.Injectable)()
], ProblemSessionService);
//# sourceMappingURL=problem-session.service.js.map