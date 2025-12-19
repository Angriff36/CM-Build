-- demo_data.sql
-- Comprehensive demo seed data for CaterKing platform
-- References: I1.T4, 5-0-the-contract, schema migrations
-- Instructions: Run `supabase db reset` to load this data into local Supabase instance
-- Note: This script is idempotent and can be run multiple times safely

BEGIN;

-- =============================================================================
-- DEMO COMPANY SETUP
-- =============================================================================

-- Insert demo company (idempotent)
INSERT INTO public.companies (id, name, timezone, settings)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'CaterKing Demo Co.', 'America/New_York', '{
        "theme": "light",
        "features": {
            "task_similarity": true,
            "real_time_updates": true,
            "media_upload": true
        },
        "business_hours": {
            "monday": {"open": "06:00", "close": "22:00"},
            "tuesday": {"open": "06:00", "close": "22:00"},
            "wednesday": {"open": "06:00", "close": "22:00"},
            "thursday": {"open": "06:00", "close": "22:00"},
            "friday": {"open": "06:00", "close": "23:00"},
            "saturday": {"open": "07:00", "close": "23:00"},
            "sunday": {"open": "08:00", "close": "20:00"}
        }
    }'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    timezone = EXCLUDED.timezone,
    settings = EXCLUDED.settings,
    updated_at = now();

-- =============================================================================
-- AUTH USERS (for Supabase Auth integration)
-- =============================================================================

