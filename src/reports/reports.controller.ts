import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReportsService, AssessmentReport, QuestionReport } from './reports.service';

interface CreateReportDto {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  totalQuestions: number;
  questionsAttempted: number;
  totalTestsPassed: number;
  totalTestsAvailable: number;
  scorePercent: number;
  questions: QuestionReport[];
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() dto: CreateReportDto): Promise<AssessmentReport> {
    return this.reportsService.createReport(dto);
  }

  @Get()
  async getAll(): Promise<AssessmentReport[]> {
    return this.reportsService.getAllReports();
  }

  @Get('interview/:interviewId')
  async getByInterview(@Param('interviewId') interviewId: string) {
    return this.reportsService.getReportsByInterview(interviewId);
  }
}
