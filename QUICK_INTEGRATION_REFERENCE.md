# Quick Integration Reference

Fast-track guide to integrate the 4 new features into your existing pages.

---

## 📌 Quick Links to Features

| Feature | Backend | API | Frontend | Integration Point |
|---------|---------|-----|----------|-------------------|
| AI Code Review | `src/code-review/` | POST `/code-review` | `CodeReviewPanel.tsx` | After code submission |
| Plagiarism Detection | `src/plagiarism/` | POST `/plagiarism/check` | `PlagiarismDetectionPanel.tsx` | After code submission |
| Adaptive Difficulty | `src/adaptive-difficulty/` | GET/POST `/adaptive-difficulty/*` | `AdaptiveDifficultyPanel.tsx` | Progress/results page |
| Question Library | `src/question-library/` | GET `/questions/*` | `QuestionLibraryBrowser.tsx` | Recruiter portal |

---

## 🔧 Integration Steps

### Step 1: Import Components

```typescript
// In your page files:
import CodeReviewPanel from '@/components/CodeReviewPanel';
import PlagiarismDetectionPanel from '@/components/PlagiarismDetectionPanel';
import AdaptiveDifficultyPanel from '@/components/AdaptiveDifficultyPanel';
// For recruiter portal:
import QuestionLibraryBrowser from '@/components/QuestionLibraryBrowser';
```

### Step 2: Add to Your Pages

#### Candidate Interview Page
```typescript
// youkt-frontend/src/app/interview/[id]/page.tsx

import CodeReviewPanel from '@/components/CodeReviewPanel';
import PlagiarismDetectionPanel from '@/components/PlagiarismDetectionPanel';

export default function InterviewPage() {
  const [submittedCode, setSubmittedCode] = useState('');
  
  return (
    <div>
      {/* Existing IDE or code editor */}
      <CodeEditor onSubmit={(code) => setSubmittedCode(code)} />
      
      {/* New: Code Review */}
      {submittedCode && (
        <CodeReviewPanel 
          code={submittedCode}
          language="python"
          onReview={(review) => console.log(review)}
        />
      )}
      
      {/* New: Plagiarism Check */}
      {submittedCode && (
        <PlagiarismDetectionPanel 
          code={submittedCode}
          candidateId={candidateId}
          interviewId={interviewId}
          onCheck={(report) => console.log(report)}
        />
      )}
    </div>
  );
}
```

#### Candidate Progress Page
```typescript
// youkt-frontend/src/app/progress/page.tsx

import AdaptiveDifficultyPanel from '@/components/AdaptiveDifficultyPanel';

export default function ProgressPage() {
  return (
    <div>
      {/* Existing stats and charts */}
      
      {/* New: Adaptive Difficulty Recommendation */}
      <AdaptiveDifficultyPanel 
        candidateId={candidateId}
        currentDifficulty={currentDifficulty}
        onDifficultyChange={(newDiff) => {
          // Update selected difficulty
          setCurrentDifficulty(newDiff);
          // Load new problems
          loadProblemsForDifficulty(newDiff);
        }}
      />
    </div>
  );
}
```

#### Recruiter Portal - Create Interview
```typescript
// recruiter-frontend/src/app/create-interview/page.tsx

import QuestionLibraryBrowser from '@/components/QuestionLibraryBrowser';

export default function CreateInterviewPage() {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  
  return (
    <div>
      <h1>Create New Interview</h1>
      
      {/* New: Question Library Browser */}
      <QuestionLibraryBrowser 
        userId={recruiterId}
        onSelectQuestion={(question) => {
          setSelectedQuestions([...selectedQuestions, question]);
          // Add to interview form
        }}
      />
      
      {/* Show selected questions */}
      <div>
        <h2>Selected Questions ({selectedQuestions.length})</h2>
        {selectedQuestions.map(q => (
          <div key={q.id}>
            <p>{q.title} - {q.difficulty}</p>
            <button onClick={() => removeQuestion(q.id)}>Remove</button>
          </div>
        ))}
      </div>
      
      <button onClick={() => createInterview(selectedQuestions)}>
        Create Interview
      </button>
    </div>
  );
}
```

### Step 3: Handle API Calls

