"use client";

import { useEffect, useState } from "react";
import { getAllActivityLogs, getAllInterviews, getCandidateInsights, type ActivityLog, type Interview, type CandidateInsights } from "@/lib/api";
import { Loader2, Users, Search, Filter, ArrowUpRight, Clock, Target, Calendar, ChevronDown, MessageCircle, BarChart3, ShieldAlert, Award, BrainCircuit, Activity, Flame } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
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
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-indigo-500/30';
    if (count === 2) return 'bg-indigo-500/60';
    return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Consistency Pulse</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Less</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-3 h-3 rounded-[3px] ${getColor(i)}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">More</span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar justify-center sm:justify-start">
        {Array.from({ length: weeks }).map((_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1.5">
            {Array.from({ length: days }).map((_, dayIdx) => {
              const dataIdx = (weekIdx * days) + dayIdx;
              const data = calendarData[dataIdx];
              return (
                <div
                  key={dayIdx}
                  className={`w-4 h-4 rounded-[3px] ${getColor(data.count)} transition-all hover:scale-125 hover:ring-2 hover:ring-white/30 hover:z-10 relative group cursor-pointer`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-black/90 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                      {new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {data.count} submissions
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
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-5 h-5 text-emerald-400" />
        <h4 className="text-xs font-black text-emerald-300/80 uppercase tracking-widest">Skill Mastery Profiler</h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {skills.map((skill, i) => (
          <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 shadow-inner hover:bg-black/60 transition-colors">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{skill.topic}</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{skill.score}%</span>
              <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2 py-1 rounded-md">{skill.problemsSolved} SOLVED</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full mt-2 overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${skill.score}%`, opacity: Math.max(0.4, skill.score / 100) }}
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
    <div className="flex items-center justify-center gap-3 py-12 text-neutral-400 text-sm font-bold bg-black/20">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> Analyzing AI performance data...
    </div>
  );

  if (!insights) return null;

  const riskColor = 
    insights.integritySummary.overallRisk === 'critical' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
    insights.integritySummary.overallRisk === 'high' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
    insights.integritySummary.overallRisk === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]';

  return (
    <div className="p-8 space-y-12 bg-black/20 relative overflow-hidden">
      {/* Subtle interior glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Difficulty Recommendation */}
        <div className="lg:col-span-3 bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
            <BrainCircuit className="w-48 h-48 text-indigo-400" />
          </div>
          <div className="flex flex-col md:flex-row gap-10 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-1">AI Recommendation</h4>
                  <p className="text-xs text-neutral-500 font-medium">Suggested future assignments</p>
                </div>
              </div>
              <div className="flex items-baseline gap-3 mb-5">
                <span className={`text-4xl font-black uppercase tracking-tight ${
                  insights.difficultyRecommendation.level === 'Hard' ? 'text-rose-400' :
                  insights.difficultyRecommendation.level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {insights.difficultyRecommendation.level}
                </span>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Predicted Level</span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-lg mb-6 border-l-2 border-indigo-500/30 pl-4 py-1 italic font-medium">
                "{insights.difficultyRecommendation.reasoning}"
              </p>
            </div>
            
            <div className="md:w-px md:h-auto bg-gradient-to-b from-transparent via-white/10 to-transparent self-stretch hidden md:block" />
            
            <div className="flex-1 min-w-[320px]">
              <ContributionCalendar logs={logs} />
            </div>
          </div>
        </div>

        {/* Integrity Summary */}
        <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="w-6 h-6 text-neutral-400" />
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Integrity Pulse</h4>
          </div>
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Risk Factor</span>
              <span className={`text-sm font-black uppercase tracking-widest px-4 py-2 rounded-xl border text-center ${riskColor}`}>
                {insights.integritySummary.overallRisk}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Plagiarism Warnings</span>
                <span className="font-black text-white text-lg">{insights.integritySummary.totalPlagiarismWarnings}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Violation Records</span>
                <span className="font-black text-white text-lg">{insights.integritySummary.violationCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <SkillHeatmap skills={insights.skillHeatmap} />
      </div>
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
  const { currentUser, getRecruiterCandidates, unreadHelpRequests, leftTestNotifications } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCandidates, setExpandedCandidates] = useState<Set<string>>(new Set());
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; interviewId: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [logsData, interviewsData] = await Promise.all([
          getAllActivityLogs(),
          getAllInterviews(),
        ]);
        
        const recruiterCandidateIds = new Set(
          getRecruiterCandidates(currentUser.id).map(c => c.id)
        );
        
        const filteredLogs = logsData.filter(log => recruiterCandidateIds.has(log.candidateId));
        const filteredInterviews = interviewsData.filter(interview => recruiterCandidateIds.has(interview.candidateId));
        
        setLogs(filteredLogs);
        setInterviews(filteredInterviews);
      } catch (e) {
        setError("Could not connect to the backend server. Please ensure it is running.");
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

  const interviewCandidates = new Map<string, { name: string; count: number }>();
  interviews.forEach(interview => {
    if (!interviewCandidates.has(interview.candidateId)) {
      interviewCandidates.set(interview.candidateId, { name: interview.candidateName, count: 0 });
    }
    const data = interviewCandidates.get(interview.candidateId)!;
    data.count++;
  });

  const allCandidateIds = new Set<string>();
  logs.forEach(log => allCandidateIds.add(log.candidateId));
  interviewCandidates.forEach((_, id) => allCandidateIds.add(id));

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
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#050505]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center bg-[#050505] text-rose-400 gap-4">
        <ShieldAlert className="w-16 h-16 opacity-80" />
        <h2 className="text-2xl font-bold">Connection Error</h2>
        <p className="text-rose-200/60 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#050505] text-neutral-200 p-8 overflow-hidden relative">
      {/* Deep Background Glows */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Candidate Analytics</h1>
            </div>
            <p className="text-neutral-400 text-sm max-w-md">Monitor practice problem performance and AI insights across all candidates.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by name, ID or problem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner text-white placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Active Candidates</span>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter">{stats.totalCandidates}</div>
          </div>
          
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Avg. Accuracy</span>
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tighter">{stats.avgAccuracy}%</div>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Total Submissions</span>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter">{stats.totalAttempts}</div>
          </div>
        </div>

        {/* Candidate Progress with Expandable Details */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-white uppercase text-sm tracking-widest flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Candidate Roster
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Filter className="w-3.5 h-3.5" />
              Click rows to expand
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-3xl px-8 py-24 text-center text-neutral-500 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-neutral-600" />
              </div>
              <p className="font-medium text-lg">{searchTerm ? "No results matching your search." : "No candidate data recorded yet."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => {
                const isExpanded = expandedCandidates.has(candidate.candidateId);
                return (
                  <div key={candidate.candidateId} className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-white/10 transition-all duration-300">
                    {/* Candidate Summary Row */}
                    <div
                      onClick={() => toggleCandidate(candidate.candidateId)}
                      className="w-full px-8 py-6 hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="font-bold text-xl text-white text-left tracking-wide">{candidate.candidateName}</div>
                            {unreadHelpRequests && unreadHelpRequests.includes(candidate.candidateId) && (
                              <span className="text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-lg">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                Live Help Required
                              </span>
                            )}
                            {leftTestNotifications && leftTestNotifications.includes(candidate.candidateId) && (
                              <span className="text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                Left/Quit Test
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-neutral-500 text-left bg-black/40 inline-block px-2 py-1 rounded border border-white/5">ID: {candidate.candidateId}</div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right">
                            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Interviews</div>
                            <div className="text-2xl font-black text-indigo-400">{candidate.interviewCount}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Problems</div>
                            <div className="text-2xl font-black text-amber-400">{candidate.totalProblems}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Accuracy</div>
                            <div className={`text-2xl font-black ${candidate.accuracy >= 80 ? 'text-emerald-400' : candidate.accuracy >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {candidate.accuracy}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 ml-8 pl-8 border-l border-white/5">
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
                          className={`p-3.5 rounded-2xl transition-all active:scale-95 border shadow-lg group/msg flex items-center justify-center ${
                            unreadHelpRequests && unreadHelpRequests.includes(candidate.candidateId)
                              ? 'bg-rose-500/10 border-rose-500 text-rose-400 hover:bg-rose-500 hover:text-white ring-4 ring-rose-500/10 animate-pulse'
                              : leftTestNotifications && leftTestNotifications.includes(candidate.candidateId)
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white ring-4 ring-amber-500/10'
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                          }`}
                          title="Chat with candidate"
                        >
                          <MessageCircle className="w-6 h-6 group-hover/msg:animate-pulse" />
                        </button>
                        
                        <div className={`w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center transition-all ${isExpanded ? 'bg-white/10 text-white' : 'text-neutral-500 group-hover:bg-white/5'}`}>
                          <ChevronDown 
                            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-white/5 bg-black/20">
                        <AnalysisDashboard candidateId={candidate.candidateId} logs={candidate.logs} />
                        
                        <div className="px-8 pb-8 pt-4">
                          <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-neutral-400" />
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Historical Activity Log</h4>
                          </div>
                          <div className="overflow-hidden rounded-2xl border border-white/5 shadow-2xl bg-black/40">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] text-neutral-500 uppercase tracking-widest font-black border-b border-white/5 bg-black/60">
                                <th className="px-6 py-4">Problem Solved</th>
                                <th className="px-6 py-4">Language</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Time Elapsed</th>
                                <th className="px-6 py-4">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {candidate.logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-white tracking-wide">{log.problemTitle}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-[10px] font-black tracking-widest font-mono bg-white/5 px-2 py-1 rounded-md text-neutral-400 border border-white/5 uppercase shadow-inner">
                                      {log.language}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-20 h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                        <div 
                                          className={`h-full rounded-full shadow-sm ${log.allPassed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                          style={{ width: `${(log.passed/log.totalTests)*100}%` }}
                                        />
                                      </div>
                                      <span className={`text-xs font-mono font-black ${log.allPassed ? 'text-emerald-400' : 'text-neutral-400'}`}>
                                        {log.passed}/{log.totalTests}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                      {formatTime(log.timeSpentSeconds)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
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
