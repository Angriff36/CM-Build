-- 0003_task_lifecycle.sql
-- Description: Extend schema with task lifecycle columns, enums, and supporting tables for realtime dashboards per I2.T1.
-- References: I2.T1, 3-6-data-model-overview-erd

-- Create priority enum
CREATE TYPE public.task_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);

-- Alter tasks table to use enum for priority
ALTER TABLE public.tasks ALTER COLUMN priority TYPE public.task_priority USING priority::public.task_priority;

-- Add last_heartbeat_at to realtime_subscriptions for presence heartbeats
ALTER TABLE public.realtime_subscriptions ADD COLUMN last_heartbeat_at timestamp with time zone DEFAULT now();

-- Create task_similarity_suggestions table
CREATE TABLE public.task_similarity_suggestions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    task_id uuid NOT NULL,
    suggested_task_id uuid NOT NULL,
    similarity_score numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT task_similarity_suggestions_pkey PRIMARY KEY (id),
    CONSTRAINT task_similarity_suggestions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT task_similarity_suggestions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_similarity_suggestions_suggested_task_id_fkey FOREIGN KEY (suggested_task_id) REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- Create undo_tokens table
CREATE TABLE public.undo_tokens (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    task_id uuid NOT NULL,
    token text NOT NULL UNIQUE,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT undo_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT undo_tokens_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT undo_tokens_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_task_similarity_suggestions_company_task ON public.task_similarity_suggestions(company_id, task_id);
CREATE INDEX idx_undo_tokens_company_token ON public.undo_tokens(company_id, token);
CREATE INDEX idx_realtime_subscriptions_company_heartbeat ON public.realtime_subscriptions(company_id, last_heartbeat_at);

-- Down migration (for reversibility)
-- DROP INDEX IF EXISTS idx_realtime_subscriptions_company_heartbeat;
-- DROP INDEX IF EXISTS idx_undo_tokens_company_token;
-- DROP INDEX IF EXISTS idx_task_similarity_suggestions_company_task;
-- DROP TABLE IF EXISTS public.undo_tokens;
-- DROP TABLE IF EXISTS public.task_similarity_suggestions;
-- ALTER TABLE public.realtime_subscriptions DROP COLUMN IF EXISTS last_heartbeat_at;
-- ALTER TABLE public.tasks ALTER COLUMN priority TYPE text USING priority::text;
-- DROP TYPE IF EXISTS public.task_priority;