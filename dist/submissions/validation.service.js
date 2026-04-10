"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
let ValidationService = class ValidationService {
    validateOutput(problemId, input, expectedOutput, actualOutput) {
        const actual = (actualOutput || '').trim();
        const expected = (expectedOutput || '').trim();
        switch (problemId) {
            case '1':
                return this.validateTwoSum(input, expected, actual);
            case '2':
                return this.validateReverseString(expected, actual);
            case '3':
                return this.validateFizzBuzz(expected, actual);
            case '4':
                return this.validatePalindrome(expected, actual);
            case '5':
                return this.validateFibonacci(expected, actual);
            case '6':
                return this.validateFindMax(expected, actual);
            case '7':
                return this.validateLongestSubstring(expected, actual);
            case '8':
                return this.validateGroupAnagrams(expected, actual);
            case '9':
                return this.validateMedian(expected, actual);
            case '10':
                return this.validateMergeKLists(expected, actual);
            default:
                return { passed: this.normalizeString(actual) === this.normalizeString(expected) };
        }
    }
    validateTwoSum(input, expected, actual) {
        try {
            const arrayMatch = input.match(/\[(.*?)\]/);
            if (!arrayMatch)
                return { passed: false, message: 'Could not parse input array' };
            const numsStr = arrayMatch[1].split(',').map(s => s.trim());
            const nums = numsStr.map(s => parseInt(s, 10));
            const afterBracket = input.substring(input.indexOf(']') + 1).trim();
            const targetMatch = afterBracket.match(/^[,\s]*([-\d]+)/);
            if (!targetMatch)
                return { passed: false, message: 'Could not parse target' };
            const target = parseInt(targetMatch[1], 10);
            const actualIndices = this.parseArrayOutput(actual);
            if (!actualIndices || actualIndices.length !== 2) {
                return { passed: false, message: 'Output must be an array of 2 indices' };
            }
            const [act1, act2] = actualIndices;
            if (act1 >= nums.length || act2 >= nums.length || act1 === act2 || act1 < 0 || act2 < 0) {
                return { passed: false, message: `Invalid indices [${act1},${act2}] for array of length ${nums.length}` };
            }
            const sum = nums[act1] + nums[act2];
            if (sum !== target) {
                return { passed: false, message: `Sum of nums[${act1}] + nums[${act2}] = ${sum}, target = ${target}, does not match` };
            }
            return { passed: true };
        }
        catch (e) {
            return { passed: false, message: `Validation error: ${e.message}` };
        }
    }
    validateReverseString(expected, actual) {
        try {
            const exp = expected.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
            const act = actual.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
            if (exp === act) {
                return { passed: true };
            }
            return { passed: false, message: `Expected "${exp}", got "${act}"` };
        }
        catch (e) {
            return { passed: false, message: `Validation error: ${e.message}` };
        }
    }
    validateFizzBuzz(expected, actual) {
        try {
            const normalize = (text) => {
                let cleaned = text
                    .trim()
                    .replace(/[\[\]]/g, '')
                    .replace(/['"]/g, '');
                const items = cleaned
                    .split(/[\n,]/)
                    .map(s => s.trim().toLowerCase())
                    .filter(s => s.length > 0 && s !== 'fizzbuzz' && s !== 'fizz' && s !== 'buzz' && isNaN(parseInt(s, 10)) === false && s.match(/^\d+$/) || s === 'fizz' || s === 'buzz' || s === 'fizzbuzz');
                return items;
            };
            const expectedArr = this.parseArrayOutput(expected);
            const actualArr = this.parseArrayOutput(actual);
            if (!expectedArr || !actualArr) {
                return { passed: false, message: 'Could not parse FizzBuzz output' };
            }
            if (expectedArr.length !== actualArr.length) {
                return { passed: false, message: `Length mismatch: expected ${expectedArr.length}, got ${actualArr.length}` };
            }
            for (let i = 0; i < expectedArr.length; i++) {
                const exp = String(expectedArr[i]).trim().toLowerCase();
                const act = String(actualArr[i]).trim().toLowerCase();
                if (exp !== act) {
                    return { passed: false, message: `Position ${i}: expected "${exp}", got "${act}"` };
                }
            }
            return { passed: true };
        }
        catch (e) {
            return { passed: false, message: `Parse error: ${e.message}` };
        }
    }
    validatePalindrome(expected, actual) {
        const normalize = (s) => s.toLowerCase().trim();
        const exp = normalize(expected);
        const act = normalize(actual);
        const validBooleans = ['true', 'false'];
        const match = exp === act && validBooleans.includes(act);
        return { passed: match, message: match ? undefined : `Expected ${exp}, got ${act}` };
    }
    validateFibonacci(expected, actual) {
        const exp = parseInt(expected.trim(), 10);
        const act = parseInt(actual.trim(), 10);
        return { passed: !isNaN(exp) && !isNaN(act) && exp === act };
    }
    validateFindMax(expected, actual) {
        try {
            const extractNumber = (str) => {
                const direct = parseInt(str.trim(), 10);
                if (!isNaN(direct))
                    return direct;
                const arr = this.parseArrayOutput(str);
                if (arr && arr.length > 0) {
                    const nums = arr.map(x => {
                        const n = parseInt(x, 10);
                        return isNaN(n) ? -Infinity : n;
                    });
                    const max = Math.max(...nums);
                    return max === -Infinity ? null : max;
                }
                const match = str.match(/(-?\d+)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    return isNaN(num) ? null : num;
                }
                return null;
            };
            const expVal = extractNumber(expected);
            const actVal = extractNumber(actual);
            if (expVal === null || actVal === null) {
                return { passed: false, message: 'Could not parse max values' };
            }
            return { passed: expVal === actVal, message: expVal === actVal ? undefined : `Expected ${expVal}, got ${actVal}` };
        }
        catch (e) {
            return { passed: false, message: `Parse error: ${e.message}` };
        }
    }
    validateLongestSubstring(expected, actual) {
        try {
            const extractNumber = (str) => {
                const num = parseInt(str.trim(), 10);
                if (!isNaN(num))
                    return num;
                const match = str.match(/(\d+)/);
                if (match) {
                    const n = parseInt(match[1], 10);
                    return isNaN(n) ? null : n;
                }
                return null;
            };
            const exp = extractNumber(expected);
            const act = extractNumber(actual);
            if (exp === null || act === null) {
                return { passed: false, message: 'Could not parse substring length' };
            }
            return { passed: exp === act, message: exp === act ? undefined : `Expected ${exp}, got ${act}` };
        }
        catch (e) {
            return { passed: false, message: `Error: ${e.message}` };
        }
    }
    validateGroupAnagrams(expected, actual) {
        try {
            const expectedGroups = this.parseNestedArrayOutput(expected);
            const actualGroups = this.parseNestedArrayOutput(actual);
            if (!expectedGroups || !actualGroups) {
                return { passed: false, message: 'Could not parse anagram groups' };
            }
            if (expectedGroups.length !== actualGroups.length) {
                return { passed: false, message: 'Number of groups mismatch' };
            }
            const normalizeGroups = (groups) => {
                return groups
                    .map(group => group.sort().join(','))
                    .sort()
                    .join('|');
            };
            const expNorm = normalizeGroups(expectedGroups.map(g => g.map(w => String(w).trim())));
            const actNorm = normalizeGroups(actualGroups.map(g => g.map(w => String(w).trim())));
            return { passed: expNorm === actNorm };
        }
        catch (e) {
            return { passed: false, message: 'Invalid anagram output format' };
        }
    }
    validateMedian(expected, actual) {
        try {
            const exp = parseFloat(expected.trim());
            const act = parseFloat(actual.trim());
            const tolerance = 0.0001;
            return { passed: !isNaN(exp) && !isNaN(act) && Math.abs(exp - act) < tolerance };
        }
        catch (e) {
            return { passed: false };
        }
    }
    validateMergeKLists(expected, actual) {
        try {
            const expectedArr = this.parseArrayOutput(expected);
            const actualArr = this.parseArrayOutput(actual);
            if (!expectedArr || !actualArr) {
                return { passed: false, message: 'Could not parse arrays' };
            }
            if (expectedArr.length !== actualArr.length) {
                return { passed: false, message: 'Array length mismatch' };
            }
            const expSorted = expectedArr.map(x => parseInt(x, 10)).sort((a, b) => a - b);
            const actSorted = actualArr.map(x => parseInt(x, 10)).sort((a, b) => a - b);
            for (let i = 0; i < expSorted.length; i++) {
                if (expSorted[i] !== actSorted[i]) {
                    return { passed: false, message: `Element mismatch at index ${i}` };
                }
            }
            return { passed: true };
        }
        catch (e) {
            return { passed: false, message: 'Invalid merge lists output' };
        }
    }
    parseArrayOutput(output) {
        try {
            let cleaned = output.trim();
            if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
                cleaned = cleaned.slice(1, -1);
            }
            const elements = cleaned
                .split(',')
                .map(s => {
                let elem = s.trim().replace(/^["'`\[\]]+|["'`\[\]]+$/g, '').trim();
                const num = Number(elem);
                return isNaN(num) ? elem : num;
            })
                .filter(e => e !== '');
            return elements.length > 0 ? elements : null;
        }
        catch {
            return null;
        }
    }
    parseNestedArrayOutput(output) {
        try {
            const cleaned = output.trim();
            try {
                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) {
                    return parsed.map(item => {
                        if (Array.isArray(item)) {
                            return item.map(x => String(x).trim());
                        }
                        else {
                            return [String(item).trim()];
                        }
                    });
                }
            }
            catch {
                const result = [];
                let depth = 0;
                let current = '';
                let groups = [];
                for (let i = 0; i < cleaned.length; i++) {
                    const char = cleaned[i];
                    if (char === '[') {
                        depth++;
                        if (depth === 2)
                            current = '';
                    }
                    else if (char === ']') {
                        if (depth === 2) {
                            const items = current
                                .split(',')
                                .map(s => s.trim().replace(/^["']+|["']+$/g, '').trim())
                                .filter(s => s);
                            if (items.length > 0) {
                                groups.push(JSON.stringify(items));
                            }
                        }
                        depth--;
                    }
                    else if (depth === 2) {
                        current += char;
                    }
                }
                return groups.length > 0
                    ? groups.map(g => JSON.parse(g))
                    : null;
            }
            return null;
        }
        catch {
            return null;
        }
    }
    normalizeString(str) {
        return str
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[\[\]"]/g, '');
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)()
], ValidationService);
//# sourceMappingURL=validation.service.js.map