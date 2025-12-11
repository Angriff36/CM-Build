-- 0002_rls_policies.sql
-- Description: Enable RLS on all tables with role-checked policies referencing JWT claims and company scope.
-- References: 3-0-the-rulebook, I1.T5

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.get_my_company_id() RETURNS uuid AS $$
SELECT (auth.jwt() ->> 'company_id')::uuid;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS public.user_role AS $$
SELECT (auth.jwt() ->> 'role')::public.user_role;
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combined_task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for companies
CREATE POLICY "Users can view their own company" ON public.companies FOR SELECT USING (id = public.get_my_company_id());

-- Policies for users
CREATE POLICY "Users can view users in their company" ON public.users FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers and owners can insert users" ON public.users FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can update users" ON public.users FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Owners can delete users" ON public.users FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Policies for events
CREATE POLICY "Users can view events in their company" ON public.events FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers, event_leads, and owners can insert events" ON public.events FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));
CREATE POLICY "Managers, event_leads, and owners can update events" ON public.events FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));
CREATE POLICY "Managers, event_leads, and owners can delete events" ON public.events FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));

-- Policies for tasks
CREATE POLICY "Users can view tasks in their company" ON public.tasks FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers, event_leads, and owners can insert tasks" ON public.tasks FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));
CREATE POLICY "Staff can update tasks for claiming/completing" ON public.tasks FOR UPDATE USING (company_id = public.get_my_company_id() AND (public.get_my_role() IN ('staff', 'manager', 'event_lead', 'owner') OR (status IN ('available', 'claimed', 'in_progress') AND assigned_user_id = auth.uid())));
CREATE POLICY "Managers, event_leads, and owners can delete tasks" ON public.tasks FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));

-- Policies for combined_task_groups
CREATE POLICY "Users can view combined_task_groups in their company" ON public.combined_task_groups FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers, event_leads, and owners can insert combined_task_groups" ON public.combined_task_groups FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));
CREATE POLICY "Managers, event_leads, and owners can update combined_task_groups" ON public.combined_task_groups FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));
CREATE POLICY "Managers, event_leads, and owners can delete combined_task_groups" ON public.combined_task_groups FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'event_lead', 'owner'));

-- Policies for recipes
CREATE POLICY "Users can view recipes in their company" ON public.recipes FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers and owners can insert recipes" ON public.recipes FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can update recipes" ON public.recipes FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can delete recipes" ON public.recipes FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Policies for method_documents
CREATE POLICY "Users can view method_documents in their company" ON public.method_documents FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers and owners can insert method_documents" ON public.method_documents FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can update method_documents" ON public.method_documents FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can delete method_documents" ON public.method_documents FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Policies for media_assets
CREATE POLICY "Users can view media_assets in their company" ON public.media_assets FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers and owners can insert media_assets" ON public.media_assets FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can update media_assets" ON public.media_assets FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can delete media_assets" ON public.media_assets FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Policies for role_assignments
CREATE POLICY "Users can view role_assignments in their company" ON public.role_assignments FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Owners can insert role_assignments" ON public.role_assignments FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');
CREATE POLICY "Owners can update role_assignments" ON public.role_assignments FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner') WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');
CREATE POLICY "Owners can delete role_assignments" ON public.role_assignments FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() = 'owner');

-- Policies for audit_logs
CREATE POLICY "Users can view audit_logs in their company" ON public.audit_logs FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "System can insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (company_id = public.get_my_company_id()); -- Allow inserts for audit logging

-- Policies for notification_preferences
CREATE POLICY "Users can view their own notification_preferences" ON public.notification_preferences FOR SELECT USING (company_id = public.get_my_company_id() AND user_id = auth.uid());
CREATE POLICY "Users can insert their own notification_preferences" ON public.notification_preferences FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND user_id = auth.uid());
CREATE POLICY "Users can update their own notification_preferences" ON public.notification_preferences FOR UPDATE USING (company_id = public.get_my_company_id() AND user_id = auth.uid()) WITH CHECK (company_id = public.get_my_company_id() AND user_id = auth.uid());
CREATE POLICY "Users can delete their own notification_preferences" ON public.notification_preferences FOR DELETE USING (company_id = public.get_my_company_id() AND user_id = auth.uid());

-- Policies for realtime_subscriptions
CREATE POLICY "Users can view realtime_subscriptions in their company" ON public.realtime_subscriptions FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Users can insert realtime_subscriptions" ON public.realtime_subscriptions FOR INSERT WITH CHECK (company_id = public.get_my_company_id());
CREATE POLICY "Users can update realtime_subscriptions" ON public.realtime_subscriptions FOR UPDATE USING (company_id = public.get_my_company_id()) WITH CHECK (company_id = public.get_my_company_id());
CREATE POLICY "Users can delete realtime_subscriptions" ON public.realtime_subscriptions FOR DELETE USING (company_id = public.get_my_company_id());

-- Policies for task_comments
CREATE POLICY "Users can view task_comments in their company" ON public.task_comments FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Users can insert task_comments on tasks they can access" ON public.task_comments FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND company_id = public.get_my_company_id()));
CREATE POLICY "Users can update their own task_comments" ON public.task_comments FOR UPDATE USING (company_id = public.get_my_company_id() AND author_id = auth.uid()) WITH CHECK (company_id = public.get_my_company_id() AND author_id = auth.uid());
CREATE POLICY "Users can delete their own task_comments" ON public.task_comments FOR DELETE USING (company_id = public.get_my_company_id() AND author_id = auth.uid());

-- Policies for stations
CREATE POLICY "Users can view stations in their company" ON public.stations FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers and owners can insert stations" ON public.stations FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can update stations" ON public.stations FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can delete stations" ON public.stations FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Policies for staff_schedules
CREATE POLICY "Users can view staff_schedules in their company" ON public.staff_schedules FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "Managers and owners can insert staff_schedules" ON public.staff_schedules FOR INSERT WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can update staff_schedules" ON public.staff_schedules FOR UPDATE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner')) WITH CHECK (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));
CREATE POLICY "Managers and owners can delete staff_schedules" ON public.staff_schedules FOR DELETE USING (company_id = public.get_my_company_id() AND public.get_my_role() IN ('manager', 'owner'));

-- Policies for display_snapshots
CREATE POLICY "Users can view display_snapshots in their company" ON public.display_snapshots FOR SELECT USING (company_id = public.get_my_company_id());
CREATE POLICY "System can insert display_snapshots" ON public.display_snapshots FOR INSERT WITH CHECK (company_id = public.get_my_company_id()); -- For automated snapshots