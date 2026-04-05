import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { InterviewsService, Question } from './interviews.service';

interface CreateInterviewDto {
  candidateId: string;
  candidateName: string;
  questions: Omit<Question, 'id'>[];
}

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  async create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.createInterview(dto.candidateId, dto.candidateName, dto.questions);
  }

  @Get('candidate/:id')
  async getByCandidate(@Param('id') candidateId: string) {
    return this.interviewsService.getInterviewsByCandidate(candidateId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.interviewsService.getInterviewById(id);
  }
}
