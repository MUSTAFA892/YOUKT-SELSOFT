// submissions.module.ts
import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { ProblemsModule } from '../problems/problems.module';
import { ChallengesModule } from '../challenges/challenges.module';
import { InterviewsModule } from '../interviews/interviews.module';

@Module({
  imports: [ProblemsModule, ChallengesModule, InterviewsModule],  // Import ProblemsModule and ChallengesModule
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
