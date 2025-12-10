<!-- anchor: iteration-2-plan -->
### Iteration 2: API & Realtime Foundations

*   **Iteration ID:** `I2`
*   **Goal:** Deliver typed API contracts, Supabase RPC implementations, realtime + undo specs, and shared hooks powering PrepChef/Admin skeletons with optimistic flows.
*   **Prerequisites:** `I1`
*   **Tasks:**

<!-- anchor: task-i2-t1 -->
*   **Task 2.1:**
    *   **Task ID:** `I2.T1`
    *   **Description:** Create OpenAPI v3 spec (`caterking.yaml`) describing tasks/events/recipes/media/users endpoints, schemas, pagination, and error envelopes; integrate linting in CI.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Section 2 API style, Access Matrix, ERD.
    *   **Input Files:** [`api/openapi/caterking.yaml`, `api/openapi/.spectral.yaml`]
    *   **Target Files:** [`api/openapi/caterking.yaml`, `api/openapi/.spectral.yaml`, `package.json` scripts]
    *   **Deliverables:** Validated OpenAPI doc with examples, Spectral ruleset, npm script for linting.
    *   **Acceptance Criteria:** `pnpm api:lint` passes; spec covers claim/complete/combine/undo, includes tags + schema_version metadata; referenced from README and plan manifest.
    *   **Dependencies:** `I1.T4`
    *   **Parallelizable:** No

<!-- anchor: task-i2-t2 -->
*   **Task 2.2:**
    *   **Task ID:** `I2.T2`
    *   **Description:** Author Task Lifecycle sequence diagram (Mermaid) depicting PrepChef UI, API routes, Supabase RPC, Realtime, Undo service interactions.
    *   **Agent Type Hint:** `DiagrammingAgent`
    *   **Inputs:** Task lifecycle stories, Section 2 communication patterns.
    *   **Input Files:** [`docs/diagrams/task_sequence.mmd`]
    *   **Target Files:** [`docs/diagrams/task_sequence.mmd`]
    *   **Deliverables:** Mermaid sequence diagram plus explanatory notes.
    *   **Acceptance Criteria:** Diagram renders; covers claim conflict + undo; referenced from docs index.
    *   **Dependencies:** `I2.T1`
    *   **Parallelizable:** Yes

<!-- anchor: task-i2-t3 -->
*   **Task 2.3:**
    *   **Task ID:** `I2.T3`
    *   **Description:** Build Feature Flag Register in `docs/adr/feature_flags.md` capturing key flags (task combine, undo window, kiosk polling, push preview), default states, telemetry, rollback plan.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Section 2 feature flag strategy, requirements.
    *   **Input Files:** [`docs/adr/feature_flags.md`]
    *   **Target Files:** [`docs/adr/feature_flags.md`]
    *   **Deliverables:** Markdown register with table (flag key, scope, environments, owner, metrics, removal plan) plus instructions for updates.
    *   **Acceptance Criteria:** Flags align with roadmap; doc referenced by ADR template; watchers assigned.
    *   **Dependencies:** `I1.T8`
    *   **Parallelizable:** Yes

<!-- anchor: task-i2-t4 -->
*   **Task 2.4:**
    *   **Task ID:** `I2.T4`
    *   **Description:** Implement Supabase functions/RPCs for `claim_task`, `complete_task`, `combine_tasks`, `undo_task`, `log_audit_event`, plus Next.js API route handlers calling them with idempotency + telemetry.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** OpenAPI spec, migrations, Access Matrix.
    *   **Input Files:** [`supabase/functions/*.sql`, `apps/prepchef/app/api/tasks/[id]/claim/route.ts`, `apps/prepchef/app/api/tasks/[id]/complete/route.ts`, `libs/supabase/src/rpc.ts`]
    *   **Target Files:** [`supabase/functions/claim_task.sql`, `supabase/functions/complete_task.sql`, `supabase/functions/combine_tasks.sql`, `supabase/functions/undo_task.sql`, `apps/prepchef/app/api/tasks/[id]/claim/route.ts`, `apps/prepchef/app/api/tasks/[id]/complete/route.ts`, `libs/supabase/src/rpc.ts`, `libs/shared/src/dto/task.ts`]
    *   **Deliverables:** RPC SQL with RLS checks, Next.js handlers verifying schema + idempotency, DTO definitions, telemetry instrumentation hooks.
    *   **Acceptance Criteria:** `pnpm test supabase` passes; API routes align with OpenAPI; optimistic responses include undo_token + realtime metadata; pgTAP tests cover role enforcement.
    *   **Dependencies:** `I1.T4`, `I2.T1`
    *   **Parallelizable:** No

