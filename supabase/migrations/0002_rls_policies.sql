-- Complete RLS implementation for CaterKing platform
-- References: 3-0-the-rulebook, I1.T5

BEGIN;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_my_company_id() 
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    user_company_id uuid;
BEGIN
    -- Extract company_id from JWT claims
    SELECT (auth.jwt()->>'company_id')::uuid INTO user_company_id;
    
    -- If no company_id in JWT, try to get from users table
    IF user_company_id IS NULL THEN
        SELECT company_id INTO user_company_id 
        FROM public.users 
        WHERE id = auth.uid();
    END IF;
    
    RETURN user_company_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role() 
RETURNS public.user_role 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    user_role public.user_role;
BEGIN
    -- Extract role from JWT claims
    SELECT (auth.jwt()->>'role')::public.user_role INTO user_role;
    
    -- If no role in JWT, try to get from users table
    IF user_role IS NULL THEN
        SELECT role INTO user_role 
        FROM public.users 
        WHERE id = auth.uid();
    END IF;
    
    RETURN COALESCE(user_role, 'staff'::public.user_role);
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combined_task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_similarity_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.undo_tokens ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own company" ON public.companies 
FOR SELECT USING (id = public.get_my_company_id());

CREATE POLICY "Owners can update their company" ON public.companies 
FOR UPDATE USING (id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Users policies
CREATE POLICY "Users can view users in their company" ON public.users 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can view users in their company" ON public.users 
FOR SELECT USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner', 'event_lead'));

CREATE POLICY "Owners can insert users" ON public.users 
FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

CREATE POLICY "Owners can update users" ON public.users 
FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

CREATE POLICY "Owners can delete users" ON public.users 
FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Events policies
CREATE POLICY "Users can view events in their company" ON public.events 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers and event leads can insert events" ON public.events 
FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));

CREATE POLICY "Managers and event leads can update events" ON public.events 
FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));

CREATE POLICY "Owners can delete events" ON public.events 
FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Recipes policies
CREATE POLICY "Users can view recipes in their company" ON public.recipes 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can insert recipes" ON public.recipes 
FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

CREATE POLICY "Managers can update recipes" ON public.recipes 
FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

CREATE POLICY "Owners can delete recipes" ON public.recipes 
FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Method documents policies
CREATE POLICY "Users can view method documents in their company" ON public.method_documents 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can insert method documents" ON public.method_documents 
FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

CREATE POLICY "Managers can update method documents" ON public.method_documents 
FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

CREATE POLICY "Owners can delete method documents" ON public.method_documents 
FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Tasks policies
CREATE POLICY "Users can view tasks in their company" ON public.tasks 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Users can update tasks they are assigned to" ON public.tasks 
FOR UPDATE USING (
    company_id = public.get_my_company_id() AND 
    (assigned_user_id = auth.uid() OR public.get_my_role() IN ('manager', 'event_lead', 'owner'))
);

CREATE POLICY "Users can claim available tasks" ON public.tasks 
FOR UPDATE USING (
    company_id = public.get_my_company_id() AND 
    status = 'available' AND 
    assigned_user_id IS NULL
) WITH CHECK (
    company_id = public.get_my_company_id() AND 
    status = 'claimed' AND 
    assigned_user_id = auth.uid()
);

CREATE POLICY "Managers can insert tasks" ON public.tasks 
FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));

CREATE POLICY "Owners can delete tasks" ON public.tasks 
FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Combined task groups policies
CREATE POLICY "Users can view combined task groups in their company" ON public.combined_task_groups 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage combined task groups" ON public.combined_task_groups 
FOR ALL USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Task comments policies
CREATE POLICY "Users can view comments for tasks they can see" ON public.task_comments 
FOR SELECT USING (
    company_id = public.get_my_company_id() AND 
    EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE tasks.id = task_comments.task_id AND tasks.company_id = public.get_my_company_id()
    )
);

CREATE POLICY "Users can insert comments" ON public.task_comments 
FOR INSERT WITH CHECK (
    company_id = public.get_my_company_id() AND 
    author_id = auth.uid()
);

-- Stations policies
CREATE POLICY "Users can view stations in their company" ON public.stations 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage stations" ON public.stations 
FOR ALL USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Staff schedules policies
CREATE POLICY "Users can view staff schedules in their company" ON public.staff_schedules 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage staff schedules" ON public.staff_schedules 
FOR ALL USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));

-- Media assets policies
CREATE POLICY "Users can view media assets in their company" ON public.media_assets 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Managers can manage media assets" ON public.media_assets 
FOR ALL USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Role assignments policies
CREATE POLICY "Users can view role assignments in their company" ON public.role_assignments 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "Owners can manage role assignments" ON public.role_assignments 
FOR ALL USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Display snapshots policies
CREATE POLICY "Users can view display snapshots in their company" ON public.display_snapshots 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "System can insert display snapshots" ON public.display_snapshots 
FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

-- Task similarity suggestions policies
CREATE POLICY "Users can view task suggestions in their company" ON public.task_similarity_suggestions 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "System can manage task suggestions" ON public.task_similarity_suggestions 
FOR ALL USING (company_id = public.get_my_company_id());

-- Undo tokens policies
CREATE POLICY "Users can view their own undo tokens" ON public.undo_tokens 
FOR SELECT USING (
    company_id = public.get_my_company_id() AND 
    EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE tasks.id = undo_tokens.task_id AND 
        tasks.company_id = public.get_my_company_id() AND 
        tasks.assigned_user_id = auth.uid()
    )
);

CREATE POLICY "System can manage undo tokens" ON public.undo_tokens 
FOR ALL USING (company_id = public.get_my_company_id());

-- Audit logs policies (append-only)
CREATE POLICY "Users can view audit logs in their company" ON public.audit_logs 
FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "System can insert audit logs" ON public.audit_logs 
FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

-- Notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences 
FOR ALL USING (company_id = public.get_my_company_id() AND user_id = auth.uid());

-- Realtime subscriptions policies
CREATE POLICY "Users can manage their own realtime subscriptions" ON public.realtime_subscriptions 
FOR ALL USING (company_id = public.get_my_company_id());

COMMIT;