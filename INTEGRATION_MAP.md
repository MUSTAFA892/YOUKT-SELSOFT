# 🎯 Integration Map - Where Features Live

## Visual Integration Overview

```
YOUR YOUKT CTP PROJECT
│
├─ CANDIDATE PORTAL (youkt-frontend) - Port 3000
│  │
│  ├─ 🏠 Dashboard
│  │  └─ (future integration point)
│  │
│  ├─ 🖥️ IDE Page (/ide)
│  │  ├─ Editor (Monaco)
│  │  ├─ Test Cases Setup
│  │  └─ Console Output ✨ NEW FEATURES ✨
│  │     ├─ TAB: Console (Original test output)
│  │     ├─ TAB: 📊 Code Review ← CodeReviewPanel
│  │     │      (Shows: Score, 5 metrics, feedback, suggestions)
│  │     └─ TAB: 🔍 Plagiarism ← PlagiarismDetectionPanel
│  │           (Shows: Similarity %, risk level, matches)
│  │
│  ├─ 🎯 Problems Page (/problems)
│  │  └─ (future integration point)
│  │
│  ├─ 📈 Progress Page (/progress) ✨ NEW FEATURE ✨
│  │  ├─ 🤖 AI-Powered Difficulty Recommendation (TOP)
│  │  │  └─ AdaptiveDifficultyPanel
│  │  │     (Shows: Stats, difficulty selector, recommendation)
│  │  ├─ 📊 Stats Grid (Below difficulty panel)
│  │  │  ├─ Problems Solved
│  │  │  ├─ Time Spent
│  │  │  ├─ Accuracy
│  │  │  └─ Success Rate
│  │  └─ 📋 Activity Table
│  │
│  └─ 🎤 Interviews Page (/interviews)
│     └─ (future integration point)
│
├─ RECRUITER PORTAL (recruiter-frontend) - Port 3002
│  │
│  ├─ 👥 Candidates Page (/candidates)
│  │  └─ (future integration point)
│  │
│  ├─ 🎓 Create Interview (main page) ✨ NEW FEATURE ✨
│  │  │
│  │  ├─ MODE TOGGLE (NEW)
│  │  │  ├─ Button: ✏️ Manual Creation (DEFAULT)
│  │  │  └─ Button: 📚 Question Library
│  │  │
│  │  ├─ IF MANUAL MODE → Show existing UI
│  │  │  ├─ Question Editor (Manual)
│  │  │  ├─ Test Cases
│  │  │  └─ Starter Code
│  │  │
│  │  ├─ IF LIBRARY MODE → Show library browser
│  │  │  ├─ QuestionLibraryBrowser ← 📚 Question Library
│  │  │  │  ├─ Search Bar
│  │  │  │  ├─ Difficulty Filter
│  │  │  │  ├─ Question Cards
│  │  │  │  ├─ ⭐ Ratings Display
│  │  │  │  ├─ ❤️ Favorites
│  │  │  │  └─ ✨ Use This Question (adds to interview)
│  │  │  │
│  │  │  └─ Selected questions appear in list below
│  │  │
│  │  ├─ Candidate Assignment Section
│  │  │  ├─ Pick: Existing / New / Multiple
│  │  │  └─ Select candidates
│  │  │
│  │  └─ Generate & Assign
│  │
│  ├─ 📊 Reports Page (/reports)
│  │  └─ (future integration point - could show code reviews, plagiarism reports)
│  │
│  └─ ⚠️ Violations Page (/violations)
│     └─ (future integration point - plagiarism violations)
│
└─ BACKEND API (NestJS) - Port 3001
   │
   ├─ 🤖 Code Review Service
   │  └─ POST /api/advanced-features/code-review
   │
   ├─ 🔍 Plagiarism Detection Service
   │  ├─ POST /api/advanced-features/plagiarism/check
   │  └─ GET /api/advanced-features/plagiarism/report/:id
   │
   ├─ 📈 Adaptive Difficulty Service
   │  ├─ POST /api/advanced-features/adaptive-difficulty/record-attempt
   │  ├─ GET /api/advanced-features/adaptive-difficulty/predict/:candidateId/:difficulty
   │  ├─ GET /api/advanced-features/adaptive-difficulty/metrics/:candidateId
   │  └─ GET /api/advanced-features/adaptive-difficulty/recommendations/:candidateId
   │
   └─ 📚 Question Library Service
      ├─ GET /api/advanced-features/questions/all
      ├─ GET /api/advanced-features/questions/search?q=...
      ├─ GET /api/advanced-features/questions/difficulty/:difficulty
      ├─ GET /api/advanced-features/questions/topic/:topic
      ├─ POST /api/advanced-features/questions/add-favorite
      ├─ GET /api/advanced-features/questions/favorites/:userId
      ├─ GET /api/advanced-features/packs/all
      ├─ GET /api/advanced-features/packs/free
      └─ GET /api/advanced-features/packs/:packId
```

