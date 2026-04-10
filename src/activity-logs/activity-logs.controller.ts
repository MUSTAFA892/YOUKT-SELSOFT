import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ActivityLogsService, ActivityLog } from './activity-logs.service';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {
    console.log('✅ ActivityLogsController Initialized');
  }

  @Post()
  async createOrUpdate(
    @Body() dto: Omit<ActivityLog, 'id' | 'submittedAt'>,
  ): Promise<ActivityLog> {
    return this.activityLogsService.createOrUpdateLog(dto);
  }

  @Get()
  async getAll(): Promise<ActivityLog[]> {
    return this.activityLogsService.getAllLogs();
  }

  @Get('candidate/:id')
  async getByCandidate(@Param('id') id: string): Promise<ActivityLog[]> {
    return this.activityLogsService.getLogsByCandidate(id);
  }
}
