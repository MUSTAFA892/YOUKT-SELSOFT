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
const problems_service_1 = require("../problems/problems.service");
let InterviewsService = class InterviewsService {
    constructor(problemsService) {
        this.problemsService = problemsService;
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
        const enrichedQuestions = questions.map(q => {
            const p = this.problemsService.findAllWithTestCases().find(ap => ap.title.toLowerCase().trim() === q.title.toLowerCase().trim());
            return {
                ...q,
                id: crypto.randomUUID(),
                difficulty: q.difficulty || p?.difficulty || 'Easy',
                timeLimit: q.timeLimit || p?.timeLimit || 300,
                description: q.description || p?.description || '',
                inputFormat: q.inputFormat || p?.inputFormat || '',
                outputFormat: q.outputFormat || p?.outputFormat || '',
                examples: q.examples && q.examples.length > 0 ? q.examples : (p?.examples || []),
            };
        });
        const newInterview = {
            id: crypto.randomUUID(),
            candidateId,
            candidateName,
            questions: enrichedQuestions,
            history: [],
            completedCount: 0,
            currentQuestionStartedAt: null,
            createdAt: new Date().toISOString(),
            isComplete: false,
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
        if (!interview.isComplete && interview.questions.length > 0 && !interview.currentQuestionStartedAt) {
            interview.currentQuestionStartedAt = new Date().toISOString();
            await this.saveToDisk();
        }
        return interview;
    }
    async getInterviewsByCandidate(candidateId) {
        await this.loadFromDisk();
        return this.interviews.filter(c => c.candidateId === candidateId);
    }
    async getAllInterviews() {
        await this.loadFromDisk();
        return this.interviews;
    }
    async processQuestionResult(interviewId, questionId, passed, timeMs) {
        const interview = await this.getInterviewById(interviewId);
        if (interview.isComplete)
            return interview;
        const question = interview.questions.find(q => q.id === questionId);
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        const allProblems = this.problemsService.findAllWithTestCases();
        const problem = allProblems.find(p => p.title.toLowerCase().trim() === question.title.toLowerCase().trim() ||
            p.id === question.id);
        const difficulty = (problem?.difficulty || question.difficulty || 'Easy');
        interview.history.push({
            questionId,
            difficulty,
            passed,
            timeMs: Math.round(timeMs)
        });
        interview.completedCount++;
        if (interview.completedCount >= 10) {
            interview.isComplete = true;
        }
        else {
            let nextDiff = difficulty;
            if (passed) {
                if (difficulty === 'Easy')
                    nextDiff = 'Medium';
                else if (difficulty === 'Medium' && timeMs < 500)
                    nextDiff = 'Hard';
            }
            else {
                if (difficulty === 'Hard')
                    nextDiff = 'Medium';
                else if (difficulty === 'Medium')
                    nextDiff = 'Easy';
            }
            const seenIds = interview.history.map(h => {
                const p = allProblems.find(ap => ap.id === h.questionId || ap.title === h.questionId);
                return p?.id;
            });
            const pool = allProblems.filter(p => p.difficulty === nextDiff && !seenIds.includes(p.id));
            const nextProblem = pool.length > 0
                ? pool[Math.floor(Math.random() * pool.length)]
                : allProblems.filter(p => !seenIds.includes(p.id))[0];
            if (nextProblem) {
                const newQ = {
                    id: nextProblem.id,
                    title: nextProblem.title,
                    description: nextProblem.description,
                    difficulty: nextProblem.difficulty,
                    timeLimit: nextProblem.timeLimit,
                    inputFormat: nextProblem.inputFormat,
                    outputFormat: nextProblem.outputFormat,
                    examples: nextProblem.examples,
                    testCases: nextProblem.testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
                    starterCode: nextProblem.starterCode,
                    wrapperCode: nextProblem.wrapperCode
                };
                interview.questions = [newQ];
                interview.currentQuestionStartedAt = null;
            }
            else {
                interview.isComplete = true;
            }
        }
        await this.saveToDisk();
        return interview;
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [problems_service_1.ProblemsService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map