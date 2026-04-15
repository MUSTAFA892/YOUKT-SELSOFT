import { Controller, Post, Body } from '@nestjs/common';
import { PlagiarismDetectionService } from './plagiarism-detection.service';

interface CheckPlagiarismDto {
  code: string;
  candidateId: string;
  interviewId: string;
  problemId: string;
  submissionId?: string;
  submissionTimeMs?: number; // milliseconds since the problem was opened
  pasteDetected?: boolean;
}

@Controller('plagiarism')
export class PlagiarismController {
  constructor(private readonly plagiarismService: PlagiarismDetectionService) {}

  @Post('check')
  check(@Body() dto: CheckPlagiarismDto) {
    const submissionId = dto.submissionId || `sub_${Date.now()}`;

    this.plagiarismService.registerSubmission(
      submissionId,
      dto.code,
      dto.candidateId,
      dto.interviewId,
      dto.problemId,
    );

    const report = this.plagiarismService.checkPlagiarism(
      dto.code,
      dto.candidateId,
      dto.interviewId,
      dto.problemId,
      submissionId,
      dto.submissionTimeMs,
      dto.pasteDetected,
    );

    return { success: true, data: report };
  }
}