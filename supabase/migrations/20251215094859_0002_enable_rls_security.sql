/*
  # CRITICAL SECURITY FIX - Enable Row Level Security

  ## Summary
  This migration enables Row Level Security (RLS) on all tables and creates comprehensive
  policies to enforce multi-tenant isolation. Prior to this migration, ALL data was 
  accessible to ANY authenticated user across ALL companies - a critical security vulnerability.

  ## Changes Applied

  ### 1. Helper Functions
  - `get_my_company_id()` - Returns the current user's company_id
  - `get_my_role()` - Returns the current user's role

  ### 2. Tables Secured (RLS Enabled)
  - companies (1 table)
  - users (1 table)
  - events (1 table)
  - tasks (1 table)
  - recipes (1 table)
  - method_documents (1 table)
  - combined_task_groups (1 table)
  - media_assets (1 table)
  - role_assignments (1 table)
  - audit_logs (1 table)
  - notification_preferences (1 table)
  - realtime_subscriptions (1 table)
  - task_comments (1 table)
  - stations (1 table)
  - staff_schedules (1 table)
  - display_snapshots (1 table)
  - task_similarity_suggestions (1 table)
  - undo_tokens (1 table)

  **Total: 18 tables now secured with RLS**

  ### 3. Security Policies Created
  - Tenant isolation via company_id matching
  - Role-based access control (RBAC)
  - Separate policies for SELECT, INSERT, UPDATE, DELETE
  - Restrictive by default - deny unless explicitly allowed

  ## Severity: CRITICAL
  Prior state: Cross-tenant data exposure possible
  Post-migration: Strict tenant isolation enforced

  ## Testing Required
  - Verify users can only see their company's data
  - Verify role-based permissions work correctly
  - Test all CRUD operations per role
  - Validate cross-tenant isolation

  ## References
  - Security spec: docs/security/rls_policies.md
  - Blueprint: 3-0-the-rulebook (Security)
  - Related: I1.T5 (RLS implementation task)
*/

-- -------------------------------------------------------------------------
-- Helper Functions
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM public.users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$;

-- -------------------------------------------------------------------------
-- Enable RLS on All Tables
-- -------------------------------------------------------------------------

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combined_task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_similarity_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.undo_tokens ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- Companies Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view their own company"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (id = public.get_my_company_id());

-- -------------------------------------------------------------------------
-- Users Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view members of their own company"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers and owners can insert users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers and owners can update users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Owners can delete users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() = 'owner'
  );

-- -------------------------------------------------------------------------
-- Events Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view events in their company"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers and event leads can manage events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  );

CREATE POLICY "Managers and event leads can update events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  );

CREATE POLICY "Managers and owners can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Tasks Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view tasks in their company"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers and event leads can create tasks"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  );

CREATE POLICY "Staff can update assigned tasks"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND (
      assigned_user_id = auth.uid()
      OR public.get_my_role() IN ('manager', 'event_lead', 'owner')
    )
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
  );

CREATE POLICY "Managers can delete tasks"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Recipes Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view recipes in their company"
  ON public.recipes
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage recipes"
  ON public.recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can update recipes"
  ON public.recipes
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can delete recipes"
  ON public.recipes
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Method Documents Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view method documents in their company"
  ON public.method_documents
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage method documents"
  ON public.method_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can update method documents"
  ON public.method_documents
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can delete method documents"
  ON public.method_documents
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Combined Task Groups Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view combined task groups in their company"
  ON public.combined_task_groups
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage combined task groups"
  ON public.combined_task_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  );

CREATE POLICY "Managers can update combined task groups"
  ON public.combined_task_groups
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  );

CREATE POLICY "Managers can delete combined task groups"
  ON public.combined_task_groups
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Media Assets Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view media assets in their company"
  ON public.media_assets
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage media assets"
  ON public.media_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can update media assets"
  ON public.media_assets
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can delete media assets"
  ON public.media_assets
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Role Assignments Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view role assignments in their company"
  ON public.role_assignments
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Owners can manage role assignments"
  ON public.role_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() = 'owner'
  );

CREATE POLICY "Owners can update role assignments"
  ON public.role_assignments
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() = 'owner'
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() = 'owner'
  );

CREATE POLICY "Owners can delete role assignments"
  ON public.role_assignments
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() = 'owner'
  );

-- -------------------------------------------------------------------------
-- Audit Logs Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Managers and owners can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "All users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_my_company_id());

-- -------------------------------------------------------------------------
-- Notification Preferences Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND user_id = auth.uid()
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own notification preferences"
  ON public.notification_preferences
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND user_id = auth.uid()
  );

-- -------------------------------------------------------------------------
-- Realtime Subscriptions Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view realtime subscriptions in their company"
  ON public.realtime_subscriptions
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Users can manage realtime subscriptions"
  ON public.realtime_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Users can update realtime subscriptions"
  ON public.realtime_subscriptions
  FOR UPDATE
  TO authenticated
  USING (company_id = public.get_my_company_id())
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Users can delete realtime subscriptions"
  ON public.realtime_subscriptions
  FOR DELETE
  TO authenticated
  USING (company_id = public.get_my_company_id());

-- -------------------------------------------------------------------------
-- Task Comments Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view comments on accessible tasks"
  ON public.task_comments
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Users can create comments on accessible tasks"
  ON public.task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND author_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON public.task_comments
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND author_id = auth.uid()
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND author_id = auth.uid()
  );

CREATE POLICY "Users can delete their own comments"
  ON public.task_comments
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND author_id = auth.uid()
  );

-- -------------------------------------------------------------------------
-- Stations Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view stations in their company"
  ON public.stations
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage stations"
  ON public.stations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can update stations"
  ON public.stations
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

CREATE POLICY "Managers can delete stations"
  ON public.stations
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Staff Schedules Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view staff schedules in their company"
  ON public.staff_schedules
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage staff schedules"
  ON public.staff_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  );

CREATE POLICY "Managers can update staff schedules"
  ON public.staff_schedules
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  )
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'event_lead', 'owner')
  );

CREATE POLICY "Managers can delete staff schedules"
  ON public.staff_schedules
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_my_company_id()
    AND public.get_my_role() IN ('manager', 'owner')
  );

-- -------------------------------------------------------------------------
-- Display Snapshots Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view display snapshots in their company"
  ON public.display_snapshots
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "System can insert display snapshots"
  ON public.display_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_my_company_id());

-- -------------------------------------------------------------------------
-- Task Similarity Suggestions Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view task similarity suggestions in their company"
  ON public.task_similarity_suggestions
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "System can manage task similarity suggestions"
  ON public.task_similarity_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "System can update task similarity suggestions"
  ON public.task_similarity_suggestions
  FOR UPDATE
  TO authenticated
  USING (company_id = public.get_my_company_id())
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "System can delete task similarity suggestions"
  ON public.task_similarity_suggestions
  FOR DELETE
  TO authenticated
  USING (company_id = public.get_my_company_id());

-- -------------------------------------------------------------------------
-- Undo Tokens Table Policies
-- -------------------------------------------------------------------------

CREATE POLICY "Users can view undo tokens in their company"
  ON public.undo_tokens
  FOR SELECT
  TO authenticated
  USING (company_id = public.get_my_company_id());

CREATE POLICY "System can manage undo tokens"
  ON public.undo_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "System can delete expired undo tokens"
  ON public.undo_tokens
  FOR DELETE
  TO authenticated
  USING (company_id = public.get_my_company_id());
