"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, CheckCircle2, XCircle, Clock, User, ChevronDown, ChevronUp, Trophy, AlertTriangle, Shield, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { fetchReports, type AssessmentReport } from "@/lib/api";

export default function ReportsPage() {
  const { currentUser, getRecruiterCandidates } = useAuth();
  const [reports, setReports] = useState<AssessmentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await fetchReports();
        const recruiterCandidateIds = new Set(
          getRecruiterCandidates(currentUser.id).map(c => c.id)
        );
        const filteredReports = data.filter((report: AssessmentReport) =>
          recruiterCandidateIds.has(report.candidateId)
        );
        setReports(filteredReports);
      } catch (e: any) {
        console.error("Failed to load reports", e);
        setError("Failed to fetch reports. Please ensure the backend server is running.");
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#050505] text-white p-8 overflow-hidden relative">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Assessment Reports</h1>
              <p className="text-neutral-400 text-sm mt-1 max-w-md">All completed candidate assessments in real-time, packed with AI insights.</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            <p className="text-neutral-400 text-sm font-medium">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="border border-rose-500/30 bg-rose-500/10 backdrop-blur-md rounded-3xl p-16 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-rose-300 mb-2">Connection Error</h3>
            <p className="text-rose-200/60 max-w-md mx-auto">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-md rounded-3xl p-16 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FileText className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No reports yet</h3>
            <p className="text-neutral-400">Reports will appear here once candidates complete their assessments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`bg-neutral-900/60 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all shadow-xl hover:shadow-2xl hover:bg-neutral-900/80 ${
                  report.violations?.terminated
                    ? "border-rose-500/30 shadow-rose-900/10 hover:border-rose-500/50"
                    : "border-neutral-800/60 hover:border-neutral-600"
                }`}
              >
                {/* Report Header Row */}
                <div
                  className="flex items-center justify-between p-6 cursor-pointer group"
                  onClick={() => toggle(report.id)}
                >
                  <div className="flex items-center gap-6">
                    {/* Score Ring */}
                    <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-inner ${scoreBorderColor(report.scorePercent)}`}>
                      <span className={`text-xl font-black ${scoreColor(report.scorePercent)}`}>
                        {report.scorePercent}%
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                          <User className="w-4 h-4 text-neutral-400" />
                          <span className="font-bold text-white text-lg tracking-wide">{report.candidateName}</span>
                        </div>
                        <span className="text-xs text-neutral-500 font-mono bg-black/40 px-2 py-1 rounded">ID: {report.candidateId}</span>
                        {report.violations?.terminated && (
                          <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-black tracking-widest rounded-lg border border-rose-500/30 shadow-inner">
                            🚫 TERMINATED
                          </span>
                        )}
                        {/* Plagiarism badge */}
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
                            <span className={`px-3 py-1 text-xs font-black tracking-widest rounded-lg border flex items-center gap-1.5 shadow-inner ${badgeClass}`}>
                              <ShieldAlert className="w-3.5 h-3.5" />
                              AI RISK: {maxRisk.toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="text-sm text-neutral-400 flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-neutral-500"/> {report.questionsAttempted}/{report.totalQuestions} Questions</span>
                        <span className="text-neutral-600">•</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500/70"/> {report.totalTestsPassed}/{report.totalTestsAvailable} Tests Passed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 justify-end mb-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        {new Date(report.finishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono text-right">
                        {new Date(report.finishedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center transition-all ${expandedId === report.id ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-inner' : 'group-hover:bg-white/10 text-neutral-400'}`}>
                      {expandedId === report.id
                        ? <ChevronUp className="w-5 h-5" />
                        : <ChevronDown className="w-5 h-5" />
                      }
                    </div>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="px-6 pb-4">
                  <div className="w-full bg-black/50 rounded-full h-2 shadow-inner overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${scoreBarColor(report.scorePercent)}`}
                      style={{ width: `${report.scorePercent}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Question Breakdown */}
                {expandedId === report.id && (
                  <div className="px-6 pb-6 pt-4 border-t border-white/5 bg-black/20">
                    {/* Violation Alert */}
                    {report.violations?.terminated && (
                      <div className="mb-6 p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-4 shadow-inner">
                        <AlertTriangle className="w-6 h-6 text-rose-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-rose-300 font-bold text-base mb-1">Integrity Violation Detected</p>
                          <p className="text-rose-200/70 text-sm leading-relaxed max-w-2xl">
                            This assessment was terminated after <strong>{report.violations.tabSwitches} tab switch violations</strong>. The candidate attempted to navigate away from the exam window, triggering automatic termination.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-5">
                      <Shield className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-sm font-black text-indigo-300/80 uppercase tracking-widest">
                        Question Breakdown
                      </h3>
                    </div>
                    <div className="space-y-3">
                       {report.questions.map((q, i) => (
                        <div
                          key={q.questionId}
                          className={`p-5 rounded-2xl border transition-colors shadow-sm ${
                            q.allPassed
                              ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                              : q.passed > 0
                              ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                              : "border-white/5 bg-black/40 hover:bg-black/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {q.allPassed
                                ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                              }
                              <div>
                                <span className="text-base font-bold text-white">Q{i + 1}: {q.questionTitle}</span>
                                <span className="ml-3 text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md text-neutral-300 border border-white/10 shadow-inner">
                                  {q.language}
                                </span>
                              </div>
                            </div>
                            <span className={`text-base font-black tracking-wide ${
                              q.allPassed ? "text-emerald-400" : q.passed > 0 ? "text-amber-400" : "text-rose-400"
                            }`}>
                              {q.passed}/{q.totalTests} <span className="text-xs font-semibold opacity-70">TESTS</span>
                            </span>
                          </div>

                          {/* Per-question plagiarism detail */}
                          {q.plagiarismWarning?.detected && (() => {
                            const risk = q.plagiarismWarning.riskLevel;
                            const plagBg = risk === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-500/10'
                              : risk === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300 shadow-orange-500/10'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-amber-500/10';
                            return (
                              <div className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-inner text-sm font-medium ${plagBg}`}>
                                <ShieldAlert className="w-5 h-5 shrink-0" />
                                <span>
                                  Plagiarism detected ·{" "}
                                  <strong className="font-black text-white">{q.plagiarismWarning.similarityPercent}% similarity</strong>{" "}
                                  · Risk: <span className="uppercase font-black text-white">{risk}</span>
                                  {q.plagiarismWarning.matchCount ? ` · ${q.plagiarismWarning.matchCount} match(es)` : ""}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-600 font-mono">
                      <span className="bg-black/50 px-2 py-1 rounded border border-white/5">INTV: {report.interviewId}</span>
                      <span className="bg-black/50 px-2 py-1 rounded border border-white/5">RPT: {report.id}</span>
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
