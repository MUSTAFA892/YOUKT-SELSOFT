import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { InterviewsService, Question } from './interviews.service';

interface CreateInterviewDto {
  candidateId: string;
  candidateName: string;
  questions: Omit<Question, 'id'>[];
  recruiterId?: string;
  recruiterName?: string;
}

interface NextQuestionDto {
  questionId: string;
  passed: boolean;
  timeMs: number;
}

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  async create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.createInterview(
      dto.candidateId, 
      dto.candidateName, 
      dto.questions,
      dto.recruiterId,
      dto.recruiterName
    );
  }

  @Get()
  async getAll() {
    return this.interviewsService.getAllInterviews();
  }

  @Get('candidate/:id')
  async getByCandidate(@Param('id') candidateId: string) {
    return this.interviewsService.getInterviewsByCandidate(candidateId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.interviewsService.getInterviewById(id);
  }

  @Post(':id/next')
  async getNextQuestion(@Param('id') id: string, @Body() dto: NextQuestionDto) {
    return this.interviewsService.processQuestionResult(id, dto.questionId, dto.passed, dto.timeMs);
  }

  @Post('generate-templates')
  async generateTemplates(@Body() dto: { title: string; description: string; inputFormat: string; outputFormat: string }) {
    return this.interviewsService.generateTemplatesWithAI(dto.title, dto.description, dto.inputFormat, dto.outputFormat);
  }
}
