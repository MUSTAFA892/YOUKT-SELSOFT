CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.requisition_state AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'active',
  'on_hold',
  'closed',
  'archived'
);

CREATE TYPE public.location_type AS ENUM (
  'remote',
  'hybrid',
  'onsite'
);

CREATE TYPE public.employment_type AS ENUM (
  'full-time',
  'part-time',
  'contract',
  'internship'
);

CREATE TYPE public.experience_level AS ENUM (
  'entry',
  'mid',
  'senior',
  'lead',
  'executive'
);

CREATE TYPE public.priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE public.sync_status AS ENUM (
  'pending',
  'processing',
  'published',
  'failed',
  'expired'
);

CREATE TYPE public.application_status AS ENUM (
  'submitted',
  'under_review',
  'shortlisted',
  'interview_scheduled',
  'interviewing',
  'offer_pending',
  'offered',
  'hired',
  'rejected',
  'withdrawn'
);

CREATE TYPE public.interview_type AS ENUM (
  'phone',
  'video',
  'onsite',
  'panel',
  'technical',
  'hr'
);

CREATE TYPE public.interview_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE public.offer_status AS ENUM (
  'draft',
  'pending_approval',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'withdrawn'
);

CREATE TYPE public.onboarding_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'blocked',
  'cancelled'
);

CREATE TYPE public.approval_request_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

CREATE TYPE public.approval_action_type AS ENUM (
  'approve',
  'reject',
  'comment',
  'request_changes'
);

CREATE TYPE public.publish_mode AS ENUM (
  'automatic',
  'manual',
  'scheduled',
  'recurring'
);

CREATE TYPE public.screening_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  action text NOT NULL,
  resource_path text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT permissions_action_resource_path_unique UNIQUE (action, resource_path)
);

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT role_permissions_role_permission_unique UNIQUE (role_id, permission_id)
);

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  password_hash text,
  auth_provider text NOT NULL DEFAULT 'local',
  auth_provider_id text,
  role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  department text,
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_not_blank CHECK (char_length(trim(email)) > 0),
  CONSTRAINT users_password_hash_not_blank CHECK (
    password_hash IS NULL OR char_length(trim(password_hash)) > 0
  ),
  CONSTRAINT users_auth_provider_not_blank CHECK (char_length(trim(auth_provider)) > 0)
);

CREATE TABLE public.requisition_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  is_predefined boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  title text,
  department text,
  location public.location_type,
  job_type public.employment_type,
  experience public.experience_level,
  positions_count integer,
  salary_range_min numeric(12,2),
  salary_range_max numeric(12,2),
  is_salary_hidden boolean NOT NULL DEFAULT false,
  description_rich_text text,
  required_skills text[] NOT NULL DEFAULT '{}'::text[],
  preferred_skills text[] NOT NULL DEFAULT '{}'::text[],
  education_reqs text,
  certifications text,
  priority public.priority_level,
  template_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT requisition_templates_name_not_blank CHECK (char_length(trim(name)) > 0),
  CONSTRAINT requisition_templates_positions_positive CHECK (
    positions_count IS NULL OR positions_count > 0
  ),
  CONSTRAINT requisition_templates_salary_range_valid CHECK (
    salary_range_min IS NULL
    OR salary_range_max IS NULL
    OR salary_range_min <= salary_range_max
  )
);

CREATE TABLE public.approval_workflows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT approval_workflows_name_not_blank CHECK (char_length(trim(name)) > 0)
);

CREATE TABLE public.approval_workflow_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id uuid NOT NULL REFERENCES public.approval_workflows(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  approver_role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  approver_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  approver_email text,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT approval_workflow_steps_order_positive CHECK (step_order > 0),
  CONSTRAINT approval_workflow_steps_unique_order UNIQUE (workflow_id, step_order),
  CONSTRAINT approval_workflow_steps_target_present CHECK (
    approver_role_id IS NOT NULL
    OR approver_user_id IS NOT NULL
    OR approver_email IS NOT NULL
  )
);

