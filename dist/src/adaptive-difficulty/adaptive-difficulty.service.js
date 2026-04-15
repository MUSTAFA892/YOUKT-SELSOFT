"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveDifficultyService = void 0;
const common_1 = require("@nestjs/common");
let AdaptiveDifficultyService = class AdaptiveDifficultyService {
    constructor() {
        this.candidateMetrics = new Map();
        this.questionDifficultyCaches = new Map();
        this.sampleQuestions = [
            { id: 'q1', title: 'Two Sum', difficulty: 'easy', timeEstimate: 15, successRate: 0.85, language: 'all', topic: 'array' },
            { id: 'q2', title: 'Reverse String', difficulty: 'easy', timeEstimate: 10, successRate: 0.90, language: 'all', topic: 'string' },
            { id: 'q3', title: 'Valid Parentheses', difficulty: 'medium', timeEstimate: 20, successRate: 0.70, language: 'all', topic: 'stack' },
            { id: 'q4', title: 'Merge Intervals', difficulty: 'medium', timeEstimate: 30, successRate: 0.60, language: 'all', topic: 'array' },
            { id: 'q5', title: 'LRU Cache', difficulty: 'hard', timeEstimate: 45, successRate: 0.40, language: 'all', topic: 'design' },
            { id: 'q6', title: 'Median of Two Sorted Arrays', difficulty: 'hard', timeEstimate: 50, successRate: 0.35, language: 'all', topic: 'binary-search' },
            { id: 'q7', title: 'N-Queens Problem', difficulty: 'expert', timeEstimate: 60, successRate: 0.15, language: 'all', topic: 'backtracking' },
            { id: 'q8', title: 'Regular Expression Matching', difficulty: 'expert', timeEstimate: 70, successRate: 0.10, language: 'all', topic: 'dp' }
        ];
    }
    recordProblemAttempt(candidateId, problemDifficulty, accuracy, timeTaken, solved) {
        let metrics = this.candidateMetrics.get(candidateId);
        if (!metrics) {
            metrics = {
                problemsSolved: 0,
                problemsAttempted: 0,
                averageAccuracy: 0,
                averageTime: 0,
                successRate: 0
            };
        }
        metrics.problemsAttempted++;
        if (solved) {
            metrics.problemsSolved++;
        }
        metrics.averageAccuracy = (metrics.averageAccuracy * (metrics.problemsAttempted - 1) + accuracy) / metrics.problemsAttempted;
        metrics.averageTime = (metrics.averageTime * (metrics.problemsAttempted - 1) + timeTaken) / metrics.problemsAttempted;
        metrics.successRate = metrics.problemsSolved / metrics.problemsAttempted;
        this.candidateMetrics.set(candidateId, metrics);
    }
    predictNextDifficulty(candidateId, currentDifficulty) {
        const metrics = this.candidateMetrics.get(candidateId);
        if (!metrics || metrics.problemsAttempted < 1) {
            return this.getDefaultPrediction(currentDifficulty);
        }
        const accuracyThreshold = 0.75;
        const speedFactor = 1.0 - (metrics.averageTime / 60);
        const successThreshold = 0.6;
        let recommendedDifficulty = currentDifficulty;
        let reasoning = '';
        let confidenceScore = 0;
        if (metrics.successRate > successThreshold && metrics.averageAccuracy > accuracyThreshold) {
            recommendedDifficulty = this.increaseDifficulty(currentDifficulty);
            reasoning = `Strong performance (${Math.round(metrics.successRate * 100)}% success rate, ${Math.round(metrics.averageAccuracy)}% accuracy). Ready for harder challenges.`;
            confidenceScore = Math.min(0.95, metrics.successRate);
        }
        else if (metrics.successRate < (successThreshold - 0.2) || metrics.averageAccuracy < (accuracyThreshold - 0.15)) {
            recommendedDifficulty = this.decreaseDifficulty(currentDifficulty);
            reasoning = `Struggling with current difficulty (${Math.round(metrics.successRate * 100)}% success rate). Try easier problems to build fundamentals.`;
            confidenceScore = Math.min(0.95, 1 - metrics.successRate);
        }
        else {
            reasoning = `Performing well at current level. Keep practicing "${currentDifficulty}" problems.`;
            confidenceScore = 0.7;
        }
        return {
            currentDifficulty,
            recommendedNextDifficulty: recommendedDifficulty,
            confidenceScore,
            reasoning,
            metrics
        };
    }
    increaseDifficulty(current) {
        const progression = { easy: 'medium', medium: 'hard', hard: 'expert', expert: 'expert' };
        return progression[current];
    }
    decreaseDifficulty(current) {
        const progression = { easy: 'easy', medium: 'easy', hard: 'medium', expert: 'hard' };
        return progression[current];
    }
    getDefaultPrediction(currentDifficulty) {
        return {
            currentDifficulty,
            recommendedNextDifficulty: currentDifficulty,
            confidenceScore: 0.5,
            reasoning: 'Not enough data. Complete more problems for recommendations.',
            metrics: {
                problemsSolved: 0,
                problemsAttempted: 0,
                averageAccuracy: 0,
                averageTime: 0,
                successRate: 0
            }
        };
    }
    getRecommendedQuestions(candidateId, difficulty, language, count = 3) {
        const metrics = this.candidateMetrics.get(candidateId);
        const filtered = this.sampleQuestions.filter(q => q.difficulty === difficulty &&
            (q.language === 'all' || q.language === language));
        if (filtered.length < count) {
            const expanded = this.sampleQuestions.filter(q => q.language === 'all' || q.language === language);
            return expanded.slice(0, count);
        }
        return filtered
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, count);
    }
    getCandidateMetrics(candidateId) {
        return this.candidateMetrics.get(candidateId) || {
            problemsSolved: 0,
            problemsAttempted: 0,
            averageAccuracy: 0,
            averageTime: 0,
            successRate: 0
        };
    }
    getAllQuestions() {
        return this.sampleQuestions;
    }
    getQuestionsByDifficulty(difficulty) {
        return this.sampleQuestions.filter(q => q.difficulty === difficulty);
    }
    getQuestionsByTopic(topic) {
        return this.sampleQuestions.filter(q => q.topic === topic);
    }
    addQuestion(question) {
        this.sampleQuestions.push(question);
        this.questionDifficultyCaches.set(question.id, question);
    }
    getQuestion(id) {
        return this.sampleQuestions.find(q => q.id === id);
    }
};
exports.AdaptiveDifficultyService = AdaptiveDifficultyService;
exports.AdaptiveDifficultyService = AdaptiveDifficultyService = __decorate([
    (0, common_1.Injectable)()
], AdaptiveDifficultyService);
//# sourceMappingURL=adaptive-difficulty.service.js.map