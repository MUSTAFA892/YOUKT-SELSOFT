"use client";

import { useEffect, useState } from "react";
import { getAllActivityLogs, getAllInterviews, type ActivityLog, type Interview } from "@/lib/api";
import { Loader2, Users, Search, Filter, ArrowUpRight, Clock, Target, Calendar, ChevronDown, MessageCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import CandidateMessages from "@/components/CandidateMessages";


interface CandidateProgress {
  candidateId: string;
  candidateName: string;
  logs: ActivityLog[];
  interviewCount: number;
  totalProblems: number;
  passedTests: number;
  totalTests: number;
  accuracy: number;
}

export default function CandidateAnalyticsPage() {
  const { currentUser, getRecruiterCandidates } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; interviewId: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [logsData, interviewsData] = await Promise.all([
          getAllActivityLogs(),
          getAllInterviews(),
        ]);
        
        // Filter to only show this recruiter's candidates
        const recruiterCandidateIds = new Set(
          getRecruiterCandidates(currentUser.id).map(c => c.id)
        );
        
        const filteredLogs = logsData.filter(log => recruiterCandidateIds.has(log.candidateId));
        const filteredInterviews = interviewsData.filter(interview => recruiterCandidateIds.has(interview.candidateId));
        
        setLogs(filteredLogs);
        setInterviews(filteredInterviews);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser, getRecruiterCandidates]);

  const toggleCandidate = (candidateId: string) => {
    const newExpanded = new Set(expandedCandidates);
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId);
    } else {
      newExpanded.add(candidateId);
    }
    setExpandedCandidates(newExpanded);
  };

  // Get unique candidates from interviews
  const interviewCandidates = new Map<string, { name: string; count: number }>();
  interviews.forEach(interview => {
    if (!interviewCandidates.has(interview.candidateId)) {
      interviewCandidates.set(interview.candidateId, { name: interview.candidateName, count: 0 });
    }
    const data = interviewCandidates.get(interview.candidateId)!;
    data.count++;
  });

  // Combine all candidate IDs from logs and interviews
  const allCandidateIds = new Set<string>();
  logs.forEach(log => allCandidateIds.add(log.candidateId));
  interviewCandidates.forEach((_, id) => allCandidateIds.add(id));

  // Create candidate progress objects
  const candidateProgress: CandidateProgress[] = Array.from(allCandidateIds).map(candidateId => {
    const candidateLogs = logs.filter(log => log.candidateId === candidateId);
    const passedTests = candidateLogs.reduce((sum, log) => sum + log.passed, 0);
    const totalTests = candidateLogs.reduce((sum, log) => sum + log.totalTests, 0);
    const interviewCount = interviewCandidates.get(candidateId)?.count || 0;
    const candidateName = 
      candidateLogs[0]?.candidateName ||
      interviewCandidates.get(candidateId)?.name ||
      'Unknown';
    
    return {
      candidateId,
      candidateName,
      logs: candidateLogs,
      interviewCount,
      totalProblems: new Set(candidateLogs.map(l => l.problemTitle)).size,
      passedTests,
      totalTests,
      accuracy: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };
  });

  const filteredCandidates = candidateProgress.filter(c =>
    c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.candidateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalCandidates: candidateProgress.length,
    totalAttempts: logs.length,
    avgAccuracy: logs.length > 0 
      ? Math.round((logs.reduce((s, l) => s + l.passed, 0) / logs.reduce((s, l) => s + l.totalTests, 0)) * 100) 
      : 0
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-950 text-neutral-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Candidate Analytics</h1>
            <p className="text-neutral-400">Monitor practice problem performance across all candidates.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by name, ID or problem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Active Candidates</span>
            </div>
            <div className="text-4xl font-bold text-white">{stats.totalCandidates}</div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Avg. Accuracy</span>
            </div>
            <div className="text-4xl font-bold text-white">{stats.avgAccuracy}%</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Submissions</span>
            </div>
            <div className="text-4xl font-bold text-white">{stats.totalAttempts}</div>
          </div>
        </div>

        {/* Candidate Progress with Expandable Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white uppercase text-sm tracking-widest">Candidate Progress</h3>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Filter className="w-3 h-3" />
              Click to expand details
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-20 text-center text-neutral-500">
              {searchTerm ? "No results matching your search." : "No candidate data recorded yet."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => {
                const isExpanded = expandedCandidates.has(candidate.candidateId);
                return (
                  <div key={candidate.candidateId} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    {/* Candidate Summary Row */}
                    <button
                      onClick={() => toggleCandidate(candidate.candidateId)}
                      className="w-full px-6 py-5 hover:bg-neutral-800/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="font-bold text-white text-left">{candidate.candidateName}</div>
                          <div className="text-[10px] font-mono text-neutral-500 text-left">{candidate.candidateId}</div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="text-xs text-neutral-400 mb-1">Assignments</div>
                            <div className="text-lg font-bold text-purple-400">{candidate.interviewCount}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-neutral-400 mb-1">Problems Solved</div>
                            <div className="text-lg font-bold text-amber-400">{candidate.totalProblems}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-neutral-400 mb-1">Accuracy</div>
                            <div className={`text-lg font-bold ${candidate.accuracy >= 80 ? 'text-emerald-400' : candidate.accuracy >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                              {candidate.accuracy}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-neutral-400 mb-1">Tests Passed</div>
                            <div className="text-lg font-bold text-cyan-400">{candidate.passedTests}/{candidate.totalTests}</div>
                          </div>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const candidateInterviews = interviews.filter(i => i.candidateId === candidate.candidateId);
                          const latestInterviewId = candidateInterviews.length > 0 ? candidateInterviews[0].id : 'default';
                          setActiveChat({ 
                            id: candidate.candidateId, 
                            name: candidate.candidateName,
                            interviewId: latestInterviewId
                          });
                        }}
                        className="ml-4 p-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all active:scale-90 border border-indigo-500/20 shadow-xl shadow-indigo-500/5 group/msg"
                        title="Chat with candidate"
                      >
                        <MessageCircle className="w-5 h-5 group-hover/msg:animate-pulse" />
                      </button>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-neutral-800 bg-neutral-950/50">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-xs text-neutral-500 uppercase font-bold border-b border-neutral-800 bg-neutral-950/30">
                                <th className="px-6 py-4">Problem Solved</th>
                                <th className="px-6 py-4">Language</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                              {candidate.logs.map((log) => (
                                <tr key={log.id} className="hover:bg-neutral-800/20 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-neutral-200">{log.problemTitle}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-[10px] font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700 uppercase">
                                      {log.language}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${log.allPassed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                          style={{ width: `${(log.passed/log.totalTests)*100}%` }}
                                        />
                                      </div>
                                      <span className={`text-xs font-mono font-bold ${log.allPassed ? 'text-emerald-400' : 'text-neutral-400'}`}>
                                        {log.passed}/{log.totalTests}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                      <Clock className="w-3.5 h-3.5 text-neutral-600" />
                                      {formatTime(log.timeSpentSeconds)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                      <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                                      {new Date(log.submittedAt).toLocaleDateString()}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {activeChat && (
        <CandidateMessages 
          candidateId={activeChat.id}
          candidateName={activeChat.name}
          interviewId={activeChat.interviewId}
          recruiterId={currentUser.id}
          recruiterName={currentUser.name}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
