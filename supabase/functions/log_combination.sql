-- Function: approve_combine
-- Approves a task combination suggestion, combines tasks, and logs the approval.

CREATE OR REPLACE FUNCTION public.approve_combine(suggestion_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
  suggestion_record record;
  combined_group_id uuid;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Permission check: managers and above can approve
  IF role NOT IN ('manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to approve combine';
  END IF;

  -- Get suggestion
  SELECT * INTO suggestion_record
  FROM task_similarity_suggestions
  WHERE id = suggestion_id AND company_id = company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found';
  END IF;

  -- Combine the tasks
  SELECT (combine_tasks(ARRAY[suggestion_record.task_id, suggestion_record.suggested_task_id])->>'combined_group_id')::uuid INTO combined_group_id;

  -- Audit log the approval
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (company_id, user_id, 'task', combined_group_id, 'approve_combine', jsonb_build_object('suggestion_id', suggestion_id, 'task_ids', ARRAY[suggestion_record.task_id, suggestion_record.suggested_task_id], 'similarity_score', suggestion_record.similarity_score));

  -- Delete the suggestion after approval
  DELETE FROM task_similarity_suggestions WHERE id = suggestion_id;

  RETURN json_build_object('success', true, 'combined_group_id', combined_group_id, 'timestamp', now());
END;
$$;

-- Function: reject_combine
-- Rejects a task combination suggestion and logs the rejection.

CREATE OR REPLACE FUNCTION public.reject_combine(suggestion_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
  suggestion_record record;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Permission check: managers and above can reject
  IF role NOT IN ('manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to reject combine';
  END IF;

  -- Get suggestion
  SELECT * INTO suggestion_record
  FROM task_similarity_suggestions
  WHERE id = suggestion_id AND company_id = company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found';
  END IF;

  -- Audit log the rejection
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (company_id, user_id, 'task', suggestion_record.task_id, 'reject_combine', jsonb_build_object('suggestion_id', suggestion_id, 'suggested_task_id', suggestion_record.suggested_task_id, 'similarity_score', suggestion_record.similarity_score));

  -- Delete the suggestion after rejection
  DELETE FROM task_similarity_suggestions WHERE id = suggestion_id;

  RETURN json_build_object('success', true, 'timestamp', now());
END;
$$;

-- Function: log_snapshot
-- Logs a display snapshot creation.

CREATE OR REPLACE FUNCTION public.log_snapshot(display_id uuid, snapshot_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Permission check: all authenticated users can log snapshots
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Audit log the snapshot
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (company_id, user_id, 'display', display_id, 'snapshot', snapshot_data);

  RETURN json_build_object('success', true, 'timestamp', now());
END;
$$;

-- Function: log_rollback
-- Logs rollback actions with detailed before/after state diffs.

CREATE OR REPLACE FUNCTION public.log_rollback(
  entity_type text,
  entity_id uuid,
  rollback_diff jsonb,
  reason text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
  audit_log_id uuid;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Permission check: managers and above can log rollbacks
  IF role NOT IN ('manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to log rollback';
  END IF;

  -- Build diff data
  DECLARE
    diff_data jsonb := jsonb_build_object(
      'rollback_diff', rollback_diff,
      'reason', reason,
      'rolled_back_at', now()
    );
  END;

  -- Insert audit log
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (company_id, user_id, entity_type, entity_id, 'rollback', diff_data)
  RETURNING id INTO audit_log_id;

  -- Realtime notify
  PERFORM pg_notify('realtime', json_build_object(
    'type', 'rollback_update',
    'entity_type', entity_type,
    'entity_id', entity_id,
    'data', diff_data,
    'actor', user_id,
    'timestamp', now()
  )::text);

  RETURN json_build_object(
    'success', true,
    'audit_log_id', audit_log_id,
    'timestamp', now()
  );
END;
$$;