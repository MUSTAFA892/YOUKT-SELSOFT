"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { submitCustomCode, type SubmissionResult, type CustomTestCase } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle, Terminal, Plus, Trash2 } from "lucide-react";
import CodeReviewPanel from "@/components/CodeReviewPanel";
import PlagiarismDetectionPanel from "@/components/PlagiarismDetectionPanel";
import { useAuth } from "@/components/AuthProvider";

export default function CustomIDE() {
  const { currentUser } = useAuth();
  const [language, setLanguage] = useState<"python" | "javascript" | "java" | "c">("javascript");
  const [code, setCode] = useState("// Write your solution here\n");
  const [problemStatement, setProblemStatement] = useState("");
  const [testCases, setTestCases] = useState<CustomTestCase[]>([{ input: "", expectedOutput: "" }]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [analysisTab, setAnalysisTab] = useState<"console" | "review" | "plagiarism">("console");
  const [submissionId] = useState<string>(`sub_${Date.now()}`);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as any);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length === 1) return; // Need at least one
    const newCases = [...testCases];
    newCases.splice(index, 1);
    setTestCases(newCases);
  };

  const updateTestCase = (index: number, field: "input" | "expectedOutput", value: string) => {
    const newCases = [...testCases];
    newCases[index][field] = value;
    setTestCases(newCases);
  };

  const runCode = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await submitCustomCode(language, code, testCases);
      setResult(res);
    } catch (err: any) {
      alert("Error submitting code: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-neutral-950">
      
      {/* Left Pane: Custom Problem config */}
      <div className="w-[45%] flex flex-col border-r border-neutral-800 bg-neutral-900/40 divide-y divide-neutral-800">
        
        {/* Problem Statement Box */}
        <div className="flex flex-col h-1/2">
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Problem Statement</h2>
          </div>
          <textarea
            value={problemStatement}
            onChange={e => setProblemStatement(e.target.value)}
            placeholder="Paste the problem statement from your recruiter here..."
            className="flex-1 w-full p-4 bg-transparent text-neutral-300 resize-none focus:outline-none placeholder:text-neutral-600 text-sm"
          />
        </div>

        {/* Test Cases Box */}
        <div className="flex flex-col h-1/2">
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Custom Test Cases</h2>
            <button 
              onClick={addTestCase}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md text-xs font-semibold transition-colors border border-indigo-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> Add Case
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
            {testCases.map((tc, idx) => (
              <div key={idx} className="bg-neutral-950 rounded-lg border border-neutral-800 p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Test Case {idx + 1}</span>
                  {testCases.length > 1 && (
                    <button onClick={() => removeTestCase(idx)} className="text-neutral-500 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">Standard Input (STDIN)</label>
                    <textarea 
                      value={tc.input} 
                      onChange={e => updateTestCase(idx, 'input', e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-neutral-700/50 rounded p-2 text-indigo-300 text-sm font-mono focus:border-indigo-500 focus:outline-none resize-none h-20"
                      placeholder="e.g. 10 20\n30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1">Expected Output (STDOUT)</label>
                    <textarea 
                      value={tc.expectedOutput} 
                      onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-neutral-700/50 rounded p-2 text-emerald-300 text-sm font-mono focus:border-emerald-500 focus:outline-none resize-none h-14"
                      placeholder="e.g. 60"
                    />
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
            onChange={handleLanguageChange}
            className="bg-neutral-800 text-sm text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-indigo-500 font-medium"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
          
          <button 
            onClick={runCode}
            disabled={isSubmitting || testCases.some(tc => !tc.expectedOutput)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-all active:scale-95"
            title={testCases.some(tc => !tc.expectedOutput) ? "Please fill Expected Output for all test cases" : ""}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Run Tests
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
          <div className="px-4 h-10 flex items-center border-b border-neutral-800 shrink-0 bg-neutral-950 gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setAnalysisTab("console")}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded transition-colors ${
                  analysisTab === "console" 
                    ? "text-indigo-400 bg-indigo-500/10" 
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Terminal className="w-4 h-4" /> Console
              </button>
              {result && (
                <>
                  <button 
                    onClick={() => setAnalysisTab("review")}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded transition-colors ${
                      analysisTab === "review" 
                        ? "text-indigo-400 bg-indigo-500/10" 
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    📊 Code Review
                  </button>
                  <button 
                    onClick={() => setAnalysisTab("plagiarism")}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded transition-colors ${
                      analysisTab === "plagiarism" 
                        ? "text-indigo-400 bg-indigo-500/10" 
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    🔍 Plagiarism
                  </button>
                </>
              )}
            </div>
            {result && analysisTab === "console" && (
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
            {analysisTab === "console" && (
              <>
                {!result && !isSubmitting && (
                  <div className="text-neutral-600 italic">Configure test cases and run your raw code...</div>
                )}
                {isSubmitting && (
                  <div className="text-indigo-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Executing via STDIN...
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
              </>
            )}
            {analysisTab === "review" && (
              <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-4">
                <CodeReviewPanel 
                  code={code}
                  language={language}
                  onReview={(review) => {
                    console.log("Code review completed:", review);
                  }}
                />
              </div>
            )}
            {analysisTab === "plagiarism" && (
              <div className="bg-neutral-950 rounded-lg border border-neutral-800 p-4">
                <PlagiarismDetectionPanel 
                  code={code}
                  candidateId={currentUser?.id || "custom_user"}
                  interviewId="custom_ide"
                  onCheck={(report) => {
                    console.log("Plagiarism check completed:", report);
                  }}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
