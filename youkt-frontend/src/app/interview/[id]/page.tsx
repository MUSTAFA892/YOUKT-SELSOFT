"use client";

import { useState, useEffect, use } from "react";
import Editor from "@monaco-editor/react";
import { getInterview, submitInterviewCode, type Interview, type Question, type SubmissionResult } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle, Terminal, ArrowRight, Home } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

type Lang = "python" | "javascript" | "java" | "c";

const DEFAULT_TEMPLATES: Record<Lang, string> = {
  python: "# Write your solution here\n",
  javascript: "// Write your solution here\n",
  java: `import java.util.*;
import java.io.*;

public class Solution {
    // Write your solution here
    public static void main(String[] args) throws Exception {
        // Read input, compute, and print output
    }
}`,
  c: `#include <stdio.h>
#include <stdlib.h>

// Write your solution here
int main() {
    // Read input, compute, and print output
    return 0;
}`,
};

function getAvailableLangs(q: Question | null): Lang[] {
  const all: Lang[] = ["python", "javascript", "java", "c"];
  if (!q?.wrapperCode) return all;
  const withWrapper = all.filter(l => q.wrapperCode![l]?.trim());
  return withWrapper.length > 0 ? withWrapper : all;
}

export default function CandidateInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;
  const { currentUser } = useAuth();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<Lang>("python");
  const [code, setCode] = useState(DEFAULT_TEMPLATES.python);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const data = await getInterview(interviewId);
        if (currentUser.role !== "recruiter" && data.candidateId !== currentUser.id) {
          setError("This interview is not assigned to your account.");
          return;
        }
        setInterview(data);
        // Pick the best starting language: prefer wrapper langs, then python
        const bestLang = getAvailableLangs(data.questions[0])[0];
        setLanguage(bestLang);
        initializeEditor(data.questions[0], bestLang);
      } catch (err: any) {
        setError("Error loading interview. It might be invalid or not found.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInterview();
  }, [interviewId, currentUser]);

  const initializeEditor = (q: Question, lang: Lang) => {
    if (q.starterCode && q.starterCode[lang]) {
      setCode(q.starterCode[lang]!);
    } else {
      setCode(DEFAULT_TEMPLATES[lang]);
    }
  };

  const handleLanguageChange = (lang: Lang) => {
    setLanguage(lang);
    if (interview?.questions[questionIndex]) {
      initializeEditor(interview.questions[questionIndex], lang);
    }
  };

  const runCode = async () => {
    if (!interview) return;
    const currentQ = interview.questions[questionIndex];
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await submitInterviewCode(interview.id, currentQ.id, language, code);
      setResult(res);
    } catch (err: any) {
      alert("Error submitting code: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setResult(null);
    const nextQ = interview!.questions[nextIdx];
    const bestLang = getAvailableLangs(nextQ)[0];
    setLanguage(bestLang);
    initializeEditor(nextQ, bestLang);
  };

  const isCompleted = interview && questionIndex >= interview.questions.length;

  if (isLoading) {
    return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-white"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  if (error || !interview) {
    return <div className="flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-rose-400 font-semibold gap-4">
      <AlertCircle className="w-12 h-12" />
      {error}
      <Link href="/interviews" className="text-white bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded">Return Home</Link>
    </div>;
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-white gap-6">
        <CheckCircle2 className="w-20 h-20 text-emerald-500" />
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
          <p className="text-neutral-400">You have successfully finished all {interview.questions.length} questions.</p>
        </div>
        <Link href="/interviews" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold transition-all">
          <Home className="w-5 h-5" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentQ = interview.questions[questionIndex];
  const availableLangs = getAvailableLangs(currentQ);
  const isLocked = availableLangs.length < 4;
  const LANG_LABELS: Record<Lang, string> = { python: "Python", javascript: "JavaScript", java: "Java", c: "C" };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-neutral-950">
      
      {/* Assessment Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-white">Interview Assessment</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Question {questionIndex + 1} of {interview.questions.length}</span>
        </div>
        {result?.allPassed && questionIndex < interview.questions.length - 1 && (
          <button onClick={nextQuestion} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors animate-pulse">
            Next Question <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {result?.allPassed && questionIndex === interview.questions.length - 1 && (
          <button onClick={() => setQuestionIndex(questionIndex + 1)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors animate-pulse">
            Finish Assessment <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Challenge Info */}
        <div className="w-[45%] flex flex-col border-r border-neutral-800 bg-neutral-900/40 divide-y divide-neutral-800">
          
          {/* Problem Statement Box */}
          <div className="flex flex-col h-1/3">
            <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{currentQ.title}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-neutral-300 text-sm whitespace-pre-wrap font-sans">
              {currentQ.description}
            </div>
          </div>

          {/* Read-Only Test Cases Box */}
          <div className="flex flex-col h-2/3">
            <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Evaluation Test Cases</h2>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-semibold">{currentQ.testCases.length} Cases</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 bg-neutral-950/50">
              {currentQ.testCases.map((tc, idx) => (
                <div key={idx} className="bg-neutral-900 rounded-lg border border-neutral-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Test Case {idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1">Standard Input</label>
                      <div className="w-full bg-[#1e1e1e] border border-neutral-800 rounded p-2 text-indigo-300 text-xs font-mono min-h-[60px] whitespace-pre-wrap flex items-center">
                        {currentQ.wrapperCode && currentQ.wrapperCode[language] ? (
                          <span className="text-neutral-500 italic flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/> Handled by wrapper</span>
                        ) : tc.input}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1">Expected Output</label>
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
            <div className="flex items-center gap-2">
              <select 
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Lang)}
                className="bg-neutral-800 text-sm text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-indigo-500 font-medium"
              >
                {availableLangs.map(lang => (
                  <option key={lang} value={lang}>{LANG_LABELS[lang]}</option>
                ))}
              </select>
              {isLocked && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  🔒 Wrapper only
                </span>
              )}
            </div>
            
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
          <div className="flex-1 relative">
            <Editor
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
              className="absolute inset-0"
            />
          </div>

          {/* Console / Results Pane */}
          <div className="h-64 border-t border-neutral-800 bg-[#0d0d0d] flex flex-col shrink-0">
            <div className="flex items-center px-4 h-10 border-b border-neutral-800 bg-neutral-900/40 shrink-0">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Evaluation Results
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-neutral-800">
              {!result ? (
                <div className="flex items-center justify-center h-full text-neutral-600 text-sm italic font-medium">Click "Submit Code" to evaluate your solution.</div>
              ) : (
                <div className="space-y-3">
                  {/* Summary Bar */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-800">
                    {result.allPassed ? (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> All {result.totalTests} test cases passed!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full font-bold text-sm">
                        <XCircle className="w-4 h-4" /> {result.passed}/{result.totalTests} test cases passed
                      </div>
                    )}
                    <span className="text-xs text-neutral-500 ml-auto">{result.language}</span>
                  </div>

                  {/* Per Test Case Cards */}
                  {result.results.map((r, i) => (
                    <div key={i}
                      className={`rounded-lg border overflow-hidden ${
                        r.status === 'pass'
                          ? 'border-emerald-800/60 bg-emerald-950/20'
                          : r.status === 'timeout'
                          ? 'border-yellow-800/60 bg-yellow-950/20'
                          : 'border-rose-800/60 bg-rose-950/20'
                      }`}
                    >
                      {/* Card Header */}
                      <div className={`flex items-center justify-between px-4 py-2 border-b ${
                        r.status === 'pass' ? 'border-emerald-800/40 bg-emerald-950/40' :
                        r.status === 'timeout' ? 'border-yellow-800/40 bg-yellow-950/40' :
                        'border-rose-800/40 bg-rose-950/40'
                      }`}>
                        <div className="flex items-center gap-2">
                          {r.status === 'pass'    && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {r.status === 'fail'    && <XCircle className="w-4 h-4 text-rose-400" />}
                          {r.status === 'error'   && <AlertCircle className="w-4 h-4 text-orange-400" />}
                          {r.status === 'timeout' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                          <span className={`text-sm font-bold ${
                            r.status === 'pass' ? 'text-emerald-300' :
                            r.status === 'timeout' ? 'text-yellow-300' : 'text-rose-300'
                          }`}>
                            Test Case {i + 1}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          r.status === 'pass'    ? 'text-emerald-300 bg-emerald-500/15' :
                          r.status === 'timeout' ? 'text-yellow-300 bg-yellow-500/15' :
                          r.status === 'error'   ? 'text-orange-300 bg-orange-500/15' :
                                                    'text-rose-300 bg-rose-500/15'
                        }`}>{r.status}</span>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 grid grid-cols-3 gap-3 text-xs font-mono">
                        {/* Input */}
                        <div>
                          <div className="text-neutral-500 uppercase font-bold tracking-wider mb-1.5 font-sans">Input</div>
                          <div className="bg-black/40 rounded p-2 text-indigo-300 whitespace-pre-wrap break-all min-h-[40px]">
                            {(currentQ.wrapperCode && currentQ.wrapperCode[language])
                              ? <span className="text-neutral-600 italic">Handled by wrapper</span>
                              : (r.input || '—')}
                          </div>
                        </div>

                        {/* Expected Output */}
                        <div>
                          <div className="text-neutral-500 uppercase font-bold tracking-wider mb-1.5 font-sans">Expected</div>
                          <div className="bg-black/40 rounded p-2 text-emerald-300 whitespace-pre-wrap break-all min-h-[40px]">
                            {r.expectedOutput || '""'}
                          </div>
                        </div>

                        {/* Actual Output */}
                        <div>
                          <div className="text-neutral-500 uppercase font-bold tracking-wider mb-1.5 font-sans">Your Output</div>
                          <div className={`bg-black/40 rounded p-2 whitespace-pre-wrap break-all min-h-[40px] ${
                            r.status === 'pass' ? 'text-emerald-300' :
                            r.status === 'timeout' ? 'text-yellow-300' :
                            r.status === 'error' ? 'text-orange-300' : 'text-rose-300'
                          }`}>
                            {r.status === 'error'   ? (r.errorMessage || 'Runtime Error') :
                             r.status === 'timeout' ? 'Time Limit Exceeded' :
                             (r.actualOutput || '""')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
