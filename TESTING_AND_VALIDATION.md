# Improved Test Case & Validation System

## Overview

This document explains the improved test case system that makes problems solvable with multiple solution approaches while maintaining anti-cheating protections. The system includes:

1. **Flexible Validation** - Problem-specific validators instead of string comparison
2. **Solvable Test Cases** - Simple, achievable test cases that work with various algorithms
3. **Time Enforcement** - Frontend enforces time limits, disables editor after timeout
4. **Adaptive Routing** - Routes to easier/same difficulty based on performance
5. **Multiple Language Support** - Python, JavaScript, Java, C with platform-specific handling

---

## Key Improvements

### 1. Validation Service (Backend)

**File:** `src/submissions/validation.service.ts`

Instead of string comparison, each problem has a **problem-specific validator** that accepts multiple solution approaches:

#### Two Sum Validator
```typescript
validateTwoSum(input, expected, actual) {
  // Accepts ANY pair of valid indices that sum to target
  // [2,3] and [3,2] are both valid for same pair
  // Different solution approaches accepted: hash map, two pointer, brute force
}
```

#### FizzBuzz Validator
```javascript
validateFizzBuzz(expected, actual) {
  // Accepts various formats: array, list, or any valid sequence
  // Case-insensitive comparison
  // Handles different output formatting
}
```

#### Group Anagrams Validator
```typescript
validateGroupAnagrams(expected, actual) {
  // Accepts groups in ANY order
  // Words within groups in ANY order
  // Multiple valid solutions produce valid outputs
}
```

**Benefit:** Students can solve with different algorithms and still pass:
- Two Sum: HashMap, Two-Pointer, Brute Force → All pass
- Group Anagrams: Sorting approach, Counting approach → All pass
- FizzBuzz: Loop, Recursion, Functional → All pass

---

### 2. Simplified Test Cases

**File:** `src/problems/test-case-generator.ts`

Test cases are now **simpler and more achievable** for easy problems:

#### Before (Complex)
```
Input: [145, 2, 789, -50], Target: -48
Expected: [0, 1] or [1, 0]
Problem: Different working algorithms might find indices differently
```

#### After (Simple)
```
Input: [2, 7, 11, 15], Target: 9
Expected: [0, 1]
Problem: Classic LeetCode example, any working algorithm finds 2+7=9
```

**Examples by Problem:**

| Problem | Test Cases | Difficulty |
|---------|-----------|------------|
| Two Sum | `[2,7,11,15] → 9`, `[3,2,4] → 6`, `[2,5,5,11] → 10` | Easy |
| FizzBuzz | `n=5`, `n=15`, `n=10` | Easy |
| Reverse String | "hello", "world", "racecar" | Easy |
| Fibonacci | f(0)=0, f(1)=1, f(5)=5 | Easy |
| Find Max | Simple arrays with clear max | Easy |
| Longest Substring | "abcabcbb"→3, "bbbbb"→1 | Medium |
| Group Anagrams | Standard examples with anagram groups | Medium |
| Median | Two sorted arrays, simple cases | Hard |
| Merge K Lists | K sorted lists, standard format | Hard |

**Benefits:**
- ✅ Students can solve with ANY valid approach
- ✅ Focus on algorithm learning, not output formatting
- ✅ Reduces frustration from edge cases
- ✅ Still detects cheating with hidden test cases

---

### 3. Time Limit Enforcement (Frontend)

**File:** `youkt-frontend/src/app/problems/[id]/Workspace.tsx`

#### What Happens When Time Expires:

```typescript
onTimeout={() => {
  setTimeExpired(true);           // Flag time as expired
  setIsTimerActive(false);         // Stop timer
  
  // Disable editor - make read-only
  <Editor
    readOnly={timeExpired}
    onChange={(val) => !timeExpired && setCode(val || "")}
  />
  
  // Show warning banner
  {timeExpired && (
    <div className="bg-rose-500/10 text-rose-300">
      Time's up! The editor is now read-only. Your work will be auto-submitted.
    </div>
  )}
  
  // Auto-submit if code exists
  if (code && code.trim().length > 0) {
    runCode(); // Auto-submit after timeout
  }
}}
```

#### User Experience:
1. **Before Timeout:** Normal editing, timer counts down with color changes (green → amber → red)
2. **At Timeout:** 
   - Editor becomes read-only
   - Banner appears: "Time's up! The editor is now read-only."
   - Code auto-submits if present
