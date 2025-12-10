<!-- anchor: iteration-4-plan -->
### Iteration 4: Notifications, Display Snapshots & Operational Guardrails

*   **Iteration ID:** `I4`
*   **Goal:** Finalize notification/undo runtime, display snapshot contracts, kiosk hardening, and operational automation (runbooks, synthetic monitors) to prepare for production readiness work.
*   **Prerequisites:** `I3`
*   **Tasks:**

<!-- anchor: task-i4-t1 -->
*   **Task 4.1:**
    *   **Task ID:** `I4.T1`
    *   **Description:** Implement Notification & Undo service (client + server), shared toast queue, Supabase channel `company:{id}:notifications`, TTL enforcement, telemetry hooks.
    *   **Agent Type Hint:** `FullStackAgent`
    *   **Inputs:** Undo spec, hooks, telemetry helpers.
    *   **Input Files:** [`libs/shared/src/notifications.ts`, `apps/prepchef/components/ToastHost.tsx`, `apps/prepchef/app/layout.tsx`, `apps/admin-crm/components/NotificationPanel.tsx`]
    *   **Target Files:** [`libs/shared/src/notifications.ts`, `libs/shared/src/undoQueue.ts`, `apps/prepchef/components/ToastHost.tsx`, `apps/admin-crm/components/NotificationPanel.tsx`, `apps/display/components/AlertBanner.tsx`]
    *   **Deliverables:** Notification context w/ TTL timers, undo button, cross-app panel; docs describing payload contract.
    *   **Acceptance Criteria:** Toasts dedupe via idempotency; undo window enforced; tests validate TTL + telemetry emission.
    *   **Dependencies:** `I2.T5`, `I3.T1`
    *   **Parallelizable:** No

<!-- anchor: task-i4-t2 -->
*   **Task 4.2:**
    *   **Task ID:** `I4.T2`
    *   **Description:** Draft Display Snapshot JSON Schema + implement API/backfill job storing snapshots, kiosk fallback caching, and manifest entry for contract.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** Display requirements, realtime fallback plan.
    *   **Input Files:** [`docs/contracts/display_snapshot.schema.json`, `supabase/migrations/20250509_display_snapshot.sql`, `apps/display/app/api/snapshot/route.ts`]
    *   **Target Files:** [`docs/contracts/display_snapshot.schema.json`, `supabase/migrations/20250509_display_snapshot.sql`, `apps/display/app/api/snapshot/route.ts`, `tooling/scripts/snapshot_cron.ts`]
    *   **Deliverables:** JSON Schema validating kiosk payload, SQL migration for snapshot table, Next.js API route returning schema-compliant payload, cron job script for scheduled captures.
    *   **Acceptance Criteria:** Schema validated via ajv; API returns `schema_version`; cron script documented; kiosk fallback uses schema.
    *   **Dependencies:** `I2.T8`, `I3.T4`
    *   **Parallelizable:** No

<!-- anchor: task-i4-t3 -->
*   **Task 4.3:**
    *   **Task ID:** `I4.T3`
    *   **Description:** Enhance display app with offline cache (IndexedDB), heartbeat monitor, and admin-labeled kiosk identities; update docs with monitoring checklist.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Display snapshot contract, kiosk monitoring plan.
    *   **Input Files:** [`apps/display/hooks/useDisplayData.ts`, `apps/display/components/OfflineBanner.tsx`, `docs/ops/kiosk_monitoring.md`]
    *   **Target Files:** [`apps/display/hooks/useDisplayData.ts`, `apps/display/components/OfflineBanner.tsx`, `apps/display/components/HeartbeatIndicator.tsx`, `docs/ops/kiosk_monitoring.md`]
    *   **Deliverables:** IndexedDB caching, heartbeat indicator, monitoring doc referencing metrics + runbook.
    *   **Acceptance Criteria:** Offline fallback uses last snapshot; monitors log late heartbeats; doc outlines alert thresholds.
    *   **Dependencies:** `I4.T2`
    *   **Parallelizable:** Yes