<!-- anchor: task-i2-t5 -->
*   **Task 2.5:**
    *   **Task ID:** `I2.T5`
    *   **Description:** Draft undo + notification spec `docs/specs/undo_notification.md` outlining payload structure, TTL, toast messaging, telemetry, failure fallback.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Requirements section (Undo), feature flag register.
    *   **Input Files:** [`docs/specs/undo_notification.md`]
    *   **Target Files:** [`docs/specs/undo_notification.md`]
    *   **Deliverables:** Spec with sequence steps, JSON payload example, state diagram, instrumentation checklist.
    *   **Acceptance Criteria:** Spec ties to RPC outputs; includes acceptance tests; cross-links to Task Lifecycle diagram.
    *   **Dependencies:** `I2.T2`, `I2.T4`
    *   **Parallelizable:** Yes

<!-- anchor: task-i2-t6 -->
*   **Task 2.6:**
    *   **Task ID:** `I2.T6`
    *   **Description:** Build PrepChef data hooks (`useTaskDashboard`, `useRealtimeChannel`) leveraging React Query + Supabase client; implement optimistic claim/complete flows referencing OpenAPI types.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** libs/shared DTOs, API routes, undo spec.
    *   **Input Files:** [`apps/prepchef/src/hooks/useTaskDashboard.ts`, `libs/shared/src/hooks/realtime.ts`, `libs/supabase/src/client.ts`]
    *   **Target Files:** [`apps/prepchef/src/hooks/useTaskDashboard.ts`, `apps/prepchef/src/providers/RealtimeProvider.tsx`, `libs/shared/src/hooks/realtime.ts`, `libs/shared/src/constants/status.ts`]
    *   **Deliverables:** Hooks fetching tasks, applying filters, subscribing to realtime, handling optimistic updates + undo TTL.
    *   **Acceptance Criteria:** Hooks typed with DTOs; React Query caches keyed by filters; tests cover optimistic rollback; hooks documented for other apps.
    *   **Dependencies:** `I2.T4`, `I2.T5`
    *   **Parallelizable:** No

<!-- anchor: task-i2-t7 -->
*   **Task 2.7:**
    *   **Task ID:** `I2.T7`
    *   **Description:** Scaffold Admin CRM App Router shell with layout, navigation, RBAC guard, and server component fetching event list using new API client.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Directory structure, Access Matrix, API spec.
    *   **Input Files:** [`apps/admin-crm/app/layout.tsx`, `apps/admin-crm/app/admin/page.tsx`, `apps/admin-crm/app/components/Nav.tsx`]
    *   **Target Files:** [`apps/admin-crm/app/layout.tsx`, `apps/admin-crm/app/(dashboard)/admin/page.tsx`, `apps/admin-crm/components/Nav.tsx`, `apps/admin-crm/components/RBACGuard.tsx`]
    *   **Deliverables:** Layout with side nav, summary cards placeholder, RBAC guard hooking into Supabase session, server component fetching events.
    *   **Acceptance Criteria:** Route renders with sample data; unauthorized roles redirected; layout uses libs/ui tokens; documented in Storybook where relevant.
    *   **Dependencies:** `I2.T4`
    *   **Parallelizable:** Yes

