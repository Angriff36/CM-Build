<!-- anchor: iteration-3-plan -->
### Iteration 3: Experience Layers & Media Pipeline

*   **Iteration ID:** `I3`
*   **Goal:** Build PrepChef/Admin UI components, media upload pipeline, display foundations, and testing matrix so product workflows are demonstrable end-to-end.
*   **Prerequisites:** `I2`
*   **Tasks:**

<!-- anchor: task-i3-t1 -->
*   **Task 3.1:**
    *   **Task ID:** `I3.T1`
    *   **Description:** Implement PrepChef task dashboard UI (header summary, filter pills, virtualized list, task rows, bottom nav) using libs/ui tokens + hooks from I2.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Hooks, design tokens, UX spec.
    *   **Input Files:** [`apps/prepchef/app/(app)/tasks/page.tsx`, `apps/prepchef/components/TaskRow.tsx`, `apps/prepchef/components/BottomNav.tsx`]
    *   **Target Files:** [`apps/prepchef/app/(app)/tasks/page.tsx`, `apps/prepchef/components/TaskRow.tsx`, `apps/prepchef/components/HeaderSummary.tsx`, `apps/prepchef/components/BottomNav.tsx`, `libs/ui/src/components/StatusButton.tsx`]
    *   **Deliverables:** Responsive Task page with realtime badges, sticky header, accessible nav bar, Storybook stories for TaskRow & StatusButton.
    *   **Acceptance Criteria:** Page renders with mocked data; virtualization keeps 200 tasks smooth; status changes update visually; tests cover accessibility.
    *   **Dependencies:** `I2.T6`
    *   **Parallelizable:** No

<!-- anchor: task-i3-t2 -->
*   **Task 3.2:**
    *   **Task ID:** `I3.T2`
    *   **Description:** Implement combine suggestion UI (drawer, suggestion cards, accept/dismiss actions) wired to Supabase heuristics + feature flag gating.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Undo spec, feature flag register, RPCs.
    *   **Input Files:** [`apps/prepchef/components/CombineDrawer.tsx`, `libs/shared/src/flags.ts`, `apps/prepchef/app/combine/page.tsx`]
    *   **Target Files:** [`apps/prepchef/app/combine/page.tsx`, `apps/prepchef/components/CombineDrawer.tsx`, `apps/prepchef/components/SuggestionCard.tsx`, `libs/shared/src/flags.ts`]
    *   **Deliverables:** Combine page/drawer with normalized quantity display, breakdown list, Accept/Keep separate buttons, telemetry instrumentation for exposures.
    *   **Acceptance Criteria:** Drawer accessible; feature flag toggles visibility; Accept triggers RPC and updates tasks; analytics event recorded.
    *   **Dependencies:** `I2.T4`, `I2.T3`
    *   **Parallelizable:** Yes

<!-- anchor: task-i3-t3 -->
*   **Task 3.3:**
    *   **Task ID:** `I3.T3`
    *   **Description:** Deliver Media Pipeline Flowchart (Mermaid) plus implementation: signed URL issuance (`/api/media/sign`), Supabase Function for transcoding, Realtime events, UI upload queue.
    *   **Agent Type Hint:** `FullStackAgent`
    *   **Inputs:** Storage requirements, docs, hooks.
    *   **Input Files:** [`docs/diagrams/media_pipeline.mmd`, `apps/admin-crm/app/admin/upload/page.tsx`, `supabase/functions/media_webhook.ts`]
    *   **Target Files:** [`docs/diagrams/media_pipeline.mmd`, `apps/admin-crm/app/admin/upload/page.tsx`, `apps/admin-crm/components/UploadQueue.tsx`, `supabase/functions/media_webhook.ts`, `apps/prepchef/components/MediaStatusBadge.tsx`]
    *   **Deliverables:** Diagram + narrative, upload screen with dropzone/progress, Supabase function updating status + triggering realtime, UI badges reflecting processing.
    *   **Acceptance Criteria:** Upload of sample file flows end-to-end (mock) with status updates; diagram renders; doc cross-links to spec; tests cover status transitions.
    *   **Dependencies:** `I2.T4`, `I2.T8`
    *   **Parallelizable:** No

