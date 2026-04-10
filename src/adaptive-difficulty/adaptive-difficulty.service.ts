import { Injectable } from '@nestjs/common';

interface DifficultyMetrics {
  problemsSolved: number;
  problemsAttempted: number;
  averageAccuracy: number;
  averageTime: number;
  successRate: number;
}

interface DifficultyPrediction {
  currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  recommendedNextDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  confidenceScore: number;
  reasoning: string;
  metrics: DifficultyMetrics;
}

interface Question {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeEstimate: number; // in minutes
  successRate: number; // 0-1, how many users solve it
  language: string;
  topic: string;
}

@Injectable()
export class AdaptiveDifficultyService {
  private candidateMetrics: Map<string, DifficultyMetrics> = new Map();
  private questionDifficultyCaches: Map<string, Question> = new Map();

  // Initialize some sample questions
  private sampleQuestions: Question[] = [
    { id: 'q1', title: 'Two Sum', difficulty: 'easy', timeEstimate: 15, successRate: 0.85, language: 'all', topic: 'array' },
    { id: 'q2', title: 'Reverse String', difficulty: 'easy', timeEstimate: 10, successRate: 0.90, language: 'all', topic: 'string' },
    { id: 'q3', title: 'Valid Parentheses', difficulty: 'medium', timeEstimate: 20, successRate: 0.70, language: 'all', topic: 'stack' },
    { id: 'q4', title: 'Merge Intervals', difficulty: 'medium', timeEstimate: 30, successRate: 0.60, language: 'all', topic: 'array' },
    { id: 'q5', title: 'LRU Cache', difficulty: 'hard', timeEstimate: 45, successRate: 0.40, language: 'all', topic: 'design' },
    { id: 'q6', title: 'Median of Two Sorted Arrays', difficulty: 'hard', timeEstimate: 50, successRate: 0.35, language: 'all', topic: 'binary-search' },
    { id: 'q7', title: 'N-Queens Problem', difficulty: 'expert', timeEstimate: 60, successRate: 0.15, language: 'all', topic: 'backtracking' },
    { id: 'q8', title: 'Regular Expression Matching', difficulty: 'expert', timeEstimate: 70, successRate: 0.10, language: 'all', topic: 'dp' }
  ];

  recordProblemAttempt(
    candidateId: string,
    problemDifficulty: 'easy' | 'medium' | 'hard' | 'expert',
    accuracy: number,
    timeTaken: number,
    solved: boolean
  ): void {
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

    // Update averages
    metrics.averageAccuracy = (metrics.averageAccuracy * (metrics.problemsAttempted - 1) + accuracy) / metrics.problemsAttempted;
    metrics.averageTime = (metrics.averageTime * (metrics.problemsAttempted - 1) + timeTaken) / metrics.problemsAttempted;
    metrics.successRate = metrics.problemsSolved / metrics.problemsAttempted;

    this.candidateMetrics.set(candidateId, metrics);
  }

  predictNextDifficulty(candidateId: string, currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert'): DifficultyPrediction {
    const metrics = this.candidateMetrics.get(candidateId);
    
    if (!metrics || metrics.problemsAttempted < 1) {
      return this.getDefaultPrediction(currentDifficulty);
    }

    const accuracyThreshold = 0.75;
    const speedFactor = 1.0 - (metrics.averageTime / 60); // Normalize to 60 minutes
    const successThreshold = 0.6;

    let recommendedDifficulty: 'easy' | 'medium' | 'hard' | 'expert' = currentDifficulty;
    let reasoning = '';
    let confidenceScore = 0;

    // Determine if we should increase, decrease, or maintain difficulty
    if (metrics.successRate > successThreshold && metrics.averageAccuracy > accuracyThreshold) {
      // Move to harder
      recommendedDifficulty = this.increaseDifficulty(currentDifficulty);
      reasoning = `Strong performance (${Math.round(metrics.successRate * 100)}% success rate, ${Math.round(metrics.averageAccuracy)}% accuracy). Ready for harder challenges.`;
      confidenceScore = Math.min(0.95, metrics.successRate);
    } else if (metrics.successRate < (successThreshold - 0.2) || metrics.averageAccuracy < (accuracyThreshold - 0.15)) {
      // Move to easier
      recommendedDifficulty = this.decreaseDifficulty(currentDifficulty);
      reasoning = `Struggling with current difficulty (${Math.round(metrics.successRate * 100)}% success rate). Try easier problems to build fundamentals.`;
      confidenceScore = Math.min(0.95, 1 - metrics.successRate);
    } else {
      // Maintain current difficulty
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

  private increaseDifficulty(current: 'easy' | 'medium' | 'hard' | 'expert'): 'easy' | 'medium' | 'hard' | 'expert' {
    const progression = { easy: 'medium', medium: 'hard', hard: 'expert', expert: 'expert' };
    return progression[current] as 'easy' | 'medium' | 'hard' | 'expert';
  }

  private decreaseDifficulty(current: 'easy' | 'medium' | 'hard' | 'expert'): 'easy' | 'medium' | 'hard' | 'expert' {
    const progression = { easy: 'easy', medium: 'easy', hard: 'medium', expert: 'hard' };
    return progression[current] as 'easy' | 'medium' | 'hard' | 'expert';
  }

  private getDefaultPrediction(currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert'): DifficultyPrediction {
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

  getRecommendedQuestions(candidateId: string, difficulty: 'easy' | 'medium' | 'hard' | 'expert', language: string, count: number = 3): Question[] {
    const metrics = this.candidateMetrics.get(candidateId);
    
    // Filter questions by difficulty and language
    const filtered = this.sampleQuestions.filter(q => 
      q.difficulty === difficulty && 
      (q.language === 'all' || q.language === language)
    );

    // If not enough questions, expand difficulty range
    if (filtered.length < count) {
      const expanded = this.sampleQuestions.filter(q => q.language === 'all' || q.language === language);
      return expanded.slice(0, count);
    }

    // Sort by success rate (show more achievable problems first)
    return filtered
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, count);
  }

  getCandidateMetrics(candidateId: string): DifficultyMetrics {
    return this.candidateMetrics.get(candidateId) || {
      problemsSolved: 0,
      problemsAttempted: 0,
      averageAccuracy: 0,
      averageTime: 0,
      successRate: 0
    };
  }

  // Get all sample questions
  getAllQuestions(): Question[] {
    return this.sampleQuestions;
  }

  // Get questions by difficulty
  getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): Question[] {
    return this.sampleQuestions.filter(q => q.difficulty === difficulty);
  }

  // Get questions by topic
  getQuestionsByTopic(topic: string): Question[] {
    return this.sampleQuestions.filter(q => q.topic === topic);
  }

  // Add new question to library
  addQuestion(question: Question): void {
    this.sampleQuestions.push(question);
    this.questionDifficultyCaches.set(question.id, question);
  }

  // Get question by ID
  getQuestion(id: string): Question | undefined {
    return this.sampleQuestions.find(q => q.id === id);
  }
}
