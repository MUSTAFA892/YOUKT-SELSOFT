"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { type Problem, type SubmissionResult, submitCode } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle, Terminal } from "lucide-react";

export default function Workspace({ problem }: { problem: Problem }) {
  const [language, setLanguage] = useState<"python" | "javascript" | "java" | "c">("javascript");
  const [code, setCode] = useState(problem.starterCode.javascript);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as any;
    setLanguage(newLang);
    setCode(problem.starterCode[newLang as keyof typeof problem.starterCode]);
  };

  const runCode = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await submitCode(problem.id, language, code);
      setResult(res);
    } catch (err: any) {
      alert("Error submitting code: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

          <div className="mt-8 space-y-6">
            {problem.examples.map((ex, i) => (
              <div key={i} className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Example {i + 1}</span>
                <div className="space-y-2 text-sm font-mono bg-black/40 p-3 rounded-md">
                  <div><span className="text-neutral-500">Input:</span> <span className="text-indigo-300">{ex.input}</span></div>
                  <div><span className="text-neutral-500">Output:</span> <span className="text-emerald-300">{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="mt-2 text-neutral-400 text-xs font-sans border-t border-neutral-800 pt-2 break-words">
                      {ex.explanation}
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
        <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-800 shrink-0 bg-neutral-900/60">
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
          
          <button 
            onClick={runCode}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-all active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Run Code
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
              scrollBeyondLastLine: false,
              roundedSelection: false,
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
  );
}
