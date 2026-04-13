"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCandidateInterviews, type Interview } from "@/lib/api";
import { Loader2, Briefcase, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

export default function CandidateDashboard() {
  const { currentUser } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        if (currentUser.role === "candidate") {
          const data = await getCandidateInterviews(currentUser.id);
          setInterviews(data);
        }
      } catch (e) {
        console.error("Failed to load interviews", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [currentUser]);

  if (currentUser.role !== "candidate") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Navbar />
        <div className="text-center space-y-4 flex flex-col items-center mt-12 bg-surface/50 border border-border p-12 rounded-3xl backdrop-blur-sm shadow-3d">
          <Lock className="w-12 h-12 text-neutral-500" />
          <h2 className="text-2xl font-bold">Candidates Only</h2>
          <p className="text-neutral-400">Please switch to a Candidate account to view interviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit">
            <Briefcase className="w-8 h-8 text-amber-500" />
          </div>
          Interview Assessments
        </h1>
        <p className="text-neutral-400 mb-8">
          Welcome, {currentUser.name}. Below are the interview assessments assigned to you by recruiters.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="border border-border bg-surface/50 backdrop-blur-sm shadow-3d rounded-3xl p-16 text-center max-w-2xl mx-auto mt-12">
            <h3 className="text-2xl font-bold text-foreground mb-3">No pending interviews</h3>
            <p className="text-neutral-400">You currently have no interview links assigned to your account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview, index) => (
              <Link 
                href={`/interview/${interview.id}`} 
                key={interview.id}
                className="bg-surface/50 backdrop-blur-sm border border-border rounded-3xl p-8 hover:border-amber-500/30 transition-all shadow-3d group flex flex-col overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                      Assessment #{index + 1}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono flex flex-col items-end gap-0.5">
                      <span>{new Date(interview.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Technical Interview</h3>
                  <p className="text-sm text-neutral-400 mb-8 flex-1">
                    Contains {interview.questions?.length || 0} competitive programming scenarios.
                  </p>
                  <div className="flex items-center text-amber-400 text-sm font-bold mt-auto group-hover:translate-x-2 transition-transform">
                    Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
