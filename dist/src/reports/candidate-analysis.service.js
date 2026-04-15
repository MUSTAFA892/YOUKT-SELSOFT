"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const activity_logs_service_1 = require("../activity-logs/activity-logs.service");
const problems_service_1 = require("../problems/problems.service");
let CandidateAnalysisService = class CandidateAnalysisService {
    constructor(reportsService, activityLogsService, problemsService) {
        this.reportsService = reportsService;
        this.activityLogsService = activityLogsService;
        this.problemsService = problemsService;
    }
    async getAnalysis(candidateId) {
        const logs = await this.activityLogsService.getLogsByCandidate(candidateId);
        const reports = await this.reportsService.getAllReports();
        const candidateReports = reports.filter(r => r.candidateId === candidateId);
        const allProblems = this.problemsService.findAllWithTestCases();
        const skillMap = new Map();
        logs.forEach(log => {
            const problem = allProblems.find(p => p.id === log.problemId);
            const topics = problem?.topics || ['General'];
            topics.forEach(topic => {
                const current = skillMap.get(topic) || { total: 0, count: 0, solved: 0 };
                current.total += (log.passed / log.totalTests) * 100;
                current.count += 1;
                if (log.allPassed)
                    current.solved += 1;
                skillMap.set(topic, current);
            });
        });
        const skillHeatmap = Array.from(skillMap.entries()).map(([topic, data]) => ({
            topic,
            score: Math.round(data.total / data.count),
            problemsSolved: data.solved,
        }));
        const avgPassRate = logs.length > 0 ? logs.reduce((acc, log) => acc + (log.passed / log.totalTests), 0) / logs.length : 0;
        const perfectSolves = logs.filter(l => l.allPassed).length;
        let recLevel = 'Easy';
        let reasoning = "The candidate is currently building their foundation.";
        if (avgPassRate > 0.9 && perfectSolves >= 3) {
            recLevel = 'Hard';
            reasoning = "Candidate shows high accuracy and speed on medium problems. Ready for senior-level challenges.";
        }
        else if (avgPassRate > 0.7 || perfectSolves >= 1) {
            recLevel = 'Medium';
            reasoning = "Candidate has mastered the basics and can handle moderate complexity.";
        }
        const plagiarismCount = candidateReports.filter(r => r.plagiarismWarning?.detected).length;
        const violationCount = candidateReports.reduce((acc, r) => acc + (r.violations?.tabSwitches || 0), 0);
        let overallRisk = 'low';
        if (plagiarismCount >= 2 || violationCount >= 5)
            overallRisk = 'critical';
        else if (plagiarismCount >= 1 || violationCount >= 3)
            overallRisk = 'high';
        else if (violationCount >= 1)
            overallRisk = 'medium';
        const insights = {
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
};
exports.CandidateAnalysisService = CandidateAnalysisService;
exports.CandidateAnalysisService = CandidateAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        activity_logs_service_1.ActivityLogsService,
        problems_service_1.ProblemsService])
], CandidateAnalysisService);
//# sourceMappingURL=candidate-analysis.service.js.map