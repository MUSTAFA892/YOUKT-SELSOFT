# Anti-Cheating System: Dynamic Test Cases

## Overview
This system prevents students from simply copying problems and pasting them into AI tools to get solutions. By using **dynamic, session-based test cases**, generic AI-generated code will fail validation.

## How It Works

### 1. **Session-Based Test Case Generation** 
When a student loads a problem:
- A unique session is created per student + problem combination
- Session ID is used as a seed for test case generation
- Test cases are generated **dynamically** each time (not static)

### 2. **Split Visible vs Hidden Test Cases**
```
Total Test Cases Generated
    ↓
    ├── Visible Test Cases (2-3 examples shown to student)
    └── Hidden Test Cases (additional validation cases, not shown)
```

**Visible Cases:** Displayed for understanding the problem format
**Hidden Cases:** Used only during submission validation

### 3. **Validation Flow**
```
Student Writes Code
        ↓
Clicks "Run Code"
        ↓
Backend Receives: { problemId, language, code, sessionId, candidateId }
        ↓
Retrieves ALL test cases (visible + hidden) from session
        ↓
Validates against complete test case set
        ↓
Returns result to student
```

## Anti-Cheating Benefits

### ✅ Prevents Hardcoding
**Before:** Student copies "Two Sum" → Pastes in ChatGPT → Gets generic solution → Hardcodes answer
**After:** Generated test cases are different each session, generic solution fails

### ✅ Blocks AI Solutions
Generic AI solutions won't work because:
- Test cases change per session
- Hidden test cases validate actual logic, not just examples
- Random array sizes and values prevent pattern matching

### ✅ Ensures Learning
Students must understand the algorithm concepts, not just memorize examples

## Implementation Details

### Backend Architecture

#### 1. **TestCaseGenerator** (`src/problems/test-case-generator.ts`)
Generates dynamic test cases using seeded randomization:
```typescript
// Each problem has a generator function
generateTwoSumTestCases(seed) 
generateReverseStringTestCases(seed)
generateFizzBuzzTestCases(seed)
// ... etc
```

**Key Features:**
- Seeded random number generator for consistency
- Generates 3-5 test cases dynamically
- Varies array sizes, string lengths, numeric ranges
- Ensures solution exists (for problems like Two Sum)

#### 2. **ProblemSessionService** (`src/problems/problem-session.service.ts`)
Manages problem sessions:
```typescript
createSession(problemId, candidateId, generatorType)
  ↓ Creates unique sessionId
  ↓ Generates test cases
  ↓ Splits into visible/hidden
  ↓ Stores in memory cache

getValidationTestCases(sessionId) → Returns ALL test cases
getVisibleTestCases(sessionId) → Returns only 2-3 visible cases
```

#### 3. **Enhanced Submissions Service** (`src/submissions/submissions.service.ts`)
```typescript
async runSubmission(dto: SubmissionDto) {
  if (dto.sessionId) {
    // Get hidden + visible test cases
    testCases = this.sessionService.getValidationTestCases(dto.sessionId);
  }
  // Validate against complete set
  // Return results
}
```

### Frontend Architecture

#### 1. **Dynamic Problem Loading**
```typescript
// Fetch with candidateId to trigger session creation
fetchProblem(problemId, candidateId)
  ↓ Returns: { ...problem, sessionId, testCasesPreview }
```

#### 2. **Display Only Examples**
```tsx
// Show only 2-3 preview test cases
displayTestCases = problem.testCasesPreview || problem.examples;

// Alert user about hidden cases
"🔒 Dynamic Test Cases: Additional hidden test cases will validate your solution"
```

#### 3. **Submit with Session Context**
```typescript
submitCode(problemId, language, code, sessionId, candidateId)
  ↓ Backend validates against hidden cases
  ↓ Returns comprehensive results
```

## Example Scenario

### Student Attempt (Cheating Path - Now Blocked)

1. **Load Problem:** "Two Sum"
   - Visible test case: `[2,7,11,15], target=9 → [0,1]`
   - (This is from session seed 12345)

2. **Copy & Paste to ChatGPT:**
   > "Given an array and target, find two numbers... examples: [2,7,11,15], target=9"

