-- 0008_indexes.sql
-- Description: Add performance indexes for task queries used by heuristics and admin board under load.
-- Performance testing target: 200 tasks across 5 events with <200ms query response times.
-- References: I4.T7 performance testing, board.benchmark.md findings

-- Primary index for task heuristics: fetch tasks by company and status (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_company_status 
ON public.tasks(company_id, status) 
WHERE status IN ('available', 'claimed', 'in_progress');

-- Optimized index for task board: tasks by company, event, and status (board filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_company_event_status 
ON public.tasks(company_id, event_id, status) 
WHERE status IS NOT NULL;

-- Index for task board assignments: tasks by company and assigned user (drag-drop operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_company_assigned_user 
ON public.tasks(company_id, assigned_user_id, status) 
WHERE assigned_user_id IS NOT NULL;

-- Index for priority filtering: tasks by company, status, and priority (board sorting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_company_status_priority 
ON public.tasks(company_id, status DESC, priority DESC, created_at ASC) 
WHERE status IN ('available', 'claimed', 'in_progress');

-- Index for station-based filtering: tasks by company, station, and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_company_station_status 
ON public.tasks(company_id, station, status) 
WHERE station IS NOT NULL;

-- Composite index for similarity suggestions lookup (heuristic results)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_similarity_suggestions_company_score 
ON public.task_similarity_suggestions(company_id, similarity_score DESC, created_at DESC) 
WHERE similarity_score > 0.5;

-- Index for audit logs performance (monitoring heuristics usage)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_company_action_timestamp 
ON public.audit_logs(company_id, action, created_at DESC) 
WHERE action IN ('generate', 'combine', 'rollback');

-- Index for realtime subscriptions: company and table for efficient filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_subscriptions_company_table 
ON public.realtime_subscriptions(company_id, table_name, created_at DESC);

-- Partial index for active users (staff sidebar optimization)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_company_active 
ON public.users(company_id, status, last_seen_at DESC) 
WHERE status = 'active' AND company_id IS NOT NULL;

-- Index for task similarity computation optimization (avoid self-comparisons)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_company_id_name 
ON public.tasks(company_id, id, name) 
WHERE status IN ('available', 'claimed', 'in_progress');

-- Statistics update for query planner optimization
ANALYZE public.tasks;
ANALYZE public.task_similarity_suggestions;
ANALYZE public.audit_logs;
ANALYZE public.realtime_subscriptions;
ANALYZE public.users;

-- Down migration (for reversibility)
-- DROP INDEX IF EXISTS idx_users_company_active;
-- DROP INDEX IF EXISTS idx_tasks_company_id_name;
-- DROP INDEX IF EXISTS idx_audit_logs_company_action_timestamp;
-- DROP INDEX IF EXISTS idx_task_similarity_suggestions_company_score;
-- DROP INDEX IF EXISTS idx_tasks_company_station_status;
-- DROP INDEX IF EXISTS idx_tasks_company_status_priority;
-- DROP INDEX IF EXISTS idx_tasks_company_assigned_user;
-- DROP INDEX IF EXISTS idx_tasks_company_event_status;
-- DROP INDEX IF EXISTS idx_tasks_company_status;
-- DROP INDEX IF EXISTS idx_realtime_subscriptions_company_table;