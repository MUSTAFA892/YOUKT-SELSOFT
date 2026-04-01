BEGIN;

CREATE TABLE public.screening_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  method_key text NOT NULL,
  name text NOT NULL,
  description text,
  process_key text NOT NULL DEFAULT 'recruiting',
  execution_mode text NOT NULL DEFAULT 'human',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_required boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT screening_methods_method_key_not_blank CHECK (char_length(trim(method_key)) > 0),
  CONSTRAINT screening_methods_name_not_blank CHECK (char_length(trim(name)) > 0),
  CONSTRAINT screening_methods_process_key_not_blank CHECK (char_length(trim(process_key)) > 0),
  CONSTRAINT screening_methods_execution_mode_valid CHECK (
    execution_mode IN ('ai', 'human', 'hybrid')
  ),
  CONSTRAINT screening_methods_company_method_unique UNIQUE (company_id, method_key),
  CONSTRAINT screening_methods_company_id_id_unique UNIQUE (company_id, id)
);

CREATE TABLE public.screening_method_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  method_id uuid NOT NULL REFERENCES public.screening_methods(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  step_name text NOT NULL,
  step_order integer NOT NULL,
  evaluator_type text NOT NULL DEFAULT 'human',
  is_required boolean NOT NULL DEFAULT true,
  pass_threshold numeric(5,2),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT screening_method_steps_step_key_not_blank CHECK (char_length(trim(step_key)) > 0),
  CONSTRAINT screening_method_steps_step_name_not_blank CHECK (char_length(trim(step_name)) > 0),
  CONSTRAINT screening_method_steps_step_order_positive CHECK (step_order > 0),
  CONSTRAINT screening_method_steps_evaluator_type_valid CHECK (
    evaluator_type IN ('ai', 'human', 'hybrid')
  ),
  CONSTRAINT screening_method_steps_pass_threshold_range CHECK (
    pass_threshold IS NULL OR (pass_threshold >= 0 AND pass_threshold <= 100)
  ),
  CONSTRAINT screening_method_steps_method_step_key_unique UNIQUE (method_id, step_key),
  CONSTRAINT screening_method_steps_method_step_order_unique UNIQUE (method_id, step_order),
  CONSTRAINT screening_method_steps_method_id_id_unique UNIQUE (method_id, id)
);

CREATE TABLE public.application_screenings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  application_id uuid NOT NULL,
  method_id uuid NOT NULL,
  attempt_no integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  execution_mode text NOT NULL DEFAULT 'human',
  assigned_to_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  performed_by_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ai_provider text,
  ai_model text,
  ai_model_version text,
  score numeric(5,2),
  confidence numeric(5,4),
  decision text,
  summary text,
  findings jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  legacy_ai_screening_run_id uuid REFERENCES public.ai_screening_runs(id) ON DELETE SET NULL,
  CONSTRAINT application_screenings_attempt_positive CHECK (attempt_no > 0),
  CONSTRAINT application_screenings_status_not_blank CHECK (char_length(trim(status)) > 0),
  CONSTRAINT application_screenings_execution_mode_valid CHECK (
    execution_mode IN ('ai', 'human', 'hybrid')
  ),
  CONSTRAINT application_screenings_score_range CHECK (
    score IS NULL OR (score >= 0 AND score <= 100)
  ),
  CONSTRAINT application_screenings_confidence_range CHECK (
    confidence IS NULL OR (confidence >= 0 AND confidence <= 1)
  ),
  CONSTRAINT application_screenings_completed_after_started CHECK (
    started_at IS NULL OR completed_at IS NULL OR completed_at >= started_at
  ),
  CONSTRAINT application_screenings_human_actor_required CHECK (
    execution_mode <> 'human'
    OR assigned_to_user_id IS NOT NULL
    OR performed_by_user_id IS NOT NULL
  ),
  CONSTRAINT application_screenings_ai_actor_required CHECK (
    execution_mode <> 'ai'
    OR ai_model IS NOT NULL
    OR ai_provider IS NOT NULL
  ),
  CONSTRAINT application_screenings_company_application_fkey
    FOREIGN KEY (company_id, application_id)
    REFERENCES public.applications(company_id, id)
    ON DELETE CASCADE,
  CONSTRAINT application_screenings_company_method_fkey
    FOREIGN KEY (company_id, method_id)
    REFERENCES public.screening_methods(company_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT application_screenings_legacy_ai_run_unique UNIQUE (legacy_ai_screening_run_id),
  CONSTRAINT application_screenings_application_method_attempt_unique UNIQUE (application_id, method_id, attempt_no),
  CONSTRAINT application_screenings_id_method_unique UNIQUE (id, method_id)
);