CREATE TABLE public.job_requisitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id uuid NOT NULL REFERENCES public.users(id),
  template_id uuid REFERENCES public.requisition_templates(id) ON DELETE SET NULL,
  duplicated_from_requisition_id uuid REFERENCES public.job_requisitions(id) ON DELETE SET NULL,
  approval_workflow_id uuid REFERENCES public.approval_workflows(id) ON DELETE SET NULL,
  title text NOT NULL,
  department text NOT NULL,
  location public.location_type NOT NULL,
  job_type public.employment_type NOT NULL,
  experience public.experience_level NOT NULL,
  positions_count integer NOT NULL DEFAULT 1,
  salary_range_min numeric(12,2),
  salary_range_max numeric(12,2),
  is_salary_hidden boolean NOT NULL DEFAULT false,
  description text NOT NULL,
  required_skills text[] NOT NULL DEFAULT '{}'::text[],
  preferred_skills text[] NOT NULL DEFAULT '{}'::text[],
  education_reqs text,
  certifications text,
  priority public.priority_level NOT NULL DEFAULT 'medium',
  expected_start_date date,
  application_deadline date,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  state public.requisition_state NOT NULL DEFAULT 'draft',
  is_locked boolean NOT NULL DEFAULT false,
  locked_at timestamptz,
  approval_requested_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  parent_version_id uuid REFERENCES public.job_requisitions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_requisitions_positions_count_positive CHECK (positions_count > 0),
  CONSTRAINT job_requisitions_salary_range_valid CHECK (
    salary_range_min IS NULL
    OR salary_range_max IS NULL
    OR salary_range_min <= salary_range_max
  ),
  CONSTRAINT job_requisitions_parent_not_self CHECK (
    parent_version_id IS NULL OR parent_version_id <> id
  )
);

CREATE TABLE public.requisition_approval_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisition_id uuid NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES public.approval_workflows(id) ON DELETE SET NULL,
  requested_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status public.approval_request_status NOT NULL DEFAULT 'pending',
  request_message text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.requisition_approval_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL REFERENCES public.requisition_approval_requests(id) ON DELETE CASCADE,
  step_id uuid REFERENCES public.approval_workflow_steps(id) ON DELETE SET NULL,
  approver_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  approver_email text,
  action public.approval_action_type NOT NULL,
  comment text,
  action_token uuid NOT NULL DEFAULT uuid_generate_v4(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  action_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT requisition_approval_actions_token_unique UNIQUE (action_token),
  CONSTRAINT requisition_approval_actions_actor_present CHECK (
    approver_user_id IS NOT NULL OR approver_email IS NOT NULL
  )
);

CREATE TABLE public.requisition_state_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisition_id uuid NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
  from_state public.requisition_state,
  to_state public.requisition_state NOT NULL,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.integration_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform text NOT NULL,
  display_name text,
  is_enabled boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  credentials_reference text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integration_connections_platform_not_blank CHECK (char_length(trim(platform)) > 0)
);

CREATE TABLE public.job_distributions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisition_id uuid NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
  integration_connection_id uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL,
  platform text NOT NULL,
  status public.sync_status NOT NULL DEFAULT 'pending',
  publish_mode public.publish_mode NOT NULL DEFAULT 'manual',
  scheduled_for timestamptz,
  recurrence_interval interval,
  next_repost_at timestamptz,
  published_at timestamptz,
  location_override text,
  external_job_id text,
  posting_url text,
  tracking_link text,
  custom_messaging text,
  media_assets text[] NOT NULL DEFAULT '{}'::text[],
  channel_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sync_logs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.incoming_webhooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_platform text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  processing_error text,
  processed_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.candidates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  current_location text,
  headline text,
  summary text,
  resume_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT candidates_email_not_blank CHECK (char_length(trim(email)) > 0)
);

CREATE TABLE public.candidate_skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  years_experience numeric(4,1),
  is_preferred boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT candidate_skills_name_not_blank CHECK (char_length(trim(skill_name)) > 0),
  CONSTRAINT candidate_skills_years_non_negative CHECK (
    years_experience IS NULL OR years_experience >= 0
  )
);

CREATE TABLE public.candidate_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT candidate_tags_name_not_blank CHECK (char_length(trim(name)) > 0)
);

