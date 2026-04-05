import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChallengesService, CodeTemplates } from './challenges.service';
import { CustomTestCase } from '../submissions/submissions.service';

interface CreateChallengeDto {
  title: string;
  description: string;
  testCases: CustomTestCase[];
  starterCode?: CodeTemplates;
  wrapperCode?: CodeTemplates;
}

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  async create(@Body() dto: CreateChallengeDto) {
    return this.challengesService.createChallenge(dto.title, dto.description, dto.testCases, dto.starterCode, dto.wrapperCode);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.challengesService.getChallengeById(id);
  }
}
