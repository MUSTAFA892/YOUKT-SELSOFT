"use client";

import { useState, useEffect, use } from "react";
import Editor from "@monaco-editor/react";
import { getChallenge, submitChallengeCode, type Challenge, type SubmissionResult } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle, Terminal } from "lucide-react";

export default function CandidateChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.id;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<"python" | "javascript" | "java" | "c">("javascript");
  const [code, setCode] = useState("// Write your solution here\n");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    async function loadChallenge() {
      try {
        const data = await getChallenge(challengeId);
        setChallenge(data);
        if (data.starterCode && data.starterCode[language]) {
          setCode(data.starterCode[language]!);
        }
      } catch (err: any) {
        setError("Error loading challenge. It might be invalid or not found.");
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenge();
  }, [challengeId]);

  const handleLanguageChange = (lang: "python" | "javascript" | "java" | "c") => {
    setLanguage(lang);
    if (challenge?.starterCode && challenge.starterCode[lang]) {
      setCode(challenge.starterCode[lang]!);
    } else {
      setCode("// Write your solution here\n");
    }
  };

  const runCode = async () => {
    if (!challenge) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await submitChallengeCode(challenge.id, language, code);
      setResult(res);
    } catch (err: any) {
      alert("Error submitting code: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-white"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  if (error || !challenge) {
    return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-rose-400 font-semibold">{error}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-neutral-950">
      
      {/* Left Pane: Challenge Info */}
      <div className="w-[45%] flex flex-col border-r border-neutral-800 bg-neutral-900/40 divide-y divide-neutral-800">
        
        {/* Problem Statement Box */}
        <div className="flex flex-col h-1/3">
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{challenge.title}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-neutral-300 text-sm whitespace-pre-wrap font-sans">
            {challenge.description}
          </div>
        </div>

        {/* Read-Only Test Cases Box */}
        <div className="flex flex-col h-2/3">
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Evaluation Test Cases</h2>
            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-semibold">{challenge.testCases.length} Cases</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 bg-neutral-950/50">
            {challenge.testCases.map((tc, idx) => (
              <div key={idx} className="bg-neutral-900 rounded-lg border border-neutral-800 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Test Case {idx + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">Standard Input (STDIN)</label>
                    <div className="w-full bg-[#1e1e1e] border border-neutral-800 rounded p-2 text-indigo-300 text-xs font-mono min-h-[60px] whitespace-pre-wrap flex items-center">
                      {challenge.wrapperCode && challenge.wrapperCode[language] ? (
                        <span className="text-neutral-500 italic flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/> Handled by wrapper</span>
                      ) : tc.input}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">Expected Output (STDOUT)</label>
                    <div className="w-full bg-[#1e1e1e] border border-neutral-800 rounded p-2 text-emerald-300 text-xs font-mono min-h-[60px] whitespace-pre-wrap">
                      {tc.expectedOutput}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Editor & Console */}
      <div className="flex-1 flex flex-col h-full bg-neutral-950">
        
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-800 shrink-0 bg-neutral-900/60">
          <select 
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="bg-neutral-800 text-sm text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-indigo-500 font-medium"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
          
          <button 
            onClick={runCode}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-all active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Submit Code
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
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
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Console Output */}
        <div className="h-64 shrink-0 flex flex-col border-t border-neutral-800 bg-neutral-900">
          <div className="px-4 h-10 flex items-center border-b border-neutral-800 shrink-0 bg-neutral-950">
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
              <Terminal className="w-4 h-4" />
              Evaluation Results
            </div>
            {result && (
              <div className="ml-auto flex items-center gap-2 text-xs font-semibold">
                {result.allPassed ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Success</span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-4 h-4"/> Failed</span>
                )}
                <span className="text-neutral-500 ml-2">({result.passed}/{result.totalTests} passed)</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#0a0a0a]">
            {!result && !isSubmitting && (
              <div className="text-neutral-600 italic">Submit your code to see the results.</div>
            )}
            {isSubmitting && (
              <div className="text-indigo-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Executing safely on server...
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
                        <div className="col-span-2"><div className="font-semibold mb-1 opacity-50">Your Output:</div><div className={`bg-black/30 p-1.5 rounded whitespace-pre-wrap ${tr.status === 'pass' ? 'text-emerald-300' : 'text-rose-300'}`}>{tr.actualOutput || '""'}</div></div>
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
  );
}