<!-- anchor: task-i2-t8 -->
*   **Task 2.8:**
    *   **Task ID:** `I2.T8`
    *   **Description:** Implement Supabase Realtime presence + display summary scaffolding: presence heartbeat table, channel helpers, summary materialized view stub, and display API route returning JSON snapshot.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** Section 2 realtime strategy, ERD.
    *   **Input Files:** [`supabase/migrations/20250509_presence.sql`, `apps/display/app/api/summary/route.ts`, `libs/supabase/src/realtime.ts`]
    *   **Target Files:** [`supabase/migrations/20250509_presence.sql`, `supabase/migrations/20250509_display_summary.sql`, `apps/display/app/api/summary/route.ts`, `libs/supabase/src/realtime.ts`]
    *   **Deliverables:** Tables + policies for presence/display snapshots, server route returning stub summary, realtime helper for presence heartbeats.
    *   **Acceptance Criteria:** SQL migration reuses company_id scoping; API returns deterministic schema; hooks tested; display client stub consumes summary.
    *   **Dependencies:** `I1.T4`
    *   **Parallelizable:** No

<!-- anchor: task-i2-t9 -->
*   **Task 2.9:**
    *   **Task ID:** `I2.T9`
    *   **Description:** Extend Vitest + Playwright suites to cover RPC validations and PrepChef claim/undo flows, leveraging seeds from I1; integrate coverage reports into CI.
    *   **Agent Type Hint:** `QualityAgent`
    *   **Inputs:** Hooks, API routes, undo spec.
    *   **Input Files:** [`tests/e2e/prepchef.spec.ts`, `tests/unit/rpc_claim.test.ts`, `.github/workflows/ci.yml`]
    *   **Target Files:** [`tests/e2e/prepchef.spec.ts`, `tests/unit/rpc_claim.test.ts`, `tests/unit/rpc_combine.test.ts`, `.github/workflows/ci.yml`]
    *   **Deliverables:** Playwright scenario (login, view tasks, claim, undo), Vitest suites mocking Supabase RPC wrappers, CI job uploading reports.
    *   **Acceptance Criteria:** Tests pass locally and in CI; coverage thresholds documented; failures link to troubleshooting doc.
    *   **Dependencies:** `I2.T4`, `I2.T6`
    *   **Parallelizable:** Yes

<!-- anchor: task-i2-t10 -->
*   **Task 2.10:**
    *   **Task ID:** `I2.T10`
    *   **Description:** Harden RLS + policy automation by scripting impersonation tests via Supabase CLI, verifying Access Matrix actions, and documenting results per role.
    *   **Agent Type Hint:** `SecurityAgent`
    *   **Inputs:** Access Matrix, migrations, Supabase CLI.
    *   **Input Files:** [`tooling/scripts/test_rls.ps1`, `docs/ops/security_baseline.md`]
    *   **Target Files:** [`tooling/scripts/test_rls.ps1`, `docs/ops/security_baseline.md`, `docs/specs/access_matrix.md`]
    *   **Deliverables:** Script impersonating staff/manager/event lead/owner, running key queries, logging pass/fail; doc append notes.
    *   **Acceptance Criteria:** Script runs in CI/staging; results appended to Access Matrix; security doc updated with cadence.
    *   **Dependencies:** `I1.T2`, `I1.T4`, `I2.T4`
    *   **Parallelizable:** No
<!-- anchor: task-i2-t11 -->
*   **Task 2.11:**
    *   **Task ID:** `I2.T11`
    *   **Description:** Document API onboarding guide summarizing how to regenerate clients, use OpenAPI for tests, and reference sequence diagrams; store under `docs/specs/api_usage.md`.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** OpenAPI spec, sequence diagram, hooks.
    *   **Input Files:** [`docs/specs/api_usage.md`]
    *   **Target Files:** [`docs/specs/api_usage.md`]
    *   **Deliverables:** Guide covering authentication, idempotency keys, realtime fallbacks, testing tips, and links to relevant artifacts.
    *   **Acceptance Criteria:** Guide references spec sections; includes curl examples; instructs how to run Spectral lint; cross-linked in docs index.
    *   **Dependencies:** `I2.T1`, `I2.T2`, `I2.T6`
    *   **Parallelizable:** Yes
