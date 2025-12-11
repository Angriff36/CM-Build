-- 0005_recipes_methods.sql
-- Description: Add recipes and method_documents tables with versioning, JSONB steps, tags, allergen flags, and media references per I3.T1.
-- References: I3.T1, 5-0-the-contract

-- Enable updated_at trigger for recipes
CREATE TRIGGER on_recipe_updated BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create recipes table
CREATE TABLE public.recipes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    name text NOT NULL,
    ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
    steps jsonb NOT NULL DEFAULT '[]'::jsonb,
    media_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
    version text NOT NULL DEFAULT '1.0',
    tags text[],
    allergen_flags text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT recipes_pkey PRIMARY KEY (id),
    CONSTRAINT recipes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Create method_documents table
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

-- Indexes
CREATE INDEX idx_recipes_company_id ON public.recipes(company_id);
CREATE INDEX idx_recipes_company_version ON public.recipes(company_id, version);
CREATE INDEX idx_recipes_tags ON public.recipes USING gin(tags);
CREATE INDEX idx_method_documents_company_id ON public.method_documents(company_id);

-- Seed data for sample recipes and method documents (assuming a sample company_id exists)
-- Note: Replace 'sample-company-id' with actual company_id in dev environment
INSERT INTO public.recipes (company_id, name, ingredients, steps, media_urls, version, tags, allergen_flags) VALUES
('sample-company-id', 'Classic Caesar Salad', '[{"name": "Romaine lettuce", "quantity": 1, "unit": "head"}, {"name": "Parmesan cheese", "quantity": 0.5, "unit": "cup"}]', '[{"step": 1, "instruction": "Wash and chop lettuce"}, {"step": 2, "instruction": "Add dressing and toss"}]', '[]', '1.0', ARRAY['salad', 'vegetarian'], ARRAY['dairy']);

INSERT INTO public.method_documents (company_id, title, steps, video_refs, skill_level) VALUES
('sample-company-id', 'Knife Skills Basics', '[{"step": 1, "instruction": "Hold knife properly"}, {"step": 2, "instruction": "Practice julienne cuts"}]', '[]', 'beginner');

-- Down migration (for reversibility)
-- DELETE FROM public.method_documents WHERE company_id = 'sample-company-id';
-- DELETE FROM public.recipes WHERE company_id = 'sample-company-id';
-- DROP INDEX IF EXISTS idx_method_documents_company_id;
-- DROP INDEX IF EXISTS idx_recipes_tags;
-- DROP INDEX IF EXISTS idx_recipes_company_version;
-- DROP INDEX IF EXISTS idx_recipes_company_id;
-- DROP TABLE IF EXISTS public.method_documents;
-- DROP TABLE IF EXISTS public.recipes;