<!-- anchor: task-i4-t4 -->
*   **Task 4.4:**
    *   **Task ID:** `I4.T4`
    *   **Description:** Build Admin CRM Kanban board for assignments (drag/drop by status/station) with realtime updates + audit log viewer panel.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Admin shell, RPCs, notifications.
    *   **Input Files:** [`apps/admin-crm/app/admin/tasks/page.tsx`, `apps/admin-crm/components/KanbanBoard.tsx`, `apps/admin-crm/components/AuditPanel.tsx`]
    *   **Target Files:** [`apps/admin-crm/app/admin/tasks/page.tsx`, `apps/admin-crm/components/KanbanBoard.tsx`, `apps/admin-crm/components/TaskCard.tsx`, `apps/admin-crm/components/AuditPanel.tsx`]
    *   **Deliverables:** Drag/drop board, audit sidebar showing realtime entries, manual assignment actions hooking into RPCs.
    *   **Acceptance Criteria:** Drag accessible via keyboard; assignments update within 150ms; audit panel filters by entity.
    *   **Dependencies:** `I3.T8`, `I2.T4`
    *   **Parallelizable:** No

<!-- anchor: task-i4-t5 -->
*   **Task 4.5:**
    *   **Task ID:** `I4.T5`
    *   **Description:** Implement Synthetic Monitor scripts hitting `/tasks`, `/admin/events`, `/display`, `/api/health/realtime`, logging to observability stack per Section 3.5.
    *   **Agent Type Hint:** `DevOpsAgent`
    *   **Inputs:** Observability plan, telemetry helper.
    *   **Input Files:** [`tooling/scripts/synthetic_monitor.ts`, `.github/workflows/monitor.yml`, `docs/ops/observability_plan.md`]
    *   **Target Files:** [`tooling/scripts/synthetic_monitor.ts`, `.github/workflows/monitor.yml`, `docs/ops/observability_plan.md`]
    *   **Deliverables:** Script scheduling HTTP checks + SSE tests, GitHub Action or cron config, doc updates describing alerts.
    *   **Acceptance Criteria:** Monitor sends results to telemetry sink; failure pipeline notifies Slack/email; doc lists run cadence.
    *   **Dependencies:** `I1.T11`, `I3.T4`
    *   **Parallelizable:** Yes

<!-- anchor: task-i4-t6 -->
*   **Task 4.6:**
    *   **Task ID:** `I4.T6`
    *   **Description:** Optimize performance (React Profiler + Supabase EXPLAIN) for PrepChef list + Admin board; implement pagination/cursor strategies; document guidance.
    *   **Agent Type Hint:** `PerformanceEngineer`
    *   **Inputs:** Hooks, API, Supabase queries.
    *   **Input Files:** [`apps/prepchef/app/(app)/tasks/page.tsx`, `apps/admin-crm/app/admin/tasks/page.tsx`, `docs/ops/performance.md`]
    *   **Target Files:** [`apps/prepchef/app/(app)/tasks/page.tsx`, `apps/admin-crm/app/admin/tasks/page.tsx`, `libs/supabase/src/queries.ts`, `docs/ops/performance.md`]
    *   **Deliverables:** Cursor-based pagination, server component streaming improvements, doc summarizing budgets + profiling results.
    *   **Acceptance Criteria:** Task list TTI <3s; Admin board initial load <4s; doc references metrics + future tuning items.
    *   **Dependencies:** `I3.T1`, `I3.T4`
    *   **Parallelizable:** No

<!-- anchor: task-i4-t7 -->
*   **Task 4.7:**
    *   **Task ID:** `I4.T7`
    *   **Description:** Formalize incident response runbooks (realtime outage, Supabase downtime, storage backlog, feature flag drift, undo failure) referencing Section 3.7 guidelines.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Ops blueprint, monitoring plan.
    *   **Input Files:** [`docs/ops/runbooks/realtime_outage.md`, `docs/ops/runbooks/storage_backlog.md`, `docs/ops/runbooks/undo_failure.md`]
    *   **Target Files:** [`docs/ops/runbooks/realtime_outage.md`, `docs/ops/runbooks/storage_backlog.md`, `docs/ops/runbooks/feature_flag_drift.md`, `docs/ops/runbooks/undo_failure.md`]
    *   **Deliverables:** Runbooks describing symptoms, steps, rollback levers, communication template references.
    *   **Acceptance Criteria:** Each runbook lists owners, SLAs, post-incident checklist; cross-linked from docs index.
    *   **Dependencies:** `I1.T6`, `I3.T9`
    *   **Parallelizable:** Yes

