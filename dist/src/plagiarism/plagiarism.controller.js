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
exports.PlagiarismController = void 0;
const common_1 = require("@nestjs/common");
const plagiarism_detection_service_1 = require("./plagiarism-detection.service");
let PlagiarismController = class PlagiarismController {
    constructor(plagiarismService) {
        this.plagiarismService = plagiarismService;
    }
    check(dto) {
        const submissionId = dto.submissionId || `sub_${Date.now()}`;
        this.plagiarismService.registerSubmission(submissionId, dto.code, dto.candidateId, dto.interviewId, dto.problemId);
        const report = this.plagiarismService.checkPlagiarism(dto.code, dto.candidateId, dto.interviewId, dto.problemId, submissionId, dto.submissionTimeMs, dto.pasteDetected);
        return { success: true, data: report };
    }
};
exports.PlagiarismController = PlagiarismController;
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlagiarismController.prototype, "check", null);
exports.PlagiarismController = PlagiarismController = __decorate([
    (0, common_1.Controller)('plagiarism'),
    __metadata("design:paramtypes", [plagiarism_detection_service_1.PlagiarismDetectionService])
], PlagiarismController);
//# sourceMappingURL=plagiarism.controller.js.map