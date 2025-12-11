-- 0006_media_assets.sql
-- Description: Add media_assets and role_assignments tables with history tracking per I3.T1.
-- References: I3.T1, 5-0-the-contract

-- Enable updated_at trigger for media_assets
CREATE TRIGGER on_media_updated BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create media_assets table
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

-- Create role_assignments table
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

-- Indexes
CREATE INDEX idx_media_assets_company_id ON public.media_assets(company_id);
CREATE INDEX idx_media_assets_company_status ON public.media_assets(company_id, status);
CREATE INDEX idx_media_assets_checksum ON public.media_assets(checksum);
CREATE INDEX idx_role_assignments_company_user ON public.role_assignments(company_id, user_id);

-- Seed data for sample media_assets and role_assignments (assuming sample company_id and user_ids exist)
-- Note: Replace placeholders with actual IDs in dev environment
INSERT INTO public.media_assets (company_id, url, type, status, storage_path) VALUES
('sample-company-id', 'https://example.com/video1.mp4', 'video', 'ready', '/uploads/video1.mp4');

INSERT INTO public.role_assignments (company_id, user_id, role, granted_by) VALUES
('sample-company-id', 'sample-user-id', 'manager', 'sample-granter-id');

-- Down migration (for reversibility)
-- DELETE FROM public.role_assignments WHERE company_id = 'sample-company-id';
-- DELETE FROM public.media_assets WHERE company_id = 'sample-company-id';
-- DROP INDEX IF EXISTS idx_role_assignments_company_user;
-- DROP INDEX IF EXISTS idx_media_assets_checksum;
-- DROP INDEX IF EXISTS idx_media_assets_company_status;
-- DROP INDEX IF EXISTS idx_media_assets_company_id;
-- DROP TABLE IF EXISTS public.role_assignments;
-- DROP TABLE IF EXISTS public.media_assets;