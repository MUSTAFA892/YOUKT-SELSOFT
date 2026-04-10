import { Module } from '@nestjs/common';
import { AdvancedFeaturesController } from './advanced-features.controller';
import { CodeReviewService } from '../code-review/code-review.service';
import { PlagiarismDetectionService } from '../plagiarism/plagiarism-detection.service';
import { AdaptiveDifficultyService } from '../adaptive-difficulty/adaptive-difficulty.service';
import { QuestionLibraryService } from '../question-library/question-library.service';

@Module({
  controllers: [AdvancedFeaturesController],
  providers: [
    CodeReviewService,
    PlagiarismDetectionService,
    AdaptiveDifficultyService,
    QuestionLibraryService
  ],
  exports: [
    CodeReviewService,
    PlagiarismDetectionService,
    AdaptiveDifficultyService,
    QuestionLibraryService
  ]
})
export class AdvancedFeaturesModule {}
