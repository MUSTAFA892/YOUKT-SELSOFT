BEGIN;

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  legal_name text,
  timezone text NOT NULL DEFAULT 'UTC',
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT companies_name_not_blank CHECK (char_length(trim(name)) > 0),
  CONSTRAINT companies_slug_not_blank CHECK (char_length(trim(slug)) > 0),
  CONSTRAINT companies_slug_is_lower CHECK (slug = lower(slug)),
  CONSTRAINT companies_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

INSERT INTO public.companies (name, slug, legal_name)
VALUES ('Default Company', 'default-company', 'Default Company')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.roles ADD COLUMN company_id uuid;
ALTER TABLE public.users ADD COLUMN company_id uuid;
ALTER TABLE public.requisition_templates ADD COLUMN company_id uuid;
ALTER TABLE public.approval_workflows ADD COLUMN company_id uuid;
ALTER TABLE public.job_requisitions ADD COLUMN company_id uuid;
ALTER TABLE public.integration_connections ADD COLUMN company_id uuid;
ALTER TABLE public.candidates ADD COLUMN company_id uuid;
ALTER TABLE public.candidate_tags ADD COLUMN company_id uuid;
ALTER TABLE public.applications ADD COLUMN company_id uuid;
ALTER TABLE public.onboarding_workflows ADD COLUMN company_id uuid;

UPDATE public.users
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.roles r
SET company_id = src.company_id
FROM (
  SELECT DISTINCT ON (u.role_id)
    u.role_id,
    u.company_id
  FROM public.users u
  WHERE u.role_id IS NOT NULL
    AND u.company_id IS NOT NULL
  ORDER BY u.role_id, u.company_id
) src
WHERE r.id = src.role_id
  AND r.company_id IS NULL;

UPDATE public.roles
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.requisition_templates rt
SET company_id = u.company_id
FROM public.users u
WHERE rt.created_by = u.id
  AND rt.company_id IS NULL;

UPDATE public.requisition_templates
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.approval_workflows aw
SET company_id = u.company_id
FROM public.users u
WHERE aw.created_by = u.id
  AND aw.company_id IS NULL;

UPDATE public.approval_workflows
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.job_requisitions jr
SET company_id = u.company_id
FROM public.users u
WHERE jr.creator_id = u.id
  AND jr.company_id IS NULL;

UPDATE public.job_requisitions
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.integration_connections
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.candidates c
SET company_id = u.company_id
FROM public.users u
WHERE c.user_id = u.id
  AND c.company_id IS NULL;

UPDATE public.candidates
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.candidate_tags
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.applications a
SET company_id = jr.company_id
FROM public.job_requisitions jr
WHERE a.requisition_id = jr.id
  AND a.company_id IS NULL;

UPDATE public.applications a
SET company_id = c.company_id
FROM public.candidates c
WHERE a.candidate_id = c.id
  AND a.company_id IS NULL;

UPDATE public.applications
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

UPDATE public.onboarding_workflows ow
SET company_id = u.company_id
FROM public.users u
WHERE ow.created_by = u.id
  AND ow.company_id IS NULL;

UPDATE public.onboarding_workflows
SET company_id = (SELECT id FROM public.companies WHERE slug = 'default-company')
WHERE company_id IS NULL;

ALTER TABLE public.roles ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.requisition_templates ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.approval_workflows ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.job_requisitions ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.integration_connections ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.candidates ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.candidate_tags ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.applications ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.onboarding_workflows ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE public.roles
  ADD CONSTRAINT roles_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.users
  ADD CONSTRAINT users_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.requisition_templates
  ADD CONSTRAINT requisition_templates_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.approval_workflows
  ADD CONSTRAINT approval_workflows_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.job_requisitions
  ADD CONSTRAINT job_requisitions_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.integration_connections
  ADD CONSTRAINT integration_connections_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.candidates
  ADD CONSTRAINT candidates_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.candidate_tags
  ADD CONSTRAINT candidate_tags_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.onboarding_workflows
  ADD CONSTRAINT onboarding_workflows_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;

ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE public.roles ADD CONSTRAINT roles_company_id_id_unique UNIQUE (company_id, id);
ALTER TABLE public.job_requisitions ADD CONSTRAINT job_requisitions_company_id_id_unique UNIQUE (company_id, id);
ALTER TABLE public.candidates ADD CONSTRAINT candidates_company_id_id_unique UNIQUE (company_id, id);
ALTER TABLE public.applications ADD CONSTRAINT applications_company_id_id_unique UNIQUE (company_id, id);

