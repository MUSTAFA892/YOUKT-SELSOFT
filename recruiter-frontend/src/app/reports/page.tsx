"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, CheckCircle2, XCircle, Clock, User, ChevronDown, ChevronUp, Trophy, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

interface QuestionReport {
  questionId: string;
  questionTitle: string;
  totalTests: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  language: string;
}

interface AssessmentReport {
  id: string;
  interviewId: string;
  candidateId: string;
  candidateName: string;
  finishedAt: string;
  totalQuestions: number;
  questionsAttempted: number;
  totalTestsPassed: number;
  totalTestsAvailable: number;
  scorePercent: number;
  questions: QuestionReport[];
  violations?: {
    tabSwitches: number;
    terminated: boolean;
  };
}

export default function ReportsPage() {
  const { currentUser, getRecruiterCandidates } = useAuth();
  const [reports, setReports] = useState<AssessmentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/reports`);
        const data = await res.json();
        
        // Filter to only show this recruiter's candidates
        const recruiterCandidateIds = new Set(
          getRecruiterCandidates(currentUser.id).map(c => c.id)
        );
        
        const filteredReports = data.filter((report: AssessmentReport) => 
          recruiterCandidateIds.has(report.candidateId)
        );
        
        setReports(filteredReports);
      } catch (e) {
        console.error("Failed to load reports", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [currentUser, getRecruiterCandidates]);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const scoreColor = (s: number) =>
    s >= 80 ? "text-emerald-400" : s >= 50 ? "text-yellow-400" : "text-rose-400";
  const scoreBg = (s: number) =>
    s >= 80 ? "bg-emerald-500" : s >= 50 ? "bg-yellow-500" : "bg-rose-500";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-950 text-neutral-200 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          Assessment Reports
        </h1>
        <p className="text-neutral-400 mb-8">
          All completed candidate assessments are shown here in real-time.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : reports.length === 0 ? (
          <div className="border border-neutral-800 bg-neutral-900/50 rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No reports yet</h3>
            <p className="text-neutral-400">Reports will appear here once candidates complete their assessments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">

                {/* Report Header Row */}
                <div
                  className={`flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-800/50 transition-colors ${
                    report.violations?.terminated ? 'border-b border-red-500/50 bg-red-500/5' : ''
                  }`}
                  onClick={() => toggle(report.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Score Ring */}
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      report.scorePercent >= 80 ? 'border-emerald-500 bg-emerald-500/10' :
                      report.scorePercent >= 50 ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-rose-500 bg-rose-500/10'
                    }`}>
                      <span className={`text-lg font-bold ${scoreColor(report.scorePercent)}`}>
                        {report.scorePercent}%
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-neutral-500" />
                        <span className="font-bold text-white">{report.candidateName}</span>
                        <span className="text-xs text-neutral-600 font-mono">({report.candidateId})</span>
                        {report.violations?.terminated && (
                          <span className="ml-2 px-2 py-0.5 bg-red-600/30 text-red-300 text-xs font-bold rounded border border-red-500/50">
                            🚫 TERMINATED - Tab Switch Violations
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-neutral-400 mt-0.5">
                        {report.questionsAttempted}/{report.totalQuestions} questions attempted &middot;&nbsp;
                        {report.totalTestsPassed}/{report.totalTestsAvailable} tests passed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(report.finishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-neutral-600 text-right mt-0.5">
                        {new Date(report.finishedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                    {expandedId === report.id
                      ? <ChevronUp className="w-5 h-5 text-neutral-500" />
                      : <ChevronDown className="w-5 h-5 text-neutral-500" />
                    }
                  </div>
                </div>

                {/* Score Bar */}
                <div className="px-5 pb-1">
                  <div className="w-full bg-neutral-800 rounded-full h-1">
                    <div className={`h-1 rounded-full ${scoreBg(report.scorePercent)}`}
                      style={{ width: `${report.scorePercent}%` }} />
                  </div>
                </div>

                {/* Expanded Question Breakdown */}
                {expandedId === report.id && (
                  <div className="px-5 pb-5 pt-4 border-t border-neutral-800 mt-3">
                    {/* Violation Alert */}
                    {report.violations?.terminated && (
                      <div className="mb-4 p-4 bg-red-950/30 border border-red-600/50 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-red-300 font-bold text-sm">Integrity Violation Detected</p>
                          <p className="text-red-200/70 text-xs mt-1">
                            This assessment was terminated after {report.violations.tabSwitches} tab switch violations. The candidate attempted to switch tabs/windows during the exam, which triggered an automatic termination.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                      Question Breakdown
                    </h3>
                    <div className="space-y-2">
                      {report.questions.map((q, i) => (
                        <div key={q.questionId}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            q.allPassed ? 'border-emerald-800/50 bg-emerald-950/20' :
                            q.passed > 0 ? 'border-yellow-800/50 bg-yellow-950/20' :
                            'border-neutral-800 bg-neutral-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {q.allPassed
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            }
                            <div>
                              <span className="text-sm font-medium text-white">Q{i + 1}: {q.questionTitle}</span>
                              <span className="ml-2 text-xs text-neutral-500 font-mono">{q.language}</span>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${
                            q.allPassed ? 'text-emerald-400' : q.passed > 0 ? 'text-yellow-400' : 'text-rose-400'
                          }`}>
                            {q.passed}/{q.totalTests} tests
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                      <span>Interview ID: <span className="font-mono text-neutral-400">{report.interviewId}</span></span>
                      <span>Report ID: <span className="font-mono text-neutral-400">{report.id}</span></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
