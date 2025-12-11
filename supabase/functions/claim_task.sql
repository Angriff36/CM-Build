-- Function: claim_task
-- Claims a task for the current user, enforcing permissions and issuing an undo token.

CREATE OR REPLACE FUNCTION public.claim_task(task_id uuid, note text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
  current_status text;
  undo_token text;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Permission check: staff and above can claim
  IF role NOT IN ('staff', 'manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to claim task';
  END IF;

  -- Check task exists in company and is available
  SELECT status INTO current_status
  FROM tasks
  WHERE id = task_id AND company_id = company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  IF current_status != 'available' THEN
    RAISE EXCEPTION 'Task is not available for claiming';
  END IF;

  -- Update task status and assignment
  UPDATE tasks
  SET status = 'claimed', assigned_user_id = user_id
  WHERE id = task_id;



   -- Audit log
   INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
   VALUES (company_id, user_id, 'task', task_id, 'claim', jsonb_build_object('status', 'claimed', 'assigned_user_id', user_id, 'note', note))
   RETURNING id INTO audit_log_id;

   -- Generate undo token
   undo_token := encode(gen_random_bytes(32), 'hex');

   INSERT INTO undo_tokens (company_id, task_id, token, expires_at, audit_log_id)
   VALUES (company_id, task_id, undo_token, now() + interval '1 hour', audit_log_id);

   -- Realtime notify
  PERFORM pg_notify('realtime', json_build_object(
    'type', 'task_update',
    'entity_id', task_id,
    'data', jsonb_build_object('status', 'claimed', 'assigned_user_id', user_id),
    'actor', user_id,
    'timestamp', now()
  )::text);

  RETURN json_build_object('success', true, 'undo_token', undo_token, 'timestamp', now());
END;
$$;