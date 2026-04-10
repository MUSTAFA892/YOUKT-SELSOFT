# Multi-Recruiter System Guide

## Overview
The system now supports multiple recruiters with independent candidate pools. Each recruiter has their own set of candidates and can only see/manage their own candidates' assessments, reports, and progress.

## Recruiter Accounts

### Pre-configured Recruiters
1. **Recruiter 1** (ID: `recruiter1`)
2. **Recruiter 2** (ID: `recruiter2`)
3. **Recruiter 3** (ID: `recruiter3`)

### Account Switching
Use the **Account Switcher** in the top-right corner of the Recruiter Portal to switch between recruiters. Each recruiter is isolated and can only see their own data.

---

## Candidate Assignment

### Recruiter 1's Candidates (3)
1. Alice Smith (c1)
2. Bob Jones (c2)
3. Charlie Brown (c3)

### Recruiter 2's Candidates (3)
1. Dave Evans (c4)
2. Eve Miller (c5)
3. Frank Wilson (c6)

### Recruiter 3's Candidates (3)
1. Grace Lee (c7)
2. Henry Martinez (c8)
3. Ivy Thompson (c9)

---

## Key Features

### 1. Isolated Candidate View
- Each recruiter only sees their assigned 3 candidates
- The candidate dropdown in the recruiter portal only shows their candidates
- The candidates list page only displays their candidates

### 2. Add New Candidates
- Each recruiter can add new candidates
- New candidates are automatically assigned to the recruiter who added them
- Added candidates appear in that recruiter's candidate list only

### 3. Create Assessments
- Recruiters can create assessments with questions for:
  - **Existing candidates** - their already-assigned candidates
  - **New candidates** - external candidates being assessed for the first time
  - **Multiple candidates** - bulk assign the same assessment to multiple candidates at once

### 4. Isolated Reporting
- **Candidates Page**: Shows only this recruiter's candidates' progress and activity
- **Reports Page**: Shows only this recruiter's candidates' assessment reports
- **Violations Page**: Shows only this recruiter's candidates' tab-switch violations

### 5. Unique Interview Links
- When assigning an assessment to a candidate, a unique interview link is generated
- Each link is specific to that candidate and interview
- These links are shareable with candidates regardless of recruiter

---

## Workflow: Creating and Assigning Assessments

### Step 1: Switch to Your Recruiter Account
1. Click the Account Switcher in the top-right
2. Select your recruiter account (Recruiter 1, 2, or 3)

### Step 2: Add or View Candidates
- Your candidates are pre-loaded in the "Existing Account" dropdown
- To add a new candidate, switch to the "+ New Candidate" mode
- To assign to multiple candidates at once, use "📋 Multiple Candidates" mode

### Step 3: Create Assessment Questions
1. Add questions with descriptions and test cases
2. Configure code templates and test cases per question
3. Select programming language support

### Step 4: Generate Interview Links
**For existing candidates:**
1. Select a candidate from the dropdown
2. Click "Generate Link"
3. Copy the unique interview link

**For new candidates:**
1. Enter candidate ID and name
2. Click "Generate Link"
3. The candidate is automatically added to your pool
4. Copy the unique interview link

**For multiple candidates:**
1. Select "📋 Multiple Candidates" tab
2. Check the boxes of candidates to assign
3. Click "Generate (N) Interviews"
4. Each candidate gets a unique link

### Step 5: Share Interview Links
- Copy individual links and share with candidates
- Each link is unique and candidate-specific
- Candidates can access their assessment using their link

---

## Viewing Reports and Progress

### Candidates Page
- Shows all your candidates' activity logs and progress
- Click on a candidate to expand and see detailed metrics
- Metrics include: accuracy %, problems solved, tests passed, interview count

### Reports Page
- Shows assessment performance reports for your candidates only
- Displays per-question details: tests passed/failed, pass rates
- Shows violations (tab switches) if anti-cheating was triggered

### Violations Page
- Shows tab-switch incidents for your candidates only
- Filter by "all", "warning", or "terminated"
- Each incident shows: candidate, interview, violation count, status

---

## Technical Details

### Data Storage
- Recruiter accounts: In-memory (DUMMY_USERS)
- Candidate assignments: Tracked via `recruiterId` field in each candidate record
- External candidates: Stored in browser localStorage with recruiter association
- Reports/Logs: Filtered server-side by recruiter's candidate IDs

### API Filtering
- When fetching activity logs, interviews, reports, or violations:
  - System identifies current recruiter's candidate IDs
  - Results are filtered to only include data for those candidates
  - This prevents cross-recruiter data leakage

### Interview Creation
- When creating an interview, the candidate is associated with the creating recruiter
- The interview remains accessible only through that recruiter's portal view

---

## Security Considerations

1. **Data Isolation**: Each recruiter's data is completely isolated
2. **No Cross-Recruiter Access**: A recruiter cannot see another recruiter's candidates
3. **Candidate Addition**: Only the creating recruiter can manage the candidate
4. **Assessment Sharing**: Interview links work independently of recruiter (for candidate access)

---

## Troubleshooting

### You see other recruiters' candidates
- Check the Account Switcher to ensure you're logged in as the correct recruiter
- Refresh the page to reload the candidate list
- Check browser console for errors

### A candidate doesn't appear in your list
- If you added them while logged in as a different recruiter, switch to that recruiter's account
- If the candidate was added as an external candidate, it is tied to the recruiter who added it

### Reports show no data
- Verify at least one candidate has completed an assessment
- Check that you're viewing the correct recruiter's account
- Ensure the candidate belongs to your recruiter

---

## Future Enhancements

- [ ] Backend persistent storage for recruiter and candidate associations
- [ ] Recruiter creation and management UI
- [ ] Role-based access controls (admin, recruiter, candidate)
- [ ] Team management for recruiters
- [ ] Shared assessment templates across recruiters
- [ ] Analytics dashboard per recruiter
