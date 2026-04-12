"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const problems_module_1 = require("./problems/problems.module");
const submissions_module_1 = require("./submissions/submissions.module");
const challenges_module_1 = require("./challenges/challenges.module");
const interviews_module_1 = require("./interviews/interviews.module");
const reports_module_1 = require("./reports/reports.module");
const activity_logs_module_1 = require("./activity-logs/activity-logs.module");
const tab_switch_module_1 = require("./tab-switch/tab-switch.module");
const advanced_features_module_1 = require("./advanced-features/advanced-features.module");
const help_center_module_1 = require("./help-center/help-center.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            problems_module_1.ProblemsModule,
            submissions_module_1.SubmissionsModule,
            challenges_module_1.ChallengesModule,
            interviews_module_1.InterviewsModule,
            reports_module_1.ReportsModule,
            activity_logs_module_1.ActivityLogsModule,
            tab_switch_module_1.TabSwitchModule,
            advanced_features_module_1.AdvancedFeaturesModule,
            help_center_module_1.HelpCenterModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map