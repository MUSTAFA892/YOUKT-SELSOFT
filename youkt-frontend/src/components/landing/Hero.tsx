"use client";

import { motion } from "framer-motion";
import { Terminal, Code2, Cpu, Globe, Zap, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-32 pb-20 px-6">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3 h-3 fill-current" />
            <span>Next Gen Coding Arena</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Upgrade Your <br />
            <span className="brand-gradient">Coding DNA.</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-lg mb-10 leading-relaxed">
            Master complex algorithms, compete in global contests, and build a world-class developer profile with our high-performance execution engine.
          </p>
          <div className="flex flex-wrap gap-4 font-medium">
            <Link 
              href="#problems" 
              className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center gap-2 group"
            >
              Start Solving
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/problems" 
              className="px-8 py-4 glass text-foreground rounded-xl hover:bg-foreground/5 active:scale-95 transition-all flex items-center gap-2"
            >
              Explore Archive
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          {/* Floating Code Window */}
          <div className="glass-morphism rounded-2xl overflow-hidden shadow-3d animate-float">
            <div className="flex items-center justify-between px-4 py-3 bg-foreground/5 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">solution.py</div>
            </div>
            <div className="p-6 font-mono text-sm">
              <div className="flex gap-4">
                <span className="text-neutral-600 select-none">1</span>
                <span className="text-indigo-400">def</span>
                <span className="text-blue-400"> solve</span>
                <span className="text-foreground">(nums: List[int]) -{">"} int:</span>
              </div>
              <div className="flex gap-4">
                <span className="text-neutral-600 select-none">2</span>
                <span className="text-neutral-500 ml-4"># Optimization starts here</span>
              </div>
              <div className="flex gap-4">
                <span className="text-neutral-600 select-none">3</span>
                <span className="text-neutral-400 ml-4">n = len(nums)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-neutral-600 select-none">4</span>
                <span className="text-primary ml-4">return</span>
                <span className="text-emerald-400"> sum</span>
                <span className="text-foreground">(nums) // n</span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-400/20">
                <Code2 className="w-4 h-4" />
                <span className="text-xs font-bold">Runtime: 12ms (Beats 99.4%)</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/20 blur-2xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
