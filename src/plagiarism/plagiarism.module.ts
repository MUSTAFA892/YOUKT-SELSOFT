import { Module } from '@nestjs/common';
import { PlagiarismController } from './plagiarism.controller';
import { PlagiarismDetectionService } from './plagiarism-detection.service';

@Module({
  controllers: [PlagiarismController],
  providers: [PlagiarismDetectionService],
  exports: [PlagiarismDetectionService],
})
export class PlagiarismModule {}
