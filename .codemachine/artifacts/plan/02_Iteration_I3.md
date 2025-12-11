<!-- anchor: iteration-3-plan -->
### Iteration 3: Recipes, Methods, Media Pipeline, and UI Blueprinting

*   **Iteration ID:** `I3`
*   **Goal:** Deliver the knowledge-base stack (recipes, methods, media uploads, training flows) and document the UI interaction blueprint so staff can view contextual instructions while managers curate content safely under RLS.
*   **Prerequisites:** `I1` and `I2` complete (workspace/schema/API/realtime foundations).
*   **Iteration Narrative:** This iteration deepens the data model with recipe and method entities, storage buckets, and Supabase functions for transcoding. PrepChef gains a recipe drawer with streaming instructions, Admin CRM receives content management forms, and Display/PrepChef share the same blueprint for drawers and notifications. Documentation plus RLS updates ensure training media remains tenant isolated and versioned.
*   **Success Metrics:**
    - Recipe drawer loads hero + key steps within 250ms server time.
    - Media upload pipeline handles 500MB video with progress + status updates.
    - Admin recipe editor honors optimistic locking and exposes version history.
*   **Risks & Mitigations:**
    - Risk: Storage costs balloon; Mitigation: implement retention flags + metadata cleaning job.
    - Risk: Media processing queue stalls; Mitigation: add observability hooks + retries.
    - Risk: Version conflicts; Mitigation: enforce version column + conflict UI state.
*   **Exit Criteria:** Recipes/methods/media tables + functions deployed, UI blueprint committed, PrepChef and Admin CRM surfaces reference drawers/media, and Playwright verifies recipe drawer + upload flows.
*   **Tasks:**

<!-- anchor: task-i3-t1 -->
*   **Task 3.1:**
    *   **Task ID:** `I3.T1`
    *   **Description:** Introduce Supabase migrations for `recipes`, `method_documents`, `media_assets`, `role_assignments` history, and supporting indexes/foreign keys.
    *   **Agent Type Hint:** `DatabaseAgent`
    *   **Inputs:** Blueprint data model, prior migrations.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md", "supabase/migrations/0003_task_lifecycle.sql"]
    *   **Target Files:** ["supabase/migrations/0005_recipes_methods.sql", "supabase/migrations/0006_media_assets.sql", "docs/diagrams/supabase_erd.mmd"]
    *   **Deliverables:**
        - SQL migrations adding recipe/method/media tables with versioning, JSONB steps, tags, allergen flags, and media references.
        - ERD update highlighting new tables and relationships to tasks/combined groups.
        - Seed data for sample recipes + method documents per tenant.
    *   **Acceptance Criteria:** Migrations apply/rollback cleanly; ERD diff logged; seeds load in dev environment; indexes cover `company_id` + `version` + `tags` queries.
    *   **Dependencies:** [`I2.T1`]
    *   **Parallelizable:** No.

<!-- anchor: task-i3-t2 -->
*   **Task 3.2:**
    *   **Task ID:** `I3.T2`
    *   **Description:** Build Supabase storage buckets, signed upload endpoint, and Edge Function for media transcoding + thumbnail generation, plus CLI utilities to monitor jobs.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** Storage requirements, blueprint media flow, new migrations.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md", "supabase/migrations/0006_media_assets.sql"]
    *   **Target Files:** ["supabase/functions/media_ingest/index.ts", "apps/admin-crm/app/api/media/sign/route.ts", "scripts/media/watch_queue.ts", "docs/operations/media_pipeline.md"]
    *   **Deliverables:**
        - Edge Function triggered on storage upload to transcode video, create thumbnails, update `media_assets` status, and emit realtime events.
        - API route issuing signed URLs, validating MIME/size, and writing pending metadata rows.
        - Queue watcher script for ops plus documentation on retention + cleanup.
    *   **Acceptance Criteria:** Upload -> process -> ready statuses flow; logs show telemetry; watchers alert on backlog; admin docs advise when to escalate.
    *   **Dependencies:** [`I3.T1`]
    *   **Parallelizable:** No.

