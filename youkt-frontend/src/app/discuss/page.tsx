"use client";

import Navbar from "@/components/landing/Navbar";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  ChevronRight, 
  Plus, 
  Filter, 
  Search, 
  TrendingUp, 
  Zap, 
  ThumbsUp, 
  Eye, 
  Code2,
  BrainCircuit,
  Rocket
} from "lucide-react";
import { useState } from "react";

const DISCUSSIONS = [
  {
    id: 1,
    title: "Best approach for Large Scale System Design in 2026?",
    author: "SystemSage",
    category: "Architecture",
    replies: 124,
    views: "2.4k",
    upvotes: 850,
    time: "2h ago",
    tags: ["Distributed Systems", "Scaling"]
  },
  {
    id: 2,
    title: "How to handle memory leaks in high-frequency trading apps?",
    author: "LowLatencyDev",
    category: "C++ / Low Level",
    replies: 56,
    views: "850",
    upvotes: 412,
    time: "5h ago",
    tags: ["Memory", "Performance"]
  },
  {
    id: 3,
    title: "Is Tailwind CSS still the king for rapid MVP development?",
    author: "FrontendWizard",
    category: "Web Development",
    replies: 210,
    views: "5.1k",
    upvotes: 1.2,
    time: "12h ago",
    tags: ["CSS", "Efficiency"]
  },
  {
    id: 4,
    title: "Breaking down the latest LeetCode bi-weekly contest #124",
    author: "ContestPro",
    category: "Competitive Coding",
    replies: 89,
    views: "1.2k",
    upvotes: 320,
    time: "1d ago",
    tags: ["Contest", "Arrays"]
  }
];

export default function DiscussPage() {
  const [activeCategory, setActiveCategory] = useState("All Topics");

  return (
    <main className="min-h-screen bg-background pb-32">
      <Navbar />

      <div className="pt-32 px-6 max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" />
              <span>Community Hub</span>
            </div>
            <h1 className="text-5xl font-black text-foreground tracking-tight">Code <span className="text-primary tracking-tighter">Talks</span></h1>
            <p className="text-neutral-500 max-w-xl font-medium">
              Join the conversation. Share knowledge, ask questions, and collaborate with developers from around the world.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
              <Plus className="w-5 h-5" />
              New Discussion
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="w-full bg-surface border border-border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>

            <nav className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4 px-4">Categories</h3>
              {["All Topics", "Competitive Coding", "Architecture", "Interview Prep", "Web Development", "Machine Learning"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                    activeCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-neutral-500 hover:bg-foreground/5"
                  }`}
                >
                  {cat}
                  <ChevronRight className={`w-4 h-4 opacity-0 transition-opacity ${activeCategory === cat ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                </button>
              ))}
            </nav>

            <div className="glass border-border rounded-3xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {["#javascript", "#react", "#system_design", "#python", "#optimization", "#faang"].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-foreground/5 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors cursor-pointer border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Discussion List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex items-center gap-4">
                <button className="text-sm font-black text-foreground border-b-2 border-primary pb-1">Recent</button>
                <button className="text-sm font-bold text-neutral-500 hover:text-foreground transition-colors">Popular</button>
                <button className="text-sm font-bold text-neutral-500 hover:text-foreground transition-colors">Unsolved</button>
              </div>
              <button className="p-2 border border-border rounded-xl text-neutral-500 hover:border-primary/30 transition-all">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {DISCUSSIONS.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group glass border-border rounded-3xl p-6 hover:border-primary/30 transition-all duration-300 shadow-3d cursor-pointer"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest py-1 px-2.5 bg-primary/10 text-primary rounded-lg border border-primary/20 leading-none">
                        {post.category}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">@{post.author} • {post.time}</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-neutral-500">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 text-neutral-500">
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-foreground">{post.upvotes}k</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Votes</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-foreground">{post.replies}</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Replies</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-foreground">{post.views}</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Views</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty State / CTA */}
            <div className="mt-12 p-8 border-2 border-dashed border-border rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-2 text-neutral-400 border border-border">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Can't find what you're looking for?</h3>
                <p className="text-neutral-500 max-w-sm mx-auto mt-2">Start a new discussion and get help from the brightest minds in the community.</p>
              </div>
              <button className="px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all">
                Publish a Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