-- Insert auth.users entries for demo users (idempotent)
INSERT INTO auth.users (id, email, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
VALUES
    ('b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22'::uuid, 'owner@caterking.demo', '{"name": "Alex Rivera", "role": "owner"}'::jsonb, now(), now(), now()),
    ('c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33'::uuid, 'manager@caterking.demo', '{"name": "Jordan Chen", "role": "manager"}'::jsonb, now(), now(), now()),
    ('d3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44'::uuid, 'lead@caterking.demo', '{"name": "Sam Rodriguez", "role": "event_lead"}'::jsonb, now(), now(), now()),
    ('e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'::uuid, 'chef1@caterking.demo', '{"name": "Maria Garcia", "role": "staff"}'::jsonb, now(), now(), now()),
    ('f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66'::uuid, 'chef2@caterking.demo', '{"name": "David Kim", "role": "staff"}'::jsonb, now(), now(), now()),
    ('g6b3c599-9c0b-4ef8-bb6d-6bb9bd380g77'::uuid, 'chef3@caterking.demo', '{"name": "Lisa Thompson", "role": "staff"}'::jsonb, now(), now(), now()),
    ('h7c4d699-9c0b-4ef8-bb6d-6bb9bd380h88'::uuid, 'chef4@caterking.demo', '{"name": "Marcus Johnson", "role": "staff"}'::jsonb, now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PUBLIC USERS (linked to auth.users)
-- =============================================================================

-- Insert public.users entries (idempotent)
INSERT INTO public.users (id, company_id, role, display_name, status)
VALUES
    ('b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'owner', 'Alex Rivera', 'active'),
    ('c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'manager', 'Jordan Chen', 'active'),
    ('d3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'event_lead', 'Sam Rodriguez', 'active'),
    ('e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'staff', 'Maria Garcia', 'active'),
    ('f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'staff', 'David Kim', 'active'),
    ('g6b3c599-9c0b-4ef8-bb6d-6bb9bd380g77'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'staff', 'Lisa Thompson', 'active'),
    ('h7c4d699-9c0b-4ef8-bb6d-6bb9bd380h88'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'staff', 'Marcus Johnson', 'active')
ON CONFLICT (id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    status = EXCLUDED.status,
    updated_at = now();

-- =============================================================================
-- STATIONS (kitchen workstations)
-- =============================================================================

-- Insert demo stations (idempotent)
INSERT INTO public.stations (id, company_id, name, type, sort_order)
VALUES
    ('i8d5e799-9c0b-4ef8-bb6d-6bb9bd380i99'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Prep Station 1', 'prep', 1),
    ('j9e6f899-9c0b-4ef8-bb6d-6bb9bd380j00'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Prep Station 2', 'prep', 2),
    ('k0f7g999-9c0b-4ef8-bb6d-6bb9bd380k11'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Hot Line', 'cook', 3),
    ('l1g8h099-9c0b-4ef8-bb6d-6bb9bd380l22'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Cold Station', 'cook', 4),
    ('m2h9i199-9c0b-4ef8-bb6d-6bb9bd380m33'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Plating Station', 'plating', 5),
    ('n3i0j299-9c0b-4ef8-bb6d-6bb9bd380n44'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Dessert Station', 'plating', 6)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    sort_order = EXCLUDED.sort_order;

-- =============================================================================
-- EVENTS (catering events)
-- =============================================================================

-- Insert demo events (idempotent)
INSERT INTO public.events (id, company_id, name, scheduled_at, status, description)
VALUES
    ('o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Tech Conference Lunch', '2025-12-20 12:00:00+00', 'published', '500-person tech conference lunch service. Buffet style with multiple stations.'),
    ('p5k2l499-9c0b-4ef8-bb6d-6bb9bd380p66'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Corporate Holiday Party', '2025-12-22 18:00:00+00', 'published', '200-person holiday celebration with cocktail hour and seated dinner.'),
    ('q6l3m599-9c0b-4ef8-bb6d-6bb9bd380q77'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Wedding Reception', '2025-12-25 17:00:00+00', 'published', '150-person wedding reception with plated service and custom cake.'),
    ('r7m4n699-9c0b-4ef8-bb6d-6bb9bd380r88'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Charity Gala Dinner', '2025-12-28 19:00:00+00', 'draft', '300-person charity gala with silent auction and awards ceremony.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    scheduled_at = EXCLUDED.scheduled_at,
    status = EXCLUDED.status,
    description = EXCLUDED.description,
    updated_at = now();

-- =============================================================================
-- RECIPES (menu items)
-- =============================================================================

-- Insert demo recipes (idempotent)
INSERT INTO public.recipes (id, company_id, name, ingredients, steps, version)
VALUES
    ('s8n5o799-9c0b-4ef8-bb6d-6bb9bd380s99'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Herb-Crusted Salmon',
     '[{"name": "Atlantic salmon fillets", "quantity": "8 pieces", "notes": "6oz each, skin-on"}, {"name": "Fresh dill", "quantity": "1/2 cup", "notes": "chopped"}, {"name": "Fresh parsley", "quantity": "1/2 cup", "notes": "chopped"}, {"name": "Lemon zest", "quantity": "2 tbsp", "notes": "grated"}, {"name": "Olive oil", "quantity": "1/4 cup", "notes": "extra virgin"}, {"name": "Kosher salt", "quantity": "2 tsp", "notes": "to taste"}, {"name": "Black pepper", "quantity": "1 tsp", "notes": "freshly ground"}]'::jsonb,
     '[{"step": 1, "instruction": "Pat salmon fillets dry with paper towels and season both sides with salt and pepper"}, {"step": 2, "instruction": "Mix chopped herbs, lemon zest, and olive oil in a bowl to create herb crust"}, {"step": 3, "instruction": "Press herb mixture onto the top of each salmon fillet"}, {"step": 4, "instruction": "Preheat oven to 400°F (200°C)"}, {"step": 5, "instruction": "Place salmon on a parchment-lined baking sheet, herb-side up"}, {"step": 6, "instruction": "Bake for 12-15 minutes until internal temperature reaches 145°F"}, {"step": 7, "instruction": "Rest for 2 minutes before serving"}]'::jsonb,
     '2.1'),

    ('t9o6p899-9c0b-4ef8-bb6d-6bb9bd380t00'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Truffle Risotto',
     '[{"name": "Arborio rice", "quantity": "2 cups", "notes": "short-grain"}, {"name": "Chicken stock", "quantity": "6 cups", "notes": "hot"}, {"name": "White wine", "quantity": "1 cup", "notes": "dry"}, {"name": "Shallots", "quantity": "2 medium", "notes": "finely minced"}, {"name": "Black truffle", "quantity": "1 oz", "notes": "fresh, thinly sliced"}, {"name": "Parmesan cheese", "quantity": "1 cup", "notes": "freshly grated"}, {"name": "Butter", "quantity": "4 tbsp", "notes": "unsalted"}, {"name": "Truffle oil", "quantity": "2 tbsp", "notes": "for finishing"}]'::jsonb,
     '[{"step": 1, "instruction": "Heat 2 tbsp butter in a large saucepan over medium heat"}, {"step": 2, "instruction": "Add minced shallots and cook until translucent (about 3 minutes)"}, {"step": 3, "instruction": "Add Arborio rice and stir to coat with butter for 2 minutes"}, {"step": 4, "instruction": "Add white wine and stir until absorbed"}, {"step": 5, "instruction": "Add hot chicken stock one ladle at a time, stirring constantly until absorbed"}, {"step": 6, "instruction": "Continue adding stock and stirring for 18-20 minutes until rice is creamy"}, {"step": 7, "instruction": "Remove from heat and stir in remaining butter and Parmesan"}, {"step": 8, "instruction": "Fold in truffle slices and finish with truffle oil drizzle"}]'::jsonb,
     '1.3'),

    ('u0p7q999-9c0b-4ef8-bb6d-6bb9bd380u11'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Chocolate Soufflé',
     '[{"name": "Dark chocolate", "quantity": "8 oz", "notes": "70% cocoa"}, {"name": "Butter", "quantity": "4 tbsp", "notes": "unsalted"}, {"name": "Egg yolks", "quantity": "6 large", "notes": "room temperature"}, {"name": "Egg whites", "quantity": "8 large", "notes": "room temperature"}, {"name": "Sugar", "quantity": "1/2 cup", "notes": "plus extra for ramekins"}, {"name": "Vanilla extract", "quantity": "1 tsp", "notes": "pure"}, {"name": "Cream of tartar", "quantity": "1/4 tsp", "notes": "for stabilizing whites"}]'::jsonb,
     '[{"step": 1, "instruction": "Preheat oven to 375°F (190°C) and butter 8 ramekins, coat with sugar"}, {"step": 2, "instruction": "Melt chocolate and butter in a double boiler, stirring until smooth"}, {"step": 3, "instruction": "Whisk egg yolks with 1/4 cup sugar and vanilla until pale"}, {"step": 4, "instruction": "Whisk chocolate mixture into egg yolk mixture"}, {"step": 5, "instruction": "Beat egg whites with cream of tartar until foamy"}, {"step": 6, "instruction": "Gradually add remaining sugar and beat until stiff peaks form"}, {"step": 7, "instruction": "Fold 1/3 of egg whites into chocolate mixture to lighten"}, {"step": 8, "instruction": "Gently fold in remaining egg whites"}, {"step": 9, "instruction": "Fill ramekins 3/4 full and bake for 12-15 minutes"}, {"step": 10, "instruction": "Serve immediately with powdered sugar dusting"}]'::jsonb,
     '1.0'),

    ('v1q8r099-9c0b-4ef8-bb6d-6bb9bd380v22'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Caesar Salad',
     '[{"name": "Romaine lettuce", "quantity": "3 heads", "notes": "hearts only"}, {"name": "Caesar dressing", "quantity": "1 cup", "notes": "homemade"}, {"name": "Parmesan cheese", "quantity": "1/2 cup", "notes": "freshly grated"}, {"name": "Croutons", "quantity": "2 cups", "notes": "homemade garlic"}, {"name": "Anchovy fillets", "quantity": "4 fillets", "notes": "for dressing"}, {"name": "Lemon juice", "quantity": "2 tbsp", "notes": "fresh"}]'::jsonb,
     '[{"step": 1, "instruction": "Wash and dry romaine lettuce, tear into bite-sized pieces"}, {"step": 2, "instruction": "Prepare Caesar dressing: blend anchovies, garlic, lemon juice, Worcestershire, mustard"}, {"step": 3, "instruction": "Slowly whisk in olive oil to create emulsion"}, {"step": 4, "instruction": "Toss lettuce with dressing until lightly coated"}, {"step": 5, "instruction": "Add Parmesan cheese and toss gently"}, {"step": 6, "instruction": "Top with warm croutons and serve immediately"}]'::jsonb,
     '2.0'),

    ('w2r9s199-9c0b-4ef8-bb6d-6bb9bd380w33'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Beef Wellington',
     '[{"name": "Beef tenderloin", "quantity": "2 lbs", "notes": "center cut"}, {"name": "Puff pastry", "quantity": "1 lb", "notes": "all-butter"}, {"name": "Mushrooms", "quantity": "1 lb", "notes": "mixed wild"}, {"name": "Prosciutto", "quantity": "8 slices", "notes": "thin"}, {"name": "Dijon mustard", "quantity": "3 tbsp", "notes": "whole grain"}, {"name": "Egg", "quantity": "1 large", "notes": "for egg wash"}, {"name": "Butter", "quantity": "4 tbsp", "notes": "unsalted"}]'::jsonb,
     '[{"step": 1, "instruction": "Sear beef tenderloin on all sides until browned, brush with mustard"}, {"step": 2, "instruction": "Sauté finely chopped mushrooms until dry, cool completely"}, {"step": 3, "instruction": "Roll out puff pastry to 1/4 inch thickness"}, {"step": 4, "instruction": "Layer prosciutto on pastry, spread mushroom duxelles on top"}, {"step": 5, "instruction": "Place seared beef on mushrooms, wrap tightly with pastry"}, {"step": 6, "instruction": "Brush with egg wash, score decorative pattern on top"}, {"step": 7, "instruction": "Bake at 425°F for 25-30 minutes until golden and beef reaches 125°F"}, {"step": 8, "instruction": "Rest for 10 minutes before slicing"}]'::jsonb,
     '1.2')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    ingredients = EXCLUDED.ingredients,
    steps = EXCLUDED.steps,
    version = EXCLUDED.version,
    updated_at = now();

-- =============================================================================
-- METHOD DOCUMENTS (training materials)
-- =============================================================================

-- Insert demo method documents (idempotent)
INSERT INTO public.method_documents (id, company_id, recipe_id, content_url, type)
VALUES
    ('x3s0t299-9c0b-4ef8-bb6d-6bb9bd380x44'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 's8n5o799-9c0b-4ef8-bb6d-6bb9bd380s99'::uuid, 'https://demo.caterking.com/docs/salmon-prep-guide.pdf', 'pdf'),
    ('y4t1u399-9c0b-4ef8-bb6d-6bb9bd380y55'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 't9o6p899-9c0b-4ef8-bb6d-6bb9bd380t00'::uuid, 'https://demo.caterking.com/videos/risotto-technique.mp4', 'video'),
    ('z5u2v499-9c0b-4ef8-bb6d-6bb9bd380z66'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'u0p7q999-9c0b-4ef8-bb6d-6bb9bd380u11'::uuid, 'https://demo.caterking.com/docs/souffle-timing-guide.pdf', 'pdf')
ON CONFLICT (id) DO UPDATE SET
    content_url = EXCLUDED.content_url,
    type = EXCLUDED.type;

-- =============================================================================
-- MEDIA ASSETS (images and videos)
-- =============================================================================

-- Insert demo media assets (idempotent)
INSERT INTO public.media_assets (id, company_id, url, type, status, storage_path, checksum)
VALUES
    ('a6v3w599-9c0b-4ef8-bb6d-6bb9bd380a77'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'https://demo.caterking.com/images/salmon-plated.jpg', 'image', 'ready', 'media/images/salmon-plated.jpg', 'abc123'),
    ('b7w4x699-9c0b-4ef8-bb6d-6bb9bd380b88'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'https://demo.caterking.com/images/risotto-closeup.jpg', 'image', 'ready', 'media/images/risotto-closeup.jpg', 'def456'),
    ('c8x5y799-9c0b-4ef8-bb6d-6bb9bd380c99'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'https://demo.caterking.com/videos/kitchen-prep.mp4', 'video', 'ready', 'media/videos/kitchen-prep.mp4', 'ghi789'),
    ('d9y6z899-9c0b-4ef8-bb6d-6bb9bd380d00'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'https://demo.caterking.com/images/wedding-setup.jpg', 'image', 'ready', 'media/images/wedding-setup.jpg', 'jkl012')
ON CONFLICT (id) DO UPDATE SET
    url = EXCLUDED.url,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    storage_path = EXCLUDED.storage_path,
    checksum = EXCLUDED.checksum,
    updated_at = now();

-- =============================================================================
-- TASKS (work assignments across different statuses)
-- =============================================================================

-- Insert demo tasks with various statuses (idempotent)
INSERT INTO public.tasks (id, company_id, event_id, recipe_id, name, quantity, unit, status, priority, assigned_user_id, meta)
VALUES
    -- Tech Conference Lunch - Available tasks
    ('e0z7a999-9c0b-4ef8-bb6d-6bb9bd380e11'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 'v1q8r099-9c0b-4ef8-bb6d-6bb9bd380v22'::uuid, 'Prepare Caesar Salad for Buffet', 200, 'servings', 'pending', 'normal', NULL, '{"station": "Prep Station 1", "estimated_time": "45 minutes"}'::jsonb),
    ('f1a8b099-9c0b-4ef8-bb6d-6bb9bd380f22'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 's8n5o799-9c0b-4ef8-bb6d-6bb9bd380s99'::uuid, 'Portion Salmon Fillets', 150, 'servings', 'pending', 'high', NULL, '{"station": "Prep Station 2", "estimated_time": "30 minutes"}'::jsonb),
    ('g2b9c199-9c0b-4ef8-bb6d-6bb9bd380g33'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 't9o6p899-9c0b-4ef8-bb6d-6bb9bd380t00'::uuid, 'Prepare Risotto Base', 100, 'servings', 'pending', 'normal', NULL, '{"station": "Prep Station 1", "estimated_time": "60 minutes"}'::jsonb),

    -- Tech Conference Lunch - Claimed tasks
    ('h3c0d299-9c0b-4ef8-bb6d-6bb9bd380h44'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 's8n5o799-9c0b-4ef8-bb6d-6bb9bd380s99'::uuid, 'Cook Herb-Crusted Salmon', 150, 'servings', 'claimed', 'urgent', 'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'::uuid, '{"station": "Hot Line", "claimed_at": "2025-12-20T09:30:00Z", "estimated_time": "45 minutes"}'::jsonb),
    ('i4d1e399-9c0b-4ef8-bb6d-6bb9bd380i55'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 't9o6p899-9c0b-4ef8-bb6d-6bb9bd380t00'::uuid, 'Finish Truffle Risotto', 100, 'servings', 'claimed', 'high', 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66'::uuid, '{"station": "Hot Line", "claimed_at": "2025-12-20T10:00:00Z", "estimated_time": "30 minutes"}'::jsonb),

    -- Tech Conference Lunch - In progress tasks
    ('j5e2f499-9c0b-4ef8-bb6d-6bb9bd380j66'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 'v1q8r099-9c0b-4ef8-bb6d-6bb9bd380v22'::uuid, 'Plate Caesar Salads', 200, 'servings', 'claimed', 'normal', 'g6b3c599-9c0b-4ef8-bb6d-6bb9bd380g77'::uuid, '{"station": "Plating Station", "started_at": "2025-12-20T11:15:00Z", "estimated_time": "25 minutes"}'::jsonb),

    -- Corporate Holiday Party - Completed tasks
    ('k6f3g599-9c0b-4ef8-bb6d-6bb9bd380k77'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'p5k2l499-9c0b-4ef8-bb6d-6bb9bd380p66'::uuid, 'w2r9s199-9c0b-4ef8-bb6d-6bb9bd380w33'::uuid, 'Prepare Beef Wellington', 50, 'servings', 'completed', 'high', 'h7c4d699-9c0b-4ef8-bb6d-6bb9bd380h88'::uuid, '{"station": "Prep Station 2", "completed_at": "2025-12-22T14:30:00Z", "quality_check": "passed"}'::jsonb),
    ('l7g4h699-9c0b-4ef8-bb6d-6bb9bd380l88'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'p5k2l499-9c0b-4ef8-bb6d-6bb9bd380p66'::uuid, 'u0p7q999-9c0b-4ef8-bb6d-6bb9bd380u11'::uuid, 'Bake Chocolate Soufflés', 80, 'servings', 'completed', 'urgent', 'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'::uuid, '{"station": "Dessert Station", "completed_at": "2025-12-22T16:45:00Z", "quality_check": "passed"}'::jsonb),

    -- Wedding Reception - Verified tasks
    ('m8h5i799-9c0b-4ef8-bb6d-6bb9bd380m99'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'q6l3m599-9c0b-4ef8-bb6d-6bb9bd380q77'::uuid, 'w2r9s199-9c0b-4ef8-bb6d-6bb9bd380w33'::uuid, 'Present Beef Wellington', 30, 'servings', 'verified', 'urgent', 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66'::uuid, '{"station": "Plating Station", "verified_at": "2025-12-25T18:30:00Z", "verified_by": "d3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44"}'::jsonb),

    -- General prep tasks (no event)
    ('n9i6j899-9c0b-4ef8-bb6d-6bb9bd380n00'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, NULL, NULL, 'Stock Inventory Check', 1, 'task', 'pending', 'low', NULL, '{"station": "Storage", "recurring": true, "frequency": "daily"}'::jsonb),
    ('o0j7k999-9c0b-4ef8-bb6d-6bb9bd380o11'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, NULL, NULL, 'Clean Kitchen Equipment', 1, 'task', 'completed', 'normal', 'g6b3c599-9c0b-4ef8-bb6d-6bb9bd380g77'::uuid, '{"station": "All Stations", "completed_at": "2025-12-19T22:00:00Z", "deep_clean": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    quantity = EXCLUDED.quantity,
    unit = EXCLUDED.unit,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    assigned_user_id = EXCLUDED.assigned_user_id,
    meta = EXCLUDED.meta,
    updated_at = now();

-- =============================================================================
-- TASK COMMENTS (communication on tasks)
-- =============================================================================

-- Insert demo task comments (idempotent)
INSERT INTO public.task_comments (id, task_id, company_id, author_id, body)
VALUES
    ('p1k8l099-9c0b-4ef8-bb6d-6bb9bd380p22'::uuid, 'h3c0d299-9c0b-4ef8-bb6d-6bb9bd380h44'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'::uuid, 'Starting salmon prep - fillets look good quality. Will need extra herbs for the crust.'),
    ('q2l9m199-9c0b-4ef8-bb6d-6bb9bd380q33'::uuid, 'i4d1e399-9c0b-4ef8-bb6d-6bb9bd380i55'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66'::uuid, 'Risotto is coming along well. Truffle aroma is developing nicely. Should be ready in 10 minutes.'),
    ('r3m0n299-9c0b-4ef8-bb6d-6bb9bd380r44'::uuid, 'k6f3g599-9c0b-4ef8-bb6d-6bb9bd380k77'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'h7c4d699-9c0b-4ef8-bb6d-6bb9bd380h88'::uuid, 'Beef Wellingtons are prepped and chilling. Puff pastry is perfect consistency.'),
    ('s4n1o399-9c0b-4ef8-bb6d-6bb9bd380s55'::uuid, 'm8h5i799-9c0b-4ef8-bb6d-6bb9bd380m99'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'd3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44'::uuid, 'Plating looks excellent! The Wellington presentation is perfect for the wedding photos.')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- AUDIT LOGS (system activity tracking)
-- =============================================================================

-- Insert demo audit logs (idempotent)
INSERT INTO public.audit_logs (id, company_id, actor_id, entity_type, entity_id, action, diff)
VALUES
    ('t5o2p499-9c0b-4ef8-bb6d-6bb9bd380t66'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'b1f8c099-9c0b-4ef8-bb6d-6bb9bd380b22'::uuid, 'event', 'o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55'::uuid, 'CREATE', '{"name": "Tech Conference Lunch", "scheduled_at": "2025-12-20T12:00:00Z"}'::jsonb),
    ('u6p3q599-9c0b-4ef8-bb6d-6bb9bd380u77'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'c2d9e199-9c0b-4ef8-bb6d-6bb9bd380c33'::uuid, 'task', 'h3c0d299-9c0b-4ef8-bb6d-6bb9bd380h44'::uuid, 'UPDATE', '{"status": {"old": "pending", "new": "claimed"}, "assigned_user_id": "e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55"}'::jsonb),
    ('v7q4r699-9c0b-4ef8-bb6d-6bb9bd380v88'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'::uuid, 'task', 'k6f3g599-9c0b-4ef8-bb6d-6bb9bd380k77'::uuid, 'UPDATE', '{"status": {"old": "claimed", "new": "completed"}}'::jsonb),
    ('w8r5s799-9c0b-4ef8-bb6d-6bb9bd380w99'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'd3e0f299-9c0b-4ef8-bb6d-6bb9bd380d44'::uuid, 'task', 'm8h5i799-9c0b-4ef8-bb6d-6bb9bd380m99'::uuid, 'UPDATE', '{"status": {"old": "completed", "new": "verified"}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- NOTIFICATION PREFERENCES (user settings)
-- =============================================================================

-- Insert demo notification preferences (idempotent)
INSERT INTO public.notification_preferences (id, company_id, user_id, channel, enabled, quiet_hours)
VALUES
    ('x9s6t899-9c0b-4ef8-bb6d-6bb9bd380x00'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'e4f1a399-9c0b-4ef8-bb6d-6bb9bd380e55'::uuid, 'push', true, '23:00-07:00'),
    ('y0t7u999-9c0b-4ef8-bb6d-6bb9bd380y11'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'f5a2b499-9c0b-4ef8-bb6d-6bb9bd380f66'::uuid, 'push', true, '22:00-06:00'),
    ('z1u8v099-9c0b-4ef8-bb6d-6bb9bd380z22'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'g6b3c599-9c0b-4ef8-bb6d-6bb9bd380g77'::uuid, 'push', false, NULL),
    ('a2v9w199-9c0b-4ef8-bb6d-6bb9bd380a33'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'h7c4d699-9c0b-4ef8-bb6d-6bb9bd380h88'::uuid, 'push', true, '00:00-08:00')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- REALTIME SUBSCRIPTIONS (presence tracking)
-- =============================================================================

-- Insert demo realtime subscriptions (idempotent)
INSERT INTO public.realtime_subscriptions (id, company_id, channel_name, device_id, last_heartbeat_at)
VALUES
    ('b3w0x299-9c0b-4ef8-bb6d-6bb9bd380b44'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'tasks', 'mobile-ios-maria', now() - interval '5 minutes'),
    ('c4x1y399-9c0b-4ef8-bb6d-6bb9bd380c55'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'tasks', 'mobile-android-david', now() - interval '2 minutes'),
    ('d5y2z499-9c0b-4ef8-bb6d-6bb9bd380d66'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'events', 'desktop-chrome-manager', now() - interval '1 minute')
ON CONFLICT (id) DO UPDATE SET
    last_heartbeat_at = EXCLUDED.last_heartbeat_at;

-- =============================================================================
-- DISPLAY SNAPSHOTS (wall display data)
-- =============================================================================

-- Insert demo display snapshots (idempotent)
INSERT INTO public.display_snapshots (id, company_id, payload, captured_at)
VALUES
    ('e6z3a599-9c0b-4ef8-bb6d-6bb9bd380e77'::uuid, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
     '{
       "events": [
         {"id": "o4j1k399-9c0b-4ef8-bb6d-6bb9bd380o55", "name": "Tech Conference Lunch", "status": "published", "scheduled_at": "2025-12-20T12:00:00Z"},
         {"id": "p5k2l499-9c0b-4ef8-bb6d-6bb9bd380p66", "name": "Corporate Holiday Party", "status": "published", "scheduled_at": "2025-12-22T18:00:00Z"}
       ],
       "tasks": [
         {"id": "h3c0d299-9c0b-4ef8-bb6d-6bb9bd380h44", "name": "Cook Herb-Crusted Salmon", "status": "claimed", "assigned_user": "Maria Garcia", "priority": "urgent"},
         {"id": "i4d1e399-9c0b-4ef8-bb6d-6bb9bd380i55", "name": "Finish Truffle Risotto", "status": "claimed", "assigned_user": "David Kim", "priority": "high"}
       ],
       "stations": [
         {"name": "Hot Line", "active_tasks": 2, "staff_count": 2},
         {"name": "Prep Station 1", "active_tasks": 1, "staff_count": 1}
       ]
     }'::jsonb,
     now() - interval '10 minutes')
ON CONFLICT (id) DO UPDATE SET
    payload = EXCLUDED.payload,
    captured_at = EXCLUDED.captured_at;

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
/*
Run these queries after seeding to verify data integrity:

-- Company and users
SELECT c.name as company, count(u.*) as users, array_agg(u.display_name) as staff
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
WHERE c.id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
GROUP BY c.id, c.name;

-- Events and task counts
SELECT e.name as event, e.status, e.scheduled_at, count(t.*) as tasks
FROM events e
LEFT JOIN tasks t ON e.id = t.event_id
WHERE e.company_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
GROUP BY e.id, e.name, e.status, e.scheduled_at
ORDER BY e.scheduled_at;

-- Task status distribution
SELECT status, priority, count(*) as count
FROM tasks
WHERE company_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
GROUP BY status, priority
ORDER BY status, priority;

-- Recipes with method docs
SELECT r.name as recipe, count(md.*) as docs, array_agg(md.type) as doc_types
FROM recipes r
LEFT JOIN method_documents md ON r.id = md.recipe_id
WHERE r.company_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
GROUP BY r.id, r.name;

-- Active tasks by station
SELECT
    t.meta->>'station' as station,
    count(*) as active_tasks,
    count(DISTINCT t.assigned_user_id) as assigned_staff,
    array_agg(DISTINCT u.display_name) FILTER (WHERE u.display_name IS NOT NULL) as staff_names
FROM tasks t
LEFT JOIN users u ON t.assigned_user_id = u.id
WHERE t.company_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND t.status IN ('claimed', 'in_progress')
  AND t.meta->>'station' IS NOT NULL
GROUP BY t.meta->>'station';

-- Recent audit activity
SELECT al.action, al.entity_type, count(*) as count
FROM audit_logs al
WHERE al.company_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND al.created_at >= now() - interval '24 hours'
GROUP BY al.action, al.entity_type
ORDER BY al.action, al.entity_type;
*/