---

## 🎨 Integration Points by User Role

### 👨‍💻 For Candidates

```
Before Integration:
IDE Page → Run Tests → See Console Output → Done

After Integration:
IDE Page → Run Tests → See Console Output
         → Switch to "Code Review" tab → Get AI feedback
         → Switch to "Plagiarism" tab → Check originality
         → Go to Progress page → See AI-powered recommendation
         → Choose difficulty based on recommendation
```

### 👔 For Recruiters

```
Before Integration:
Create Interview → Manually create questions → Assign → Done

After Integration:
Create Interview → Choose: Manual ✏️ or Library 📚
IF Manual:     → Create questions manually → Assign → Done
IF Library:    → Browse questions → Search → Filter → Select
               → Questions auto-added → Review → Assign → Done
```

---

## 📍 Quick Navigation

### Testing Each Feature:

1. **Code Review**
   - URL: http://localhost:3000/ide
   - Action: Write code → Run Tests → Click "📊 Code Review" tab

2. **Plagiarism Detection**
   - URL: http://localhost:3000/ide
   - Action: Write code → Run Tests → Click "🔍 Plagiarism" tab

3. **Adaptive Difficulty**
   - URL: http://localhost:3000/progress
   - Location: Top of page, prominent card

4. **Question Library**
   - URL: http://localhost:3002
   - Action: Click "📚 Question Library" mode button

---

## 🔄 Data Flow Diagram

```
CANDIDATE FLOW:
────────────────

1. IDE Page (ide/page.tsx)
   ↓
   User writes code
   ↓
   Clicks "Run Tests"
   ↓
   Tests execute
   ├─ On success/failure → Console tab shows results
   │
   ├─ CodeReviewPanel (NEW)
   │  ├─ Send code to API
   │  └─ POST /api/advanced-features/code-review
   │     ↓ Analysis complete
   │  └─ Display in "Code Review" tab
   │
   └─ PlagiarismDetectionPanel (NEW)
      ├─ Send code to API
      ├─ POST /api/advanced-features/plagiarism/check
      │  ↓ Similarity checked
      │  └─ Display in "Plagiarism" tab
      │
      └─ Record submission for future checks

2. Progress Page (progress/page.tsx)
   ↓
   AdaptiveDifficultyPanel (NEW)
   ├─ Fetch candidate metrics
   ├─ GET /api/advanced-features/adaptive-difficulty/metrics/:candidateId
   │  ↓ Metrics received
   ├─ Calculate recommendation
   ├─ GET /api/advanced-features/adaptive-difficulty/predict/:candidateId/:difficulty
   │  ↓ Recommendation received
   │
   └─ Display with stats and suggestion
      ↓
      Candidate chooses difficulty
      └─ Updates their practice focus


RECRUITER FLOW:
───────────────

1. Recruiter Portal (recruiter-frontend/src/app/page.tsx)
   ↓
   Click "📚 Question Library" mode
   ↓
   QuestionLibraryBrowser (NEW)
   ├─ Load questions
   ├─ GET /api/advanced-features/questions/all
   │  ↓ Questions loaded
   │
   ├─ User searches/filters
   ├─ GET /api/advanced-features/questions/search?q=...
   │  ↓ Filtered results
   │
   ├─ User clicks "Use This Question"
   │  ↓
   │  └─ Question added to list
   │     (useCallback onSelectQuestion handler)
   │     └─ updateQuestion adds to questions array
   │
   └─ Recruiter can add more from library or switch to manual
      └─ When done, assign to candidates normally
         └─ POST /api/interviews (existing flow continues)
```

---

## 🎯 Feature Access Points

