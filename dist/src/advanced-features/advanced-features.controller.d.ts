import { CodeReviewService, CodeReviewResult } from '../code-review/code-review.service';
import { PlagiarismDetectionService, PlagiarismReport } from '../plagiarism/plagiarism-detection.service';
import { AdaptiveDifficultyService, DifficultyPrediction, DifficultyMetrics, Question } from '../adaptive-difficulty/adaptive-difficulty.service';
import { QuestionLibraryService, QuestionPack } from '../question-library/question-library.service';
export declare class AdvancedFeaturesController {
    private codeReviewService;
    private plagiarismService;
    private adaptiveService;
    private questionService;
    constructor(codeReviewService: CodeReviewService, plagiarismService: PlagiarismDetectionService, adaptiveService: AdaptiveDifficultyService, questionService: QuestionLibraryService);
    reviewCode(body: {
        code: string;
        language: string;
    }): {
        success: boolean;
        data: CodeReviewResult;
    };
    checkPlagiarism(body: {
        code: string;
        candidateId: string;
        interviewId: string;
        problemId: string;
        submissionId?: string;
        submissionTimeMs?: number;
        pasteDetected?: boolean;
    }): {
        success: boolean;
        data: PlagiarismReport;
    };
    getPlagiarismReport(submissionId: string): {
        success: boolean;
        data: PlagiarismReport | {
            error: string;
        };
    };
    recordAttempt(body: {
        candidateId: string;
        problemDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
        accuracy: number;
        timeTaken: number;
        solved: boolean;
    }): {
        success: boolean;
        message: string;
    };
    getPrediction(candidateId: string, difficulty: 'easy' | 'medium' | 'hard' | 'expert'): {
        success: boolean;
        data: DifficultyPrediction;
    };
    getMetrics(candidateId: string): {
        success: boolean;
        data: DifficultyMetrics;
    };
    getRecommendations(candidateId: string, difficulty?: 'easy' | 'medium' | 'hard' | 'expert', language?: string, count?: string): {
        success: boolean;
        data: Question[];
    };
    getAllQuestions(): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate[];
        count: number;
    };
    searchQuestions(query: string): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate[];
        count: number;
    };
    getByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate[];
        count: number;
    };
    getByTopic(topic: string): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate[];
        count: number;
    };
    getQuestion(id: string): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate | {
            error: string;
        };
    };
    getTopics(): {
        success: boolean;
        data: string[];
    };
    getTags(): {
        success: boolean;
        data: string[];
    };
    getTrendingQuestions(limit?: string): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate[];
        count: number;
    };
    getAllPacks(): {
        success: boolean;
        data: QuestionPack[];
        count: number;
    };
    getFreePacks(): {
        success: boolean;
        data: QuestionPack[];
        count: number;
    };
    getPack(id: string): {
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            questions: import("../question-library/question-library.service").QuestionTemplate[];
            id: string;
            name: string;
            description: string;
            difficulty: string[];
            questionIds: string[];
            premium: boolean;
            price?: number;
            estimatedTime: number;
        };
        error?: undefined;
    };
    addFavorite(body: {
        userId: string;
        questionId: string;
    }): {
        success: boolean;
        message: string;
    };
    removeFavorite(body: {
        userId: string;
        questionId: string;
    }): {
        success: boolean;
        message: string;
    };
    getFavorites(userId: string): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate[];
        count: number;
    };
    getTopQuestions(limit?: string): {
        success: boolean;
        data: import("../question-library/question-library.service").QuestionTemplate[];
        count: number;
    };
}
