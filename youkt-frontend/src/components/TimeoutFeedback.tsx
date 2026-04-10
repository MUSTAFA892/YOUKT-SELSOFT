"use client";

import { AlarmClock, ChevronRight, RotateCcw } from "lucide-react";
import { type Problem } from "@/lib/api";

interface TimeoutFeedbackProps {
  currentProblem: Problem;
  timeSpentSeconds: number;
  timeLimit: number;
  onRetry: () => void;
  onEasier?: () => void;
  isLoading?: boolean;
  isFirstProblem?: boolean;
}

export default function TimeoutFeedback({
  currentProblem,
  timeSpentSeconds,
  timeLimit,
  onRetry,
  onEasier,
  isLoading = false,
  isFirstProblem = true,
}: TimeoutFeedbackProps) {
  const formattedTime = {
    spent: Math.floor(timeSpentSeconds / 60) + ":" + (timeSpentSeconds % 60).toString().padStart(2, "0"),
    limit: Math.floor(timeLimit / 1000 / 60) + ":" + ((timeLimit / 1000) % 60).toString().padStart(2, "0"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-b border-rose-500/20 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg">
            <AlarmClock className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Time's Up!</h2>
            <p className="text-sm text-neutral-400">Time limit exceeded</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          
          {/* Problem Info */}
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-neutral-300 mb-3">{currentProblem.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Difficulty:</span>
                <span className={`font-semibold ${
                  currentProblem.difficulty === 'Easy' ? 'text-emerald-400' :
                  currentProblem.difficulty === 'Medium' ? 'text-amber-400' :
                  'text-rose-400'
                }`}>
                  {currentProblem.difficulty}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Time Spent:</span>
                <span className="text-rose-300 font-mono font-semibold">{formattedTime.spent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Time Limit:</span>
                <span className="text-neutral-400 font-mono">{formattedTime.limit}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
            <p className="text-sm text-rose-200">
              {isFirstProblem 
                ? "Don't worry! This is your first problem. Take your time and try again." 
                : "You're progressing well! Consider trying an easier problem before attempting this one again."}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Retry Button */}
            <button
              onClick={onRetry}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold py-3 rounded-lg transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>

            {/* Try Easier Button - Only for non-first problems */}
            {!isFirstProblem && onEasier && (
              <button
                onClick={onEasier}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-700/50 text-neutral-100 font-semibold py-3 rounded-lg transition-all active:scale-95 group"
              >
                <span>Try Easier Problem</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
