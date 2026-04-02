// submissions.module.ts
import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { ProblemsModule } from '../problems/problems.module';

@Module({
  imports: [ProblemsModule],  // Import ProblemsModule so we can use ProblemsService
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
