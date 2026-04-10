"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeReviewService = void 0;
const common_1 = require("@nestjs/common");
let CodeReviewService = class CodeReviewService {
    analyzeCode(code, language) {
        const review = {
            overallScore: 0,
            qualityRating: 'fair',
            complexity: this.analyzeComplexity(code, language),
            readability: this.analyzeReadability(code, language),
            efficiency: this.analyzeEfficiency(code, language),
            bestPractices: this.analyzeBestPractices(code, language),
            security: this.analyzeSecurityIssues(code, language),
            suggestions: [],
            timestamp: new Date()
        };
        const scores = [
            review.complexity.score,
            review.readability.score,
            review.efficiency.score,
            review.bestPractices.score,
            review.security.score
        ];
        review.overallScore = Math.round(scores.reduce((a, b) => a + b) / scores.length);
        if (review.overallScore >= 80)
            review.qualityRating = 'excellent';
        else if (review.overallScore >= 60)
            review.qualityRating = 'good';
        else if (review.overallScore >= 40)
            review.qualityRating = 'fair';
        else
            review.qualityRating = 'poor';
        return review;
    }
    analyzeComplexity(code, language) {
        let score = 80;
        let feedback = 'Good complexity handling';
        const nestingLevels = this.countMaxNestingLevels(code);
        if (nestingLevels > 4) {
            score -= 15;
            feedback = `High nesting depth detected (${nestingLevels} levels). Consider refactoring into separate functions.`;
        }
        const functions = this.extractFunctions(code, language);
        const longFunctions = functions.filter(f => f.lines > 50).length;
        if (longFunctions > 0) {
            score -= 10;
            feedback += ` Found ${longFunctions} function(s) over 50 lines. Consider breaking them down.`;
        }
        return { score: Math.max(0, score), feedback };
    }
    analyzeReadability(code, language) {
        let score = 85;
        let feedback = 'Code is readable';
        const issues = [];
        const shortVarCount = (code.match(/\b[a-z]\b/g) || []).length;
        if (shortVarCount > 5) {
            score -= 15;
            issues.push('Multiple single-letter variable names detected. Use descriptive names.');
        }
        const commentRatio = (code.match(/\/\/|\/\*|\*\//g) || []).length / code.split('\n').length;
        if (commentRatio < 0.05) {
            score -= 10;
            issues.push('Low comment coverage. Add comments for complex logic.');
        }
        const hasConsistentSpacing = /^  /m.test(code) || /^    /m.test(code);
        if (!hasConsistentSpacing) {
            score -= 5;
            issues.push('Inconsistent indentation detected.');
        }
        if (issues.length > 0) {
            feedback = issues.join(' ');
        }
        return { score: Math.max(0, score), feedback };
    }
    analyzeEfficiency(code, language) {
        let score = 75;
        let feedback = 'Efficiency is acceptable';
        const issues = [];
        if (code.includes('nested for') || code.match(/for.*for/)) {
            score -= 20;
            issues.push('Nested loops detected. Consider optimizing with better algorithms (sorting, hashing).');
        }
        if (code.includes('.includes(') && code.includes('Array')) {
            score -= 15;
            issues.push('Using .includes() in loop may be O(n²). Consider using Set for O(1) lookup.');
        }
        if (code.match(/sort\(.*\(a, b\).*-/)) {
            score -= 10;
            issues.push('Sorting has O(n log n) complexity. Ensure this is necessary.');
        }
        if (issues.length > 0) {
            feedback = issues.join(' ');
        }
        return {
            score: Math.max(0, score),
            feedback,
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)'
        };
    }
    analyzeBestPractices(code, language) {
        let score = 80;
        const violations = [];
        if (language === 'javascript' || language === 'python') {
            if (!code.includes('try') && !code.includes('except') && !code.includes('catch')) {
                violations.push('No error handling detected. Add try-catch blocks.');
                score -= 10;
            }
        }
        const unusedVars = this.findUnusedVariables(code, language);
        if (unusedVars.length > 0) {
            violations.push(`Unused variables detected: ${unusedVars.join(', ')}`);
            score -= 5;
        }
        const magicNumbers = (code.match(/\b\d{2,}\b/g) || []).length;
        if (magicNumbers > 3) {
            violations.push(`Magic numbers detected. Use named constants instead.`);
            score -= 10;
        }
        const duplicateCode = this.findDuplicatePatterns(code);
        if (duplicateCode > 2) {
            violations.push('Code duplication detected. Consider extracting common logic.');
            score -= 15;
        }
        return {
            score: Math.max(0, score),
            feedback: violations.length > 0 ? violations.join(' ') : 'Good adherence to best practices',
            violations
        };
    }
    analyzeSecurityIssues(code, language) {
        let score = 95;
        const issues = [];
        if (code.includes('query') && code.includes('+') && code.includes('$')) {
            issues.push('Potential SQL injection risk. Use parameterized queries.');
            score -= 20;
        }
        if (code.match(/password\s*=|secret\s*=|api_key\s*=/i)) {
            issues.push('Hardcoded credentials detected. Use environment variables.');
            score -= 25;
        }
        if (code.includes('eval(') || code.includes('exec(')) {
            issues.push('Dangerous eval() usage detected. Avoid using eval().');
            score -= 30;
        }
        if (code.includes('input(') || code.includes('readline')) {
            if (!code.includes('validate') && !code.includes('sanitize')) {
                issues.push('User input detected without validation. Add input sanitization.');
                score -= 15;
            }
        }
        return { score: Math.max(0, score), issues };
    }
    countMaxNestingLevels(code) {
        let maxLevel = 0;
        let currentLevel = 0;
        for (const char of code) {
            if (char === '{' || char === '(')
                currentLevel++;
            else if (char === '}' || char === ')')
                currentLevel--;
            maxLevel = Math.max(maxLevel, currentLevel);
        }
        return maxLevel;
    }
    extractFunctions(code, language) {
        const functions = [];
        const lines = code.split('\n');
        let inFunction = false;
        let functionLines = 0;
        for (const line of lines) {
            if (line.includes('function ') || line.includes('def ') || line.includes('public ')) {
                inFunction = true;
                functionLines = 0;
            }
            else if (inFunction) {
                functionLines++;
                if (line.includes('}') || (line.trim() === '' && functionLines > 10)) {
                    functions.push({ name: 'function', lines: functionLines });
                    inFunction = false;
                }
            }
        }
        return functions;
    }
    findUnusedVariables(code, language) {
        const unused = [];
        const varMatches = code.match(/(?:const|let|var)\s+(\w+)/g) || [];
        varMatches.forEach(match => {
            const varName = match.split(/\s+/)[1];
            const usage = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
            if (usage <= 1) {
                unused.push(varName);
            }
        });
        return unused;
    }
    findDuplicatePatterns(code) {
        const lines = code.split('\n').filter(l => l.trim());
        let duplicateCount = 0;
        for (let i = 0; i < lines.length; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[i] === lines[j]) {
                    duplicateCount++;
                }
            }
        }
        return duplicateCount;
    }
};
exports.CodeReviewService = CodeReviewService;
exports.CodeReviewService = CodeReviewService = __decorate([
    (0, common_1.Injectable)()
], CodeReviewService);
//# sourceMappingURL=code-review.service.js.map