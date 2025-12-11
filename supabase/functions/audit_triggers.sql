-- Audit triggers for tasks table

CREATE OR REPLACE FUNCTION audit_task_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get user from JWT
  user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
    VALUES (NEW.company_id, user_id, 'task', NEW.id, 'insert', jsonb_build_object('new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check for reassign action
    IF OLD.assigned_user_id IS DISTINCT FROM NEW.assigned_user_id AND NEW.assigned_user_id IS NOT NULL THEN
      INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
      VALUES (NEW.company_id, user_id, 'task', NEW.id, 'reassign', jsonb_build_object('old_assigned', OLD.assigned_user_id, 'new_assigned', NEW.assigned_user_id));
    ELSE
      INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
      VALUES (NEW.company_id, user_id, 'task', NEW.id, 'update', jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, diff)
    VALUES (OLD.company_id, user_id, 'task', OLD.id, 'delete', jsonb_build_object('old', row_to_json(OLD)));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_tasks_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION audit_task_changes();