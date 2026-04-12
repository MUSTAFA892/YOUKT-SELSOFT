"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Zap, Brain, BookOpen } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface Metrics {
  problemsSolved: number;
  problemsAttempted: number;
  averageAccuracy: number;
  successRate: number;
}

interface DifficultyPrediction {
  currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  recommendedNextDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  confidenceScore: number;
  reasoning: string;
  metrics: Metrics;
}

interface AdaptiveDifficultyProps {
  candidateId: string;
  currentDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  onDifficultyChange?: (newDifficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
}

const difficultyOrder = { easy: 0, medium: 1, hard: 2, expert: 3 };
const difficultyColors = {
  easy: 'text-emerald-400 bg-emerald-900/20',
  medium: 'text-yellow-400 bg-yellow-900/20',
  hard: 'text-orange-400 bg-orange-900/20',
  expert: 'text-purple-400 bg-purple-900/20'
};

export default function AdaptiveDifficultyPanel({
  candidateId,
  currentDifficulty,
  onDifficultyChange
}: AdaptiveDifficultyProps) {
  const [prediction, setPrediction] = useState<DifficultyPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [candidateId, currentDifficulty]);

  const fetchPrediction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/advanced-features/adaptive-difficulty/predict/${candidateId}/${currentDifficulty}`
      );
      const result = await response.json();
      setPrediction(result.data);
    } catch (error) {
      console.error('Failed to get difficulty prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!prediction) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-neutral-200">Adaptive Difficulty</h3>
        </div>
        <p className="text-xs text-neutral-400">Loading difficulty analysis...</p>
      </div>
    );
  }

  const metrics = prediction.metrics;
  const shouldIncrease = difficultyOrder[prediction.recommendedNextDifficulty] > difficultyOrder[currentDifficulty];
  const shouldDecrease = difficultyOrder[prediction.recommendedNextDifficulty] < difficultyOrder[currentDifficulty];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-neutral-200">Adaptive Difficulty</h3>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-neutral-800/50 rounded p-2">
          <div className="text-xs text-neutral-400">Success Rate</div>
          <div className="text-lg font-bold text-blue-400">{Math.round(metrics.successRate * 100)}%</div>
        </div>
        <div className="bg-neutral-800/50 rounded p-2">
          <div className="text-xs text-neutral-400">Avg Accuracy</div>
          <div className="text-lg font-bold text-emerald-400">{Math.round(metrics.averageAccuracy)}%</div>
        </div>
        <div className="bg-neutral-800/50 rounded p-2">
          <div className="text-xs text-neutral-400">Problems Solved</div>
          <div className="text-lg font-bold text-purple-400">{metrics.problemsSolved}/{metrics.problemsAttempted}</div>
        </div>
        <div className="bg-neutral-800/50 rounded p-2">
          <div className="text-xs text-neutral-400">Confidence</div>
          <div className="text-lg font-bold text-yellow-400">{Math.round(prediction.confidenceScore * 100)}%</div>
        </div>
      </div>

      {/* Difficulty Progression */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-300">Difficulty Level</p>
        <div className="flex gap-1">
          {(['easy', 'medium', 'hard', 'expert'] as const).map((level) => (
            <button
              key={level}
              onClick={() => {
                onDifficultyChange?.(level);
              }}
              className={`flex-1 py-2 rounded text-xs font-semibold transition-all ${
                level === currentDifficulty
                  ? `${difficultyColors[level]} border-2 border-current`
                  : `${difficultyColors[level]} opacity-50 hover:opacity-75 border border-neutral-700`
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded p-3 border-l-4 ${
        shouldIncrease
          ? 'bg-emerald-900/20 border-emerald-500'
          : shouldDecrease
          ? 'bg-yellow-900/20 border-yellow-500'
          : 'bg-blue-900/20 border-blue-500'
      }`}>
        <div className="flex items-start gap-2">
          <Zap className={`w-4 h-4 flex-shrink-0 ${
            shouldIncrease
              ? 'text-emerald-400'
              : shouldDecrease
              ? 'text-yellow-400'
              : 'text-blue-400'
          } mt-0.5`} />
          <div className="text-xs">
            <div className="font-semibold mb-1">
              {shouldIncrease && '📈 Ready to Level Up!'}
              {shouldDecrease && '📉 Time to Consolidate'}
              {!shouldIncrease && !shouldDecrease && '⏸️ Keep Going!'}
            </div>
            <p className="text-neutral-300 mb-1">{prediction.reasoning}</p>
            <p className="text-neutral-400">
              Recommended: <span className={`font-semibold ${difficultyColors[prediction.recommendedNextDifficulty]}`}>
                {prediction.recommendedNextDifficulty.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Problems Button */}
      <a
        href={`?difficulty=${prediction.recommendedNextDifficulty}`}
        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors text-center block"
      >
        View Recommended Problems
      </a>
    </div>
  );
}
