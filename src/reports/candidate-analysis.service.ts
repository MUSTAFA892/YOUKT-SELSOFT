import { Injectable } from '@nestjs/common';
import { ReportsService, AssessmentReport } from './reports.service';
import { ActivityLogsService, ActivityLog } from '../activity-logs/activity-logs.service';
import { ProblemsService } from '../problems/problems.service';

export interface SkillScore {
  topic: string;
  score: number; // 0-100
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

@Injectable()
export class CandidateAnalysisService {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly problemsService: ProblemsService,
  ) {}

  async getAnalysis(candidateId: string): Promise<CandidateInsights> {
    const logs = await this.activityLogsService.getLogsByCandidate(candidateId);
    const reports = await this.reportsService.getAllReports();
    const candidateReports = reports.filter(r => r.candidateId === candidateId);
    const allProblems = this.problemsService.findAllWithTestCases();

    // 1. Calculate Skill Heatmap
    const skillMap = new Map<string, { total: number; count: number; solved: number }>();
    
    logs.forEach(log => {
      const problem = allProblems.find(p => p.id === log.problemId);
      const topics = problem?.topics || ['General'];
      
      topics.forEach(topic => {
        const current = skillMap.get(topic) || { total: 0, count: 0, solved: 0 };
        current.total += (log.passed / log.totalTests) * 100;
        current.count += 1;
        if (log.allPassed) current.solved += 1;
        skillMap.set(topic, current);
      });
    });

    const skillHeatmap: SkillScore[] = Array.from(skillMap.entries()).map(([topic, data]) => ({
      topic,
      score: Math.round(data.total / data.count),
      problemsSolved: data.solved,
    }));

    // 2. Difficulty Recommendation logic
    const avgPassRate = logs.length > 0 ? logs.reduce((acc, log) => acc + (log.passed / log.totalTests), 0) / logs.length : 0;
    const perfectSolves = logs.filter(l => l.allPassed).length;
    
    let recLevel: 'Easy' | 'Medium' | 'Hard' = 'Easy';
    let reasoning = "The candidate is currently building their foundation.";

    if (avgPassRate > 0.9 && perfectSolves >= 3) {
      recLevel = 'Hard';
      reasoning = "Candidate shows high accuracy and speed on medium problems. Ready for senior-level challenges.";
    } else if (avgPassRate > 0.7 || perfectSolves >= 1) {
      recLevel = 'Medium';
      reasoning = "Candidate has mastered the basics and can handle moderate complexity.";
    }

    // 3. Integrity Summary
    const plagiarismCount = candidateReports.filter(r => r.plagiarismWarning?.detected).length;
    const violationCount = candidateReports.reduce((acc, r) => acc + (r.violations?.tabSwitches || 0), 0);
    
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (plagiarismCount >= 2 || violationCount >= 5) overallRisk = 'critical';
    else if (plagiarismCount >= 1 || violationCount >= 3) overallRisk = 'high';
    else if (violationCount >= 1) overallRisk = 'medium';

    const insights: CandidateInsights = {
      candidateId,
      skillHeatmap,
      difficultyRecommendation: {
        level: recLevel,
        reasoning,
      },
      integritySummary: {
        overallRisk,
        totalPlagiarismWarnings: plagiarismCount,
        violationCount,
      },
      stats: {
        problemsSolved: perfectSolves,
        interviewsPassed: candidateReports.filter(r => r.scorePercent >= 70).length,
        avgScore: Math.round(avgPassRate * 100),
      },
    };

    return insights;
  }
}
