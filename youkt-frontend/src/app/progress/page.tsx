"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCandidateActivityLogs, type ActivityLog, fetchProblems, type Problem } from "@/lib/api";
import { Loader2, Trophy, Clock, Target, Code, CheckCircle2, XCircle } from "lucide-react";
import AdaptiveDifficultyPanel from "@/components/AdaptiveDifficultyPanel";

export default function ProgressPage() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentUser?.id) return;
      try {
        const [userLogs, allProblems] = await Promise.all([
          getCandidateActivityLogs(currentUser.id),
          fetchProblems()
        ]);
        setLogs(userLogs);
        setProblems(allProblems);
      } catch (e) {
        console.error("Failed to load progress data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser.id]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const solvedCount = logs.filter(l => l.allPassed).length;
  const totalTimeSeconds = logs.reduce((sum, l) => sum + l.timeSpentSeconds, 0);
  const totalTestsPassed = logs.reduce((sum, l) => sum + l.passed, 0);
  const totalTestsAvailable = logs.reduce((sum, l) => sum + l.totalTests, 0);
  const avgAccuracy = totalTestsAvailable > 0 ? Math.round((totalTestsPassed / totalTestsAvailable) * 100) : 0;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-950 text-neutral-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">My Learning Progress</h1>
          <p className="text-neutral-400">Track your skills and problem-solving activity.</p>
        </div>

        {/* Adaptive Difficulty Panel */}
        <div className="mb-10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🤖</span> AI-Powered Difficulty Recommendation
          </h2>
          <AdaptiveDifficultyPanel 
            candidateId={currentUser?.id || ""}
            currentDifficulty="medium"
            onDifficultyChange={(newDiff) => {
              console.log("Difficulty changed to:", newDiff);
            }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{solvedCount}</div>
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Solved</div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{logs.length}</div>
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Attempted</div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{avgAccuracy}%</div>
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Accuracy</div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatTime(totalTimeSeconds)}</div>
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Time Spent</div>
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
            <h3 className="font-bold text-white">Problem Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-neutral-500 uppercase font-bold border-b border-neutral-800 bg-neutral-950/30">
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Last Attempt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-neutral-500">
                      No activity yet. Start solving problems!
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const prob = problems.find(p => p.id === log.problemId);
                    return (
                      <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{log.problemTitle}</div>
                        </td>
                        <td className="px-6 py-4">
                          {log.allPassed ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Solved
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                              <XCircle className="w-4 h-4" /> Attempted
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            prob?.difficulty === 'Easy' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' :
                            prob?.difficulty === 'Medium' ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' :
                            'bg-rose-400/10 border-rose-400/20 text-rose-400'
                          }`}>
                            {prob?.difficulty || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-neutral-400 uppercase">{log.language}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          <span className={log.allPassed ? 'text-emerald-400' : 'text-neutral-300'}>
                            {log.passed}/{log.totalTests}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs tabular-nums text-neutral-400">
                          {formatTime(log.timeSpentSeconds)}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-neutral-500 tabular-nums">
                          {new Date(log.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
