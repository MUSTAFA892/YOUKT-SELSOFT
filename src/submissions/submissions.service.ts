// submissions.service.ts — OFFLINE execution, now supports 4 languages!
// Python, JavaScript, Java, C
//
// Python/JS  → run directly
// Java       → compile first (javac), then run (java)
// C          → compile first (gcc),   then run the output file

import { Injectable, BadRequestException } from '@nestjs/common';
import { exec }                            from 'child_process';
import { writeFile, unlink }               from 'fs/promises';
import { join }                            from 'path';
import { promisify }                       from 'util';
import { tmpdir }                          from 'os';
import { ProblemsService }                 from '../problems/problems.service';
import { ChallengesService }               from '../challenges/challenges.service';
import { InterviewsService }               from '../interviews/interviews.service';

const execAsync = promisify(exec);

// --- TYPE DEFINITIONS ---

export type SupportedLanguage = 'python' | 'javascript' | 'java' | 'c';

export interface SubmissionDto {
  problemId: string;
  language: SupportedLanguage;
  code: string;
}

export interface CustomTestCase {
  input: string;
  expectedOutput: string;
}

export interface CustomSubmissionDto {
  language: SupportedLanguage;
  code: string;
  testCases: CustomTestCase[];
}

export interface ChallengeSubmissionDto {
  challengeId: string;
  language: SupportedLanguage;
  code: string;
}

export interface InterviewSubmissionDto {
  interviewId: string;
  questionId: string;
  language: SupportedLanguage;
  code: string;
}

export interface TestResult {
  testCase: number;
  description: string;
  status: 'pass' | 'fail' | 'error' | 'timeout';
  input: string;
  expectedOutput: string;
  actualOutput: string;
  errorMessage?: string;
}

export interface SubmissionResult {
  problemId: string;
  language: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
  allPassed: boolean;
}

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['python', 'javascript', 'java', 'c'];

@Injectable()
export class SubmissionsService {

  constructor(
    private readonly problemsService: ProblemsService,
    private readonly challengesService: ChallengesService,
    private readonly interviewsService: InterviewsService
  ) {}

  async runSubmission(dto: SubmissionDto): Promise<SubmissionResult> {

    if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
      throw new BadRequestException(
        `Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`
      );
    }

    const problem         = this.problemsService.findOneWithTestCases(dto.problemId);
    const wrapperTemplate = problem.wrapperCode[dto.language];

    if (!wrapperTemplate) {
      throw new BadRequestException(
        `Problem "${dto.problemId}" does not support language "${dto.language}" yet.`
      );
    }

