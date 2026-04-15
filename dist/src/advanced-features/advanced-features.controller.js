"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedFeaturesController = void 0;
const common_1 = require("@nestjs/common");
const code_review_service_1 = require("../code-review/code-review.service");
const plagiarism_detection_service_1 = require("../plagiarism/plagiarism-detection.service");
const adaptive_difficulty_service_1 = require("../adaptive-difficulty/adaptive-difficulty.service");
const question_library_service_1 = require("../question-library/question-library.service");
let AdvancedFeaturesController = class AdvancedFeaturesController {
    constructor(codeReviewService, plagiarismService, adaptiveService, questionService) {
        this.codeReviewService = codeReviewService;
        this.plagiarismService = plagiarismService;
        this.adaptiveService = adaptiveService;
        this.questionService = questionService;
    }
    reviewCode(body) {
        const review = this.codeReviewService.analyzeCode(body.code, body.language);
        return {
            success: true,
            data: review
        };
    }
    checkPlagiarism(body) {
        const report = this.plagiarismService.checkPlagiarism(body.code, body.candidateId, body.interviewId, body.problemId, body.submissionId, body.submissionTimeMs, body.pasteDetected);
        const submissionId = body.submissionId || `sub_${Date.now()}`;
        this.plagiarismService.registerSubmission(submissionId, body.code, body.candidateId, body.interviewId, body.problemId);
        return {
            success: true,
            data: report
        };
    }
    getPlagiarismReport(submissionId) {
        const report = this.plagiarismService.getSubmissionReport(submissionId);
        return {
            success: !!report,
            data: report || { error: 'Report not found' }
        };
    }
    recordAttempt(body) {
        this.adaptiveService.recordProblemAttempt(body.candidateId, body.problemDifficulty, body.accuracy, body.timeTaken, body.solved);
        return {
            success: true,
            message: 'Attempt recorded'
        };
    }
    getPrediction(candidateId, difficulty) {
        const prediction = this.adaptiveService.predictNextDifficulty(candidateId, difficulty);
        return {
            success: true,
            data: prediction
        };
    }
    getMetrics(candidateId) {
        const metrics = this.adaptiveService.getCandidateMetrics(candidateId);
        return {
            success: true,
            data: metrics
        };
    }
    getRecommendations(candidateId, difficulty = 'medium', language = 'python', count = '3') {
        const recommendations = this.adaptiveService.getRecommendedQuestions(candidateId, difficulty, language, parseInt(count));
        return {
            success: true,
            data: recommendations
        };
    }
    getAllQuestions() {
        const questions = this.questionService.getAllQuestions();
        return {
            success: true,
            data: questions,
            count: questions.length
        };
    }
    searchQuestions(query) {
        const results = this.questionService.searchQuestions(query);
        return {
            success: true,
            data: results,
            count: results.length
        };
    }
    getByDifficulty(difficulty) {
        const questions = this.questionService.getQuestionsByDifficulty(difficulty);
        return {
            success: true,
            data: questions,
            count: questions.length
        };
    }
    getByTopic(topic) {
        const questions = this.questionService.getQuestionsByTopic(topic);
        return {
            success: true,
            data: questions,
            count: questions.length
        };
    }
    getQuestion(id) {
        const question = this.questionService.getQuestion(id);
        return {
            success: !!question,
            data: question || { error: 'Question not found' }
        };
    }
    getTopics() {
        const topics = this.questionService.getTopics();
        return {
            success: true,
            data: topics
        };
    }
    getTags() {
        const tags = this.questionService.getTags();
        return {
            success: true,
            data: tags
        };
    }
    getTrendingQuestions(limit = '10') {
        const questions = this.questionService.getTrendingQuestions(parseInt(limit));
        return {
            success: true,
            data: questions,
            count: questions.length
        };
    }
    getAllPacks() {
        const packs = this.questionService.getAllPacks();
        return {
            success: true,
            data: packs,
            count: packs.length
        };
    }
    getFreePacks() {
        const packs = this.questionService.getFreePacks();
        return {
            success: true,
            data: packs,
            count: packs.length
        };
    }
    getPack(id) {
        const pack = this.questionService.getQuestionPack(id);
        if (!pack) {
            return { success: false, error: 'Pack not found' };
        }
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
    addFavorite(body) {
        this.questionService.addToFavorites(body.userId, body.questionId);
        return {
            success: true,
            message: 'Added to favorites'
        };
    }
    removeFavorite(body) {
        this.questionService.removeFromFavorites(body.userId, body.questionId);
        return {
            success: true,
            message: 'Removed from favorites'
        };
    }
    getFavorites(userId) {
        const favorites = this.questionService.getFavorites(userId);
        return {
            success: true,
            data: favorites,
            count: favorites.length
        };
    }
    getTopQuestions(limit = '10') {
        const questions = this.questionService.getTopQuestions(parseInt(limit));
        return {
            success: true,
            data: questions,
            count: questions.length
        };
    }
};
exports.AdvancedFeaturesController = AdvancedFeaturesController;
__decorate([
    (0, common_1.Post)('code-review'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "reviewCode", null);
__decorate([
    (0, common_1.Post)('plagiarism/check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "checkPlagiarism", null);
__decorate([
    (0, common_1.Get)('plagiarism/report/:submissionId'),
    __param(0, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getPlagiarismReport", null);
__decorate([
    (0, common_1.Post)('adaptive-difficulty/record-attempt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "recordAttempt", null);
__decorate([
    (0, common_1.Get)('adaptive-difficulty/predict/:candidateId/:difficulty'),
    __param(0, (0, common_1.Param)('candidateId')),
    __param(1, (0, common_1.Param)('difficulty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getPrediction", null);
__decorate([
    (0, common_1.Get)('adaptive-difficulty/metrics/:candidateId'),
    __param(0, (0, common_1.Param)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('adaptive-difficulty/recommendations/:candidateId'),
    __param(0, (0, common_1.Param)('candidateId')),
    __param(1, (0, common_1.Query)('difficulty')),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('questions/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getAllQuestions", null);
__decorate([
    (0, common_1.Get)('questions/search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "searchQuestions", null);
__decorate([
    (0, common_1.Get)('questions/difficulty/:difficulty'),
    __param(0, (0, common_1.Param)('difficulty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getByDifficulty", null);
__decorate([
    (0, common_1.Get)('questions/topic/:topic'),
    __param(0, (0, common_1.Param)('topic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getByTopic", null);
__decorate([
    (0, common_1.Get)('questions/id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getQuestion", null);
__decorate([
    (0, common_1.Get)('questions/topics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getTopics", null);
__decorate([
    (0, common_1.Get)('questions/tags'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)('questions/trending'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getTrendingQuestions", null);
__decorate([
    (0, common_1.Get)('packs/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getAllPacks", null);
__decorate([
    (0, common_1.Get)('packs/free'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getFreePacks", null);
__decorate([
    (0, common_1.Get)('packs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getPack", null);
__decorate([
    (0, common_1.Post)('questions/add-favorite'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.Post)('questions/remove-favorite'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.Get)('questions/favorites/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Get)('questions/top-rated'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedFeaturesController.prototype, "getTopQuestions", null);
exports.AdvancedFeaturesController = AdvancedFeaturesController = __decorate([
    (0, common_1.Controller)('advanced-features'),
    __metadata("design:paramtypes", [code_review_service_1.CodeReviewService,
        plagiarism_detection_service_1.PlagiarismDetectionService,
        adaptive_difficulty_service_1.AdaptiveDifficultyService,
        question_library_service_1.QuestionLibraryService])
], AdvancedFeaturesController);
//# sourceMappingURL=advanced-features.controller.js.map