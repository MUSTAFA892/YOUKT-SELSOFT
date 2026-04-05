// submissions.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SubmissionsService, SubmissionDto, CustomSubmissionDto, ChallengeSubmissionDto, InterviewSubmissionDto } from './submissions.service';

// POST /api/submissions — Accepts user code and runs it against test cases
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async create(@Body() dto: SubmissionDto) {
    return this.submissionsService.runSubmission(dto);
  }

  @Post('custom')
  async createCustom(@Body() dto: CustomSubmissionDto) {
    return this.submissionsService.runCustomSubmission(dto);
  }

  @Post('challenge')
  async createChallenge(@Body() dto: ChallengeSubmissionDto) {
    return this.submissionsService.runChallengeSubmission(dto);
  }

  @Post('interview')
  async createInterview(@Body() dto: InterviewSubmissionDto) {
    return this.submissionsService.runInterviewSubmission(dto);
  }
}
