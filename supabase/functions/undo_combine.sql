-- Function: undo_combine
-- Undoes a task combination by uncombining the group.

CREATE OR REPLACE FUNCTION public.undo_combine(combined_group_id uuid)
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

  -- Permission check
  IF role NOT IN ('manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to undo combine';
  END IF;

  -- Update tasks: remove combined_group_id, set status to available
  UPDATE tasks
  SET combined_group_id = NULL, status = 'available', assigned_user_id = NULL
  WHERE combined_group_id = combined_group_id AND company_id = company_id;

  -- Audit log
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (company_id, user_id, 'task', combined_group_id, 'undo_combine', jsonb_build_object('combined_group_id', combined_group_id));

  -- Realtime notify
  PERFORM pg_notify('realtime', json_build_object(
    'type', 'task_update',
    'entity_id', combined_group_id,
    'data', jsonb_build_object('combined_group_id', null, 'status', 'available'),
    'actor', user_id,
    'timestamp', now()
  )::text);

  RETURN json_build_object('success', true, 'timestamp', now());
END;
$$;