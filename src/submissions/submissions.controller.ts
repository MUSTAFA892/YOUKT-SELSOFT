// submissions.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SubmissionsService, SubmissionDto } from './submissions.service';

// POST /api/submissions — Accepts user code and runs it against test cases
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async create(@Body() dto: SubmissionDto) {
    return this.submissionsService.runSubmission(dto);
  }
}
