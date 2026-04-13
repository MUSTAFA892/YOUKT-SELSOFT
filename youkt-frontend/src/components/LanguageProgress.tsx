"use client";

import { useEffect, useState } from "react";
import { Code2, ChevronRight, Terminal, Zap, Brain, Activity } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface LanguageStats {
  language: string;
  problemsSolved: number;
  totalProblems: number;
  percentage: number;
  accent: string;
}

export default function LanguageProgress() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<LanguageStats[]>([
    { language: "python"     , problemsSolved: 3, totalProblems: 10, percentage: 30, accent: "#6366f1" },
    { language: "javascript" , problemsSolved: 1, totalProblems: 10, percentage: 10, accent: "#F59E0B" },
    { language: "java"       , problemsSolved: 0, totalProblems: 10, percentage: 0, accent: "#EF4444" },
    { language: "c"          , problemsSolved: 0, totalProblems: 10, percentage: 0, accent: "#06B6D4" },
  ]);
  const [activeTab, setActiveTab] = useState(stats[0].language);

  const activeStat = stats.find(s => s.language === activeTab) || stats[0];

  return (
    <section className="w-full py-12 px-6 max-w-7xl mx-auto">
      <div className="glass-morphism rounded-[2rem] overflow-hidden border border-border flex flex-col md:flex-row h-auto md:h-72 shadow-3d">
        {/* Sidebar / Switcher */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar">
          {stats.map((stat) => (
            <button
              key={stat.language}
              onClick={() => setActiveTab(stat.language)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap
                ${activeTab === stat.language ? 'bg-foreground/10 text-foreground shadow-lg' : 'text-neutral-500 hover:text-foreground hover:bg-foreground/5'}
              `}
            >
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: stat.accent }} />
              <span className="text-sm font-bold capitalize">{stat.language}</span>
              {stat.percentage > 0 && (
                <span className="ml-auto text-[10px] font-mono bg-foreground/5 px-1.5 py-0.5 rounded text-neutral-400">
                  {stat.percentage}%
                </span>
              )}
            </button>
          ))}
          <div className="mt-auto hidden md:flex items-center gap-2 p-4 text-[10px] font-black text-neutral-600 uppercase tracking-widest border-t border-border">
            <Activity className="w-3 h-3" />
            <span>Select Track</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 relative overflow-hidden bg-gradient-to-br from-transparent to-foreground/[0.02]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col justify-between relative z-10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-4xl font-black text-foreground capitalize mb-1">{activeStat.language}</h3>
                  <p className="text-xs text-neutral-500 font-medium tracking-tight">Technical Mastery Track</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-black text-foreground">{activeStat.percentage}%</span>
                  <p className="text-[10px] font-bold text-neutral-600 uppercase">Completed</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border my-4">
                <MiniStat label="Solved" value={activeStat.problemsSolved} />
                <MiniStat label="Remaining" value={activeStat.totalProblems - activeStat.problemsSolved} />
                <MiniStat label="Accuracy" value="--" />
                <MiniStat label="Rank" value="--" />
              </div>

              <div className="flex items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${activeStat.percentage}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: activeStat.accent }}
                    />
                  </div>
                </div>
                <Link 
                  href={`/track/${activeStat.language}`}
                  className="px-6 py-3 bg-foreground text-background text-xs font-black rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 group whitespace-nowrap"
                >
                  Enter Arena
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Background Decorative Element */}
          <div 
            className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 blur-[80px] opacity-10 rounded-full transition-colors duration-500"
            style={{ backgroundColor: activeStat.accent }}
          />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{label}</div>
    </div>
  );
}


function StatItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-mono font-bold text-foreground">{value}</span>
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function LanguageSmallIcon({ language }: { language: string }) {
  if (language === 'javascript') return <Terminal className="w-6 h-6 text-amber-500" />;
  if (language === 'java') return <Brain className="w-6 h-6 text-rose-500" />;
  if (language === 'c') return <Zap className="w-6 h-6 text-cyan-500" />;
  return <Code2 className="w-6 h-6 text-indigo-500" />;
}


function LanguageIcon({ language, color }: { language: string, color: string }) {
  // Simple icons mapping
  if (language === 'python') return <Code2 className="w-8 h-8" style={{ color }} />;
  if (language === 'javascript') return <Terminal className="w-8 h-8" style={{ color }} />;
  if (language === 'java') return <Brain className="w-8 h-8" style={{ color }} />;
  if (language === 'c') return <Zap className="w-8 h-8" style={{ color }} />;
  return <Code2 className="w-8 h-8" />;
}



