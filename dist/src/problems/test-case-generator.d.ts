import { TestCase } from './problems.service';
export interface TestCaseGeneratorConfig {
    type: 'two-sum' | 'reverse-string' | 'fizzbuzz' | 'palindrome' | 'fibonacci' | 'find-max' | 'longest-substring' | 'group-anagrams' | 'median' | 'merge-lists';
    seed: number;
}
export declare class TestCaseGenerator {
    static generateTestCases(config: TestCaseGeneratorConfig): TestCase[];
    private static seededRandom;
    private static generateTwoSumTestCases;
    private static generateReverseStringTestCases;
    private static generateFizzBuzzTestCases;
    private static generatePalindromeTestCases;
    private static generateFibonacciTestCases;
    private static generateFindMaxTestCases;
    private static generateLongestSubstringTestCases;
    private static generateGroupAnagramsTestCases;
    private static generateMedianTestCases;
    private static generateMergeListsTestCases;
}
