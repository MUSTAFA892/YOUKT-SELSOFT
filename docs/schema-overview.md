# YOUKT Schema Overview

- Enum types: 15
- Tables: 30

## Enum Types

| Enum | Values |
|---|---|
| requisition_state | draft, pending_approval, approved, rejected, active, on_hold, closed, archived |
| location_type | remote, hybrid, onsite |
| employment_type | full-time, part-time, contract, internship |
| experience_level | entry, mid, senior, lead, executive |
| priority_level | low, medium, high, urgent |
| sync_status | pending, processing, published, failed, expired |
| application_status | submitted, under_review, shortlisted, interview_scheduled, interviewing, offer_pending, offered, hired, rejected, withdrawn |
| interview_type | phone, video, onsite, panel, technical, hr |
| interview_status | scheduled, completed, cancelled, no_show |
| offer_status | draft, pending_approval, sent, accepted, rejected, expired, withdrawn |
| onboarding_status | not_started, in_progress, completed, blocked, cancelled |
| approval_request_status | pending, approved, rejected, cancelled |
| approval_action_type | approve, reject, comment, request_changes |
| publish_mode | automatic, manual, scheduled, recurring |
| screening_status | pending, processing, completed, failed |

## Tables

| Table | Columns | Primary Key | Doc |
|---|---:|---|---|
| roles | 4 | id | [docs/tables/roles.md](tables/roles.md) |
| permissions | 5 | id | [docs/tables/permissions.md](tables/permissions.md) |
| role_permissions | 4 | id | [docs/tables/role_permissions.md](tables/role_permissions.md) |
| users | 13 | id | [docs/tables/users.md](tables/users.md) |
| requisition_templates | 24 | id | [docs/tables/requisition_templates.md](tables/requisition_templates.md) |
| approval_workflows | 8 | id | [docs/tables/approval_workflows.md](tables/approval_workflows.md) |
| approval_workflow_steps | 8 | id | [docs/tables/approval_workflow_steps.md](tables/approval_workflow_steps.md) |
| job_requisitions | 32 | id | [docs/tables/job_requisitions.md](tables/job_requisitions.md) |
| requisition_approval_requests | 10 | id | [docs/tables/requisition_approval_requests.md](tables/requisition_approval_requests.md) |
| requisition_approval_actions | 11 | id | [docs/tables/requisition_approval_actions.md](tables/requisition_approval_actions.md) |
| requisition_state_history | 7 | id | [docs/tables/requisition_state_history.md](tables/requisition_state_history.md) |
| integration_connections | 9 | id | [docs/tables/integration_connections.md](tables/integration_connections.md) |
| job_distributions | 20 | id | [docs/tables/job_distributions.md](tables/job_distributions.md) |
| incoming_webhooks | 7 | id | [docs/tables/incoming_webhooks.md](tables/incoming_webhooks.md) |
| candidates | 12 | id | [docs/tables/candidates.md](tables/candidates.md) |
| candidate_skills | 6 | id | [docs/tables/candidate_skills.md](tables/candidate_skills.md) |
| candidate_tags | 4 | id | [docs/tables/candidate_tags.md](tables/candidate_tags.md) |
| candidate_tag_links | 4 | id | [docs/tables/candidate_tag_links.md](tables/candidate_tag_links.md) |
| candidate_notes | 7 | id | [docs/tables/candidate_notes.md](tables/candidate_notes.md) |
| applications | 9 | id | [docs/tables/applications.md](tables/applications.md) |
| application_status_history | 7 | id | [docs/tables/application_status_history.md](tables/application_status_history.md) |
| ai_screening_runs | 13 | id | [docs/tables/ai_screening_runs.md](tables/ai_screening_runs.md) |
| interviews | 14 | id | [docs/tables/interviews.md](tables/interviews.md) |
| interview_participants | 8 | id | [docs/tables/interview_participants.md](tables/interview_participants.md) |
| interview_evaluations | 13 | id | [docs/tables/interview_evaluations.md](tables/interview_evaluations.md) |
| offers | 16 | id | [docs/tables/offers.md](tables/offers.md) |
| onboarding_workflows | 7 | id | [docs/tables/onboarding_workflows.md](tables/onboarding_workflows.md) |
| onboarding_workflow_tasks | 10 | id | [docs/tables/onboarding_workflow_tasks.md](tables/onboarding_workflow_tasks.md) |
| onboardings | 10 | id | [docs/tables/onboardings.md](tables/onboardings.md) |
| onboarding_tasks | 11 | id | [docs/tables/onboarding_tasks.md](tables/onboarding_tasks.md) |