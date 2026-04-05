"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCandidateInterviews, type Interview } from "@/lib/api";
import { Loader2, Briefcase, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";

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
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950">
        <div className="text-center space-y-4 flex flex-col items-center">
          <Lock className="w-12 h-12 text-neutral-600" />
          <h2 className="text-2xl font-bold text-white">Candidates Only</h2>
          <p className="text-neutral-400">Please switch to a Candidate account to view interviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-950 text-neutral-200">
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-amber-500" />
          Interview Assessments
        </h1>
        <p className="text-neutral-400 mb-8">
          Welcome, {currentUser.name}. Below are the interview assessments assigned to you by recruiters.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="border border-neutral-800 bg-neutral-900/50 rounded-xl p-10 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No pending interviews</h3>
            <p className="text-neutral-400">You currently have no interview links assigned to your account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview, index) => (
              <Link 
                href={`/interview/${interview.id}`} 
                key={interview.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-amber-500/50 hover:bg-neutral-800/50 transition-all group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-amber-500/10 text-amber-400 rounded">
                    Assessment #{index + 1}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Technical Interview</h3>
                <p className="text-sm text-neutral-400 mb-6 flex-1">
                  Contains {interview.questions?.length || 0} programming questions.
                </p>
                <div className="flex items-center text-amber-400 text-sm font-semibold mt-auto group-hover:translate-x-1 transition-transform">
                  Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
