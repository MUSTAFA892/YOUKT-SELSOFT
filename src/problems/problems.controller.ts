// problems.controller.ts — The RECEPTIONIST of the Problems feature
// A "Controller" handles incoming HTTP requests and returns responses.
// It delegates actual work to the Service.

import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemSessionService } from './problem-session.service';

// Mapping problem IDs to test case generator types
const GENERATOR_TYPE_MAP: Record<string, any> = {
  '1': 'two-sum',
  '2': 'reverse-string',
  '3': 'fizzbuzz',
  '4': 'palindrome',
  '5': 'fibonacci',
  '6': 'find-max',
  '7': 'longest-substring',
  '8': 'group-anagrams',
  '9': 'median',
  '10': 'merge-lists',
};

// @Controller('problems') means all routes in this class start with /problems
// Combined with the global prefix, routes are: /api/problems
@Controller('problems')
export class ProblemsController {
  
  // Dependency Injection
  constructor(
    private readonly problemsService: ProblemsService,
    private readonly sessionService: ProblemSessionService
  ) {}

  // GET /api/problems — Returns the list of all problems
  @Get()
  findAll() {
    return this.problemsService.findAll();
  }

  // GET /api/problems/:id?candidateId=X — Returns a single problem with dynamic test cases
  // ?candidateId ensures each candidate gets different test cases
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('candidateId') candidateId?: string
  ) {
    const problem = this.problemsService.findOne(id);
    
    // Generate or retrieve session for this candidate + problem combination
    if (candidateId) {
      const generatorType = GENERATOR_TYPE_MAP[id];
      const session = this.sessionService.createSession(id, candidateId, generatorType);
      
      // Return problem with:
      // - Only visible test case examples (not hidden ones)
      // - Session ID for tracking
      // - Clear indication these are examples only
      return {
        ...problem,
        examples: problem.examples, // Keep original examples
        testCasesPreview: session.visibleTestCases, // Only show 2-3 visible cases
        sessionId: session.id, // Track this session for submission
        _note: 'Additional hidden test cases will be used during validation'
      };
    }

    return problem;
  }

  // POST /api/problems/:id/next — Returns the next problem based on performance
  @Post(':id/next')
  getNextProblem(
    @Param('id') id: string,
    @Body() performanceMetrics: {
      allPassed: boolean;
      passed: number;
      totalTests: number;
      timeSpentSeconds: number;
      forceEasier?: boolean;
    }
  ) {
    return this.problemsService.getNextProblem(id, performanceMetrics);
  }
}
