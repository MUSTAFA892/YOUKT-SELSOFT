# YOUKT CTP Testing Tutorial

This guide covers the testing process for the YOUKT CTP platform. It walks you through setting up the environment and performing end-to-end tests for both Recruiter and Candidate workflows.

## Environment Setup

The application is split into three main components. You'll need three separate terminal windows to run them simultaneously:

### 1. Start the Backend API
The backend acts as the central API and manager for questions, execution, and plagiarism detection.
```sh
cd "YOUKT CTP"
npm install
npm run start:dev
```
> [!NOTE] 
> The backend runs on `http://127.0.0.1:3001`

### 2. Start the Candidate Frontend
This is where the candidates will log in and take their assessments.
```sh
cd "YOUKT CTP\youkt-frontend"
npm install
npm run dev
```
> [!NOTE] 
> The candidate app runs on `http://localhost:3000`. If you encountered a `TypeError: fetch failed` previously, it has been resolved. Please gracefully stop and restart this terminal instance to apply the patches.

### 3. Start the Recruiter Frontend
This is the portal for recruiters to build assessments and review reports.
```sh
cd "YOUKT CTP\recruiter-frontend"
npm install
npm run dev
```
> [!NOTE] 
> The recruiter app runs on `http://localhost:3002`.

---

## Testing Workflow 1: The Recruiter Experience

1. **Access the Recruiter Portal**: Open `http://localhost:3002` in your browser.
2. **Authentication**: Choose an account with the role set to **Recruiter**.
3. **Build an Assessment**: 
   - Use the **Manual Creation** mode to manually type in a custom algorithmic challenge and provide inputs/outputs.
   - Alternatively, toggle to **Question Library** and select high-quality predefined questions.
4. **Assign to Candidate**: Assign the interview to either an **Existing Account** or a **New Candidate** using a mocked candidate ID (e.g., `cand_123`).
5. **Generate Link**: Click on "Generate & Assign Interview". You will receive an assessment URL (pointing to the candidate app on port 3000) that you should copy.
6. **Review Reports**: Visit the Recruiter Portal's dashboard and reports pages to review candidate statistics, completed interviews, and potential cheating violations.

---

## Testing Workflow 2: The Candidate Experience

1. **Access the Assessment**: Using the generated URL from the Recruiter (e.g., `http://localhost:3000/interview/[id]`), open an incognito window or a different browser.
2. **Authentication**: Log in with the Candidate ID you specified when creating the interview.
3. **Solve Problems**:
   - Write your code in the IDE.
   - Run tests using the predefined test cases inside the workspace.
   - **Check Advanced Features**: Note the **Adaptive Difficulty** mechanisms adjusting the complexity based on your behavior, or observe the integrated **Code Review** outputs.
4. **Test the Anti-Cheat System**:
   - Try to switch browser tabs or move the window out of focus. The frontend will trigger an anti-cheat event.
   - You can view these incident reports later on the Recruiter Portal.
5. **Finish**: Submit the interview to finalize your assessment. Return to the recruiter app at `http://localhost:3002` to see the actual results update in real-time.

---

## Troubleshooting

> [!WARNING]  
> If the `youkt-frontend` fails on startup with a Next.js `fetch` error, ensure that the **Backend (Port 3001)** is fully running and has finished compiling before starting the frontend dev environments.

> [!TIP]
> Use standard Node 18+ syntax to test. Network bindings have been updated to prefer `127.0.0.1` over `localhost` to bypass IPv6 loopback restrictions.
