"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemsService = void 0;
const common_1 = require("@nestjs/common");
let ProblemsService = class ProblemsService {
    constructor() {
        this.problems = [
            {
                id: '1',
                title: 'Two Sum',
                difficulty: 'Easy',
                description: `Given an array of integers \`nums\` and an integer \`target\`, 
return the **indices** of the two numbers that add up to the target.

You may assume that each input has exactly one solution, 
and you may not use the same element twice.`,
                inputFormat: 'An array of integers `nums` and an integer `target`',
                outputFormat: 'An array of two indices `[i, j]` where `nums[i] + nums[j] == target`',
                examples: [
                    {
                        input: 'nums = [2, 7, 11, 15], target = 9',
                        output: '[0, 1]',
                        explanation: 'nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]',
                    },
                    {
                        input: 'nums = [3, 2, 4], target = 6',
                        output: '[1, 2]',
                        explanation: 'nums[1] + nums[2] = 2 + 4 = 6',
                    },
                ],
                testCases: [
                    { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', description: 'Basic case' },
                    { input: '[3,2,4], 6', expectedOutput: '[1,2]', description: 'Non-zero start index' },
                    { input: '[3,3], 6', expectedOutput: '[0,1]', description: 'Duplicate elements' },
                ],
                starterCode: {
                    python: `def two_sum(nums, target):
    # Hint: Use a dictionary to store numbers you've seen
    # Key: the number, Value: its index
    pass
`,
                    javascript: `function twoSum(nums, target) {
    // Hint: Use a Map to store numbers you've seen
    // Key: the number, Value: its index

}
`,
                },
                wrapperCode: {
                    python: `{user_code}

# Test runner — calls your function and prints result
import json
result = two_sum({input})
print(json.dumps(result))
`,
                    javascript: `{user_code}

// Test runner — calls your function and prints result
const result = twoSum({input});
console.log(JSON.stringify(result));
`,
                },
            },
            {
                id: '2',
                title: 'Reverse a String',
                difficulty: 'Easy',
                description: `Write a function that takes a string and returns it **reversed**.

For example, \`"hello"\` becomes \`"olleh"\`.`,
                inputFormat: 'A single string `s`',
                outputFormat: 'The reversed string',
                examples: [
                    { input: 's = "hello"', output: '"olleh"' },
                    { input: 's = "abcdef"', output: '"fedcba"' },
                ],
                testCases: [
                    { input: '"hello"', expectedOutput: 'olleh', description: 'Basic word' },
                    { input: '"abcdef"', expectedOutput: 'fedcba', description: 'All letters' },
                    { input: '"racecar"', expectedOutput: 'racecar', description: 'Palindrome' },
                    { input: '"a"', expectedOutput: 'a', description: 'Single character' },
                ],
                starterCode: {
                    python: `def reverse_string(s):
    # Hint: Python strings can be sliced with [::-1]
    pass
`,
                    javascript: `function reverseString(s) {
    // Hint: Try split('').reverse().join('')

}
`,
                },
                wrapperCode: {
                    python: `{user_code}

result = reverse_string({input})
print(result)
`,
                    javascript: `{user_code}

const result = reverseString({input});
console.log(result);
`,
                },
            },
            {
                id: '3',
                title: 'FizzBuzz',
                difficulty: 'Medium',
                description: `Given an integer \`n\`, return an array of strings for numbers from **1 to n**:
- \`"FizzBuzz"\` if divisible by both 3 and 5
- \`"Fizz"\` if divisible by 3  
- \`"Buzz"\` if divisible by 5  
- The number itself (as a string) otherwise`,
                inputFormat: 'An integer `n`',
                outputFormat: 'An array of strings of length `n`',
                examples: [
                    {
                        input: 'n = 5',
                        output: '["1","2","Fizz","4","Buzz"]',
                        explanation: '3 → Fizz, 5 → Buzz',
                    },
                    {
                        input: 'n = 15',
                        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
                    },
                ],
                testCases: [
                    { input: '5', expectedOutput: '["1","2","Fizz","4","Buzz"]', description: 'n = 5' },
                    { input: '3', expectedOutput: '["1","2","Fizz"]', description: 'n = 3' },
                    { input: '15', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', description: 'Full cycle' },
                ],
                starterCode: {
                    python: `def fizz_buzz(n):
    result = []
    for i in range(1, n + 1):
        # Check divisibility and append to result
        pass
    return result
`,
                    javascript: `function fizzBuzz(n) {
    const result = [];
    for (let i = 1; i <= n; i++) {
        // Check divisibility and push to result
    }
    return result;
}
`,
                },
                wrapperCode: {
                    python: `{user_code}

import json
result = fizz_buzz({input})
print(json.dumps(result))
`,
                    javascript: `{user_code}

const result = fizzBuzz({input});
console.log(JSON.stringify(result));
`,
                },
            },
        ];
    }
    findAll() {
        return this.problems.map(({ testCases, wrapperCode, ...rest }) => rest);
    }
    findOne(id) {
        const problem = this.problems.find(p => p.id === id);
        if (!problem) {
            throw new common_1.NotFoundException(`Problem with id "${id}" not found`);
        }
        const { testCases, wrapperCode, ...rest } = problem;
        return rest;
    }
    findOneWithTestCases(id) {
        const problem = this.problems.find(p => p.id === id);
        if (!problem) {
            throw new common_1.NotFoundException(`Problem with id "${id}" not found`);
        }
        return problem;
    }
};
exports.ProblemsService = ProblemsService;
exports.ProblemsService = ProblemsService = __decorate([
    (0, common_1.Injectable)()
], ProblemsService);
//# sourceMappingURL=problems.service.js.map