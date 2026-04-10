"use client";

import { useState } from "react";
import { createInterview, type Question, type CodeTemplates } from "@/lib/api";
import { Plus, Trash2, Link as LinkIcon, Loader2, Code2, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { useAuth } from "@/components/AuthProvider";
import QuestionLibraryBrowser from "@/components/QuestionLibraryBrowser";

type EditingQuestion = Omit<Question, 'id'> & {
  activeLang: "python" | "javascript" | "java" | "c";
  isAdvancedOpen?: boolean;
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
    testCases: [{ input: "", expectedOutput: "" }],
    starterCode: { python: "", javascript: "", java: "", c: "" },
    wrapperCode: { python: "", javascript: "", java: "", c: "" },
    activeLang: "python",
    isAdvancedOpen: false
  }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Array<{id: string; name: string; link: string}>>([]);


  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: `Algorithm Question ${questions.length + 1}`,
        description: "",
        testCases: [{ input: "", expectedOutput: "" }],
        starterCode: { python: "", javascript: "", java: "", c: "" },
        wrapperCode: { python: "", javascript: "", java: "", c: "" },
        activeLang: "python",
        isAdvancedOpen: false
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
      const payloadQuestions = questions.map(({ activeLang, isAdvancedOpen, ...q }) => q as any);
      const links: Array<{id: string; name: string; link: string}> = [];

      // Create interview for each target candidate
      for (const candidate of targetCandidates) {
        // Register new candidate if creating for a new candidate
        if (candidateMode === "new") {
          registerCandidate(candidate.id, candidate.name);
        }
        
        const interview = await createInterview(candidate.id, candidate.name, payloadQuestions);
        
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
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-white flex-col gap-4">
        <Users className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-neutral-400">Please switch to a Recruiter account to create interviews.</p>
      </div>
    );
  }

  const candidateUsers = recruiterCandidates;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-y-auto bg-neutral-950 text-neutral-200">
      <div className="p-8 pb-32 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Recruiter Portal: Build Assessment</h1>
        <p className="text-neutral-400 mb-6">Author a multi-question algorithmic interview and assign it directly to a candidate.</p>
        
        {/* Question Creation Mode Tabs */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setQuestionCreationMode("manual")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              questionCreationMode === "manual"
                ? "bg-indigo-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            ✏️ Manual Creation
          </button>
          <button
            onClick={() => setQuestionCreationMode("library")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              questionCreationMode === "library"
                ? "bg-indigo-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            📚 Question Library
          </button>
        </div>

        {/* Question Library Browser */}
        {questionCreationMode === "library" && (
          <div className="mb-8 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Browse Pre-Built Questions</h2>
            <QuestionLibraryBrowser 
              userId={currentUser?.id || ""}
              onSelectQuestion={(question) => {
                // Add selected question to questions array
                const newQuestion: EditingQuestion = {
                  title: question.title,
                  description: question.description,
                  testCases: question.testCases || [],
                  starterCode: { 
                    python: question.starterCode || "",
                    javascript: question.starterCode || "",
                    java: question.starterCode || "",
                    c: question.starterCode || ""
                  },
                  wrapperCode: {
                    python: question.wrapperCode || "",
                    javascript: question.wrapperCode || "",
                    java: question.wrapperCode || "",
                    c: question.wrapperCode || ""
                  },
                  activeLang: "python",
                  isAdvancedOpen: false
                };
                setQuestions([...questions, newQuestion]);
                alert(`✅ "${question.title}" added to your interview!`);
              }}
            />
          </div>
        )}
        
        {generatedLink && (
          <div className="mb-8 p-6 border border-emerald-500/30 bg-emerald-500/10 rounded-xl flex flex-col gap-3">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Interview Created & Assigned Successfully!
            </h3>
            <p className="text-sm text-neutral-300">Share this unique link with the candidate (or they can find it in their dashboard):</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={generatedLink} 
                className="flex-1 bg-black/50 border border-emerald-500/20 rounded p-3 text-emerald-200 text-sm font-mono focus:outline-none focus:border-emerald-500/50" 
              />
              <button 
                onClick={() => navigator.clipboard.writeText(generatedLink)}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition-colors active:scale-95"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {generatedLinks.length > 0 && (
          <div className="mb-8 p-6 border border-emerald-500/30 bg-emerald-500/10 rounded-xl flex flex-col gap-4">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> {generatedLinks.length} Interviews Created Successfully!
            </h3>
            <p className="text-sm text-neutral-300">Each candidate has received a unique link:</p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedLinks.map((item, idx) => (
                <div key={idx} className="bg-black/50 border border-emerald-500/20 rounded p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-emerald-200">{item.name}</p>
                      <p className="text-xs text-neutral-500">{item.id}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.link)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={item.link}
                    className="w-full bg-black/30 border border-emerald-500/10 rounded p-2 text-emerald-300 text-xs font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Assignment Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <label className="text-sm font-semibold text-white block">Assign to Candidate</label>
              <p className="text-xs text-neutral-400">Select an existing test account or add a new candidate manually.</p>
            </div>
          </div>

          {/* Mode Tabs */}
          {/* Mode Tabs */}
          <div className="flex gap-1 bg-neutral-950 rounded-lg p-1 mb-4 w-fit flex-wrap">
            <button
              onClick={() => {
                setCandidateMode("existing");
                setSelectedCandidates(new Set());
              }}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                candidateMode === "existing"
                  ? "bg-indigo-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Existing Account
            </button>
            <button
              onClick={() => {
                setCandidateMode("new");
                setSelectedCandidates(new Set());
              }}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                candidateMode === "new"
                  ? "bg-indigo-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              + New Candidate
            </button>
            <button
              onClick={() => {
                setCandidateMode("multiple");
                setCandidateId("");
              }}
              className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                candidateMode === "multiple"
                  ? "bg-indigo-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              📋 Multiple Candidates
            </button>
          </div>

          {candidateMode === "existing" ? (
            <select 
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="w-full max-w-md bg-[#1e1e1e] border border-neutral-700/50 rounded p-2.5 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="" disabled>-- Select Candidate --</option>
              {candidateUsers.map(c => (
                <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
              ))}
            </select>
          ) : candidateMode === "new" ? (
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Candidate ID <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. cand_001 or john@example.com"
                  value={customCandidateId}
                  onChange={e => setCustomCandidateId(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-neutral-700/50 rounded p-2.5 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-neutral-600"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Candidate Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Smith"
                  value={customCandidateName}
                  onChange={e => setCustomCandidateName(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-neutral-700/50 rounded p-2.5 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-neutral-600"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-w-2xl max-h-64 overflow-y-auto border border-neutral-700/50 rounded p-3 bg-[#1e1e1e]">
              {candidateUsers.length === 0 ? (
                <p className="text-neutral-500 text-sm">No candidates available</p>
              ) : (
                candidateUsers.map(c => (
                  <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-neutral-900 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.has(c.id)}
                      onChange={() => toggleCandidateSelection(c.id)}
                      className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 cursor-pointer"
                    />
                    <span className="text-neutral-200 text-sm flex-1">{c.name}</span>
                    <span className="text-neutral-500 text-xs">{c.id}</span>
                  </label>
                ))
              )}
            </div>
          )}

          {candidateMode === "new" && (
            <p className="text-xs text-amber-400/80 mt-3 flex items-start gap-1.5">
              <span className="mt-0.5">⚠️</span>
              When the candidate opens the link, they should switch their account to the ID you entered above to submit their report correctly.
            </p>
          )}

          {candidateMode === "multiple" && selectedCandidates.size > 0 && (
            <p className="text-xs text-indigo-400/80 mt-3 flex items-start gap-1.5">
              <span className="mt-0.5">ℹ️</span>
              {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? "s" : ""} selected. Each will receive a unique interview link.
            </p>
          )}
        </div>

        {/* Manual Question Creation Section */}
        {questionCreationMode === "manual" && (
        <div className="space-y-8">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative">
              <div className="absolute top-6 right-6">
                 {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIndex)} className="text-neutral-500 hover:text-rose-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800 flex items-center gap-2 text-sm">
                    <Trash2 className="w-4 h-4" /> Remove Question
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-6">Question {qIndex + 1}</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">Challenge Title</label>
                  <input 
                    type="text"
                    value={q.title}
                    onChange={e => updateQuestion(qIndex, { title: e.target.value })}
                    className="w-full max-w-xl bg-[#1e1e1e] border border-neutral-700/50 rounded p-2.5 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">Problem Description</label>
                  <textarea 
                    value={q.description}
                    onChange={e => updateQuestion(qIndex, { description: e.target.value })}
                    placeholder="Paste the problem statement here..."
                    className="w-full bg-[#1e1e1e] border border-neutral-700/50 rounded p-3 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none resize-y min-h-[120px]"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-white">Evaluation Test Cases</label>
                    <button 
                      onClick={() => {
                        const newCases = [...q.testCases, { input: "", expectedOutput: "" }];
                        updateQuestion(qIndex, { testCases: newCases });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Case
                    </button>
                  </div>
                  <div className="space-y-3">
                    {q.testCases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="bg-neutral-950 rounded border border-neutral-800 p-3 flex gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Standard Input</label>
                          <textarea 
                            value={tc.input} 
                            onChange={e => {
                              const newCases = [...q.testCases];
                              newCases[tcIdx].input = e.target.value;
                              updateQuestion(qIndex, { testCases: newCases });
                            }}
                            className="w-full bg-[#1e1e1e] border border-neutral-800 rounded p-2 text-indigo-300 text-sm font-mono focus:border-indigo-500 outline-none resize-none h-16"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Expected Output</label>
                          <textarea 
                            value={tc.expectedOutput} 
                            onChange={e => {
                              const newCases = [...q.testCases];
                              newCases[tcIdx].expectedOutput = e.target.value;
                              updateQuestion(qIndex, { testCases: newCases });
                            }}
                            className="w-full bg-[#1e1e1e] border border-neutral-800 rounded p-2 text-emerald-300 text-sm font-mono focus:border-emerald-500 outline-none resize-none h-16"
                          />
                        </div>
                        {q.testCases.length > 1 && (
                          <button 
                            onClick={() => {
                              const newCases = [...q.testCases];
                              newCases.splice(tcIdx, 1);
                              updateQuestion(qIndex, { testCases: newCases });
                            }}
                            className="text-neutral-600 hover:text-rose-400 self-center p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <button 
                    onClick={() => updateQuestion(qIndex, { isAdvancedOpen: !q.isAdvancedOpen })}
                    className="w-full flex items-center justify-between mb-4 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2"><Code2 className="w-4 h-4"/> Advanced Code Configuration (Optional)</span>
                    <span className="text-xs decoration-dashed underline underline-offset-4">{q.isAdvancedOpen ? 'Hide' : 'Show'} Configuration</span>
                  </button>

                  {q.isAdvancedOpen && (
                    <>
                      <div className="flex justify-end mb-4">
                        <select 
                          value={q.activeLang}
                          onChange={(e) => updateQuestion(qIndex, { activeLang: e.target.value as any })}
                          className="bg-neutral-950 text-xs text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-indigo-500"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="java">Java</option>
                          <option value="c">C</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Starter Code</label>
                          <div className="flex-1 rounded border border-neutral-800 relative bg-[#1e1e1e]">
                            <Editor
                              language={q.activeLang} theme="vs-dark"
                              value={q.starterCode?.[q.activeLang] || ""}
                              onChange={(val) => {
                                const newStarter = { ...q.starterCode, [q.activeLang]: val || "" };
                                updateQuestion(qIndex, { starterCode: newStarter });
                              }}
                              options={{ minimap: { enabled: false } }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Wrapper Code</label>
                          <div className="flex-1 rounded border border-neutral-800 relative bg-[#1e1e1e]">
                            <Editor
                              language={q.activeLang} theme="vs-dark"
                              value={q.wrapperCode?.[q.activeLang] || ""}
                              onChange={(val) => {
                                const newWrapper = { ...q.wrapperCode, [q.activeLang]: val || "" };
                                updateQuestion(qIndex, { wrapperCode: newWrapper });
                              }}
                              options={{ minimap: { enabled: false } }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
        )}

        {/* Add Question Button (Manual Mode) */}
        {questionCreationMode === "manual" && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <button 
            onClick={addQuestion}
            className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 rounded-xl font-bold transition-all"
          >
            <Plus className="w-5 h-5" /> Add Another Question
          </button>
          
          <div className="flex flex-col items-end gap-2">
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
                <p className="text-xs text-amber-400 text-right">
                  ⚠ Please {missing.join(" and ")} to generate a link.
                </p>
              ) : null;
            })()}

            <button
              onClick={generateLink}
              disabled={isSubmitting || (
                candidateMode === "existing" ? !candidateId : 
                candidateMode === "new" ? !customCandidateId.trim() : 
                selectedCandidates.size === 0
              )}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
              {candidateMode === "multiple" ? `Generate (${selectedCandidates.size}) Interviews` : "Generate & Assign Interview"}
            </button>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
