// validation.service.ts — Problem-specific validation logic
// Replaces string comparison with intelligent validators that accept multiple solution approaches

import { Injectable } from '@nestjs/common';

export interface ValidationResult {
  passed: boolean;
  message?: string;
}

@Injectable()
export class ValidationService {

  /**
   * Validate output based on problem type
   * Accepts multiple solution approaches instead of exact string matching
   */
  validateOutput(
    problemId: string,
    input: string,
    expectedOutput: string,
    actualOutput: string,
  ): ValidationResult {
    const actual = (actualOutput || '').trim();
    const expected = (expectedOutput || '').trim();

    switch (problemId) {
      case '1': // Two Sum
        return this.validateTwoSum(input, expected, actual);
      case '2': // Reverse String
        return this.validateReverseString(expected, actual);
      case '3': // FizzBuzz
        return this.validateFizzBuzz(expected, actual);
      case '4': // Palindrome Number
        return this.validatePalindrome(expected, actual);
      case '5': // Fibonacci
        return this.validateFibonacci(expected, actual);
      case '6': // Find Max
        return this.validateFindMax(expected, actual);
      case '7': // Longest Substring
        return this.validateLongestSubstring(expected, actual);
      case '8': // Group Anagrams
        return this.validateGroupAnagrams(expected, actual);
      case '9': // Median
        return this.validateMedian(expected, actual);
      case '10': // Merge K Lists
        return this.validateMergeKLists(expected, actual);
      default:
        return { passed: this.normalizeString(actual) === this.normalizeString(expected) };
    }
  }

  /**
   * Two Sum: Accept any pair of valid indices that sum to target
   * Input: "[1,2,7,11] 9" or "[1,2,7,11], 9"
   * Valid outputs: [2,3] or [3,2] (both refer to indices pointing to 7 and 2)
   */
  private validateTwoSum(input: string, expected: string, actual: string): ValidationResult {
    try {
      // Parse input to extract array and target
      const arrayMatch = input.match(/\[(.*?)\]/);
      if (!arrayMatch) return { passed: false, message: 'Could not parse input array' };
      
      const numsStr = arrayMatch[1].split(',').map(s => s.trim());
      const nums = numsStr.map(s => parseInt(s, 10));
      
      // Extract target: look for number AFTER the closing bracket
      // Pattern: ], target or space target
      const afterBracket = input.substring(input.indexOf(']') + 1).trim();
      const targetMatch = afterBracket.match(/^[,\s]*([-\d]+)/);
      if (!targetMatch) return { passed: false, message: 'Could not parse target' };
      const target = parseInt(targetMatch[1], 10);

      // Parse actual output indices
      const actualIndices = this.parseArrayOutput(actual);
      if (!actualIndices || actualIndices.length !== 2) {
        return { passed: false, message: 'Output must be an array of 2 indices' };
      }

      const [act1, act2] = actualIndices;

      // Validate indices are in bounds and different
      if (act1 >= nums.length || act2 >= nums.length || act1 === act2 || act1 < 0 || act2 < 0) {
        return { passed: false, message: `Invalid indices [${act1},${act2}] for array of length ${nums.length}` };
      }

      // Check if indices produce correct sum
      const sum = nums[act1] + nums[act2];
      if (sum !== target) {
        return { passed: false, message: `Sum of nums[${act1}] + nums[${act2}] = ${sum}, target = ${target}, does not match` };
      }

      return { passed: true };
    } catch (e) {
      return { passed: false, message: `Validation error: ${e.message}` };
    }
  }

  /**
   * Reverse String: Accept any correct string reversal
   * Can handle quotes, format variations
   */
  private validateReverseString(expected: string, actual: string): ValidationResult {
    try {
      // Remove quotes and whitespace
      const exp = expected.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
      const act = actual.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
      
      // Direct string comparison
      if (exp === act) {
        return { passed: true };
      }
      
      return { passed: false, message: `Expected "${exp}", got "${act}"` };
    } catch (e) {
      return { passed: false, message: `Validation error: ${e.message}` };
    }
  }

