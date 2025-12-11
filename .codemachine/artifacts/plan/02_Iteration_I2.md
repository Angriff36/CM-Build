<!-- anchor: iteration-2-plan -->
### Iteration 2: Task APIs, Realtime Backbone, and Contract Validation

*   **Iteration ID:** `I2`
*   **Goal:** Implement the core task/event data flows (migrations, RPCs, API routes, realtime channels, PrepChef hooks) plus the canonical OpenAPI/sequence artifacts so both staff and manager experiences can build confidently.
*   **Prerequisites:** Completion of `I1` (workspace, schema baseline, RLS, CI, diagrams).
*   **Iteration Narrative:** With guardrails in place, this iteration focuses on getting data flowing end-to-end: Supabase migrations flesh out task lifecycle metadata, RPCs enforce idempotency/audit logging, API routes expose REST contracts, and PrepChef receives a realtime-aware task board skeleton. Artifacts (OpenAPI, sequence diagram) ensure every surface speaks the same language and highlight where feature flags or undo tokens intervene.
*   **Success Metrics:**
    - RPC latency under 150ms in local benchmarks with seeded data.
    - OpenAPI spec validated via linting and referenced by contract tests.
    - PrepChef task list renders multi-event data with realtime updates and passes accessibility checks.
*   **Risks & Mitigations:**
    - Risk: Supabase realtime channel budget exceeded; Mitigation: implement channel helper enforcing naming, throttle nonessential subscriptions.
    - Risk: RPC idempotency not honored; Mitigation: add pgTAP/unit tests plus optimistic UI rollback cases.
    - Risk: API schema drift; Mitigation: enforce schema_version headers + contract tests.
*   **Exit Criteria:** All task lifecycle routes (list, claim, complete, undo, combine suggestion fetch) callable via REST + RPC, realtime updates reflected in PrepChef skeleton, OpenAPI spec committed, and Playwright smoke verifying claim/complete/undo successes.
*   **Tasks:**

<!-- anchor: task-i2-t1 -->
*   **Task 2.1:**
    *   **Task ID:** `I2.T1`
    *   **Description:** Extend Supabase schema with additional task lifecycle columns (priority, undo tokens, timestamps, presence heartbeats), materialized summary views, and helper tables (TaskSimilaritySuggestions, RealtimeSubscriptions) to support realtime dashboards.
    *   **Agent Type Hint:** `DatabaseAgent`
    *   **Inputs:** I1 schema, blueprint data model, ERD references.
    *   **Input Files:** ["supabase/migrations/0001_base_schema.sql", "docs/diagrams/supabase_erd.mmd"]
    *   **Target Files:** ["supabase/migrations/0003_task_lifecycle.sql", "supabase/migrations/0004_summary_views.sql", "docs/diagrams/supabase_erd.mmd"]
    *   **Deliverables:**
        - Migration adding priority enums, undo metadata, `task_similarity_suggestions`, `realtime_subscriptions`, `undo_tokens` tables, and indexes.
        - Materialized views for `/display` summary plus refresh cron SQL.
        - ERD update capturing new tables/relationships + textual changelog appended to diagram index.
    *   **Acceptance Criteria:** `supabase db lint` passes; views refresh successfully; ERD diff logged; migrations reversible via down scripts.
    *   **Dependencies:** [`I1.T4`, `I1.T5`]
    *   **Parallelizable:** No (foundation for rest of iteration).

<!-- anchor: task-i2-t2 -->
*   **Task 2.2:**
    *   **Task ID:** `I2.T2`
    *   **Description:** Implement stored procedures (`claim_task`, `complete_task`, `undo_task`, `combine_tasks`) plus row-level audit triggers and Zod-described DTOs inside `libs/shared`.
    *   **Agent Type Hint:** `DatabaseAgent`
    *   **Inputs:** Fresh schema, blueprint contract requirements, undo requirements.
    *   **Input Files:** ["supabase/migrations/0003_task_lifecycle.sql", "docs/security/rls_policies.md"]
    *   **Target Files:** ["supabase/functions/claim_task.sql", "supabase/functions/complete_task.sql", "supabase/functions/undo_task.sql", "libs/shared/src/dto/tasks.ts"]
    *   **Deliverables:**
        - SQL functions enforcing role permissions, idempotency keys, undo token issuance, audit logging, and realtime NOTIFY payloads.
        - Shared DTO definitions + Zod schemas for requests/responses, reused by API + UI.
        - README snippet detailing RPC usage and idempotency expectations.
    *   **Acceptance Criteria:** Supabase tests cover success/failure paths; DTOs exported via `@caterkingapp/shared/tasks`; audit logs show sample entries; idempotency proved via repeated invocation tests.
    *   **Dependencies:** [`I2.T1`]
    *   **Parallelizable:** No.

