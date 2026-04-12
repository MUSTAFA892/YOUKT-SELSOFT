export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

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
  timeLimit?: number; // in seconds
  expectedTimeComplexity?: string;
  expectedSpaceComplexity?: string;
  topics?: string[];
  hints?: string[];
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
  executionTimeMs?: number;
}

export interface SubmissionResult {
  problemId: string;
  language: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
  allPassed: boolean;
  averageTimeMs?: number;
}

export async function fetchProblems(): Promise<Problem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/problems`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Fetch Problems failed:", error);
    return [];
  }
}

export async function fetchProblem(id: string, candidateId?: string): Promise<Problem> {
  try {
    const url = new URL(`${API_BASE_URL}/problems/${id}`);
    if (candidateId) {
      url.searchParams.append('candidateId', candidateId);
    }
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch problem ${id}: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error(`Fetch Problem ${id} failed:`, error);
    throw error; // Rethrow because the specific problem page needs this data to render
  }
}

export async function submitCode(
  problemId: string,
  language: string,
  code: string,
  sessionId?: string,
  candidateId?: string
): Promise<SubmissionResult> {
  const res = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      problemId, 
      language, 
      code,
      sessionId,
      candidateId
    }),
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
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  examples: Example[];
  testCases: CustomTestCase[];
  starterCode?: CodeTemplates;
  wrapperCode?: CodeTemplates;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  questions: Question[];
  history: any[];
  completedCount: number;
  currentQuestionStartedAt: string | null;
  isComplete: boolean;
  createdAt: string;
}

export async function getNextQuestion(
  id: string,
  payload: { questionId: string; passed: boolean; timeMs: number }
): Promise<Interview> {
  const res = await fetch(`${API_BASE_URL}/interviews/${id}/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to fetch next question");
  return res.json();
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
  try {
    const res = await fetch(`${API_BASE_URL}/interviews/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch interview ${id}: ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error(`Get Interview ${id} failed:`, error);
    throw error;
  }
}

export async function getCandidateInterviews(candidateId: string): Promise<Interview[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews/candidate/${candidateId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Get Candidate Interviews failed:", error);
    return [];
  }
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

export interface QuestionReport {
  questionId: string;
  questionTitle: string;
  totalTests: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  language: string;
}

export interface AssessmentReport {
  id: string;
  interviewId: string;
  candidateId: string;
  candidateName: string;
  finishedAt: string;
  totalQuestions: number;
  questionsAttempted: number;
  totalTestsPassed: number;
  totalTestsAvailable: number;
  scorePercent: number;
  questions: QuestionReport[];
  violations?: {
    tabSwitches: number;
    terminated: boolean;
  };
}

export async function submitAssessmentReport(
  payload: Omit<AssessmentReport, 'id' | 'finishedAt'>
): Promise<AssessmentReport> {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit assessment report");
  return res.json();
}

export interface ActivityLog {
  id: string;
  candidateId: string;
  candidateName: string;
  problemId: string;
  problemTitle: string;
  language: string;
  passed: number;
  totalTests: number;
  allPassed: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
}

export async function submitActivityLog(
  payload: Omit<ActivityLog, 'id' | 'submittedAt'>
): Promise<ActivityLog> {
  const res = await fetch(`${API_BASE_URL}/activity-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit activity log");
  return res.json();
}

export async function getCandidateActivityLogs(candidateId: string): Promise<ActivityLog[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/activity-logs/candidate/${candidateId}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Get Candidate Activity Logs failed:", error);
    return [];
  }
}

export async function getAllActivityLogs(): Promise<ActivityLog[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/activity-logs`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Get All Activity Logs failed:", error);
    return [];
  }
}

export async function getNextProblem(
  problemId: string,
  performanceMetrics: {
    allPassed: boolean;
    passed: number;
    totalTests: number;
    timeSpentSeconds: number;
    forceEasier?: boolean;
  }
): Promise<Problem> {
  const res = await fetch(`${API_BASE_URL}/problems/${problemId}/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(performanceMetrics),
  });
  if (!res.ok) throw new Error("Failed to fetch next problem");
  return res.json();
}

export interface TabSwitchIncident {
  id: string;
  candidateId: string;
  candidateName: string;
  problemId: string;
  problemTitle: string;
  switchCount: number;
  maxAllowed: number;
  status: 'warning' | 'terminated';
  details: {
    firstSwitchAt: string;
    lastSwitchAt: string;
    totalSwitches: number;
  };
  recordedAt: string;
}

export async function reportTabSwitch(payload: {
  candidateId: string;
  candidateName: string;
  problemId: string;
  problemTitle: string;
  switchCount: number;
}): Promise<TabSwitchIncident> {
  const res = await fetch(`${API_BASE_URL}/tab-switch/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to report tab switch");
  return res.json();
}

export async function getTabSwitchIncidents(): Promise<TabSwitchIncident[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/tab-switch`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Get Tab Switch Incidents failed:", error);
    return [];
  }
}

export async function getCandidateTabSwitchIncidents(candidateId: string): Promise<TabSwitchIncident[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/tab-switch/candidate/${candidateId}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Get Candidate Tab Switch Incidents failed:", error);
    return [];
  }
}

// ==================== HELP CENTER ====================

export interface HelpMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'candidate' | 'recruiter' | 'ai';
  content: string;
  timestamp: string;
}

export interface Conversation {
  candidateId: string;
  interviewId: string;
  messages: HelpMessage[];
  status: 'active' | 'archived';
}

export async function getConversation(candidateId: string, interviewId: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE_URL}/help-center/conversation/${candidateId}/${interviewId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function sendChatMessage(candidateId: string, interviewId: string, message: Omit<HelpMessage, 'id' | 'timestamp'>): Promise<HelpMessage> {
  const res = await fetch(`${API_BASE_URL}/help-center/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId, interviewId, message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getAiAssistance(payload: {
  query: string;
  questionContext: any;
  candidateId: string;
  interviewId: string;
  candidateName: string;
}): Promise<{ status: 'success' | 'switching_to_recruiter'; data?: HelpMessage }> {
  const res = await fetch(`${API_BASE_URL}/help-center/ai-assist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to get AI assistance");
  return res.json();
}

