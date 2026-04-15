import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { CodeReviewService } from '../code-review/code-review.service';
import { PlagiarismDetectionService } from '../plagiarism/plagiarism-detection.service';
import { AdaptiveDifficultyService } from '../adaptive-difficulty/adaptive-difficulty.service';
import { QuestionLibraryService } from '../question-library/question-library.service';

@Controller('advanced-features')
export class AdvancedFeaturesController {
  constructor(
    private codeReviewService: CodeReviewService,
    private plagiarismService: PlagiarismDetectionService,
    private adaptiveService: AdaptiveDifficultyService,
    private questionService: QuestionLibraryService
  ) {}

  // ==================== CODE REVIEW ====================
  @Post('code-review')
  reviewCode(@Body() body: { code: string; language: string }) {
    const review = this.codeReviewService.analyzeCode(body.code, body.language);
    return {
      success: true,
      data: review
    };
  }

  // ==================== PLAGIARISM DETECTION ====================
  @Post('plagiarism/check')
  checkPlagiarism(@Body() body: { 
    code: string; 
    candidateId: string; 
    interviewId: string; 
    problemId: string; 
    submissionId?: string;
    submissionTimeMs?: number;
    pasteDetected?: boolean;
  }) {
    const report = this.plagiarismService.checkPlagiarism(
      body.code, 
      body.candidateId, 
      body.interviewId, 
      body.problemId,
      body.submissionId,
      body.submissionTimeMs,
      body.pasteDetected
    );
    
    // Register the submission for future comparisons
    const submissionId = body.submissionId || `sub_${Date.now()}`;
    this.plagiarismService.registerSubmission(
      submissionId,
      body.code,
      body.candidateId,
      body.interviewId,
      body.problemId
    );

    return {
      success: true,
      data: report
    };
  }

  @Get('plagiarism/report/:submissionId')
  getPlagiarismReport(@Param('submissionId') submissionId: string) {
    const report = this.plagiarismService.getSubmissionReport(submissionId);
    return {
      success: !!report,
      data: report || { error: 'Report not found' }
    };
  }

  // ==================== ADAPTIVE DIFFICULTY ====================
  @Post('adaptive-difficulty/record-attempt')
  recordAttempt(@Body() body: {
    candidateId: string;
    problemDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
    accuracy: number;
    timeTaken: number;
    solved: boolean;
  }) {
    this.adaptiveService.recordProblemAttempt(
      body.candidateId,
      body.problemDifficulty,
      body.accuracy,
      body.timeTaken,
      body.solved
    );

    return {
      success: true,
      message: 'Attempt recorded'
    };
  }

  @Get('adaptive-difficulty/predict/:candidateId/:difficulty')
  getPrediction(
    @Param('candidateId') candidateId: string,
    @Param('difficulty') difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ) {
    const prediction = this.adaptiveService.predictNextDifficulty(candidateId, difficulty);
    return {
      success: true,
      data: prediction
    };
  }

  @Get('adaptive-difficulty/metrics/:candidateId')
  getMetrics(@Param('candidateId') candidateId: string) {
    const metrics = this.adaptiveService.getCandidateMetrics(candidateId);
    return {
      success: true,
      data: metrics
    };
  }

  @Get('adaptive-difficulty/recommendations/:candidateId')
  getRecommendations(
    @Param('candidateId') candidateId: string,
    @Query('difficulty') difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium',
    @Query('language') language: string = 'python',
    @Query('count') count: string = '3'
  ) {
    const recommendations = this.adaptiveService.getRecommendedQuestions(
      candidateId,
      difficulty,
      language,
      parseInt(count)
    );
    return {
      success: true,
      data: recommendations
    };
  }

  // ==================== QUESTION LIBRARY ====================
  @Get('questions/all')
  getAllQuestions() {
    const questions = this.questionService.getAllQuestions();
    return {
      success: true,
      data: questions,
      count: questions.length
    };
  }

  @Get('questions/search')
  searchQuestions(@Query('q') query: string) {
    const results = this.questionService.searchQuestions(query);
    return {
      success: true,
      data: results,
      count: results.length
    };
  }

  @Get('questions/difficulty/:difficulty')
  getByDifficulty(@Param('difficulty') difficulty: 'easy' | 'medium' | 'hard' | 'expert') {
    const questions = this.questionService.getQuestionsByDifficulty(difficulty);
    return {
      success: true,
      data: questions,
      count: questions.length
    };
  }

  @Get('questions/topic/:topic')
  getByTopic(@Param('topic') topic: string) {
    const questions = this.questionService.getQuestionsByTopic(topic);
    return {
      success: true,
      data: questions,
      count: questions.length
    };
  }

  @Get('questions/id/:id')
  getQuestion(@Param('id') id: string) {
    const question = this.questionService.getQuestion(id);
    return {
      success: !!question,
      data: question || { error: 'Question not found' }
    };
  }

  @Get('questions/topics')
  getTopics() {
    const topics = this.questionService.getTopics();
    return {
      success: true,
      data: topics
    };
  }

  @Get('questions/tags')
  getTags() {
    const tags = this.questionService.getTags();
    return {
      success: true,
      data: tags
    };
  }

  @Get('questions/trending')
  getTrendingQuestions(@Query('limit') limit: string = '10') {
    const questions = this.questionService.getTrendingQuestions(parseInt(limit));
    return {
      success: true,
      data: questions,
      count: questions.length
    };
  }

  // ==================== QUESTION PACKS ====================
  @Get('packs/all')
  getAllPacks() {
    const packs = this.questionService.getAllPacks();
    return {
      success: true,
      data: packs,
      count: packs.length
    };
  }

  @Get('packs/free')
  getFreePacks() {
    const packs = this.questionService.getFreePacks();
    return {
      success: true,
      data: packs,
      count: packs.length
    };
  }

  @Get('packs/:id')
  getPack(@Param('id') id: string) {
    const pack = this.questionService.getQuestionPack(id);
    if (!pack) {
      return { success: false, error: 'Pack not found' };
    }

    // Get all questions in the pack
    const questions = pack.questionIds
      .map(qId => this.questionService.getQuestion(qId))
      .filter(q => q !== undefined);

    return {
      success: true,
      data: {
        ...pack,
        questions
      }
    };
  }

  @Post('questions/add-favorite')
  addFavorite(@Body() body: { userId: string; questionId: string }) {
    this.questionService.addToFavorites(body.userId, body.questionId);
    return {
      success: true,
      message: 'Added to favorites'
    };
  }

  @Post('questions/remove-favorite')
  removeFavorite(@Body() body: { userId: string; questionId: string }) {
    this.questionService.removeFromFavorites(body.userId, body.questionId);
    return {
      success: true,
      message: 'Removed from favorites'
    };
  }

  @Get('questions/favorites/:userId')
  getFavorites(@Param('userId') userId: string) {
    const favorites = this.questionService.getFavorites(userId);
    return {
      success: true,
      data: favorites,
      count: favorites.length
    };
  }

  @Get('questions/top-rated')
  getTopQuestions(@Query('limit') limit: string = '10') {
    const questions = this.questionService.getTopQuestions(parseInt(limit));
    return {
      success: true,
      data: questions,
      count: questions.length
    };
  }
}
