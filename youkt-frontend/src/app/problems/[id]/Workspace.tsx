"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import Timer from "@/components/Timer";
import PerformanceFeedback from "@/components/PerformanceFeedback";
import TimeoutFeedback from "@/components/TimeoutFeedback";
import { type Problem, type SubmissionResult, type PlagiarismReport, submitCode, submitActivityLog, getNextProblem, fetchProblem, checkPlagiarism, API_BASE_URL } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle, Terminal, Send, ArrowLeft, Sun, Moon, ChevronRight, GripVertical, GripHorizontal } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "next-themes";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import {
  Separator as ResizableHandle,
  Panel as ResizablePanel,
  Group as ResizablePanelGroup,
} from "react-resizable-panels";


interface ProblemWithSession extends Problem {
  sessionId?: string;
  testCasesPreview?: any[];
  _note?: string;
}

export default function Workspace({ problem: initialProblem }: { problem: ProblemWithSession }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  
  // Problem and session state
  const [problem, setProblem] = useState<ProblemWithSession>(initialProblem);
  const [loading, setLoading] = useState(false);
  
  // Timer & submission tracking
  const [language, setLanguage] = useState<"python" | "javascript" | "java" | "c">("javascript");
  const [code, setCode] = useState(problem.starterCode.javascript);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [startTime] = useState(Date.now());
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTimeoutFeedback, setShowTimeoutFeedback] = useState(false);
  const [nextProblem, setNextProblem] = useState<Problem | null>(null);
  const [easierProblem, setEasierProblem] = useState<Problem | null>(null);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismReport | null>(null);
  const [isPlagiarismChecking, setIsPlagiarismChecking] = useState(false);
  const [pasteDetected, setPasteDetected] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fetch problem with dynamic test cases and session
  useEffect(() => {
    const loadProblem = async () => {
      if (!currentUser?.id) return;
      
      setLoading(true);
      try {
        const freshProblem = await fetchProblem(problem.id, currentUser.id);
        setProblem(freshProblem);
      } catch (err) {
        console.error('Failed to fetch problem with session:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only load if initial problem doesn't have sessionId
    if (!problem.sessionId) {
      loadProblem();
    }
  }, [problem.id, currentUser?.id]);

  // Calculate time spent in seconds
  const getTimeSpent = () => Math.round((Date.now() - startTime) / 1000);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as any;
    setLanguage(newLang);
    setCode(problem.starterCode[newLang as keyof typeof problem.starterCode]);
  };

  const runCode = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await submitCode(
        problem.id, 
        language, 
        code,
        problem.sessionId, // Pass session ID for hidden test case validation
        currentUser.id
      );
      setResult(res);

      // Log activity
      if (res && res.results.length > 0) {
        await submitActivityLog({
          candidateId: currentUser.id,
          candidateName: currentUser.name,
          problemId: problem.id,
          problemTitle: problem.title,
          language: language,
          passed: res.passed,
          totalTests: res.totalTests,
          allPassed: res.allPassed,
          timeSpentSeconds: getTimeSpent(),
        });

        // Record attempt for adaptive difficulty engine
        const accuracyPercent = res.totalTests > 0
          ? Math.round((res.passed / res.totalTests) * 100)
          : 0;
        fetch(`${API_BASE_URL}/advanced-features/adaptive-difficulty/record-attempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: currentUser.id,
            problemDifficulty: problem.difficulty, // 'Easy' | 'Medium' | 'Hard'
            accuracy: accuracyPercent,
            timeTaken: getTimeSpent(),
            solved: res.allPassed,
          }),
        }).catch(() => {}); // fire-and-forget

        // Pause timer and show feedback after successful submission
        if (res.allPassed) {
          setIsTimerActive(false);
          
          // Trigger plagiarism check
          setIsPlagiarismChecking(true);
          checkPlagiarism({
            code,
            candidateId: currentUser.id,
            interviewId: problem.sessionId || 'practice',
            problemId: problem.id,
            submissionTimeMs: (Date.now() - startTime),
            pasteDetected: pasteDetected
          }).then(report => {
            setPlagiarismResult(report);
            setIsPlagiarismChecking(false);
          }).catch(err => {
            console.error('Plagiarism check failed:', err);
            setIsPlagiarismChecking(false);
          });

          // Get next problem recommendation
          try {
            const next = await getNextProblem(problem.id, {
              allPassed: res.allPassed,
              passed: res.passed,
              totalTests: res.totalTests,
              timeSpentSeconds: getTimeSpent(),
            });
            setNextProblem(next);
          } catch (err) {
            console.error('Failed to fetch next problem:', err);
          }
          
          setShowFeedback(true);
        }
      }
    } catch (err: any) {
      alert("Error submitting code: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wrap handleTimeoutWarning in useCallback to prevent stale closures
  const handleTimeoutWarning = useCallback(() => {
    console.warn("Time limit reached!");
    setTimeExpired(true);
    setIsTimerActive(false);
    
    // Load easier problem for non-first problems
    const isFirstProblem = problem.difficulty === 'Easy' && problem.id === '1';
    if (!isFirstProblem) {
      loadEasierProblem();
    }
    
    // Show timeout feedback modal
    setShowTimeoutFeedback(true);
  }, [problem.difficulty, problem.id]);

  const loadEasierProblem = async () => {
    try {
      const easier = await getNextProblem(problem.id, {
        allPassed: false,
        passed: 0,
        totalTests: 0,
        timeSpentSeconds: 0,
        forceEasier: true, // Request easier problem
      });
      if (easier && easier.difficulty !== problem.difficulty) {
        setEasierProblem(easier);
      }
    } catch (err) {
      console.error('Failed to fetch easier problem:', err);
    }
  };




  const handleRetry = useCallback(() => {
    // Reset state and allow user to continue
    setShowTimeoutFeedback(false);
    setTimeExpired(false);
    setIsTimerActive(true);
    setResult(null);
    // Force Timer component to remount by changing key
    setTimerResetKey(prev => prev + 1);
  }, []);

  const handleTryEasier = async () => {
    if (easierProblem) {
      setIsLoadingNext(true);
      try {
        router.push(`/problems/${easierProblem.id}`);
      } catch (err) {
        console.error('Navigation error:', err);
        setIsLoadingNext(false);
      }
    }
  };

  const handleProceedToNext = async () => {
    if (nextProblem) {
      setIsLoadingNext(true);
      try {
        router.push(`/problems/${nextProblem.id}`);
      } catch (err) {
        console.error('Navigation error:', err);
        setIsLoadingNext(false);
      }
    }
  };

  // Use preview test cases if available (dynamic), otherwise use examples
  const displayTestCases = problem.testCasesPreview || problem.examples || [];

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Workspace Header */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-surface shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-neutral-500 hover:text-foreground"
            title="Go Home"
            scroll={true}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline-block">
              YOUKT <span className="text-neutral-500 font-medium">WORKSPACE</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-neutral-500 hover:text-foreground"
            aria-label="Toggle theme"
          >
            {mounted && (resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
          </button>
          <div className="h-4 w-[1px] bg-border" />
          <AccountSwitcher />
        </div>
      </header>

      <div className="flex-1 w-full overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          {/* Left Pane: Problem Description */}
          <ResizablePanel defaultSize={45} minSize={20}>
            <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border bg-surface/30">
              <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold text-foreground">{problem.title}</h1>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  problem.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {problem.difficulty}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none text-foreground/80">
                <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, "<br/>") }} />
              </div>

              {/* Complexity Info */}
              {(problem.expectedTimeComplexity || problem.expectedSpaceComplexity) && (
                <div className="mt-6 p-4 bg-surface border border-border rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-foreground">Complexity</p>
                  {problem.expectedTimeComplexity && (
                    <p className="text-xs text-neutral-500">Time: <span className="text-primary font-mono">{problem.expectedTimeComplexity}</span></p>
                  )}
                  {problem.expectedSpaceComplexity && (
                    <p className="text-xs text-neutral-500">Space: <span className="text-primary font-mono">{problem.expectedSpaceComplexity}</span></p>
                  )}
                </div>
              )}

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div className="mt-6 p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/30 rounded-lg space-y-2">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <span>💡</span> Hints
                  </p>
                  <ul className="space-y-2">
                    {problem.hints.map((hint, i) => (
                      <li key={i} className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-medium">• {hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dynamic test cases indicator */}
              {problem.sessionId && (
                <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-primary-600 dark:text-primary-300 leading-relaxed">
                    🔒 <strong className="font-bold">Dynamic Test Cases:</strong> These test examples are unique to your session. Additional hidden test cases will validate your solution.
                  </p>
                </div>
              )}

              <div className="mt-8 space-y-6">
                {displayTestCases.map((ex, i) => (
                  <div key={i} className="bg-surface rounded-lg p-4 border border-border shadow-sm">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
                      {problem.testCasesPreview ? 'Example' : 'Test Case'} {i + 1}
                    </span>
                    <div className="space-y-2 text-sm font-mono bg-foreground/[0.03] p-3 rounded-md border border-border">
                      <div><span className="text-neutral-500">Input:</span> <span className="text-primary font-bold">{ex.input}</span></div>
                      <div><span className="text-neutral-500">Output:</span> <span className="text-emerald-600 font-bold">{ex.output || ex.expectedOutput}</span></div>
                      {(ex.explanation || ex.description) && (
                        <div className="mt-2 text-neutral-500 text-xs font-sans border-t border-border pt-2 break-words leading-relaxed">
                          {ex.explanation || ex.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-[3px] bg-border hover:bg-primary/40 transition-colors relative z-10 group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors">
              <GripVertical className="w-2.5 h-2.5 text-neutral-500" />
            </div>
          </ResizableHandle>

          <ResizablePanel defaultSize={55} minSize={30}>
            <ResizablePanelGroup orientation="vertical">
              {/* Top Section: Editor */}
              <ResizablePanel defaultSize={65} minSize={30}>
                <div className="h-full flex flex-col bg-background">
                  {/* Editor Toolbar */}
                  <div className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0 bg-surface gap-4">
                    <div className="relative">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 bg-background text-xs font-bold text-foreground border border-border rounded-lg pl-3 pr-2 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-foreground/[0.02] min-w-[120px] justify-between shadow-sm"
                      >
                        <span className="capitalize">{language}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'}`} />
                      </button>

                      {isDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsDropdownOpen(false)} 
                          />
                          <div className="absolute top-full left-0 mt-1 w-full bg-surface border border-border rounded-lg shadow-3d overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top">
                            {["javascript", "python", "java", "c"].map((lang) => (
                              <button
                                key={lang}
                                onClick={() => {
                                  setLanguage(lang as any);
                                  setCode(problem.starterCode[lang as keyof typeof problem.starterCode]);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold capitalize transition-colors flex items-center justify-between ${
                                  language === lang ? 'bg-primary text-white' : 'hover:bg-foreground/5 text-foreground'
                                }`}
                              >
                                {lang}
                                {language === lang && <CheckCircle2 className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {problem.timeLimit && (
                      <Timer 
                        key={timerResetKey}
                        timeLimit={problem.timeLimit} 
                        isActive={isTimerActive}
                        onTimeout={handleTimeoutWarning}
                      />
                    )}
                    
                    <button 
                      onClick={runCode}
                      disabled={isSubmitting || loading || (timeExpired && result !== null)}
                      className="flex items-center gap-2 bg-primary hover:brightness-110 disabled:opacity-50 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                      {isSubmitting || loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                      {loading ? "Loading..." : timeExpired && result !== null ? "Submitted" : "Run Code"}
                    </button>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
                    {timeExpired && (
                      <div className="absolute top-0 left-0 right-0 z-50 bg-rose-500/10 border-b border-rose-500/30 px-4 py-3 flex items-center gap-2 text-rose-600 dark:text-rose-300 backdrop-blur-md">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-bold uppercase tracking-tight">Time's up!</span>
                        <span className="text-xs font-medium opacity-90">The editor is now read-only. Your work will be auto-submitted.</span>
                      </div>
                    )}
                    <Editor
                      height="100%"
                      language={language}
                      theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                      value={code}
                      onChange={(val) => !timeExpired && setCode(val || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "var(--font-geist-mono), monospace",
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        roundedSelection: false,
                        readOnly: timeExpired,
                      }}
                      onMount={(editor) => {
                        editor.onDidPaste(() => {
                          console.log("Paste detected!");
                          setPasteDetected(true);
                        });
                      }}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-[3px] bg-border hover:bg-primary/40 transition-colors relative z-10 group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors">
                  <GripHorizontal className="w-2.5 h-2.5 text-neutral-500" />
                </div>
              </ResizableHandle>

              {/* Bottom Section: Console */}
              <ResizablePanel defaultSize={35} minSize={10}>
                <div className="h-full flex flex-col bg-background">
                  <div className="px-4 h-10 flex items-center border-b border-border shrink-0 bg-surface">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
                      <Terminal className="w-4 h-4" />
                      <span>Console</span>
                    </div>
                    {result && (
                      <div className="ml-auto flex items-center gap-2 text-xs font-semibold">
                        {result.allPassed ? (
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Accepted</span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-4 h-4"/> Rejected</span>
                        )}
                        <span className="text-neutral-500 ml-2">({result.passed}/{result.totalTests} passed)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-background">
                    {!result && !isSubmitting && (
                      <div className="text-neutral-600 italic">Run your code to see the output...</div>
                    )}
                    
                    {isSubmitting && (
                      <div className="text-indigo-400 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Executing your code...
                      </div>
                    )}

                    {result && (
                      <div className="space-y-4">
                        {result.results.map((tr, i) => (
                          <div key={i} className={`p-3 rounded border ${
                            tr.status === 'pass' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-200' :
                            tr.status === 'timeout' ? 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-200' :
                            'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-2 font-bold tracking-wide text-xs uppercase">
                              {tr.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                              {tr.status === 'fail' && <XCircle className="w-4 h-4 text-rose-400" />}
                              {(tr.status === 'error' || tr.status === 'timeout') && <AlertCircle className="w-4 h-4 text-rose-400" />}
                              Test Case {tr.testCase}: {tr.status}
                            </div>
                            
                            {tr.errorMessage ? (
                              <div className="bg-black/5 dark:bg-black/50 p-2 rounded text-rose-500 whitespace-pre-wrap">{tr.errorMessage}</div>
                            ) : (
                              <div className="grid grid-cols-2 gap-4 text-xs opacity-80">
                                <div><div className="font-semibold mb-1 opacity-50">Input:</div><div className="bg-foreground/5 p-1.5 rounded">{tr.input}</div></div>
                                <div><div className="font-semibold mb-1 opacity-50">Expected:</div><div className="bg-foreground/5 p-1.5 rounded text-emerald-600 font-bold">{tr.expectedOutput}</div></div>
                                <div className="col-span-2"><div className="font-semibold mb-1 opacity-50">Your Output:</div><div className={`bg-foreground/5 p-1.5 rounded font-bold ${tr.status === 'pass' ? 'text-emerald-600' : 'text-rose-600'}`}>{tr.actualOutput || '""'}</div></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Modals outside resizable area */}
      {showFeedback && result && (
        <PerformanceFeedback
          currentProblem={problem}
          performanceMetrics={{
            allPassed: result.allPassed,
            passed: result.passed,
            totalTests: result.totalTests,
            timeSpentSeconds: getTimeSpent(),
          }}
          nextProblem={nextProblem}
          onProceed={handleProceedToNext}
          isLoading={isLoadingNext}
          plagiarismResult={plagiarismResult}
          isPlagiarismChecking={isPlagiarismChecking}
        />
      )}

      {showTimeoutFeedback && (
        <TimeoutFeedback
          currentProblem={problem}
          timeSpentSeconds={getTimeSpent()}
          timeLimit={problem.timeLimit || 300000}
          onRetry={handleRetry}
          onEasier={easierProblem ? handleTryEasier : undefined}
          isLoading={isLoadingNext}
          isFirstProblem={problem.difficulty === 'Easy' && problem.id === '1'}
        />
      )}
    </div>
  );
}
