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
exports.HelpCenterController = void 0;
const common_1 = require("@nestjs/common");
const help_center_service_1 = require("./help-center.service");
let HelpCenterController = class HelpCenterController {
    constructor(helpCenterService) {
        this.helpCenterService = helpCenterService;
    }
    getConversation(candidateId, interviewId) {
        return this.helpCenterService.getConversation(candidateId, interviewId);
    }
    async sendMessage(body) {
        return this.helpCenterService.addMessage(body.candidateId, body.interviewId, body.message);
    }
    async getAiAssist(body) {
        const aiResponse = await this.helpCenterService.getAiResponse(body.query, body.candidateName, body.questionContext);
        await this.helpCenterService.addMessage(body.candidateId, body.interviewId, {
            senderId: body.candidateId,
            senderName: body.candidateName,
            senderType: 'candidate',
            content: body.query,
        });
        const botMsg = await this.helpCenterService.addMessage(body.candidateId, body.interviewId, {
            senderId: 'ollama_ai',
            senderName: 'YOUKT AI (Llama3)',
            senderType: 'ai',
            content: aiResponse,
        });
        return { status: 'success', data: botMsg };
    }
    getAllConversations() {
        return this.helpCenterService.getAllConversations();
    }
    async ping(body) {
        await this.helpCenterService.pingCandidate(body.candidateId);
        return { success: true };
    }
    getActiveCandidates() {
        return this.helpCenterService.getActiveCandidateIds();
    }
};
exports.HelpCenterController = HelpCenterController;
__decorate([
    (0, common_1.Get)('conversation/:candidateId/:interviewId'),
    __param(0, (0, common_1.Param)('candidateId')),
    __param(1, (0, common_1.Param)('interviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HelpCenterController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('ai-assist'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HelpCenterController.prototype, "getAiAssist", null);
__decorate([
    (0, common_1.Get)('all-conversations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "getAllConversations", null);
__decorate([
    (0, common_1.Post)('ping'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HelpCenterController.prototype, "ping", null);
__decorate([
    (0, common_1.Get)('active-candidates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "getActiveCandidates", null);
exports.HelpCenterController = HelpCenterController = __decorate([
    (0, common_1.Controller)('help-center'),
    __metadata("design:paramtypes", [help_center_service_1.HelpCenterService])
], HelpCenterController);
//# sourceMappingURL=help-center.controller.js.map