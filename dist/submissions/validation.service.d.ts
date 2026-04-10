export interface ValidationResult {
    passed: boolean;
    message?: string;
}
export declare class ValidationService {
    validateOutput(problemId: string, input: string, expectedOutput: string, actualOutput: string): ValidationResult;
    private validateTwoSum;
    private validateReverseString;
    private validateFizzBuzz;
    private validatePalindrome;
    private validateFibonacci;
    private validateFindMax;
    private validateLongestSubstring;
    private validateGroupAnagrams;
    private validateMedian;
    private validateMergeKLists;
    private parseArrayOutput;
    private parseNestedArrayOutput;
    private normalizeString;
}
