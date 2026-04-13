"use client";

import { motion } from "framer-motion";
import { Terminal, BrainCircuit, Zap } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export default function ProblemList({ problems }: { problems: Problem[] }) {
  return (
    <section id="problems" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Challenge Arena</h2>
          </div>
          <p className="text-neutral-400">Hand-picked problems to level up your engineering skills.</p>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest opacity-60">
          <Zap className="w-4 h-4" />
          Top Selections
        </div>
      </div>

      <div className="relative">
        <div className="grid gap-4 max-h-[500px] overflow-hidden">
          {problems.slice(0, 5).map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/problems/${problem.id}`} className="group block">
                <div className="glass hover:bg-foreground/[0.03] border border-border hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 shadow-3d">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="text-neutral-600 font-mono text-xs opacity-50">#{problem.id.padStart(3, '0')}</span>
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {problem.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                            problem.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            problem.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            1.2k Solved
                          </span>
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5" />
                            Acceptance: 68%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-neutral-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Fade/CTA Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent z-10 flex items-end justify-center pb-6">
          <Link 
            href="/problems" 
            className="group pointer-events-auto flex items-center gap-3 px-8 py-4 bg-surface border border-border rounded-2xl shadow-3d hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-primary uppercase tracking-widest leading-none mb-1">Explore More</span>
              <span className="text-sm font-bold text-foreground">View Full Problem Archive</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Minimal Users/Activity icons for the list
function Users({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  );
}
