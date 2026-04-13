"use client";

import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Problem } from "@/lib/api";

interface PerformanceFeedbackProps {
  currentProblem: Problem;
  performanceMetrics: {
    allPassed: boolean;
    passed: number;
    totalTests: number;
    timeSpentSeconds: number;
  };
  nextProblem: Problem | null;
  onProceed: () => void;
  isLoading?: boolean;
}

export default function PerformanceFeedback({
  currentProblem,
  performanceMetrics,
  nextProblem,
  onProceed,
  isLoading = false,
}: PerformanceFeedbackProps) {
  const timePercentage = Math.round(
    (performanceMetrics.timeSpentSeconds / currentProblem.timeLimit!) * 100
  );
  
  const getDifficultyBgClass = (difficulty?: string) => {
    if (difficulty === 'Easy') return 'bg-emerald-500/5 border-emerald-500/20';
    if (difficulty === 'Medium') return 'bg-amber-500/5 border-amber-500/20';
    return 'bg-rose-500/5 border-rose-500/20';
  };

  const getDifficultyBadgeClass = (difficulty?: string) => {
    if (difficulty === 'Easy') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (difficulty === 'Medium') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-lg w-full mx-4 shadow-3d max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${
            performanceMetrics.allPassed 
              ? 'bg-emerald-500/10' 
              : 'bg-amber-500/10'
          }`}>
            {performanceMetrics.allPassed ? (
              <CheckCircle2 className={`w-6 h-6 ${
                performanceMetrics.allPassed ? 'text-emerald-400' : 'text-amber-400'
              }`} />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {performanceMetrics.allPassed ? 'Great Job!' : 'Good Attempt!'}
          </h2>
        </div>

        {/* Performance Summary */}
        <div className="space-y-4 mb-8 bg-surface border border-border rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-sm text-neutral-500 font-medium">Problem: <span className="text-foreground font-bold">{currentProblem.title}</span></p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-neutral-500">Test Cases</p>
                <p className="text-lg font-bold text-emerald-400">{performanceMetrics.passed}/{performanceMetrics.totalTests}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Time Used</p>
                <p className="text-lg font-bold text-indigo-400">{performanceMetrics.timeSpentSeconds}s / {currentProblem.timeLimit}s</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Time Ratio</p>
                <p className={`text-lg font-bold ${
                  timePercentage <= 80 ? 'text-emerald-400' : 
                  timePercentage <= 100 ? 'text-amber-400' : 
                  'text-rose-400'
                }`}>{timePercentage}%</p>
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Performance</p>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className={`h-full transition-all ${
                  performanceMetrics.allPassed && timePercentage <= 80 ? 'bg-emerald-500' :
                  performanceMetrics.allPassed && timePercentage <= 100 ? 'bg-amber-500' :
                  performanceMetrics.allPassed ? 'bg-amber-600' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min((performanceMetrics.passed / performanceMetrics.totalTests) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Problem Recommendation */}
        {nextProblem && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-neutral-300">Up Next</h3>
            </div>
            <div className={`border rounded-lg p-4 space-y-2 ${getDifficultyBgClass(nextProblem.difficulty)} shadow-sm`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{nextProblem.title}</p>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${getDifficultyBadgeClass(nextProblem.difficulty)}`}>
                  {nextProblem.difficulty}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {nextProblem.description.substring(0, 100)}...
              </p>
              <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2 flex-wrap">
                {nextProblem.timeLimit && (
                  <span>⏱️ {nextProblem.timeLimit}s time limit</span>
                )}
                {nextProblem.topics && nextProblem.topics.length > 0 && (
                  <span>🏷️ {nextProblem.topics.slice(0, 2).join(', ')}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-8 space-y-2 shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">💡 Insights</p>
          {performanceMetrics.allPassed && timePercentage <= 80 && (
            <p className="text-sm text-emerald-300">Excellent! You completed this efficiently. Ready for a challenge?</p>
          )}
          {performanceMetrics.allPassed && timePercentage > 80 && timePercentage <= 100 && (
            <p className="text-sm text-amber-300">Good work! Try to optimize your approach on the next problem.</p>
          )}
          {performanceMetrics.allPassed && timePercentage > 100 && (
            <p className="text-sm text-amber-300">You solved it correctly, but try to work faster. Practice makes perfect!</p>
          )}
          {!performanceMetrics.allPassed && (
            <p className="text-sm text-rose-300">Let's keep practicing. The next problem will help you improve.</p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onProceed}
          disabled={isLoading}
          className={`w-full py-3 rounded-md font-bold transition-all shadow-lg ${
            isLoading 
              ? 'bg-primary/50 text-white cursor-not-allowed' 
              : 'bg-primary hover:brightness-110 text-white active:scale-95 shadow-primary/20'
          }`}
        >
          {isLoading ? 'Loading next problem...' : 'Continue to Next Problem'}
        </button>
      </div>
    </div>
  );
}
