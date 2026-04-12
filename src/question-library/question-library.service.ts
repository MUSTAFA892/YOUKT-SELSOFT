import { Injectable } from '@nestjs/common';

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
  testCases: Array<{ input: string; expectedOutput: string }>;
  starterCode?: { [key: string]: string };
  wrapperCode?: { [key: string]: string };
  explanation?: string;
  isPremium?: boolean;
  category: 'algorithms' | 'data-structures' | 'system-design' | 'database' | 'behavioral';
  votes?: number; // community rating
  views?: number;
}

export interface QuestionPack {
  id: string;
  name: string;
  description: string;
  difficulty: string[];
  questionIds: string[];
  premium: boolean;
  price?: number;
  estimatedTime: number; // total minutes
}

@Injectable()
export class QuestionLibraryService {
  private questions: Map<string, QuestionTemplate> = new Map();
  private packs: Map<string, QuestionPack> = new Map();
  private favorites: Map<string, Set<string>> = new Map(); // userId -> questionIds
  private userLibrary: Map<string, QuestionTemplate[]> = new Map(); // userId -> custom questions

  constructor() {
    this.initializeSampleQuestions();
    this.initializeQuestionPacks();
  }

  private initializeSampleQuestions(): void {
    const sampleQuestions: QuestionTemplate[] = [
      {
        id: 'q_two_sum',
        title: 'Two Sum',
        description: 'Given an array of integers and a target, find two numbers that add up to target.',
        difficulty: 'easy',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'array',
        tags: ['hash-table', 'brute-force'],
        timeEstimate: 15,
        successRate: 0.87,
        testCases: [
          { input: '[2,7,11,15], target=9', expectedOutput: '[0,1]' },
          { input: '[3,2,4], target=6', expectedOutput: '[1,2]' }
        ],
        category: 'algorithms',
        votes: 4500,
        views: 125000
      },
      {
        id: 'q_valid_parentheses',
        title: 'Valid Parentheses',
        description: 'Given a string with parentheses, determine if it is valid.',
        difficulty: 'medium',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'stack',
        tags: ['string', 'stack'],
        timeEstimate: 20,
        successRate: 0.72,
        testCases: [
          { input: '"()"', expectedOutput: 'true' },
          { input: '"([{}])"', expectedOutput: 'true' },
          { input: '"([)]"', expectedOutput: 'false' }
        ],
        category: 'algorithms',
        votes: 3200,
        views: 98000
      },
      {
        id: 'q_merge_sorted',
        title: 'Merge Two Sorted Lists',
        description: 'Merge two sorted linked lists into one sorted linked list.',
        difficulty: 'easy',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'linked-list',
        tags: ['linked-list', 'merge'],
        timeEstimate: 20,
        successRate: 0.75,
        testCases: [
          { input: '[1,2,4], [1,3,4]', expectedOutput: '[1,1,2,3,4,4]' }
        ],
        category: 'data-structures',
        votes: 2800,
        views: 85000
      },
      {
        id: 'q_binary_search',
        title: 'Binary Search',
        description: 'Implement binary search to find target in sorted array.',
        difficulty: 'medium',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'search',
        tags: ['binary-search', 'logarithmic'],
        timeEstimate: 25,
        successRate: 0.68,
        testCases: [
          { input: '[1,3,5,7,9], target=5', expectedOutput: '2' },
          { input: '[1,3,5,7,9], target=6', expectedOutput: '-1' }
        ],
        category: 'algorithms',
        votes: 3100,
        views: 92000
      },
      {
        id: 'q_longest_substring',
        title: 'Longest Substring Without Repeating',
        description: 'Find the length of the longest substring without repeating characters.',
        difficulty: 'medium',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'string',
        tags: ['sliding-window', 'string'],
        timeEstimate: 30,
        successRate: 0.55,
        testCases: [
          { input: '"au"', expectedOutput: '2' },
          { input: '"dvdf"', expectedOutput: '3' }
        ],
        category: 'algorithms',
        votes: 2900,
        views: 78000
      },
      {
        id: 'q_word_ladder',
        title: 'Word Ladder',
        description: 'Find the length of shortest transformation sequence from beginWord to endWord.',
        difficulty: 'hard',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'graph',
        tags: ['bfs', 'graph'],
        timeEstimate: 45,
        successRate: 0.38,
        testCases: [
          { input: 'beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]', expectedOutput: '5' }
        ],
        category: 'algorithms',
        votes: 1800,
        views: 45000
      },
      {
        id: 'q_design_cache',
        title: 'Design LRU Cache',
        description: 'Design and implement a data structure for Least Recently Used (LRU) cache.',
        difficulty: 'hard',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'design',
        tags: ['cache', 'design'],
        timeEstimate: 50,
        successRate: 0.42,
        testCases: [
          { input: 'LRUCache(2), put(1,1), put(2,2), get(1)=1', expectedOutput: '1' }
        ],
        category: 'system-design',
        votes: 2200,
        views: 67000
      },
      {
        id: 'q_n_queens',
        title: 'N-Queens Problem',
        description: 'Place n queens on an n x n chessboard such that no two queens attack each other.',
        difficulty: 'expert',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'backtracking',
        tags: ['backtracking', 'expert'],
        timeEstimate: 60,
        successRate: 0.15,
        testCases: [
          { input: 'n=4', expectedOutput: '[[...], [...]]' }
        ],
        category: 'algorithms',
        votes: 1200,
        views: 28000
      },
      {
        id: 'q_regex_match',
        title: 'Regular Expression Matching',
        description: 'Implement regular expression matching with support for \".\" and \"*\".',
        difficulty: 'expert',
        language: ['python', 'javascript', 'java', 'c'],
        topic: 'dynamic-programming',
        tags: ['dp', 'regex'],
        timeEstimate: 70,
        successRate: 0.12,
        testCases: [
          { input: 's="aa", p="a"', expectedOutput: 'false' }
        ],
        category: 'algorithms',
        votes: 980,
        views: 22000
      },
      {
        id: 'q_design_db',
        title: 'Design a Distributed Database',
        description: 'Design a scalable distributed database system.',
        difficulty: 'hard',
        language: ['python', 'javascript'],
        topic: 'system-design',
        tags: ['system-design', 'distributed'],
        timeEstimate: 45,
        successRate: 0.20,
        testCases: [],
        category: 'system-design',
        votes: 1500,
        views: 38000
      }
    ];

    sampleQuestions.forEach(q => this.questions.set(q.id, q));
  }

