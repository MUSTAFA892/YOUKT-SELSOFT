"use client";

import { CheckCircle2, AlertCircle, TrendingUp, AlertTriangle, Loader2, ShieldAlert, Shield } from "lucide-react";
import { Problem } from "@/lib/api";

export interface PlagiarismResult {
  overallSimilarity: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  matches: Array<{
    candidateId: string;
    similarity: number;
    matchedLines: Array<{ lineNumber: number; content: string }>;
  }>;
}

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
  plagiarismResult?: PlagiarismResult | null;
  isPlagiarismChecking?: boolean;
}

export default function PerformanceFeedback({
  currentProblem,
  performanceMetrics,
  nextProblem,
  onProceed,
  isLoading = false,
  plagiarismResult = null,
  isPlagiarismChecking = false,
}: PerformanceFeedbackProps) {
  const timePercentage = Math.round(
    (performanceMetrics.timeSpentSeconds / currentProblem.timeLimit!) * 100
  );

  const getDifficultyBgClass = (difficulty?: string) => {
    if (difficulty === "Easy") return "bg-emerald-500/5 border-emerald-500/20";
    if (difficulty === "Medium") return "bg-amber-500/5 border-amber-500/20";
    return "bg-rose-500/5 border-rose-500/20";
  };

  const getDifficultyBadgeClass = (difficulty?: string) => {
    if (difficulty === "Easy")
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    if (difficulty === "Medium")
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    return "bg-rose-500/10 border-rose-500/20 text-rose-400";
  };

  // Plagiarism banner styling
  const plagiarismConfig = {
    low: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: Shield,
      iconColor: "text-emerald-400",
      textColor: "text-emerald-300",
      label: "No AI Copy Detected",
      message: "Your code appears to be original work.",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    medium: {
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: AlertCircle,
      iconColor: "text-amber-400",
      textColor: "text-amber-300",
      label: "Moderate Similarity Detected",
      message:
        "Your code shows some similarity to other submissions. A recruiter may review this.",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    high: {
      bg: "bg-orange-500/10 border-orange-500/30",
      icon: AlertTriangle,
      iconColor: "text-orange-400",
      textColor: "text-orange-300",
      label: "High Similarity Detected",
      message:
        "Your submission shows significant similarity to AI-generated or copied code. This has been flagged for recruiter review.",
      badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    },
    critical: {
      bg: "bg-rose-500/10 border-rose-500/30",
      icon: ShieldAlert,
      iconColor: "text-rose-400",
      textColor: "text-rose-300",
      label: "AI / Copy-Paste Detected",
      message:
        "Critical similarity detected. This submission appears to be copied from an AI or external source. Your recruiter has been notified.",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-lg w-full shadow-3d max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-lg ${
              performanceMetrics.allPassed
                ? "bg-emerald-500/10"
                : "bg-amber-500/10"
            }`}
          >
            {performanceMetrics.allPassed ? (
              <CheckCircle2
                className={`w-6 h-6 ${
                  performanceMetrics.allPassed
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {performanceMetrics.allPassed ? "Great Job!" : "Good Attempt!"}
          </h2>
        </div>

        {/* Performance Summary */}
        <div className="space-y-4 mb-6 bg-surface border border-border rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-sm text-neutral-500 font-medium">
              Problem:{" "}
              <span className="text-foreground font-bold">
                {currentProblem.title}
              </span>
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-neutral-500">Test Cases</p>
                <p className="text-lg font-bold text-emerald-400">
                  {performanceMetrics.passed}/{performanceMetrics.totalTests}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Time Used</p>
                <p className="text-lg font-bold text-indigo-400">
                  {performanceMetrics.timeSpentSeconds}s /{" "}
                  {currentProblem.timeLimit}s
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Time Ratio</p>
                <p
                  className={`text-lg font-bold ${
                    timePercentage <= 80
                      ? "text-emerald-400"
                      : timePercentage <= 100
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {timePercentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              Performance
            </p>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className={`h-full transition-all ${
                  performanceMetrics.allPassed && timePercentage <= 80
                    ? "bg-emerald-500"
                    : performanceMetrics.allPassed && timePercentage <= 100
                    ? "bg-amber-500"
                    : performanceMetrics.allPassed
                    ? "bg-amber-600"
                    : "bg-rose-500"
                }`}
                style={{
                  width: `${Math.min(
                    (performanceMetrics.passed /
                      performanceMetrics.totalTests) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── Plagiarism Section ─── */}
        <div className="mb-6">
          {isPlagiarismChecking && !plagiarismResult && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/60 border border-neutral-700">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
              <span className="text-xs text-neutral-400 font-medium">
                Checking submission for AI-generated content…
              </span>
            </div>
          )}

          {plagiarismResult && (() => {
            const cfg = plagiarismConfig[plagiarismResult.riskLevel];
            const Icon = cfg.icon;
            const isWarning = plagiarismResult.riskLevel !== "low";
            return (
              <div
                className={`rounded-xl border p-4 ${cfg.bg} ${isWarning ? "animate-pulse-once" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-sm font-bold ${cfg.textColor}`}>
                        {cfg.label}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.badge}`}
                      >
                        {plagiarismResult.riskLevel}
                      </span>
                      <span
                        className={`text-xs font-bold ml-auto ${cfg.textColor}`}
                      >
                        {plagiarismResult.overallSimilarity}% similar
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${cfg.textColor} opacity-80`}>
                      {cfg.message}
                    </p>

                    {/* Similarity bar */}
                    <div className="mt-2 h-1.5 bg-black/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          plagiarismResult.riskLevel === "low"
                            ? "bg-emerald-500"
                            : plagiarismResult.riskLevel === "medium"
                            ? "bg-amber-500"
                            : plagiarismResult.riskLevel === "high"
                            ? "bg-orange-500"
                            : "bg-rose-500"
                        }`}
                        style={{
                          width: `${Math.min(plagiarismResult.overallSimilarity, 100)}%`,
                        }}
                      />
                    </div>

                    {isWarning && plagiarismResult.matches.length > 0 && (
                      <p className="text-[10px] mt-1.5 opacity-60 font-mono">
                        {plagiarismResult.matches.length} matching submission
                        {plagiarismResult.matches.length > 1 ? "s" : ""}{" "}
                        flagged
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Next Problem Recommendation */}
        {nextProblem && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-neutral-300">
                Up Next
              </h3>
            </div>
            <div
              className={`border rounded-lg p-4 space-y-2 ${getDifficultyBgClass(
                nextProblem.difficulty
              )} shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {nextProblem.title}
                </p>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-md border ${getDifficultyBadgeClass(
                    nextProblem.difficulty
                  )}`}
                >
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
                  <span>🏷️ {nextProblem.topics.slice(0, 2).join(", ")}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 space-y-2 shadow-sm">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            💡 Insights
          </p>
          {performanceMetrics.allPassed && timePercentage <= 80 && (
            <p className="text-sm text-emerald-300">
              Excellent! You completed this efficiently. Ready for a challenge?
            </p>
          )}
          {performanceMetrics.allPassed &&
            timePercentage > 80 &&
            timePercentage <= 100 && (
              <p className="text-sm text-amber-300">
                Good work! Try to optimize your approach on the next problem.
              </p>
            )}
          {performanceMetrics.allPassed && timePercentage > 100 && (
            <p className="text-sm text-amber-300">
              You solved it correctly, but try to work faster. Practice makes
              perfect!
            </p>
          )}
          {!performanceMetrics.allPassed && (
            <p className="text-sm text-rose-300">
              Let's keep practicing. The next problem will help you improve.
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onProceed}
          disabled={isLoading}
          className={`w-full py-3 rounded-md font-bold transition-all shadow-lg ${
            isLoading
              ? "bg-primary/50 text-white cursor-not-allowed"
              : "bg-primary hover:brightness-110 text-white active:scale-95 shadow-primary/20"
          }`}
        >
          {isLoading ? "Loading next problem..." : "Continue to Next Problem →"}
        </button>
      </div>
    </div>
  );
}
