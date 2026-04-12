import { Injectable } from '@nestjs/common';

export interface CodeReviewResult {
  overallScore: number;
  qualityRating: 'excellent' | 'good' | 'fair' | 'poor';
  complexity: {
    score: number;
    feedback: string;
  };
  readability: {
    score: number;
    feedback: string;
  };
  efficiency: {
    score: number;
    feedback: string;
    timeComplexity?: string;
    spaceComplexity?: string;
  };
  bestPractices: {
    score: number;
    feedback: string;
    violations: string[];
  };
  security: {
    score: number;
    issues: string[];
  };
  suggestions: string[];
  timestamp: Date;
}

@Injectable()
export class CodeReviewService {
  
  analyzeCode(code: string, language: string): CodeReviewResult {
    const review: CodeReviewResult = {
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

    // Calculate overall score (0-100)
    const scores = [
      review.complexity.score,
      review.readability.score,
      review.efficiency.score,
      review.bestPractices.score,
      review.security.score
    ];
    review.overallScore = Math.round(scores.reduce((a, b) => a + b) / scores.length);

    // Determine quality rating
    if (review.overallScore >= 80) review.qualityRating = 'excellent';
    else if (review.overallScore >= 60) review.qualityRating = 'good';
    else if (review.overallScore >= 40) review.qualityRating = 'fair';
    else review.qualityRating = 'poor';

    return review;
  }

  private analyzeComplexity(code: string, language: string): { score: number; feedback: string } {
    let score = 80;
    let feedback = 'Good complexity handling';

    // Check for excessive nesting
    const nestingLevels = this.countMaxNestingLevels(code);
    if (nestingLevels > 4) {
      score -= 15;
      feedback = `High nesting depth detected (${nestingLevels} levels). Consider refactoring into separate functions.`;
    }

    // Check for function length
    const functions = this.extractFunctions(code, language);
    const longFunctions = functions.filter(f => f.lines > 50).length;
    if (longFunctions > 0) {
      score -= 10;
      feedback += ` Found ${longFunctions} function(s) over 50 lines. Consider breaking them down.`;
    }

    return { score: Math.max(0, score), feedback };
  }

  private analyzeReadability(code: string, language: string): { score: number; feedback: string } {
    let score = 85;
    let feedback = 'Code is readable';
    const issues: string[] = [];

    // Check for meaningful variable names
    const shortVarCount = (code.match(/\b[a-z]\b/g) || []).length;
    if (shortVarCount > 5) {
      score -= 15;
      issues.push('Multiple single-letter variable names detected. Use descriptive names.');
    }

    // Check for comments
    const commentRatio = (code.match(/\/\/|\/\*|\*\//g) || []).length / code.split('\n').length;
    if (commentRatio < 0.05) {
      score -= 10;
      issues.push('Low comment coverage. Add comments for complex logic.');
    }

    // Check for consistent spacing
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

  private analyzeEfficiency(code: string, language: string): { score: number; feedback: string; timeComplexity?: string; spaceComplexity?: string } {
    let score = 75;
    let feedback = 'Efficiency is acceptable';
    const issues: string[] = [];

    // Check for obvious inefficiencies
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

  private analyzeBestPractices(code: string, language: string): { score: number; feedback: string; violations: string[] } {
    let score = 80;
    const violations: string[] = [];

    // Check for error handling
    if (language === 'javascript' || language === 'python') {
      if (!code.includes('try') && !code.includes('except') && !code.includes('catch')) {
        violations.push('No error handling detected. Add try-catch blocks.');
        score -= 10;
      }
    }

    // Check for unused variables
    const unusedVars = this.findUnusedVariables(code, language);
    if (unusedVars.length > 0) {
      violations.push(`Unused variables detected: ${unusedVars.join(', ')}`);
      score -= 5;
    }

    // Check for magic numbers
    const magicNumbers = (code.match(/\b\d{2,}\b/g) || []).length;
    if (magicNumbers > 3) {
      violations.push(`Magic numbers detected. Use named constants instead.`);
      score -= 10;
    }

    // Check DRY principle
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

  private analyzeSecurityIssues(code: string, language: string): { score: number; issues: string[] } {
    let score = 95;
    const issues: string[] = [];

    // Check for SQL injection risks
    if (code.includes('query') && code.includes('+') && code.includes('$')) {
      issues.push('Potential SQL injection risk. Use parameterized queries.');
      score -= 20;
    }

    // Check for hardcoded credentials
    if (code.match(/password\s*=|secret\s*=|api_key\s*=/i)) {
      issues.push('Hardcoded credentials detected. Use environment variables.');
      score -= 25;
    }

    // Check for eval usage (if applicable)
    if (code.includes('eval(') || code.includes('exec(')) {
      issues.push('Dangerous eval() usage detected. Avoid using eval().');
      score -= 30;
    }

    // Check for input validation
    if (code.includes('input(') || code.includes('readline')) {
      if (!code.includes('validate') && !code.includes('sanitize')) {
        issues.push('User input detected without validation. Add input sanitization.');
        score -= 15;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  // Helper methods
  private countMaxNestingLevels(code: string): number {
    let maxLevel = 0;
    let currentLevel = 0;
    for (const char of code) {
      if (char === '{' || char === '(') currentLevel++;
      else if (char === '}' || char === ')') currentLevel--;
      maxLevel = Math.max(maxLevel, currentLevel);
    }
    return maxLevel;
  }

  private extractFunctions(code: string, language: string): Array<{ name: string; lines: number }> {
    const functions: Array<{ name: string; lines: number }> = [];
    const lines = code.split('\n');
    let inFunction = false;
    let functionLines = 0;

    for (const line of lines) {
      if (line.includes('function ') || line.includes('def ') || line.includes('public ')) {
        inFunction = true;
        functionLines = 0;
      } else if (inFunction) {
        functionLines++;
        if (line.includes('}') || (line.trim() === '' && functionLines > 10)) {
          functions.push({ name: 'function', lines: functionLines });
          inFunction = false;
        }
      }
    }

    return functions;
  }

  private findUnusedVariables(code: string, language: string): string[] {
    const unused: string[] = [];
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

  private findDuplicatePatterns(code: string): number {
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
}
