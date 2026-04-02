// app.module.ts — The ROOT MODULE of NestJS
// Think of modules like departments in a company.
// AppModule is the "head office" that connects all departments together.

import { Module } from '@nestjs/common';
import { ProblemsModule } from './problems/problems.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [
    ProblemsModule,    // Handles everything related to coding problems
    SubmissionsModule, // Handles code submissions and test execution
  ],
})
export class AppModule {}
