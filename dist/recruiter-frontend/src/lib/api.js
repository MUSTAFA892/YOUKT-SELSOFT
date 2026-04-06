"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProblems = fetchProblems;
exports.fetchProblem = fetchProblem;
exports.submitCode = submitCode;
exports.submitCustomCode = submitCustomCode;
exports.createInterview = createInterview;
exports.getInterview = getInterview;
exports.getCandidateInterviews = getCandidateInterviews;
exports.submitInterviewCode = submitInterviewCode;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";
async function fetchProblems() {
    const res = await fetch(`${API_BASE_URL}/problems`, { cache: "no-store" });
    if (!res.ok)
        throw new Error("Failed to fetch problems");
    return res.json();
}
async function fetchProblem(id) {
    const res = await fetch(`${API_BASE_URL}/problems/${id}`, { cache: "no-store" });
    if (!res.ok)
        throw new Error(`Failed to fetch problem ${id}`);
    return res.json();
}
async function submitCode(problemId, language, code) {
    const res = await fetch(`${API_BASE_URL}/submissions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ problemId, language, code }),
    });
    if (!res.ok)
        throw new Error("Code submission failed");
    return res.json();
}
async function submitCustomCode(language, code, testCases) {
    const res = await fetch(`${API_BASE_URL}/submissions/custom`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ language, code, testCases }),
    });
    if (!res.ok)
        throw new Error("Custom code submission failed");
    return res.json();
}
async function createInterview(candidateId, candidateName, questions) {
    const res = await fetch(`${API_BASE_URL}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, candidateName, questions }),
    });
    if (!res.ok)
        throw new Error("Failed to create interview");
    return res.json();
}
async function getInterview(id) {
    const res = await fetch(`${API_BASE_URL}/interviews/${id}`, { cache: "no-store" });
    if (!res.ok)
        throw new Error(`Failed to fetch interview ${id}`);
    return res.json();
}
async function getCandidateInterviews(candidateId) {
    const res = await fetch(`${API_BASE_URL}/interviews/candidate/${candidateId}`, { cache: "no-store" });
    if (!res.ok)
        throw new Error("Failed to fetch candidate interviews");
    return res.json();
}
async function submitInterviewCode(interviewId, questionId, language, code) {
    const res = await fetch(`${API_BASE_URL}/submissions/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId, questionId, language, code }),
    });
    if (!res.ok)
        throw new Error("Interview code submission failed");
    return res.json();
}
//# sourceMappingURL=api.js.map