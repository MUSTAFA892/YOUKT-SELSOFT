// problems.service.ts — Now supports Python, JavaScript, Java, C

import { Injectable, NotFoundException } from '@nestjs/common';

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examples: Example[];
  testCases: TestCase[];
  starterCode: { python: string; javascript: string; java: string; c: string; };
  wrapperCode: { python: string; javascript: string; java: string; c: string; };
}

@Injectable()
export class ProblemsService {

  private readonly problems: Problem[] = [

    // ==================== PROBLEM 1 — Two Sum ====================
    {
      id: '1',
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to the target.',
      inputFormat: 'An array of integers `nums` and an integer `target`',
      outputFormat: 'An array of two indices `[i, j]`',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 9' },
        { input: 'nums = [3,2,4], target = 6',     output: '[1,2]' },
      ],
      testCases: [
        { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', description: 'Basic case' },
        { input: '[3,2,4], 6',     expectedOutput: '[1,2]', description: 'Non-zero start index' },
        { input: '[3,3], 6',       expectedOutput: '[0,1]', description: 'Duplicate elements' },
      ],
      starterCode: {
        python:     `def two_sum(nums, target):\n    pass\n`,
        javascript: `function twoSum(nums, target) {\n\n}\n`,
        java:       `public static int[] twoSum(int[] nums, int target) {\n    return new int[]{};\n}\n`,
        c:          `void two_sum(int* nums, int size, int target, int* out) {\n\n}\n`,
      },
      wrapperCode: {
        python: `{user_code}
import json
result = two_sum({input})
print(json.dumps(result))
`,
        javascript: `{user_code}
const result = twoSum({input});
console.log(JSON.stringify(result));
`,
        // Java wrapper: full class wrapping the user's method
        // User writes only the method body — we wrap it in a class
        java: `import java.util.*;
public class Solution {
    {user_code}
    public static void main(String[] args) {
        int[] nums = {{{java_nums}}};
        int target = {java_target};
        int[] result = twoSum(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
}`,
        // C wrapper: full program wrapping the user's function
        c: `#include <stdio.h>
#include <stdlib.h>
{user_code}
int main() {
    int nums[] = {{c_nums}};
    int size   = sizeof(nums) / sizeof(nums[0]);
    int out[2] = {0};
    two_sum(nums, size, {c_target}, out);
    printf("[%d,%d]\\n", out[0], out[1]);
    return 0;
}`,
      },
    },

    // ==================== PROBLEM 2 — Reverse a String ====================
    {
      id: '2',
      title: 'Reverse a String',
      difficulty: 'Easy',
      description: 'Write a function that takes a string and returns it reversed.',
      inputFormat: 'A single string `s`',
      outputFormat: 'The reversed string',
      examples: [
        { input: 's = "hello"',  output: '"olleh"' },
        { input: 's = "abcdef"', output: '"fedcba"' },
      ],
      testCases: [
        { input: '"hello"',   expectedOutput: 'olleh',   description: 'Basic word' },
        { input: '"abcdef"',  expectedOutput: 'fedcba',  description: 'All letters' },
        { input: '"racecar"', expectedOutput: 'racecar', description: 'Palindrome' },
        { input: '"a"',       expectedOutput: 'a',       description: 'Single character' },
      ],
      starterCode: {
        python:     `def reverse_string(s):\n    pass\n`,
        javascript: `function reverseString(s) {\n\n}\n`,
        java:       `public static String reverseString(String s) {\n    return "";\n}\n`,
        c:          `void reverse_string(char* s, char* out) {\n\n}\n`,
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
        java: `public class Solution {
    {user_code}
    public static void main(String[] args) {
        String s = {java_str};
        System.out.println(reverseString(s));
    }
}`,
        c: `#include <stdio.h>
#include <string.h>
{user_code}
int main() {
    char s[] = {c_str};
    char out[1000] = {0};
    reverse_string(s, out);
    printf("%s\\n", out);
    return 0;
}`,
      },
    },

    // ==================== PROBLEM 3 — FizzBuzz ====================
    {
      id: '3',
      title: 'FizzBuzz',
      difficulty: 'Medium',
      description: 'Given an integer `n`, return an array of strings: "FizzBuzz" if divisible by 3 and 5, "Fizz" if by 3, "Buzz" if by 5, else the number as string.',
      inputFormat: 'An integer `n`',
      outputFormat: 'An array of strings of length `n`',
      examples: [
        { input: 'n = 5',  output: '["1","2","Fizz","4","Buzz"]' },
        { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
      ],
      testCases: [
        { input: '5',  expectedOutput: '["1","2","Fizz","4","Buzz"]',                                                                                   description: 'n = 5' },
        { input: '3',  expectedOutput: '["1","2","Fizz"]',                                                                                              description: 'n = 3' },
        { input: '15', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', description: 'Full cycle' },
      ],
      starterCode: {
        python:     `def fizz_buzz(n):\n    result = []\n    # add your logic here\n    return result\n`,
        javascript: `function fizzBuzz(n) {\n    const result = [];\n    // add your logic here\n    return result;\n}\n`,
        java:       `public static String[] fizzBuzz(int n) {\n    String[] result = new String[n];\n    return result;\n}\n`,
        c:          `void fizz_buzz(int n, char result[][10]) {\n\n}\n`,
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
        java: `public class Solution {
    {user_code}
    public static void main(String[] args) {
        int n = {input};
        String[] result = fizzBuzz(n);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print("\\"" + result[i] + "\\"");
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
}`,
        c: `#include <stdio.h>
#include <string.h>
{user_code}
int main() {
    int n = {input};
    char result[100][10];
    fizz_buzz(n, result);
    printf("[");
    for (int i = 0; i < n; i++) {
        printf("\\"%s\\"", result[i]);
        if (i < n - 1) printf(",");
    }
    printf("]\\n");
    return 0;
}`,
      },
    },
  ];

  findAll(): Omit<Problem, 'testCases' | 'wrapperCode'>[] {
    return this.problems.map(({ testCases, wrapperCode, ...rest }) => rest);
  }

  findOne(id: string): Omit<Problem, 'testCases' | 'wrapperCode'> {
    const problem = this.problems.find(p => p.id === id);
    if (!problem) throw new NotFoundException(`Problem "${id}" not found`);
    const { testCases, wrapperCode, ...rest } = problem;
    return rest;
  }

  findOneWithTestCases(id: string): Problem {
    const problem = this.problems.find(p => p.id === id);
    if (!problem) throw new NotFoundException(`Problem "${id}" not found`);
    return problem;
  }
}
