"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const reports_controller_1 = require("./reports.controller");
const candidate_analysis_service_1 = require("./candidate-analysis.service");
const problems_module_1 = require("../problems/problems.module");
const activity_logs_module_1 = require("../activity-logs/activity-logs.module");
const interviews_module_1 = require("../interviews/interviews.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [problems_module_1.ProblemsModule, activity_logs_module_1.ActivityLogsModule, interviews_module_1.InterviewsModule],
        providers: [reports_service_1.ReportsService, candidate_analysis_service_1.CandidateAnalysisService],
        controllers: [reports_controller_1.ReportsController],
        exports: [reports_service_1.ReportsService, candidate_analysis_service_1.CandidateAnalysisService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map