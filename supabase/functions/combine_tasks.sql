-- Function: combine_tasks
-- Combines multiple tasks into a single combined group.

CREATE OR REPLACE FUNCTION public.combine_tasks(task_ids uuid[])
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
  combined_group_id uuid;
  task_record record;
  undo_token text;
  audit_log_id uuid;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Permission check: managers and above can combine
  IF role NOT IN ('manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to combine tasks';
  END IF;

  -- Validate tasks exist in company and are available
  FOR task_record IN
    SELECT id, status FROM tasks WHERE id = ANY(task_ids) AND company_id = company_id
  LOOP
    IF task_record.status != 'available' THEN
      RAISE EXCEPTION 'Task % is not available for combining', task_record.id;
    END IF;
  END LOOP;

  IF array_length(task_ids, 1) < 2 THEN
    RAISE EXCEPTION 'At least two tasks required for combining';
  END IF;

  -- Create combined group id
  combined_group_id := uuid_generate_v4();

  -- Update tasks
  UPDATE tasks
  SET combined_group_id = combined_group_id, status = 'claimed', assigned_user_id = user_id
  WHERE id = ANY(task_ids);

   -- Audit log
   INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
   VALUES (company_id, user_id, 'task', combined_group_id, 'combine', jsonb_build_object('task_ids', task_ids))
   RETURNING id INTO audit_log_id;

   -- Generate undo token
   undo_token := encode(gen_random_bytes(32), 'hex');

   INSERT INTO undo_tokens (company_id, task_id, token, expires_at, audit_log_id)
   VALUES (company_id, combined_group_id, undo_token, now() + interval '1 hour', audit_log_id);

   -- Realtime notify for each task
  FOR task_record IN SELECT id FROM tasks WHERE id = ANY(task_ids) LOOP
    PERFORM pg_notify('realtime', json_build_object(
      'type', 'task_update',
      'entity_id', task_record.id,
      'data', jsonb_build_object('combined_group_id', combined_group_id, 'status', 'claimed'),
      'actor', user_id,
      'timestamp', now()
    )::text);
  END LOOP;

   RETURN json_build_object('success', true, 'combined_group_id', combined_group_id, 'undo_token', undo_token, 'timestamp', now());
END;
$$;