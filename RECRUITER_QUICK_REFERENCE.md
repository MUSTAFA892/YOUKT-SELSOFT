# Quick Reference: Multi-Recruiter System

## 🚀 Access Portal
```
URL: http://localhost:3002
```

## 👥 Recruiter Accounts (Login via Account Switcher)

| Recruiter | ID | Candidates |
|-----------|----|----|
| Recruiter 1 | recruiter1 | Alice Smith (c1), Bob Jones (c2), Charlie Brown (c3) |
| Recruiter 2 | recruiter2 | Dave Evans (c4), Eve Miller (c5), Frank Wilson (c6) |
| Recruiter 3 | recruiter3 | Grace Lee (c7), Henry Martinez (c8), Ivy Thompson (c9) |

## 📋 Candidate Details

### Recruiter 1's Candidates
- **c1**: Alice Smith
- **c2**: Bob Jones  
- **c3**: Charlie Brown

### Recruiter 2's Candidates
- **c4**: Dave Evans
- **c5**: Eve Miller
- **c6**: Frank Wilson

### Recruiter 3's Candidates
- **c7**: Grace Lee
- **c8**: Henry Martinez
- **c9**: Ivy Thompson

## ⚙️ Servers Running
- Backend API: `http://localhost:3001/api`
- Candidate Portal: `http://localhost:3000`
- Recruiter Portal: `http://localhost:3002`

## 🔑 Key Features

### 1. **Account Switching**
- Top-right corner "Account Switcher" button
- Select recruiter to switch accounts
- All data filters automatically

### 2. **Candidate Assignment Modes**
- **Existing Account**: Assign to one of your pre-assigned candidates
- **+ New Candidate**: Add a new candidate and assign (they get added to your pool)
- **📋 Multiple Candidates**: Bulk assign same assessment to multiple candidates

### 3. **Dashboard Pages**
- **Main Page**: Create and assign assessments
- **Candidates**: View all your candidates' progress and activity
- **Reports**: View assessment performance reports
- **Violations**: Monitor tab-switch violations and cheating attempts

## 📝 Creating an Assessment

### Step-by-Step:
1. Select **Recruiter** (e.g., Recruiter 1)
2. Choose assignment mode
3. Select candidate(s)
4. Add assessment questions
5. Configure test cases
6. Click "Generate Link" or "Generate (N) Interviews"
7. Share the unique links with candidates

## 📊 Viewing Results

### Candidates Page Shows:
- Candidate name & ID
- Interview count
- Total problems attempted
- Test accuracy %
- Expandable details

### Reports Page Shows:
- Assessment scores
- Per-question performance
- Tests passed/failed
- Violation history

### Violations Page Shows:
- Tab-switch incidents
- Count per candidate
- Status (warning/terminated)

## 🔒 Data Isolation

- Recruiter 1 cannot see Recruiter 2's candidates
- Reports show only assigned candidates' data
- New candidates belong to creating recruiter only
- All filtering is automatic per logged-in recruiter

## 🎯 Example Workflow

```
1. Open http://localhost:3002

2. Account Switcher → Select "Recruiter 1"

3. Main Portal:
   - Select "Existing Account"
   - Choose "Alice Smith"
   - Add questions
   - Generate Link → Copy

4. Candidates Page:
   - See "Alice Smith" progress

5. Reports Page:
   - See "Alice Smith" assessment scores

6. Switch to Recruiter 2:
   - "Alice Smith" is NOT visible
   - See "Dave Evans", "Eve Miller", "Frank Wilson"
   - Data completely isolated
```

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't see candidates | Check Account Switcher - verify correct recruiter selected |
| New candidate not appearing | Verify it was added while logged in as correct recruiter |
| Reports show no data | Ensure candidate completed an assessment |
| Error creating interview | Check backend is running on port 3001 |
| Recruiter can see other recruiters' data | Refresh page, check Account Switcher, clear localStorage |

## 🛠️ Browser Console Debug Commands

```javascript
// Check current recruiter
console.log(localStorage.getItem('youkt_current_user'))

// View all recruiter accounts
// See browser DevTools > Application > Storage > Account Switcher

// Clear all data (reset system)
localStorage.clear()
```

## 📱 Assignment Link Format

When you generate a link, it looks like:
```
http://localhost:3000/interview/[unique-interview-id]
```

This link works for candidates regardless of recruiter.

## 🔄 Switch Recruiters Mid-Workflow

You can switch recruiters at any time:
1. Click Account Switcher
2. Select different recruiter
3. Your candidate list updates
4. All pages refresh with new recruiter's data

---

**System Ready to Use: All Servers Running ✅**
