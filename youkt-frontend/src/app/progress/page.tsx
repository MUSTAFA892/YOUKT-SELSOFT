"use client";

import { useEffect, useState } from "react";
import { getCandidateInsights, getCandidateActivityLogs, type ActivityLog, type CandidateInsights } from "@/lib/api";
import { Loader2, ArrowUpRight, Clock, Target, Calendar, Activity, Flame, BrainCircuit, Award, BarChart3, TrendingUp, ChevronLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

// --- SUB-COMPONENTS ---

function SkillHeatmap({ skills }: { skills: CandidateInsights['skillHeatmap'] }) {
  if (skills.length === 0) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-amber-500" />
        <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Skill Mastery</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-surface/50 border border-border rounded-2xl p-5 flex flex-col gap-3 group hover:border-amber-500/50 transition-all shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{skill.topic}</span>
              <span className="text-[10px] text-neutral-600 font-mono italic">{skill.problemsSolved} solved</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tracking-tighter">{skill.score}%</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">accuracy</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${skill.score}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                style={{ opacity: Math.max(0.4, skill.score / 100) }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ContributionCalendar({ logs }: { logs: ActivityLog[] }) {
  const weeksCount = 26;
  const daysInWeek = 7;
  
  const toLocalDateStr = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find the end date: the upcoming Saturday (to always show full current week)
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - today.getDay()));
  
  // Calculate start: 26 weeks ago from that Saturday (always starts on a Sunday)
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (weeksCount * daysInWeek - 1));

  const activityMap = new Map<string, number>();
  logs.forEach(log => {
    const d = new Date(log.submittedAt);
    const dateStr = toLocalDateStr(d);
    activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
  });

  const monthLabels: { label: string; index: number }[] = [];
  let prevMonth = -1;

  const weeksData = Array.from({ length: weeksCount }).map((_, weekIdx) => {
    const weekDays = Array.from({ length: daysInWeek }).map((_, dayIdx) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + (weekIdx * 7) + dayIdx);
      const dateStr = toLocalDateStr(d);
      
      if (dayIdx === 0 && d.getMonth() !== prevMonth) {
        monthLabels.push({
          label: d.toLocaleDateString(undefined, { month: 'short' }),
          index: weekIdx
        });
        prevMonth = d.getMonth();
      }

      return {
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
        isFuture: d > today
      };
    });
    return weekDays;
  });

  const getColor = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-neutral-500 opacity-[0.03]';
    if (count === 0) return 'bg-foreground/[0.03]';
    if (count === 1) return 'bg-amber-500/20';
    if (count === 2) return 'bg-amber-500/50 shadow-[inset_0_0_8px_rgba(245,158,11,0.2)]';
    return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
  };

  return (
    <div className="bg-surface/30 border border-border rounded-[2rem] p-8 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h4 className="text-sm font-black text-foreground uppercase tracking-widest italic">Matrix Consistency</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-3 h-3 rounded-[2px] ${getColor(i, false)} border border-white/5`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter">More</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Day Labels - Now aligned perfectly with a grid */}
        <div className="grid grid-rows-7 gap-1.5 pt-[1.75rem] text-[9px] font-black text-neutral-500 uppercase pr-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="flex-1 overflow-x-auto pb-4 scrollbar-none">
          {/* Month Labels */}
          <div className="relative h-5 mb-1">
             {monthLabels.map((m, i) => (
               <div 
                key={i} 
                className="absolute text-[9px] font-black text-neutral-600 uppercase"
                style={{ left: `${m.index * 1.35}rem` }}
               >
                 {m.label}
               </div>
             ))}
          </div>

          <div className="flex gap-1.5">
            {weeksData.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1.5">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-4 h-4 rounded-[3px] ${getColor(day.count, day.isFuture)} border border-white/5 transition-all hover:scale-125 hover:z-10 relative group cursor-pointer`}
                  >
                    {!day.isFuture && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-surface border border-border text-[10px] text-foreground px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
                          <span className="font-black text-amber-500">{day.count} hits</span> on {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateProgressPage() {
  const { currentUser } = useAuth();
  const [insights, setInsights] = useState<CandidateInsights | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    async function loadData() {
      try {
        const [insightsData, logsData] = await Promise.all([
          getCandidateInsights(currentUser.id),
          getCandidateActivityLogs(currentUser.id)
        ]);
        setInsights(insightsData);
        setLogs(logsData);
      } catch (e) {
        console.error("Failed to load progress data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">Syncing Matrix...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 text-center">
          <Target className="w-16 h-16 text-neutral-800 mb-6" />
          <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Initialization Required</h2>
          <p className="text-neutral-500 max-w-sm mb-8 font-medium">Your personal analytics matrix has not been activated. Solve your first problem to begin initialization.</p>
          <Link href="/" className="px-8 py-3 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-2xl">
            Return to Labs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Decorative Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[10%] w-[35%] h-[35%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8 pt-16 space-y-16">
        
        {/* Header Segment */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit">
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Live Sync Alpha v2.0</span>
             </div>
            <h1 className="text-6xl font-black text-foreground tracking-tighter">
              Personal <span className="text-amber-500 italic drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">Analytics</span>
            </h1>
            <p className="text-neutral-500 font-medium max-w-lg leading-relaxed">Your real-time performance matrix across labs, assessments, and coding domains.</p>
          </div>
          
          <div className="flex gap-6">
            <div className="bg-surface/50 border border-border px-8 py-5 rounded-[2rem] text-right group hover:border-amber-500/30 transition-all shadow-3d hover:shadow-xl">
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Overall Accuracy</div>
              <div className="text-4xl font-black text-foreground group-hover:text-amber-500 transition-colors tracking-tighter">{insights.stats.avgScore}%</div>
            </div>
            <div className="bg-surface/50 border border-border px-8 py-5 rounded-[2rem] text-right group hover:border-amber-500/30 transition-all shadow-3d hover:shadow-xl">
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Matrix Mastery</div>
              <div className="text-4xl font-black text-foreground group-hover:text-amber-500 transition-colors tracking-tighter">{insights.stats.problemsSolved}</div>
            </div>
          </div>
        </div>

        {/* Global Matrix View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* AI Recommendation Slot */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-surface/30 border border-border rounded-[3.5rem] p-12 relative overflow-hidden group shadow-3d hover:shadow-2xl backdrop-blur-sm"
          >
            <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] group-hover:opacity-10 scale-150 transition-all duration-1000">
              <BrainCircuit className="w-64 h-64 text-amber-500" />
            </div>
            
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner border border-amber-500/20">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em]">Matrix Recommendation</h3>
                    <p className="text-[10px] text-neutral-600 font-mono tracking-tighter uppercase italic">Adaptive Sync Engine ACTIVE</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-5 mb-8">
                  <span className={`text-7xl font-black tracking-tighter uppercase italic drop-shadow-2xl ${
                    insights.difficultyRecommendation.level === 'Hard' ? 'text-rose-500' :
                    insights.difficultyRecommendation.level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {insights.difficultyRecommendation.level}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />
                  <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em]">Target Rank</span>
                </div>
                
                <p className="text-xl text-neutral-300 font-semibold leading-relaxed max-w-2xl text-balance">
                  "{insights.difficultyRecommendation.reasoning}"
                </p>
              </div>

              <div className="mt-14 pt-10 border-t border-neutral-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
                  <Clock className="w-4 h-4" /> Live Sync 100%
                </div>
                <Link href="/" className="flex items-center gap-3 group/btn bg-white text-black px-6 py-3 rounded-2xl hover:bg-amber-500 transition-all shadow-2xl active:scale-95">
                  <span className="text-xs font-black uppercase tracking-widest">Override & Play</span>
                  <ArrowUpRight className="w-5 h-5 transition-all group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Side Module: Integrity Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-10"
          >
            <div className="bg-surface/30 border border-border rounded-[3rem] p-10 shadow-3d hover:shadow-2xl relative overflow-hidden backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-10">
                <BarChart3 className="w-6 h-6 text-neutral-500" />
                <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em]">Session History</h4>
              </div>
              
              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Practice Labs</div>
                    <div className="text-5xl font-black text-foreground tracking-tighter">{insights.stats.problemsSolved}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-2">Assessments</div>
                    <div className="text-5xl font-black text-indigo-500 tracking-tighter">{insights.stats.interviewsPassed}</div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-border space-y-5">
                   <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">Integrity Score</span>
                    <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border border-current shadow-inner ${
                       insights.integritySummary.overallRisk === 'critical' ? 'text-rose-500 bg-rose-500/10' :
                       insights.integritySummary.overallRisk === 'high' ? 'text-orange-500 bg-orange-500/10' :
                       insights.integritySummary.overallRisk === 'medium' ? 'text-amber-500 bg-amber-500/10' :
                       'text-emerald-500 bg-emerald-500/10'
                    }`}>
                      {insights.integritySummary.overallRisk} RISK
                    </span>
                   </div>
                   <div className="text-[10px] leading-relaxed text-neutral-600 font-bold uppercase tracking-wide">
                     System verified: Cross-ref plagiarism & tab-latency reports.
                   </div>
                </div>
              </div>
            </div>

            {/* Quick Link Card */}
            <Link href="/" className="flex-1 bg-amber-500 rounded-[3rem] p-10 flex flex-col justify-between group cursor-pointer overflow-hidden relative shadow-[0_25px_50px_rgba(245,158,11,0.25)] hover:bg-white transition-all duration-500">
               <div className="absolute top-0 right-0 p-10 text-black/5 scale-150 rotate-12 group-hover:scale-125 transition-transform duration-700">
                 <Target className="w-48 h-48" />
               </div>
               <div className="relative z-10">
                 <h4 className="text-xs font-black text-black/40 uppercase tracking-[0.3em] mb-4">Jump Matrix</h4>
                 <p className="text-3xl font-black text-black leading-none tracking-tighter">Expand your<br/>mastery gap.</p>
               </div>
               <div className="relative z-10 w-fit p-4 bg-black rounded-3xl flex items-center justify-center group-hover:px-10 transition-all duration-500">
                  <ArrowUpRight className="w-6 h-6 text-white group-hover:rotate-45 transition-transform" />
               </div>
            </Link>
          </motion.div>
        </div>

        {/* Consistency Heatmap Area */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500 group-hover:animate-bounce" />
            <h4 className="text-sm font-black text-foreground uppercase tracking-[0.4em]">Active Pulse Mapping</h4>
          </div>
          <ContributionCalendar logs={logs} />
        </motion.section>

        {/* Skill Mastery Grid */}
        <SkillHeatmap skills={insights.skillHeatmap} />

        {/* Footer Padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}


