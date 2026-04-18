"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import Timer from "@/components/Timer";
import TabSwitchWarning from "@/components/TabSwitchWarning";
import { 
  Terminal, 
  ShieldCheck, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Maximize, 
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
  GripVertical
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "next-themes";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import {
  Separator as ResizableHandle,
  Panel as ResizablePanel,
  Group as ResizablePanelGroup,
} from "react-resizable-panels";

// Mock problem for certification
const MOCK_CERT_PROBLEM = {
  id: "cert-python-1",
  title: "Certification Task: Array Inversion Count",
  difficulty: "Hard",
  description: `
    <h3>Problem Description</h3>
    <p>Given an array of integers, find the number of inversions in the array.</p>
    <p>Two elements a[i] and a[j] form an inversion if a[i] > a[j] and i < j.</p>
    <p>Example: [2, 4, 1, 3, 5] has 3 inversions: (2, 1), (4, 1), (4, 3).</p>
  `,
  timeLimit: 5400, // 90 mins
  starterCode: {
    python: "def count_inversions(arr):\n    # Write your certification code here\n    pass",
    javascript: "function countInversions(arr) {\n    // Write your certification code here\n    return 0;\n}",
    java: "public class Solution {\n    public int countInversions(int[] arr) {\n        // Write your certification code here\n        return 0;\n    }\n}",
    c: "int count_inversions(int* arr, int size) {\n    // Write your certification code here\n    return 0;\n}"
  }
};

export default function CertificationTest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const isActual = searchParams.get("mode") === "actual";
  
  // State
  const [mounted, setMounted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(MOCK_CERT_PROBLEM.starterCode.python);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  // Refs for tracking
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Fullscreen & Integrity Logic
  useEffect(() => {
    if (!mounted || !isActual || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= 5) {
            setIsTerminated(true);
            return 5;
          }
          setShowWarning(true);
          return next;
        });
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && !isTerminated) {
        // Exiting fullscreen is also a violation in actual mode
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= 5) {
            setIsTerminated(true);
            return 5;
          }
          setShowWarning(true);
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Initial request for fullscreen
    const requestFS = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen request failed", err);
      }
    };
    
    requestFS();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [mounted, isActual, isTerminated]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Certification attempt submitted for review!");
      if (document.fullscreenElement) document.exitFullscreen();
      router.push("/certified");
    }, 2000);
  };

  const handleExit = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    router.push("/certified");
  };

  if (!mounted) return null;

  if (isTerminated) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-6">
        <TabSwitchWarning 
          isOpen={true} 
          count={5} 
          onClose={() => {}} 
          onExit={handleExit} 
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Integrity Warning Overlay */}
      <TabSwitchWarning 
        isOpen={showWarning} 
        count={warnings} 
        onClose={() => setShowWarning(false)} 
        onExit={handleExit} 
      />

      {/* Test Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExit}
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-neutral-500 hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-[1px] bg-border mx-1" />
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${isActual ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20' : 'bg-primary text-white'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                {isActual ? 'Actual Certify' : 'Sample Test Mode'}
              </div>
              <div className="text-sm font-black text-foreground">{MOCK_CERT_PROBLEM.title}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isActual && (
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-black text-rose-500 uppercase tracking-tighter">
                Warnings: {warnings}/5
              </span>
            </div>
          )}

          <Timer 
            timeLimit={MOCK_CERT_PROBLEM.timeLimit} 
            isActive={!isTerminated}
            onTimeout={() => {
              alert("Time limit reached! Auto-submitting...");
              handleSubmit();
            }}
          />

          <div className="h-6 w-[1px] bg-border" />
          
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-neutral-500"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <AccountSwitcher />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 w-full overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          {/* Left Pane: Details */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="h-full overflow-y-auto p-8 bg-surface/30">
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: MOCK_CERT_PROBLEM.description }} />
              </div>
              
              <div className="mt-12 p-6 rounded-3xl bg-surface border border-border space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Maximize className="w-4 h-4" /> Integrity Requirements
                </h4>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-xs text-neutral-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    Maintain full-screen at all times.
                  </li>
                  <li className="flex gap-3 text-xs text-neutral-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    All interactions are logged in real-time.
                  </li>
                  <li className="flex gap-3 text-xs text-neutral-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    Switching windows will result in an immediate warning.
                  </li>
                </ul>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-[3px] bg-border hover:bg-primary/40 transition-colors relative z-10 group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm">
              <GripVertical className="w-2.5 h-2.5 text-neutral-500" />
            </div>
          </ResizableHandle>

          {/* Right Pane: Editor */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col bg-background relative">
              {/* Force Fullscreen Reminder */}
              {isActual && !isFullscreen && !showWarning && (
                <div className="absolute inset-0 z-[60] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
                    <Maximize className="w-10 h-10 text-rose-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground">FullScreen Mode Required</h3>
                    <p className="text-neutral-500 text-sm max-w-sm mx-auto font-medium">
                      You must be in full-screen mode to participate in the actual certification test.
                    </p>
                  </div>
                  <button 
                    onClick={() => document.documentElement.requestFullscreen()}
                    className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    Enter FullScreen
                  </button>
                </div>
              )}

              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0 bg-[#1e1e1e]">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "var(--font-geist-mono), monospace",
                      padding: { top: 20 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                
                <div className="p-4 border-t border-border bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" /> Console Output
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Finish and Submit Test
                  </button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
