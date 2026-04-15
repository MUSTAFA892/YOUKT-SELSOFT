"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabSwitchModule = void 0;
const common_1 = require("@nestjs/common");
const tab_switch_service_1 = require("./tab-switch.service");
const tab_switch_controller_1 = require("./tab-switch.controller");
let TabSwitchModule = class TabSwitchModule {
};
exports.TabSwitchModule = TabSwitchModule;
exports.TabSwitchModule = TabSwitchModule = __decorate([
    (0, common_1.Module)({
        controllers: [tab_switch_controller_1.TabSwitchController],
        providers: [tab_switch_service_1.TabSwitchService],
        exports: [tab_switch_service_1.TabSwitchService],
    })
], TabSwitchModule);
//# sourceMappingURL=tab-switch.module.js.map