ALTER TABLE public.applications
  ADD CONSTRAINT applications_company_requisition_fkey
  FOREIGN KEY (company_id, requisition_id)
  REFERENCES public.job_requisitions(company_id, id)
  ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_company_candidate_fkey
  FOREIGN KEY (company_id, candidate_id)
  REFERENCES public.candidates(company_id, id)
  ON DELETE CASCADE;

DROP INDEX IF EXISTS public.uq_users_email_lower;
DROP INDEX IF EXISTS public.uq_users_provider_identity;
DROP INDEX IF EXISTS public.uq_requisition_templates_name_lower;
DROP INDEX IF EXISTS public.uq_approval_workflows_default_true;
DROP INDEX IF EXISTS public.uq_integration_connections_platform_lower;
DROP INDEX IF EXISTS public.uq_candidates_email_lower;
DROP INDEX IF EXISTS public.uq_candidate_tags_name_lower;

CREATE UNIQUE INDEX uq_roles_company_name_lower
ON public.roles (company_id, lower(name));

CREATE UNIQUE INDEX uq_users_company_email_lower
ON public.users (company_id, lower(email));

CREATE UNIQUE INDEX uq_users_company_provider_identity
ON public.users (company_id, auth_provider, auth_provider_id)
WHERE auth_provider_id IS NOT NULL;

CREATE UNIQUE INDEX uq_requisition_templates_company_name_lower
ON public.requisition_templates (company_id, lower(name));

CREATE UNIQUE INDEX uq_approval_workflows_company_default_true
ON public.approval_workflows (company_id)
WHERE is_default = true;

CREATE UNIQUE INDEX uq_integration_connections_company_platform_lower
ON public.integration_connections (company_id, lower(platform));

CREATE UNIQUE INDEX uq_candidates_company_email_lower
ON public.candidates (company_id, lower(email));

CREATE UNIQUE INDEX uq_candidate_tags_company_name_lower
ON public.candidate_tags (company_id, lower(name));

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE public.users
  ADD CONSTRAINT users_company_role_fkey
  FOREIGN KEY (company_id, role_id)
  REFERENCES public.roles(company_id, id)
  ON DELETE RESTRICT;

CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_roles_company_id ON public.roles(company_id);
CREATE INDEX idx_requisition_templates_company_id ON public.requisition_templates(company_id);
CREATE INDEX idx_approval_workflows_company_id ON public.approval_workflows(company_id);
CREATE INDEX idx_job_requisitions_company_id ON public.job_requisitions(company_id);
CREATE INDEX idx_integration_connections_company_id ON public.integration_connections(company_id);
CREATE INDEX idx_candidates_company_id ON public.candidates(company_id);
CREATE INDEX idx_candidate_tags_company_id ON public.candidate_tags(company_id);
CREATE INDEX idx_applications_company_id ON public.applications(company_id);
CREATE INDEX idx_onboarding_workflows_company_id ON public.onboarding_workflows(company_id);

CREATE TABLE public.company_pipelines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  process_key text NOT NULL,
  pipeline_key text NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_pipelines_process_key_not_blank CHECK (char_length(trim(process_key)) > 0),
  CONSTRAINT company_pipelines_pipeline_key_not_blank CHECK (char_length(trim(pipeline_key)) > 0),
  CONSTRAINT company_pipelines_name_not_blank CHECK (char_length(trim(name)) > 0),
  CONSTRAINT company_pipelines_company_id_id_unique UNIQUE (company_id, id),
  CONSTRAINT company_pipelines_company_process_pipeline_unique UNIQUE (company_id, process_key, pipeline_key)
);

CREATE UNIQUE INDEX uq_company_pipelines_default_true
ON public.company_pipelines (company_id, process_key)
WHERE is_default = true;

CREATE TABLE public.company_pipeline_stages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id uuid NOT NULL REFERENCES public.company_pipelines(id) ON DELETE CASCADE,
  stage_key text NOT NULL,
  stage_name text NOT NULL,
  stage_order integer NOT NULL,
  is_terminal boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_system_stage boolean NOT NULL DEFAULT false,
  sla_target_days integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_pipeline_stages_stage_key_not_blank CHECK (char_length(trim(stage_key)) > 0),
  CONSTRAINT company_pipeline_stages_stage_name_not_blank CHECK (char_length(trim(stage_name)) > 0),
  CONSTRAINT company_pipeline_stages_stage_order_positive CHECK (stage_order > 0),
  CONSTRAINT company_pipeline_stages_sla_non_negative CHECK (
    sla_target_days IS NULL OR sla_target_days >= 0
  ),
  CONSTRAINT company_pipeline_stages_pipeline_stage_key_unique UNIQUE (pipeline_id, stage_key),
  CONSTRAINT company_pipeline_stages_pipeline_stage_order_unique UNIQUE (pipeline_id, stage_order),
  CONSTRAINT company_pipeline_stages_pipeline_id_id_unique UNIQUE (pipeline_id, id)
);