  private initializeQuestionPacks(): void {
    const packs: QuestionPack[] = [
      {
        id: 'pack_array_basics',
        name: 'Array Fundamentals',
        description: 'Master array operations and common patterns',
        difficulty: ['easy'],
        questionIds: ['q_two_sum', 'q_merge_sorted'],
        premium: false,
        estimatedTime: 35
      },
      {
        id: 'pack_interview_prep',
        name: 'Interview Preparation',
        description: 'Essential questions asked in top company interviews',
        difficulty: ['easy', 'medium'],
        questionIds: ['q_two_sum', 'q_valid_parentheses', 'q_merge_sorted', 'q_binary_search'],
        premium: false,
        estimatedTime: 75
      },
      {
        id: 'pack_advanced',
        name: 'Advanced Problem Solving',
        description: 'Hard and expert level problems for mastering algorithms',
        difficulty: ['hard', 'expert'],
        questionIds: ['q_word_ladder', 'q_design_cache', 'q_n_queens', 'q_regex_match'],
        premium: true,
        price: 29.99,
        estimatedTime: 180
      },
      {
        id: 'pack_system_design',
        name: 'System Design Masterclass',
        description: 'Learn to design large-scale systems',
        difficulty: ['hard'],
        questionIds: ['q_design_cache', 'q_design_db'],
        premium: true,
        price: 49.99,
        estimatedTime: 95
      }
    ];

    packs.forEach(p => this.packs.set(p.id, p));
  }

  // Core library methods
  getQuestion(id: string): QuestionTemplate | undefined {
    return this.questions.get(id);
  }

  getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): QuestionTemplate[] {
    return Array.from(this.questions.values()).filter(q => q.difficulty === difficulty);
  }

  getQuestionsByTopic(topic: string): QuestionTemplate[] {
    return Array.from(this.questions.values()).filter(q => q.topic === topic);
  }

  getQuestionsByTags(tags: string[]): QuestionTemplate[] {
    return Array.from(this.questions.values()).filter(q =>
      tags.some(tag => q.tags.includes(tag))
    );
  }

  searchQuestions(query: string): QuestionTemplate[] {
    const lower = query.toLowerCase();
    return Array.from(this.questions.values()).filter(q =>
      q.title.toLowerCase().includes(lower) ||
      q.description.toLowerCase().includes(lower) ||
      q.tags.some(t => t.toLowerCase().includes(lower))
    );
  }

  getAllQuestions(): QuestionTemplate[] {
    return Array.from(this.questions.values());
  }

  // Question packs
  getQuestionPack(id: string): QuestionPack | undefined {
    return this.packs.get(id);
  }

  getAllPacks(): QuestionPack[] {
    return Array.from(this.packs.values());
  }

  getFreePacks(): QuestionPack[] {
    return Array.from(this.packs.values()).filter(p => !p.premium);
  }

  addQuestionToPack(packId: string, questionId: string): void {
    const pack = this.packs.get(packId);
    if (pack && !pack.questionIds.includes(questionId)) {
      pack.questionIds.push(questionId);
    }
  }

  // Favorites management
  addToFavorites(userId: string, questionId: string): void {
    if (!this.favorites.has(userId)) {
      this.favorites.set(userId, new Set());
    }
    this.favorites.get(userId)!.add(questionId);
  }

  removeFromFavorites(userId: string, questionId: string): void {
    this.favorites.get(userId)?.delete(questionId);
  }

  getFavorites(userId: string): QuestionTemplate[] {
    const favoriteIds = this.favorites.get(userId) || new Set();
    return Array.from(favoriteIds)
      .map(id => this.questions.get(id))
      .filter((q): q is QuestionTemplate => q !== undefined);
  }

  isFavorite(userId: string, questionId: string): boolean {
    return this.favorites.get(userId)?.has(questionId) || false;
  }

  // Custom library (user-created questions)
  addCustomQuestion(userId: string, question: QuestionTemplate): void {
    if (!this.userLibrary.has(userId)) {
      this.userLibrary.set(userId, []);
    }
    this.userLibrary.get(userId)!.push(question);
  }

  getCustomQuestions(userId: string): QuestionTemplate[] {
    return this.userLibrary.get(userId) || [];
  }

  // Statistics
  getTopQuestions(limit: number = 10): QuestionTemplate[] {
    return Array.from(this.questions.values())
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, limit);
  }

  getTrendingQuestions(limit: number = 10): QuestionTemplate[] {
    return Array.from(this.questions.values())
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }

  // Add or update question
  addOrUpdateQuestion(question: QuestionTemplate): void {
    this.questions.set(question.id, question);
  }

  // Get unique topics and categories
  getTopics(): string[] {
    const topics = new Set(Array.from(this.questions.values()).map(q => q.topic));
    return Array.from(topics);
  }

  getCategories(): string[] {
    const categories = new Set(Array.from(this.questions.values()).map(q => q.category));
    return Array.from(categories);
  }

  getTags(): string[] {
    const tags = new Set<string>();
    this.questions.forEach(q => q.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }
}
