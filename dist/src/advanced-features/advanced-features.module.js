"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedFeaturesModule = void 0;
const common_1 = require("@nestjs/common");
const advanced_features_controller_1 = require("./advanced-features.controller");
const code_review_service_1 = require("../code-review/code-review.service");
const plagiarism_detection_service_1 = require("../plagiarism/plagiarism-detection.service");
const adaptive_difficulty_service_1 = require("../adaptive-difficulty/adaptive-difficulty.service");
const question_library_service_1 = require("../question-library/question-library.service");
let AdvancedFeaturesModule = class AdvancedFeaturesModule {
};
exports.AdvancedFeaturesModule = AdvancedFeaturesModule;
exports.AdvancedFeaturesModule = AdvancedFeaturesModule = __decorate([
    (0, common_1.Module)({
        controllers: [advanced_features_controller_1.AdvancedFeaturesController],
        providers: [
            code_review_service_1.CodeReviewService,
            plagiarism_detection_service_1.PlagiarismDetectionService,
            adaptive_difficulty_service_1.AdaptiveDifficultyService,
            question_library_service_1.QuestionLibraryService
        ],
        exports: [
            code_review_service_1.CodeReviewService,
            plagiarism_detection_service_1.PlagiarismDetectionService,
            adaptive_difficulty_service_1.AdaptiveDifficultyService,
            question_library_service_1.QuestionLibraryService
        ]
    })
], AdvancedFeaturesModule);
//# sourceMappingURL=advanced-features.module.js.map