"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseGenerator = void 0;
class TestCaseGenerator {
    static generateTestCases(config) {
        switch (config.type) {
            case 'two-sum':
                return this.generateTwoSumTestCases(config.seed);
            case 'reverse-string':
                return this.generateReverseStringTestCases(config.seed);
            case 'fizzbuzz':
                return this.generateFizzBuzzTestCases(config.seed);
            case 'palindrome':
                return this.generatePalindromeTestCases(config.seed);
            case 'fibonacci':
                return this.generateFibonacciTestCases(config.seed);
            case 'find-max':
                return this.generateFindMaxTestCases(config.seed);
            case 'longest-substring':
                return this.generateLongestSubstringTestCases(config.seed);
            case 'group-anagrams':
                return this.generateGroupAnagramsTestCases(config.seed);
            case 'median':
                return this.generateMedianTestCases(config.seed);
            case 'merge-lists':
                return this.generateMergeListsTestCases(config.seed);
            default:
                return [];
        }
    }
    static seededRandom(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    static generateTwoSumTestCases(seed) {
        const cases = [];
        const testDatasets = [
            { nums: [2, 7, 11, 15], target: 9 },
            { nums: [3, 2, 4], target: 6 },
            { nums: [2, 5, 5, 11], target: 10 }
        ];
        for (let i = 0; i < testDatasets.length; i++) {
            const { nums, target } = testDatasets[i];
            let indices = [0, 1];
            let found = false;
            for (let j = 0; j < nums.length && !found; j++) {
                for (let k = j + 1; k < nums.length && !found; k++) {
                    if (nums[j] + nums[k] === target) {
                        indices = [j, k];
                        found = true;
                    }
                }
            }
            cases.push({
                input: `[${nums.join(',')}], ${target}`,
                expectedOutput: `[${indices[0]},${indices[1]}]`,
                description: `Two sum: find indices in [${nums.join(', ')}] that sum to ${target}`
            });
        }
        return cases;
    }
    static generateReverseStringTestCases(seed) {
        const rand = this.seededRandom(seed);
        const testStrings = [
            'hello', 'world', 'racecar', 'a', 'ab', 'abc',
            'coding', 'javascript', 'python', 'test'
        ];
        return testStrings.slice(Math.floor(rand() * 5), Math.floor(rand() * 5) + 3).map(str => ({
            input: `"${str}"`,
            expectedOutput: str.split('').reverse().join(''),
            description: `Reverse "${str}"`
        }));
    }
    static generateFizzBuzzTestCases(seed) {
        const rand = this.seededRandom(seed);
        const cases = [];
        const testCases = [
            { n: 5, description: 'FizzBuzz for n=5' },
            { n: 15, description: 'FizzBuzz for n=15' },
            { n: 10, description: 'FizzBuzz for n=10' }
        ];
        for (const testCase of testCases) {
            const result = [];
            for (let j = 1; j <= testCase.n; j++) {
                if (j % 15 === 0)
                    result.push('FizzBuzz');
                else if (j % 3 === 0)
                    result.push('Fizz');
                else if (j % 5 === 0)
                    result.push('Buzz');
                else
                    result.push(j.toString());
            }
            cases.push({
                input: testCase.n.toString(),
                expectedOutput: `[${result.map(r => `"${r}"`).join(',')}]`,
                description: testCase.description
            });
        }
        return cases;
    }
    static generatePalindromeTestCases(seed) {
        const rand = this.seededRandom(seed);
        const testNumbers = [121, 1221, 12321, -121, 0, 1, 10, 11, 1001];
        return testNumbers.slice(Math.floor(rand() * 3), Math.floor(rand() * 3) + 3).map(num => {
            const str = Math.abs(num).toString();
            const isPalin = str === str.split('').reverse().join('') && num >= 0;
            return {
                input: num.toString(),
                expectedOutput: isPalin ? 'true' : 'false',
                description: `Check if ${num} is palindrome`
            };
        });
    }
    static generateFibonacciTestCases(seed) {
        const rand = this.seededRandom(seed);
        const fibs = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
        const cases = [];
        for (let i = 0; i < 3; i++) {
            const n = Math.floor(rand() * 8);
            cases.push({
                input: n.toString(),
                expectedOutput: fibs[n].toString(),
                description: `Fibonacci of ${n}`
            });
        }
        return cases;
    }
    static generateFindMaxTestCases(seed) {
        const rand = this.seededRandom(seed);
        const cases = [];
        for (let i = 0; i < 3; i++) {
            const size = 3 + Math.floor(rand() * 7);
            const arr = [];
            let max = -Infinity;
            for (let j = 0; j < size; j++) {
                const num = Math.floor(rand() * 200) - 100;
                arr.push(num);
                max = Math.max(max, num);
            }
            cases.push({
                input: `[${arr.join(',')}]`,
                expectedOutput: max.toString(),
                description: `Find max in array of ${size} elements`
            });
        }
        return cases;
    }
    static generateLongestSubstringTestCases(seed) {
        const rand = this.seededRandom(seed);
        const testStrings = [
            { str: 'abcabcbb', expected: 3 },
            { str: 'bbbbb', expected: 1 },
            { str: 'pwwkew', expected: 3 },
            { str: 'au', expected: 2 },
            { str: '', expected: 0 },
            { str: 'dvdf', expected: 3 }
        ];
        return testStrings.slice(Math.floor(rand() * 3), Math.floor(rand() * 3) + 3).map(t => ({
            input: `"${t.str}"`,
            expectedOutput: t.expected.toString(),
            description: `Longest substring without repeating in "${t.str}"`
        }));
    }
    static generateGroupAnagramsTestCases(seed) {
        return [
            {
                input: '["eat","tea","tan","ate","nat","bat"]',
                expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
                description: 'Standard anagram grouping'
            },
            {
                input: '[""]',
                expectedOutput: '[[""]]',
                description: 'Single empty string'
            },
            {
                input: '["a"]',
                expectedOutput: '[["a"]]',
                description: 'Single character'
            }
        ];
    }
    static generateMedianTestCases(seed) {
        return [
            {
                input: '[1,3], [2]',
                expectedOutput: '2.0',
                description: 'Odd total length'
            },
            {
                input: '[1,2], [3,4]',
                expectedOutput: '2.5',
                description: 'Even total length'
            }
        ];
    }
    static generateMergeListsTestCases(seed) {
        return [
            {
                input: '[[1,4,5],[1,3,4],[2,6]]',
                expectedOutput: '[1,1,2,3,4,4,5,6]',
                description: '3 sorted lists'
            },
            {
                input: '[[]]',
                expectedOutput: '[]',
                description: 'Empty list'
            }
        ];
    }
}
exports.TestCaseGenerator = TestCaseGenerator;
//# sourceMappingURL=test-case-generator.js.map