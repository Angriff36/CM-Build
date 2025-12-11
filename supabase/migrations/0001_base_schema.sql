-- 0001_base_schema.sql
-- Description: Initial schema for PrepChef application including all core entities per blueprint Section 5-0-the-contract, I1.T4.
-- References: 5-0-the-contract, I1.T4

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- Enums
-- -------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM (
    'owner',
    'manager',
    'event_lead',
    'staff'
);

CREATE TYPE public.task_status AS ENUM (
    'available',
    'claimed',
    'in_progress',
    'completed'
);

CREATE TYPE public.event_status AS ENUM (
    'scheduled',
    'active',
    'complete',
    'archived'
);

-- -------------------------------------------------------------------------
-- Tables
-- -------------------------------------------------------------------------

-- 1. Companies (Tenants)
-- Reference: 5-0-the-contract
CREATE TABLE public.companies (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    timezone text NOT NULL DEFAULT 'UTC',
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT companies_pkey PRIMARY KEY (id)
);

-- 2. Users (Extends auth.users)
-- Reference: 5-0-the-contract
CREATE TABLE public.users (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    role public.user_role NOT NULL DEFAULT 'staff'::public.user_role,
    display_name text,
    avatar_url text,
    contact_info jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 3. Events
-- Reference: 5-0-the-contract
CREATE TABLE public.events (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    name text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    location text,
    notes text,
    status public.event_status NOT NULL DEFAULT 'scheduled'::public.event_status,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 4. Tasks
-- Reference: 5-0-the-contract
CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    event_id uuid,
    name text NOT NULL,
    quantity numeric NOT NULL DEFAULT 1,
    unit text,
    status public.task_status NOT NULL DEFAULT 'available'::public.task_status,
    priority text DEFAULT 'normal',
    assigned_user_id uuid,
    combined_group_id uuid,
    instructions_ref text,
    undo_token text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tasks_pkey PRIMARY KEY (id),
    CONSTRAINT tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT tasks_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
    CONSTRAINT tasks_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT tasks_combined_group_id_fkey FOREIGN KEY (combined_group_id) REFERENCES public.combined_task_groups(id) ON DELETE SET NULL
);

-- 5. CombinedTaskGroups
-- Reference: 5-0-the-contract
CREATE TABLE public.combined_task_groups (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    base_task_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    aggregated_quantity numeric NOT NULL,
    unit text,
    heuristic_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    approved_by_user_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT combined_task_groups_pkey PRIMARY KEY (id),
    CONSTRAINT combined_task_groups_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT combined_task_groups_approved_by_user_id_fkey FOREIGN KEY (approved_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- 6. Recipes
-- Reference: 5-0-the-contract
CREATE TABLE public.recipes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    name text NOT NULL,
    ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
    steps jsonb NOT NULL DEFAULT '[]'::jsonb,
    media_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
    version text DEFAULT '1.0',
    tags text[],
    allergen_flags text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT recipes_pkey PRIMARY KEY (id),
    CONSTRAINT recipes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 7. MethodDocuments
-- Reference: 5-0-the-contract
CREATE TABLE public.method_documents (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    title text NOT NULL,
    steps jsonb NOT NULL DEFAULT '[]'::jsonb,
    video_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
    skill_level text,
    last_reviewed_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT method_documents_pkey PRIMARY KEY (id),
    CONSTRAINT method_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT method_documents_last_reviewed_by_fkey FOREIGN KEY (last_reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- 8. MediaAssets
-- Reference: 5-0-the-contract
CREATE TABLE public.media_assets (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    url text NOT NULL,
    type text NOT NULL,
    thumbnail_url text,
    duration numeric,
    status text NOT NULL DEFAULT 'pending',
    storage_path text NOT NULL,
    checksum text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT media_assets_pkey PRIMARY KEY (id),
    CONSTRAINT media_assets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 9. RoleAssignments
-- Reference: 5-0-the-contract
CREATE TABLE public.role_assignments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.user_role NOT NULL,
    granted_by uuid NOT NULL,
    granted_at timestamp with time zone NOT NULL DEFAULT now(),
    revoked_at timestamp with time zone,
    CONSTRAINT role_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT role_assignments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT role_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT role_assignments_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 10. AuditLogs
-- Reference: 5-0-the-contract
CREATE TABLE public.audit_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    user_id uuid,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL,
    diff jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
    CONSTRAINT audit_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- 11. NotificationPreferences
-- Reference: 5-0-the-contract
CREATE TABLE public.notification_preferences (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    channel text NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    quiet_hours text,
    CONSTRAINT notification_preferences_pkey PRIMARY KEY (id),
    CONSTRAINT notification_preferences_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 12. RealtimeSubscriptions
-- Reference: 5-0-the-contract
CREATE TABLE public.realtime_subscriptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    channel_name text NOT NULL,
    last_seen_event_id uuid,
    device_id text,
    CONSTRAINT realtime_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT realtime_subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 13. TaskComments
-- Reference: 5-0-the-contract
CREATE TABLE public.task_comments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    task_id uuid NOT NULL,
    company_id uuid NOT NULL,
    author_id uuid NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT task_comments_pkey PRIMARY KEY (id),
    CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_comments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT task_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 14. Stations
-- Reference: 5-0-the-contract
CREATE TABLE public.stations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    CONSTRAINT stations_pkey PRIMARY KEY (id),
    CONSTRAINT stations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 15. StaffSchedules
-- Reference: 5-0-the-contract
CREATE TABLE public.staff_schedules (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid,
    shift_start timestamp with time zone NOT NULL,
    shift_end timestamp with time zone NOT NULL,
    role_override public.user_role,
    CONSTRAINT staff_schedules_pkey PRIMARY KEY (id),
    CONSTRAINT staff_schedules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT staff_schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT staff_schedules_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE
);

-- 16. DisplaySnapshots
-- Reference: 5-0-the-contract
CREATE TABLE public.display_snapshots (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    captured_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT display_snapshots_pkey PRIMARY KEY (id),
    CONSTRAINT display_snapshots_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------------------

CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_events_company_id_scheduled ON public.events(company_id, scheduled_at);
CREATE INDEX idx_tasks_company_event_status ON public.tasks(company_id, event_id, status);
CREATE INDEX idx_tasks_assigned_user ON public.tasks(assigned_user_id);

CREATE INDEX idx_combined_task_groups_company ON public.combined_task_groups(company_id);
CREATE INDEX idx_recipes_company ON public.recipes(company_id);
CREATE INDEX idx_method_documents_company ON public.method_documents(company_id);
CREATE INDEX idx_media_assets_company_status ON public.media_assets(company_id, status);
CREATE INDEX idx_media_assets_checksum ON public.media_assets(checksum);
CREATE INDEX idx_role_assignments_company_user ON public.role_assignments(company_id, user_id);
CREATE INDEX idx_audit_logs_company_created ON public.audit_logs(company_id, created_at DESC);
CREATE INDEX idx_notification_preferences_company_user ON public.notification_preferences(company_id, user_id);
CREATE INDEX idx_realtime_subscriptions_company ON public.realtime_subscriptions(company_id);
CREATE INDEX idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX idx_stations_company ON public.stations(company_id);
CREATE INDEX idx_staff_schedules_company_user ON public.staff_schedules(company_id, user_id);
CREATE INDEX idx_display_snapshots_company_captured ON public.display_snapshots(company_id, captured_at DESC);

-- -------------------------------------------------------------------------
-- Row Level Security (RLS) - Disabled by default awaiting I1.T5
-- -------------------------------------------------------------------------

-- Helper functions (placeholders)
-- CREATE OR REPLACE FUNCTION public.get_my_company_id() RETURNS uuid AS $$ ... $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS public.user_role AS $$ ... $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS (commented out)
-- ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Policies (commented out)
-- CREATE POLICY "Users can view their own company" ON public.companies FOR SELECT USING (id = public.get_my_company_id());
-- ... (all policies)

-- -------------------------------------------------------------------------
-- Triggers
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_company_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_user_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_event_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_task_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_recipe_updated BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_media_updated BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();