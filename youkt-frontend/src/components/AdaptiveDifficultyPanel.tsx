"use client";

import { useState, useEffect } from "react";
import { Brain, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface DifficultyMetrics {
  problemsSolved: number;
  problemsAttempted: number;
  averageAccuracy: number;    // 0–100
  averageTimeSeconds: number;
  successRate: number;        // 0–1
  lastUpdated: string;
}

interface DifficultyPrediction {
  currentDifficulty: 'Easy' | 'Medium' | 'Hard';
  recommendedNextDifficulty: 'Easy' | 'Medium' | 'Hard';
  confidenceScore: number;
  reasoning: string;
  metrics: DifficultyMetrics;
}

interface AdaptiveDifficultyProps {
  candidateId: string;
  currentDifficulty: 'Easy' | 'Medium' | 'Hard';
  onDifficultyChange?: (newDifficulty: 'Easy' | 'Medium' | 'Hard') => void;
}

const difficultyOrder: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

const difficultyStyles: Record<string, { badge: string; dot: string }> = {
  Easy:   { badge: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30', dot: 'bg-emerald-400' },
  Medium: { badge: 'text-amber-400   bg-amber-900/30   border-amber-500/30',   dot: 'bg-amber-400'   },
  Hard:   { badge: 'text-rose-400    bg-rose-900/30    border-rose-500/30',     dot: 'bg-rose-400'    },
};

export default function AdaptiveDifficultyPanel({
  candidateId,
  currentDifficulty,
  onDifficultyChange,
}: AdaptiveDifficultyProps) {
  const [prediction, setPrediction] = useState<DifficultyPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrediction();
  }, [candidateId, currentDifficulty]);

  const fetchPrediction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/advanced-features/adaptive-difficulty/predict/${candidateId}/${currentDifficulty}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setPrediction(result.data);
    } catch (err: any) {
      setError('Could not load difficulty analysis.');
      console.error('Failed to get difficulty prediction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-indigo-400" />
          <div className="h-3 bg-neutral-700 rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-neutral-800 rounded w-full" />
          <div className="h-2 bg-neutral-800 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-neutral-200">Adaptive Difficulty</h3>
        </div>
        <p className="text-xs text-neutral-500">{error || 'No data yet. Solve a problem first.'}</p>
        <button
          onClick={fetchPrediction}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Retry →
        </button>
      </div>
    );
  }

  const metrics = prediction.metrics;
  const recOrder = difficultyOrder[prediction.recommendedNextDifficulty];
  const curOrder = difficultyOrder[currentDifficulty];
  const isPromote = recOrder > curOrder;
  const isDemote  = recOrder < curOrder;

  const recStyle = difficultyStyles[prediction.recommendedNextDifficulty];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-neutral-200">AI Difficulty Advisor</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${recStyle.badge}`}>
          {prediction.recommendedNextDifficulty.toUpperCase()}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-neutral-800/60 rounded-lg p-2.5">
          <div className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Success Rate</div>
          <div className="text-base font-bold text-blue-400">{Math.round(metrics.successRate * 100)}%</div>
          <div className="w-full bg-neutral-700 rounded-full h-1 mt-1.5">
            <div className="h-1 rounded-full bg-blue-500" style={{ width: `${metrics.successRate * 100}%` }} />
          </div>
        </div>
        <div className="bg-neutral-800/60 rounded-lg p-2.5">
          <div className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Avg Accuracy</div>
          <div className="text-base font-bold text-emerald-400">{Math.round(metrics.averageAccuracy)}%</div>
          <div className="w-full bg-neutral-700 rounded-full h-1 mt-1.5">
            <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${metrics.averageAccuracy}%` }} />
          </div>
        </div>
        <div className="bg-neutral-800/60 rounded-lg p-2.5">
          <div className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Problems</div>
          <div className="text-base font-bold text-purple-400">{metrics.problemsSolved}/{metrics.problemsAttempted}</div>
        </div>
        <div className="bg-neutral-800/60 rounded-lg p-2.5">
          <div className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Confidence</div>
          <div className="text-base font-bold text-yellow-400">{Math.round(prediction.confidenceScore * 100)}%</div>
          <div className="w-full bg-neutral-700 rounded-full h-1 mt-1.5">
            <div className="h-1 rounded-full bg-yellow-500" style={{ width: `${prediction.confidenceScore * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Recommendation Box */}
      <div className={`rounded-xl p-3 border-l-4 ${
        isPromote ? 'bg-emerald-900/20 border-emerald-500'
        : isDemote ? 'bg-amber-900/20 border-amber-500'
        : 'bg-indigo-900/20 border-indigo-500'
      }`}>
        <div className="flex items-start gap-2">
          {isPromote && <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
          {isDemote  && <TrendingDown className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
          {!isPromote && !isDemote && <Minus className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />}
          <div className="text-xs">
            <div className={`font-bold mb-1 ${isPromote ? 'text-emerald-300' : isDemote ? 'text-amber-300' : 'text-indigo-300'}`}>
              {isPromote ? '📈 Ready to Level Up!' : isDemote ? '📉 Consolidate First' : '⏸️ Keep the Pace!'}
            </div>
            <p className="text-neutral-400 leading-relaxed">{prediction.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Switch Difficulty</p>
        <div className="flex gap-1">
          {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
            const isActive = level === currentDifficulty;
            const isRecommended = level === prediction.recommendedNextDifficulty;
            const s = difficultyStyles[level];
            return (
              <button
                key={level}
                onClick={() => onDifficultyChange?.(level)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border relative ${
                  isActive
                    ? `${s.badge} border-2`
                    : `text-neutral-500 bg-neutral-800 border-neutral-700 hover:border-neutral-600 hover:text-neutral-300`
                }`}
              >
                {level}
                {isRecommended && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Link */}
      <a
        href={`/problems?difficulty=${prediction.recommendedNextDifficulty}`}
        className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-semibold transition-colors text-center block"
      >
        Browse {prediction.recommendedNextDifficulty} Problems →
      </a>
    </div>
  );
}