CREATE TABLE public.candidate_tag_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.candidate_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT candidate_tag_links_unique UNIQUE (candidate_id, tag_id)
);

CREATE TABLE public.candidate_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  note text NOT NULL,
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT candidate_notes_note_not_blank CHECK (char_length(trim(note)) > 0)
);

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  requisition_id uuid NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'submitted',
  source_distribution_id uuid REFERENCES public.job_distributions(id) ON DELETE SET NULL,
  ai_score numeric(5,2),
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT applications_candidate_requisition_unique UNIQUE (candidate_id, requisition_id),
  CONSTRAINT applications_ai_score_range CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 100))
);

CREATE TABLE public.application_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_status public.application_status,
  to_status public.application_status NOT NULL,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_screening_runs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status public.screening_status NOT NULL DEFAULT 'pending',
  model_name text,
  model_version text,
  score numeric(5,2),
  summary text,
  strengths text[] NOT NULL DEFAULT '{}'::text[],
  risks text[] NOT NULL DEFAULT '{}'::text[],
  raw_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_screening_runs_score_range CHECK (
    score IS NULL OR (score >= 0 AND score <= 100)
  )
);

CREATE TABLE public.interviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  interview_type public.interview_type NOT NULL,
  status public.interview_status NOT NULL DEFAULT 'scheduled',
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  timezone text,
  meeting_url text,
  location_details text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interviews_stage_name_not_blank CHECK (char_length(trim(stage_name)) > 0),
  CONSTRAINT interviews_schedule_valid CHECK (scheduled_end > scheduled_start)
);

CREATE TABLE public.interview_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id uuid NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  participant_name text,
  participant_email text,
  participant_role text NOT NULL,
  response_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interview_participants_role_not_blank CHECK (char_length(trim(participant_role)) > 0),
  CONSTRAINT interview_participants_identity_present CHECK (
    user_id IS NOT NULL
    OR participant_email IS NOT NULL
    OR participant_name IS NOT NULL
  )
);

CREATE TABLE public.interview_evaluations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id uuid NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  evaluator_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  evaluator_name text,
  evaluator_email text,
  score numeric(5,2),
  recommendation text,
  strengths text,
  concerns text,
  feedback jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interview_evaluations_score_range CHECK (
    score IS NULL OR (score >= 0 AND score <= 100)
  ),
  CONSTRAINT interview_evaluations_identity_present CHECK (
    evaluator_user_id IS NOT NULL
    OR evaluator_email IS NOT NULL
    OR evaluator_name IS NOT NULL
  )
);

CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status public.offer_status NOT NULL DEFAULT 'draft',
  currency_code char(3) NOT NULL DEFAULT 'USD',
  base_salary numeric(12,2),
  bonus_amount numeric(12,2),
  equity_text text,
  start_date date,
  expiration_date date,
  terms_text text,
  sent_at timestamptz,
  responded_at timestamptz,
  response_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offers_base_salary_non_negative CHECK (
    base_salary IS NULL OR base_salary >= 0
  ),
  CONSTRAINT offers_bonus_non_negative CHECK (
    bonus_amount IS NULL OR bonus_amount >= 0
  ),
  CONSTRAINT offers_expiration_after_start CHECK (
    expiration_date IS NULL
    OR start_date IS NULL
    OR expiration_date >= start_date
  )
);

CREATE TABLE public.onboarding_workflows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_workflows_name_not_blank CHECK (char_length(trim(name)) > 0)
);

CREATE TABLE public.onboarding_workflow_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id uuid NOT NULL REFERENCES public.onboarding_workflows(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  task_description text,
  sort_order integer NOT NULL,
  default_owner_role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  due_days_after_start integer,
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_workflow_tasks_name_not_blank CHECK (char_length(trim(task_name)) > 0),
  CONSTRAINT onboarding_workflow_tasks_sort_order_positive CHECK (sort_order > 0),
  CONSTRAINT onboarding_workflow_tasks_due_days_non_negative CHECK (
    due_days_after_start IS NULL OR due_days_after_start >= 0
  ),
  CONSTRAINT onboarding_workflow_tasks_unique_order UNIQUE (workflow_id, sort_order)
);

