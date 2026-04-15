export interface DifficultyMetrics {
    problemsSolved: number;
    problemsAttempted: number;
    averageAccuracy: number;
    averageTime: number;
    successRate: number;
}
export interface DifficultyPrediction {
    currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
    recommendedNextDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
    confidenceScore: number;
    reasoning: string;
    metrics: DifficultyMetrics;
}
export interface Question {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    timeEstimate: number;
    successRate: number;
    language: string;
    topic: string;
}
export declare class AdaptiveDifficultyService {
    private candidateMetrics;
    private questionDifficultyCaches;
    private sampleQuestions;
    recordProblemAttempt(candidateId: string, problemDifficulty: 'easy' | 'medium' | 'hard' | 'expert', accuracy: number, timeTaken: number, solved: boolean): void;
    predictNextDifficulty(candidateId: string, currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert'): DifficultyPrediction;
    private increaseDifficulty;
    private decreaseDifficulty;
    private getDefaultPrediction;
    getRecommendedQuestions(candidateId: string, difficulty: 'easy' | 'medium' | 'hard' | 'expert', language: string, count?: number): Question[];
    getCandidateMetrics(candidateId: string): DifficultyMetrics;
    getAllQuestions(): Question[];
    getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): Question[];
    getQuestionsByTopic(topic: string): Question[];
    addQuestion(question: Question): void;
    getQuestion(id: string): Question | undefined;
}
