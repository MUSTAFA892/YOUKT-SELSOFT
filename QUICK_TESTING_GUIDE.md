# Quick Testing Guide

## Before You Start

Make sure you have:
- Backend running: `npm run dev` in root or `/src`
- Frontend running: `npm run dev` in `/youkt-frontend`
- Browser open to `http://localhost:3000`

---

## Test 1: Simple Solution Passes

**Goal:** Verify that simple, correct solutions pass test cases

### Two Sum Problem

**Step 1:** Navigate to a Two Sum problem (usually Problem 1)

**Step 2:** Use Hash Map Approach
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

**Expected Result:** ✅ All tests pass

**Step 3:** Same problem, different approach (Two Pointer)
```javascript
function twoSum(nums, target) {
    // Note: For this to work correctly, you'd need to track original indices
    // But showing the concept
    let left = 0, right = nums.length - 1;
    while (left < right) {
        const sum = nums[left] + nums[right];
        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return [];
}
```

**Expected Result:** ✅ All tests pass (different algorithm, but validator accepts logical correctness)

---

## Test 2: Time Enforcement

**Goal:** Verify that timer stops editing and auto-submits

### Setup
1. Load any Easy problem
2. Note the time limit (usually 10-15 minutes for easy)

### Execution
**Option A: Wait for actual timeout**
- Wait for timer to reach 0:00
- Watch for "Time's up!" banner
- Observe editor becomes red/disabled
- See auto-submit trigger

**Option B: Simulate for testing (manual)**
1. Click "Run Code" with partial code
2. Let time run down naturally
3. Should see:
   - Timer turns RED
   - Banner appears: "Time's up! The editor is now read-only."
   - Editor shows read-only overlay
   - Code auto-submits if present

### Expected Behavior

| When | Before Timeout | At Timeout | After Timeout |
|------|---|---|---|
| Typing | ✅ Works | ✅ Works | ❌ Can't type |
| Timer Color | 🟢 Green | 🟡 Amber | 🔴 Red |
| Button | "Run Code" | Still "Run Code" | "Submitted" |
| Editor | Editable | Still editable | Read-only + overlay |
| Banner | None | "Time's up!" | "Time's up!" |

---

## Test 3: Different Solutions, Different Languages

**Goal:** Verify multiple language support with flexible validation

### Python FizzBuzz
```python
def fizzBuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result
```
**Expected:** ✅ All tests pass

### JavaScript FizzBuzz (Functional)
```javascript
const fizzBuzz = (n) => 
  Array.from({length: n}, (_, i) => {
    const num = i + 1;
    if (num % 15 === 0) return 'FizzBuzz';
    if (num % 3 === 0) return 'Fizz';
    if (num % 5 === 0) return 'Buzz';
    return String(num);
  });
```
**Expected:** ✅ All tests pass (different approach, validator accepts both)

### Java FizzBuzz
```java
public class Solution {
    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            String output = "";
            if (i % 15 == 0) output = "FizzBuzz";
            else if (i % 3 == 0) output = "Fizz";
            else if (i % 5 == 0) output = "Buzz";
            else output = String.valueOf(i);
            System.out.println(output);
        }
    }
}
```
**Expected:** ✅ All tests pass (Java compilation works)

---

## Test 4: Hardcoded Solution Fails (Anti-Cheating)

**Goal:** Verify that hardcoded answers fail on hidden test cases

### Visible Test Cases (what student sees)
```
Example 1: [2,7,11,15] → 9 → [0,1]
Example 2: [3,2,4] → 6 → [1,2]
```

### Hardcoded Solution
```javascript
function twoSum(nums, target) {
    if (JSON.stringify(nums) === JSON.stringify([2, 7, 11, 15]) && target === 9) {
        return [0, 1];
    }
    if (JSON.stringify(nums) === JSON.stringify([3, 2, 4]) && target === 6) {
        return [1, 2];
    }
    // Generic fallback (wrong algorithm)
    return [0, 1];
}
```

