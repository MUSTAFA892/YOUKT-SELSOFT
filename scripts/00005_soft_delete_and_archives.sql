-- Migration: 00005_soft_delete_and_archives.sql
-- Adds soft-delete support (deleted_at/deleted_by), archive tables,
-- and a generic archiver function. Call `SELECT public.archive_deleted_rows('30 days'::interval)`
-- (or schedule it) to move old deleted rows into archive tables.

BEGIN;

-- 1) Add nullable soft-delete columns to main tables (safe, idempotent)
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.ai_screening_runs ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.ai_screening_runs ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.application_screenings ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.application_screenings ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.application_screening_step_results ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.application_screening_step_results ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.application_screening_events ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.application_screening_events ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.interview_participants ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.interview_participants ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.interview_evaluations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.interview_evaluations ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.onboardings ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.onboardings ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.onboarding_tasks ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.onboarding_tasks ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.incoming_webhooks ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.incoming_webhooks ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.candidate_notes ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.candidate_notes ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.candidate_tag_links ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.candidate_tag_links ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.candidate_skills ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.candidate_skills ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.job_distributions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.job_distributions ADD COLUMN IF NOT EXISTS deleted_by uuid;

-- 2) Create archive tables (structure-only, no FK/index/constraint copying)
CREATE TABLE IF NOT EXISTS public.application_screening_step_results_archive (LIKE public.application_screening_step_results INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.application_screening_events_archive (LIKE public.application_screening_events INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.application_screenings_archive (LIKE public.application_screenings INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.ai_screening_runs_archive (LIKE public.ai_screening_runs INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.interview_participants_archive (LIKE public.interview_participants INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.interview_evaluations_archive (LIKE public.interview_evaluations INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.interviews_archive (LIKE public.interviews INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.offers_archive (LIKE public.offers INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.onboarding_tasks_archive (LIKE public.onboarding_tasks INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.onboardings_archive (LIKE public.onboardings INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.application_status_history_archive (LIKE public.application_status_history INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.application_pipeline_stage_history_archive (LIKE public.application_pipeline_stage_history INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.applications_archive (LIKE public.applications INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.candidate_skills_archive (LIKE public.candidate_skills INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.candidate_tag_links_archive (LIKE public.candidate_tag_links INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.candidate_notes_archive (LIKE public.candidate_notes INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.candidate_tags_archive (LIKE public.candidate_tags INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.candidates_archive (LIKE public.candidates INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.incoming_webhooks_archive (LIKE public.incoming_webhooks INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);
CREATE TABLE IF NOT EXISTS public.job_distributions_archive (LIKE public.job_distributions INCLUDING DEFAULTS INCLUDING STORAGE INCLUDING COMMENTS);

-- 3) Generic archiver for a single table (moves rows older than cutoff to corresponding archive table)
CREATE OR REPLACE FUNCTION public._archive_table_rows(tbl_name text, archive_tbl text, cutoff timestamptz)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  moved_count integer := 0;
BEGIN
  EXECUTE format(
    'WITH moved AS (
       DELETE FROM public.%I
       WHERE deleted_at IS NOT NULL
         AND deleted_at < $1
       RETURNING *
     )
     INSERT INTO public.%I SELECT * FROM moved',
    tbl_name,
    archive_tbl
  ) USING cutoff;
  GET DIAGNOSTICS moved_count = ROW_COUNT;
  RETURN COALESCE(moved_count, 0);
END;
$$;

-- 4) High-level archiver that runs in a safe (child-first) order and returns a JSON summary
CREATE OR REPLACE FUNCTION public.archive_deleted_rows(retention_interval interval)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  cutoff timestamptz := now() - retention_interval;
  result jsonb := '{}'::jsonb;
  n int;
BEGIN
  -- child tables first (so FKs do not block deletes)
  n := public._archive_table_rows('application_screening_step_results', 'application_screening_step_results_archive', cutoff);
  result := result || jsonb_build_object('application_screening_step_results', n);

  n := public._archive_table_rows('application_screening_events', 'application_screening_events_archive', cutoff);
  result := result || jsonb_build_object('application_screening_events', n);

  n := public._archive_table_rows('application_screenings', 'application_screenings_archive', cutoff);
  result := result || jsonb_build_object('application_screenings', n);

  n := public._archive_table_rows('ai_screening_runs', 'ai_screening_runs_archive', cutoff);
  result := result || jsonb_build_object('ai_screening_runs', n);

  n := public._archive_table_rows('interview_participants', 'interview_participants_archive', cutoff);
  result := result || jsonb_build_object('interview_participants', n);

  n := public._archive_table_rows('interview_evaluations', 'interview_evaluations_archive', cutoff);
  result := result || jsonb_build_object('interview_evaluations', n);

  n := public._archive_table_rows('interviews', 'interviews_archive', cutoff);
  result := result || jsonb_build_object('interviews', n);

  n := public._archive_table_rows('offers', 'offers_archive', cutoff);
  result := result || jsonb_build_object('offers', n);

  n := public._archive_table_rows('onboarding_tasks', 'onboarding_tasks_archive', cutoff);
  result := result || jsonb_build_object('onboarding_tasks', n);

  n := public._archive_table_rows('onboardings', 'onboardings_archive', cutoff);
  result := result || jsonb_build_object('onboardings', n);

  n := public._archive_table_rows('application_status_history', 'application_status_history_archive', cutoff);
  result := result || jsonb_build_object('application_status_history', n);

  n := public._archive_table_rows('application_pipeline_stage_history', 'application_pipeline_stage_history_archive', cutoff);
  result := result || jsonb_build_object('application_pipeline_stage_history', n);

  n := public._archive_table_rows('applications', 'applications_archive', cutoff);
  result := result || jsonb_build_object('applications', n);

  n := public._archive_table_rows('candidate_skills', 'candidate_skills_archive', cutoff);
  result := result || jsonb_build_object('candidate_skills', n);

  n := public._archive_table_rows('candidate_tag_links', 'candidate_tag_links_archive', cutoff);
  result := result || jsonb_build_object('candidate_tag_links', n);

  n := public._archive_table_rows('candidate_notes', 'candidate_notes_archive', cutoff);
  result := result || jsonb_build_object('candidate_notes', n);

  n := public._archive_table_rows('candidate_tags', 'candidate_tags_archive', cutoff);
  result := result || jsonb_build_object('candidate_tags', n);

  n := public._archive_table_rows('candidates', 'candidates_archive', cutoff);
  result := result || jsonb_build_object('candidates', n);

  n := public._archive_table_rows('incoming_webhooks', 'incoming_webhooks_archive', cutoff);
  result := result || jsonb_build_object('incoming_webhooks', n);

  n := public._archive_table_rows('job_distributions', 'job_distributions_archive', cutoff);
  result := result || jsonb_build_object('job_distributions', n);

  RETURN result;
END;
$$;

-- 5) Generic trigger function that converts physical DELETEs into soft-deletes
CREATE OR REPLACE FUNCTION public.soft_delete_convert_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- perform an UPDATE on the same table setting deleted_at; RETURN NULL to suppress the DELETE
  EXECUTE format('UPDATE %I.%I SET deleted_at = now() WHERE id = $1', TG_TABLE_SCHEMA, TG_TABLE_NAME) USING OLD.id;
  RETURN NULL;
END;
$$;

-- Attach the soft-delete trigger to tables where we want DB-level enforcement
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'applications') THEN
    PERFORM 1 FROM pg_trigger WHERE tgname = 'trg_soft_delete_applications';
    IF NOT FOUND THEN
      EXECUTE 'CREATE TRIGGER trg_soft_delete_applications BEFORE DELETE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.soft_delete_convert_delete()';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates') THEN
    PERFORM 1 FROM pg_trigger WHERE tgname = 'trg_soft_delete_candidates';
    IF NOT FOUND THEN
      EXECUTE 'CREATE TRIGGER trg_soft_delete_candidates BEFORE DELETE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.soft_delete_convert_delete()';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_screening_runs') THEN
    PERFORM 1 FROM pg_trigger WHERE tgname = 'trg_soft_delete_ai_screening_runs';
    IF NOT FOUND THEN
      EXECUTE 'CREATE TRIGGER trg_soft_delete_ai_screening_runs BEFORE DELETE ON public.ai_screening_runs FOR EACH ROW EXECUTE FUNCTION public.soft_delete_convert_delete()';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'application_screenings') THEN
    PERFORM 1 FROM pg_trigger WHERE tgname = 'trg_soft_delete_application_screenings';
    IF NOT FOUND THEN
      EXECUTE 'CREATE TRIGGER trg_soft_delete_application_screenings BEFORE DELETE ON public.application_screenings FOR EACH ROW EXECUTE FUNCTION public.soft_delete_convert_delete()';
    END IF;
  END IF;

  -- add triggers for a small set of high-volume tables; expand as needed
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'application_screening_step_results') THEN
    PERFORM 1 FROM pg_trigger WHERE tgname = 'trg_soft_delete_application_screening_step_results';
    IF NOT FOUND THEN
      EXECUTE 'CREATE TRIGGER trg_soft_delete_application_screening_step_results BEFORE DELETE ON public.application_screening_step_results FOR EACH ROW EXECUTE FUNCTION public.soft_delete_convert_delete()';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'application_screening_events') THEN
    PERFORM 1 FROM pg_trigger WHERE tgname = 'trg_soft_delete_application_screening_events';
    IF NOT FOUND THEN
      EXECUTE 'CREATE TRIGGER trg_soft_delete_application_screening_events BEFORE DELETE ON public.application_screening_events FOR EACH ROW EXECUTE FUNCTION public.soft_delete_convert_delete()';
    END IF;
  END IF;
END;
$$;

-- 6) Create helpful partial indexes for queries that filter on active rows (deleted_at IS NULL).
-- Only create company-scoped indexes when the table has `company_id`.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='applications' AND column_name='company_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_applications_company_active ON public.applications (company_id) WHERE deleted_at IS NULL';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='candidates' AND column_name='company_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_candidates_company_active ON public.candidates (company_id) WHERE deleted_at IS NULL';
  END IF;

  -- for tables without company_id, create a cheap index on deleted_at to help archive queries
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_incoming_webhooks_not_deleted ON public.incoming_webhooks (received_at) WHERE deleted_at IS NULL';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_job_distributions_not_deleted ON public.job_distributions (requisition_id) WHERE deleted_at IS NULL';
END;
$$;

COMMIT;

-- USAGE NOTES:
-- 1) To perform a soft-delete from the app: `UPDATE public.applications SET deleted_at = now(), deleted_by = '<user-uuid>' WHERE id = '<id>'`.
--    Alternatively, `DELETE FROM public.applications WHERE id = '<id>'` will now be converted into an UPDATE by the trigger.
-- 2) To archive rows older than 30 days: `SELECT public.archive_deleted_rows('30 days'::interval);`
-- 3) Schedule archiving using `pg_cron` or an external cron that runs `psql -c "SELECT public.archive_deleted_rows('30 days'::interval);" --dbname=<db>`.
