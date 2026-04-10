export interface QuestionTemplate {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    language: string[];
    topic: string;
    tags: string[];
    timeEstimate: number;
    successRate: number;
    testCases: Array<{
        input: string;
        expectedOutput: string;
    }>;
    starterCode?: {
        [key: string]: string;
    };
    wrapperCode?: {
        [key: string]: string;
    };
    explanation?: string;
    isPremium?: boolean;
    category: 'algorithms' | 'data-structures' | 'system-design' | 'database' | 'behavioral';
    votes?: number;
    views?: number;
}
interface QuestionPack {
    id: string;
    name: string;
    description: string;
    difficulty: string[];
    questionIds: string[];
    premium: boolean;
    price?: number;
    estimatedTime: number;
}
export declare class QuestionLibraryService {
    private questions;
    private packs;
    private favorites;
    private userLibrary;
    constructor();
    private initializeSampleQuestions;
    private initializeQuestionPacks;
    getQuestion(id: string): QuestionTemplate | undefined;
    getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): QuestionTemplate[];
    getQuestionsByTopic(topic: string): QuestionTemplate[];
    getQuestionsByTags(tags: string[]): QuestionTemplate[];
    searchQuestions(query: string): QuestionTemplate[];
    getAllQuestions(): QuestionTemplate[];
    getQuestionPack(id: string): QuestionPack | undefined;
    getAllPacks(): QuestionPack[];
    getFreePacks(): QuestionPack[];
    addQuestionToPack(packId: string, questionId: string): void;
    addToFavorites(userId: string, questionId: string): void;
    removeFromFavorites(userId: string, questionId: string): void;
    getFavorites(userId: string): QuestionTemplate[];
    isFavorite(userId: string, questionId: string): boolean;
    addCustomQuestion(userId: string, question: QuestionTemplate): void;
    getCustomQuestions(userId: string): QuestionTemplate[];
    getTopQuestions(limit?: number): QuestionTemplate[];
    getTrendingQuestions(limit?: number): QuestionTemplate[];
    addOrUpdateQuestion(question: QuestionTemplate): void;
    getTopics(): string[];
    getCategories(): string[];
    getTags(): string[];
}
export {};
