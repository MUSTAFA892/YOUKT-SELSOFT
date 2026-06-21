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
        this.OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';
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
    async createInterview(candidateId, candidateName, questions, recruiterId, recruiterName) {
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
            recruiterId,
            recruiterName,
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
    async markAsComplete(id) {
        await this.loadFromDisk();
        const interview = this.interviews.find(c => c.id === id);
        if (interview) {
            interview.isComplete = true;
            await this.saveToDisk();
        }
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
    async generateTemplatesWithAI(title, description, inputFormat, outputFormat) {
        const prompt = `You are a strict code generation assistant.
Given the coding problem below, generate the exact "starterCode" (what the user sees) and "wrapperCode" (invisible code that runs the user's function and prints the result to standard output) for Python, JavaScript, Java, and C.
The wrapper code MUST contain the exact string "{user_code}" where the starter code will be injected.
The wrapper code MUST read from standard input, parse the arguments according to the Input format, call the specific function defined in the starter code, and print the output exactly as requested.

PROBLEM:
Title: ${title}
Description: ${description}
Input: ${inputFormat}
Output: ${outputFormat}

OUTPUT JSON FORMAT ONLY:
{
  "starterCode": { "python": "", "javascript": "", "java": "", "c": "" },
  "wrapperCode": { "python": "", "javascript": "", "java": "", "c": "" }
}
Do not include markdown blocks or any other text. Output strictly valid JSON.`;
        const genericFallback = {
            starterCode: {
                python: "def solve(input_data):\n    # write your logic here\n    pass\n",
                javascript: "function solve(inputData) {\n    // write your logic here\n}\n",
                java: "public static Object solve(String inputData) {\n    // write your logic here\n    return \"\";\n}\n",
                c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nvoid solve(const char* inputData) {\n    // write your logic and print the result\n}\n"
            },
            wrapperCode: {
                python: "import sys\n{user_code}\n\nif __name__ == '__main__':\n    input_data = \"\"\"{input}\"\"\".strip()\n    result = solve(input_data)\n    if result is not None:\n        print(result)\n",
                javascript: "{user_code}\n\nconst inputData = `{input}`.trim();\nconst result = solve(inputData);\nif (result !== undefined) console.log(result);\n",
                java: "import java.util.*;\n\npublic class Solution {\n    {user_code}\n\n    public static void main(String[] args) {\n        String inputData = \"{input}\".trim();\n        Object result = solve(inputData);\n        if (result != null) System.out.println(result);\n    }\n}\n",
                c: "{user_code}\n\nint main() {\n    const char* inputData = \"{input}\";\n    solve(inputData);\n    return 0;\n}\n"
            }
        };
        try {
            const response = await fetch(`${this.OLLAMA_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.OLLAMA_MODEL,
                    prompt,
                    stream: false,
                    format: 'json',
                    options: { temperature: 0.1, num_predict: 2000 }
                }),
            });
            if (!response.ok)
                throw new Error('Ollama HTTP error');
            const data = await response.json();
            const jsonRes = JSON.parse(data.response);
            return {
                starterCode: { ...genericFallback.starterCode, ...(jsonRes.starterCode || {}) },
                wrapperCode: { ...genericFallback.wrapperCode, ...(jsonRes.wrapperCode || {}) }
            };
        }
        catch (err) {
            console.error('Failed to generate templates with AI', err);
            return genericFallback;
        }
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [problems_service_1.ProblemsService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map