3. **After Timeout:**
   - Results display
   - Next problem recommendation shown
   - Cannot edit code anymore

**Benefits:**
- ✅ Prevents last-second code additions
- ✅ Clear UI feedback when time expires
- ✅ Auto-submission ensures fair evaluation
- ✅ Proper session tracking for time-based metrics

---

### 4. Adaptive Routing (Backend)

**File:** `src/problems/problems.service.ts`

Routes next problem based on PERFORMANCE, not just difficulty:

```typescript
getNextProblem(currentProblemId, performanceMetrics) {
  const { allPassed, timeRatio } = performanceMetrics;
  
  // Perfect, fast solution
  if (allPassed && timeRatio < 0.8) {
    difficulty = "increase"  // Easy → Medium, Medium → Hard
  }
  
  // Good, normal pace
  else if (allPassed && timeRatio <= 1.0) {
    difficulty = "same"      // Stay at same difficulty
  }
  
  // Struggled or slow
  else {
    difficulty = "same"      // Stay or decrease
  }
  
  // Return random problem of target difficulty
  return getRandomProblem(difficulty);
}
```

#### Examples:

| Scenario | Action |
|----------|--------|
| Solved in 30sec, limit 60sec (50% of time) | → Next: Harder |
| Solved in 50sec, limit 60sec (83% of time) | → Next: Same |
| Solved in 80sec, limit 60sec (133% of time) | → Next: Same or Easier |
| Failed 1-2 tests | → Next: Same |

---

### 5. Hidden Test Case System (Anti-Cheating)

**Still Active:** Dynamic test cases generated per session

```typescript
// What student sees (2-3 visible cases)
testCasesPreview: [
  { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
  { input: "[3,2,4], 6", expectedOutput: "[1,2]" }
]

// What backend validates (all cases including hidden)
validationTestCases: [
  { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
  { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
  { input: "[2,5,5,11], 10", expectedOutput: "[1,2]" },  // Hidden
  // ... more hidden cases
]
```

**How It Prevents Cheating:**
1. Student sees 2-3 example cases
2. Student copies problem to ChatGPT with visible examples
3. ChatGPT generates generic solution that passes visible cases
4. Student submits code
5. Backend validates against ALL cases (visible + hidden)
6. **Generic solution fails on hidden cases!**

---

## Implementation Details

### Backend Flow

```
1. Student loads problem
   ↓ GET /api/problems/1?candidateId=user123
   
2. Backend creates session
   ├─ Generates all test cases (visible + hidden)
   ├─ Splits: testCasesPreview (2-3), hiddenTestCases (3-4)
   └─ Returns session with only preview cases
   
3. Student codes and submits
   ↓ POST /api/submissions { code, sessionId, ... }
   
4. Backend validates
   ├─ Retrieves session
   ├─ Gets ALL test cases (visible + hidden)
   ├─ Uses problem-specific validators
   ├─ Compares output logically (not string compare)
   └─ Returns results

5. If all tests pass
   └─ Auto-submit next problem recommendation
```

### Frontend Flow

```
1. LoadProblem with session
   ├─ Fetch from backend
   ├─ Display testCasesPreview (2-3 visible cases)
   └─ Store sessionId for later submission

2. Student codes
   ├─ Monaco editor with selected language
   ├─ Timer counts down with visual feedback
   ├─ Can edit until time expires
   └─ Read-only after timeout

3. Submit code
   ├─ Pass sessionId and candidateId
   ├─ Show loading spinner
   └─ Display results

4. On success
   ├─ Stop timer
   ├─ Fetch next problem
   ├─ Show performance feedback
   └─ Offer route to next problem
```

---

## Validation Examples

### Two Sum

**Student Solution A (Hash Map Approach):**
```python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

**Student Solution B (Two Pointer Approach):**
```python
def twoSum(nums, target):
    # Sort with indices
    sorted_nums = sorted(enumerate(nums), key=lambda x: x[1])
    left, right = 0, len(sorted_nums) - 1
    while left < right:
        total = sorted_nums[left][1] + sorted_nums[right][1]
        if total == target:
            return sorted(
                [sorted_nums[left][0], sorted_nums[right][0]]
            )
        elif total < target:
            left += 1
        else:
            right -= 1
    return []
