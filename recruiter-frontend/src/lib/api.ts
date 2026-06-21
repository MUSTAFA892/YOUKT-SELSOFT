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
  inputFormat?: string;
  outputFormat?: string;
  examples?: Example[];
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
  isComplete: boolean;
}

export async function createInterview(
  candidateId: string,
  candidateName: string,
  questions: Omit<Question, 'id'>[],
  recruiterId?: string,
  recruiterName?: string
): Promise<Interview> {
  const res = await fetch(`${API_BASE_URL}/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId, candidateName, questions, recruiterId, recruiterName }),
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

export async function getAllInterviews(): Promise<Interview[]> {
  const res = await fetch(`${API_BASE_URL}/interviews`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch all interviews");
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

export async function getAllActivityLogs(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_BASE_URL}/activity-logs`);
  if (!res.ok) throw new Error("Failed to fetch activity logs");
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

export async function getTabSwitchIncidents(): Promise<TabSwitchIncident[]> {
  const res = await fetch(`${API_BASE_URL}/tab-switch`);
  if (!res.ok) throw new Error("Failed to fetch tab switch incidents");
  return res.json();
}

export async function getCandidateTabSwitchIncidents(candidateId: string): Promise<TabSwitchIncident[]> {
  const res = await fetch(`${API_BASE_URL}/tab-switch/candidate/${candidateId}`);
  if (!res.ok) throw new Error("Failed to fetch candidate tab switch incidents");
  return res.json();
}

export async function getTerminatedSessions(): Promise<TabSwitchIncident[]> {
  const res = await fetch(`${API_BASE_URL}/tab-switch/terminated`);
  if (!res.ok) throw new Error("Failed to fetch terminated sessions");
  return res.json();
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

export async function getAllConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE_URL}/help-center/all-conversations`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch all conversations");
  return res.json();
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

export interface SkillScore {
  topic: string;
  score: number;
  problemsSolved: number;
}

export interface CandidateInsights {
  candidateId: string;
  skillHeatmap: SkillScore[];
  difficultyRecommendation: {
    level: 'Easy' | 'Medium' | 'Hard';
    reasoning: string;
  };
  integritySummary: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    totalPlagiarismWarnings: number;
    violationCount: number;
  };
  stats: {
    problemsSolved: number;
    interviewsPassed: number;
    avgScore: number;
  };
}

export async function getCandidateInsights(candidateId: string): Promise<CandidateInsights> {
  const res = await fetch(`${API_BASE_URL}/reports/candidate/${candidateId}/insights`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch candidate insights");
  return res.json();
}

// ==================== PIPELINE ====================

export enum PipelineStage {
  APPLIED = 'Applied',
  ASSESSED = 'Assessed',
  INTERVIEWED = 'Interviewed',
  OFFER = 'Offer',
  REJECTED = 'Rejected'
}

export interface CandidatePipeline {
  candidateId: string;
  candidateName: string;
  stage: PipelineStage;
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchPipeline(): Promise<CandidatePipeline[]> {
  const res = await fetch(`${API_BASE_URL}/pipeline`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch pipeline");
  return res.json();
}

export async function updatePipelineStage(candidateId: string, stage: PipelineStage): Promise<CandidatePipeline> {
  const res = await fetch(`${API_BASE_URL}/pipeline/${candidateId}/stage`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error("Failed to update pipeline stage");
  return res.json();
}

export async function bulkUpdatePipelineStage(candidateIds: string[], stage: PipelineStage): Promise<CandidatePipeline[]> {
  const res = await fetch(`${API_BASE_URL}/pipeline/bulk-update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateIds, stage }),
  });
  if (!res.ok) throw new Error("Failed to bulk update pipeline");
  return res.json();
}

export async function bulkSendEmail(candidateIds: string[], subject: string, body: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/pipeline/bulk-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateIds, subject, body }),
  });
  if (!res.ok) throw new Error("Failed to send bulk emails");
}

// ==================== REPORTS ====================

export interface PlagiarismWarning {
  detected: boolean;
  similarityPercent: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matchCount?: number;
}

export interface QuestionReport {
  questionId: string;
  questionTitle: string;
  totalTests: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  language: string;
  plagiarismWarning?: PlagiarismWarning;
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
  plagiarismWarning?: PlagiarismWarning;
}

export async function fetchReports(): Promise<AssessmentReport[]> {
  const res = await fetch(`${API_BASE_URL}/reports`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function getActiveCandidates(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/help-center/active-candidates`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function generateTemplatesWithAI(
  title: string,
  description: string,
  inputFormat: string,
  outputFormat: string
): Promise<{ starterCode: CodeTemplates, wrapperCode: CodeTemplates }> {
  const res = await fetch(`${API_BASE_URL}/interviews/generate-templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, inputFormat, outputFormat }),
  });
  if (!res.ok) throw new Error("AI Template generation failed");
  return res.json();
}


