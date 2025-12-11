-- 20251210000000_initial_schema.sql
-- Description: Initial schema for PrepChef application including companies, users, events, tasks, and core RBAC.

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
    'pending',
    'claimed',
    'completed',
    'verified'
);

CREATE TYPE public.event_status AS ENUM (
    'draft',
    'published',
    'completed',
    'archived'
);

-- -------------------------------------------------------------------------
-- Tables
-- -------------------------------------------------------------------------

-- 1. Companies (Tenants)
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
CREATE TABLE public.users (
    id uuid NOT NULL, -- References auth.users(id) manually enforced or via FK if auth schema is exposed
    company_id uuid NOT NULL,
    role public.user_role NOT NULL DEFAULT 'staff'::public.user_role,
    display_name text,
    status text NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
    -- Note: We intentionally do not add a hard FK to auth.users here to avoid schema cross-dependency issues 
    -- during backup/restore, though it is common practice to do so in some setups.
    -- For strictness: CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Events
CREATE TABLE public.events (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    name text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    status public.event_status NOT NULL DEFAULT 'draft'::public.event_status,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 4. Recipes
CREATE TABLE public.recipes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    name text NOT NULL,
    ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
    steps jsonb NOT NULL DEFAULT '[]'::jsonb,
    version text DEFAULT '1.0',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT recipes_pkey PRIMARY KEY (id),
    CONSTRAINT recipes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 5. Tasks
CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    event_id uuid, -- Optional: tasks might belong to a group or just the company backlog
    assigned_user_id uuid,
    recipe_id uuid, -- Optional: link to a recipe
    name text NOT NULL,
    quantity numeric NOT NULL DEFAULT 1,
    unit text,
    status public.task_status NOT NULL DEFAULT 'pending'::public.task_status,
    priority text DEFAULT 'normal',
    undo_token text, -- For undo capability
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tasks_pkey PRIMARY KEY (id),
    CONSTRAINT tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT tasks_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
    CONSTRAINT tasks_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT tasks_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL
);

-- 6. Combined Task Groups (Aggregation)
CREATE TABLE public.combined_task_groups (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    base_task_ids uuid[] NOT NULL,
    aggregated_quantity numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT combined_task_groups_pkey PRIMARY KEY (id),
    CONSTRAINT combined_task_groups_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 7. Method Documents (Attachments to recipes)
CREATE TABLE public.method_documents (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    content_url text NOT NULL,
    type text NOT NULL, -- e.g., 'pdf', 'video'
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT method_documents_pkey PRIMARY KEY (id),
    CONSTRAINT method_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    CONSTRAINT method_documents_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE
);

-- 8. Media Assets
CREATE TABLE public.media_assets (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    url text NOT NULL,
    type text NOT NULL, -- 'image', 'video'
    status text NOT NULL DEFAULT 'uploaded',
    storage_path text NOT NULL,
    checksum text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT media_assets_pkey PRIMARY KEY (id),
    CONSTRAINT media_assets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 9. Audit Logs
CREATE TABLE public.audit_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    actor_id uuid, -- User who performed the action
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    diff jsonb, -- Stores changes
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
    CONSTRAINT audit_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------------------

CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_events_company_id_scheduled ON public.events(company_id, scheduled_at);
CREATE INDEX idx_tasks_company_event_status ON public.tasks(company_id, event_id, status);
CREATE INDEX idx_tasks_assigned_user ON public.tasks(assigned_user_id);
CREATE INDEX idx_tasks_meta ON public.tasks USING GIN (meta);
CREATE INDEX idx_media_assets_company_status ON public.media_assets(company_id, status);
CREATE INDEX idx_media_assets_checksum ON public.media_assets(checksum);
CREATE INDEX idx_audit_logs_company_created ON public.audit_logs(company_id, created_at DESC);

-- -------------------------------------------------------------------------
-- Row Level Security (RLS)
-- -------------------------------------------------------------------------

-- Helper function to get current user's company_id
-- In a real app with Custom Claims, this would read auth.jwt() -> 'company_id'
-- For now, we look it up in the public.users table.
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM public.users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combined_task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Companies
-- Users can see their own company
CREATE POLICY "Users can view their own company"
ON public.companies FOR SELECT
USING (id = public.get_my_company_id());

-- 2. Users
-- Users can view members of their own company
CREATE POLICY "Users can view members of their own company"
ON public.users FOR SELECT
USING (company_id = public.get_my_company_id());

-- 3. Events
CREATE POLICY "Users can view events of their own company"
ON public.events FOR SELECT
USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers and Owners can manage events"
ON public.events FOR ALL
USING (
    company_id = public.get_my_company_id() 
    AND public.get_my_role() IN ('manager', 'owner', 'event_lead')
);

-- 4. Tasks
-- Read: All staff can read company tasks
CREATE POLICY "policy_tasks_staff_read"
ON public.tasks FOR SELECT
USING (company_id = public.get_my_company_id());

-- Update (Staff): Can claim/unclaim/complete rows assigned to them
CREATE POLICY "policy_tasks_staff_update_status"
ON public.tasks FOR UPDATE
USING (
    company_id = public.get_my_company_id() 
    AND assigned_user_id = auth.uid()
);

-- Full CRUD (Manager):
CREATE POLICY "policy_tasks_manager_crud"
ON public.tasks FOR ALL
USING (
    company_id = public.get_my_company_id() 
    AND public.get_my_role() IN ('manager', 'owner', 'event_lead')
);

-- Note: The Access Matrix mentions "Event Lead: Create/assign/update tasks for events where event_lead_id matches".
-- Since 'event_lead_id' is not explicitly in the Event table in the provided ERD snippet, 
-- we are grouping them with Manager permissions for now or assuming they are Managers. 
-- Refining strict Event Lead scope would require adding 'lead_id' to events table. 
-- For this iteration, we treat them as privileged users within the company.

-- 5. Recipes & Method Documents
CREATE POLICY "Users can view recipes"
ON public.recipes FOR SELECT
USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage recipes"
ON public.recipes FOR ALL
USING (
    company_id = public.get_my_company_id() 
    AND public.get_my_role() IN ('manager', 'owner', 'event_lead')
);

CREATE POLICY "Users can view method docs"
ON public.method_documents FOR SELECT
USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage method docs"
ON public.method_documents FOR ALL
USING (
    company_id = public.get_my_company_id() 
    AND public.get_my_role() IN ('manager', 'owner', 'event_lead')
);

-- 6. Combined Task Groups
CREATE POLICY "Users can view combined task groups"
ON public.combined_task_groups FOR SELECT
USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage combined task groups"
ON public.combined_task_groups FOR ALL
USING (
    company_id = public.get_my_company_id() 
    AND public.get_my_role() IN ('manager', 'owner', 'event_lead')
);

-- 6. Media Assets
CREATE POLICY "Users can view media"
ON public.media_assets FOR SELECT
USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage media"
ON public.media_assets FOR ALL
USING (
    company_id = public.get_my_company_id() 
    AND public.get_my_role() IN ('manager', 'owner')
);

-- 7. Audit Logs
-- View: Owners and Managers
CREATE POLICY "Owners and Managers can view audit logs"
ON public.audit_logs FOR SELECT
USING (
    company_id = public.get_my_company_id() 
    AND public.get_my_role() IN ('owner', 'manager')
);

-- Insert: All authenticated users (system triggered usually, but RLS applies if inserted from client)
CREATE POLICY "Users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (company_id = public.get_my_company_id());

-- No update/delete on Audit Logs
-- (Enforced by not adding policies for UPDATE/DELETE, making them implicitly denied)

-- -------------------------------------------------------------------------
-- Triggers (Optional but good for `updated_at`)
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

