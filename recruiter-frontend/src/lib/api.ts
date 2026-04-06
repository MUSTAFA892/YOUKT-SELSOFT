const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: "Easy" | "Medium" | "Hard";
  examples: Example[];
  starterCode: {
    python: string;
    javascript: string;
    java: string;
    c: string;
  };
}

export interface TestResult {
  testCase: number;
  description: string;
  status: "pass" | "fail" | "error" | "timeout";
  input: string;
  expectedOutput: string;
  actualOutput: string;
  errorMessage?: string;
}

export interface SubmissionResult {
  problemId: string;
  language: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
  allPassed: boolean;
}

export async function fetchProblems(): Promise<Problem[]> {
  const res = await fetch(`${API_BASE_URL}/problems`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

export async function fetchProblem(id: string): Promise<Problem> {
  const res = await fetch(`${API_BASE_URL}/problems/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch problem ${id}`);
  return res.json();
}

export async function submitCode(
  problemId: string,
  language: string,
  code: string
): Promise<SubmissionResult> {
  const res = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ problemId, language, code }),
  });
  if (!res.ok) throw new Error("Code submission failed");
  return res.json();
}

export interface CustomTestCase {
  input: string;
  expectedOutput: string;
}

export async function submitCustomCode(
  language: string,
  code: string,
  testCases: CustomTestCase[]
): Promise<SubmissionResult> {
  const res = await fetch(`${API_BASE_URL}/submissions/custom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ language, code, testCases }),
  });
  if (!res.ok) throw new Error("Custom code submission failed");
  return res.json();
}

export interface CodeTemplates {
  python?: string;
  javascript?: string;
  java?: string;
  c?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  testCases: CustomTestCase[];
  starterCode?: CodeTemplates;
  wrapperCode?: CodeTemplates;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  questions: Question[];
  createdAt: string;
}

export async function createInterview(
  candidateId: string,
  candidateName: string,
  questions: Omit<Question, 'id'>[]
): Promise<Interview> {
  const res = await fetch(`${API_BASE_URL}/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId, candidateName, questions }),
  });
  if (!res.ok) throw new Error("Failed to create interview");
  return res.json();
}

export async function getInterview(id: string): Promise<Interview> {
  const res = await fetch(`${API_BASE_URL}/interviews/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch interview ${id}`);
  return res.json();
}

export async function getCandidateInterviews(candidateId: string): Promise<Interview[]> {
  const res = await fetch(`${API_BASE_URL}/interviews/candidate/${candidateId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch candidate interviews");
  return res.json();
}

export async function submitInterviewCode(
  interviewId: string,
  questionId: string,
  language: string,
  code: string
): Promise<SubmissionResult> {
  const res = await fetch(`${API_BASE_URL}/submissions/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interviewId, questionId, language, code }),
  });
  if (!res.ok) throw new Error("Interview code submission failed");
  return res.json();
}
