import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { CustomTestCase } from '../submissions/submissions.service';

export interface CodeTemplates {
  python?: string;
  javascript?: string;
  java?: string;
  c?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  inputFormat: string;
  outputFormat: string;
  examples: any[];
  testCases: CustomTestCase[];
  starterCode?: CodeTemplates;
  wrapperCode?: CodeTemplates;
}

export interface QuestionPerformance {
  questionId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  passed: boolean;
  timeMs: number;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  questions: Question[]; // This will now act as the "current/visible" question(s)
  history: QuestionPerformance[];
  completedCount: number;
  currentQuestionStartedAt: string | null;
  createdAt: string;
  isComplete: boolean;
}

import { ProblemsService } from '../problems/problems.service';

@Injectable()
export class InterviewsService {
  private readonly dbFilePath = join(process.cwd(), 'interviews.json');
  private interviews: Interview[] = [];

  constructor(private readonly problemsService: ProblemsService) {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    try {
      const data = await fs.readFile(this.dbFilePath, 'utf-8');
      this.interviews = JSON.parse(data);
    } catch (e) {
      this.interviews = [];
    }
  }

  private async saveToDisk() {
    try {
      await fs.writeFile(this.dbFilePath, JSON.stringify(this.interviews, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save interviews database:', e);
    }
  }

  async createInterview(
    candidateId: string,
    candidateName: string,
    questions: Omit<Question, 'id'>[]
  ): Promise<Interview> {
    const enrichedQuestions = questions.map(q => {
      const p = this.problemsService.findAllWithTestCases().find(ap => ap.title === q.title);
      return {
        ...q,
        id: crypto.randomUUID(),
        difficulty: p?.difficulty || 'Easy',
        timeLimit: p?.timeLimit || 300,
        inputFormat: p?.inputFormat || '',
        outputFormat: p?.outputFormat || '',
        examples: p?.examples || [],
      } as Question;
    });

    const newInterview: Interview = {
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

  async getInterviewById(id: string): Promise<Interview> {
    await this.loadFromDisk();
    const interview = this.interviews.find(c => c.id === id);
    if (!interview) {
      throw new NotFoundException(`Interview with ID "${id}" not found.`);
    }
    
    // Set start time if it's the first time this question is being seen
    if (!interview.isComplete && interview.questions.length > 0 && !interview.currentQuestionStartedAt) {
      interview.currentQuestionStartedAt = new Date().toISOString();
      await this.saveToDisk();
    }
    
    return interview;
  }

  async getInterviewsByCandidate(candidateId: string): Promise<Interview[]> {
    await this.loadFromDisk();
    return this.interviews.filter(c => c.candidateId === candidateId);
  }

  async getAllInterviews(): Promise<Interview[]> {
    await this.loadFromDisk();
    return this.interviews;
  }

  async processQuestionResult(
    interviewId: string,
    questionId: string,
    passed: boolean,
    timeMs: number
  ): Promise<Interview> {
    const interview = await this.getInterviewById(interviewId);
    if (interview.isComplete) return interview;

    const question = interview.questions.find(q => q.id === questionId);
    if (!question) throw new NotFoundException('Question not found');

    // Locate problem source for metadata
    const allProblems = this.problemsService.findAllWithTestCases();
    const problem = allProblems.find(p => p.title === question.title || p.id === question.id);
    const difficulty = (problem?.difficulty || (question as any).difficulty || 'Easy') as 'Easy' | 'Medium' | 'Hard';

    // Record history
    interview.history.push({ 
      questionId, 
      difficulty, 
      passed, 
      timeMs: Math.round(timeMs) 
    });
    interview.completedCount++;

    if (interview.completedCount >= 10) {
      interview.isComplete = true;
    } else {
      // Determine next difficulty
      let nextDiff: 'Easy' | 'Medium' | 'Hard' = difficulty;
      
      if (passed) {
        if (difficulty === 'Easy') nextDiff = 'Medium';
        else if (difficulty === 'Medium' && timeMs < 500) nextDiff = 'Hard'; // Efficient Medium -> Hard
      } else {
        if (difficulty === 'Hard') nextDiff = 'Medium';
        else if (difficulty === 'Medium') nextDiff = 'Easy';
      }

      // Pick a random problem of nextDiff that hasn't been seen
      const seenIds = interview.history.map(h => {
        const p = allProblems.find(ap => ap.id === h.questionId || ap.title === h.questionId); // fuzzy
        return p?.id;
      });
      
      const pool = allProblems.filter(p => p.difficulty === nextDiff && !seenIds.includes(p.id));
      const nextProblem = pool.length > 0 
        ? pool[Math.floor(Math.random() * pool.length)]
        : allProblems.filter(p => !seenIds.includes(p.id))[0]; // fallback to any unseen

      if (nextProblem) {
        const newQ: Question = {
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
        // In dynamic mode, we replace or append? User wants "take to next sum".
        // Let's replace the current list or maintain it. Frontend expects interview.questions.
        interview.questions = [newQ];
        interview.currentQuestionStartedAt = null; // Will be set on first fetch of this new question
      } else {
        interview.isComplete = true;
      }
    }

    await this.saveToDisk();
    return interview;
  }
}
