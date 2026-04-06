"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RecruiterPortal;
const react_1 = require("react");
const api_1 = require("@/lib/api");
const lucide_react_1 = require("lucide-react");
const react_2 = require("@monaco-editor/react");
const AuthProvider_1 = require("@/components/AuthProvider");
function RecruiterPortal() {
    const { currentUser } = (0, AuthProvider_1.useAuth)();
    const [candidateId, setCandidateId] = (0, react_1.useState)("");
    const [questions, setQuestions] = (0, react_1.useState)([{
            title: "Algorithm Question 1",
            description: "",
            testCases: [{ input: "", expectedOutput: "" }],
            starterCode: { python: "", javascript: "", java: "", c: "" },
            wrapperCode: { python: "", javascript: "", java: "", c: "" },
            activeLang: "python",
            isAdvancedOpen: false
        }]);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [generatedLink, setGeneratedLink] = (0, react_1.useState)(null);
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
    const updateQuestion = (index, updates) => {
        const newQs = [...questions];
        newQs[index] = { ...newQs[index], ...updates };
        setQuestions(newQs);
    };
    const removeQuestion = (index) => {
        if (questions.length === 1)
            return;
        const newQs = [...questions];
        newQs.splice(index, 1);
        setQuestions(newQs);
    };
    const generateLink = async () => {
        if (!candidateId) {
            alert("Please select a candidate parameter.");
            return;
        }
        for (const q of questions) {
            if (!q.description.trim()) {
                alert("Please ensure all questions have a description.");
                return;
            }
        }
        setIsSubmitting(true);
        try {
            const candidateUser = AuthProvider_1.DUMMY_USERS.find(u => u.id === candidateId);
            const payloadQuestions = questions.map(({ activeLang, isAdvancedOpen, ...q }) => q);
            const interview = await (0, api_1.createInterview)(candidateId, candidateUser?.name || "Unknown Candidate", payloadQuestions);
            const url = `${window.location.origin}/interview/${interview.id}`;
            setGeneratedLink(url);
        }
        catch (err) {
            alert("Error creating interview: " + err.message);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (currentUser.role !== "recruiter") {
        return (<div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950 text-white flex-col gap-4">
        <lucide_react_1.Users className="w-12 h-12 text-rose-500"/>
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-neutral-400">Please switch to a Recruiter account to create interviews.</p>
      </div>);
    }
    const candidateUsers = AuthProvider_1.DUMMY_USERS.filter(u => u.role === "candidate");
    return (<div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-y-auto bg-neutral-950 text-neutral-200">
      <div className="p-8 pb-32 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Recruiter Portal: Build Assessment</h1>
        <p className="text-neutral-400 mb-8">Author a multi-question algorithmic interview and assign it directly to a candidate.</p>
        
        {generatedLink && (<div className="mb-8 p-6 border border-emerald-500/30 bg-emerald-500/10 rounded-xl flex flex-col gap-3">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5"/> Interview Created & Assigned Successfully!
            </h3>
            <p className="text-sm text-neutral-300">Share this unique link with the candidate (or they can find it in their dashboard):</p>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={generatedLink} className="flex-1 bg-black/50 border border-emerald-500/20 rounded p-3 text-emerald-200 text-sm font-mono focus:outline-none focus:border-emerald-500/50"/>
              <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition-colors active:scale-95">
                Copy
              </button>
            </div>
          </div>)}

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <lucide_react_1.Users className="w-6 h-6"/>
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-white block mb-1">Assign to Candidate</label>
            <p className="text-xs text-neutral-400 mb-2">Select the candidate profile that will receive this interview.</p>
            <select value={candidateId} onChange={(e) => setCandidateId(e.target.value)} className="w-full max-w-md bg-[#1e1e1e] border border-neutral-700/50 rounded p-2.5 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none">
              <option value="" disabled>-- Select Candidate --</option>
              {candidateUsers.map(c => (<option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>))}
            </select>
          </div>
        </div>

        <div className="space-y-8">
          {questions.map((q, qIndex) => (<div key={qIndex} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative">
              <div className="absolute top-6 right-6">
                 {questions.length > 1 && (<button onClick={() => removeQuestion(qIndex)} className="text-neutral-500 hover:text-rose-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800 flex items-center gap-2 text-sm">
                    <lucide_react_1.Trash2 className="w-4 h-4"/> Remove Question
                  </button>)}
              </div>

              <h2 className="text-xl font-bold text-white mb-6">Question {qIndex + 1}</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">Challenge Title</label>
                  <input type="text" value={q.title} onChange={e => updateQuestion(qIndex, { title: e.target.value })} className="w-full max-w-xl bg-[#1e1e1e] border border-neutral-700/50 rounded p-2.5 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1">Problem Description</label>
                  <textarea value={q.description} onChange={e => updateQuestion(qIndex, { description: e.target.value })} placeholder="Paste the problem statement here..." className="w-full bg-[#1e1e1e] border border-neutral-700/50 rounded p-3 text-neutral-200 text-sm focus:border-indigo-500 focus:outline-none resize-y min-h-[120px]"/>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-white">Evaluation Test Cases</label>
                    <button onClick={() => {
                const newCases = [...q.testCases, { input: "", expectedOutput: "" }];
                updateQuestion(qIndex, { testCases: newCases });
            }} className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded text-xs font-semibold transition-colors">
                      <lucide_react_1.Plus className="w-3.5 h-3.5"/> Add Case
                    </button>
                  </div>
                  <div className="space-y-3">
                    {q.testCases.map((tc, tcIdx) => (<div key={tcIdx} className="bg-neutral-950 rounded border border-neutral-800 p-3 flex gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Standard Input</label>
                          <textarea value={tc.input} onChange={e => {
                    const newCases = [...q.testCases];
                    newCases[tcIdx].input = e.target.value;
                    updateQuestion(qIndex, { testCases: newCases });
                }} className="w-full bg-[#1e1e1e] border border-neutral-800 rounded p-2 text-indigo-300 text-sm font-mono focus:border-indigo-500 outline-none resize-none h-16"/>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Expected Output</label>
                          <textarea value={tc.expectedOutput} onChange={e => {
                    const newCases = [...q.testCases];
                    newCases[tcIdx].expectedOutput = e.target.value;
                    updateQuestion(qIndex, { testCases: newCases });
                }} className="w-full bg-[#1e1e1e] border border-neutral-800 rounded p-2 text-emerald-300 text-sm font-mono focus:border-emerald-500 outline-none resize-none h-16"/>
                        </div>
                        {q.testCases.length > 1 && (<button onClick={() => {
                        const newCases = [...q.testCases];
                        newCases.splice(tcIdx, 1);
                        updateQuestion(qIndex, { testCases: newCases });
                    }} className="text-neutral-600 hover:text-rose-400 self-center p-2">
                            <lucide_react_1.Trash2 className="w-4 h-4"/>
                          </button>)}
                      </div>))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <button onClick={() => updateQuestion(qIndex, { isAdvancedOpen: !q.isAdvancedOpen })} className="w-full flex items-center justify-between mb-4 text-sm font-semibold text-neutral-400 hover:text-white transition-colors">
                    <span className="flex items-center gap-2"><lucide_react_1.Code2 className="w-4 h-4"/> Advanced Code Configuration (Optional)</span>
                    <span className="text-xs decoration-dashed underline underline-offset-4">{q.isAdvancedOpen ? 'Hide' : 'Show'} Configuration</span>
                  </button>

                  {q.isAdvancedOpen && (<>
                      <div className="flex justify-end mb-4">
                        <select value={q.activeLang} onChange={(e) => updateQuestion(qIndex, { activeLang: e.target.value })} className="bg-neutral-950 text-xs text-neutral-200 border border-neutral-700 rounded px-2 py-1 outline-none focus:border-indigo-500">
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
                            <react_2.default language={q.activeLang} theme="vs-dark" value={q.starterCode?.[q.activeLang] || ""} onChange={(val) => {
                    const newStarter = { ...q.starterCode, [q.activeLang]: val || "" };
                    updateQuestion(qIndex, { starterCode: newStarter });
                }} options={{ minimap: { enabled: false } }}/>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Wrapper Code</label>
                          <div className="flex-1 rounded border border-neutral-800 relative bg-[#1e1e1e]">
                            <react_2.default language={q.activeLang} theme="vs-dark" value={q.wrapperCode?.[q.activeLang] || ""} onChange={(val) => {
                    const newWrapper = { ...q.wrapperCode, [q.activeLang]: val || "" };
                    updateQuestion(qIndex, { wrapperCode: newWrapper });
                }} options={{ minimap: { enabled: false } }}/>
                          </div>
                        </div>
                      </div>
                    </>)}
                </div>

              </div>
            </div>))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={addQuestion} className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 rounded-xl font-bold transition-all">
            <lucide_react_1.Plus className="w-5 h-5"/> Add Another Question
          </button>
          
          <button onClick={generateLink} disabled={isSubmitting || !candidateId} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all">
            {isSubmitting ? <lucide_react_1.Loader2 className="w-5 h-5 animate-spin"/> : <lucide_react_1.Link className="w-5 h-5"/>}
            Generate & Assign Interview
          </button>
        </div>

      </div>
    </div>);
}
function CheckCircle2(props) {
    return (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>);
}
//# sourceMappingURL=page.js.map