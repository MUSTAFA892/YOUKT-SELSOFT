"use client";

import { useState } from "react";
import { createInterview, generateTemplatesWithAI, type Question, type CodeTemplates } from "@/lib/api";
import { Plus, Trash2, Link as LinkIcon, Loader2, Code2, Users, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { useAuth } from "@/components/AuthProvider";
import QuestionLibraryBrowser from "@/components/QuestionLibraryBrowser";

type EditingQuestion = Omit<Question, 'id'> & {
  activeLang: "python" | "javascript" | "java" | "c";
  isAdvancedOpen?: boolean;
  isExamplesOpen?: boolean;
};

export default function RecruiterPortal() {
  const { currentUser, allCandidates, registerCandidate, getRecruiterCandidates } = useAuth();
  
  // Get only candidates for current recruiter
  const recruiterCandidates = currentUser.role === "recruiter" 
    ? getRecruiterCandidates(currentUser.id) 
    : allCandidates;
  
  const [questionCreationMode, setQuestionCreationMode] = useState<"manual" | "library">("manual");
  const [candidateMode, setCandidateMode] = useState<"existing" | "new" | "multiple">("existing");
  const [candidateId, setCandidateId] = useState<string>("");
  const [customCandidateId, setCustomCandidateId] = useState<string>("");
  const [customCandidateName, setCustomCandidateName] = useState<string>("");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  
  const [questions, setQuestions] = useState<EditingQuestion[]>([{
    title: "Algorithm Question 1",
    description: "",
    inputFormat: "",
    outputFormat: "",
    examples: [],
    testCases: [{ input: "", expectedOutput: "" }],
    starterCode: { python: "", javascript: "", java: "", c: "" },
    wrapperCode: { python: "", javascript: "", java: "", c: "" },
    activeLang: "python",
    isAdvancedOpen: false,
    isExamplesOpen: false
  }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<number | null>(null); // Index of question being generated
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Array<{id: string; name: string; link: string}>>([]);


  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: `Algorithm Question ${questions.length + 1}`,
        description: "",
        inputFormat: "",
        outputFormat: "",
        examples: [],
        testCases: [{ input: "", expectedOutput: "" }],
        starterCode: { python: "", javascript: "", java: "", c: "" },
        wrapperCode: { python: "", javascript: "", java: "", c: "" },
        activeLang: "python",
        isAdvancedOpen: false,
        isExamplesOpen: false
      }
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<EditingQuestion>) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], ...updates };
    setQuestions(newQs);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const generateLink = async () => {
    // Determine which candidates to create interviews for
    let targetCandidates: Array<{ id: string; name: string }> = [];
    
    if (candidateMode === "existing") {
      if (!candidateId) {
        alert("Please select a candidate.");
        return;
      }
      targetCandidates = [{ id: candidateId, name: recruiterCandidates.find(u => u.id === candidateId)?.name || "Unknown" }];
    } else if (candidateMode === "new") {
      const effectiveId = customCandidateId.trim();
      const effectiveName = customCandidateName.trim() || "External Candidate";
      if (!effectiveId) {
        alert("Please enter a Candidate ID.");
        return;
      }
      targetCandidates = [{ id: effectiveId, name: effectiveName }];
    } else if (candidateMode === "multiple") {
      if (selectedCandidates.size === 0) {
        alert("Please select at least one candidate.");
        return;
      }
      targetCandidates = Array.from(selectedCandidates).map(id => ({
        id,
        name: recruiterCandidates.find(u => u.id === id)?.name || "Unknown"
      }));
    }

    // Validate questions
    for (const q of questions) {
      if (!q.description.trim()) {
        alert("Please ensure all questions have a description.");
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      // First auto-generate missing templates using AI
      const payloadQuestions = [...questions];
      
      for (let i = 0; i < payloadQuestions.length; i++) {
        const q = payloadQuestions[i];
        
        // Check if any starter/wrapper code is missing
        const needsAI = ['python', 'javascript', 'java', 'c'].some(lang => {
          return !q.starterCode?.[lang as keyof CodeTemplates]?.trim() || 
                 !q.wrapperCode?.[lang as keyof CodeTemplates]?.trim();
        });

        if (needsAI) {
          try {
            const aiTemplates = await generateTemplatesWithAI(
              q.title, 
              q.description, 
              q.inputFormat || '', 
              q.outputFormat || ''
            );
            
            payloadQuestions[i] = {
              ...q,
              starterCode: { ...(q.starterCode || {}), ...aiTemplates.starterCode },
              wrapperCode: { ...(q.wrapperCode || {}), ...aiTemplates.wrapperCode }
            };
          } catch (e) {
            console.error("AI Generation failed for question", i, e);
          }
        }
      }

      // Cleanup extra UI fields
      const finalQuestions = payloadQuestions.map(({ activeLang, isAdvancedOpen, isExamplesOpen, ...q }) => q as any);
      
      const links: Array<{id: string; name: string; link: string}> = [];

      // Create interview for each target candidate
      for (const candidate of targetCandidates) {
        // Register new candidate if creating for a new candidate
        if (candidateMode === "new") {
          registerCandidate(candidate.id, candidate.name);
        }
        
        const interview = await createInterview(
          candidate.id, 
          candidate.name, 
          finalQuestions, 
          currentUser.id, 
          currentUser.name
        );
        
        // Use NEXT_PUBLIC_CANDIDATE_APP_URL if set, otherwise intelligently derive it
        let candidateOrigin = process.env.NEXT_PUBLIC_CANDIDATE_APP_URL || '';
        
        if (!candidateOrigin) {
          // Fallback: if not configured via env var, derive from current origin
          candidateOrigin = window.location.origin.replace(':3002', ':3000');
        }
        
        const url = `${candidateOrigin}/interview/${interview.id}`;
        links.push({ id: candidate.id, name: candidate.name, link: url });
      }

      if (candidateMode === "multiple") {
        setGeneratedLinks(links);
        setGeneratedLink(null);
      } else {
        setGeneratedLink(links[0].link);
        setGeneratedLinks([]);
      }
    } catch (err: any) {
      console.error("Full error:", err);
      alert("Error creating interview: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCandidateSelection = (id: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCandidates(newSelected);
  };

  if (currentUser.role !== "recruiter") {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#050505] text-white flex-col gap-4">
        <Users className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-neutral-400">Please switch to a Recruiter account to create interviews.</p>
      </div>
    );
  }

  const candidateUsers = recruiterCandidates;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] w-full bg-[#050505] text-neutral-200 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="p-8 pb-32 max-w-5xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-emerald-400" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            Build Assessment
          </h1>
        </div>
        <p className="text-neutral-400 mb-8 max-w-lg">Author a multi-question algorithmic interview and assign it directly to a candidate.</p>
        
        {/* Question Creation Mode Tabs */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setQuestionCreationMode("manual")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg backdrop-blur-md border ${
              questionCreationMode === "manual"
                ? "bg-indigo-600/90 text-white border-indigo-500/50 shadow-indigo-500/20"
                : "bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800/80 border-neutral-800/50 hover:border-neutral-700/50"
            }`}
          >
            ✏️ Manual Creation
          </button>
          <button
            onClick={() => setQuestionCreationMode("library")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg backdrop-blur-md border ${
              questionCreationMode === "library"
                ? "bg-indigo-600/90 text-white border-indigo-500/50 shadow-indigo-500/20"
                : "bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800/80 border-neutral-800/50 hover:border-neutral-700/50"
            }`}
          >
            📚 Question Library
          </button>
        </div>

        {/* Question Library Browser */}
        {questionCreationMode === "library" && (
          <div className="mb-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-indigo-400">📚</span> Pre-Built Questions
            </h2>
            <QuestionLibraryBrowser 
              userId={currentUser?.id || ""}
              onSelectQuestion={(question) => {
                // Add selected question to questions array
                const newQuestion: EditingQuestion = {
                  title: question.title,
                  description: question.description,
                  inputFormat: question.inputFormat || "",
                  outputFormat: question.outputFormat || "",
                  examples: question.examples || [],
                  testCases: question.testCases || [],
                  starterCode: { 
                    python: question.starterCode?.python || "",
                    javascript: question.starterCode?.javascript || "",
                    java: question.starterCode?.java || "",
                    c: question.starterCode?.c || ""
                  },
                  wrapperCode: {
                    python: question.wrapperCode?.python || "",
                    javascript: question.wrapperCode?.javascript || "",
                    java: question.wrapperCode?.java || "",
                    c: question.wrapperCode?.c || ""
                  },
                  activeLang: "python",
                  isAdvancedOpen: false,
                  isExamplesOpen: false
                };

                // If the only question is the default unnamed/empty one, replace it
                const isDefaultEmpty = questions.length === 1 && 
                                       questions[0].title === "Algorithm Question 1" && 
                                       questions[0].description === "";
                
                if (isDefaultEmpty) {
                  setQuestions([newQuestion]);
                } else {
                  setQuestions([...questions, newQuestion]);
                }

                alert(`✅ "${question.title}" added to your interview! Please select a candidate and click 'Generate & Assign Interview' below.`);
              }}
            />
          </div>
        )}
        
        {generatedLink && (
          <div className="mb-8 p-6 backdrop-blur-md border border-emerald-500/40 bg-emerald-950/30 rounded-2xl flex flex-col gap-4 shadow-2xl shadow-emerald-900/20">
            <h3 className="text-emerald-400 font-bold flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-6 h-6" /> Interview Created & Assigned Successfully!
            </h3>
            <p className="text-sm text-neutral-300">Share this unique link with the candidate (or they can find it in their dashboard):</p>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                readOnly 
                value={generatedLink} 
                className="flex-1 bg-black/60 border border-emerald-500/30 rounded-xl p-3.5 text-emerald-200 text-sm font-mono focus:outline-none focus:border-emerald-400 shadow-inner" 
              />
              <button 
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 shrink-0 hover:shadow-emerald-500/30"
              >
                Copy Link
              </button>
              <a 
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 shrink-0 flex items-center justify-center"
              >
                Open
              </a>
            </div>
          </div>
        )}

        {generatedLinks.length > 0 && (
          <div className="mb-8 p-6 backdrop-blur-md border border-emerald-500/40 bg-emerald-950/30 rounded-2xl flex flex-col gap-4 shadow-2xl shadow-emerald-900/20">
            <h3 className="text-emerald-400 font-bold flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-6 h-6" /> {generatedLinks.length} Interviews Created Successfully!
            </h3>
            <p className="text-sm text-neutral-300">Each candidate has received a unique link:</p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {generatedLinks.map((item, idx) => (
                <div key={idx} className="bg-black/60 border border-emerald-500/20 rounded-xl p-4 shadow-inner">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-bold text-emerald-200">{item.name}</p>
                      <p className="text-xs text-emerald-500/60 font-mono">{item.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(item.link)}
                        className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Copy
                      </button>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={item.link}
                    className="w-full bg-black/40 border border-emerald-500/10 rounded-lg p-2.5 text-emerald-300/80 text-xs font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Assignment Section */}
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 mb-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Assign Candidate</h2>
              <p className="text-sm text-neutral-400">Select an existing account or assign to new ones.</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 bg-black/40 rounded-xl p-1.5 mb-6 w-fit border border-white/5">
            <button
              onClick={() => {
                setCandidateMode("existing");
                setSelectedCandidates(new Set());
              }}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                candidateMode === "existing"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Existing Account
            </button>
            <button
              onClick={() => {
                setCandidateMode("new");
                setSelectedCandidates(new Set());
              }}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                candidateMode === "new"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              + New Candidate
            </button>
            <button
              onClick={() => {
                setCandidateMode("multiple");
                setCandidateId("");
              }}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                candidateMode === "multiple"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📋 Multiple
            </button>
          </div>

          {candidateMode === "existing" ? (
            <select 
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="w-full max-w-md bg-black/60 border border-neutral-700/50 rounded-xl p-3.5 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>-- Select Candidate --</option>
              {candidateUsers.map(c => (
                <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
              ))}
            </select>
          ) : candidateMode === "new" ? (
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              <div className="flex-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Candidate ID <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. cand_001 or mail@example.com"
                  value={customCandidateId}
                  onChange={e => setCustomCandidateId(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-700/50 rounded-xl p-3 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-neutral-600 shadow-inner"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Candidate Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Smith"
                  value={customCandidateName}
                  onChange={e => setCustomCandidateName(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-700/50 rounded-xl p-3 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-neutral-600 shadow-inner"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-w-2xl max-h-64 overflow-y-auto border border-neutral-700/50 rounded-xl p-4 bg-black/40 shadow-inner custom-scrollbar">
              {candidateUsers.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-4">No candidates available</p>
              ) : (
                candidateUsers.map(c => (
                  <label key={c.id} className="flex items-center gap-4 p-3 hover:bg-neutral-800/80 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-neutral-700/50">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.has(c.id)}
                      onChange={() => toggleCandidateSelection(c.id)}
                      className="w-5 h-5 rounded border-neutral-600 bg-black cursor-pointer accent-indigo-500"
                    />
                    <span className="text-white font-medium text-sm flex-1">{c.name}</span>
                    <span className="text-neutral-500 text-xs font-mono bg-white/5 px-2 py-1 rounded">{c.id}</span>
                  </label>
                ))
              )}
            </div>
          )}

          {candidateMode === "new" && (
            <p className="text-xs text-amber-400 mt-4 flex items-start gap-2 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <span className="text-base mt-[-2px]">⚠️</span>
              When the candidate opens the link, they should switch their account to the ID you entered above to submit their report correctly.
            </p>
          )}

          {candidateMode === "multiple" && selectedCandidates.size > 0 && (
            <p className="text-xs text-indigo-400 mt-4 flex items-start gap-2 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
              <span className="text-base mt-[-2px]">ℹ️</span>
              {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? "s" : ""} selected. Each will receive a unique interview link.
            </p>
          )}
        </div>

        {/* Manual Question Creation Section */}
        {questionCreationMode === "manual" && (
        <div className="space-y-8">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 relative shadow-2xl transition-all">
              <div className="absolute top-8 right-8">
                 {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIndex)} className="text-neutral-500 hover:text-rose-400 bg-black/40 hover:bg-rose-500/10 px-4 py-2 rounded-xl border border-neutral-800 hover:border-rose-500/30 flex items-center gap-2 text-sm font-bold transition-all shadow-inner">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white shadow-inner">
                  {qIndex + 1}
                </div>
                <h2 className="text-2xl font-bold text-white">Algorithm Question</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Challenge Title</label>
                  <input 
                    type="text"
                    value={q.title}
                    onChange={e => updateQuestion(qIndex, { title: e.target.value })}
                    className="w-full max-w-xl bg-black/60 border border-neutral-700/50 rounded-xl p-3.5 text-white text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Problem Description</label>
                  <textarea 
                    value={q.description}
                    onChange={e => updateQuestion(qIndex, { description: e.target.value })}
                    placeholder="Paste the problem statement here..."
                    className="w-full bg-black/60 border border-neutral-700/50 rounded-xl p-4 text-neutral-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-y min-h-[160px] shadow-inner transition-all leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Input Format</label>
                    <textarea 
                      value={q.inputFormat}
                      onChange={e => updateQuestion(qIndex, { inputFormat: e.target.value })}
                      placeholder="e.g. First line contains integer N..."
                      className="w-full bg-black/60 border border-neutral-700/50 rounded-xl p-3.5 text-neutral-300 text-sm focus:border-emerald-500 outline-none resize-none h-24 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Output Format</label>
                    <textarea 
                      value={q.outputFormat}
                      onChange={e => updateQuestion(qIndex, { outputFormat: e.target.value })}
                      placeholder="e.g. Return the count of triplets..."
                      className="w-full bg-black/60 border border-neutral-700/50 rounded-xl p-3.5 text-neutral-300 text-sm focus:border-emerald-500 outline-none resize-none h-24 shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <label className="text-sm font-bold text-white">Examples (Optional)</label>
                    <button 
                      onClick={() => {
                        const newEx = [...(q.examples || []), { input: "", output: "", explanation: "" }];
                        updateQuestion(qIndex, { examples: newEx });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Example
                    </button>
                  </div>
                  <div className="space-y-4">
                    {q.examples?.map((ex, exIdx) => (
                      <div key={exIdx} className="bg-black/40 rounded-2xl border border-white/5 p-5 space-y-4 relative group shadow-inner">
                        <button 
                          onClick={() => {
                            const newEx = [...(q.examples || [])];
                            newEx.splice(exIdx, 1);
                            updateQuestion(qIndex, { examples: newEx });
                          }}
                          className="absolute top-4 right-4 text-neutral-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 rounded-lg p-1.5 border border-neutral-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Input</label>
                            <input 
                              type="text"
                              value={ex.input}
                              onChange={e => {
                                const newEx = [...(q.examples || [])];
                                newEx[exIdx].input = e.target.value;
                                updateQuestion(qIndex, { examples: newEx });
                              }}
                              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg p-2.5 text-white text-xs font-mono outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Output</label>
                            <input 
                              type="text"
                              value={ex.output}
                              onChange={e => {
                                const newEx = [...(q.examples || [])];
                                newEx[exIdx].output = e.target.value;
                                updateQuestion(qIndex, { examples: newEx });
                              }}
                              className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5 text-emerald-300 text-xs font-mono outline-none focus:border-emerald-500/50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Explanation</label>
                          <input 
                            type="text"
                            value={ex.explanation}
                            onChange={e => {
                              const newEx = [...(q.examples || [])];
                              newEx[exIdx].explanation = e.target.value;
                              updateQuestion(qIndex, { examples: newEx });
                            }}
                            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg p-2.5 text-neutral-300 text-xs outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <label className="text-sm font-bold text-white block">Evaluation Test Cases</label>
                      <p className="text-xs text-neutral-500 mt-1">These will run behind the scenes to score the candidate.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newCases = [...q.testCases, { input: "", expectedOutput: "" }];
                        updateQuestion(qIndex, { testCases: newCases });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Case
                    </button>
                  </div>
                  <div className="space-y-4">
                    {q.testCases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="bg-black/40 rounded-2xl border border-white/5 p-4 flex gap-4 shadow-inner">
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-indigo-500/70 uppercase tracking-widest block mb-2">Standard Input</label>
                          <textarea 
                            value={tc.input} 
                            onChange={e => {
                              const newCases = [...q.testCases];
                              newCases[tcIdx].input = e.target.value;
                              updateQuestion(qIndex, { testCases: newCases });
                            }}
                            className="w-full bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3 text-indigo-200 text-xs font-mono focus:border-indigo-500 outline-none resize-none h-20"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest block mb-2">Expected Output</label>
                          <textarea 
                            value={tc.expectedOutput} 
                            onChange={e => {
                              const newCases = [...q.testCases];
                              newCases[tcIdx].expectedOutput = e.target.value;
                              updateQuestion(qIndex, { testCases: newCases });
                            }}
                            className="w-full bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-emerald-200 text-xs font-mono focus:border-emerald-500 outline-none resize-none h-20"
                          />
                        </div>
                        {q.testCases.length > 1 && (
                          <button 
                            onClick={() => {
                              const newCases = [...q.testCases];
                              newCases.splice(tcIdx, 1);
                              updateQuestion(qIndex, { testCases: newCases });
                            }}
                            className="text-neutral-600 hover:text-rose-400 bg-neutral-900 hover:bg-rose-500/10 rounded-lg p-2.5 self-center border border-neutral-800 hover:border-rose-500/30 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <button 
                    onClick={() => updateQuestion(qIndex, { isAdvancedOpen: !q.isAdvancedOpen })}
                    className="w-full flex items-center justify-between mb-4 text-sm font-bold text-neutral-400 hover:text-white transition-colors p-4 rounded-xl hover:bg-white/5"
                  >
                    <span className="flex items-center gap-3"><Code2 className="w-5 h-5 text-indigo-400"/> Advanced Code Configuration (Optional)</span>
                    <span className="text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">{q.isAdvancedOpen ? 'Hide Options' : 'Show Options'}</span>
                  </button>

                  {q.isAdvancedOpen && (
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <button
                          onClick={async () => {
                            setIsGeneratingAI(qIndex);
                            try {
                              const aiTemplates = await generateTemplatesWithAI(
                                q.title, 
                                q.description, 
                                q.inputFormat || '', 
                                q.outputFormat || ''
                              );
                              updateQuestion(qIndex, {
                                starterCode: { ...(q.starterCode || {}), ...aiTemplates.starterCode },
                                wrapperCode: { ...(q.wrapperCode || {}), ...aiTemplates.wrapperCode }
                              });
                            } catch (e) {
                              alert("Failed to generate AI templates.");
                            } finally {
                              setIsGeneratingAI(null);
                            }
                          }}
                          disabled={isGeneratingAI === qIndex}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/40 hover:to-purple-500/40 border border-indigo-500/30 rounded-lg text-xs font-bold text-indigo-300 transition-all shadow-sm"
                        >
                          {isGeneratingAI === qIndex ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
                          {isGeneratingAI === qIndex ? 'Generating AI Templates...' : '✨ Auto-Generate Templates with AI'}
                        </button>
                        
                        <select 
                          value={q.activeLang}
                          onChange={(e) => updateQuestion(qIndex, { activeLang: e.target.value as any })}
                          className="bg-neutral-900 text-xs font-bold text-white border border-neutral-700 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="java">Java</option>
                          <option value="c">C</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-72">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Starter Code</label>
                          <div className="flex-1 rounded-xl border border-neutral-800 overflow-hidden bg-[#1e1e1e] shadow-inner">
                            <Editor
                              language={q.activeLang} theme="vs-dark"
                              value={q.starterCode?.[q.activeLang] || ""}
                              onChange={(val) => {
                                const newStarter = { ...q.starterCode, [q.activeLang]: val || "" };
                                updateQuestion(qIndex, { starterCode: newStarter });
                              }}
                              options={{ minimap: { enabled: false }, padding: { top: 16 } }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Wrapper Code</label>
                          <div className="flex-1 rounded-xl border border-neutral-800 overflow-hidden bg-[#1e1e1e] shadow-inner">
                            <Editor
                              language={q.activeLang} theme="vs-dark"
                              value={q.wrapperCode?.[q.activeLang] || ""}
                              onChange={(val) => {
                                const newWrapper = { ...q.wrapperCode, [q.activeLang]: val || "" };
                                updateQuestion(qIndex, { wrapperCode: newWrapper });
                              }}
                              options={{ minimap: { enabled: false }, padding: { top: 16 } }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
        )}

        {/* Action Buttons */}
        <div className={`mt-10 flex items-center ${questionCreationMode === "manual" ? "justify-between" : "justify-end"} gap-4 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 shadow-2xl`}>
          {questionCreationMode === "manual" && (
            <button 
              onClick={addQuestion}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" /> Add Another Question
            </button>
          )}
          
          <div className="flex flex-col items-end gap-3 w-full max-w-md">
            {/* Inline validation hints */}
            {(() => {
              const missing: string[] = [];
              if (candidateMode === "existing" && !candidateId)
                missing.push("select a candidate");
              if (candidateMode === "new" && !customCandidateId.trim())
                missing.push("enter a Candidate ID");
              if (candidateMode === "multiple" && selectedCandidates.size === 0)
                missing.push("select at least one candidate");
              const emptyQs = questions.filter(q => !q.description.trim()).length;
              if (emptyQs > 0)
                missing.push(`fill description for ${emptyQs} question${emptyQs > 1 ? "s" : ""}`);
              return missing.length > 0 ? (
                <div className="text-xs text-amber-400 font-medium bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 w-full text-center">
                  ⚠️ Please {missing.join(" and ")} to generate a link.
                </div>
              ) : null;
            })()}

            <button
              onClick={generateLink}
              disabled={isSubmitting || (
                candidateMode === "existing" ? !candidateId : 
                candidateMode === "new" ? !customCandidateId.trim() : 
                selectedCandidates.size === 0
              )}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
              {isSubmitting ? 'Generating AI Templates & Assigning...' : candidateMode === "multiple" ? `Generate (${selectedCandidates.size}) Interviews` : "Generate & Assign Interview"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
