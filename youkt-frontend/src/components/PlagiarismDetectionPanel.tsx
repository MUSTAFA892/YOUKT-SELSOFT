"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, AlertCircle } from "lucide-react";

interface PlagiarismReport {
  overallSimilarity: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matches: Array<{
    candidateId: string;
    similarity: number;
    matchedLines: Array<{ lineNumber: number; content: string }>;
  }>;
}

interface PlagiarismDetectionProps {
  code: string;
  candidateId: string;
  interviewId: string;
  onCheck?: (report: PlagiarismReport) => void;
}

export default function PlagiarismDetectionPanel({
  code,
  candidateId,
  interviewId,
  onCheck
}: PlagiarismDetectionProps) {
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkPlagiarism = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advanced-features/plagiarism/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          candidateId,
          interviewId,
          submissionId: `sub_${Date.now()}`
        })
      });
      const result = await response.json();
      setReport(result.data);
      onCheck?.(result.data);
    } catch (error) {
      console.error('Plagiarism check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!report) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-neutral-200">Plagiarism Detection</h3>
        </div>
        <button
          onClick={checkPlagiarism}
          disabled={isLoading || !code.trim()}
          className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-white text-sm font-medium transition-colors"
        >
          {isLoading ? "Checking..." : "Check Plagiarism"}
        </button>
      </div>
    );
  }

  const getRiskColor = {
    low: "text-emerald-400 bg-emerald-900/20 border-emerald-800",
    medium: "text-yellow-400 bg-yellow-900/20 border-yellow-800",
    high: "text-orange-400 bg-orange-900/20 border-orange-800",
    critical: "text-rose-400 bg-rose-900/20 border-rose-800"
  };

  const getRiskIcon = {
    low: CheckCircle2,
    medium: AlertCircle,
    high: AlertTriangle,
    critical: AlertTriangle
  };

  const RiskIcon = getRiskIcon[report.riskLevel];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          Plagiarism Report
        </h3>
        <div className={`text-sm font-bold px-2 py-1 rounded border ${getRiskColor[report.riskLevel]}`}>
          {report.riskLevel.toUpperCase()}
        </div>
      </div>

      {/* Similarity Score */}
      <div className="bg-neutral-800/50 rounded p-3">
        <div className="text-xs text-neutral-400 mb-1">Overall Similarity</div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-purple-400">{report.overallSimilarity}%</div>
          <div className="flex-1 bg-neutral-700 rounded-full h-2">
            <div
              className={`h-full rounded-full transition-all ${
                report.overallSimilarity <= 30
                  ? 'bg-emerald-500'
                  : report.overallSimilarity <= 50
                  ? 'bg-yellow-500'
                  : report.overallSimilarity <= 70
                  ? 'bg-orange-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(report.overallSimilarity, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Matches Found */}
      {report.matches.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-300">Matches Found: {report.matches.length}</p>
          {report.matches.map((match, i) => (
            <div key={i} className="bg-neutral-800/50 rounded p-2 border-l-2 border-rose-500">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-200">Candidate {match.candidateId}</span>
                <span className={`text-xs font-bold ${match.similarity > 50 ? 'text-rose-400' : 'text-yellow-400'}`}>
                  {match.similarity}% match
                </span>
              </div>
              {match.matchedLines.length > 0 && (
                <div className="text-xs text-neutral-400 space-y-1 max-h-20 overflow-y-auto">
                  <p className="font-semibold">Matching lines:</p>
                  {match.matchedLines.slice(0, 3).map((line, j) => (
                    <div key={j} className="font-mono text-neutral-500">
                      Line {line.lineNumber}: {line.content.substring(0, 40)}...
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded p-2">
          <p className="text-xs text-emerald-300">✓ No plagiarism detected. Code appears to be original.</p>
        </div>
      )}

      {/* Risk Assessment */}
      <div className={`rounded p-2 border ${getRiskColor[report.riskLevel]} flex items-start gap-2`}>
        <RiskIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          {report.riskLevel === 'low' && 'Low plagiarism risk. Submission appears to be original work.'}
          {report.riskLevel === 'medium' && 'Medium plagiarism risk. Consider review before final acceptance.'}
          {report.riskLevel === 'high' && 'High plagiarism risk. Strong evidence of code similarity.'}
          {report.riskLevel === 'critical' && 'Critical plagiarism risk. Immediate review required.'}
        </div>
      </div>

      <button
        onClick={checkPlagiarism}
        className="w-full px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-white text-sm font-medium transition-colors"
      >
        Re-check
      </button>
    </div>
  );
}
