"use client";

import { useState } from "react";
import { Code2, CheckCircle2, AlertCircle, Zap, Shield, BookOpen } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface CodeReviewProps {
  code: string;
  language: string;
  onReview?: (review: any) => void;
}

export default function CodeReviewPanel({ code, language, onReview }: CodeReviewProps) {
  const [review, setReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performReview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/advanced-features/code-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const result = await response.json();
      setReview(result.data);
      onReview?.(result.data);
    } catch (error) {
      console.error('Code review failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!review) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-neutral-200">AI Code Review</h3>
        </div>
        <button
          onClick={performReview}
          disabled={isLoading || !code.trim()}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-white text-sm font-medium transition-colors"
        >
          {isLoading ? "Analyzing..." : "Get Code Review"}
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-rose-400";
  };

  const metrics = [
    { label: "Complexity", score: review.complexity.score, icon: Zap },
    { label: "Readability", score: review.readability.score, icon: BookOpen },
    { label: "Efficiency", score: review.efficiency.score, icon: Code2 },
    { label: "Best Practices", score: review.bestPractices.score, icon: CheckCircle2 },
    { label: "Security", score: review.security.score, icon: Shield }
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          AI Code Review Results
        </h3>
        <div className={`text-xl font-bold ${getScoreColor(review.overallScore)}`}>
          {review.overallScore}/100
        </div>
      </div>

      {/* Quality Rating */}
      <div className="bg-neutral-800/50 rounded p-2 text-xs text-neutral-300 capitalize">
        Quality: <span className="font-semibold">{review.qualityRating}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-neutral-800/50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <Icon className={`w-4 h-4 ${getScoreColor(m.score)}`} />
                <span className="text-xs font-medium text-neutral-300">{m.label}</span>
              </div>
              <div className={`text-lg font-bold ${getScoreColor(m.score)}`}>
                {m.score}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Feedback */}
      <div className="space-y-2">
        {review.complexity.feedback && (
          <div className="bg-neutral-800/30 border-l-2 border-yellow-500 p-2 text-xs text-neutral-300">
            <span className="font-semibold">Complexity:</span> {review.complexity.feedback}
          </div>
        )}
        {review.readability.feedback && (
          <div className="bg-neutral-800/30 border-l-2 border-blue-500 p-2 text-xs text-neutral-300">
            <span className="font-semibold">Readability:</span> {review.readability.feedback}
          </div>
        )}
        {review.efficiency.feedback && (
          <div className="bg-neutral-800/30 border-l-2 border-green-500 p-2 text-xs text-neutral-300">
            <span className="font-semibold">Efficiency:</span> {review.efficiency.feedback}
          </div>
        )}
      </div>

      {/* Security Issues */}
      {review.security.issues.length > 0 && (
        <div className="bg-rose-900/20 border border-rose-800 rounded p-2">
          <p className="text-xs font-semibold text-rose-400 mb-1">Security Issues:</p>
          <ul className="text-xs text-rose-300 space-y-1">
            {review.security.issues.map((issue: string, i: number) => (
              <li key={i} className="flex gap-1">
                <span>•</span> {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {review.suggestions.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-800 rounded p-2">
          <p className="text-xs font-semibold text-blue-400 mb-1">Suggestions:</p>
          <ul className="text-xs text-blue-300 space-y-1">
            {review.suggestions.map((sug: string, i: number) => (
              <li key={i} className="flex gap-1">
                <span>→</span> {sug}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={performReview}
        className="w-full px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-white text-sm font-medium transition-colors"
      >
        Re-analyze
      </button>
    </div>
  );
}
