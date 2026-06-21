import { Controller, Get, Put, Post, Body, Param } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PipelineStage } from './pipeline.service';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  async getAll() {
    return this.pipelineService.getAll();
  }

  @Put(':candidateId/stage')
  async updateStage(
    @Param('candidateId') candidateId: string,
    @Body('stage') stage: PipelineStage,
  ) {
    return this.pipelineService.updateStage(candidateId, stage);
  }

  @Post('bulk-update')
  async bulkUpdateStage(
    @Body('candidateIds') candidateIds: string[],
    @Body('stage') stage: PipelineStage,
  ) {
    return this.pipelineService.bulkUpdateStage(candidateIds, stage);
  }

  @Post('bulk-email')
  async bulkSendEmail(
    @Body('candidateIds') candidateIds: string[],
    @Body('subject') subject: string,
    @Body('body') body: string,
  ) {
    await this.pipelineService.bulkSendEmail(candidateIds, subject, body);
    return { success: true };
  }
}
