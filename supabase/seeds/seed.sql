-- seed.sql
-- Populates the database with initial demo data for local development

-- Note: We are mocking auth.users entries. In a real local Supabase setup, 
-- you might need to use the Supabase CLI to create these users to get valid JWTs.
-- However, inserting into auth.users directly works in local seeds.

-- 1. Create a Company
INSERT INTO public.companies (id, name, timezone)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Catering Co.', 'America/New_York');

-- 2. Create Users (linked to the company)
-- We also insert into auth.users to make sure joins work if we were to join.
-- Note: The hashed passwords below are dummy placeholders.

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
    ('b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', 'owner@acme.com', '{"name": "Alice Owner"}'),
    ('c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33', 'manager@acme.com', '{"name": "Bob Manager"}'),
    ('d3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'staff@acme.com', '{"name": "Charlie Staff"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, company_id, role, display_name, status)
VALUES 
    ('b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'owner', 'Alice Owner', 'active'),
    ('c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'manager', 'Bob Manager', 'active'),
    ('d3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'staff', 'Charlie Staff', 'active');

-- 3. Create a Recipe
INSERT INTO public.recipes (id, company_id, name, ingredients, steps, version)
VALUES 
    (
        'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55', 
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'Signature Lasagna', 
        '[{"name": "Pasta Sheets", "qty": 12}, {"name": "Tomato Sauce", "qty": "500ml"}]'::jsonb, 
        '[{"order": 1, "text": "Boil pasta"}, {"order": 2, "text": "Layer with sauce"}]'::jsonb, 
        '1.0'
    );

-- 4. Create an Event
INSERT INTO public.events (id, company_id, name, scheduled_at, status)
VALUES 
    (
        'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66', 
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'Corporate Lunch', 
        now() + interval '2 days', 
        'published'
    );

-- 5. Create Tasks
INSERT INTO public.tasks (id, company_id, event_id, assigned_user_id, recipe_id, name, quantity, unit, status, priority)
VALUES 
    (
        uuid_generate_v4(), 
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66', 
        'd3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44', 
        'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55', 
        'Prep Lasagna Sheets', 
        12, 
        'sheets', 
        'pending', 
        'high'
    ),
    (
        uuid_generate_v4(), 
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66', 
        NULL, 
        NULL, 
        'Chop Vegetables', 
        5, 
        'kg', 
        'pending', 
        'normal'
    );