CREATE TABLE public.application_screening_step_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  screening_id uuid NOT NULL,
  method_id uuid NOT NULL,
  step_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewer_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ai_provider text,
  ai_model text,
  score numeric(5,2),
  notes text,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT application_screening_step_results_status_not_blank CHECK (
    char_length(trim(status)) > 0
  ),
  CONSTRAINT application_screening_step_results_score_range CHECK (
    score IS NULL OR (score >= 0 AND score <= 100)
  ),
  CONSTRAINT application_screening_step_results_completed_after_started CHECK (
    started_at IS NULL OR completed_at IS NULL OR completed_at >= started_at
  ),
  CONSTRAINT application_screening_step_results_screening_step_unique UNIQUE (screening_id, step_id),
  CONSTRAINT application_screening_step_results_screening_method_fkey
    FOREIGN KEY (screening_id, method_id)
    REFERENCES public.application_screenings(id, method_id)
    ON DELETE CASCADE,
  CONSTRAINT application_screening_step_results_method_step_fkey
    FOREIGN KEY (method_id, step_id)
    REFERENCES public.screening_method_steps(method_id, id)
    ON DELETE CASCADE
);

CREATE TABLE public.application_screening_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  screening_id uuid NOT NULL REFERENCES public.application_screenings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_type text NOT NULL DEFAULT 'system',
  actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  note text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT application_screening_events_event_type_not_blank CHECK (
    char_length(trim(event_type)) > 0
  ),
  CONSTRAINT application_screening_events_actor_type_valid CHECK (
    actor_type IN ('human', 'ai', 'system')
  )
);

INSERT INTO public.screening_methods (
  company_id,
  method_key,
  name,
  description,
  process_key,
  execution_mode,
  config,
  is_required,
  is_active
)
SELECT
  c.id,
  seed.method_key,
  seed.name,
  seed.description,
  'recruiting',
  seed.execution_mode,
  '{}'::jsonb,
  seed.is_required,
  true
FROM public.companies c
JOIN (
  VALUES
    (
      'ai_resume_screen',
      'AI Resume Screen',
      'Automated AI-first screening from candidate resume and profile data.',
      'ai',
      true
    ),
    (
      'recruiter_phone_screen',
      'Recruiter Phone Screen',
      'Human-led initial screening call for fit, expectations, and communication.',
      'human',
      false
    ),
    (
      'hybrid_structured_screen',
      'Hybrid Structured Screen',
      'Human interview with AI-assisted summary and consistency checks.',
      'hybrid',
      false
    )
) AS seed(method_key, name, description, execution_mode, is_required)
  ON true
ON CONFLICT (company_id, method_key) DO NOTHING;

WITH step_seed AS (
  SELECT *
  FROM (
    VALUES
      ('ai_resume_screen', 'extract_profile', 'Extract Profile Signals', 1, 'ai', true, NULL::numeric),
      ('ai_resume_screen', 'fit_scoring', 'Generate Fit Score', 2, 'ai', true, 60.0::numeric),
      ('recruiter_phone_screen', 'expectations_check', 'Expectations Check', 1, 'human', true, NULL::numeric),
      ('recruiter_phone_screen', 'core_competency_probe', 'Core Competency Probe', 2, 'human', true, 50.0::numeric),
      ('hybrid_structured_screen', 'structured_interview', 'Structured Interview', 1, 'human', true, NULL::numeric),
      ('hybrid_structured_screen', 'ai_summary_and_bias_check', 'AI Summary and Bias Check', 2, 'ai', false, NULL::numeric)
  ) AS s(method_key, step_key, step_name, step_order, evaluator_type, is_required, pass_threshold)
)
INSERT INTO public.screening_method_steps (
  method_id,
  step_key,
  step_name,
  step_order,
  evaluator_type,
  is_required,
  pass_threshold,
  config
)
SELECT
  m.id,
  s.step_key,
  s.step_name,
  s.step_order,
  s.evaluator_type,
  s.is_required,
  s.pass_threshold,
  '{}'::jsonb
FROM public.screening_methods m
JOIN step_seed s
  ON s.method_key = m.method_key
ON CONFLICT (method_id, step_key) DO NOTHING;

