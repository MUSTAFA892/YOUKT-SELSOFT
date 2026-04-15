"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCandidateActivityLogs, type ActivityLog } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Trophy, 
  Activity, 
  Users, 
  ChevronRight, 
  LayoutGrid, 
  List as ListIcon,
  BrainCircuit,
  Zap,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import { type Problem } from "@/lib/api";

export default function ProblemsClient({ initialProblems }: { initialProblems: Problem[] }) {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"id" | "difficulty">("id");

  useEffect(() => {
    if (currentUser?.id) {
      getCandidateActivityLogs(currentUser.id).then(setLogs).catch(console.error);
    }
  }, [currentUser]);

  const solvedProblemIds = useMemo(() => {
    return new Set(logs.filter(l => l.allPassed).map(l => l.problemId));
  }, [logs]);

  const stats = useMemo(() => {
    const total = initialProblems.length;
    const solved = initialProblems.filter(p => solvedProblemIds.has(p.id)).length;
    
    const easyTotal = initialProblems.filter(p => p.difficulty === "Easy").length;
    const easySolved = initialProblems.filter(p => p.difficulty === "Easy" && solvedProblemIds.has(p.id)).length;
    
    const medTotal = initialProblems.filter(p => p.difficulty === "Medium").length;
    const medSolved = initialProblems.filter(p => p.difficulty === "Medium" && solvedProblemIds.has(p.id)).length;
    
    const hardTotal = initialProblems.filter(p => p.difficulty === "Hard").length;
    const hardSolved = initialProblems.filter(p => p.difficulty === "Hard" && solvedProblemIds.has(p.id)).length;

    return {
      All: { solved, total },
      Easy: { solved: easySolved, total: easyTotal },
      Medium: { solved: medSolved, total: medTotal },
      Hard: { solved: hardSolved, total: hardTotal }
    };
  }, [initialProblems, solvedProblemIds]);

  const currentStats = stats[difficultyFilter as keyof typeof stats] || stats.All;


  const filteredProblems = useMemo(() => {
    return initialProblems
      .filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesDifficulty = difficultyFilter === "All" || p.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === "id") return Number(a.id) - Number(b.id);
        if (sortBy === "difficulty") {
          const order = { "Easy": 0, "Medium": 1, "Hard": 2 };
          return order[a.difficulty] - order[b.difficulty];
        }
        return 0;
      });
  }, [initialProblems, search, difficultyFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header & Stats Banner */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight">Challenge <span className="text-primary tracking-tighter">Archive</span></h1>
            </div>
            <p className="text-neutral-500 max-w-lg font-medium">
              A curated collection of industry-grade problems designed to push your logic and efficiency to the limit.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <SolvedStatsCircle 
              solved={currentStats.solved} 
              total={currentStats.total} 
              label={difficultyFilter === "All" ? "Overall" : difficultyFilter} 
            />
            <div className="flex gap-4">
              <StatCard label="Total Problems" value={initialProblems.length} icon={Zap} color="text-amber-500" />
              <StatCard label="Solved" value={stats.All.solved} icon={CheckCircle2} color="text-emerald-500" />
              <StatCard label="Rank" value="#124" icon={Trophy} color="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass border-border rounded-3xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-3d">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title, topic, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>
          
          <div className="flex bg-background/50 border border-border rounded-2xl p-1">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-surface shadow-sm text-primary" : "text-neutral-500 hover:text-foreground"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-surface shadow-sm text-primary" : "text-neutral-500 hover:text-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {["All", "Easy", "Medium", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                difficultyFilter === diff 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                : "bg-background/50 border-border text-neutral-500 hover:border-primary/30"
              }`}
            >
              {diff}
            </button>
          ))}
          <div className="h-6 w-[1px] bg-border mx-2" />
          <button 
            onClick={() => setSortBy(sortBy === "id" ? "difficulty" : "id")}
            className="p-2 border border-border rounded-2xl hover:border-primary/30 transition-all text-neutral-500"
            title="Sort results"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Problem Grid/List */}
      <AnimatePresence mode="popLayout">
        {viewMode === "list" ? (
          <motion.div 
            key="list"
            className="grid gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            {filteredProblems.map((problem, i) => (
              <ProblemListItem key={problem.id} problem={problem} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {filteredProblems.map((problem, i) => (
              <ProblemGridItem key={problem.id} problem={problem} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredProblems.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-500 border border-border">
            <Search className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">No problems found</h2>
          <p className="text-neutral-500 mt-2">Try adjusting your filters or search keywords.</p>
          <button 
            onClick={() => { setSearch(""); setDifficultyFilter("All"); }}
            className="mt-6 text-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function ProblemListItem({ problem, index }: { problem: Problem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link href={`/problems/${problem.id}`} className="group block">
        <div className="glass hover:bg-foreground/[0.03] border border-border hover:border-primary/30 rounded-2xl p-4 transition-all duration-300 shadow-3d flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-neutral-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors font-mono font-bold text-xs">
              {problem.id.padStart(2, '0')}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {problem.title}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  problem.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter opacity-60">
                  Topic: Strings & Arrays
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 mr-4">
            <div className="hidden md:flex flex-col items-center">
              <span className="text-xs font-bold text-foreground">1.2k</span>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">Solved</span>
            </div>
            <div className="hidden md:flex flex-col items-center">
              <span className="text-xs font-bold text-foreground">68%</span>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">Success</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-neutral-500 group-hover:translate-x-1 duration-300">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ProblemGridItem({ problem, index }: { problem: Problem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/problems/${problem.id}`} className="group block h-full">
        <div className="glass hover:bg-foreground/[0.03] border border-border hover:border-primary/30 rounded-3xl p-6 transition-all duration-500 shadow-3d flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
              problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-rose-500/10 text-rose-400'
            }`}>
              {problem.difficulty}
            </div>
            <div className="text-neutral-500 group-hover:text-primary transition-colors">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-all duration-300 mb-2 truncate">
            {problem.title}
          </h3>
          <p className="text-neutral-500 text-sm line-clamp-2 mb-6 flex-1 italic">
            {problem.description.replace(/<[^>]*>/g, '').slice(0, 100)}...
          </p>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">68%</span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">Acceptance</span>
              </div>
            </div>
            <button className="bg-foreground/5 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SolvedStatsCircle({ solved, total, label }: { solved: number; total: number; label: string }) {
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-24 h-24">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            className="text-primary shadow-lg"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-foreground leading-none">{solved}</span>
          <div className="h-[1px] w-4 bg-neutral-500/30 my-0.5" />
          <span className="text-[10px] font-bold text-neutral-500 leading-none">{total}</span>
        </div>
      </div>
      <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary/70">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-surface/50 border border-border rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center ${color} shadow-inner`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter opacity-70 leading-none mb-1">{label}</span>
        <span className="text-lg font-black text-foreground leading-none">{value}</span>
      </div>
    </div>
  );
}
