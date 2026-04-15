import { fetchProblems } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import ProblemList from "@/components/landing/ProblemList";
import LanguageProgress from "@/components/LanguageProgress";
import ScrollToTop from "@/components/landing/ScrollToTop";

// Mark this route as dynamic since activity logs change with each submission
export const dynamic = 'force-dynamic';

export default async function Home() {
  const problems = await fetchProblems();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Navbar />
      <ScrollToTop />
      
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Vital Stats */}
        <Stats />

        {/* Quick Language Progress */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <LanguageProgress />
        </div>

        {/* Features / Bento Grid */}
        <Features />

        {/* The Core Challenge Arena */}
        <ProblemList problems={problems} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-surface border border-border rounded flex items-center justify-center">
              <span className="text-[10px] font-bold">Y</span>
            </div>
            <span className="font-bold tracking-tight">YOUKT © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-neutral-500 md:pr-20">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

