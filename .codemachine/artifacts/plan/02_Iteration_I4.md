<!-- anchor: iteration-4-plan -->
### Iteration 4: Task Combination, Multi-Event Coordination, and Governance

*   **Iteration ID:** `I4`
*   **Goal:** Deliver heuristic-powered task combination, manager approval tools, cross-event dashboards, and enhanced audit/undo policies so the platform scales across multiple simultaneous events without confusion.
*   **Prerequisites:** `I1`-`I3` complete (schema, recipes, UI blueprint, realtime).
*   **Iteration Narrative:** This iteration pulls together heuristics, admin workflows, and governance. Supabase functions normalize ingredients and propose merges, Admin CRM boards expose approvals and drag-and-drop assignments, Display app gains aggregated views, and audit logs record every combination/rollback. OpenAPI and docs expand to cover new endpoints and runbooks.
*   **Success Metrics:**
    - Combined tasks reduce duplicate entries by >=30% in seeded scenarios.
    - Manager board reassignments update PrepChef within 1s via realtime.
    - Audit logs capture combination + rollback diff for 100% of operations.
*   **Risks & Mitigations:**
    - Risk: Heuristic false positives; Mitigation: gating via feature flag + review UI.
    - Risk: Performance degrade in multi-event, multi-station view; Mitigation: pagination + server-driven filters.
    - Risk: Audit log storage growth; Mitigation: cron to archive older entries.
*   **Exit Criteria:** Heuristic engine + spec in place, combine endpoints, admin dashboards, display summary updates, audit/undo instrumentation, and tests verifying concurrency + rollback paths.
*   **Tasks:**

<!-- anchor: task-i4-t1 -->
*   **Task 4.1:**
    *   **Task ID:** `I4.T1`
    *   **Description:** Implement Supabase Edge Function (TypeScript) for task combination heuristics plus pipeline to store suggestions, normalized units, and metadata per Section 2.1 spec.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** Task schema, blueprint heuristics directives.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md", "supabase/migrations/0003_task_lifecycle.sql"]
    *   **Target Files:** ["supabase/functions/task_heuristics/index.ts", "supabase/functions/task_heuristics/metadata.json", "docs/specs/task_combination.md"]
    *   **Deliverables:**
        - Edge Function parsing tasks, normalizing ingredients, computing similarity, writing to `task_similarity_suggestions`.
        - JSON metadata file describing heuristics thresholds, tunables, version.
        - Spec in Markdown describing heuristics pipeline, rollback, telemetry requirements.
    *   **Acceptance Criteria:** Function deploys; CLI tests confirm suggestions generated; spec references blueprint anchors, includes JSON examples.
    *   **Dependencies:** [`I2.T1`, `I2.T2`]
    *   **Parallelizable:** No.

