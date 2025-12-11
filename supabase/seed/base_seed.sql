-- base_seed.sql
-- Populates the database with initial demo data for local development, including companies, users, events, tasks, and new entities per I1.T4.
-- References: 5-0-the-contract, I1.T4
-- Instructions: Run `supabase db reset` to load this seed data into your local Supabase instance.
-- Note: All data is anonymized and for demo purposes only. Do not use in production.

-- Enable uuid-ossp if not already
-- (Assuming migration has it)

-- 1. Create a Company
INSERT INTO public.companies (id, name, timezone, settings)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Catering Co.', 'America/New_York', '{"theme": "light"}'::jsonb);

-- 2. Create Users (linked to the company)
-- Mock auth.users entries for local dev
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES
    ('b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', 'owner@demo.com', '{"name": "Alice Owner"}'),
    ('c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33', 'manager@demo.com', '{"name": "Bob Manager"}'),
    ('d3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'staff@demo.com', '{"name": "Charlie Staff"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, company_id, role, display_name, avatar_url, contact_info, status)
VALUES
    ('b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'owner', 'Alice Owner', 'https://demo.com/avatar1.jpg', '{"email": "owner@demo.com", "phone": "123-456-7890"}'::jsonb, 'active'),
    ('c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'manager', 'Bob Manager', 'https://demo.com/avatar2.jpg', '{"email": "manager@demo.com"}'::jsonb, 'active'),
    ('d3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'staff', 'Charlie Staff', null, '{}'::jsonb, 'active');

-- 3. Create Role Assignments
INSERT INTO public.role_assignments (company_id, user_id, role, granted_by, granted_at)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', 'owner', 'b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', now()),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33', 'manager', 'b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', now()),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'staff', 'c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33', now());

-- 4. Create Stations
INSERT INTO public.stations (company_id, name, type, sort_order)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Prep Station 1', 'prep', 1),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cook Station', 'cook', 2);

-- 5. Create an Event
INSERT INTO public.events (id, company_id, name, scheduled_at, location, notes, status)
VALUES
    ('f5a2b499-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Corporate Lunch', now() + interval '2 days', 'Conference Room A', 'VIP event, extra care needed', 'scheduled');

-- 6. Create Staff Schedules
INSERT INTO public.staff_schedules (company_id, user_id, event_id, shift_start, shift_end, role_override)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380a11', now() + interval '2 days 9 hours', now() + interval '2 days 17 hours', null);

-- 7. Create a Recipe
INSERT INTO public.recipes (id, company_id, name, ingredients, steps, media_urls, version, tags, allergen_flags)
VALUES
    ('e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Signature Lasagna', '[{"name": "Pasta Sheets", "qty": 12}]'::jsonb, '[{"order": 1, "text": "Boil pasta"}, {"order": 2, "text": "Layer with sauce"}]'::jsonb, '["https://demo.com/lasagna.jpg"]'::jsonb, '1.0', ARRAY['italian', 'pasta'], ARRAY['gluten']);

-- 8. Create Method Document
INSERT INTO public.method_documents (company_id, title, steps, video_refs, skill_level, last_reviewed_by)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lasagna Prep Guide', '[{"step": "Prepare ingredients"}]'::jsonb, '["https://demo.com/video.mp4"]'::jsonb, 'intermediate', 'c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33');

-- 9. Create Tasks
INSERT INTO public.tasks (id, company_id, event_id, assigned_user_id, name, quantity, unit, status, priority, instructions_ref)
VALUES
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'Prep Lasagna Sheets', 12, 'sheets', 'available', 'high', 'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380a11', null, 'Chop Vegetables', 5, 'kg', 'available', 'normal', null);

-- 10. Create Notification Preferences
INSERT INTO public.notification_preferences (company_id, user_id, channel, enabled, quiet_hours)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'push', true, '22:00-08:00');

-- 11. Create Display Snapshot
INSERT INTO public.display_snapshots (company_id, payload, captured_at)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"tasks": [{"id": "demo", "status": "available"}]}'::jsonb, now());

-- 12. Create Audit Log
INSERT INTO public.audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', 'event', 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380a11', 'CREATE', '{"name": "Corporate Lunch"}'::jsonb);