```typescript
// In your submission handler:

async function handleCodeSubmission(code, language) {
  const submissionId = generateId();
  
  // 1. Get code review
  const reviewRes = await fetch('/api/advanced-features/code-review', {
    method: 'POST',
    body: JSON.stringify({ code, language })
  });
  const review = await reviewRes.json();
  
  // 2. Check plagiarism
  const plagiarismRes = await fetch('/api/advanced-features/plagiarism/check', {
    method: 'POST',
    body: JSON.stringify({ 
      code, 
      candidateId: 'c1',
      interviewId: 'iv_123',
      submissionId 
    })
  });
  const plagiarism = await plagiarismRes.json();
  
  // 3. Record attempt for adaptive difficulty
  if (testsPassed) {
    await fetch('/api/advanced-features/adaptive-difficulty/record-attempt', {
      method: 'POST',
      body: JSON.stringify({
        candidateId: 'c1',
        problemDifficulty: currentDifficulty,
        accuracy: testPassRate,
        timeTaken: elapsedSeconds,
        solved: true
      })
    });
  }
  
  // 4. Display results
  return {
    review: review.data,
    plagiarism: plagiarism.data,
  };
}
```

---

## 📊 API Usage Examples

### Code Review API

```bash
# Request
curl -X POST http://localhost:3001/api/advanced-features/code-review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def foo(x):\n    return x * 2",
    "language": "python"
  }'

# Response
{
  "overallScore": 78,
  "qualityRating": "good",
  "complexity": { "score": 85, "feedback": "Good complexity" },
  "readability": { "score": 80, "feedback": "Readable code" },
  "efficiency": { "score": 70, "feedback": "Could optimize" },
  "bestPractices": { "score": 75, "feedback": "Good" },
  "security": { "score": 90, "feedback": "Secure" },
  "suggestions": ["Add type hints", "Add docstring"]
}
```

### Plagiarism Detection API

```bash
# Request
curl -X POST http://localhost:3001/api/advanced-features/plagiarism/check \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function twoSum(nums, target) { ... }",
    "candidateId": "c1",
    "interviewId": "iv_123",
    "submissionId": "sub_123"
  }'

# Response
{
  "overallSimilarity": 45,
  "riskLevel": "medium",
  "matches": [
    {
      "candidateId": "c3",
      "similarity": 45,
      "matchedLines": [...]
    }
  ]
}
```

### Adaptive Difficulty API

```bash
# Record attempt
curl -X POST http://localhost:3001/api/advanced-features/adaptive-difficulty/record-attempt \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "c1",
    "problemDifficulty": "medium",
    "accuracy": 85,
    "timeTaken": 32,
    "solved": true
  }'

# Get prediction
curl http://localhost:3001/api/advanced-features/adaptive-difficulty/predict/c1/medium

# Response
{
  "currentDifficulty": "medium",
  "recommendedDifficulty": "hard",
  "confidenceScore": 0.82,
  "reasoning": "Success rate 75%, accuracy 88% - ready for harder problems",
  "metrics": {
    "successRate": 0.75,
    "avgAccuracy": 0.88,
    "problemsSolved": 12
  }
}
```

### Question Library API

```bash
# Get all questions
curl http://localhost:3001/api/advanced-features/questions/all

# Search
curl "http://localhost:3001/api/advanced-features/questions/search?q=two%20sum"

# By difficulty
curl http://localhost:3001/api/advanced-features/questions/difficulty/medium

# By topic
curl http://localhost:3001/api/advanced-features/questions/topic/array

# Get packs
curl http://localhost:3001/api/advanced-features/packs/all

# Add favorite
curl -X POST http://localhost:3001/api/advanced-features/questions/add-favorite \
  -H "Content-Type: application/json" \
  -d '{ "userId": "recruiter1", "questionId": "q_two_sum" }'
```

---

## 🎯 Common Integration Patterns

### Pattern 1: Show Review After Test Passes

```typescript
const [showReview, setShowReview] = useState(false);

async function submitCode(code) {
  const testResult = await runTests(code);
  if (testResult.allPassed) {
    setShowReview(true);
  }
}

return (
  <>
    <CodeEditor />
    {showReview && <CodeReviewPanel code={code} language="python" />}
  </>
);
```

### Pattern 2: Auto-Check Plagiarism on Submit