<!-- anchor: task-i2-t3 -->
*   **Task 2.3:**
    *   **Task ID:** `I2.T3`
    *   **Description:** Implement Next.js API routes and server actions for `/api/tasks`, `/api/tasks/:id/claim`, `/api/tasks/:id/complete`, `/api/tasks/:id/undo`, `/api/events`, `/api/tasks/suggestions`, including error handling and telemetry emission.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** DTOs, RPC wrappers, blueprint API contract section.
    *   **Input Files:** ["libs/shared/src/dto/tasks.ts", "docs/architecture/03_Behavior_and_Communication.md"]
    *   **Target Files:** ["apps/prepchef/app/api/tasks/route.ts", "apps/prepchef/app/api/tasks/[id]/claim/route.ts", "apps/prepchef/app/api/tasks/[id]/complete/route.ts", "apps/prepchef/app/api/tasks/[id]/undo/route.ts", "apps/prepchef/app/api/tasks/suggestions/route.ts", "apps/prepchef/app/api/events/route.ts"]
    *   **Deliverables:**
        - Type-safe API handlers calling RPC wrappers, validating payloads via Zod, emitting OTEL spans, and returning `schema_version` metadata.
        - Shared error utility mapping Supabase errors to UI-friendly codes.
        - Integration tests hitting handlers with mocked Supabase client verifying HTTP responses & telemetry.
    *   **Acceptance Criteria:** `pnpm test api` passes; handlers reject invalid payloads with 422; idempotent replays return previous success payloads; OTEL spans recorded in logs.
    *   **Dependencies:** [`I2.T2`]
    *   **Parallelizable:** Yes (after RPCs ready).

