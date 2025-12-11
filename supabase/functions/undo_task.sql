-- Function: undo_task
-- Reverts the last action on a task using an undo token.

CREATE OR REPLACE FUNCTION public.undo_task(undo_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  company_id uuid;
  role text;
  task_id uuid;
  token_record record;
  last_action record;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO user_id, company_id, role;

  -- Find token
  SELECT * INTO token_record
  FROM undo_tokens
  WHERE token = undo_token AND company_id = company_id AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired undo token';
  END IF;

  task_id := token_record.task_id;

  -- Get last audit log for this task by this user
  SELECT * INTO last_action
  FROM audit_logs
  WHERE entity_type = 'task' AND entity_id = task_id AND user_id = user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No action to undo';
  END IF;

  -- Revert based on action
  IF last_action.action = 'claim' THEN
    UPDATE tasks SET status = 'available', assigned_user_id = NULL WHERE id = task_id;
  ELSIF last_action.action = 'complete' THEN
    UPDATE tasks SET status = 'claimed' WHERE id = task_id;
  ELSE
    RAISE EXCEPTION 'Action not undoable';
  END IF;

  -- Delete token
  DELETE FROM undo_tokens WHERE id = token_record.id;

  -- Audit log the undo
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (company_id, user_id, 'task', task_id, 'undo', jsonb_build_object('undid_action', last_action.action));

  -- Realtime notify
  PERFORM pg_notify('realtime', json_build_object(
    'type', 'task_update',
    'entity_id', task_id,
    'data', jsonb_build_object('status', (SELECT status FROM tasks WHERE id = task_id)),
    'actor', user_id,
    'timestamp', now()
  )::text);

  RETURN json_build_object('success', true, 'timestamp', now());
END;
$$;