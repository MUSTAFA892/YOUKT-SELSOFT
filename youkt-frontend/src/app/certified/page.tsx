"use client";

import Navbar from "@/components/landing/Navbar";
import { motion } from "framer-motion";
import { Award, Zap, Code, ShieldCheck, Clock, BookOpen, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CERTIFICATIONS = [
  {
    id: "python-essentials",
    title: "Python Developer Essentials",
    description: "Master the fundamentals of Python including data structures, algorithms, and modular programming.",
    difficulty: "Intermediate",
    timeLimit: "90 Mins",
    questions: 20,
    enrolled: 1250,
    rating: 4.8,
    icon: Code,
    color: "from-blue-500/20 to-yellow-500/20",
    border: "border-blue-500/30"
  },
  {
    id: "java-professional",
    title: "Java Professional Certification",
    description: "Deep dive into OOP concepts, concurrency, and enterprise-grade Java development patterns.",
    difficulty: "Advanced",
    timeLimit: "120 Mins",
    questions: 25,
    enrolled: 850,
    rating: 4.9,
    icon: ShieldCheck,
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30"
  },
  {
    id: "frontend-mastery",
    title: "Frontend Mastery (React/Next.js)",
    description: "Build high-performance, modern web applications using the latest React and Next.js features.",
    difficulty: "Hard",
    timeLimit: "105 Mins",
    questions: 18,
    enrolled: 2100,
    rating: 4.7,
    icon: Zap,
    color: "from-cyan-500/20 to-blue-600/20",
    border: "border-cyan-500/30"
  },
  {
    id: "data-structures-expert",
    title: "Data Structures & Algorithms Expert",
    description: "Optimize your problem-solving skills with advanced DSA concepts used by top tech companies.",
    difficulty: "Expert",
    timeLimit: "150 Mins",
    questions: 15,
    enrolled: 450,
    rating: 5.0,
    icon: Award,
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30"
  }
];

export default function CertifyCatalog() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-widest mb-4">
              <Award className="w-4 h-4" />
              Official Certifications
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
              Level Up Your <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Professional</span> Standing
            </h1>
            <p className="max-w-2xl mx-auto text-neutral-500 font-medium">
              Join thousands of developers worldwide who use YOUKT Certify to validate their skills and stand out to top-tier recruiters.
            </p>
          </motion.div>
        </div>

        {/* Certification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {CERTIFICATIONS.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredId(cert.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative"
            >
              <div className={`relative overflow-hidden rounded-3xl border ${cert.border} bg-surface p-8 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5`}>
                {/* Background Gradient Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="p-4 rounded-2xl bg-background border border-border group-hover:border-primary/50 transition-colors">
                      <cert.icon className="w-8 h-8 text-primary" />
                    </div>
                    {/* Stats Group Stacked Vertically */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/5 text-xs font-black text-neutral-400">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {cert.rating}
                      </div>
                      <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors text-right">
                        {cert.enrolled}+ Enrolled
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight text-foreground">
                      {cert.title}
                    </h3>
                    <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                      {cert.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      <Clock className="w-4 h-4" />
                      {cert.timeLimit}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      {cert.questions} Questions
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      <Zap className="w-4 h-4" />
                      {cert.difficulty}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link 
                      href={`/certified/${cert.id}`}
                      className="inline-flex items-center gap-2 w-full justify-center px-6 py-4 bg-foreground text-background dark:bg-white dark:text-black font-black rounded-2xl group-hover:bg-primary group-hover:text-white transition-all active:scale-95 shadow-lg"
                    >
                      Get Certified
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>


              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-12 rounded-[32px] bg-foreground/5 border border-border text-center"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-black text-foreground">Why get YOUKT Certify?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="text-primary font-black text-xl italic uppercase font-mono tracking-tighter">Gold Standard</div>
                <p className="text-xs text-neutral-500 font-medium">Verified by top engineering teams globally.</p>
              </div>
              <div className="space-y-2">
                <div className="text-primary font-black text-xl italic uppercase font-mono tracking-tighter">Live Monitor</div>
                <p className="text-xs text-neutral-500 font-medium">Dynamic integrity monitoring for maximum trust.</p>
              </div>
              <div className="space-y-2">
                <div className="text-primary font-black text-xl italic uppercase font-mono tracking-tighter">Instant Perk</div>
                <p className="text-xs text-neutral-500 font-medium">Badges automatically added to your profile.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