CREATE TABLE public.onboardings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES public.onboarding_workflows(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status public.onboarding_status NOT NULL DEFAULT 'not_started',
  start_date date,
  target_completion_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboardings_offer_unique UNIQUE (offer_id),
  CONSTRAINT onboardings_target_after_start CHECK (
    target_completion_date IS NULL
    OR start_date IS NULL
    OR target_completion_date >= start_date
  )
);

CREATE TABLE public.onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_id uuid NOT NULL REFERENCES public.onboardings(id) ON DELETE CASCADE,
  workflow_task_id uuid REFERENCES public.onboarding_workflow_tasks(id) ON DELETE SET NULL,
  task_name text NOT NULL,
  assignee_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status public.onboarding_status NOT NULL DEFAULT 'not_started',
  due_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_tasks_name_not_blank CHECK (char_length(trim(task_name)) > 0)
);

CREATE UNIQUE INDEX uq_users_email_lower ON public.users ((lower(email)));
CREATE UNIQUE INDEX uq_users_provider_identity ON public.users (auth_provider, auth_provider_id)
WHERE auth_provider_id IS NOT NULL;

CREATE UNIQUE INDEX uq_requisition_templates_name_lower ON public.requisition_templates ((lower(name)));

CREATE UNIQUE INDEX uq_approval_workflows_default_true
ON public.approval_workflows (is_default)
WHERE is_default = true;

CREATE INDEX idx_users_role_id ON public.users(role_id);
CREATE INDEX idx_users_is_active ON public.users(is_active);

CREATE INDEX idx_requisition_templates_created_by ON public.requisition_templates(created_by);

CREATE INDEX idx_approval_workflow_steps_workflow_id ON public.approval_workflow_steps(workflow_id);
CREATE INDEX idx_approval_workflow_steps_approver_user_id ON public.approval_workflow_steps(approver_user_id);
CREATE INDEX idx_approval_workflow_steps_approver_role_id ON public.approval_workflow_steps(approver_role_id);

CREATE INDEX idx_job_requisitions_creator_id ON public.job_requisitions(creator_id);
CREATE INDEX idx_job_requisitions_state ON public.job_requisitions(state);
CREATE INDEX idx_job_requisitions_department ON public.job_requisitions(department);
CREATE INDEX idx_job_requisitions_priority ON public.job_requisitions(priority);
CREATE INDEX idx_job_requisitions_deadline ON public.job_requisitions(application_deadline);
CREATE INDEX idx_job_requisitions_template_id ON public.job_requisitions(template_id);
CREATE INDEX idx_job_requisitions_approval_workflow_id ON public.job_requisitions(approval_workflow_id);
CREATE INDEX idx_job_requisitions_required_skills_gin ON public.job_requisitions USING gin (required_skills);
CREATE INDEX idx_job_requisitions_preferred_skills_gin ON public.job_requisitions USING gin (preferred_skills);
CREATE INDEX idx_job_requisitions_custom_fields_gin ON public.job_requisitions USING gin (custom_fields);

CREATE INDEX idx_requisition_approval_requests_requisition_id ON public.requisition_approval_requests(requisition_id);
CREATE INDEX idx_requisition_approval_requests_status ON public.requisition_approval_requests(status);
CREATE INDEX idx_requisition_approval_actions_request_id ON public.requisition_approval_actions(request_id);
CREATE INDEX idx_requisition_approval_actions_approver_user_id ON public.requisition_approval_actions(approver_user_id);
CREATE INDEX idx_requisition_state_history_requisition_id ON public.requisition_state_history(requisition_id);

CREATE INDEX idx_job_distributions_requisition_id ON public.job_distributions(requisition_id);
CREATE INDEX idx_job_distributions_integration_connection_id ON public.job_distributions(integration_connection_id);
CREATE INDEX idx_job_distributions_status ON public.job_distributions(status);
CREATE INDEX idx_job_distributions_platform ON public.job_distributions(platform);
CREATE INDEX idx_job_distributions_scheduled_for ON public.job_distributions(scheduled_for);
CREATE INDEX idx_job_distributions_next_repost_at ON public.job_distributions(next_repost_at);

