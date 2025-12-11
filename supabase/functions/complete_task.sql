-- Function: complete_task
-- Marks a task as completed, enforcing permissions.

CREATE OR REPLACE FUNCTION public.complete_task(task_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
  current_status text;
  assigned_user uuid;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Permission check: staff and above can complete
  IF role NOT IN ('staff', 'manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to complete task';
  END IF;

  -- Check task exists in company and is claimed by user or user has higher role
  SELECT status, assigned_user_id INTO current_status, assigned_user
  FROM tasks
  WHERE id = task_id AND company_id = company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  IF current_status NOT IN ('claimed', 'in_progress') THEN
    RAISE EXCEPTION 'Task cannot be completed from current status';
  END IF;

  IF assigned_user != user_id AND role = 'staff' THEN
    RAISE EXCEPTION 'Only assigned user or higher role can complete task';
  END IF;

  -- Update task status
  UPDATE tasks
  SET status = 'completed'
  WHERE id = task_id;

  -- Audit log
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (company_id, user_id, 'task', task_id, 'complete', jsonb_build_object('status', 'completed'));

  -- Realtime notify
  PERFORM pg_notify('realtime', json_build_object(
    'type', 'task_update',
    'entity_id', task_id,
    'data', jsonb_build_object('status', 'completed'),
    'actor', user_id,
    'timestamp', now()
  )::text);

  RETURN json_build_object('success', true, 'timestamp', now());
END;
$$;