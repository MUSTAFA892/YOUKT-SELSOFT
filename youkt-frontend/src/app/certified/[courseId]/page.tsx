"use client";

import Navbar from "@/components/landing/Navbar";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Play, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Monitor, 
  Info,
  ChevronRight,
  Flame
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const CERT_DATA: Record<string, any> = {
  "python-essentials": {
    title: "Python Developer Essentials",
    version: "v2.4",
    questions: 20,
    time: 90,
    difficulty: "Intermediate",
    skills: ["Python 3.x", "Data Structures", "Algorithms", "File I/O", "Exception Handling"],
    rules: [
      "No external IDEs or documentation allowed.",
      "Tab switching is strictly monitored (max 5 warnings).",
      "Assessment will be forced to full-screen mode.",
      "Results are immediately reported to our partner network."
    ]
  },
  "java-professional": {
    title: "Java Professional Certification",
    version: "v1.8",
    questions: 25,
    time: 120,
    difficulty: "Advanced",
    skills: ["Java SE", "Multithreading", "Streams API", "Collections Framework", "Design Patterns"],
    rules: [
      "Deep-level concurrency questions included.",
      "Integrity monitoring enforced via YOUKT Shield.",
      "Full-screen mode required.",
      "Maximum of 5 integrity violations allowed."
    ]
  },
  // ... other courses
};

export default function CertificationDetails() {
  const params = useParams();
  const router = useRouter();
  const certId = params.courseId as string;
  const cert = CERT_DATA[certId] || CERT_DATA["python-essentials"]; // Fallback for demo
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <Link 
          href="/certified" 
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                Verified Certify
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {cert.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-neutral-500 font-medium">
                <span>Version {cert.version}</span>
                <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                <span>{cert.difficulty}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Info className="w-5 h-5 text-primary" />
                Skills Measured
              </div>
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-neutral-400">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Lock className="w-5 h-5 text-rose-500" />
                Integrity Rules
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cert.rules.map((rule: string, idx: number) => (
                  <div key={idx} className="flex gap-3 p-4 rounded-2xl bg-surface border border-border">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-xs text-neutral-400 font-medium leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="p-8 rounded-[32px] bg-foreground text-background dark:bg-white dark:text-black shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Fee</div>
                      <div className="text-2xl font-black">Free</div>
                    </div>
                    <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => router.push(`/certified/test/${certId}?mode=actual`)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-black text-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Start Actual Test
                    </button>
                    <p className="text-[10px] text-center opacity-40 font-bold px-4 leading-relaxed">
                      Requires full-screen and strict monitoring. Progress will be lost if you exit.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-black/10 dark:border-white/10">
                    <button 
                      onClick={() => router.push(`/certified/test/${certId}?mode=sample`)}
                      className="w-full group/btn flex items-center justify-between py-2 text-sm font-black hover:text-primary transition-colors"
                    >
                      <span>Try Sample Test</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                    <p className="text-[10px] opacity-40 font-bold mt-1">
                      No locking. Practice the test environment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-border space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-black text-foreground uppercase tracking-tight">System Status</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-neutral-500 uppercase">Integrity Engine</span>
                    <span className="text-emerald-500">READY</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-neutral-500 uppercase">Proctoring API</span>
                    <span className="text-emerald-500">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
