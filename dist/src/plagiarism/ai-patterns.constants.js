"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_PATTERNS = void 0;
exports.AI_PATTERNS = {
    PROBLEM_ID_MAP: {
        'two-sum': '1',
        'twosum': '1',
        'reverse-string': '2',
        'reversestring': '2',
        'fizz-buzz': '3',
        'fizzbuzz': '3',
        'longest-substring-without-repeating-characters': '7',
        'longestsubstring': '7',
        'group-anagrams': '8',
        'groupanagrams': '8',
        '1': '1',
        '2': '2',
        '3': '3',
        '7': '7',
        '8': '8',
    },
    MIN_TIME_S: {
        '1': 45,
        '2': 8,
        '3': 20,
        '7': 90,
        '8': 90,
        'DEFAULT': 45,
    },
    HEURISTICS: {
        COMMON_VAR_NAMES: [
            'complement', 'prevMap', 'charMap', 'charCount',
            'leftPointer', 'rightPointer', 'maxLen', 'startWindow',
            'dpTable', 'numMap', 'hashTable',
            'seen', 'visited', 'freq', 'freqMap',
            'twoSum', 'longestSubstring', 'groupAnagrams',
            'windowStart', 'windowEnd', 'charIndex',
        ],
        COMMENT_STYLES: [
            /^\/\*\*[\s\S]*?\* @param/m,
            /\/\/\s*Time Complexity:/i,
            /\/\/\s*Space Complexity:/i,
            /\/\/\s*Initialize a map to store/i,
            /\/\/\s*Use a hash\s?map/i,
            /\/\/\s*sliding window/i,
            /\/\/\s*two.?pointer/i,
            /\/\/\s*edge case/i,
            /\/\/\s*check if.*(complement|diff|target)/i,
            /\/\/\s*store.*(index|position|seen)/i,
            /\/\/\s*iterate (through|over)/i,
        ],
        BOILERPLATE: [
            /if\s*\(!nums\s*\|\|\s*nums\.length\s*===\s*0\)\s*return\s*\[\];/,
            /return\s*\[-1,\s*-1\];/,
            /new\s+Map\(\)[\s\S]{0,50}\.has\([\s\S]{0,30}\.get\(/,
            /const\s+(result|res|output)\s*=\s*\[\];[\s\S]*?return\s+(result|res|output);/,
            /Object\.values\(map\)/,
            /\.split\(''\)\.sort\(\)\.join\(''\)/,
        ],
    },
    SIGNATURES: {
        '1': [
            `const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) { return [map.get(complement), i]; } map.set(nums[i], i); }`,
            `const prevMap = {}; for (let i = 0; i < nums.length; i++) { const diff = target - nums[i]; if (diff in prevMap) { return [prevMap[diff], i]; } prevMap[nums[i]] = i; }`,
            `const seen = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (seen.has(complement)) return [seen.get(complement), i]; seen.set(nums[i], i); }`,
        ],
        '2': [
            `return s.split('').reverse().join('');`,
            `let reversed = ""; for (let i = s.length - 1; i >= 0; i--) { reversed += s[i]; } return reversed;`,
            `return s.split('').reduce((acc, char) => char + acc, '');`,
        ],
        '3': [
            `const res = []; for (let i = 1; i <= n; i++) { if (i % 3 === 0 && i % 5 === 0) res.push("FizzBuzz"); else if (i % 3 === 0) res.push("Fizz"); else if (i % 5 === 0) res.push("Buzz"); else res.push(i.toString()); } return res;`,
            `const result = []; for (let i = 1; i <= n; i++) { let str = ''; if (i % 3 === 0) str += 'Fizz'; if (i % 5 === 0) str += 'Buzz'; result.push(str || String(i)); } return result;`,
        ],
        '7': [
            `let maxLen = 0; let start = 0; const charMap = new Map(); for (let i = 0; i < s.length; i++) { if (charMap.has(s[i])) { start = Math.max(start, charMap.get(s[i]) + 1); } charMap.set(s[i], i); maxLen = Math.max(maxLen, i - start + 1); } return maxLen;`,
            `let left = 0, maxLen = 0; const seen = new Set(); for (let right = 0; right < s.length; right++) { while (seen.has(s[right])) { seen.delete(s[left]); left++; } seen.add(s[right]); maxLen = Math.max(maxLen, right - left + 1); } return maxLen;`,
        ],
        '8': [
            `const map = {}; for (const s of strs) { const sorted = s.split('').sort().join(''); if (!map[sorted]) map[sorted] = []; map[sorted].push(s); } return Object.values(map);`,
            `const map = new Map(); for (const str of strs) { const key = str.split('').sort().join(''); if (!map.has(key)) map.set(key, []); map.get(key).push(str); } return [...map.values()];`,
        ],
    },
};
//# sourceMappingURL=ai-patterns.constants.js.map