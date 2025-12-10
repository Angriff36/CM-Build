<!-- anchor: access-matrix -->
# Access Control Matrix

This specification enumerates CRUD expectations for the Staff, Manager, Event
Lead, and Owner roles across the core entities (tasks, recipes/methods, media,
and display/kiosk artifacts). The platform follows **Path B (RLS driven
roles)** where Supabase JWT claims mirror `users.role`, so every API call must
pass the relevant row-level policies defined below. UI clients reinforce these
boundaries through guard rails provided by `libs/shared/access`.

## Role Overview

- **Staff:** Executes tasks, can claim/unclaim/complete their own work, and
  consumes reference content.
- **Manager:** Oversees day-to-day operations across all company events,
  orchestrates staffing, and curates shared assets when owner approval exists.
- **Event Lead:** Manages one or more assigned events, can rebalance work inside
  those events, and uploads contextual media for the crew.
- **Owner:** Controls company-wide configuration, recipes, and auditing,
  including role assignment, undo history, and kiosk layouts.

## CRUD + Policy Matrix

| Role | Tasks (CRUD) | Recipes & Methods | Media Library | Display & Kiosk Surfaces | Supabase Policies | Feature Flags & Undo Scope |
| --- | --- | --- | --- | --- | --- | --- |
| **Staff** | Read company tasks plus create claim/unclaim/complete events on rows linked to their `user_id`. Cannot insert/delete tasks. | Read-only access to published recipes/methods scoped to `company_id`. | View/download recipe attachments; upload blocked. | Read-only on kiosk/display feeds filtered to assigned events; kiosk view hides unassigned events by default. | `policy_tasks_staff_read`, `policy_tasks_staff_update_status`, `policy_recipes_staff_read`, `policy_media_staff_read`, `policy_displays_staff_read` | `flag.tasks.undo_staff_window` (10 min) limits "undo completion" to own actions; kiosk visibility obeys `flag.display.kiosk_self_assign` so staff only see stations linked to their current shift. |
| **Manager** | Full CRUD on tasks scoped to company; can reassign, reopen, and delete draft tasks. Cannot delete tasks once marked completed unless owner approval toggles. | May create/update recipes and methods when a draft is flagged for review; deletions require owner override. | Upload/edit media tied to recipes and training modules; can retire media with soft-delete. | Configure kiosk rotations across events, toggle visibility of stations, and push urgent banners. | `policy_tasks_manager_crud`, `policy_recipes_manager_write`, `policy_media_manager_write`, `policy_displays_manager_admin` | `flag.tasks.undo_manager_scope` expands undo to any staff action inside same event (default 24 h). Display edits require `flag.display.broadcast_manager`. |
| **Event Lead** | Create/assign/update tasks for events where `event_lead_id` matches; cannot delete tasks from other events. | Read-only baseline recipes plus ability to capture event-specific notes stored as `recipes_annotations`. | Upload reference photos or prep checklists scoped to their event; cannot alter shared assets. | Control kiosk playlist/order for assigned events only; cannot alter company defaults. | `policy_tasks_event_lead_crud`, `policy_recipes_event_lead_read`, `policy_media_event_lead_write`, `policy_displays_event_lead_manage` | `flag.tasks.undo_event_lead_span` permits undo of any action within owned events for 6 h; kiosk visibility forces "assigned-event only" regardless of flags. |
| **Owner** | Global CRUD plus archival of tasks; can run maintenance RPCs that bypass regular policies via service role only from Edge Functions. | Full CRUD including publishing, versioning, and retirement of recipes/methods. | Administer all media assets, approve deletions, and restore archived media. | Set global kiosk layouts, pin high-priority events, and impersonate kiosks for QA. | `policy_tasks_owner_admin`, `policy_recipes_owner_admin`, `policy_media_owner_admin`, `policy_displays_owner_admin`, plus RPCs behind `policy_roles_owner_manage` for role assignments | `flag.tasks.undo_owner_full` enables undo across the entire company history (subject to audit log retention). Kiosk overrides respect `flag.display.impersonation` gated to owners. |

## Policy Notes

- **JWT Claim Mapping:** Policies expect `jwt.claims.role` plus `company_id`
  claims propagated by Supabase Auth. Service-role RPCs (e.g.,
  `rpc_tasks_owner_archive`) are restricted to owners invoking Edge Functions.
- **Audit Expectations:** Mutations for tasks, recipes, and role assignments
  must insert into `audit_logs` with `actor_id`, `entity_type`, `entity_id`,
  `prior_value`, and `new_value`. Staff cannot redact audit entries; only
  maintenance scripts (owner approved) may prune by retention policy.
- **Undo Mechanics:** Undo flows read from `audit_logs` to determine latest
  reversible mutation. Feature flags above configure the lookback horizon while
  Supabase RLS enforces that only management roles can undo another person's
  work.

## UI Affordances

- **Guarded Controls:** Components sourced from `libs/shared/access` evaluate
  the matrix above to disable or hide buttons. For example, the task detail
  drawer hides the delete button for staff/event leads when `hasDelete` is
  false, preventing privilege escalation even before RLS rejection.
- **Kiosk Visibility:** Display surfaces default to manager/owner scope. Staff
  apps always request kiosk feeds with an `event_id` filter, ensuring no
  cross-company leakage even if UI toggles are misconfigured.
- **Role Change Feedback:** When owners update `role_assignments`, managers
  receive toast notifications so they know when their access expands or
  contracts, matching the `role_assignments` append-only ledger requirement.

_Status: ready for review with solution architects._
