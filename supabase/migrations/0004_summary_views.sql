-- 0004_summary_views.sql
-- Description: Create materialized views for realtime dashboards and refresh mechanisms per I2.T1.
-- References: I2.T1

-- Materialized view for task display summary
CREATE MATERIALIZED VIEW public.task_display_summary AS
SELECT
    t.company_id,
    t.event_id,
    t.status,
    t.priority,
    COUNT(*) as task_count,
    SUM(t.quantity) as total_quantity
FROM public.tasks t
GROUP BY t.company_id, t.event_id, t.status, t.priority;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_task_display_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.task_display_summary;
END;
$$ LANGUAGE plpgsql;

-- Note: Schedule refresh using pg_cron extension if available, e.g.:
-- SELECT cron.schedule('refresh-task-summary', '*/5 * * * *', 'SELECT public.refresh_task_display_summary();');

-- Down migration (for reversibility)
-- DROP FUNCTION IF EXISTS public.refresh_task_display_summary();
-- DROP MATERIALIZED VIEW IF EXISTS public.task_display_summary;