### What Happens
1. Submits code
2. **Visible test cases:** ✅ Pass (hardcoded values match)
3. **Hidden test cases:** ❌ Fail (hardcoded values don't match, generic fallback returns wrong answer)
4. **Result:** ❌ 2/5 passed (assuming 2 visible + 3 hidden)

**Expected Result:** ❌ Rejected

---

## Test 5: Performance-Based Routing

**Goal:** Verify next problem selection based on performance

### Scenario A: Fast & Perfect (Should get harder problem)
1. Solve problem in **40% of time limit** with **all tests passing**
2. See feedback: "Great performance! Time spent: 40%"
3. Click "Continue to Next Problem"
4. Check next problem: Should be **harder** (if current is Easy, next is Medium)

### Scenario B: Normal & Perfect (Should get same difficulty)
1. Solve problem in **85% of time limit** with **all tests passing**
2. See feedback: "Good work! Time spent: 85%"
3. Click "Continue to Next Problem"
4. Check next problem: Should be **same difficulty**

### Scenario C: Slow or Partial (Should get same or easier)
1. Solve problem in **110% of time limit** OR **fail some tests**
2. See feedback: "Keep practicing!" or "Nice effort!"
3. Click "Continue to Next Problem"
4. Check next problem: Should be **same difficulty** or **easier**

---

## Test 6: Session Uniqueness

**Goal:** Verify that each session gets unique test cases

### Setup
1. Track problem IDs and visible test cases
2. Same user: Load Problem 1 twice (refresh page)
3. Different user: Load Problem 1

### Expected Results
- **Same user, same session:** Same visible test cases (because sessionId is same)
- **Same user, different session:** **Different** visible test cases (different seed)
- **Different user:** Different visible test cases (different sessionId, different seed)

### Verification
1. Load `/problems/1` → See test case: `[2,7,11,15] → 9`
2. Refresh page
3. Page loads again → See test case: `[3,2,4] → 6` (DIFFERENT, new session created!)
4. This proves sessions are unique per load

---

## Test 7: Console Output

**Goal:** Verify correct output formatting and display

### Test Case 1: Python with print()
```python
def reverseString(s):
    print(s[::-1])

reverseString("hello")
```
**Output shown in console:** `olleh` ✅

### Test Case 2: JavaScript with console.log()
```javascript
function reverseString(s) {
    console.log(s.split('').reverse().join(''));
}

reverseString("world");
```
**Output shown:** `dlrow` ✅

### Test Case 3: Java with System.out.println()
```java
public class Solution {
    public static void main(String[] args) {
        String s = "java";
        System.out.println(new StringBuilder(s).reverse().toString());
    }
}
```
**Output shown:** `avaj` ✅

---

## Test 8: Error Handling

**Goal:** Verify error messages are clear and helpful

### Syntax Error
```javascript
function twoSum(nums, target) {
    const map = new Map()  // Missing semicolon or syntax error
    for (let i = 0; i < nums.length; i++) {
        // ...
    }
}
```
**Expected:** ❌ Error message shows syntax error location

### Runtime Error
```javascript
function twoSum(nums, target) {
    return nums.mistake_function();  // Method doesn't exist
}
```
**Expected:** ❌ Error message: "TypeError: nums.mistake_function is not a function"

### Timeout
```javascript
function twoSum(nums, target) {
    while(true) {}  // Infinite loop
}
```
**Expected:** ❌ Error message: "Time limit exceeded (5 seconds). Check for infinite loops."

---

## Test 9: Input Parsing (Edge Cases)

**Goal:** Verify validators handle various input formats

### Two Sum with Negative Numbers
```
Input: "[-1, -2, -3, 5], 2"
Problem: Find indices where nums[i] + nums[j] = 2
Solution: -3 + 5 = 2, so indices 2, 3 or 3, 2
```
**Expected:** ✅ Pass with flexible index validator

### Empty Array/Edge Cases
```
Input: "[], 0"
Expected: "[]"
```
**Expected:** ✅ Error message (no solution exists) or ❌ Fail appropriately

### Large Numbers
```
Input: "[1000000, 2000000, -1000000], 0"
Problem: 1000000 + (-1000000) = 0
```
**Expected:** ✅ Pass (handles large numbers)

---

## Test 10: Concurrent Sessions

**Goal:** Verify multiple users don't interfere

### Setup
1. **User A:** Login as user_a, load Problem 1
2. **User B:** Open new browser/incognito, login as user_b, load Problem 1
3. Both see different test cases (different sessions)
4. User A submits solution → User A's session validated
5. User B submits solution → User B's session validated independently

**Expected:** ✅ No cross-contamination, independent tracking

---

## Debugging Tips

### If Tests Keep Failing

1. **Check console for errors** - Open browser DevTools (F12)
2. **Verify input parsing** - Print/log what your function receives
3. **Test locally** - Run code in Node.js/Python interpreter first
4. **Check output format** - Validators are smart, but ensure correct type (int vs string)

### If Time Enforcement Doesn't Work

1. **Check Timer component** - Verify `isActive` prop is passed correctly
2. **Check timer limit** - Does problem have `timeLimit` field?
3. **Check console** - Frontend errors preventing state update?
4. **Check browser** - Monaco editor might be caching state

### If Validation Fails Unexpectedly

1. **Check problem ID** - Correct problem type being validated?
2. **Check input format** - Does validator expect correct input format?
3. **Check logic** - Manually verify if output should be correct
4. **Check hidden cases** - GenericGPT solution might fail on hidden cases

---

## Performance Benchmarks

### Time to Grade

| Language | Time | Reason |
|----------|------|--------|
| Python | 500-800ms | Interpreter startup |
| JavaScript | 300-500ms | Fast execution |
| Java | 1000-1500ms | Compilation required |
| C | 800-1200ms | GCC compilation |

### Expected Student Metrics

| Metric | Value |
|--------|-------|
| Avg time to solve Easy | 3-8 minutes |
| Avg time to solve Medium | 10-20 minutes |
| Avg time to solve Hard | 25-40 minutes |
| Success rate (day 1) | 40-60% |
| Success rate (after practice) | 80%+ |

---

## Quick Checklist

Run before marking system as "ready":

- [ ] Easy problem solvable with simple approach
- [ ] Different algorithms pass with different outputs
- [ ] Timer reaches 0, editor becomes read-only
- [ ] Auto-submit works when time expires
- [ ] Hardcoded solution fails on hidden cases
- [ ] Performance metrics track time and success
- [ ] Next problem recommendations make sense
- [ ] All 4 languages compile and run
- [ ] Console shows clear error messages
- [ ] Multiple users don't interfere

---

**Happy Testing!** 🚀

If you find issues, check:
1. Browser console for JS errors
2. Backend server logs for NestJS errors
3. Network tab to see API responses
4. Validation logic for specific problem type
