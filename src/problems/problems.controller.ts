// problems.controller.ts — The RECEPTIONIST of the Problems feature
// A "Controller" handles incoming HTTP requests and returns responses.
// It delegates actual work to the Service.

import { Controller, Get, Param } from '@nestjs/common';
import { ProblemsService } from './problems.service';

// @Controller('problems') means all routes in this class start with /problems
// Combined with the global prefix, routes are: /api/problems
@Controller('problems')
export class ProblemsController {
  
  // Dependency Injection: NestJS automatically creates and injects ProblemsService
  constructor(private readonly problemsService: ProblemsService) {}

  // GET /api/problems — Returns the list of all problems
  @Get()
  findAll() {
    return this.problemsService.findAll();
  }

  // GET /api/problems/:id — Returns a single problem by its ID
  // @Param('id') extracts the :id value from the URL
  // Example: GET /api/problems/1 → id = '1'
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.problemsService.findOne(id);
  }
}