CREATE TABLE public.company_pipeline_stage_transitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id uuid NOT NULL REFERENCES public.company_pipelines(id) ON DELETE CASCADE,
  from_stage_id uuid,
  to_stage_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  requires_comment boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_pipeline_stage_transitions_no_self_loop CHECK (
    from_stage_id IS NULL OR from_stage_id <> to_stage_id
  ),
  CONSTRAINT company_pipeline_stage_transitions_unique_path UNIQUE (
    pipeline_id,
    from_stage_id,
    to_stage_id
  ),
  CONSTRAINT company_pipeline_stage_transitions_from_stage_fkey
    FOREIGN KEY (pipeline_id, from_stage_id)
    REFERENCES public.company_pipeline_stages(pipeline_id, id)
    ON DELETE CASCADE,
  CONSTRAINT company_pipeline_stage_transitions_to_stage_fkey
    FOREIGN KEY (pipeline_id, to_stage_id)
    REFERENCES public.company_pipeline_stages(pipeline_id, id)
    ON DELETE CASCADE
);

ALTER TABLE public.applications ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.applications
  ALTER COLUMN status TYPE text
  USING status::text;
ALTER TABLE public.applications
  ALTER COLUMN status SET DEFAULT 'submitted';
ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_not_blank
  CHECK (char_length(trim(status)) > 0);

ALTER TABLE public.application_status_history
  ALTER COLUMN from_status TYPE text
  USING from_status::text;
ALTER TABLE public.application_status_history
  ALTER COLUMN to_status TYPE text
  USING to_status::text;
ALTER TABLE public.application_status_history
  ADD CONSTRAINT application_status_history_to_status_not_blank
  CHECK (char_length(trim(to_status)) > 0);

ALTER TABLE public.applications ADD COLUMN pipeline_id uuid;
ALTER TABLE public.applications ADD COLUMN pipeline_stage_id uuid;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_company_pipeline_fkey
  FOREIGN KEY (company_id, pipeline_id)
  REFERENCES public.company_pipelines(company_id, id)
  ON DELETE RESTRICT;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_pipeline_stage_belongs_to_pipeline_fkey
  FOREIGN KEY (pipeline_id, pipeline_stage_id)
  REFERENCES public.company_pipeline_stages(pipeline_id, id)
  ON DELETE RESTRICT;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_stage_requires_pipeline
  CHECK (pipeline_stage_id IS NULL OR pipeline_id IS NOT NULL);

INSERT INTO public.company_pipelines (
  company_id,
  process_key,
  pipeline_key,
  name,
  description,
  is_default,
  is_active,
  metadata
)
SELECT
  c.id,
  'recruiting',
  'default',
  'Default Recruiting Pipeline',
  'Auto-generated from legacy application statuses.',
  true,
  true,
  '{}'::jsonb
FROM public.companies c
ON CONFLICT (company_id, process_key, pipeline_key) DO NOTHING;

WITH stage_seed AS (
  SELECT *
  FROM (
    VALUES
      ('submitted', 'Submitted', 1, false),
      ('under_review', 'Under Review', 2, false),
      ('shortlisted', 'Shortlisted', 3, false),
      ('interview_scheduled', 'Interview Scheduled', 4, false),
      ('interviewing', 'Interviewing', 5, false),
      ('offer_pending', 'Offer Pending', 6, false),
      ('offered', 'Offered', 7, false),
      ('hired', 'Hired', 8, true),
      ('rejected', 'Rejected', 9, true),
      ('withdrawn', 'Withdrawn', 10, true)
  ) AS s(stage_key, stage_name, stage_order, is_terminal)
)
INSERT INTO public.company_pipeline_stages (
  pipeline_id,
  stage_key,
  stage_name,
  stage_order,
  is_terminal,
  is_active,
  is_system_stage,
  metadata
)
SELECT
  p.id,
  s.stage_key,
  s.stage_name,
  s.stage_order,
  s.is_terminal,
  true,
  true,
  '{}'::jsonb
FROM public.company_pipelines p
JOIN stage_seed s ON true
WHERE p.process_key = 'recruiting'
  AND p.pipeline_key = 'default'
ON CONFLICT (pipeline_id, stage_key) DO NOTHING;

UPDATE public.applications a
SET pipeline_id = p.id
FROM public.company_pipelines p
WHERE p.company_id = a.company_id
  AND p.process_key = 'recruiting'
  AND p.is_default = true
  AND a.pipeline_id IS NULL;

UPDATE public.applications a
SET pipeline_stage_id = s.id
FROM public.company_pipeline_stages s
WHERE s.pipeline_id = a.pipeline_id
  AND s.stage_key = lower(replace(trim(a.status), ' ', '_'))
  AND a.pipeline_stage_id IS NULL;

