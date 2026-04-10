// problems.module.ts — The MODULE that bundles Problems feature together
// A Module is like a folder that groups related Controller + Service together
// and tells NestJS: "these belong together and work as a unit"

import { Module } from '@nestjs/common';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { ProblemSessionService } from './problem-session.service';

@Module({
  controllers: [ProblemsController], // Handle HTTP requests
  providers: [ProblemsService, ProblemSessionService], // Business logic
  exports: [ProblemsService, ProblemSessionService], // Export so SubmissionsModule can use it
})
export class ProblemsModule {}