<!-- anchor: task-i3-t4 -->
*   **Task 3.4:**
    *   **Task ID:** `I3.T4`
    *   **Description:** Build `apps/display` skeleton with summary grid, urgent ticker, presence lane, hooking into summary API + realtime fallback logic.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Display requirements, realtime helper.
    *   **Input Files:** [`apps/display/app/page.tsx`, `apps/display/components/SummaryGrid.tsx`, `apps/display/app/api/summary/route.ts`]
    *   **Target Files:** [`apps/display/app/page.tsx`, `apps/display/components/SummaryGrid.tsx`, `apps/display/components/UrgentTicker.tsx`, `apps/display/components/PresenceLane.tsx`, `apps/display/hooks/useDisplayData.ts`]
    *   **Deliverables:** Display page rotating sections automatically, offline banner state, SSE fallback, tests verifying rotation.
    *   **Acceptance Criteria:** Works on kiosk viewport; rotation interval configurable; offline scenario handled; telemetry event recorded for rotations.
    *   **Dependencies:** `I2.T8`
    *   **Parallelizable:** Yes

<!-- anchor: task-i3-t5 -->
*   **Task 3.5:**
    *   **Task ID:** `I3.T5`
    *   **Description:** Produce Testing Matrix (`docs/quality/testing_matrix.md`) mapping features to Vitest, Playwright, Storybook coverage, owners, and automation cadence.
    *   **Agent Type Hint:** `QualityAgent`
    *   **Inputs:** Completed tests, features.
    *   **Input Files:** [`docs/quality/testing_matrix.md`]
    *   **Target Files:** [`docs/quality/testing_matrix.md`]
    *   **Deliverables:** Matrix table + backlog for missing coverage; references to test files; risk color coding.
    *   **Acceptance Criteria:** Matrix covers PrepChef/Admin/Display/Media; indicates automation frequency; cross-linked from docs index.
    *   **Dependencies:** `I2.T9`
    *   **Parallelizable:** Yes

<!-- anchor: task-i3-t6 -->
*   **Task 3.6:**
    *   **Task ID:** `I3.T6`
    *   **Description:** Expand `libs/ui` with TaskRow, Badge, Toast, Drawer components; add Storybook stories + Chromatic snapshots; align tokens with UI spec.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Section 6 UI architecture, Task flows.
    *   **Input Files:** [`libs/ui/src/components/*.tsx`, `.storybook/*`]
    *   **Target Files:** [`libs/ui/src/components/TaskRow.tsx`, `libs/ui/src/components/Toast.tsx`, `libs/ui/src/components/Drawer.tsx`, `libs/ui/src/stories/*.stories.tsx`, `.storybook/preview.ts`]
    *   **Deliverables:** Components with docs + tests; Chromatic build integrated in CI; tokens referencing color palette.
    *   **Acceptance Criteria:** Storybook accessible; Chromatic baseline approved; components imported by PrepChef/Admin.
    *   **Dependencies:** `I1.T7`
    *   **Parallelizable:** Yes

<!-- anchor: task-i3-t7 -->
*   **Task 3.7:**
    *   **Task ID:** `I3.T7`
    *   **Description:** Implement Recipe drawer UI (tabs, steps, ingredients, media viewer, scaling controls) reusing libs/ui components and hooking into Supabase storage signed URLs.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Recipe spec, media pipeline.
    *   **Input Files:** [`apps/prepchef/components/RecipeDrawer.tsx`, `apps/prepchef/components/IngredientList.tsx`]
    *   **Target Files:** [`apps/prepchef/components/RecipeDrawer.tsx`, `apps/prepchef/components/IngredientList.tsx`, `apps/prepchef/components/MediaViewer.tsx`]
    *   **Deliverables:** Drawer with accessible tabs, streaming data, signed URL usage, fallback state; tests verifying instructions display.
    *   **Acceptance Criteria:** Works offline-limited (warns); handles version mismatch; integrated telemetry.
    *   **Dependencies:** `I2.T4`, `I3.T3`
    *   **Parallelizable:** No

