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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemsController = void 0;
const common_1 = require("@nestjs/common");
const problems_service_1 = require("./problems.service");
const problem_session_service_1 = require("./problem-session.service");
const GENERATOR_TYPE_MAP = {
    '1': 'two-sum',
    '2': 'reverse-string',
    '3': 'fizzbuzz',
    '4': 'palindrome',
    '5': 'fibonacci',
    '6': 'find-max',
    '7': 'longest-substring',
    '8': 'group-anagrams',
    '9': 'median',
    '10': 'merge-lists',
};
let ProblemsController = class ProblemsController {
    constructor(problemsService, sessionService) {
        this.problemsService = problemsService;
        this.sessionService = sessionService;
    }
    findAll() {
        return this.problemsService.findAll();
    }
    findOne(id, candidateId) {
        const problem = this.problemsService.findOne(id);
        if (candidateId) {
            const generatorType = GENERATOR_TYPE_MAP[id];
            const session = this.sessionService.createSession(id, candidateId, generatorType);
            return {
                ...problem,
                examples: problem.examples,
                testCasesPreview: session.visibleTestCases,
                sessionId: session.id,
                _note: 'Additional hidden test cases will be used during validation'
            };
        }
        return problem;
    }
    getNextProblem(id, performanceMetrics) {
        return this.problemsService.getNextProblem(id, performanceMetrics);
    }
};
exports.ProblemsController = ProblemsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProblemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('candidateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProblemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/next'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProblemsController.prototype, "getNextProblem", null);
exports.ProblemsController = ProblemsController = __decorate([
    (0, common_1.Controller)('problems'),
    __metadata("design:paramtypes", [problems_service_1.ProblemsService,
        problem_session_service_1.ProblemSessionService])
], ProblemsController);
//# sourceMappingURL=problems.controller.js.map