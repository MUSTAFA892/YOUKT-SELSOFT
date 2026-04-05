import { fetchProblems } from "@/lib/api";
import { Code2, ChevronRight, TerminalSquare, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const problems = await fetchProblems();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 py-24 flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
          <TerminalSquare className="w-4 h-4" />
          <span>Interactive Setup Complete</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
          Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Coding Skills</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mb-10">
          Tackle real-world problems in multiple languages, get instant execution results, 
          and climb the leaderboard with our lightning-fast code evaluation engine.
        </p>
      </section>

      {/* Problem List */}
      <section className="w-full max-w-5xl px-6 pb-24">
        <div className="flex items-center gap-2 mb-8 border-b border-neutral-800 pb-4">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Available Challenges</h2>
        </div>

        <div className="grid gap-4">
          {problems.map((problem) => (
            <Link key={problem.id} href={`/problems/${problem.id}`} className="group block">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-neutral-800/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:to-indigo-500/5 transition-all duration-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-neutral-500 text-sm font-medium whitespace-nowrap">
                        #{problem.id.padStart(3, '0')}
                      </span>
                      <h3 className="text-xl font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors">
                        {problem.title}
                      </h3>
                    </div>
                    <p className="text-neutral-400 text-sm line-clamp-1 max-w-2xl">
                      {problem.description.replace(/`/g, '')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                      problem.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      problem.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-indigo-500 transition-colors text-neutral-400 group-hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {problems.length === 0 && (
            <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
              No problems found. Check if the backend is running.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