    const results: TestResult[] = [];

    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];

      const fullCode = wrapperTemplate
        .replace('{user_code}', dto.code)
        .replace('{input}', testCase.input);

      const result = await this.executeLocally(
        fullCode,
        dto.language,
        i + 1,
        testCase.description,
        testCase.input,
        testCase.expectedOutput,
      );

      results.push(result);
    }

    const passed = results.filter(r => r.status === 'pass').length;

    return {
      problemId:  dto.problemId,
      language:   dto.language,
      totalTests: problem.testCases.length,
      passed,
      failed:     problem.testCases.length - passed,
      results,
      allPassed:  passed === problem.testCases.length,
    };
  }

  async runCustomSubmission(dto: CustomSubmissionDto): Promise<SubmissionResult> {
    if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
      throw new BadRequestException(
        `Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`
      );
    }

    const results: TestResult[] = [];

    for (let i = 0; i < dto.testCases.length; i++) {
      const testCase = dto.testCases[i];
      const result = await this.executeRawLocally(
        dto.code,
        dto.language,
        i + 1,
        `Custom Test ${i + 1}`,
        testCase.input,
        testCase.expectedOutput,
      );
      results.push(result);
    }

    const passed = results.filter(r => r.status === 'pass').length;

    return {
      problemId:  'custom',
      language:   dto.language,
      totalTests: dto.testCases.length,
      passed,
      failed:     dto.testCases.length - passed,
      results,
      allPassed:  passed === dto.testCases.length,
    };
  }

  async runChallengeSubmission(dto: ChallengeSubmissionDto): Promise<SubmissionResult> {
    if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
      throw new BadRequestException(
        `Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`
      );
    }

    const challenge = await this.challengesService.getChallengeById(dto.challengeId);
    const results: TestResult[] = [];

    for (let i = 0; i < challenge.testCases.length; i++) {
      const testCase = challenge.testCases[i];
      const wrapperTemplate = challenge.wrapperCode?.[dto.language];
      let result: TestResult;

      if (wrapperTemplate) {
        const fullCode = wrapperTemplate
          .replace('{user_code}', dto.code)
          .replace('{input}', testCase.input);
          
        result = await this.executeLocally(
          fullCode,
          dto.language,
          i + 1,
          `Test Case ${i + 1}`,
          testCase.input,
          testCase.expectedOutput,
        );
      } else {
        result = await this.executeRawLocally(
          dto.code,
          dto.language,
          i + 1,
          `Test Case ${i + 1}`,
          testCase.input,
          testCase.expectedOutput,
        );
      }
      results.push(result);
    }

    const passed = results.filter(r => r.status === 'pass').length;

    return {
      problemId:  dto.challengeId,
      language:   dto.language,
      totalTests: challenge.testCases.length,
      passed,
      failed:     challenge.testCases.length - passed,
      results,
      allPassed:  passed === challenge.testCases.length,
    };
  }

  async runInterviewSubmission(dto: InterviewSubmissionDto): Promise<SubmissionResult> {
    if (!SUPPORTED_LANGUAGES.includes(dto.language)) {
      throw new BadRequestException(
        `Unsupported language "${dto.language}". Use: ${SUPPORTED_LANGUAGES.join(', ')}`
      );
    }

    const interview = await this.interviewsService.getInterviewById(dto.interviewId);
    const question = interview.questions.find(q => q.id === dto.questionId);
    if (!question) {
      throw new BadRequestException(`Question with ID "${dto.questionId}" not found in Interview "${dto.interviewId}".`);
    }

    const results: TestResult[] = [];

    for (let i = 0; i < question.testCases.length; i++) {
      const testCase = question.testCases[i];
      const wrapperTemplate = question.wrapperCode?.[dto.language];
      let result: TestResult;

      if (wrapperTemplate) {
        const fullCode = wrapperTemplate
          .replace('{user_code}', dto.code)
          .replace('{input}', testCase.input);
          
        result = await this.executeLocally(
          fullCode,
          dto.language,
          i + 1,
          `Test Case ${i + 1}`,
          testCase.input,
          testCase.expectedOutput,
        );
      } else {
        result = await this.executeRawLocally(
          dto.code,
          dto.language,
          i + 1,
          `Test Case ${i + 1}`,
          testCase.input,
          testCase.expectedOutput,
        );
      }
      results.push(result);
    }

    const passed = results.filter(r => r.status === 'pass').length;

    return {
      problemId:  dto.questionId,
      language:   dto.language,
      totalTests: question.testCases.length,
      passed,
      failed:     question.testCases.length - passed,
      results,
      allPassed:  passed === question.testCases.length,
    };
  }

  // ===== LOCAL EXECUTION (handles all 4 languages) =====
  private async executeLocally(
    code: string,
    language: SupportedLanguage,
    testCaseNum: number,
    description: string,
    input: string,
    expectedOutput: string,
  ): Promise<TestResult> {

    const tmp = tmpdir();
    const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // ── Python ────────────────────────────────────────────────────────────────
    if (language === 'python') {
      const filePath = join(tmp, `sol_${uid}.py`);
      try {
        await writeFile(filePath, code, 'utf8');
        const { stdout, stderr } = await execAsync(`python "${filePath}"`, { timeout: 5000 });
        if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
        return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
      } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
      finally { await this.safeDelete(filePath); }
    }

    // ── JavaScript ────────────────────────────────────────────────────────────
    if (language === 'javascript') {
      const filePath = join(tmp, `sol_${uid}.js`);
      try {
        await writeFile(filePath, code, 'utf8');
        const { stdout, stderr } = await execAsync(`node "${filePath}"`, { timeout: 5000 });
        if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
        return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
      } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
      finally { await this.safeDelete(filePath); }
    }

    // ── Java ──────────────────────────────────────────────────────────────────
    // Java is special:
    //   1. The filename MUST match the class name → Solution.java
    //   2. First compile:  javac Solution.java   → creates Solution.class
    //   3. Then run:       java  -cp <dir> Solution
    //   4. Clean up both  .java and .class files
    if (language === 'java') {
      const javaDir  = join(tmp, `java_${uid}`);
      const javaFile = join(javaDir, 'Solution.java');
      const classDir = javaDir; // javac outputs .class into same folder

      try {
        // Create a unique temp folder for this submission
        await execAsync(`mkdir "${javaDir}"`);
        await writeFile(javaFile, code, 'utf8');

        // Step 1 — Compile
        const compile = await execAsync(`javac "${javaFile}"`, { timeout: 10000 });
        if (compile.stderr?.trim()) {
          return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
        }

        // Step 2 — Run
        const { stdout, stderr } = await execAsync(
          `java -cp "${classDir}" Solution`, { timeout: 5000 }
        );
        if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
        return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);

      } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
      finally {
        // Clean up the entire temp folder
        await execAsync(`rmdir /s /q "${javaDir}"`).catch(() =>
          execAsync(`rm -rf "${javaDir}"`).catch(() => {})
        );
      }
    }

    // ── C ─────────────────────────────────────────────────────────────────────
    // C is also compiled:
    //   1. Write code to solution.c
    //   2. Compile:  gcc solution.c -o solution_out
    //   3. Run:      ./solution_out  (Mac/Linux) OR solution_out.exe (Windows)
    //   4. Clean up .c and the compiled binary
    if (language === 'c') {
      const cFile  = join(tmp, `sol_${uid}.c`);
      const outFile = join(tmp, `sol_${uid}_out`);

      try {
        await writeFile(cFile, code, 'utf8');

        // Step 1 — Compile with gcc
        const compile = await execAsync(`gcc "${cFile}" -o "${outFile}"`, { timeout: 10000 });
        if (compile.stderr?.trim()) {
          return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
        }

        // Step 2 — Run (Windows uses the file directly, Mac/Linux needs ./)
        const runCmd  = process.platform === 'win32'
          ? `"${outFile}.exe"`
          : `"${outFile}"`;

        const { stdout, stderr } = await execAsync(runCmd, { timeout: 5000 });
        if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
        return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);

      } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
      finally {
        await this.safeDelete(cFile);
        await this.safeDelete(outFile);
        await this.safeDelete(outFile + '.exe');
      }
    }

    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', 'Unknown language');
  }

  // ===== RAW STDIN EXECUTION =====
  private async executeRawLocally(
    code: string,
    language: SupportedLanguage,
    testCaseNum: number,
    description: string,
    input: string,
    expectedOutput: string,
  ): Promise<TestResult> {

    const tmp = tmpdir();
    const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const inputFilePath = join(tmp, `in_${uid}.txt`);

    try {
      await writeFile(inputFilePath, input, 'utf8');

      // ── Python ──
      if (language === 'python') {
        const filePath = join(tmp, `sol_${uid}.py`);
        try {
          await writeFile(filePath, code, 'utf8');
          const { stdout, stderr } = await execAsync(`python "${filePath}" < "${inputFilePath}"`, { timeout: 5000 });
          if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
          return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
        } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
        finally { await this.safeDelete(filePath); }
      }

      // ── JavaScript ──
      if (language === 'javascript') {
        const filePath = join(tmp, `sol_${uid}.js`);
        try {
          await writeFile(filePath, code, 'utf8');
          const { stdout, stderr } = await execAsync(`node "${filePath}" < "${inputFilePath}"`, { timeout: 5000 });
          if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
          return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
        } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
        finally { await this.safeDelete(filePath); }
      }

      // ── Java ──
      if (language === 'java') {
        const javaDir  = join(tmp, `java_${uid}`);
        const javaFile = join(javaDir, 'Solution.java');
        try {
          await execAsync(`mkdir "${javaDir}"`);
          await writeFile(javaFile, code, 'utf8');
          const compile = await execAsync(`javac "${javaFile}"`, { timeout: 10000 });
          if (compile.stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
          
          const { stdout, stderr } = await execAsync(`java -cp "${javaDir}" Solution < "${inputFilePath}"`, { timeout: 5000 });
          if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
          return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
        } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
        finally {
          await execAsync(`rmdir /s /q "${javaDir}"`).catch(() => execAsync(`rm -rf "${javaDir}"`).catch(() => {}));
        }
      }

      // ── C ──
      if (language === 'c') {
        const cFile  = join(tmp, `sol_${uid}.c`);
        const outFile = join(tmp, `sol_${uid}_out`);
        try {
          await writeFile(cFile, code, 'utf8');
          const compile = await execAsync(`gcc "${cFile}" -o "${outFile}"`, { timeout: 10000 });
          if (compile.stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', compile.stderr.trim());
          
          const runCmd  = process.platform === 'win32' ? `"${outFile}.exe"` : `"${outFile}"`;
          const { stdout, stderr } = await execAsync(`${runCmd} < "${inputFilePath}"`, { timeout: 5000 });
          if (stderr?.trim()) return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', stderr.trim());
          return this.compareOutput(testCaseNum, description, input, expectedOutput, stdout);
        } catch (e: any) { return this.handleExecError(e, testCaseNum, description, input, expectedOutput); }
        finally {
          await this.safeDelete(cFile);
          await this.safeDelete(outFile);
          await this.safeDelete(outFile + '.exe');
        }
      }

      return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', 'Unknown language');
    } finally {
      await this.safeDelete(inputFilePath);
    }
  }

  // ===== HELPERS =====

  private compareOutput(testCaseNum: number, description: string, input: string, expectedOutput: string, stdout: string): TestResult {
    const actual   = (stdout || '').trim();
    const passed   = this.normalize(actual) === this.normalize(expectedOutput);
    return this.createResult(testCaseNum, description, input, expectedOutput, passed ? 'pass' : 'fail', actual);
  }

  private handleExecError(error: any, testCaseNum: number, description: string, input: string, expectedOutput: string): TestResult {
    if (error.killed || error.signal === 'SIGTERM') {
      return this.createResult(testCaseNum, description, input, expectedOutput, 'timeout', '', 'Time limit exceeded (5 seconds). Check for infinite loops.');
    }
    const msg = error.stderr?.trim() || error.message || 'Unknown error';
    return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', msg);
  }

  private async safeDelete(path: string) {
    try { await unlink(path); } catch {}
  }

  private normalize(str: string): string {
    return str.trim()
      .replace(/\s*,\s*/g, ',')
      .replace(/\[\s*/g, '[')
      .replace(/\s*\]/g, ']')
      .toLowerCase();
  }

  private createResult(testCase: number, description: string, input: string, expectedOutput: string, status: 'pass' | 'fail' | 'error' | 'timeout', actualOutput: string, errorMessage?: string): TestResult {
    return { testCase, description, status, input, expectedOutput, actualOutput, errorMessage };
  }
}
