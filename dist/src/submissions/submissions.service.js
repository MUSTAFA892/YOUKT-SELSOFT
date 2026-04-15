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
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const util_1 = require("util");
const os_1 = require("os");
const problems_service_1 = require("../problems/problems.service");
const problem_session_service_1 = require("../problems/problem-session.service");
const validation_service_1 = require("./validation.service");
const challenges_service_1 = require("../challenges/challenges.service");
const interviews_service_1 = require("../interviews/interviews.service");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const SUPPORTED_LANGUAGES = ['python', 'javascript', 'java', 'c'];
let SubmissionsService = class SubmissionsService {
    constructor(problemsService, sessionService, validationService, challengesService, interviewsService) {
        this.problemsService = problemsService;
        this.sessionService = sessionService;
        this.validationService = validationService;
        this.challengesService = challengesService;
        this.interviewsService = interviewsService;
    }
    async runSubmission(dto) {
        if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
            throw new common_1.BadRequestException(`Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }
        const problem = this.problemsService.findOneWithTestCases(dto.problemId);
        const wrapperTemplate = problem.wrapperCode[dto.language];
        if (!wrapperTemplate) {
            throw new common_1.BadRequestException(`Problem "${dto.problemId}" does not support language "${dto.language}" yet.`);
        }
        let testCasesToValidate = problem.testCases;
        if (dto.sessionId) {
            const validationCases = this.sessionService.getValidationTestCases(dto.sessionId);
            if (validationCases.length > 0) {
                testCasesToValidate = validationCases;
            }
        }
        const results = [];
        for (let i = 0; i < testCasesToValidate.length; i++) {
            const testCase = testCasesToValidate[i];
            const fullCode = this.prepareFullCode(wrapperTemplate, dto.code, testCase.input, dto.language);
            const result = await this.executeLocally(fullCode, dto.language, i + 1, testCase.description, testCase.input, testCase.expectedOutput, dto.problemId);
            results.push(result);
        }
        const passed = results.filter(r => r.status === 'pass').length;
        const avgTime = results.length > 0
            ? results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0) / results.length
            : 0;
        return {
            problemId: dto.problemId,
            language: dto.language,
            totalTests: testCasesToValidate.length,
            passed,
            failed: testCasesToValidate.length - passed,
            results,
            allPassed: passed === testCasesToValidate.length,
            averageTimeMs: parseFloat(avgTime.toFixed(2)),
        };
    }
    async runCustomSubmission(dto) {
        if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
            throw new common_1.BadRequestException(`Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }
        const results = [];
        for (let i = 0; i < dto.testCases.length; i++) {
            const testCase = dto.testCases[i];
            const result = await this.executeRawLocally(dto.code, dto.language, i + 1, `Custom Test ${i + 1}`, testCase.input, testCase.expectedOutput);
            results.push(result);
        }
        const passed = results.filter(r => r.status === 'pass').length;
        const avgTime = results.length > 0
            ? results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0) / results.length
            : 0;
        return {
            problemId: 'custom',
            language: dto.language,
            totalTests: dto.testCases.length,
            passed,
            failed: dto.testCases.length - passed,
            results,
            allPassed: passed === dto.testCases.length,
            averageTimeMs: parseFloat(avgTime.toFixed(2)),
        };
    }
    async runChallengeSubmission(dto) {
        if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
            throw new common_1.BadRequestException(`Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }
        const challenge = await this.challengesService.getChallengeById(dto.challengeId);
        const results = [];
        for (let i = 0; i < challenge.testCases.length; i++) {
            const testCase = challenge.testCases[i];
            const wrapperTemplate = challenge.wrapperCode?.[dto.language];
            let result;
            if (wrapperTemplate) {
                const safeInput = testCase.input.trimEnd() + '\n';
                const fullCode = wrapperTemplate
                    .replace('{user_code}', dto.code)
                    .replace('{input}', safeInput);
                result = await this.executeLocally(fullCode, dto.language, i + 1, `Test Case ${i + 1}`, testCase.input, testCase.expectedOutput);
            }
            else {
                result = await this.executeRawLocally(dto.code, dto.language, i + 1, `Test Case ${i + 1}`, testCase.input, testCase.expectedOutput);
            }
            results.push(result);
        }
        const passed = results.filter(r => r.status === 'pass').length;
        const avgTime = results.length > 0
            ? results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0) / results.length
            : 0;
        return {
            problemId: dto.challengeId,
            language: dto.language,
            totalTests: challenge.testCases.length,
            passed,
            failed: challenge.testCases.length - passed,
            results,
            allPassed: passed === challenge.testCases.length,
            averageTimeMs: parseFloat(avgTime.toFixed(2)),
        };
    }
    async runInterviewSubmission(dto) {
        if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
            throw new common_1.BadRequestException(`Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }
        const interview = await this.interviewsService.getInterviewById(dto.interviewId);
        const question = interview.questions.find(q => q.id === dto.questionId);
        if (!question) {
            throw new common_1.BadRequestException(`Question with ID "${dto.questionId}" not found in Interview "${dto.interviewId}".`);
        }
        const results = [];
        for (let i = 0; i < question.testCases.length; i++) {
            const testCase = question.testCases[i];
            const wrapperTemplate = question.wrapperCode?.[dto.language];
            let result;
            if (wrapperTemplate) {
                const safeInput = testCase.input.trimEnd() + '\n';
                const fullCode = wrapperTemplate
                    .replace('{user_code}', dto.code)
                    .replace('{input}', safeInput);
                result = await this.executeLocally(fullCode, dto.language, i + 1, `Test Case ${i + 1}`, testCase.input, testCase.expectedOutput);
            }
            else {
                result = await this.executeRawLocally(dto.code, dto.language, i + 1, `Test Case ${i + 1}`, testCase.input, testCase.expectedOutput);
            }
            results.push(result);
        }
        const passed = results.filter(r => r.status === 'pass').length;
        const avgTime = results.length > 0
            ? results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0) / results.length
            : 0;
        return {
            problemId: dto.questionId,
            language: dto.language,
            totalTests: question.testCases.length,
            passed,
            failed: question.testCases.length - passed,
            results,
            allPassed: passed === question.testCases.length,
            averageTimeMs: parseFloat(avgTime.toFixed(2)),
        };
    }
    prepareFullCode(template, userCode, input, language) {
        let result = template.replace('{user_code}', userCode);
        const safeInput = input.trimEnd() + '\n';
        result = result.replace(/{input}/g, safeInput);
        if (input.includes('[') && input.includes(']')) {
            const arrayMatch = input.match(/\[(.*?)\]/);
            if (arrayMatch) {
                const numsStr = arrayMatch[1].trim();
                result = result.replace(/{java_nums}/g, numsStr);
                result = result.replace(/{c_nums}/g, numsStr);
                const afterArray = input.substring(input.indexOf(']') + 1).trim();
                if (afterArray.startsWith(',')) {
                    const targetChar = afterArray.substring(1).trim();
                    result = result.replace(/{java_target}/g, targetChar);
                    result = result.replace(/{c_target}/g, targetChar);
                }
            }
        }
        if (input.trim().startsWith('"')) {
            const strContent = input.trim();
            result = result.replace(/{java_str}/g, strContent);
            result = result.replace(/{c_str}/g, strContent);
        }
        return result;
    }
    async executeLocally(code, language, testCaseNum, description, input, expectedOutput, problemId) {
        const tmp = (0, os_1.tmpdir)();
        const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        if (language === 'python') {
            const filePath = (0, path_1.join)(tmp, `sol_${uid}.py`);
            try {
                await (0, promises_1.writeFile)(filePath, code, 'utf8');
                const start = process.hrtime();
                const { stdout, stderr } = await execAsync(`python "${filePath}"`, { timeout: 5000 });
                const [s, ns] = process.hrtime(start);
                const timeMs = s * 1000 + ns / 1e6;
                if (stderr?.trim())
                    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim(), timeMs);
                return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout, timeMs, problemId);
            }
            catch (e) {
                return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
            }
            finally {
                await this.safeDelete(filePath);
            }
        }
        if (language === 'javascript') {
            const filePath = (0, path_1.join)(tmp, `sol_${uid}.js`);
            try {
                await (0, promises_1.writeFile)(filePath, code, 'utf8');
                const start = process.hrtime();
                const { stdout, stderr } = await execAsync(`node "${filePath}"`, { timeout: 5000 });
                const [s, ns] = process.hrtime(start);
                const timeMs = s * 1000 + ns / 1e6;
                if (stderr?.trim())
                    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim(), timeMs);
                return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout, timeMs, problemId);
            }
            catch (e) {
                return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
            }
            finally {
                await this.safeDelete(filePath);
            }
        }
        if (language === 'java') {
            const javaDir = (0, path_1.join)(tmp, `java_${uid}`);
            const javaFile = (0, path_1.join)(javaDir, 'Solution.java');
            const classDir = javaDir;
            try {
                await execAsync(`mkdir "${javaDir}"`);
                await (0, promises_1.writeFile)(javaFile, code, 'utf8');
                const compile = await execAsync(`javac "${javaFile}"`, { timeout: 10000 });
                if (compile.stderr?.trim()) {
                    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
                }
                const { stdout, stderr } = await execAsync(`java -cp "${classDir}" Solution`, { timeout: 5000 });
                if (stderr?.trim())
                    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
                return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout, undefined, problemId);
            }
            catch (e) {
                return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
            }
            finally {
                await execAsync(`rmdir /s /q "${javaDir}"`).catch(() => execAsync(`rm -rf "${javaDir}"`).catch(() => { }));
            }
        }
        if (language === 'c') {
            const cFile = (0, path_1.join)(tmp, `sol_${uid}.c`);
            const outFile = (0, path_1.join)(tmp, `sol_${uid}_out`);
            try {
                await (0, promises_1.writeFile)(cFile, code, 'utf8');
                const compile = await execAsync(`gcc "${cFile}" -o "${outFile}"`, { timeout: 10000 });
                if (compile.stderr?.trim()) {
                    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
                }
                const runCmd = process.platform === 'win32'
                    ? `"${outFile}.exe"`
                    : `"${outFile}"`;
                const { stdout, stderr } = await execAsync(runCmd, { timeout: 5000 });
                if (stderr?.trim())
                    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
                return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout, undefined, problemId);
            }
            catch (e) {
                return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
            }
            finally {
                await this.safeDelete(cFile);
                await this.safeDelete(outFile);
                await this.safeDelete(outFile + '.exe');
            }
        }
        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', 'Unknown language');
    }
    async executeRawLocally(code, language, testCaseNum, description, input, expectedOutput) {
        const tmp = (0, os_1.tmpdir)();
        const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const inputFilePath = (0, path_1.join)(tmp, `in_${uid}.txt`);
        try {
            await (0, promises_1.writeFile)(inputFilePath, input, 'utf8');
            if (language === 'python') {
                const filePath = (0, path_1.join)(tmp, `sol_${uid}.py`);
                try {
                    await (0, promises_1.writeFile)(filePath, code, 'utf8');
                    const { stdout, stderr } = await execAsync(`python "${filePath}" < "${inputFilePath}"`, { timeout: 5000 });
                    if (stderr?.trim())
                        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
                    return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
                }
                catch (e) {
                    return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
                }
                finally {
                    await this.safeDelete(filePath);
                }
            }
            if (language === 'javascript') {
                const filePath = (0, path_1.join)(tmp, `sol_${uid}.js`);
                try {
                    await (0, promises_1.writeFile)(filePath, code, 'utf8');
                    const { stdout, stderr } = await execAsync(`node "${filePath}" < "${inputFilePath}"`, { timeout: 5000 });
                    if (stderr?.trim())
                        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
                    return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
                }
                catch (e) {
                    return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
                }
                finally {
                    await this.safeDelete(filePath);
                }
            }
            if (language === 'java') {
                const javaDir = (0, path_1.join)(tmp, `java_${uid}`);
                const javaFile = (0, path_1.join)(javaDir, 'Solution.java');
                try {
                    await execAsync(`mkdir "${javaDir}"`);
                    await (0, promises_1.writeFile)(javaFile, code, 'utf8');
                    const compile = await execAsync(`javac "${javaFile}"`, { timeout: 10000 });
                    if (compile.stderr?.trim())
                        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
                    const { stdout, stderr } = await execAsync(`java -cp "${javaDir}" Solution < "${inputFilePath}"`, { timeout: 5000 });
                    if (stderr?.trim())
                        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
                    return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
                }
                catch (e) {
                    return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
                }
                finally {
                    await execAsync(`rmdir /s /q "${javaDir}"`).catch(() => execAsync(`rm -rf "${javaDir}"`).catch(() => { }));
                }
            }
            if (language === 'c') {
                const cFile = (0, path_1.join)(tmp, `sol_${uid}.c`);
                const outFile = (0, path_1.join)(tmp, `sol_${uid}_out`);
                try {
                    await (0, promises_1.writeFile)(cFile, code, 'utf8');
                    const compile = await execAsync(`gcc "${cFile}" -o "${outFile}"`, { timeout: 10000 });
                    if (compile.stderr?.trim())
                        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
                    const runCmd = process.platform === 'win32' ? `"${outFile}.exe"` : `"${outFile}"`;
                    const { stdout, stderr } = await execAsync(`${runCmd} < "${inputFilePath}"`, { timeout: 5000 });
                    if (stderr?.trim())
                        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
                    return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
                }
                catch (e) {
                    return this.handleExecError(e, testCaseNum, description, input, expectedOutput);
                }
                finally {
                    await this.safeDelete(cFile);
                    await this.safeDelete(outFile);
                    await this.safeDelete(outFile + '.exe');
                }
            }
            return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', 'Unknown language');
        }
        finally {
            await this.safeDelete(inputFilePath);
        }
    }
    compareOutput(testCaseNum, description, input, expectedOutput, stdout, timeMs, problemId) {
        const actual = (stdout || '').trim();
        if (problemId) {
            const validationResult = this.validationService.validateOutput(problemId, input, expectedOutput, actual);
            const passed = validationResult.passed;
            return this.createResult(testCaseNum, description, input, expectedOutput, passed ? 'pass' : 'fail', actual, validationResult.message, timeMs);
        }
        const passed = this.normalize(actual) === this.normalize(expectedOutput);
        return this.createResult(testCaseNum, description, input, expectedOutput, passed ? 'pass' : 'fail', actual, undefined, timeMs);
    }
    handleExecError(error, testCaseNum, description, input, expectedOutput) {
        if (error.killed || error.signal === 'SIGTERM') {
            return this.createResult(testCaseNum, description, input, expectedOutput, 'timeout', '', 'Time limit exceeded (5 seconds). Check for infinite loops.');
        }
        const msg = error.stderr?.trim() || error.message || 'Unknown error';
        return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', msg);
    }
    async safeDelete(path) {
        try {
            await (0, promises_1.unlink)(path);
        }
        catch { }
    }
    normalize(str) {
        return str.trim()
            .replace(/\s*,\s*/g, ',')
            .replace(/\[\s*/g, '[')
            .replace(/\s*\]/g, ']')
            .toLowerCase();
    }
    createResult(testCase, description, input, expectedOutput, status, actualOutput, errorMessage, executionTimeMs) {
        return { testCase, description, status, input, expectedOutput, actualOutput, errorMessage, executionTimeMs };
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [problems_service_1.ProblemsService,
        problem_session_service_1.ProblemSessionService,
        validation_service_1.ValidationService,
        challenges_service_1.ChallengesService,
        interviews_service_1.InterviewsService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map