3. **ChatGPT Returns Generic Solution:**
   ```javascript
   function twoSum(nums, target) {
     for (let i = 0; i < nums.length; i++) {
       for (let j = i + 1; j < nums.length; j++) {
         if (nums[i] + nums[j] === target) {
           return [i, j];
         }
       }
     }
     return [];
   }
   ```

4. **Submit Code:**
   - ✅ Passes visible examples (luck!)
   - ❌ **FAILS hidden test cases** (different arrays generated with same seed)
   - Reason: Hidden test might be `[1,3,4,6], target=7 → [1,3]` or completely different

### Legitimate Student Attempt (Now Works)

1. **Load Problem:** "Two Sum"
   - Understands: Need to find two indices that sum to target
   - Sees example format

2. **Thinks & Codes Proper Solution:**
   ```javascript
   function twoSum(nums, target) {
     const map = new Map();
     for (let i = 0; i < nums.length; i++) {
       const complement = target - nums[i];
       if (map.has(complement)) {
         return [map.get(complement), i];
       }
       map.set(nums[i], i);
     }
     return [];
   }
   ```

3. **Submit Code:**
   - ✅ Passes visible examples
   - ✅ **PASSES hidden test cases** (correct algorithm works on any input)

## Session Cleanup

Sessions are automatically cleaned up:
- Stored in memory with timestamp
- Sessions older than 1 hour are removed
- Called periodically during problem loads

```typescript
cleanupOldSessions() {
  // Remove sessions older than 1 hour
}
```

## Security Considerations

### ✅ Implemented
- Session IDs are unique: `${candidateId}-${problemId}-${timestamp}`
- Test cases regenerated each session
- Hidden cases never sent to frontend
- Validation happens server-side only

### Future Enhancements
- Persist sessions to database (survive restarts)
- Rate limiting on submission attempts
- Detect patterns in solution syntax/naming
- Flag suspicious rapid submissions
- Time-based complexity analysis

## Problem-Specific Generators

Each problem type has customized test case generation:

### Easy Problems
- **Two Sum:** Random array sizes (3-10), random number ranges (-50 to 50)
- **Reverse String:** Random strings from predefined set, randomized
- **Fibonacci:** Random n values (0-7) mapped to results
- **Find Max:** Random array sizes, random values (-100 to 100)

### Medium Problems  
- **FizzBuzz:** Random n values (5-15)
- **Longest Substring:** Predefined test strings, randomized order
- **Group Anagrams:** Fixed test cases (strings are stable)

### Hard Problems
- **Median:** Fixed test cases (math-based, stable)
- **Merge Lists:** Fixed test cases (algorithm-based, stable)

## Configuration

To adjust anti-cheating behavior:

1. **Change visible test case split:**
   ```typescript
   // In ProblemSessionService.createSession()
   const visibleCount = Math.max(2, Math.min(3, ...));  // Change this
   ```

2. **Adjust test case generation parameters:**
   ```typescript
   // In test-case-generator.ts
   const arraySize = 3 + Math.floor(rand() * 8);  // Change range
   const value = Math.floor(rand() * 100) - 50;   // Change range
   ```

3. **Add new problem types:**
   ```typescript
   // Add generator function in TestCaseGenerator
   private static generateNewProblemTestCases(seed) { ... }
   ```

## Testing

Test the system:

1. **Load problem 3 times** with same candidateId
   - Should see different test cases each time (different sessionId)

2. **Hardcode answer:**
   ```javascript
   // Won't work - hidden cases have different values
   if (testInput === '[2,7,11,15]') return '[0,1]';
   ```

3. **Use generic solution:**
   - ✅ Passes examples
   - ✅ Passes hidden cases (because it's correct)

## Files Modified

- ✅ `src/problems/test-case-generator.ts` - New test generation engine
- ✅ `src/problems/problem-session.service.ts` - New session management
- ✅ `src/problems/problems.module.ts` - Added session service
- ✅ `src/problems/problems.controller.ts` - Updated to use sessions
- ✅ `src/submissions/submissions.service.ts` - Updated to validate against hidden cases
- ✅ `youkt-frontend/src/lib/api.ts` - Updated to pass candidateId & sessionId
- ✅ `youkt-frontend/src/app/problems/[id]/Workspace.tsx` - Updated to display preview cases
- ✅ `youkt-frontend/src/app/problems/[id]/page.tsx` - Updated comment

---

**Result:** ✅ AI-generated generic solutions now fail, students must learn actual algorithms!