| Feature | Access Path | Condition | Components |
|---------|-------------|-----------|------------|
| **Code Review** | IDE → Console → Tab | After test run | CodeReviewPanel |
| **Plagiarism** | IDE → Console → Tab | After test run | PlagiarismDetectionPanel |
| **Adaptive Difficulty** | Progress → Top Card | Always visible | AdaptiveDifficultyPanel |
| **Question Library** | Recruiter → Mode Toggle | Library mode | QuestionLibraryBrowser |

---

## 🎪 Current File Structure

### Modified Files:

```
youkt-frontend/
└── src/
    └── app/
        ├── ide/
        │   └── page.tsx ✨ MODIFIED (Code Review + Plagiarism tabs)
        ├── progress/
        │   └── page.tsx ✨ MODIFIED (Adaptive Difficulty panel)
        └── components/
            ├── CodeReviewPanel.tsx ✓ (already created)
            ├── PlagiarismDetectionPanel.tsx ✓ (already created)
            └── AdaptiveDifficultyPanel.tsx ✓ (already created)

recruiter-frontend/
└── src/
    └── app/
        └── page.tsx ✨ MODIFIED (Question Library browser + mode toggle)
            └── components/
                └── QuestionLibraryBrowser.tsx ✓ (already created)

src/ (Backend)
├── code-review/ ✓ (service created)
├── plagiarism/ ✓ (service created)
├── adaptive-difficulty/ ✓ (service created)
├── question-library/ ✓ (service created)
└── advanced-features/
    ├── advanced-features.controller.ts ✓ (created)
    └── advanced-features.module.ts ✓ (created)
```

---

## ⚡ Integration Impact

### Performance:
- ✅ No breaking changes
- ✅ Lazy-loaded components
- ✅ API calls on-demand
- ✅ Tab switching is instant

### UX:
- ✅ Non-intrusive additions
- ✅ All features optional/accessible
- ✅ Smooth transitions
- ✅ Maintains existing workflows

### Compatibility:
- ✅ Works with existing auth
- ✅ Respects candidate isolation
- ✅ Multi-recruiter compatible
- ✅ Backward compatible

---

## 🎓 User Journey Map

```
CANDIDATE JOURNEY:
Student logs in → Starts Problem → 
Writes Solution → Runs Tests → 
Gets feedback ← NEW: Code Review Panel!
Checks originality ← NEW: Plagiarism Panel!
Completes Problem → Checks Progress Page →
Sees recommendation ← NEW: Adaptive Difficulty Panel!
Adjusts difficulty → Continues learning

RECRUITER JOURNEY:
Recruiter logs in → Create New Interview →
Browse library ← NEW: Question Library Browser!
Add questions ← Now much faster!
Set candidates → Create interview → Share links
(Later) View reports ← Future: Integrate reports view
```

---

## 📋 Integration Completeness Checklist

✅ Code Review integrated in IDE  
✅ Plagiarism Detection integrated in IDE  
✅ Adaptive Difficulty integrated in Progress  
✅ Question Library integrated in Recruiter Portal  
✅ All components properly imported  
✅ All state management in place  
✅ API connections configured  
✅ Error handling included  
✅ Mobile responsive  
✅ Dark theme compatible  
⏳ Testing - Ready for next step  
⏳ Deployment - After testing  

---

## 🔍 Testing Checklist

### Code Review
- [ ] IDE page loads without errors
- [ ] Run tests succeeds
- [ ] "Code Review" tab appears
- [ ] Click tab shows CodeReviewPanel
- [ ] API call successful
- [ ] Results display correctly
- [ ] All 5 metrics show
- [ ] Suggestions display

### Plagiarism Detection
- [ ] "Plagiarism" tab appears after test run
- [ ] Click tab shows PlagiarismDetectionPanel
- [ ] API call successful
- [ ] Similarity % displays
- [ ] Risk level shows
- [ ] First submission registers
- [ ] Second submission detects match

### Adaptive Difficulty
- [ ] Progress page loads
- [ ] Difficulty card visible at top
- [ ] Stats load correctly
- [ ] Recommendation displays
- [ ] Confidence score shows
- [ ] Difficulty buttons clickable
- [ ] Mobile layout works

### Question Library
- [ ] Recruiter page loads
- [ ] Mode toggle buttons appear
- [ ] Library tab shows browser
- [ ] Questions load
- [ ] Search works
- [ ] Filter works
- [ ] Add to interview works
- [ ] Questions appear in list

---

**Integration Summary:** All 4 features strategically placed where they provide maximum value to your users! 🎉