INSERT INTO public.application_screenings (
  company_id,
  application_id,
  method_id,
  attempt_no,
  status,
  execution_mode,
  ai_provider,
  ai_model,
  ai_model_version,
  score,
  confidence,
  decision,
  summary,
  findings,
  started_at,
  completed_at,
  created_at,
  updated_at,
  legacy_ai_screening_run_id
)
SELECT
  a.company_id,
  r.application_id,
  m.id,
  1,
  r.status::text,
  'ai',
  'legacy_ai_screening',
  r.model_name,
  r.model_version,
  r.score,
  CASE
    WHEN (r.raw_response ->> 'confidence') ~ '^[0-9]+(\.[0-9]+)?$' THEN
      CASE
        WHEN (r.raw_response ->> 'confidence')::numeric >= 0
             AND (r.raw_response ->> 'confidence')::numeric <= 1
          THEN (r.raw_response ->> 'confidence')::numeric
        WHEN (r.raw_response ->> 'confidence')::numeric > 1
             AND (r.raw_response ->> 'confidence')::numeric <= 100
          THEN ((r.raw_response ->> 'confidence')::numeric / 100.0)
        ELSE NULL
      END
    ELSE NULL
  END,
  NULL,
  r.summary,
  jsonb_build_object(
    'strengths', to_jsonb(r.strengths),
    'risks', to_jsonb(r.risks),
    'raw_response', r.raw_response
  ),
  r.started_at,
  r.completed_at,
  r.created_at,
  now(),
  r.id
FROM public.ai_screening_runs r
JOIN public.applications a
  ON a.id = r.application_id
JOIN public.screening_methods m
  ON m.company_id = a.company_id
 AND m.method_key = 'ai_resume_screen'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.application_screenings s
  WHERE s.legacy_ai_screening_run_id = r.id
);

INSERT INTO public.application_screening_events (
  screening_id,
  event_type,
  actor_type,
  actor_user_id,
  note,
  payload,
  created_at
)
SELECT
  s.id,
  'migrated_from_ai_screening_runs',
  'system',
  NULL,
  'Migrated legacy ai_screening_runs record into unified screening model.',
  jsonb_build_object('legacy_ai_screening_run_id', s.legacy_ai_screening_run_id),
  s.created_at
FROM public.application_screenings s
WHERE s.legacy_ai_screening_run_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.application_screening_events e
    WHERE e.screening_id = s.id
      AND e.event_type = 'migrated_from_ai_screening_runs'
  );

ALTER TABLE public.ai_screening_runs ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.ai_screening_runs
  ALTER COLUMN status TYPE text
  USING status::text;
ALTER TABLE public.ai_screening_runs
  ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.ai_screening_runs
  ADD CONSTRAINT ai_screening_runs_status_not_blank
  CHECK (char_length(trim(status)) > 0);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.udt_schema = 'public'
      AND c.udt_name = 'screening_status'
  ) THEN
    DROP TYPE IF EXISTS public.screening_status;
  END IF;
END
$$;

CREATE INDEX idx_screening_methods_company_id
ON public.screening_methods(company_id);

CREATE INDEX idx_screening_methods_company_process_active
ON public.screening_methods(company_id, process_key, is_active);

CREATE INDEX idx_screening_method_steps_method_id
ON public.screening_method_steps(method_id);

CREATE INDEX idx_screening_method_steps_method_id_step_order
ON public.screening_method_steps(method_id, step_order);

CREATE INDEX idx_application_screenings_application_id
ON public.application_screenings(application_id);

CREATE INDEX idx_application_screenings_company_status
ON public.application_screenings(company_id, status);

CREATE INDEX idx_application_screenings_method_id
ON public.application_screenings(method_id);

CREATE INDEX idx_application_screening_step_results_screening_id
ON public.application_screening_step_results(screening_id);

CREATE INDEX idx_application_screening_step_results_step_id
ON public.application_screening_step_results(step_id);

CREATE INDEX idx_application_screening_events_screening_created_at
ON public.application_screening_events(screening_id, created_at DESC);

CREATE INDEX idx_ai_screening_runs_status_text
ON public.ai_screening_runs(status);

DROP INDEX IF EXISTS public.idx_ai_screening_runs_status;

CREATE TRIGGER trg_screening_methods_set_updated_at
BEFORE UPDATE ON public.screening_methods
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_screening_method_steps_set_updated_at
BEFORE UPDATE ON public.screening_method_steps
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_application_screenings_set_updated_at
BEFORE UPDATE ON public.application_screenings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_application_screening_step_results_set_updated_at
BEFORE UPDATE ON public.application_screening_step_results
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMIT;