CREATE UNIQUE INDEX uq_integration_connections_platform_lower ON public.integration_connections ((lower(platform)));

CREATE INDEX idx_incoming_webhooks_processed_received_at ON public.incoming_webhooks(processed, received_at);
CREATE INDEX idx_incoming_webhooks_source_platform ON public.incoming_webhooks(source_platform);
CREATE INDEX idx_incoming_webhooks_payload_gin ON public.incoming_webhooks USING gin (payload);

CREATE UNIQUE INDEX uq_candidates_email_lower ON public.candidates ((lower(email)));
CREATE INDEX idx_candidates_user_id ON public.candidates(user_id);

CREATE INDEX idx_candidate_skills_candidate_id ON public.candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_skill_name_lower ON public.candidate_skills ((lower(skill_name)));
CREATE UNIQUE INDEX uq_candidate_tags_name_lower ON public.candidate_tags ((lower(name)));
CREATE INDEX idx_candidate_tag_links_candidate_id ON public.candidate_tag_links(candidate_id);
CREATE INDEX idx_candidate_tag_links_tag_id ON public.candidate_tag_links(tag_id);
CREATE INDEX idx_candidate_notes_candidate_id ON public.candidate_notes(candidate_id);
CREATE INDEX idx_candidate_notes_author_user_id ON public.candidate_notes(author_user_id);

CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_requisition_id ON public.applications(requisition_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_source_distribution_id ON public.applications(source_distribution_id);

CREATE INDEX idx_application_status_history_application_id ON public.application_status_history(application_id);
CREATE INDEX idx_ai_screening_runs_application_id ON public.ai_screening_runs(application_id);
CREATE INDEX idx_ai_screening_runs_status ON public.ai_screening_runs(status);

CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_status ON public.interviews(status);
CREATE INDEX idx_interviews_scheduled_start ON public.interviews(scheduled_start);
CREATE INDEX idx_interview_participants_interview_id ON public.interview_participants(interview_id);
CREATE INDEX idx_interview_participants_user_id ON public.interview_participants(user_id);
CREATE INDEX idx_interview_evaluations_interview_id ON public.interview_evaluations(interview_id);
CREATE INDEX idx_interview_evaluations_evaluator_user_id ON public.interview_evaluations(evaluator_user_id);

CREATE INDEX idx_offers_application_id ON public.offers(application_id);
CREATE INDEX idx_offers_status ON public.offers(status);

CREATE INDEX idx_onboarding_workflow_tasks_workflow_id ON public.onboarding_workflow_tasks(workflow_id);
CREATE INDEX idx_onboardings_offer_id ON public.onboardings(offer_id);
CREATE INDEX idx_onboardings_status ON public.onboardings(status);
CREATE INDEX idx_onboarding_tasks_onboarding_id ON public.onboarding_tasks(onboarding_id);
CREATE INDEX idx_onboarding_tasks_assignee_user_id ON public.onboarding_tasks(assignee_user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_requisition_templates_set_updated_at
BEFORE UPDATE ON public.requisition_templates
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_approval_workflows_set_updated_at
BEFORE UPDATE ON public.approval_workflows
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_job_requisitions_set_updated_at
BEFORE UPDATE ON public.job_requisitions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_requisition_approval_requests_set_updated_at
BEFORE UPDATE ON public.requisition_approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_integration_connections_set_updated_at
BEFORE UPDATE ON public.integration_connections
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_job_distributions_set_updated_at
BEFORE UPDATE ON public.job_distributions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_candidates_set_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_candidate_notes_set_updated_at
BEFORE UPDATE ON public.candidate_notes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_applications_set_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_interviews_set_updated_at
BEFORE UPDATE ON public.interviews
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_interview_evaluations_set_updated_at
BEFORE UPDATE ON public.interview_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_offers_set_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_onboarding_workflows_set_updated_at
BEFORE UPDATE ON public.onboarding_workflows
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_onboarding_workflow_tasks_set_updated_at
BEFORE UPDATE ON public.onboarding_workflow_tasks
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_onboardings_set_updated_at
BEFORE UPDATE ON public.onboardings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_onboarding_tasks_set_updated_at
BEFORE UPDATE ON public.onboarding_tasks
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();