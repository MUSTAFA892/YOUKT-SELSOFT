import { ReportsService } from './reports.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ProblemsService } from '../problems/problems.service';
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
export declare class CandidateAnalysisService {
    private readonly reportsService;
    private readonly activityLogsService;
    private readonly problemsService;
    constructor(reportsService: ReportsService, activityLogsService: ActivityLogsService, problemsService: ProblemsService);
    getAnalysis(candidateId: string): Promise<CandidateInsights>;
}
