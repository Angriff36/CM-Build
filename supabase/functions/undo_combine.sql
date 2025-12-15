-- Function: undo_combine
-- Undoes a task combination by uncombining the group.

CREATE OR REPLACE FUNCTION public.undo_combine(p_combined_group_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_role text;
BEGIN
  -- Get user context
  SELECT auth.uid(), get_my_company_id(), get_my_role() INTO v_user_id, v_company_id, v_role;

  -- Permission check
  IF v_role NOT IN ('manager', 'event_lead', 'owner') THEN
    RAISE EXCEPTION 'Insufficient permissions to undo combine';
  END IF;

  -- Update tasks: remove combined_group_id, set status to available
  UPDATE tasks
  SET combined_group_id = NULL, status = 'available', assigned_user_id = NULL
  WHERE combined_group_id = p_combined_group_id AND company_id = v_company_id;

  -- Audit log
  INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
  VALUES (v_company_id, v_user_id, 'task', p_combined_group_id, 'undo_combine', jsonb_build_object('combined_group_id', p_combined_group_id));

  -- Realtime notify
  PERFORM pg_notify('realtime', json_build_object(
    'type', 'task_update',
    'entity_id', p_combined_group_id,
    'data', jsonb_build_object('combined_group_id', null, 'status', 'available'),
    'actor', v_user_id,
    'timestamp', now()
  )::text);

  RETURN json_build_object('success', true, 'timestamp', now());
END;
$$;