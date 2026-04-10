"use client";

import { useEffect, useState } from "react";
import { Code2, Braces, FileJson } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface LanguageStats {
  language: "python" | "javascript" | "java" | "c";
  problemsSolved: number;
  totalProblems: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

export default function LanguageProgress() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<LanguageStats[]>([
    {
      language: "python",
      problemsSolved: 0,
      totalProblems: 10,
      percentage: 0,
      color: "from-yellow-500 to-orange-500",
      icon: <Code2 className="w-5 h-5" />,
    },
    {
      language: "javascript",
      problemsSolved: 0,
      totalProblems: 10,
      percentage: 0,
      color: "from-yellow-400 to-yellow-500",
      icon: <Braces className="w-5 h-5" />,
    },
    {
      language: "java",
      problemsSolved: 0,
      totalProblems: 10,
      percentage: 0,
      color: "from-orange-500 to-red-500",
      icon: <Code2 className="w-5 h-5" />,
    },
    {
      language: "c",
      problemsSolved: 0,
      totalProblems: 10,
      percentage: 0,
      color: "from-blue-500 to-cyan-500",
      icon: <FileJson className="w-5 h-5" />,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if we have a current user
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const fetchActivityLogs = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        // Fetch only for the current candidate
        const response = await fetch(`${API_BASE_URL}/activity-logs/candidate/${currentUser.id}`, {
          cache: "no-store",
        });
        
        if (!response.ok) throw new Error("Failed to fetch activity logs");
        
        const logs = await response.json();
        
        // Track solved problems per language (unique problems)
        const languageMap: Record<string, Set<string>> = {
          python: new Set(),
          javascript: new Set(),
          java: new Set(),
          c: new Set(),
        };

        logs.forEach((log: any) => {
          const lang = log.language?.toLowerCase();
          // Only count problems that were fully passed
          if (lang && languageMap[lang] && (log.allPassed || log.passed === log.totalTests)) {
            languageMap[lang].add(log.problemId);
          }
        });

        // Update stats
        setStats((prevStats) =>
          prevStats.map((stat) => {
            const solvedProblems = languageMap[stat.language].size;
            const percentage = Math.round((solvedProblems / stat.totalProblems) * 100);
            return {
              ...stat,
              problemsSolved: solvedProblems,
              percentage,
            };
          })
        );
      } catch (err) {
        console.error("Error fetching activity logs:", err);
        // Set default to 0
        setStats((prevStats) =>
          prevStats.map((stat) => ({
            ...stat,
            problemsSolved: 0,
            percentage: 0,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [currentUser?.id]);

  return (
    <section className="w-full max-w-5xl px-6 py-16">
      <div className="flex items-center gap-2 mb-8 border-b border-neutral-800 pb-4">
        <Code2 className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white tracking-tight">Language Progress</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.language}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300"
          >
            {/* Language Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg text-white`}>
                {stat.icon}
              </div>
              <h3 className="text-lg font-semibold text-white capitalize">{stat.language}</h3>
            </div>

            {/* Stats */}
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-2 bg-neutral-700 rounded-full"></div>
                <div className="h-4 bg-neutral-700 rounded-full w-3/4"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-neutral-400">Completion</span>
                    <span className={`text-sm font-bold ${
                      stat.percentage >= 80 ? 'text-emerald-400' :
                      stat.percentage >= 60 ? 'text-amber-400' :
                      stat.percentage > 0 ? 'text-orange-400' :
                      'text-neutral-500'
                    }`}>
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats Info */}
                <div className="pt-2 border-t border-neutral-800">
                  <div className="text-xs text-neutral-400 space-y-1">
                    <p className="flex justify-between">
                      <span>Solved:</span>
                      <span className="text-emerald-400 font-semibold">{stat.problemsSolved}/{stat.totalProblems}</span>
                    </p>
                    <p className="flex justify-between text-xs">
                      <span>Problems</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
