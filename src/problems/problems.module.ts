// problems.module.ts — The MODULE that bundles Problems feature together
// A Module is like a folder that groups related Controller + Service together
// and tells NestJS: "these belong together and work as a unit"

import { Module } from '@nestjs/common';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

@Module({
  controllers: [ProblemsController], // Handle HTTP requests
  providers: [ProblemsService],      // Business logic
  exports: [ProblemsService],        // Export so SubmissionsModule can use it too
})
export class ProblemsModule {}