INSERT INTO public.company_pipeline_stage_transitions (
  pipeline_id,
  from_stage_id,
  to_stage_id,
  is_active,
  requires_comment,
  metadata
)
SELECT
  seq.pipeline_id,
  seq.from_stage_id,
  seq.to_stage_id,
  true,
  false,
  '{}'::jsonb
FROM (
  SELECT
    s.pipeline_id,
    s.id AS from_stage_id,
    lead(s.id) OVER (PARTITION BY s.pipeline_id ORDER BY s.stage_order) AS to_stage_id
  FROM public.company_pipeline_stages s
) seq
WHERE seq.to_stage_id IS NOT NULL
ON CONFLICT (pipeline_id, from_stage_id, to_stage_id) DO NOTHING;

CREATE TABLE public.application_pipeline_stage_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  pipeline_id uuid NOT NULL REFERENCES public.company_pipelines(id) ON DELETE RESTRICT,
  from_stage_id uuid,
  to_stage_id uuid NOT NULL,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  change_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT application_pipeline_stage_history_to_stage_fkey
    FOREIGN KEY (pipeline_id, to_stage_id)
    REFERENCES public.company_pipeline_stages(pipeline_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT application_pipeline_stage_history_from_stage_fkey
    FOREIGN KEY (pipeline_id, from_stage_id)
    REFERENCES public.company_pipeline_stages(pipeline_id, id)
    ON DELETE RESTRICT
);

ALTER TABLE public.application_pipeline_stage_history
  ADD CONSTRAINT application_pipeline_stage_history_company_application_fkey
  FOREIGN KEY (company_id, application_id)
  REFERENCES public.applications(company_id, id)
  ON DELETE CASCADE;

ALTER TABLE public.application_pipeline_stage_history
  ADD CONSTRAINT application_pipeline_stage_history_company_pipeline_fkey
  FOREIGN KEY (company_id, pipeline_id)
  REFERENCES public.company_pipelines(company_id, id)
  ON DELETE RESTRICT;

INSERT INTO public.application_pipeline_stage_history (
  company_id,
  application_id,
  pipeline_id,
  from_stage_id,
  to_stage_id,
  changed_by,
  change_reason,
  metadata,
  changed_at
)
SELECT
  a.company_id,
  h.application_id,
  a.pipeline_id,
  fs.id,
  ts.id,
  h.changed_by,
  h.reason,
  '{}'::jsonb,
  h.changed_at
FROM public.application_status_history h
JOIN public.applications a
  ON a.id = h.application_id
LEFT JOIN public.company_pipeline_stages fs
  ON fs.pipeline_id = a.pipeline_id
 AND fs.stage_key = lower(replace(trim(coalesce(h.from_status, '')), ' ', '_'))
LEFT JOIN public.company_pipeline_stages ts
  ON ts.pipeline_id = a.pipeline_id
 AND ts.stage_key = lower(replace(trim(h.to_status), ' ', '_'))
WHERE a.pipeline_id IS NOT NULL
  AND ts.id IS NOT NULL;

CREATE INDEX idx_company_pipelines_company_id
ON public.company_pipelines(company_id);

CREATE INDEX idx_company_pipelines_process_key
ON public.company_pipelines(process_key);

CREATE INDEX idx_company_pipeline_stages_pipeline_id
ON public.company_pipeline_stages(pipeline_id);

CREATE INDEX idx_company_pipeline_stages_stage_key
ON public.company_pipeline_stages(stage_key);

CREATE INDEX idx_company_pipeline_stage_transitions_pipeline_id
ON public.company_pipeline_stage_transitions(pipeline_id);

CREATE INDEX idx_applications_pipeline_id
ON public.applications(pipeline_id);

CREATE INDEX idx_applications_pipeline_stage_id
ON public.applications(pipeline_stage_id);

CREATE INDEX idx_application_pipeline_stage_history_application_id
ON public.application_pipeline_stage_history(application_id);

CREATE INDEX idx_application_pipeline_stage_history_company_id
ON public.application_pipeline_stage_history(company_id);

CREATE INDEX idx_application_pipeline_stage_history_pipeline_id
ON public.application_pipeline_stage_history(pipeline_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.udt_schema = 'public'
      AND c.udt_name = 'application_status'
  ) THEN
    DROP TYPE IF EXISTS public.application_status;
  END IF;
END
$$;

CREATE TRIGGER trg_companies_set_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_company_pipelines_set_updated_at
BEFORE UPDATE ON public.company_pipelines
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_company_pipeline_stages_set_updated_at
BEFORE UPDATE ON public.company_pipeline_stages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMIT;
