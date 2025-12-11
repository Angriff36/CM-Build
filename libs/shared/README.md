# @caterkingapp/shared

## RPC Usage and Idempotency Expectations

The task management system provides stored procedures for claiming, completing, undoing, and combining tasks. These procedures enforce role-based permissions, tenant isolation, and include audit logging with realtime notifications.

### Stored Procedures

- `claim_task(task_id uuid, note text DEFAULT NULL)`: Claims an available task for the current user. Returns an undo token valid for 1 hour. Requires staff role or higher.
- `complete_task(task_id uuid)`: Marks a claimed or in-progress task as completed. Requires the assigned user (for staff) or higher role.
- `undo_task(undo_token text)`: Reverts the last claim or complete action using the provided token. Token must be valid and not expired.
- `combine_tasks(task_ids uuid[])`: Combines multiple available tasks into a single group. Requires manager role or higher.

### Idempotency

- Operations check current task state before proceeding to prevent duplicate actions.
- Undo tokens ensure actions can be reverted safely within the expiration window.
- Audit logs track all changes for debugging and compliance.

### Realtime Channels

Changes trigger notifications on the `realtime` channel with payloads including `type`, `entity_id`, `data`, `actor`, and `timestamp`.

Domain models, enums, and validation schemas shared across the monorepo.

## Structure

- `src/enums.ts`: Roles, Statuses.
- `src/types.ts`: DTO interfaces.
