// app.module.ts — The ROOT MODULE of NestJS
// Think of modules like departments in a company.
// AppModule is the "head office" that connects all departments together.

import { Module } from '@nestjs/common';
import { ProblemsModule } from './problems/problems.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ChallengesModule } from './challenges/challenges.module';
import { InterviewsModule } from './interviews/interviews.module';

@Module({
  imports: [
    ProblemsModule,    // Handles everything related to coding problems
    SubmissionsModule, // Handles code submissions and test execution
    ChallengesModule,  // Handles recruiter challenges
    InterviewsModule,  // Handles Multi-Question Interviews
  ],
})
export class AppModule {}