<!-- anchor: task-i4-t8 -->
*   **Task 4.8:**
    *   **Task ID:** `I4.T8`
    *   **Description:** Build Admin staff management page (role changes, invites, notification preferences) using Access Matrix + new notification service.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Access matrix, notification service.
    *   **Input Files:** [`apps/admin-crm/app/admin/staff/page.tsx`, `apps/admin-crm/components/StaffTable.tsx`]
    *   **Target Files:** [`apps/admin-crm/app/admin/staff/page.tsx`, `apps/admin-crm/components/StaffTable.tsx`, `apps/admin-crm/components/RoleChangeModal.tsx`, `apps/admin-crm/components/PreferenceRow.tsx`]
    *   **Deliverables:** Staff table with filters, role-change modal requiring confirmation, preference toggles writing to Supabase.
    *   **Acceptance Criteria:** Role changes log audit entries + send notifications; invites integrate Supabase Auth; UI enforces RBAC.
    *   **Dependencies:** `I2.T10`, `I4.T1`
    *   **Parallelizable:** No

<!-- anchor: task-i4-t9 -->
*   **Task 4.9:**
    *   **Task ID:** `I4.T9`
    *   **Description:** Automate presence heatmap + kiosk alerts by extending Supabase cron job to compute load metrics, writing to new table consumed by display + admin dashboards.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** Presence tables, display components.
    *   **Input Files:** [`supabase/functions/presence_heatmap.sql`, `apps/display/components/PresenceLane.tsx`, `apps/admin-crm/components/DashboardCards.tsx`]
    *   **Target Files:** [`supabase/functions/presence_heatmap.sql`, `supabase/migrations/20250509_presence_heatmap.sql`, `apps/display/components/PresenceLane.tsx`, `apps/admin-crm/components/DashboardCards.tsx`]
    *   **Deliverables:** Function computing station load, storage of metrics, UI updates showing heatmap + alerts.
    *   **Acceptance Criteria:** Cron runs hourly; UI updates within SLA; doc updated with metric definitions.
    *   **Dependencies:** `I2.T8`, `I4.T3`
    *   **Parallelizable:** Yes

<!-- anchor: task-i4-t10 -->
*   **Task 4.10:**
    *   **Task ID:** `I4.T10`
    *   **Description:** Extend QA to include kiosk offline scenarios, notification flood tests, and admin role-change flows; capture findings in testing matrix.
    *   **Agent Type Hint:** `QualityAgent`
    *   **Inputs:** Notification service, display snapshot, runbooks.
    *   **Input Files:** [`tests/e2e/kiosk_offline.spec.ts`, `tests/e2e/notification_storm.spec.ts`, `tests/e2e/role_change.spec.ts`, `docs/quality/testing_matrix.md`]
    *   **Target Files:** [`tests/e2e/kiosk_offline.spec.ts`, `tests/e2e/notification_storm.spec.ts`, `tests/e2e/role_change.spec.ts`, `docs/quality/testing_matrix.md`]
    *   **Deliverables:** Additional Playwright suites with fixtures, matrix updates linking coverage.
    *   **Acceptance Criteria:** Tests stable; matrix updated; results feed into runbooks for regression reproduction.
    *   **Dependencies:** `I4.T1`, `I4.T2`, `I4.T8`
    *   **Parallelizable:** Yes

<!-- anchor: task-i4-t11 -->
*   **Task 4.11:**
    *   **Task ID:** `I4.T11`
    *   **Description:** Integrate release governance automation (Changesets tagging, Doppler promotion script, Supabase migration verification) to enforce change control.
    *   **Agent Type Hint:** `DevOpsAgent`
    *   **Inputs:** Deployment diagram, runbooks, CI pipeline.
    *   **Input Files:** [`tooling/scripts/release_guard.ps1`, `.github/workflows/release.yml`, `docs/ops/release_checklist.md`]
    *   **Target Files:** [`tooling/scripts/release_guard.ps1`, `.github/workflows/release.yml`, `docs/ops/release_checklist.md`]
    *   **Deliverables:** Script verifying migrations applied + Flagsmith states before tagging, workflow automating Doppler env promotion, checklist for CAB approval.
    *   **Acceptance Criteria:** Release workflow blocks on guard script; documentation outlines approvals; logs stored for audit.
    *   **Dependencies:** `I1.T9`, `I1.T6`
    *   **Parallelizable:** Yes
