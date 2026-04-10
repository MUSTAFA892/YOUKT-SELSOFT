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
exports.TabSwitchController = void 0;
const common_1 = require("@nestjs/common");
const tab_switch_service_1 = require("./tab-switch.service");
let TabSwitchController = class TabSwitchController {
    constructor(tabSwitchService) {
        this.tabSwitchService = tabSwitchService;
        console.log('✅ TabSwitchController Initialized');
    }
    async reportTabSwitch(dto) {
        return this.tabSwitchService.reportTabSwitch(dto);
    }
    async getAllIncidents() {
        return this.tabSwitchService.getAllIncidents();
    }
    async getByCandidate(id) {
        return this.tabSwitchService.getIncidentsByCandidate(id);
    }
    async getByProblem(id) {
        return this.tabSwitchService.getIncidentsByProblem(id);
    }
    async getTerminatedSessions() {
        return this.tabSwitchService.getTerminatedSessions();
    }
};
exports.TabSwitchController = TabSwitchController;
__decorate([
    (0, common_1.Post)('report'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TabSwitchController.prototype, "reportTabSwitch", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TabSwitchController.prototype, "getAllIncidents", null);
__decorate([
    (0, common_1.Get)('candidate/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TabSwitchController.prototype, "getByCandidate", null);
__decorate([
    (0, common_1.Get)('problem/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TabSwitchController.prototype, "getByProblem", null);
__decorate([
    (0, common_1.Get)('terminated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TabSwitchController.prototype, "getTerminatedSessions", null);
exports.TabSwitchController = TabSwitchController = __decorate([
    (0, common_1.Controller)('tab-switch'),
    __metadata("design:paramtypes", [tab_switch_service_1.TabSwitchService])
], TabSwitchController);
//# sourceMappingURL=tab-switch.controller.js.map