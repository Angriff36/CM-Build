-- rls_policies.sql
-- pgTAP tests for RLS policies
-- References: 3-0-the-rulebook, I1.T5

BEGIN;

-- Mock auth.jwt() for testing
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS json AS $$
SELECT json_build_object(
  'company_id', nullif(current_setting('jwt.claims.company_id', true), ''),
  'role', nullif(current_setting('jwt.claims.role', true), '')
);
$$ LANGUAGE sql;

-- Test setup: Create test companies and users
INSERT INTO public.companies (id, name) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'Test Company A'),
('22222222-2222-2222-2222-222222222222'::uuid, 'Test Company B');

INSERT INTO public.users (id, company_id, role, display_name) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'staff', 'Staff A'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'manager', 'Manager A'),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'event_lead', 'Event Lead A'),
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'owner', 'Owner A'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'staff', 'Staff B');

INSERT INTO public.tasks (id, company_id, name, status) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Task A', 'available'),
('22222222-2222-2222-2222-222222222222'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Task B', 'available');

-- Test tenant isolation and role contexts
SELECT plan(15);

-- Test 1: Staff from Company A can view tasks in Company A
SELECT set_config('jwt.claims.company_id', '11111111-1111-1111-1111-111111111111', false);
SELECT set_config('jwt.claims.role', 'staff', false);
SELECT is(count(*), 1::bigint, 'Staff A can view 1 task in Company A') FROM public.tasks;

-- Test 2: Staff from Company A cannot view tasks in Company B
SELECT is(count(*), 0::bigint, 'Staff A cannot view tasks in Company B') FROM public.tasks WHERE company_id = '22222222-2222-2222-2222-222222222222'::uuid;

-- Test 3: Manager from Company A can view users in Company A
SELECT set_config('jwt.claims.role', 'manager', false);
SELECT is(count(*), 4::bigint, 'Manager A can view 4 users in Company A') FROM public.users;

-- Test 4: Staff cannot insert events
SELECT set_config('jwt.claims.role', 'staff', false);
SELECT throws_ok($$INSERT INTO public.events (company_id, name, scheduled_at) VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'Test Event', now())$$, '42501', 'Staff cannot insert events');

-- Test 5: Manager can insert events
SELECT set_config('jwt.claims.role', 'manager', false);
SELECT lives_ok($$INSERT INTO public.events (company_id, name, scheduled_at) VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'Test Event', now())$$, 'Manager can insert events');

-- Test 6: Staff can update tasks for claiming
SELECT set_config('jwt.claims.role', 'staff', false);
SELECT lives_ok($$UPDATE public.tasks SET status = 'claimed', assigned_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE id = '11111111-1111-1111-1111-111111111111'::uuid$$, 'Staff can claim tasks');

-- Test 7: Undo token protection - staff cannot update tasks not assigned to them
UPDATE public.tasks SET undo_token = 'token123', assigned_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid WHERE id = '11111111-1111-1111-1111-111111111111'::uuid;
SELECT throws_ok($$UPDATE public.tasks SET status = 'completed' WHERE id = '11111111-1111-1111-1111-111111111111'::uuid AND assigned_user_id != 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid$$, '42501', 'Unauthorized user cannot update task with undo_token');

-- Test 8: Owner role context - can delete users
SELECT set_config('jwt.claims.role', 'owner', false);
SELECT lives_ok($$DELETE FROM public.users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid$$, 'Owner can delete users');

-- Test 9: Event lead can update events
SELECT set_config('jwt.claims.role', 'event_lead', false);
SELECT lives_ok($$UPDATE public.events SET name = 'Updated Event' WHERE name = 'Test Event'$$, 'Event lead can update events');

-- Test 10: Audit logs are append-only
SELECT lives_ok($$INSERT INTO public.audit_logs (company_id, user_id, entity_type, entity_id, action) VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'task', '11111111-1111-1111-1111-111111111111'::uuid, 'update')$$, 'Can insert audit logs');

-- Test 11: Manager can insert recipes
SELECT set_config('jwt.claims.role', 'manager', false);
SELECT lives_ok($$INSERT INTO public.recipes (company_id, name, ingredients, steps) VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'Test Recipe', '[]'::jsonb, '[]'::jsonb)$$, 'Manager can insert recipes');

-- Test 12: Staff cannot insert recipes
SELECT set_config('jwt.claims.role', 'staff', false);
SELECT throws_ok($$INSERT INTO public.recipes (company_id, name, ingredients, steps) VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'Test Recipe 2', '[]'::jsonb, '[]'::jsonb)$$, '42501', 'Staff cannot insert recipes');

-- Test 13: Owner can insert role_assignments
SELECT set_config('jwt.claims.role', 'owner', false);
SELECT lives_ok($$INSERT INTO public.role_assignments (company_id, user_id, role, granted_by) VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'manager', 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid)$$, 'Owner can insert role_assignments');

-- Test 14: Staff cannot insert role_assignments
SELECT set_config('jwt.claims.role', 'staff', false);
SELECT throws_ok($$INSERT INTO public.role_assignments (company_id, user_id, role, granted_by) VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'manager', 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid)$$, '42501', 'Staff cannot insert role_assignments');

-- Test 15: Tenant isolation for Company B staff
SELECT set_config('jwt.claims.company_id', '22222222-2222-2222-2222-222222222222', false);
SELECT set_config('jwt.claims.role', 'staff', false);
SELECT is(count(*), 1::bigint, 'Staff B can view 1 task in Company B') FROM public.tasks;

SELECT * FROM finish();