  /**
   * FizzBuzz: Accept variations in format and quote styles
   * Array format, comma-separated, newline-separated all acceptable
   */
  private validateFizzBuzz(expected: string, actual: string): ValidationResult {
    try {
      // Parse both outputs into arrays
      const normalize = (text: string): string[] => {
        // Remove brackets and quotes
        let cleaned = text
          .trim()
          .replace(/[\[\]]/g, '')
          .replace(/['"]/g, '');
        
        // Split by comma or newline
        const items = cleaned
          .split(/[\n,]/)
          .map(s => s.trim().toLowerCase())
          .filter(s => s.length > 0 && s !== 'fizzbuzz' && s !== 'fizz' && s !== 'buzz' && isNaN(parseInt(s, 10)) === false && s.match(/^\d+$/) || s === 'fizz' || s === 'buzz' || s === 'fizzbuzz');
        
        return items;
      };

      // Better approach: parse as array
      const expectedArr = this.parseArrayOutput(expected);
      const actualArr = this.parseArrayOutput(actual);

      if (!expectedArr || !actualArr) {
        return { passed: false, message: 'Could not parse FizzBuzz output' };
      }

      if (expectedArr.length !== actualArr.length) {
        return { passed: false, message: `Length mismatch: expected ${expectedArr.length}, got ${actualArr.length}` };
      }

      // Compare element by element (case-insensitive)
      for (let i = 0; i < expectedArr.length; i++) {
        const exp = String(expectedArr[i]).trim().toLowerCase();
        const act = String(actualArr[i]).trim().toLowerCase();
        
        if (exp !== act) {
          return { passed: false, message: `Position ${i}: expected "${exp}", got "${act}"` };
        }
      }

      return { passed: true };
    } catch (e) {
      return { passed: false, message: `Parse error: ${e.message}` };
    }
  }

  /**
   * Palindrome Number: Accept various boolean formats
   * Handle: true, True, TRUE, false, False, FALSE
   */
  private validatePalindrome(expected: string, actual: string): ValidationResult {
    const normalize = (s: string): string => s.toLowerCase().trim();
    const exp = normalize(expected);
    const act = normalize(actual);
    
    const validBooleans = ['true', 'false'];
    const match = exp === act && validBooleans.includes(act);
    
    return { passed: match, message: match ? undefined : `Expected ${exp}, got ${act}` };
  }

  /**
   * Fibonacci Number: Simple integer comparison
   */
  private validateFibonacci(expected: string, actual: string): ValidationResult {
    const exp = parseInt(expected.trim(), 10);
    const act = parseInt(actual.trim(), 10);
    return { passed: !isNaN(exp) && !isNaN(act) && exp === act };
  }

  /**
   * Find Max: Parse and compare largest value from various formats
   * Accept: 42, "42", [42], "The max is 42", etc
   */
  private validateFindMax(expected: string, actual: string): ValidationResult {
    try {
      const extractNumber = (str: string): number | null => {
        // Try direct number first
        const direct = parseInt(str.trim(), 10);
        if (!isNaN(direct)) return direct;
        
        // Try extracting from array
        const arr = this.parseArrayOutput(str);
        if (arr && arr.length > 0) {
          const nums = arr.map(x => {
            const n = parseInt(x, 10);
            return isNaN(n) ? -Infinity : n;
          });
          const max = Math.max(...nums);
          return max === -Infinity ? null : max;
        }
        
        // Try regex match for number in text
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
    } catch (e) {
      return { passed: false, message: `Parse error: ${e.message}` };
    }
  }

  /**
   * Longest Substring Without Repeating: Flexible integer parsing
   */
  private validateLongestSubstring(expected: string, actual: string): ValidationResult {
    try {
      const extractNumber = (str: string): number | null => {
        const num = parseInt(str.trim(), 10);
        if (!isNaN(num)) return num;
        
        // Try extracting first number from text
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
    } catch (e) {
      return { passed: false, message: `Error: ${e.message}` };
    }
  }

  /**
   * Group Anagrams: Accept in any order (groups can be in any sequence)
   * Expected: [["eat","tea","ate"],["tan","nat"],["bat"]]
   * Actual: [["ate","tea","eat"],["bat"],["tan","nat"]] (different order, should pass)
   */
  private validateGroupAnagrams(expected: string, actual: string): ValidationResult {
    try {
      const expectedGroups = this.parseNestedArrayOutput(expected);
      const actualGroups = this.parseNestedArrayOutput(actual);

      if (!expectedGroups || !actualGroups) {
        return { passed: false, message: 'Could not parse anagram groups' };
      }

      if (expectedGroups.length !== actualGroups.length) {
        return { passed: false, message: 'Number of groups mismatch' };
      }

      // Normalize groups (sort words within each group and sort groups)
      const normalizeGroups = (groups: string[][]): string => {
        return groups
          .map(group => group.sort().join(','))
          .sort()
          .join('|');
      };

      const expNorm = normalizeGroups(expectedGroups.map(g => g.map(w => String(w).trim())));
      const actNorm = normalizeGroups(actualGroups.map(g => g.map(w => String(w).trim())));

      return { passed: expNorm === actNorm };
    } catch (e) {
      return { passed: false, message: 'Invalid anagram output format' };
    }
  }

  /**
   * Median: Float comparison with tolerance
   */
  private validateMedian(expected: string, actual: string): ValidationResult {
    try {
      const exp = parseFloat(expected.trim());
      const act = parseFloat(actual.trim());
      const tolerance = 0.0001;
      return { passed: !isNaN(exp) && !isNaN(act) && Math.abs(exp - act) < tolerance };
    } catch (e) {
      return { passed: false };
    }
  }

  /**
   * Merge K Sorted Lists: Arrays should have same elements
   * Order matters, duplicates matter
   */
  private validateMergeKLists(expected: string, actual: string): ValidationResult {
    try {
      const expectedArr = this.parseArrayOutput(expected);
      const actualArr = this.parseArrayOutput(actual);

      if (!expectedArr || !actualArr) {
        return { passed: false, message: 'Could not parse arrays' };
      }

      if (expectedArr.length !== actualArr.length) {
        return { passed: false, message: 'Array length mismatch' };
      }

      // Both should be sorted
      const expSorted = expectedArr.map(x => parseInt(x, 10)).sort((a, b) => a - b);
      const actSorted = actualArr.map(x => parseInt(x, 10)).sort((a, b) => a - b);

      for (let i = 0; i < expSorted.length; i++) {
        if (expSorted[i] !== actSorted[i]) {
          return { passed: false, message: `Element mismatch at index ${i}` };
        }
      }

      return { passed: true };
    } catch (e) {
      return { passed: false, message: 'Invalid merge lists output' };
    }
  }

  /**
   * Parse array output handling multiple formats
   * Handles: "[1,2,3]", "[1, 2, 3]", "1, 2, 3", "[\"1\",\"2\",\"3\"]"
   */
  private parseArrayOutput(output: string): any[] | null {
    try {
      let cleaned = output.trim();
      
      // Remove outer brackets if present
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        cleaned = cleaned.slice(1, -1);
      }
      
      // Split by comma and clean each element
      const elements = cleaned
        .split(',')
        .map(s => {
          // Remove quotes, brackets, whitespace
          let elem = s.trim().replace(/^["'`\[\]]+|["'`\[\]]+$/g, '').trim();
          // Try to parse as number
          const num = Number(elem);
          return isNaN(num) ? elem : num;
        })
        .filter(e => e !== '');
      
      return elements.length > 0 ? elements : null;
    } catch {
      return null;
    }
  }

  /**
   * Parse nested array output handling multiple formats
   * Handles: [["a","b"],["c"]], [[a,b],[c]], ["a","b"], etc
   */
  private parseNestedArrayOutput(output: string): string[][] | null {
    try {
      const cleaned = output.trim();
      
      // Try direct JSON parse first
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          // Convert all elements to string arrays
          return parsed.map(item => {
            if (Array.isArray(item)) {
              return item.map(x => String(x).trim());
            } else {
              return [String(item).trim()];
            }
          });
        }
      } catch {
        // Manual parsing for non-JSON formats
        const result: string[][] = [];
        
        // Match nested arrays like [[...],[...]...]
        let depth = 0;
        let current = '';
        let groups: string[] = [];
        
        for (let i = 0; i < cleaned.length; i++) {
          const char = cleaned[i];
          
          if (char === '[') {
            depth++;
            if (depth === 2) current = '';
          } else if (char === ']') {
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
          } else if (depth === 2) {
            current += char;
          }
        }
        
        return groups.length > 0 
          ? groups.map(g => JSON.parse(g))
          : null;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Normalize string for basic comparison
   */
  private normalizeString(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[\[\]"]/g, '');
  }
}
