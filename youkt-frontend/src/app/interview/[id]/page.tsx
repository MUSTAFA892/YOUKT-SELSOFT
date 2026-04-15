"use client";

import { useState, useEffect, use, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { getInterview, submitInterviewCode, submitAssessmentReport, getNextQuestion, type Interview, type Question, type SubmissionResult, reportTabSwitch } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle, Terminal, ArrowRight, Home, RotateCcw, Zap, Clock, Info, BookOpen, ListChecks, ChevronLeft, ChevronRight, Lock, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import TabSwitchWarning from "@/components/TabSwitchWarning";
import { useLockdownDetector } from "@/hooks/useLockdownDetector";
import AiHelpCenter from "@/components/AiHelpCenter";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

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
  const { currentUser, setCurrentUser, registerCandidate } = useAuth();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-question state maps — keyed by question index
  const [langMap,   setLangMap]   = useState<Record<number, Lang>>({});
  const [codeMap,   setCodeMap]   = useState<Record<number, string>>({});
  const [resultMap, setResultMap] = useState<Record<number, SubmissionResult | null>>({});
  const [submittedMap, setSubmittedMap] = useState<Record<number, boolean>>({});

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'examples' | 'testcases'>('description');

  // Tab switch detection
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Fullscreen mode
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isAssessmentComplete = interview && (interview.isComplete || questionIndex >= 10);

  // Derived values for the currently focused question
  const language = langMap[questionIndex]   ?? "python";
  const code     = codeMap[questionIndex]   ?? DEFAULT_TEMPLATES.python;
  const result   = resultMap[questionIndex] ?? null;

  const setLanguage = (lang: Lang) =>
    setLangMap(prev => ({ ...prev, [questionIndex]: lang }));
  const setCode = (c: string) =>
    setCodeMap(prev => ({ ...prev, [questionIndex]: c }));
  const setResult = (r: SubmissionResult | null) =>
    setResultMap(prev => ({ ...prev, [questionIndex]: r }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const data = await getInterview(interviewId);
        setInterview(data);
        // Register the assigned candidate so they appear in the Account Switcher
        registerCandidate(data.candidateId, data.candidateName);
        // Auto-switch to the assigned candidate — no manual action needed
        if (currentUser.id !== data.candidateId) {
          setCurrentUser({ id: data.candidateId, name: data.candidateName, role: "candidate" });
        }
        // Initialize current question with accurate timer
        if (data.questions.length > 0) {
          const currentQ = data.questions[0];
          initializeEditor(currentQ, data.completedCount, data.currentQuestionStartedAt);
        }
      } catch (err: any) {
        setError("Error loading interview. It might be invalid or not found.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInterview();
  }, [interviewId, currentUser]);

  // Tab switch detection handler
  const handleTabSwitch = useCallback(async () => {
    if (!interview) return;
    const newCount = tabSwitchCount + 1;
    setTabSwitchCount(newCount);
    setShowTabWarning(true);

    try {
      // Report to backend
      await reportTabSwitch({
        candidateId: currentUser.id,
        candidateName: currentUser.name,
        problemId: interview.id,
        problemTitle: `Assignment: ${interview.id}`,
        switchCount: newCount,
      });
    } catch (err) {
      console.error('Failed to report tab switch:', err);
    }

    // If 3 violations, auto-exit and submit violation report
    if (newCount >= 3) {
      try {
        // Submit partial report with violation flag
        const questionReports = interview.questions.map((q, idx) => {
          const r = resultMap[idx];
          return {
            questionId: q.id,
            questionTitle: q.title,
            totalTests: r?.totalTests ?? q.testCases.length,
            passed: r?.passed ?? 0,
            failed: r?.failed ?? (r?.totalTests ?? q.testCases.length),
            allPassed: r?.allPassed ?? false,
            language: langMap[idx] ?? 'python',
          };
        });

        const attempted = Object.keys(submittedMap).filter(k => submittedMap[parseInt(k)]).length;
        const totalPassed = questionReports.reduce((s, q) => s + q.passed, 0);
        const totalAvailable = questionReports.reduce((s, q) => s + q.totalTests, 0);
        const score = totalAvailable > 0 ? Math.round((totalPassed / totalAvailable) * 100) : 0;

        await submitAssessmentReport({
          interviewId: interview.id,
          candidateId: interview.candidateId,
          candidateName: interview.candidateName,
          totalQuestions: interview.questions.length,
          questionsAttempted: attempted,
          totalTestsPassed: totalPassed,
          totalTestsAvailable: totalAvailable,
          scorePercent: score,
          questions: questionReports,
          violations: {
            tabSwitches: 3,
            terminated: true,
          },
        });
      } catch (e) {
        console.error('Failed to submit violation report', e);
      }

      setTimeout(() => {
        setIsLocked(true);
        setShowTabWarning(true);
        // Auto-exit after 5 seconds
        setTimeout(() => {
          // Exit fullscreen before redirect
          if (document.fullscreenElement) {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(err => console.warn('Exit fullscreen failed:', err));
            } else if ((document as any).webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
              (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
              (document as any).msExitFullscreen();
            }
          }
          window.location.href = '/interviews';
        }, 5000);
      }, 500);
    }
  }, [tabSwitchCount, currentUser.id, currentUser.name, interview, resultMap, submittedMap, langMap]);

  // Function to enter fullscreen mode (requires user gesture)
  const enterFullscreenMode = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
      setShowFullscreenPrompt(false);
      setIsFullscreen(true);
    } catch (err: any) {
      console.warn('Fullscreen request failed:', err);
      alert('Unable to enter fullscreen mode. Please ensure fullscreen is enabled in browser settings.');
    }
  }, []);

  // Fullscreen control: prevent exit and block keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If in fullscreen mode and user tries to exit, request again
      if (!isCurrentlyFullscreen && isFullscreen) {
        setTimeout(() => {
          enterFullscreenMode();
        }, 100);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only block keys when fullscreen is requested
      if (!isFullscreen) return;
      
      // Block Escape key (fullscreen exit)
      if (e.key === 'Escape') {
        e.preventDefault();
        return false;
      }
      // Block F11 (fullscreen toggle)
      if (e.key === 'F11') {
        e.preventDefault();
        return false;
      }
      // Block Alt+F4 (window close)
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        return false;
      }
      // Block Alt+Tab (app switch)
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        return false;
      }
    };

    // Block context menu (right-click) when fullscreen is active
    const handleContextMenu = (e: MouseEvent) => {
      if (isFullscreen) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isFullscreen, enterFullscreenMode]);
  useLockdownDetector({ onTabSwitch: handleTabSwitch, onSplitScreen: handleTabSwitch });

  const handleCloseTabWarning = () => {
    setShowTabWarning(false);
  };

  const handleExitAssignment = () => {
    window.location.href = '/interviews';
  };

  const initializeEditor = (q: Question, idx: number, startedAt: string | null) => {
    // Calculate accurate time left from server timestamp
    if (startedAt) {
      const startTime = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, (q.timeLimit || 300) - elapsed);
      setTimeLeft(remaining);
      setIsTimedOut(remaining <= 0);
    } else {
      setTimeLeft(q.timeLimit || 300);
      setIsTimedOut(false);
    }
    
    setActiveTab('description');

    // Only set defaults if this question hasn't been visited yet
    setLangMap(prev => {
      if (prev[idx] !== undefined) return prev; // already has a saved lang
      const bestLang = getAvailableLangs(q)[0];
      return { ...prev, [idx]: bestLang };
    });
    setCodeMap(prev => {
      if (prev[idx] !== undefined) return prev; // restore saved code
      const bestLang = getAvailableLangs(q)[0];
      const starter = q.starterCode?.[bestLang] || DEFAULT_TEMPLATES[bestLang];
      return { ...prev, [idx]: starter };
    });
  };

  useEffect(() => {
    if (isTimedOut || isAssessmentComplete) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isTimedOut, isAssessmentComplete]);

  const handleLanguageChange = (lang: Lang) => {
    setLanguage(lang);
    // Only overwrite code with starter/template if no code was typed yet for this lang
    const currentCode = codeMap[questionIndex] ?? "";
    const isDefault = Object.values(DEFAULT_TEMPLATES).includes(currentCode) || currentCode === "";
    if (isDefault && interview?.questions[questionIndex]) {
      const q = interview.questions[questionIndex];
      const starter = q.starterCode?.[lang] || DEFAULT_TEMPLATES[lang];
      setCode(starter);
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

  // Submit button - marks question as solved
  const handleSubmitQuestion = async () => {
    if (!result || !result.allPassed) {
      alert("Please run your code and ensure all tests pass before submitting.");
      return;
    }
    setSubmittedMap(prev => ({ ...prev, [questionIndex]: true }));
    alert(`Question ${questionIndex + 1} submitted successfully!`);
  };

  const [isNextLoading, setIsNextLoading] = useState(false);

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
      setResult(null);
      setActiveTab('description');
    }
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (interview && questionIndex < interview.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setResult(null);
      setActiveTab('description');
    }
  };

  // Jump to question
  const jumpToQuestion = (index: number) => {
    setQuestionIndex(index);
    setResult(null);
    setActiveTab('description');
  };

  const clearAssessment = () => {
    if (!interview) return;
    const confirmed = window.confirm(
      "Are you sure you want to clear ALL your code and results for this assessment? This cannot be undone."
    );
    if (!confirmed) return;
    const newLangMap: Record<number, Lang> = {};
    const newCodeMap: Record<number, string> = {};
    interview.questions.forEach((q, idx) => {
      const bestLang = getAvailableLangs(q)[0];
      newLangMap[idx] = bestLang;
      newCodeMap[idx] = q.starterCode?.[bestLang] || DEFAULT_TEMPLATES[bestLang];
    });
    setLangMap(newLangMap);
    setCodeMap(newCodeMap);
    setResultMap({});
    setQuestionIndex(0);
  };

  const finishAssessment = async () => {
    if (!interview) return;
    
    // Build per-question report from resultMap
    const questionReports = interview.questions.map((q, idx) => {
      const r = resultMap[idx];
      return {
        questionId: q.id,
        questionTitle: q.title,
        totalTests: r?.totalTests ?? q.testCases.length,
        passed: r?.passed ?? 0,
        failed: r?.failed ?? (r?.totalTests ?? q.testCases.length),
        allPassed: r?.allPassed ?? false,
        language: langMap[idx] ?? 'python',
      };
    });

    const attempted = Object.keys(submittedMap).filter(k => submittedMap[parseInt(k)]).length;
    const totalPassed = questionReports.reduce((s, q) => s + q.passed, 0);
    const totalAvailable = questionReports.reduce((s, q) => s + q.totalTests, 0);
    const score = totalAvailable > 0 ? Math.round((totalPassed / totalAvailable) * 100) : 0;

    try {
      await submitAssessmentReport({
        interviewId: interview.id,
        // Always use the interview's own candidateId/Name, not whoever is logged in
        candidateId: interview.candidateId,
        candidateName: interview.candidateName,
        totalQuestions: interview.questions.length,
        questionsAttempted: attempted,
        totalTestsPassed: totalPassed,
        totalTestsAvailable: totalAvailable,
        scorePercent: score,
        questions: questionReports,
      });
    } catch (e) {
      console.error('Failed to submit report', e);
      // Continue to completion screen even if report fails
    }

    // Exit fullscreen mode
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn('Exit fullscreen failed:', err));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }

    setQuestionIndex(interview.questions.length);
  };

  if (isLoading) {
    return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-white"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  if (error || !interview) {
    return <div className="flex flex-col min-h-screen items-center justify-center bg-background text-rose-400 font-bold gap-4">
      <Navbar />
      <div className="pt-24 flex flex-col items-center gap-4 bg-surface/50 p-12 rounded-3xl border border-border">
        <AlertCircle className="w-12 h-12" />
        {error}
        <Link href="/interviews" className="text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg px-6 py-2 rounded-xl transition-all">Return Home</Link>
      </div>
    </div>;
  }

  if (interview && questionIndex >= interview.questions.length) {
    // Completion screen
    const questionReports = interview.questions.map((q, idx) => {
      const r = resultMap[idx];
      return {
        title: q.title,
        passed: r?.passed ?? 0,
        total: r?.totalTests ?? q.testCases.length,
        allPassed: r?.allPassed ?? false,
      };
    });
    const totalPassed = questionReports.filter(q => q.allPassed).length;
    const totalAvailable = questionReports.reduce((s, q) => s + q.total, 0);
    const score = totalAvailable > 0 ? Math.round((totalPassed / totalAvailable) * 100) : 0;

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-white gap-6 p-8">
        <div className="relative">
          <CheckCircle2 className="w-24 h-24 text-emerald-500" />
          <div className="absolute inset-0 animate-pulse">
            <CheckCircle2 className="w-24 h-24 text-emerald-500 opacity-30" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2">Assessment Submitted!</h2>
          <p className="text-neutral-300 text-lg">Your assignment has been completed and sent to the recruiter.</p>
        </div>

        {/* Score Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-neutral-400">Final Score</span>
            <span className={`text-4xl font-bold ${
              score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-rose-400'
            }`}>{score}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-3 mb-8">
            <div className={`h-3 rounded-full transition-all ${
              score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : 'bg-rose-500'
            }`} style={{ width: `${score}%` }} />
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-semibold text-neutral-300 mb-4">Question Results:</div>
            {questionReports.map((q, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded border border-neutral-700">
                <div className="flex items-center gap-3">
                  {q.allPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className="text-neutral-300 font-medium">Q{i + 1}: {q.title}</span>
                </div>
                <span className={`font-bold ${q.allPassed ? 'text-emerald-400' : q.passed > 0 ? 'text-yellow-400' : 'text-rose-400'}`}>
                  {q.passed}/{q.total} passed
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/interviews" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-bold transition-all">
          <Home className="w-5 h-5" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentQ = interview.questions[questionIndex];
  const availableLangs = getAvailableLangs(currentQ);
  const LANG_LABELS: Record<Lang, string> = { python: "Python", javascript: "JavaScript", java: "Java", c: "C" };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      <Navbar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-24 pb-6 px-6 gap-6 w-full max-w-[1600px] mx-auto">

        {/* Assessment Header */}
        <div className="h-16 bg-surface/50 border border-border rounded-2xl flex items-center justify-between px-6 shrink-0 shadow-3d backdrop-blur-sm relative z-10 w-full overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-50" />
          <div className="flex items-center gap-4 relative z-10">
            <span className="text-sm font-black text-primary tracking-tighter italic">YOUKT<span className="text-foreground"> CTP</span></span>
            <div className="h-6 w-[1px] bg-border" />
            <span className="text-xs bg-surface/80 border border-border text-foreground px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <div className="flex flex-col leading-tight">
                <span className="font-bold">{interview.candidateName}</span>
                <span className="text-[9px] text-neutral-500 font-mono tracking-widest">{interview.candidateId}</span>
              </div>
            </span>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold border border-primary/20">Question {questionIndex + 1} / {interview.questions.length}</span>
          </div>

        <div className="flex items-center gap-8 relative z-10">
          {/* Timer Tool */}
          <div className={`flex items-center gap-2 font-mono text-xl font-bold tabular-nums transition-colors tracking-tight ${
            timeLeft < 30 ? 'text-rose-500 animate-pulse' : 
            timeLeft < 60 ? 'text-amber-500' : 'text-emerald-400'
          }`}>
            <Clock className="w-5 h-5" />
            <span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAssessment}
              disabled={isTimedOut}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-rose-400 bg-surface/50 hover:bg-rose-500/10 border border-border hover:border-rose-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-30"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Code
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6">
        {/* Left Pane: Tabbed Challenge Info */}
        <div className="w-[40%] flex flex-col bg-surface/30 border border-border backdrop-blur-sm rounded-3xl shadow-3d overflow-hidden divide-y divide-border">
          
          {/* Question List Navigator */}
          <div className="px-6 py-4 bg-background/50 border-b border-border shrink-0">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">All Questions</p>
            <div className="flex flex-wrap gap-2">
              {interview?.questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToQuestion(idx)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                    questionIndex === idx
                      ? 'bg-primary text-primary-foreground border border-primary shadow-lg shadow-primary/20 scale-105'
                      : submittedMap[idx]
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-surface/50 text-neutral-400 border border-border hover:bg-surface hover:text-foreground'
                  }`}
                  title={submittedMap[idx] ? 'Completed' : 'Not completed'}
                >
                  {submittedMap[idx] ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-surface space-y-12">
            
            {/* 1. Description Section */}
            <section className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-3">{currentQ.title}</h1>
                <div className="flex gap-2">
                  <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-lg border ${
                    currentQ.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
                    currentQ.difficulty === 'Medium' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' :
                    'border-rose-500/30 text-rose-500 bg-rose-500/10'
                  }`}>
                    {currentQ.difficulty}
                  </span>
                  <span className="text-[10px] uppercase font-black px-3 py-1 rounded-lg border border-border text-neutral-400 bg-surface/50">
                    Score: 100
                  </span>
                </div>
              </div>

              <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {currentQ.description}
              </div>
            </section>

            {/* 2. Format Specifications */}
            <section className="space-y-6 pt-8 border-t border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Specifications
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Input Format</h4>
                  <div className="bg-background/50 p-4 rounded-2xl border border-border text-neutral-400 text-xs italic shadow-inner">
                    {currentQ.inputFormat && currentQ.inputFormat.trim().length > 0 ? currentQ.inputFormat : "Refer to the examples below for standard input structure."}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Output Format</h4>
                  <div className="bg-background/50 p-4 rounded-2xl border border-border text-neutral-400 text-xs italic shadow-inner">
                    {currentQ.outputFormat && currentQ.outputFormat.trim().length > 0 ? currentQ.outputFormat : "Return the expected data type as shown in the examples."}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Examples Section */}
            {currentQ.examples && currentQ.examples.length > 0 && (
              <section className="space-y-8 pt-8 border-t border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Examples
                </h3>
                
                <div className="space-y-8">
                  {currentQ.examples.map((ex, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-[3px] bg-primary rounded-full" />
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Example {i + 1}</h4>
                      </div>
                      <div className="space-y-3 bg-background/50 rounded-2xl border border-border p-5 xl:p-6 shadow-inner">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Input</span>
                          <code className="text-primary text-sm font-mono bg-surface p-2 rounded-lg block overflow-x-auto">{ex.input}</code>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Expected Output</span>
                          <code className="text-emerald-400 text-sm font-mono bg-surface p-2 rounded-lg block overflow-x-auto">{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div className="pt-3 mt-1 border-t border-border">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Explanation</span>
                            <p className="text-neutral-400 text-xs leading-relaxed italic">{ex.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Public Test Cases Section */}
            {currentQ.testCases && currentQ.testCases.length > 0 && (
              <section className="space-y-6 pt-8 border-t border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  Test Cases
                </h3>

                <div className="space-y-6">
                  {currentQ.testCases.map((tc, idx) => (
                    <div key={idx} className="bg-background/50 rounded-2xl border border-border p-5 xl:p-6 shadow-inner">
                      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                        <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Case {idx + 1}</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Input</label>
                          <div className="bg-surface border border-border rounded-lg p-3 text-primary text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                            {tc.input}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">Expected Output</label>
                          <div className="bg-surface border border-border rounded-lg p-3 text-emerald-400 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                            {tc.expectedOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right Pane: Code + Console */}
        <div className="flex-1 flex flex-col bg-surface/30 border border-border backdrop-blur-sm rounded-3xl shadow-3d overflow-hidden relative">
          
          {/* Editor Toolbar with unified actions */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border bg-background/30 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <select 
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Lang)}
                disabled={isTimedOut}
                className="bg-surface text-sm text-foreground border border-border rounded-lg px-4 py-2 outline-none focus:border-primary font-bold appearance-none cursor-pointer disabled:opacity-50"
              >
                {availableLangs.map(lang => (
                  <option key={lang} value={lang}>{LANG_LABELS[lang]}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              {/* RUN BUTTON */}
              <button 
                onClick={runCode}
                disabled={isSubmitting || isTimedOut}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-surface disabled:text-neutral-500 text-primary-foreground text-sm font-bold uppercase px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40 tracking-wider"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Run
              </button>

              {/* COMPLETION INDICATOR */}
              {submittedMap[questionIndex] ? (
                <button 
                  disabled
                  className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase px-4 py-2.5 rounded-xl tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </button>
              ) : (
                <div className="flex items-center gap-2 text-amber-500/80 text-xs font-bold uppercase px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 tracking-wider">
                  <Info className="w-4 h-4" />
                  Needs Passing
                </div>
              )}

              <div className="w-[1px] h-8 bg-border mx-2" />

              {/* PREVIOUS BUTTON */}
              <button 
                onClick={goToPreviousQuestion}
                disabled={questionIndex === 0}
                className="flex items-center gap-2 bg-surface hover:bg-surface/80 disabled:opacity-30 text-foreground text-xs font-bold uppercase px-4 py-2.5 rounded-xl border border-border transition-all tracking-wider"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              {/* NEXT / SUBMIT BUTTON */}
              {questionIndex === interview.questions.length - 1 ? (
                <button 
                  onClick={finishAssessment}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 tracking-wider"
                >
                  <Send className="w-4 h-4" />
                  Finish Complete Assignment
                </button>
              ) : (
                <button 
                  onClick={goToNextQuestion}
                  className="flex items-center gap-2 bg-surface hover:bg-surface/80 text-foreground text-xs font-bold uppercase px-4 py-2.5 rounded-xl border border-border transition-all tracking-wider group"
                >
                  Next
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden bg-background">
            <Editor
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => !isTimedOut && setCode(val || "")}
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14, 
                readOnly: isTimedOut,
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                padding: { top: 20 }
              }}
              className={`absolute inset-0 transition-opacity ${isTimedOut ? 'opacity-30 grayscale saturate-0' : 'opacity-100'}`}
            />

            {isTimedOut && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-8 text-center bg-black/40 backdrop-blur-[2px]">
                <div className="bg-rose-500/10 border border-rose-500/30 p-8 rounded-2xl max-w-sm backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="bg-rose-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
                    <Clock className="w-8 h-8 text-rose-500 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black text-rose-500 uppercase tracking-tighter mb-2">Time Expired</h2>
                  <p className="text-neutral-400 text-sm mb-6 leading-relaxed">The time limit for this challenge has been reached. Please click <strong>Next Question</strong> to continue with the assessment.</p>
                  <button 
                    onClick={() => goToNextQuestion()}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest rounded-lg shadow-xl shadow-rose-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Move to Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Console / Results Pane */}
          <div className="h-72 border-t border-border bg-background/50 flex flex-col shrink-0 relative">
            <div className="px-6 h-12 flex items-center justify-between border-b border-border bg-background shrink-0 z-10 w-full">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" /> Evaluation Results
              </span>
              
              <div className="flex gap-2">
                 <button 
                  onClick={handleSubmitQuestion}
                  disabled={!result || !result.allPassed || submittedMap[questionIndex] || isTimedOut}
                  className={`flex items-center gap-2 text-xs font-bold uppercase px-4 py-1.5 rounded-lg transition-all ${
                    !result?.allPassed 
                      ? 'bg-surface text-neutral-500 border border-border'
                      : submittedMap[questionIndex]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)] border border-emerald-400 animate-pulse'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submittedMap[questionIndex] ? 'Submitted' : 'Submit Code'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-surface bg-background/30">
              {!result ? (
                <div className="flex items-center justify-center h-full text-neutral-500 text-sm italic font-medium">Click "Run" to evaluate your solution.</div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                    {result.allPassed ? (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 font-bold text-sm shadow-inner">
                        <CheckCircle2 className="w-5 h-5" /> All {result.totalTests} test cases passed!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 font-bold text-sm shadow-inner">
                        <XCircle className="w-5 h-5" /> {result.passed}/{result.totalTests} test cases passed
                      </div>
                    )}
                    <span className="text-xs text-neutral-500 ml-auto font-mono bg-surface px-3 py-1.5 rounded-lg border border-border">{result.language} • {result.averageTimeMs || 0}ms avg</span>
                    {result.allPassed && (
                      <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase ml-4 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                        <Zap className="w-3 h-3 fill-current animate-pulse" /> Optimal Flow Active
                      </div>
                    )}
                  </div>

                  {/* Per Test Case Cards */}
                  {result.results.map((r, i) => (
                    <div key={i}
                      className={`rounded-2xl border overflow-hidden transition-all ${
                        r.status === 'pass'
                          ? 'border-emerald-500/30 bg-emerald-500/5 shadow-inner'
                          : r.status === 'timeout'
                          ? 'border-amber-500/30 bg-amber-500/5 shadow-inner'
                          : 'border-rose-500/30 bg-rose-500/5 shadow-inner'
                      }`}
                    >
                      {/* Card Header */}
                      <div className={`flex items-center justify-between px-5 py-3 border-b ${
                        r.status === 'pass' ? 'border-emerald-500/20 bg-emerald-500/10' :
                        r.status === 'timeout' ? 'border-amber-500/20 bg-amber-500/10' :
                        'border-rose-500/20 bg-rose-500/10'
                      }`}>
                        <div className="flex items-center gap-2">
                          {r.status === 'pass'    && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {r.status === 'fail'    && <XCircle className="w-4 h-4 text-rose-400" />}
                          {r.status === 'error'   && <AlertCircle className="w-4 h-4 text-orange-400" />}
                          {r.status === 'timeout' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                          <span className={`text-sm font-bold uppercase tracking-widest ${
                            r.status === 'pass' ? 'text-emerald-400' :
                            r.status === 'timeout' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            Test Case {r.testCase}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${
                          r.status === 'pass'    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          r.status === 'timeout' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                          r.status === 'error'   ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                                                    'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}>{r.status}</span>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 grid grid-cols-3 gap-6 text-xs font-mono">
                        {/* Input */}
                        <div>
                          <div className="text-neutral-500 uppercase font-bold tracking-widest mb-2 text-[10px] sans-serif">Input</div>
                          <div className="bg-background/80 border border-border rounded-xl p-3 text-primary whitespace-pre-wrap break-all min-h-[40px]">
                            {r.input || '—'}
                          </div>
                        </div>

                        {/* Expected Output */}
                        <div>
                          <div className="text-neutral-500 uppercase font-bold tracking-widest mb-2 text-[10px] sans-serif">Expected</div>
                          <div className="bg-background/80 border border-border rounded-xl p-3 text-emerald-400 whitespace-pre-wrap break-all min-h-[40px]">
                            {r.expectedOutput || '""'}
                          </div>
                        </div>

                        {/* Actual Output */}
                        <div>
                          <div className="text-neutral-500 uppercase font-bold tracking-widest mb-2 text-[10px] sans-serif">Your Output</div>
                          <div className={`bg-background/80 border border-border rounded-xl p-3 whitespace-pre-wrap break-all min-h-[40px] ${
                            r.status === 'pass' ? 'text-emerald-400' :
                            r.status === 'timeout' ? 'text-amber-400' :
                            r.status === 'error' ? 'text-orange-400' : 'text-rose-400'
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

      {/* Fullscreen Mode Prompt */}
      {showFullscreenPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center">Enter Full-Screen Mode</h2>
            </div>
            <p className="text-neutral-400 text-center mb-6 leading-relaxed">
              This assessment must be completed in full-screen mode. Click below to enter full-screen and begin the assignment.
            </p>
            <button
              onClick={enterFullscreenMode}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-900/30 active:scale-95 transition-all"
            >
              Enter Full-Screen Mode
            </button>
          </div>
        </div>
      )}

      {/* Tab Switch Warning Modal */}
      <TabSwitchWarning 
        isOpen={showTabWarning}
        count={tabSwitchCount}
        onClose={handleCloseTabWarning}
        onExit={handleExitAssignment}
      />

      {/* AI Help Center Widget */}
      <AiHelpCenter 
        candidateId={interview.candidateId}
        candidateName={interview.candidateName}
        interviewId={interview.id}
        currentQuestion={currentQ}
      />
      </div>
    </div>
  );
}