<!-- anchor: task-i2-t4 -->
*   **Task 2.4:**
    *   **Task ID:** `I2.T4`
    *   **Description:** Draft the Task Lifecycle sequence diagram capturing staff claim -> RPC -> Realtime -> Display update -> Undo, referencing UI + behavior requirements.
    *   **Agent Type Hint:** `DiagrammingAgent`
    *   **Inputs:** Behavior spec, API route design.
    *   **Input Files:** ["docs/architecture/03_Behavior_and_Communication.md", "docs/architecture/06_UI_UX_Architecture.md"]
    *   **Target Files:** ["docs/diagrams/task_lifecycle_seq.puml", "docs/diagrams/diagram_index.md"]
    *   **Deliverables:**
        - PlantUML sequence file detailing PrepChef UI, libs/shared, API route, Supabase RPC, Realtime, Display, and Undo service interactions.
        - Diagram index update describing scenario scope, dependencies, and iteration handshake.
    *   **Acceptance Criteria:** Diagram renders, includes undo failure branch, uses ASCII names, and is referenced by Task 2.7 instructions.
    *   **Dependencies:** [`I2.T3`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i2-t5 -->
*   **Task 2.5:**
    *   **Task ID:** `I2.T5`
    *   **Description:** Create the OpenAPI v3 draft covering all task/event endpoints with component schemas derived from libs/shared DTOs.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** API handlers, DTOs, blueprint API style.
    *   **Input Files:** ["apps/prepchef/app/api/tasks/route.ts", "libs/shared/src/dto/tasks.ts"]
    *   **Target Files:** ["api/openapi.yaml", "api/README.md", "tests/contract/tasks.contract.test.ts"]
    *   **Deliverables:**
        - OpenAPI spec with paths, parameters, request/response bodies, error schemas, and security (Supabase Auth) sections.
        - README describing how to regenerate docs, run spectral lint, and share with partners.
        - Contract test verifying API responses conform to schema via `pnpm test:contract`.
    *   **Acceptance Criteria:** `pnpm spectral lint api/openapi.yaml` passes; contract test fails if schema drifts; spec references iteration tasks for provenance.
    *   **Dependencies:** [`I2.T3`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i2-t6 -->
*   **Task 2.6:**
    *   **Task ID:** `I2.T6`
    *   **Description:** Build React Query hooks, server components, and UI skeleton for PrepChef task list (filters, grouping, summary header, bottom nav), wiring realtime adapter + optimistic mutations.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Component diagram, DTOs, API routes, UI blueprint.
    *   **Input Files:** ["docs/diagrams/prepchef_components.puml", "libs/shared/src/dto/tasks.ts", "docs/ux/ui_interaction_blueprint.md"]
    *   **Target Files:** ["apps/prepchef/app/(shell)/layout.tsx", "apps/prepchef/app/tasks/page.tsx", "apps/prepchef/components/task-list.tsx", "libs/shared/src/hooks/useTasks.ts"]
    *   **Deliverables:**
        - Server component streaming initial tasks + summary counts.
        - React Query hook for filters + pagination, wired to realtime channel adapter.
        - UI components for status chips, claim buttons, header summary, bottom nav, using libs/ui primitives.
        - Storybook stories for task row states (available/claimed/complete/undo) with accessibility annotations.
    *   **Acceptance Criteria:** `pnpm test:ui` + Storybook build succeed; real-time updates reflected; optimistic claim/rescind works; layout respects gloves-friendly requirements.
    *   **Dependencies:** [`I2.T3`, `I2.T4`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i2-t7 -->
*   **Task 2.7:**
    *   **Task ID:** `I2.T7`
    *   **Description:** Implement realtime/presence adapter utilities (`useRealtimeChannel`, `usePresenceHeartbeats`) plus notification dispatcher plumbing to show claim/undo toasts with TTL timers.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Sequence diagram, blueprint realtime strategy.
    *   **Input Files:** ["docs/diagrams/task_lifecycle_seq.puml", "docs/architecture/03_Behavior_and_Communication.md"]
    *   **Target Files:** ["libs/supabase/src/realtime/useRealtimeChannel.ts", "libs/supabase/src/presence/usePresence.ts", "libs/shared/src/notifications/dispatcher.ts", "apps/prepchef/components/undo-toast.tsx"]
    *   **Deliverables:**
        - Hooks handling subscribe/unsubscribe, reconnection, and filter scoping by company and entity.
        - Presence heartbeat utility posting to `/api/presence` and updating avatar halos.
        - Notification dispatcher state machine with TTL timers, stacking cap, and telemetry hooks.
        - PrepChef component showing toast UI with accessible controls.
    *   **Acceptance Criteria:** Hooks tested via Vitest; toasts show copy + countdown; presence updates color avatars; reconnection fallback triggers polling.
    *   **Dependencies:** [`I2.T4`, `I2.T6`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i2-t8 -->
*   **Task 2.8:**
    *   **Task ID:** `I2.T8`
    *   **Description:** Create Playwright smoke tests for `/tasks` covering initial load, claim, undo, realtime update, filter toggle, and API failure surfaces; integrate into CI pipeline.
    *   **Agent Type Hint:** `QATestingAgent`
    *   **Inputs:** PrepChef UI, notification flows, API endpoints.
    *   **Input Files:** ["apps/prepchef/app/tasks/page.tsx", "apps/prepchef/components/undo-toast.tsx", "tests/playwright/README.md"]
    *   **Target Files:** ["tests/playwright/prepchef.tasks.spec.ts", "tests/playwright/fixtures/tasks.json", ".github/workflows/ci.yml"]
    *   **Deliverables:**
        - Playwright spec covering load, claim, conflict resolution, undo expiration, offline banner, and filter chips.
        - Fixtures/seeds hooking into Supabase CLI to ensure deterministic data.
        - CI job updates running Playwright in headless mode with artifact uploads on failure.
    *   **Acceptance Criteria:** Test passes locally and in CI; failure screenshots saved; docs updated with troubleshooting steps.
    *   **Dependencies:** [`I2.T6`, `I2.T7`]
    *   **Parallelizable:** Yes (after UI skeleton ready).

*   **Iteration Review Checklist:**
    - Run `pnpm test:contract` and ensure spec matches handlers.
    - Toggle realtime via simulated disconnect to confirm polling fallback works.
    - Capture GIF demo of PrepChef skeleton reacting to realtime events for stakeholders.