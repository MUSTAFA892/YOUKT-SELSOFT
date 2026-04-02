// submissions.service.ts — The HEART of the platform
// This is where user code actually gets EXECUTED and TESTED.
// Flow: Receive code → Wrap with test runner → Send to Judge0 → Compare output

import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { ProblemsService } from '../problems/problems.service';

// --- TYPE DEFINITIONS ---

export interface SubmissionDto {
  problemId: string;
  language: 'python' | 'javascript';
  code: string;
}

export interface TestResult {
  testCase: number;       // Which test case (1, 2, 3...)
  description: string;    // Human-readable label
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

// Judge0 language IDs — these are fixed codes the Judge0 API uses
// Full list: https://ce.judge0.com/languages
const LANGUAGE_IDS = {
  python: 71,      // Python 3
  javascript: 63,  // Node.js
};

// Judge0 status codes returned after execution
// Full list: https://ce.judge0.com/statuses
const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,          // Code ran successfully
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

@Injectable()
export class SubmissionsService {
  
  // Inject ProblemsService so we can fetch problem data + test cases
  constructor(private readonly problemsService: ProblemsService) {}

  // ===== MAIN METHOD: Run submission against all test cases =====
  async runSubmission(dto: SubmissionDto): Promise<SubmissionResult> {
    // 1. Fetch the full problem including test cases (internal use only)
    const problem = this.problemsService.findOneWithTestCases(dto.problemId);
    
    // 2. Validate the language
    if (!['python', 'javascript'].includes(dto.language)) {
      throw new BadRequestException('Unsupported language. Use "python" or "javascript"');
    }

    // 3. Get the wrapper code template for this language
    const wrapperTemplate = problem.wrapperCode[dto.language];

    // 4. Run each test case one by one
    const results: TestResult[] = [];
    
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      
      // Build the full code to execute:
      // Replace {user_code} with the actual user code
      // Replace {input} with the actual test case input
      const fullCode = wrapperTemplate
        .replace('{user_code}', dto.code)
        .replace('{input}', testCase.input);

      // Execute the code via Judge0 and get result
      const result = await this.executeCode(
        fullCode,
        dto.language,
        i + 1,
        testCase.description,
        testCase.input,
        testCase.expectedOutput,
      );

      results.push(result);
    }

    // 5. Count how many passed
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

  // ===== HELPER: Execute a single code submission via Judge0 API =====
  private async executeCode(
    code: string,
    language: 'python' | 'javascript',
    testCaseNum: number,
    description: string,
    input: string,
    expectedOutput: string,
  ): Promise<TestResult> {
    
    // Get the Judge0 API key from environment variables
    // Never hardcode API keys in source code!
    const apiKey = process.env.JUDGE0_API_KEY;
    const apiHost = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

    if (!apiKey) {
      throw new Error('JUDGE0_API_KEY environment variable is not set');
    }

    try {
      // STEP 1: Submit the code to Judge0 (creates a submission, returns a token)
      const submitResponse = await axios.post(
        `https://${apiHost}/submissions`,
        {
          source_code: Buffer.from(code).toString('base64'), // Encode to Base64
          language_id: LANGUAGE_IDS[language],
          stdin: '',        // We pass input via code, not stdin
          base64_encoded: true,
          wait: false,      // Don't wait — we'll poll for results
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost,
          },
        },
      );

      const token = submitResponse.data.token; // Unique ID for this submission

      // STEP 2: Poll for results (Judge0 runs code asynchronously)
      let judgingResult = null;
      let attempts = 0;
      const maxAttempts = 10; // Try up to 10 times

      while (attempts < maxAttempts) {
        await this.sleep(1000); // Wait 1 second between polls

        const resultResponse = await axios.get(
          `https://${apiHost}/submissions/${token}`,
          {
            params: { base64_encoded: true, fields: 'stdout,stderr,status,compile_output' },
            headers: {
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': apiHost,
            },
          },
        );

        const statusId = resultResponse.data.status?.id;

        // If still processing, continue polling
        if (statusId === JUDGE0_STATUS.IN_QUEUE || statusId === JUDGE0_STATUS.PROCESSING) {
          attempts++;
          continue;
        }

        // Otherwise, we have a final result
        judgingResult = resultResponse.data;
        break;
      }

      if (!judgingResult) {
        return this.createResult(testCaseNum, description, input, expectedOutput, 'timeout', '', 'Execution timed out');
      }

      const statusId = judgingResult.status?.id;

      // STEP 3: Handle different status codes
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

      // STEP 4: Compare actual output with expected output
      const rawOutput = judgingResult.stdout
        ? Buffer.from(judgingResult.stdout, 'base64').toString()
        : '';
      
      const actualOutput = rawOutput.trim();
      const normalizedActual = this.normalize(actualOutput);
      const normalizedExpected = this.normalize(expectedOutput);

      const passed = normalizedActual === normalizedExpected;

      return this.createResult(
        testCaseNum,
        description,
        input,
        expectedOutput,
        passed ? 'pass' : 'fail',
        actualOutput,
      );

    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Unknown error';
      return this.createResult(testCaseNum, description, input, expectedOutput, 'error', '', msg);
    }
  }

  // ===== UTILITY: Normalize output for comparison =====
  // Removes spaces inside arrays so "[0, 1]" === "[0,1]"
  private normalize(str: string): string {
    return str
      .trim()
      .replace(/\s*,\s*/g, ',')  // Remove spaces around commas
      .replace(/\[\s*/g, '[')    // Remove spaces after [
      .replace(/\s*\]/g, ']')    // Remove spaces before ]
      .toLowerCase();
  }

  // ===== UTILITY: Create a TestResult object =====
  private createResult(
    testCase: number,
    description: string,
    input: string,
    expectedOutput: string,
    status: 'pass' | 'fail' | 'error' | 'timeout',
    actualOutput: string,
    errorMessage?: string,
  ): TestResult {
    return { testCase, description, status, input, expectedOutput, actualOutput, errorMessage };
  }

  // ===== UTILITY: Promise-based sleep (wait N milliseconds) =====
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
