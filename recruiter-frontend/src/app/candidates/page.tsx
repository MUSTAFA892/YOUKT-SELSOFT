"use client";

import { useEffect, useState } from "react";
import { getAllActivityLogs, getAllInterviews, getCandidateInsights, type ActivityLog, type Interview, type CandidateInsights } from "@/lib/api";
import { Loader2, Users, Search, Filter, ArrowUpRight, Clock, Target, Calendar, ChevronDown, MessageCircle, BarChart3, ShieldAlert, Award, BrainCircuit, Activity, Flame } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import CandidateMessages from "@/components/CandidateMessages";

// --- SUB-COMPONENTS ---

function ContributionCalendar({ logs }: { logs: ActivityLog[] }) {
  // Generate last 26 weeks of dates
  const weeks = 26;
  const days = 7;
  const totalDays = weeks * days;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Aggregate logs by date string
  const activityMap = new Map<string, number>();
  logs.forEach(log => {
    const d = new Date(log.submittedAt);
    const dateStr = d.toISOString().split('T')[0];
    activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
  });

  const calendarData: { date: string; count: number }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    calendarData.push({
      date: dateStr,
      count: activityMap.get(dateStr) || 0
    });
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-neutral-800/40';
    if (count === 1) return 'bg-amber-500/30';
    if (count === 2) return 'bg-amber-500/60';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Consistency Pulse</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-tighter">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${getColor(i)}`} />
            ))}
          </div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-tighter">More</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none justify-center sm:justify-start">
        {Array.from({ length: weeks }).map((_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {Array.from({ length: days }).map((_, dayIdx) => {
              const dataIdx = (weekIdx * days) + dayIdx;
              const data = calendarData[dataIdx];
              return (
                <div
                  key={dayIdx}
                  className={`w-3.5 h-3.5 rounded-[2px] ${getColor(data.count)} transition-all hover:ring-2 hover:ring-white/20 relative group`}
                  title={`${data.date}: ${data.count} submissions`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-neutral-900 border border-neutral-800 text-[9px] text-white px-2 py-1 rounded whitespace-nowrap shadow-2xl">
                      {new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {data.count} hits
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillHeatmap({ skills }: { skills: CandidateInsights['skillHeatmap'] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-amber-500" />
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Skill Mastery</h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {skills.map((skill, i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-tight">{skill.topic}</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{skill.score}%</span>
              <span className="text-[10px] text-neutral-600 italic">{skill.problemsSolved} solved</span>
            </div>
            <div className="w-full h-1 bg-neutral-800 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                style={{ width: `${skill.score}%`, opacity: Math.max(0.3, skill.score / 100) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisDashboard({ candidateId, logs }: { candidateId: string, logs: ActivityLog[] }) {
  const [insights, setInsights] = useState<CandidateInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCandidateInsights(candidateId);
        setInsights(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-neutral-500 text-xs italic">
      <Loader2 className="w-3 h-3 animate-spin" /> Analyzing performance data...
    </div>
  );

  if (!insights) return null;

  const riskColor = 
    insights.integritySummary.overallRisk === 'critical' ? 'text-rose-500 bg-rose-500/10' :
    insights.integritySummary.overallRisk === 'high' ? 'text-orange-500 bg-orange-500/10' :
    insights.integritySummary.overallRisk === 'medium' ? 'text-amber-500 bg-amber-500/10' :
    'text-emerald-500 bg-emerald-500/10';

  return (
    <div className="p-8 space-y-12 bg-neutral-950/40">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Difficulty Recommendation */}
        <div className="lg:col-span-3 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">AI Recommendation</h4>
                  <p className="text-xs text-neutral-500">Suggested difficulty for future assignments</p>
                </div>
              </div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className={`text-3xl font-black uppercase italic ${
                  insights.difficultyRecommendation.level === 'Hard' ? 'text-rose-500' :
                  insights.difficultyRecommendation.level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {insights.difficultyRecommendation.level}
                </span>
                <span className="text-xs text-neutral-400 font-medium">Predicted Level</span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-lg mb-6">"{insights.difficultyRecommendation.reasoning}"</p>
            </div>
            
            <div className="md:w-[1px] md:h-24 bg-neutral-800 self-center hidden md:block" />
            
            <div className="flex-1 min-w-[280px]">
              <ContributionCalendar logs={logs} />
            </div>
          </div>
        </div>

        {/* Integrity Summary */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-5 h-5 text-neutral-500" />
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Integrity Pulse</h4>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Risk Factor</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-current ${riskColor}`}>
                {insights.integritySummary.overallRisk}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Plagiarism Warnings</span>
                <span className="font-bold text-white">{insights.integritySummary.totalPlagiarismWarnings}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Violation Records</span>
                <span className="font-bold text-white">{insights.integritySummary.violationCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SkillHeatmap skills={insights.skillHeatmap} />
    </div>
  );
}

// --- MAIN PAGE ---



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
                    <div
                      onClick={() => toggleCandidate(candidate.candidateId)}
                      className="w-full px-6 py-5 hover:bg-neutral-800/50 transition-colors flex items-center justify-between cursor-pointer"
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
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-neutral-800">
                        <AnalysisDashboard candidateId={candidate.candidateId} logs={candidate.logs} />
                        
                        <div className="px-8 pb-8">
                          <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-neutral-500" />
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Historical Activity</h4>
                          </div>
                          <div className="overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl">
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