```

**Validator Output:**
- Both solutions: ✅ PASS
- Reason: Validator checks if indices are valid, not if they match expected order
- Hidden cases also pass because algorithm is correct

### Generic ChatGPT Solution (Fails Hidden Tests)

**ChatGPT Output for "Find Two Numbers That Sum" with only visible case [2,7,11,15] → 9:**
```python
def twoSum(nums, target):
    # Hardcoded answer from visible example
    if nums == [2, 7, 11, 15]:
        return [0, 1]  # Hardcoded!
    
    # Generic fallback (wrong)
    for i in range(len(nums)):
        if nums[i] == target:
            return [i]
    return []
```

**Validation:**
- Visible cases: ✅ PASS (hardcoded)
- Hidden case `[3,2,4] → 6`: ❌ FAIL (not hardcoded)
- **Result: Rejected**

---

## Configuration & Customization

### Adjust Time Limits

**File:** `src/problems/problems.service.ts`

```typescript
const problems: Problem[] = [
  {
    id: "1",
    title: "Two Sum",
    timeLimit: 900,        // 15 minutes (in seconds)
    difficulty: "Easy",
    // ...
  },
  {
    id: "3",
    title: "FizzBuzz",
    timeLimit: 600,        // 10 minutes
    difficulty: "Easy",
    // ...
  }
];
```

### Adjust Test Case Count

**File:** `src/problems/problem-session.service.ts`

```typescript
createSession(problemId, candidateId) {
  const allTestCases = generateTestCases(...);
  
  // Currently: 2-3 visible, rest hidden
  const visibleCount = 2;
  const visibleTestCases = allTestCases.slice(0, visibleCount);
  const hiddenTestCases = allTestCases.slice(visibleCount);
  
  // To change: adjust visibleCount
}
```

### Add Custom Validator

**File:** `src/submissions/validation.service.ts`

```typescript
validateOutput(problemId, input, expected, actual) {
  switch (problemId) {
    case 'my-custom-problem':
      return this.validateCustom(expected, actual);
    // ...
  }
}

private validateCustom(expected, actual): ValidationResult {
  // Your custom logic here
  // Must return: { passed: boolean, message?: string }
}
```

---

## Testing Checklist

- [ ] **Easy Problems:** Solve with 2-3 different approaches, all pass
- [ ] **Time Limit:** Editor becomes read-only when time expires
- [ ] **Auto-Submit:** Code submits automatically after timeout
- [ ] **Adaptive Routing:**
  - Fast solve (< 80% time) → harder problem
  - Normal solve (80-100% time) → same difficulty
  - Slow solve (> 100% time) → same or easier
- [ ] **Anti-Cheating:** Hardcoded solutions fail hidden tests
- [ ] **Multiple Languages:** Python, JavaScript, Java, C all validated correctly
- [ ] **Performance Feedback:** Shows time spent, test results, next problem recommendation

---

## Performance Metrics

**Expected Validation Times:**
- Python: ~500-800ms (interpreter startup overhead)
- JavaScript: ~300-500ms (Node.js execution)
- Java: ~1000-1500ms (compilation time)
- C: ~800-1200ms (gcc compilation)

**Memory Usage:**
- Session Service: ~2-5KB per active session
- Cleanup runs every 60 minutes, removes sessions > 1 hour old

---

## Future Enhancements

1. **Database Persistence** - Move sessions from in-memory to Redis/MongoDB
2. **Difficulty Adjustment** - ML-based routing instead of algorithm-based
3. **Hint System** - Progressive hints that unlock after time spent
4. **Code Review** - AI-powered feedback on code quality
5. **Collaborative Problems** - Pair programming problems with shared sessions
6. **Problem Analytics** - Track which problems cause most struggles
7. **Plagiarism Detection** - Compare code across students for similarities

---

## Support & Troubleshooting

### Issue: Tests keep failing but code looks correct

**Solution:** Check the validation logic for your problem. Run with simplified test case first.

### Issue: Time runs out but code isn't auto-submitting

**Solution:** 
- Check browser console for errors
- Ensure code is not empty
- Verify `onTimeout` callback is firing

### Issue: Same test cases appearing for all students

**Solution:** Sessions are per-candidate-problem pair, so same seed = same cases by design. This is intentional for fair comparison.

### Issue: Generic AI solutions passing hidden tests

**Solution:** This shouldn't happen if hidden test cases have good coverage. Add more diverse hidden cases or enable stricter validators.

---

**Last Updated:** April 8, 2026  
**Version:** 2.0 - Improved Flexibility & Time Enforcement
