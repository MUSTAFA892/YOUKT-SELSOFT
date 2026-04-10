"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import Timer from "@/components/Timer";
import PerformanceFeedback from "@/components/PerformanceFeedback";
import TimeoutFeedback from "@/components/TimeoutFeedback";
import { type Problem, type SubmissionResult, submitCode, submitActivityLog, getNextProblem, fetchProblem } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle, Terminal, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";


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

        // Pause timer and show feedback after successful submission
        if (res.allPassed) {
          setIsTimerActive(false);
          
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
    <>
      <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-neutral-950">
        
        {/* Left Pane: Problem Description */}
        <div className="w-1/2 flex flex-col border-r border-neutral-800 bg-neutral-900/40">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
                problem.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                problem.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {problem.difficulty}
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-neutral-300">
              <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, "<br/>") }} />
            </div>

            {/* Complexity Info */}
            {(problem.expectedTimeComplexity || problem.expectedSpaceComplexity) && (
              <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-neutral-300">Complexity</p>
                {problem.expectedTimeComplexity && (
                  <p className="text-xs text-neutral-400">Time: <span className="text-indigo-300 font-mono">{problem.expectedTimeComplexity}</span></p>
                )}
                {problem.expectedSpaceComplexity && (
                  <p className="text-xs text-neutral-400">Space: <span className="text-indigo-300 font-mono">{problem.expectedSpaceComplexity}</span></p>
                )}
              </div>
            )}

            {/* Hints */}
            {problem.hints && problem.hints.length > 0 && (
              <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-amber-300">💡 Hints</p>
                <ul className="space-y-1">
                  {problem.hints.map((hint, i) => (
                    <li key={i} className="text-xs text-amber-200">• {hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dynamic test cases indicator */}
            {problem.sessionId && (
              <div className="mt-6 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-300">
                  🔒 <strong>Dynamic Test Cases:</strong> These test examples are unique to your session. Additional hidden test cases will validate your solution.
                </p>
              </div>
            )}

            <div className="mt-8 space-y-6">
              {displayTestCases.map((ex, i) => (
                <div key={i} className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
                    {problem.testCasesPreview ? 'Example' : 'Test Case'} {i + 1}
                  </span>
                  <div className="space-y-2 text-sm font-mono bg-black/40 p-3 rounded-md">
                    <div><span className="text-neutral-500">Input:</span> <span className="text-indigo-300">{ex.input}</span></div>
                    <div><span className="text-neutral-500">Output:</span> <span className="text-emerald-300">{ex.output || ex.expectedOutput}</span></div>
                    {(ex.explanation || ex.description) && (
                      <div className="mt-2 text-neutral-400 text-xs font-sans border-t border-neutral-800 pt-2 break-words">
                        {ex.explanation || ex.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Editor & Console */}
        <div className="w-1/2 flex flex-col h-full bg-neutral-950">
          
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-800 shrink-0 bg-neutral-900/60 gap-3">
            <select 
              value={language}
              onChange={handleLanguageChange}
              className="bg-neutral-800 text-sm text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
            </select>

            {/* Timer */}
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
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-all active:scale-95"
            >
              {isSubmitting || loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {loading ? "Loading..." : timeExpired && result !== null ? "Submitted" : "Run Code"}
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
            {timeExpired && (
              <div className="absolute top-0 left-0 right-0 z-50 bg-rose-500/10 border-b border-rose-500/30 px-4 py-3 flex items-center gap-2 text-rose-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">Time's up!</span>
                <span className="text-sm opacity-90">The editor is now read-only. Your work will be auto-submitted.</span>
              </div>
            )}
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => !timeExpired && setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-geist-mono), monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                roundedSelection: false,
                readOnly: timeExpired, // Disable editing when time expires
              }}
            />
          </div>

          {/* Terminal/Console Output */}
          <div className="h-64 shrink-0 flex flex-col border-t border-neutral-800 bg-neutral-900">
            <div className="px-4 h-10 flex items-center border-b border-neutral-800 shrink-0 bg-neutral-950">
              <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
                <Terminal className="w-4 h-4" />
                Console
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
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#0a0a0a]">
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
                      tr.status === 'pass' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200' :
                      tr.status === 'timeout' ? 'bg-amber-500/5 border-amber-500/20 text-amber-200' :
                      'bg-rose-500/5 border-rose-500/20 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2 font-bold tracking-wide text-xs uppercase">
                        {tr.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {tr.status === 'fail' && <XCircle className="w-4 h-4 text-rose-400" />}
                        {(tr.status === 'error' || tr.status === 'timeout') && <AlertCircle className="w-4 h-4 text-rose-400" />}
                        Test Case {tr.testCase}: {tr.status}
                      </div>
                      
                      {tr.errorMessage ? (
                        <div className="bg-black/50 p-2 rounded text-rose-400 whitespace-pre-wrap">{tr.errorMessage}</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-xs opacity-80">
                          <div><div className="font-semibold mb-1 opacity-50">Input:</div><div className="bg-black/30 p-1.5 rounded">{tr.input}</div></div>
                          <div><div className="font-semibold mb-1 opacity-50">Expected:</div><div className="bg-black/30 p-1.5 rounded text-emerald-300">{tr.expectedOutput}</div></div>
                          <div className="col-span-2"><div className="font-semibold mb-1 opacity-50">Your Output:</div><div className={`bg-black/30 p-1.5 rounded ${tr.status === 'pass' ? 'text-emerald-300' : 'text-rose-300'}`}>{tr.actualOutput || '""'}</div></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Performance Feedback Modal */}
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
        />
      )}

      {/* Timeout Feedback Modal */}
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

    </>
  );
}
