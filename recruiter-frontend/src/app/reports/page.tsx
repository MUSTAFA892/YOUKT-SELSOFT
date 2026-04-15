"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, CheckCircle2, XCircle, Clock, User, ChevronDown, ChevronUp, Trophy, AlertTriangle, Shield, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

interface PlagiarismWarning {
  detected: boolean;
  similarityPercent: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matchCount?: number;
}

interface QuestionReport {
  questionId: string;
  questionTitle: string;
  totalTests: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  language: string;
  plagiarismWarning?: PlagiarismWarning;
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
  plagiarismWarning?: PlagiarismWarning;
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
    s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-rose-400";
  const scoreBorderColor = (s: number) =>
    s >= 80 ? "border-emerald-500/50 bg-emerald-500/10" : s >= 50 ? "border-amber-500/50 bg-amber-500/10" : "border-rose-500/50 bg-rose-500/10";
  const scoreBarColor = (s: number) =>
    s >= 80 ? "bg-emerald-500" : s >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black text-white p-8">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Assessment Reports</h1>
              <p className="text-white/40 text-sm mt-0.5">All completed candidate assessments in real-time</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
            <p className="text-white/40 text-sm">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-3xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No reports yet</h3>
            <p className="text-white/40">Reports will appear here once candidates complete their assessments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`bg-white/5 backdrop-blur-sm border rounded-3xl overflow-hidden transition-all ${
                  report.violations?.terminated
                    ? "border-rose-500/30"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Report Header Row */}
                <div
                  className="flex items-center justify-between p-6 cursor-pointer group"
                  onClick={() => toggle(report.id)}
                >
                  <div className="flex items-center gap-5">
                    {/* Score Ring */}
                    <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 ${scoreBorderColor(report.scorePercent)}`}>
                      <span className={`text-lg font-black ${scoreColor(report.scorePercent)}`}>
                        {report.scorePercent}%
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <User className="w-4 h-4 text-white/30" />
                        <span className="font-bold text-white text-lg">{report.candidateName}</span>
                        <span className="text-xs text-white/30 font-mono">({report.candidateId})</span>
                        {report.violations?.terminated && (
                          <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30">
                            🚫 TERMINATED
                          </span>
                        )}
                        {/* Plagiarism badge — show if any question was flagged OR top-level warning */}
                        {(() => {
                          const hasPlag = report.plagiarismWarning?.detected ||
                            report.questions.some(q => q.plagiarismWarning?.detected);
                          const maxRisk = report.questions.reduce((worst, q) => {
                            const order = { low: 0, medium: 1, high: 2, critical: 3 };
                            if (!q.plagiarismWarning) return worst;
                            return order[q.plagiarismWarning.riskLevel] > order[worst] ? q.plagiarismWarning.riskLevel : worst;
                          }, (report.plagiarismWarning?.riskLevel || 'low') as 'low' | 'medium' | 'high' | 'critical');
                          if (!hasPlag) return null;
                          const badgeClass = maxRisk === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : maxRisk === 'high'
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                          return (
                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1 ${badgeClass}`}>
                              <ShieldAlert className="w-3 h-3" />
                              AI RISK · {maxRisk.toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="text-sm text-white/40">
                        {report.questionsAttempted}/{report.totalQuestions} questions attempted &nbsp;·&nbsp;
                        {report.totalTestsPassed}/{report.totalTestsAvailable} tests passed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-white/30 justify-end">
                        <Clock className="w-3 h-3" />
                        {new Date(report.finishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div className="text-xs text-white/20 text-right mt-0.5">
                        {new Date(report.finishedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      {expandedId === report.id
                        ? <ChevronUp className="w-4 h-4 text-white/60" />
                        : <ChevronDown className="w-4 h-4 text-white/60" />
                      }
                    </div>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="px-6 pb-2">
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${scoreBarColor(report.scorePercent)}`}
                      style={{ width: `${report.scorePercent}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Question Breakdown */}
                {expandedId === report.id && (
                  <div className="px-6 pb-6 pt-4 border-t border-white/10 mt-2">
                    {/* Violation Alert */}
                    {report.violations?.terminated && (
                      <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-rose-300 font-bold text-sm">Integrity Violation Detected</p>
                          <p className="text-rose-200/60 text-xs mt-1 leading-relaxed">
                            This assessment was terminated after {report.violations.tabSwitches} tab switch violations. The candidate attempted to switch tabs/windows during the exam, triggering automatic termination.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-4 h-4 text-white/30" />
                      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Question Breakdown
                      </h3>
                    </div>
                    <div className="space-y-2">
                       {report.questions.map((q, i) => (
                        <div
                          key={q.questionId}
                          className={`p-4 rounded-2xl border ${
                            q.allPassed
                              ? "border-emerald-500/20 bg-emerald-500/5"
                              : q.passed > 0
                              ? "border-amber-500/20 bg-amber-500/5"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {q.allPassed
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              }
                              <div>
                                <span className="text-sm font-semibold text-white">Q{i + 1}: {q.questionTitle}</span>
                                <span className="ml-2 text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-white/50 border border-white/10">
                                  {q.language}
                                </span>
                              </div>
                            </div>
                            <span className={`text-sm font-bold ${
                              q.allPassed ? "text-emerald-400" : q.passed > 0 ? "text-amber-400" : "text-rose-400"
                            }`}>
                              {q.passed}/{q.totalTests} tests
                            </span>
                          </div>

                          {/* Per-question plagiarism detail */}
                          {q.plagiarismWarning?.detected && (() => {
                            const risk = q.plagiarismWarning.riskLevel;
                            const plagBg = risk === 'critical' ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                              : risk === 'high' ? 'bg-orange-500/10 border-orange-500/25 text-orange-300'
                              : 'bg-amber-500/10 border-amber-500/25 text-amber-300';
                            return (
                              <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${plagBg}`}>
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  Plagiarism detected ·{" "}
                                  <strong>{q.plagiarismWarning.similarityPercent}% similarity</strong>{" "}
                                  · Risk: <span className="uppercase font-black">{risk}</span>
                                  {q.plagiarismWarning.matchCount ? ` · ${q.plagiarismWarning.matchCount} match(es)` : ""}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/20 font-mono">
                      <span>Interview: {report.interviewId}</span>
                      <span>Report: {report.id}</span>
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