<!-- anchor: task-i3-t8 -->
*   **Task 3.8:**
    *   **Task ID:** `I3.T8`
    *   **Description:** Wire Admin CRM recipe editor workspace (forms, ingredient builder, media attachments) with optimistic locking and diff summary.
    *   **Agent Type Hint:** `FullStackAgent`
    *   **Inputs:** Recipe drawer implementation, media pipeline.
    *   **Input Files:** [`apps/admin-crm/app/admin/recipes/[id]/page.tsx`, `apps/admin-crm/components/RecipeEditor.tsx`]
    *   **Target Files:** [`apps/admin-crm/app/admin/recipes/[id]/page.tsx`, `apps/admin-crm/components/RecipeEditor.tsx`, `apps/admin-crm/components/IngredientForm.tsx`, `apps/admin-crm/components/MediaUploader.tsx`]
    *   **Deliverables:** Editor with autosave, version conflicts, diff view, accessory doc referencing spec.
    *   **Acceptance Criteria:** Autosave uses Debounce; conflicting edits show diff; media attachments reflect pipeline statuses.
    *   **Dependencies:** `I3.T3`, `I2.T7`
    *   **Parallelizable:** No

<!-- anchor: task-i3-t9 -->
*   **Task 3.9:**
    *   **Task ID:** `I3.T9`
    *   **Description:** Add telemetry instrumentation to PrepChef/Admin/Display (OpenTelemetry spans, exposure events, offline banners) via libs/shared telemetry helpers; update observability plan.
    *   **Agent Type Hint:** `DevOpsAgent`
    *   **Inputs:** Telemetry helpers, Observability doc, UI flows.
    *   **Input Files:** [`libs/shared/src/telemetry.ts`, `apps/prepchef/app/layout.tsx`, `docs/ops/observability_plan.md`]
    *   **Target Files:** [`libs/shared/src/telemetry.ts`, `apps/prepchef/app/layout.tsx`, `apps/admin-crm/app/layout.tsx`, `apps/display/app/page.tsx`, `docs/ops/observability_plan.md`]
    *   **Deliverables:** Context providers sending spans/logs, documentation of event names + dashboards.
    *   **Acceptance Criteria:** Telemetry toggled via env; events appear in dev log sink; docs updated with sampling guidance.
    *   **Dependencies:** `I1.T11`, `I3.T1`, `I3.T4`
    *   **Parallelizable:** Yes

<!-- anchor: task-i3-t10 -->
*   **Task 3.10:**
    *   **Task ID:** `I3.T10`
    *   **Description:** Expand Playwright suite to include media upload, combine approval, and display rotation tests using staged fixtures.
    *   **Agent Type Hint:** `QualityAgent`
    *   **Inputs:** Implementation tasks above, testing matrix plan.
    *   **Input Files:** [`tests/e2e/media_upload.spec.ts`, `tests/e2e/display_rotation.spec.ts`, `tests/e2e/combine.spec.ts`]
    *   **Target Files:** [`tests/e2e/media_upload.spec.ts`, `tests/e2e/display_rotation.spec.ts`, `tests/e2e/combine.spec.ts`, `tests/fixtures/media.json`]
    *   **Deliverables:** Automated flows verifying UI + backend interplay; fixtures for sample media/tasks.
    *   **Acceptance Criteria:** Tests stable in CI; tagging allows selective runs; results linked in testing matrix.
    *   **Dependencies:** `I3.T1`, `I3.T2`, `I3.T3`, `I3.T4`
    *   **Parallelizable:** Yes

<!-- anchor: task-i3-t11 -->
*   **Task 3.11:**
    *   **Task ID:** `I3.T11`
    *   **Description:** Document feature walkthrough (screenshots/gifs) summarizing PrepChef tasks, combine approvals, recipe drawer, media upload, display loop for stakeholder demo.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Completed UIs, specs.
    *   **Input Files:** [`docs/specs/walkthrough.md`, `docs/media/*.png`]
    *   **Target Files:** [`docs/specs/walkthrough.md`, `docs/media/prepchef_tasks.png`, `docs/media/combine.gif`, `docs/media/display.png`]
    *   **Deliverables:** Narrative doc with embed visuals + links to live routes.
    *   **Acceptance Criteria:** Covers each persona journey; stored in docs index; used for sign-off at iteration demo.
    *   **Dependencies:** `I3.T1`–`I3.T4`
    *   **Parallelizable:** Yes
