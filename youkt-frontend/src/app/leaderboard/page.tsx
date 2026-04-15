"use client";

import Navbar from "@/components/landing/Navbar";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Target, Users, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

const LEADERBOARD_DATA = [
  { rank: 1, name: "Alexander Dev", solved: 482, rating: 2840, change: "up" },
  { rank: 2, name: "Sarah Logic", solved: 456, rating: 2795, change: "down" },
  { rank: 3, name: "QuantumCoder", solved: 441, rating: 2750, change: "up" },
  { rank: 4, name: "ByteMaster", solved: 412, rating: 2680, change: "stable" },
  { rank: 5, name: "AlgoWhiz", solved: 398, rating: 2610, change: "up" },
  { rank: 6, name: "IronDev", solved: 385, rating: 2590, change: "down" },
  { rank: 7, name: "PixelPerfect", solved: 372, rating: 2540, change: "stable" },
  { rank: 8, name: "CodeNinja", solved: 368, rating: 2510, change: "up" },
];

export default function LeaderboardPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
              <Star className="w-3 h-3 fill-current" />
              <span>World Rankings</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">Global <span className="text-primary tracking-tighter">Leaderboard</span></h1>
            <p className="text-neutral-500 max-w-xl font-medium">
              The ultimate arena where elite engineers compete. Climb the ranks by solving complex problems and participating in contests.
            </p>
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search competitors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-3d"
            />
          </div>
        </div>

        {/* Podium Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <PodiumCard rank={2} name="Sarah Logic" score="2795" color="text-slate-400" />
          <PodiumCard rank={1} name="Alexander Dev" score="2840" color="text-amber-500" spotlight />
          <PodiumCard rank={3} name="QuantumCoder" score="2750" color="text-orange-500" />
        </div>

        {/* Ranking List */}
        <div className="glass border-border rounded-3xl overflow-hidden shadow-3d">
          <div className="grid grid-cols-12 px-8 py-4 bg-foreground/[0.02] border-b border-border text-[10px] font-black uppercase tracking-widest text-neutral-500">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Competitor</div>
            <div className="col-span-2 text-center">Solved</div>
            <div className="col-span-2 text-center">Rating</div>
            <div className="col-span-2 text-right">Trend</div>
          </div>

          <div className="divide-y divide-border">
            {LEADERBOARD_DATA.map((user, idx) => (
              <motion.div 
                key={user.rank}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-12 px-8 py-6 items-center hover:bg-foreground/[0.02] transition-colors group"
              >
                <div className="col-span-1 font-mono font-bold text-neutral-500 group-hover:text-primary transition-colors">
                  #{user.rank.toString().padStart(2, '0')}
                </div>
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-border flex items-center justify-center font-bold text-primary">
                    {user.name[0]}
                  </div>
                  <span className="font-bold text-foreground">{user.name}</span>
                </div>
                <div className="col-span-2 text-center font-bold text-neutral-600 dark:text-neutral-400">
                  {user.solved}
                </div>
                <div className="col-span-2 text-center font-black text-foreground">
                  {user.rating}
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className={`flex items-center gap-1 text-xs font-bold ${
                    user.change === 'up' ? 'text-emerald-500' : 
                    user.change === 'down' ? 'text-rose-500' : 
                    'text-neutral-500'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${user.change === 'down' ? 'rotate-180' : user.change === 'stable' ? 'rotate-90' : ''}`} />
                    <span className="uppercase tracking-tighter">{user.change}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <StatBox icon={Users} label="Total Players" value="54,231" />
          <StatBox icon={Trophy} label="Contests Held" value="156" />
          <StatBox icon={Target} label="Top Accuracy" value="98.2%" />
          <StatBox icon={Medal} label="New Masters" value="+12" />
        </div>
      </div>
    </main>
  );
}

function PodiumCard({ rank, name, score, color, spotlight = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative glass border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-3d ${spotlight ? 'md:-translate-y-4 border-primary/30 ring-4 ring-primary/5 bg-primary/[0.02]' : ''}`}
    >
      {spotlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Current Season MVP</div>}
      <div className={`w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 border border-border shadow-inner ${color}`}>
        <Trophy className="w-8 h-8" />
      </div>
      <div className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-1">Rank #{rank}</div>
      <div className="text-2xl font-black text-foreground mb-2">{name}</div>
      <div className="flex items-center gap-2 bg-foreground/5 px-4 py-1.5 rounded-xl border border-border">
        <Star className={`w-4 h-4 fill-current ${color}`} />
        <span className="text-lg font-black text-foreground">{score}</span>
      </div>
    </motion.div>
  );
}

function StatBox({ icon: Icon, label, value }: any) {
  return (
    <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter mb-1 opacity-60">{label}</div>
      <div className="text-xl font-black text-foreground leading-none">{value}</div>
    </div>
  );
}
