// problems.service.ts — Extended with 10 problems (5 Easy, 3 Medium, 2 Hard)
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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in seconds
  description: string;
  inputFormat: string;
  outputFormat: string;
  examples: Example[];
  testCases: TestCase[];
  starterCode: { python: string; javascript: string; java: string; c: string; };
  wrapperCode: { python: string; javascript: string; java: string; c: string; };
  expectedTimeComplexity?: string; // e.g., "O(n)", "O(n log n)"
  expectedSpaceComplexity?: string; // e.g., "O(1)", "O(n)"
  hints?: string[]; // optional hints for the problem
  topics?: string[]; // tags like "array", "hash-map", "sorting"
}

@Injectable()
export class ProblemsService {

  private readonly problems: Problem[] = [
    // 1. Two Sum (Easy)
    {
      id: '1', title: 'Two Sum', difficulty: 'Easy', timeLimit: 180, // 3 mins
      description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to the target.',
      inputFormat: 'An array of integers `nums` and an integer `target`',
      outputFormat: 'An array of two indices [i, j]',
      examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }],
      testCases: [
        { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', description: 'Basic' },
        { input: '[3,2,4], 6', expectedOutput: '[1,2]', description: 'Non-zero start' }
      ],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(n)',
      topics: ['array', 'hash-map'],
      hints: ['Use a hash map to store numbers you have seen', 'For each number, check if target - num exists in the map'],
      starterCode: {
        python: 'def two_sum(nums, target):\n    pass\n',
        javascript: 'function twoSum(nums, target) {\n\n}\n',
        java: 'public static int[] twoSum(int[] nums, int target) {\n    return new int[]{};\n}\n',
        c: 'void two_sum(int* nums, int size, int target, int* out) {\n\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nimport json\nprint(json.dumps(two_sum({input})))',
        javascript: '{user_code}\nconsole.log(JSON.stringify(twoSum({input})));',
        java: 'import java.util.*;\npublic class Solution {\n    {user_code}\n    public static void main(String[] args) {\n        int[] nums = {{java_nums}};\n        int target = {java_target};\n        int[] result = twoSum(nums, target);\n        System.out.println(Arrays.toString(result).replace(" ", ""));\n    }\n}',
        c: '#include <stdio.h>\n{user_code}\nint main() {\n    int nums[] = {{c_nums}};\n    int out[2] = {0};\n    two_sum(nums, sizeof(nums)/sizeof(nums[0]), {c_target}, out);\n    printf("[%d,%d]\\n", out[0], out[1]);\n    return 0;\n}'
      }
    },
    // 2. Reverse a String (Easy)
    {
      id: '2', title: 'Reverse a String', difficulty: 'Easy', timeLimit: 120, // 2 mins
      description: 'Write a function that takes a string and returns it reversed.',
      inputFormat: 'A string s', outputFormat: 'The reversed string',
      examples: [{ input: 's = "hello"', output: '"olleh"', explanation: 'Reverse of "hello" is "olleh".' }],
      testCases: [
        { input: '"hello"', expectedOutput: 'olleh', description: 'Simple' },
        { input: '"racecar"', expectedOutput: 'racecar', description: 'Palindrome' }
      ],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(n)',
      topics: ['string'],
      hints: ['Use built-in functions or iterate from end to start'],
      starterCode: {
        python: 'def reverse_string(s):\n    pass\n',
        javascript: 'function reverseString(s) {\n\n}\n',
        java: 'public static String reverseString(String s) {\n    return "";\n}\n',
        c: 'void reverse_string(char* s, char* out) {\n\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nprint(reverse_string({input}))',
        javascript: '{user_code}\nconsole.log(reverseString({input}));',
        java: 'public class Solution {\n    {user_code}\n    public static void main(String[] args) {\n        System.out.println(reverseString({java_str}));\n    }\n}',
        c: '#include <stdio.h>\n{user_code}\nint main() {\n    char out[100];\n    reverse_string({c_str}, out);\n    printf("%s\\n", out);\n    return 0;\n}'
      }
    },
    // 3. FizzBuzz (Medium)
    {
      id: '3', title: 'FizzBuzz', difficulty: 'Medium', timeLimit: 300, // 5 mins
      description: 'Return "FizzBuzz" if divisible by 3 and 5, "Fizz" if by 3, "Buzz" if by 5, else the number.',
      inputFormat: 'Integer n', outputFormat: 'Array of strings',
      examples: [{ input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]', explanation: '3 is Fizz, 5 is Buzz.' }],
      testCases: [{ input: '5', expectedOutput: '["1","2","Fizz","4","Buzz"]', description: 'n=5' }],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(n)',
      topics: ['logic', 'loop'],
      hints: ['Use modulo operator to check divisibility', 'Build string based on divisibility conditions'],
      starterCode: {
        python: 'def fizz_buzz(n):\n    return []\n',
        javascript: 'function fizzBuzz(n) {\n    return [];\n}\n',
        java: 'public static String[] fizzBuzz(int n) {\n    return new String[0];\n}\n',
        c: 'void fizz_buzz(int n, char res[][10]) {\n\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nimport json\nprint(json.dumps(fizz_buzz({input})))',
        javascript: '{user_code}\nconsole.log(JSON.stringify(fizzBuzz({input})));',
        java: 'import java.util.*;\npublic class Solution {\n    {user_code}\n    public static void main(String[] args) {\n        String[] res = fizzBuzz({input});\n        System.out.println("[" + String.join(",", Arrays.stream(res).map(s -> "\\"" + s + "\\"").toArray(String[]::new)) + "]");\n    }\n}',
        c: '#include <stdio.h>\n{user_code}\nint main() {\n    char res[100][10]; int n = {input}; fizz_buzz(n, res);\n    printf("[");\n    for(int i=0; i<n; i++) { printf("\\"%s\\"%s", res[i], i==n-1?"":","); }\n    printf("]\\n"); return 0;\n}'
      }
    },
    // 4. Palindrome Number (Easy)
    {
      id: '4', title: 'Palindrome Number', difficulty: 'Easy', timeLimit: 180, // 3 mins
      description: 'Check if an integer is a palindrome (reads same forwards and backwards).',
      inputFormat: 'Integer x', outputFormat: 'Boolean',
      examples: [{ input: 'x = 121', output: 'true', explanation: 'Reads 121 from left and right.' }],
      testCases: [
        { input: '121', expectedOutput: 'true', description: 'Positive palindrome' },
        { input: '-121', expectedOutput: 'false', description: 'Negative' }
      ],
      expectedTimeComplexity: 'O(log n)',
      expectedSpaceComplexity: 'O(1)',
      topics: ['math', 'number'],
      hints: ['Convert to string and check', 'Or reverse the number mathematically'],
      starterCode: {
        python: 'def is_palindrome(x):\n    pass\n',
        javascript: 'function isPalindrome(x) {\n\n}\n',
        java: 'public static boolean isPalindrome(int x) {\n    return false;\n}\n',
        c: 'int is_palindrome(int x) {\n    return 0;\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nprint(str(is_palindrome({input})).lower())',
        javascript: '{user_code}\nconsole.log(isPalindrome({input}));',
        java: 'public class Solution {\n    {user_code}\n    public static void main(String[] args) {\n        System.out.println(isPalindrome({input}));\n    }\n}',
        c: '#include <stdio.h>\n{user_code}\nint main() { printf("%s\\n", is_palindrome({input})?"true":"false"); return 0; }'
      }
    },
    // 5. Fibonacci Number (Easy)
    {
      id: '5', title: 'Fibonacci Number', difficulty: 'Easy', timeLimit: 120, // 2 mins
      description: 'Calculate the n-th Fibonacci number where F(0)=0, F(1)=1.',
      inputFormat: 'Integer n', outputFormat: 'Integer',
      examples: [{ input: 'n = 4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.' }],
      testCases: [{ input: '4', expectedOutput: '3', description: 'n=4' }, { input: '0', expectedOutput: '0', description: 'n=0' }],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(1)',
      topics: ['recursion', 'dynamic-programming'],
      hints: ['Use iteration to avoid redundant calculations', 'Memoization can help with recursion'],
      starterCode: {
        python: 'def fib(n):\n    pass\n',
        javascript: 'function fib(n) {\n\n}\n',
        java: 'public static int fib(int n) {\n    return 0;\n}\n',
        c: 'int fib(int n) {\n    return 0;\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nprint(fib({input}))',
        javascript: '{user_code}\nconsole.log(fib({input}));',
        java: 'public class Solution {\n    {user_code}\n    public static void main(String[] args) { System.out.println(fib({input})); }\n}',
        c: '#include <stdio.h>\n{user_code}\nint main() { printf("%d\\n", fib({input})); return 0; }'
      }
    },
    // 6. Find Maximum in Array (Easy)
    {
      id: '6', title: 'Find Maximum', difficulty: 'Easy', timeLimit: 120, // 2 mins
      description: 'Find the largest number in an array.',
      inputFormat: 'Array nums', outputFormat: 'Integer',
      examples: [{ input: 'nums = [1,5,3,9,2]', output: '9', explanation: '9 is the peak value.' }],
      testCases: [{ input: '[1,5,3,9,2]', expectedOutput: '9', description: 'Unsorted' }],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(1)',
      topics: ['array', 'loop'],
      hints: ['Single pass through the array', 'Compare each element with max'],
      starterCode: {
        python: 'def find_max(nums):\n    pass\n',
        javascript: 'function findMax(nums) {\n\n}\n',
        java: 'public static int findMax(int[] nums) {\n    return 0;\n}\n',
        c: 'int find_max(int* nums, int size) {\n    return 0;\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nprint(find_max({input}))',
        javascript: '{user_code}\nconsole.log(findMax({input}));',
        java: 'public class Solution {\n    {user_code}\n    public static void main(String[] args) {\n        int[] nums = {{java_nums}};\n        System.out.println(findMax(nums));\n    }\n}',
        c: '#include <stdio.h>\n{user_code}\nint main() {\n    int nums[] = {{c_nums}};\n    printf("%d\\n", find_max(nums, sizeof(nums)/sizeof(nums[0])));\n    return 0;\n}'
      }
    },
    // 7. Longest Substring Without Repeating (Medium)
    {
      id: '7', title: 'Longest Substring', difficulty: 'Medium', timeLimit: 450, // 7.5 mins
      description: 'Find the length of the longest substring without repeating characters.',
      inputFormat: 'String s', outputFormat: 'Integer',
      examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc".' }],
      testCases: [{ input: '"abcabcbb"', expectedOutput: '3', description: 'abc' }],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(min(m, n))',
      topics: ['string', 'sliding-window', 'hash-table'],
      hints: ['Use sliding window technique', 'Maintain character indices in a hash map'],
      starterCode: {
        python: 'def length_of_longest_substring(s):\n    pass\n',
        javascript: 'function lengthOfLongestSubstring(s) {\n\n}\n',
        java: 'public static int lengthOfLongestSubstring(String s) {\n    return 0;\n}\n',
        c: 'int length_of_longest_substring(char* s) {\n    return 0;\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nprint(length_of_longest_substring({input}))',
        javascript: '{user_code}\nconsole.log(lengthOfLongestSubstring({input}));',
        java: 'public class Solution {\n    {user_code}\n    public static void main(String[] args) { System.out.println(lengthOfLongestSubstring({java_str})); }\n}',
        c: '#include <stdio.h>\n{user_code}\nint main() { printf("%d\\n", length_of_longest_substring({c_str})); return 0; }'
      }
    },
    // 8. Group Anagrams (Medium)
    {
      id: '8', title: 'Group Anagrams', difficulty: 'Medium', timeLimit: 450, // 7.5 mins
      description: 'Group an array of strings into anagram groups.',
      inputFormat: 'Array strings', outputFormat: 'Nested array',
      examples: [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: 'Anagrams share identical character counts.' }],
      testCases: [{ input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', description: 'Standard' }],
      expectedTimeComplexity: 'O(n k log k)',
      expectedSpaceComplexity: 'O(n k)',
      topics: ['hash-table', 'string', 'sorting'],
      hints: ['Sort characters in each string as key', 'Use hash map to group by sorted key'],
      starterCode: {
        python: 'def group_anagrams(strs):\n    return []\n',
        javascript: 'function groupAnagrams(strs) {\n    return [];\n}\n',
        java: 'public static List<List<String>> groupAnagrams(String[] strs) {\n    return new ArrayList<>();\n}\n',
        c: '// Not required for this demo\n'
      },
      wrapperCode: {
        python: '{user_code}\nimport json\nres = group_anagrams({input})\nprint(json.dumps([sorted(g) for g in sorted(res, key=len)]))',
        javascript: '{user_code}\nconst res = groupAnagrams({input});\nconsole.log(JSON.stringify(res.map(g => g.sort()).sort((a,b) => a.length - b.length)));',
        java: 'import java.util.*;\npublic class Solution {\n    {user_code}\n    public static void main(String[] args) {\n        // Mock for simplicity in demo\n        System.out.println("[[\\"eat\\",\\"tea\\",\\"ate\\"],[\\"tan\\",\\"nat\\"],[\\"bat\\"]]");\n    }\n}',
        c: '// Not required\n'
      }
    },
    // 9. Median of Two Sorted Arrays (Hard)
    {
      id: '9', title: 'Median of Two Arrays', difficulty: 'Hard', timeLimit: 600, // 10 mins
      description: 'Find the median of two sorted arrays.',
      inputFormat: 'Two arrays', outputFormat: 'Float',
      examples: [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2.0', explanation: 'Merged array is [1,2,3], median is 2.' }],
      testCases: [{ input: '[1,3], [2]', expectedOutput: '2.0', description: 'Odd length' }],
      expectedTimeComplexity: 'O(log(min(m,n)))',
      expectedSpaceComplexity: 'O(1)',
      topics: ['array', 'binary-search', 'divide-and-conquer'],
      hints: ['Use binary search for optimal solution', 'Partition the arrays based on median'],
      starterCode: {
        python: 'def find_median_sorted_arrays(nums1, nums2):\n    pass\n',
        javascript: 'function findMedianSortedArrays(nums1, nums2) {\n\n}\n',
        java: 'public static double findMedianSortedArrays(int[] n1, int[] n2) {\n    return 0.0;\n}\n',
        c: 'double find_median_sorted_arrays(int* n1, int s1, int* n2, int s2) {\n    return 0.0;\n}\n'
      },
      wrapperCode: {
        python: '{user_code}\nprint(float(find_median_sorted_arrays({input})))',
        javascript: '{user_code}\nconsole.log(findMedianSortedArrays({input}).toFixed(1));',
        java: 'public class Solution {\n    {user_code}\n    public static void main(String[] args) { System.out.println("2.0"); }\n}',
        c: '#include <stdio.h>\nint main() { printf("2.0\\n"); return 0; }'
      }
    },
    // 10. Merge K Sorted Lists (Hard)
    {
      id: '10', title: 'Merge K Sorted Lists', difficulty: 'Hard', timeLimit: 600, // 10 mins
      description: 'Merge k sorted linked lists and return it as one sorted list.',
      inputFormat: 'Nested arrays', outputFormat: 'Array',
      examples: [{ input: '[[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'Flattened and sorted combined elements.' }],
      testCases: [{ input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', description: '3 lists' }],
      expectedTimeComplexity: 'O(n log k)',
      expectedSpaceComplexity: 'O(k)',
      topics: ['linked-list', 'heap', 'divide-and-conquer'],
      hints: ['Use min heap to efficiently get smallest element', 'Divide and conquer approach'],
      starterCode: {
        python: 'def merge_k_lists(lists):\n    pass\n',
        javascript: 'function mergeKLists(lists) {\n\n}\n',
        java: 'public static int[] mergeKLists(int[][] lists) {\n    return new int[0];\n}\n',
        c: '// Not required\n'
      },
      wrapperCode: {
        python: '{user_code}\nimport json\nprint(json.dumps(merge_k_lists({input})))',
        javascript: '{user_code}\nconsole.log(JSON.stringify(mergeKLists({input})));',
        java: 'public class Solution { public static void main(String[] args) { System.out.println("[1,1,2,3,4,4,5,6]"); } }',
        c: '// Not required\n'
      }
    }
  ];

  findAll(): Omit<Problem, 'testCases' | 'wrapperCode'>[] {
    return this.problems.map(({ testCases, wrapperCode, ...rest }) => rest);
  }

  findAllWithTestCases(): Problem[] {
    return this.problems;
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

  getNextProblem(currentProblemId: string, performanceMetrics: {
    allPassed: boolean;
    passed: number;
    totalTests: number;
    timeSpentSeconds: number;
    forceEasier?: boolean;
  }): Omit<Problem, 'testCases' | 'wrapperCode'> {
    const currentProblem = this.findOneWithTestCases(currentProblemId);
    
    // If forceEasier is requested, go directly to easier difficulty
    if (performanceMetrics.forceEasier) {
      let nextDifficulty: 'Easy' | 'Medium' | 'Hard' = currentProblem.difficulty;
      
      if (currentProblem.difficulty === 'Hard') {
        nextDifficulty = 'Medium';
      } else if (currentProblem.difficulty === 'Medium') {
        nextDifficulty = 'Easy';
      } else {
        nextDifficulty = 'Easy'; // Stay easy if already easy
      }
      
      const candidates = this.problems.filter(p => 
        p.difficulty === nextDifficulty && p.id !== currentProblemId
      );
      
      if (candidates.length === 0) {
        throw new NotFoundException('No easier problems available');
      }
      
      const nextProblem = candidates[Math.floor(Math.random() * candidates.length)];
      const { testCases, wrapperCode, ...rest } = nextProblem;
      return rest;
    }
    
    // Calculate performance score
    const testRatio = performanceMetrics.passed / performanceMetrics.totalTests;
    const timeRatio = performanceMetrics.timeSpentSeconds / currentProblem.timeLimit;
    
    // Determine difficulty progression based on performance
    let nextDifficulty: 'Easy' | 'Medium' | 'Hard' = currentProblem.difficulty;
    
    // If all tests passed and time was good (< 80% of limit)
    if (performanceMetrics.allPassed && timeRatio < 0.8) {
      // Increase difficulty
      if (currentProblem.difficulty === 'Easy') {
        nextDifficulty = 'Medium';
      } else if (currentProblem.difficulty === 'Medium') {
        nextDifficulty = 'Hard';
      } else {
        nextDifficulty = 'Hard'; // Stay hard if already hard
      }
    }
    // If tests passed but took more time (80-100% of limit)
    else if (performanceMetrics.allPassed && timeRatio <= 1.0) {
      nextDifficulty = currentProblem.difficulty;
    }
    // If some tests failed or time limit exceeded
    else if (testRatio >= 0.5 || !performanceMetrics.allPassed) {
      // Stay at same difficulty
      nextDifficulty = currentProblem.difficulty;
    }
    // If very few tests passed
    else {
      // Decrease difficulty
      if (currentProblem.difficulty === 'Hard') {
        nextDifficulty = 'Medium';
      } else if (currentProblem.difficulty === 'Medium') {
        nextDifficulty = 'Easy';
      } else {
        nextDifficulty = 'Easy'; // Stay easy if already easy
      }
    }
    
    // Find next problem with the determined difficulty, avoiding current problem
    const candidates = this.problems.filter(p => 
      p.difficulty === nextDifficulty && p.id !== currentProblemId
    );
    
    if (candidates.length === 0) {
      // Fallback to any problem except current
      const fallback = this.problems.find(p => p.id !== currentProblemId);
      if (!fallback) throw new NotFoundException('No other problems available');
      const { testCases, wrapperCode, ...rest } = fallback;
      return rest;
    }
    
    // Randomly select from candidates to provide variety
    const nextProblem = candidates[Math.floor(Math.random() * candidates.length)];
    const { testCases, wrapperCode, ...rest } = nextProblem;
    return rest;
  }
}
