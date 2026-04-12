import { Module } from '@nestjs/common';
import { ProblemsModule } from './problems/problems.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ChallengesModule } from './challenges/challenges.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ReportsModule } from './reports/reports.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { TabSwitchModule } from './tab-switch/tab-switch.module';
import { AdvancedFeaturesModule } from './advanced-features/advanced-features.module';
import { HelpCenterModule } from './help-center/help-center.module';

@Module({
  imports: [
    ProblemsModule,
    SubmissionsModule,
    ChallengesModule,
    InterviewsModule,
    ReportsModule,
    ActivityLogsModule,
    TabSwitchModule,
    AdvancedFeaturesModule,
    HelpCenterModule,
  ],
})
export class AppModule {}