<!-- anchor: task-i3-t3 -->
*   **Task 3.3:**
    *   **Task ID:** `I3.T3`
    *   **Description:** Produce the Knowledge Base content flow diagram mapping Admin CRM authoring -> storage -> Supabase functions -> PrepChef drawers.
    *   **Agent Type Hint:** `DiagrammingAgent`
    *   **Inputs:** Media pipeline, recipe drawer requirements.
    *   **Input Files:** ["docs/operations/media_pipeline.md", "docs/architecture/06_UI_UX_Architecture.md"]
    *   **Target Files:** ["docs/diagrams/knowledge_flow.mmd", "docs/diagrams/diagram_index.md"]
    *   **Deliverables:**
        - Mermaid flowchart describing author upload, validation, processing, realtime updates, playback, and failure recovery.
        - Diagram index entry noting dependencies and iteration owner.
    *   **Acceptance Criteria:** Diagram renders; steps align with Task 3.2 output; fallback paths for failed processing included.
    *   **Dependencies:** [`I3.T2`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i3-t4 -->
*   **Task 3.4:**
    *   **Task ID:** `I3.T4`
    *   **Description:** Create the UI Interaction Blueprint describing PrepChef recipe drawer, undo toasts, filters, admin CMS forms, kiosk display transitions, and offline banners.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Blueprint UI requirements, new diagrams.
    *   **Input Files:** ["docs/architecture/06_UI_UX_Architecture.md", "docs/diagrams/knowledge_flow.mmd"]
    *   **Target Files:** ["docs/ux/ui_interaction_blueprint.md", "libs/ui/stories/interaction-blueprint.stories.mdx"]
    *   **Deliverables:**
        - Markdown blueprint with per-surface interaction patterns, focus order, motion tokens, offline handling, and notifications.
        - Storybook MDX doc referencing blueprint, demonstrating states, and linking to designs.
    *   **Acceptance Criteria:** Document cross-references diagrams + blueprint anchors; Storybook entry passes lint + Chromatic baseline; instructions cover accessible controls.
    *   **Dependencies:** [`I3.T3`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i3-t5 -->
*   **Task 3.5:**
    *   **Task ID:** `I3.T5`
    *   **Description:** Implement recipe drawer + method viewer UI in PrepChef (tabs, streaming sections, media player, allergen badges) and content forms in Admin CRM (version history, diff viewer, media attachers).
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** DTOs, UI blueprint, storage pipeline.
    *   **Input Files:** ["libs/shared/src/dto/tasks.ts", "docs/ux/ui_interaction_blueprint.md", "apps/admin-crm/app/layout.tsx"]
    *   **Target Files:** ["apps/prepchef/components/recipe-drawer.tsx", "apps/prepchef/app/tasks/layout.tsx", "apps/admin-crm/app/recipes/page.tsx", "apps/admin-crm/components/recipe-editor.tsx", "libs/ui/src/components/media-player.tsx"]
    *   **Deliverables:**
        - PrepChef drawer with tabs (Steps/Ingredients/Media/Notes) pulling data via streaming server component + React Query hydration.
        - Media player component with progress, fallback thumbnail, and offline banner hooking into realtime statuses.
        - Admin recipe editor with diff view, version bump confirmation, and media attachment/preview support.
        - Unit/Storybook tests for drawer states, method steps, and editor validations.
    *   **Acceptance Criteria:** Drawer opens/closes smoothly, persists filter state, and handles version mismatch prompts; admin editor prevents concurrent edits; tests + Chromatic snapshots updated.
    *   **Dependencies:** [`I3.T2`, `I3.T4`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i3-t6 -->
*   **Task 3.6:**
    *   **Task ID:** `I3.T6`
    *   **Description:** Extend RLS catalog/tests to cover recipes/methods/media, including owner-only editing, staff read access, and per-company storage bucket policies.
    *   **Agent Type Hint:** `SecurityAgent`
    *   **Inputs:** New migrations, existing RLS harness.
    *   **Input Files:** ["supabase/migrations/0005_recipes_methods.sql", "docs/security/rls_policies.md"]
    *   **Target Files:** ["supabase/migrations/0007_rls_recipes.sql", "supabase/tests/rls_policies.sql", "docs/security/rls_policies.md"]
    *   **Deliverables:**
        - RLS rules for recipes/methods/media, ensuring only managers/owners edit, staff read, and tasks reference consistent company data.
        - pgTAP additions covering role-specific behavior + impersonation tests.
        - Catalog updates summarizing coverage, TODOs, and impersonation commands for new tables.
    *   **Acceptance Criteria:** Tests pass; docs updated with new sections; storage policies mention bucket path conventions.
    *   **Dependencies:** [`I3.T1`]
    *   **Parallelizable:** Yes (after migration applied).

<!-- anchor: task-i3-t7 -->
*   **Task 3.7:**
    *   **Task ID:** `I3.T7`
    *   **Description:** Build Admin CRM training playlist manager and PrepChef training drawer hooking into method documents, including presence/personalization suggestions gated by feature flag `methods.training-recommendations`.
    *   **Agent Type Hint:** `FullStackAgent`
    *   **Inputs:** Method schema, feature flag docs, UI blueprint.
    *   **Input Files:** ["docs/operations/feature_flag_runbook.md", "docs/ux/ui_interaction_blueprint.md", "libs/shared/src/dto/methods.ts"]
    *   **Target Files:** ["apps/admin-crm/app/methods/page.tsx", "apps/admin-crm/components/method-playlist-editor.tsx", "apps/prepchef/components/method-drawer.tsx", "libs/shared/src/hooks/useMethods.ts", "libs/shared/src/flags/training.ts"]
    *   **Deliverables:**
        - Admin playlist editor (CRUD, drag-and-drop ordering, video attachments, skill levels, review status).
        - PrepChef drawer showing recommended methods tied to current tasks when flag ON, with fallback messaging when OFF.
        - Hooks fetching method data + caching exposures for telemetry.
    *   **Acceptance Criteria:** Feature flag toggles behavior; method drawer accessible; playlists persisted with audit logs; tests cover both flag states.
    *   **Dependencies:** [`I3.T5`, `I3.T6`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i3-t8 -->
*   **Task 3.8:**
    *   **Task ID:** `I3.T8`
    *   **Description:** Add Playwright and API tests for recipe drawer, media upload flow, admin editor, and method playlists, ensuring coverage for failure cases (upload fail, version conflict, flag OFF).
    *   **Agent Type Hint:** `QATestingAgent`
    *   **Inputs:** UI components, media pipeline, feature flags.
    *   **Input Files:** ["tests/playwright/prepchef.tasks.spec.ts", "apps/prepchef/components/recipe-drawer.tsx", "apps/admin-crm/components/recipe-editor.tsx"]
    *   **Target Files:** ["tests/playwright/recipes.spec.ts", "tests/playwright/admin.recipes.spec.ts", "tests/vitest/media_pipeline.test.ts"]
    *   **Deliverables:**
        - PrepChef Playwright spec covering drawer open, step navigation, video fallback, offline banner.
        - Admin Playwright spec covering upload success/failure, version diff, publish workflow.
        - Vitest suite mocking Supabase functions to test media status transitions.
    *   **Acceptance Criteria:** Tests pass locally + CI; screens captured on failure; docs updated with new commands.
    *   **Dependencies:** [`I3.T2`, `I3.T5`]
    *   **Parallelizable:** Yes (after UIs solidified).

*   **Iteration Review Checklist:**
    - Verify storage buckets enforce company prefixes and signed URL TTL logged.
    - Smoke test prepping tasks referencing recipes to ensure drawer data matches.
    - Capture Loom walkthrough demonstrating admin editor + PrepChef drawer linking via realtime events.