```typescript
async function handleSubmit(code) {
  // Immediately check plagiarism - don't wait for user
  const plagiarismReport = await fetch('/api/advanced-features/plagiarism/check', {
    method: 'POST',
    body: JSON.stringify({ 
      code, 
      candidateId, 
      interviewId 
    })
  });
  
  // Save report to database
  await saveSubmission({
    code,
    plagiarismReport,
    timestamp: new Date()
  });
}
```

### Pattern 3: Conditional Difficulty Adjustment

```typescript
// After each problem completion
async function recordAttempt(success, accuracy, time) {
  await fetch('/api/advanced-features/adaptive-difficulty/record-attempt', {
    method: 'POST',
    body: JSON.stringify({
      candidateId,
      problemDifficulty: currentDifficulty,
      accuracy,
      timeTaken: time,
      solved: success
    })
  });
  
  // Get new recommendation
  const prediction = await fetch(
    `/api/advanced-features/adaptive-difficulty/predict/${candidateId}/${currentDifficulty}`
  ).then(r => r.json());
  
  // Auto-adjust if confident
  if (prediction.confidenceScore > 0.80) {
    setCurrentDifficulty(prediction.recommendedDifficulty);
  }
}
```

### Pattern 4: Filter Questions by Recommended Difficulty

```typescript
async function loadRecommendedQuestions() {
  // Get current recommendation
  const prediction = await fetch(
    `/api/advanced-features/adaptive-difficulty/predict/${candidateId}/${currentDifficulty}`
  ).then(r => r.json());
  
  // Load questions at that difficulty
  const questions = await fetch(
    `/api/advanced-features/questions/difficulty/${prediction.recommendedDifficulty}`
  ).then(r => r.json());
  
  return questions.data;
}
```

---

## 🐛 Troubleshooting

### Issue: Components not rendering
**Solution:** Ensure all imports are correct and dependencies are installed

### Issue: API returns 404
**Solution:** Make sure AdvancedFeaturesModule is added to app.module.ts

### Issue: Slow plagiarism check
**Solution:** Reduce `PLAGIARISM_SUBMISSIONS_TO_CHECK` environment variable

### Issue: Code review always returns same score
**Solution:** Ensure CodeReviewService is analyzing code correctly

---

## 📈 Performance Tips

1. **Debounce search** in QuestionLibraryBrowser (already done)
2. **Cache reviews** - store code review results for identical code
3. **Async plagiarism check** - don't block submission for plagiarism results
4. **Limit question results** - paginate library browser results
5. **Pre-load popular questions** - cache trending questions

---

## 🔐 Security Considerations

**When deploying to production:**

1. ✅ Add rate limiting to API endpoints
2. ✅ Sanitize code input to prevent injection
3. ✅ Validate all request parameters
4. ✅ Add authentication checks to all endpoints
5. ✅ Store submissions in database (not memory)
6. ✅ Encrypt sensitive data

---

## 📱 Mobile Responsiveness

All components are mobile-friendly:
- CodeReviewPanel - Responsive grid
- PlagiarismDetectionPanel - Stacked layout
- AdaptiveDifficultyPanel - Vertical layout
- QuestionLibraryBrowser - Mobile-optimized cards

---

## ✅ Testing Checklist

Before deploying:

- [ ] Code review analysis works with all languages
- [ ] Plagiarism detection correctly identifies matches
- [ ] Adaptive difficulty recommends correct levels
- [ ] Question library search works
- [ ] Components render without errors
- [ ] API calls return correct format
- [ ] Error handling works on failures
- [ ] Mobile responsive on all sizes
- [ ] Load times acceptable
- [ ] No console errors

---

## 🚀 Next Steps

1. **Test locally** - Start servers and test each endpoint
2. **Integrate UI** - Add components to your pages
3. **Database** - Migrate from in-memory to persistent storage
4. **Analytics** - Track feature usage metrics
5. **Optimization** - Implement caching and indexing
6. **AI Integration** - Connect GPT-4 for advanced analysis

---

## 📞 API Base URL

**Development:** `http://localhost:3001/api`
**Production:** `https://youkt-api.example.com/api`

All endpoints use REST with JSON request/response format.

---

**Ready to integrate! Questions? Check ADVANCED_FEATURES_USAGE_GUIDE.md for detailed docs.** ✨
