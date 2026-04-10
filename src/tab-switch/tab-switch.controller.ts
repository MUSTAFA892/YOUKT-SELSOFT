import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TabSwitchService, TabSwitchIncident } from './tab-switch.service';

@Controller('tab-switch')
export class TabSwitchController {
  constructor(private readonly tabSwitchService: TabSwitchService) {
    console.log('✅ TabSwitchController Initialized');
  }

  @Post('report')
  async reportTabSwitch(
    @Body()
    dto: {
      candidateId: string;
      candidateName: string;
      problemId: string;
      problemTitle: string;
      switchCount: number;
    },
  ): Promise<TabSwitchIncident> {
    return this.tabSwitchService.reportTabSwitch(dto);
  }

  @Get()
  async getAllIncidents(): Promise<TabSwitchIncident[]> {
    return this.tabSwitchService.getAllIncidents();
  }

  @Get('candidate/:id')
  async getByCandidate(@Param('id') id: string): Promise<TabSwitchIncident[]> {
    return this.tabSwitchService.getIncidentsByCandidate(id);
  }

  @Get('problem/:id')
  async getByProblem(@Param('id') id: string): Promise<TabSwitchIncident[]> {
    return this.tabSwitchService.getIncidentsByProblem(id);
  }

  @Get('terminated')
  async getTerminatedSessions(): Promise<TabSwitchIncident[]> {
    return this.tabSwitchService.getTerminatedSessions();
  }
}
