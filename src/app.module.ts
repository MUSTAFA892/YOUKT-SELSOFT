import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProblemsModule } from './problems/problems.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ChallengesModule } from './challenges/challenges.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ReportsModule } from './reports/reports.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { TabSwitchModule } from './tab-switch/tab-switch.module';
import { AdvancedFeaturesModule } from './advanced-features/advanced-features.module';
import { HelpCenterModule } from './help-center/help-center.module';
import { PlagiarismModule } from './plagiarism/plagiarism.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProblemsModule,
    SubmissionsModule,
    ChallengesModule,
    InterviewsModule,
    ReportsModule,
    ActivityLogsModule,
    TabSwitchModule,
    AdvancedFeaturesModule,
    HelpCenterModule,
    PlagiarismModule,
    PipelineModule,
  ],
})
export class AppModule {}