<!-- anchor: task-i4-t2 -->
*   **Task 4.2:**
    *   **Task ID:** `I4.T2`
    *   **Description:** Build manager-facing combine review UI (Admin CRM + PrepChef combine drawer) to approve, reject, or rollback suggestions, wiring to feature flag `prep.task-combine.v1`.
    *   **Agent Type Hint:** `FullStackAgent`
    *   **Inputs:** Heuristic spec, UI blueprint, API requirements.
    *   **Input Files:** ["docs/specs/task_combination.md", "docs/ux/ui_interaction_blueprint.md", "apps/prepchef/components/task-list.tsx"]
    *   **Target Files:** ["apps/prepchef/app/combine/page.tsx", "apps/admin-crm/app/tasks/combine/page.tsx", "apps/admin-crm/components/combine-review.tsx"]
    *   **Deliverables:**
        - PrepChef combine view summarizing suggestions with opt-in CTA + breakdown popover.
        - Admin CRM approval board with filters (event/station/confidence) and audit trail.
        - Feature flag wiring controlling visibility + telemetry exposures.
    *   **Acceptance Criteria:** Flag toggles behavior; approvals call combine API; UI shows aggregated instructions + rollback actions; tests cover accept/reject states.
    *   **Dependencies:** [`I4.T1`, `I2.T3`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i4-t3 -->
*   **Task 4.3:**
    *   **Task ID:** `I4.T3`
    *   **Description:** Update OpenAPI spec + API routes for combine endpoints, manager assignment board, and `/api/display/summary`, ensuring schema_version increments documented.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** Existing spec, new features.
    *   **Input Files:** ["api/openapi.yaml", "apps/prepchef/app/api/tasks/suggestions/route.ts"]
    *   **Target Files:** ["api/openapi.yaml", "tests/contract/tasks.contract.test.ts", "apps/display/app/api/summary/route.ts"]
    *   **Deliverables:**
        - Updated OpenAPI sections for combine approval, rollback, summary endpoints.
        - Contract tests covering new responses.
        - Display summary API route returning aggregated view with caching hints.
    *   **Acceptance Criteria:** Spectral lint passes; contract tests updated; API docs mention feature flags + schema_version.
    *   **Dependencies:** [`I4.T2`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i4-t4 -->
*   **Task 4.4:**
    *   **Task ID:** `I4.T4`
    *   **Description:** Implement Admin CRM task board with drag-and-drop assignment, staffing sidebar, multi-event filters, realtime updates, and audit logging.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Task data, UI blueprint, realtime adapter.
    *   **Input Files:** ["apps/admin-crm/app/recipes/page.tsx", "libs/shared/src/hooks/useTasks.ts", "docs/architecture/06_UI_UX_Architecture.md"]
    *   **Target Files:** ["apps/admin-crm/app/tasks/page.tsx", "apps/admin-crm/components/task-board.tsx", "libs/shared/src/hooks/useAssignments.ts"]
    *   **Deliverables:**
        - Multi-column board grouped by station/status with drag handles.
        - Sidebar showing staff presence + shift schedule alignment.
        - Hook calling assignment API + updating audit logs + realtime events.
        - Accessibility support for keyboard-based reassignments.
    *   **Acceptance Criteria:** Drag/drop updates PrepChef in <1s; board handles >100 tasks via virtualization; Playwright spec ensures assignments + undo function.
    *   **Dependencies:** [`I2.T6`, `I2.T7`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i4-t5 -->
*   **Task 4.5:**
    *   **Task ID:** `I4.T5`
    *   **Description:** Enhance Display app with event/station summary cards, urgent queue ticker, and fallback snapshot polling referencing `/api/display/summary`.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Summary API, display requirements.
    *   **Input Files:** ["apps/display/app/page.tsx", "docs/architecture/06_UI_UX_Architecture.md", "api/openapi.yaml"]
    *   **Target Files:** ["apps/display/app/page.tsx", "apps/display/components/summary-grid.tsx", "apps/display/components/urgent-ticker.tsx", "apps/display/hooks/useDisplayData.ts"]
    *   **Deliverables:**
        - Summary grid showing available/claimed/completed by event/station with timers.
        - Urgent ticker cycling high-priority tasks with audible cues.
        - Hook blending realtime + polling fallback + offline banner.
        - Config knob for rotation cadence stored in Doppler.
    *   **Acceptance Criteria:** Display handles realtime disconnect gracefully; data matches summary API; ticker accessible; config documented.
    *   **Dependencies:** [`I4.T3`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i4-t6 -->
*   **Task 4.6:**
    *   **Task ID:** `I4.T6`
    *   **Description:** Expand audit log + undo infrastructure to capture combine approvals, rollbacks, board reassignments, and display snapshots; add CLI/report summarizing critical events.
    *   **Agent Type Hint:** `SecurityAgent`
    *   **Inputs:** Audit schema, new workflows.
    *   **Input Files:** ["docs/security/rls_policies.md", "supabase/functions/claim_task.sql", "docs/specs/task_combination.md"]
    *   **Target Files:** ["supabase/functions/log_combination.sql", "libs/shared/src/audit/events.ts", "scripts/audit/report.ts", "docs/operations/audit_runbook.md"]
    *   **Deliverables:**
        - SQL function logging combination + rollback diffs.
        - Shared audit event constants consumed by UI for linking to logs.
        - CLI script generating reports for last 24h actions.
        - Runbook describing access, retention, and export process.
    *   **Acceptance Criteria:** Audit entries appear for all key actions; CLI prints table; docs cite compliance requirements; undo tokens reference audit IDs.
    *   **Dependencies:** [`I4.T1`, `I4.T2`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i4-t7 -->
*   **Task 4.7:**
    *   **Task ID:** `I4.T7`
    *   **Description:** Performance-test heuristics + admin board under load (simulate 200 tasks, 5 events) using k6 or similar, tune indexes/queries, and record findings.
    *   **Agent Type Hint:** `PerformanceAgent`
    *   **Inputs:** Heuristic function, board UI, summary view.
    *   **Input Files:** ["supabase/functions/task_heuristics/index.ts", "apps/admin-crm/components/task-board.tsx", "docs/operations/ci_cd_overview.md"]
    *   **Target Files:** ["tests/perf/heuristics.k6.js", "tests/perf/board.benchmark.md", "supabase/migrations/0008_indexes.sql"]
    *   **Deliverables:**
        - k6 script simulating heuristics load + API bursts.
        - Benchmark doc capturing latency, CPU, recommended throttle flags.
        - Index/SQL tweaks to keep query times <200ms.
    *   **Acceptance Criteria:** Benchmarks recorded; indexes migrates; doc references instrumentation metrics; gating thresholds added to runbooks.
    *   **Dependencies:** [`I4.T1`, `I4.T4`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i4-t8 -->
*   **Task 4.8:**
    *   **Task ID:** `I4.T8`
    *   **Description:** Update Playwright suites for admin board/combine flows and add chaos tests (simulated realtime drop, conflicting approvals, undo expiration) to guarantee stability.
    *   **Agent Type Hint:** `QATestingAgent`
    *   **Inputs:** New UIs, heuristics, audit logging.
    *   **Input Files:** ["tests/playwright/prepchef.tasks.spec.ts", "apps/admin-crm/app/tasks/page.tsx", "apps/prepchef/app/combine/page.tsx"]
    *   **Target Files:** ["tests/playwright/admin.board.spec.ts", "tests/playwright/prepchef.combine.spec.ts", "tests/playwright/helpers/realtimeChaos.ts"]
    *   **Deliverables:**
        - Admin board spec verifying drag/drop, staff filters, audit log links.
        - PrepChef combine spec verifying approval, rejection, rollback, offline fallback.
        - Chaos helper toggling realtime connection to ensure polling fallback tested.
    *   **Acceptance Criteria:** Tests pass; chaos helper integrated into CI optional job; docs updated.
    *   **Dependencies:** [`I4.T2`, `I4.T4`, `I4.T5`]
    *   **Parallelizable:** Yes.

*   **Iteration Review Checklist:**
    - Confirm feature flag exposures logged for combine flows.
    - Validate audit log report matches manual actions executed during review.
    - Run perf tests + share summary with stakeholders.