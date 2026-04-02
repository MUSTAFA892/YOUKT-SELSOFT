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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const problems_service_1 = require("../problems/problems.service");
const LANGUAGE_IDS = {
    python: 71,
    javascript: 63,
};
const JUDGE0_STATUS = {
    IN_QUEUE: 1,
    PROCESSING: 2,
    ACCEPTED: 3,
    WRONG_ANSWER: 4,
    TIME_LIMIT: 5,
    COMPILATION_ERROR: 6,
    RUNTIME_ERROR_SIGSEGV: 7,
    RUNTIME_ERROR_SIGXFSZ: 8,
    RUNTIME_ERROR_SIGFPE: 9,
    RUNTIME_ERROR_SIGABRT: 10,
    RUNTIME_ERROR_NZEC: 11,
    RUNTIME_ERROR_OTHER: 12,
    INTERNAL_ERROR: 13,
    EXEC_FORMAT_ERROR: 14,
};
let SubmissionsService = class SubmissionsService {
    constructor(problemsService) {
        this.problemsService = problemsService;
    }
    async runSubmission(dto) {
        const problem = this.problemsService.findOneWithTestCases(dto.problemId);
        if (!['python', 'javascript'].includes(dto.language)) {
            throw new common_1.BadRequestException('Unsupported language. Use "python" or "javascript"');
        }
        const wrapperTemplate = problem.wrapperCode[dto.language];
        const results = [];
        for (let i = 0; i < problem.testCases.length; i++) {
            const testCase = problem.testCases[i];
            const fullCode = wrapperTemplate
                .replace('{user_code}', dto.code)
                .replace('{input}', testCase.input);
            const result = await this.executeCode(fullCode, dto.language, i + 1, testCase.description, testCase.input, testCase.expectedOutput);
            results.push(result);
        }
        const passed = results.filter(r => r.status === 'pass').length;
        return {
            problemId: dto.problemId,
            language: dto.language,
            totalTests: problem.testCases.length,
            passed,
            failed: problem.testCases.length - passed,
            results,
            allPassed: passed === problem.testCases.length,
        };
    }
    async executeCode(code, language, testCaseNum, description, input, expectedOutput) {
        const apiKey = process.env.JUDGE0_API_KEY;
        const apiHost = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
        if (!apiKey) {
            throw new Error('JUDGE0_API_KEY environment variable is not set');
        }
        try {
            const submitResponse = await axios_1.default.post(`https://${apiHost}/submissions`, {
                source_code: Buffer.from(code).toString('base64'),
                language_id: LANGUAGE_IDS[language],
                stdin: '',
                base64_encoded: true,
                wait: false,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': apiHost,
                },
            });
            const token = submitResponse.data.token;
            let judgingResult = null;
            let attempts = 0;
            const maxAttempts = 10;
            while (attempts < maxAttempts) {
                await this.sleep(1000);
                const resultResponse = await axios_1.default.get(`https://${apiHost}/submissions/${token}`, {
                    params: { base64_encoded: true, fields: 'stdout,stderr,status,compile_output' },
                    headers: {
                        'X-RapidAPI-Key': apiKey,
                        'X-RapidAPI-Host': apiHost,
                    },
                });
                const statusId = resultResponse.data.status?.id;
                if (statusId === JUDGE0_STATUS.IN_QUEUE || statusId === JUDGE0_STATUS.PROCESSING) {
                    attempts++;
                    continue;
                }
                judgingResult = resultResponse.data;
                break;
            }
            if (!judgingResult) {
                return this.createResult(testCaseNum, description, input, expectedOutput, 'timeout', '', 'Execution timed out');
            }
            const statusId = judgingResult.status?.id;
            if (statusId === JUDGE0_STATUS.COMPILATION_ERROR) {
                const errorMsg = judgingResult.compile_output
                    ? Buffer.from(judgingResult.compile_output, 'base64').toString()
                    : 'Compilation error';
                return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', errorMsg);
            }
            if (statusId >= JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV && statusId <= JUDGE0_STATUS.RUNTIME_ERROR_OTHER) {
                const errorMsg = judgingResult.stderr
                    ? Buffer.from(judgingResult.stderr, 'base64').toString()
                    : 'Runtime error';
                return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', errorMsg);
            }
            if (statusId === JUDGE0_STATUS.TIME_LIMIT) {
                return this.createResult(testCaseNum, description, input, expectedOutput, 'timeout', '', 'Time limit exceeded');
            }
            const rawOutput = judgingResult.stdout
                ? Buffer.from(judgingResult.stdout, 'base64').toString()
                : '';
            const actualOutput = rawOutput.trim();
            const normalizedActual = this.normalize(actualOutput);
            const normalizedExpected = this.normalize(expectedOutput);
            const passed = normalizedActual === normalizedExpected;
            return this.createResult(testCaseNum, description, input, expectedOutput, passed ? 'pass' : 'fail', actualOutput);
        }
        catch (error) {
            const msg = error?.response?.data?.message || error.message || 'Unknown error';
            return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', msg);
        }
    }
    normalize(str) {
        return str
            .trim()
            .replace(/\s*,\s*/g, ',')
            .replace(/\[\s*/g, '[')
            .replace(/\s*\]/g, ']')
            .toLowerCase();
    }
    createResult(testCase, description, input, expectedOutput, status, actualOutput, errorMessage) {
        return { testCase, description, status, input, expectedOutput, actualOutput, errorMessage };
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [problems_service_1.ProblemsService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map