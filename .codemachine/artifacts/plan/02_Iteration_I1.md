<!-- anchor: iteration-plan-overview -->
## 5. Iteration Plan

*   **Total Iterations Planned:** 5
*   **Iteration Dependencies:** I1 establishes repo + contracts enabling downstream feature work; I2 builds API + realtime foundations, I3 layers media + testing, I4 operationalizes kiosk + notifications, I5 finalizes hardening and release-readiness artifacts.

<!-- anchor: iteration-1-plan -->
### Iteration 1: Workspace & Foundational Contracts

*   **Iteration ID:** `I1`
*   **Goal:** Stand up the Turbo monorepo, base Supabase schema, architectural artifacts, and governance docs so future iterations can work in parallel against typed contracts.
*   **Prerequisites:** None
*   **Tasks:**

<!-- anchor: task-i1-t1 -->
*   **Task 1.1:**
    *   **Task ID:** `I1.T1`
    *   **Description:** Initialize pnpm + Turbo workspace, create `apps/` and `libs/` scaffolding, configure root lint/test/build scripts, and document setup in README so agents have a runnable baseline.
    *   **Agent Type Hint:** `SetupAgent`
    *   **Inputs:** Requirements overview, desired directory tree (Section 3).
    *   **Input Files:** [`README.md`, `turbo.json`, `package.json`]
    *   **Target Files:** [`README.md`, `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `apps/prepchef/package.json`, `libs/ui/package.json`]
    *   **Deliverables:** Bootstrapped repo with pnpm workspace, Turbo pipeline, placeholder app/library packages, root README describing install/run commands.
    *   **Acceptance Criteria:** pnpm install succeeds; `turbo run lint --dry` resolves scripts; README documents workspace commands and references Supabase/Flagsmith prerequisites.
    *   **Dependencies:** None
    *   **Parallelizable:** No

<!-- anchor: task-i1-t2 -->
*   **Task 1.2:**
    *   **Task ID:** `I1.T2`
    *   **Description:** Produce Access Control Matrix spec mapping Staff/Manager/Event Lead/Owner to CRUD actions, Supabase RLS expectations, and UI affordances; store in `docs/specs/access_matrix.md`.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Role requirements (Section 3.6, Permissions).
    *   **Input Files:** [`docs/specs/access_matrix.md`]
    *   **Target Files:** [`docs/specs/access_matrix.md`]
    *   **Deliverables:** Markdown table capturing roles, allowed operations (tasks, recipes, media, display), corresponding Supabase policies, and feature-flag notes.
    *   **Acceptance Criteria:** Table covers all core entities; references Supabase policy names; includes notes on undo scope and kiosk visibility; reviewed with architects.
    *   **Dependencies:** `I1.T1`
    *   **Parallelizable:** Yes

<!-- anchor: task-i1-t3 -->
*   **Task 1.3:**
    *   **Task ID:** `I1.T3`
    *   **Description:** Draft Component Diagram in PlantUML depicting apps, shared libs, Supabase services, feature flag + observability tooling, aligning with Section 2 components.
    *   **Agent Type Hint:** `DiagrammingAgent`
    *   **Inputs:** Section 2 Core Architecture, directory structure.
    *   **Input Files:** [`docs/diagrams/component_overview.puml`]
    *   **Target Files:** [`docs/diagrams/component_overview.puml`]
    *   **Deliverables:** PlantUML diagram with legend, tags, and narrative snippet summarizing interactions.
    *   **Acceptance Criteria:** Diagram renders without errors; shows all core apps/libs/services; matches naming conventions; linked from README/architecture index.
    *   **Dependencies:** `I1.T1`
    *   **Parallelizable:** Yes

<!-- anchor: task-i1-t4 -->
*   **Task 1.4:**
    *   **Task ID:** `I1.T4`
    *   **Description:** Define initial Supabase schema migrations for companies, users, events, tasks, combined_task_groups, recipes, method_documents, media_assets, and audit_logs; generate Mermaid ERD documenting relationships.
    *   **Agent Type Hint:** `DatabaseAgent`
    *   **Inputs:** Data model overview, Access Control Matrix.
    *   **Input Files:** [`supabase/migrations/*`, `docs/diagrams/data_model.mmd`]
    *   **Target Files:** [`supabase/migrations/20250509_init.sql`, `docs/diagrams/data_model.mmd`, `supabase/seed/seed.sql`]
    *   **Deliverables:** SQL migration with tables, enums, company_id foreign keys, indexes, baseline RLS policies; ERD diagram; seed script with demo tenant.
    *   **Acceptance Criteria:** `supabase db lint` passes; ERD renders; migration docs undo steps; seeds create staff/manager sample for Playwright.
    *   **Dependencies:** `I1.T1`, `I1.T2`
    *   **Parallelizable:** No

<!-- anchor: task-i1-t5 -->
*   **Task 1.5:**
    *   **Task ID:** `I1.T5`
    *   **Description:** Produce Deployment Diagram in PlantUML covering GitHub Actions, Vercel, Supabase (DB/Auth/Storage/Realtime/Functions), Doppler, Flagsmith, Observability sinks.
    *   **Agent Type Hint:** `DiagrammingAgent`
    *   **Inputs:** Section 2 tech stack, operational blueprint.
    *   **Input Files:** [`docs/diagrams/deployment_view.puml`]
    *   **Target Files:** [`docs/diagrams/deployment_view.puml`]
    *   **Deliverables:** PlantUML deployment view with nodes, containers, edges annotated for secrets + telemetry.
    *   **Acceptance Criteria:** Diagram compiles; matches hosting mandates; referenced in architecture index.
    *   **Dependencies:** `I1.T1`
    *   **Parallelizable:** Yes

<!-- anchor: task-i1-t6 -->
*   **Task 1.6:**
    *   **Task ID:** `I1.T6`
    *   **Description:** Create Supabase migration playbook detailing CLI commands, pgTAP usage, rollback protocol, Doppler integration, and checklist for schema changes.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Section 4 directives, migration workflow.
    *   **Input Files:** [`docs/ops/supabase_migration_playbook.md`]
    *   **Target Files:** [`docs/ops/supabase_migration_playbook.md`]
    *   **Deliverables:** Markdown guide with step-by-step instructions, required tooling, automation hooks, sign-off checklist.
    *   **Acceptance Criteria:** References tasks, seeds, RLS tests; includes verification commands; cross-links to Access Matrix and diagrams.
    *   **Dependencies:** `I1.T4`
    *   **Parallelizable:** No

<!-- anchor: task-i1-t7 -->
*   **Task 1.7:**
    *   **Task ID:** `I1.T7`
    *   **Description:** Scaffold `libs/ui` tokens + Tailwind config, `libs/shared` TypeScript base (enums, DTO placeholders), `libs/supabase` client factory, and configure lint/test harnesses.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Directory structure, Section 2 tech stack.
    *   **Input Files:** [`libs/ui/src/index.ts`, `libs/shared/src/index.ts`, `libs/supabase/src/index.ts`, `tailwind.config.ts`, `.eslintrc.cjs`]
    *   **Target Files:** [`libs/ui/src/tokens.ts`, `libs/ui/package.json`, `libs/shared/src/domain.ts`, `libs/supabase/src/client.ts`, `tailwind.config.ts`, `tsconfig.base.json`]
    *   **Deliverables:** Token definitions, stubbed components, shared enums for roles/status, Supabase client wrapper with env guards, workspace-wide lint/test configs.
    *   **Acceptance Criteria:** Storybook builds with placeholder stories; lint passes; Supabase client throws if missing Doppler vars; tokens match Section 6.1 palette.
    *   **Dependencies:** `I1.T1`
    *   **Parallelizable:** Yes
<!-- anchor: task-i1-t8 -->
*   **Task 1.8:**
    *   **Task ID:** `I1.T8`
    *   **Description:** Establish docs index + ADR template referencing blueprint anchors, ensuring all diagrams/specs are discoverable via `docs/README.md` with anchor metadata for manifest generation.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Existing documentation set (Sections 1–4), artifacts list.
    *   **Input Files:** [`docs/README.md`, `docs/adr/ADR_TEMPLATE.md`]
    *   **Target Files:** [`docs/README.md`, `docs/adr/ADR_TEMPLATE.md`]
    *   **Deliverables:** Docs index linking to diagrams/specs/ops guides, ADR template capturing context/decision/impact/anchors, contribution blurb guiding future authors.
    *   **Acceptance Criteria:** Index lists every artifact path, includes anchor IDs, and ADR template cites Access Matrix + migration playbook; README linked from root documentation section.
    *   **Dependencies:** `I1.T2`, `I1.T3`, `I1.T4`, `I1.T5`
    *   **Parallelizable:** Yes

<!-- anchor: task-i1-t9 -->
*   **Task 1.9:**
    *   **Task ID:** `I1.T9`
    *   **Description:** Configure CI skeleton (GitHub Actions) running lint, typecheck, tests, and Supabase CLI dry-run, ensuring Doppler tokens pulled securely; document pipeline in CONTRIBUTING.
    *   **Agent Type Hint:** `DevOpsAgent`
    *   **Inputs:** Section 2 tooling, directives.
    *   **Input Files:** [`.github/workflows/ci.yml`, `CONTRIBUTING.md`]
    *   **Target Files:** [`.github/workflows/ci.yml`, `CONTRIBUTING.md`]
    *   **Deliverables:** Workflow file with pnpm cache, Turbo tasks, Supabase CLI validation, artifact upload for Playwright; CONTRIBUTING section describing CI prerequisites and failure triage.
    *   **Acceptance Criteria:** Workflow runs lint/test/build on push + PR; secrets pulled via Doppler action; documentation links to migration playbook and runbook; dry-run logs captured.
    *   **Dependencies:** `I1.T1`, `I1.T4`, `I1.T6`
    *   **Parallelizable:** Yes
<!-- anchor: task-i1-t10 -->
*   **Task 1.10:**
    *   **Task ID:** `I1.T10`
    *   **Description:** Author security baseline doc outlining Doppler usage, secret rotation cadence, feature flag access policy, and checklist for onboarding engineers to sensitive tooling.
    *   **Agent Type Hint:** `SecurityAgent`
    *   **Inputs:** Section 4 directives, requirements security section.
    *   **Input Files:** [`docs/ops/security_baseline.md`]
    *   **Target Files:** [`docs/ops/security_baseline.md`]
    *   **Deliverables:** Markdown doc specifying required MFA, Doppler scopes, Supabase role usage, feature flag governance, audit log monitoring steps.
    *   **Acceptance Criteria:** Document references Access Matrix, migration playbook, and describes incident escalation; approved by security owner.
    *   **Dependencies:** `I1.T2`, `I1.T6`
    *   **Parallelizable:** Yes

<!-- anchor: task-i1-t11 -->
*   **Task 1.11:**
    *   **Task ID:** `I1.T11`
    *   **Description:** Set up observability stubs (OpenTelemetry config, Pino logger wrapper) shared via `libs/shared/telemetry`, plus plan logging destinations in doc.
    *   **Agent Type Hint:** `BackendAgent`
    *   **Inputs:** Section 2 Observability stack.
    *   **Input Files:** [`libs/shared/src/telemetry.ts`, `docs/ops/observability_plan.md`]
    *   **Target Files:** [`libs/shared/src/telemetry.ts`, `docs/ops/observability_plan.md`]
    *   **Deliverables:** Telemetry helper exporting trace/span creators, logger factory referencing Doppler env, doc explaining log levels + pipeline.
    *   **Acceptance Criteria:** Helpers compile under strict TS; doc ties events to metrics; placeholder exporters ready for instrumentation in future iterations.
    *   **Dependencies:** `I1.T1`
    *   **Parallelizable:** Yes
