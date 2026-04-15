import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CandidateAnalysisService } from './candidate-analysis.service';
import { ProblemsModule } from '../problems/problems.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [ProblemsModule, ActivityLogsModule],
  providers: [ReportsService, CandidateAnalysisService],
  controllers: [ReportsController],
  exports: [ReportsService, CandidateAnalysisService],
})
export class ReportsModule {}
