// problem-session.service.ts — Tracks problem sessions and manages test case generation

import { Injectable } from '@nestjs/common';
import { TestCaseGenerator } from './test-case-generator';
import { TestCase } from './problems.service';

export interface ProblemSession {
  id: string;
  problemId: string;
  candidateId: string;
  startedAt: Date;
  seed: number; // Used for dynamic test case generation
  visibleTestCases: TestCase[]; // Examples shown to user (usually 2-3)
  hiddenTestCases: TestCase[]; // Hidden cases used for validation
  allTestCases: TestCase[]; // Complete set for validation
}

@Injectable()
export class ProblemSessionService {
  private sessions: Map<string, ProblemSession> = new Map();

  /**
   * Create a new problem session with dynamic test cases
   * This ensures each attempt has different test cases
   */
  createSession(problemId: string, candidateId: string, generatorType: any): ProblemSession {
    const sessionId = `${candidateId}-${problemId}-${Date.now()}`;
    const seed = this.generateSeed();

    // Generate all test cases
    const allTestCases = TestCaseGenerator.generateTestCases({
      type: generatorType,
      seed
    });

    // Split into visible (examples) and hidden (validation only)
    const visibleCount = Math.max(2, Math.min(3, Math.ceil(allTestCases.length / 2)));
    const visibleTestCases = allTestCases.slice(0, visibleCount);
    const hiddenTestCases = allTestCases.slice(visibleCount);

    const session: ProblemSession = {
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

  /**
   * Get session - if found, return it; otherwise create one
   */
  getOrCreateSession(
    problemId: string,
    candidateId: string,
    generatorType: any,
    sessionId?: string
  ): ProblemSession {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    return this.createSession(problemId, candidateId, generatorType);
  }

  /**
   * Get all test cases for validation (includes hidden ones)
   * Only called during submission validation, not sent to frontend
   */
  getValidationTestCases(sessionId: string): TestCase[] {
    const session = this.sessions.get(sessionId);
    return session ? session.allTestCases : [];
  }

  /**
   * Get visible test cases only (sent to frontend)
   */
  getVisibleTestCases(sessionId: string): TestCase[] {
    const session = this.sessions.get(sessionId);
    return session ? session.visibleTestCases : [];
  }

  /**
   * Clean up old sessions (older than 1 hour)
   */
  cleanupOldSessions(): void {
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startedAt.getTime() > oneHourMs) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private generateSeed(): number {
    // Generate arbitrary seed based on current time and randomness
    return Math.floor(Math.random() * 1000000) + Math.floor(Date.now() / 1000);
  }
}
