<!-- anchor: iteration-plan-overview -->
## 5. Iteration Plan

*   **Total Iterations Planned:** 5
*   **Iteration Dependencies:** I2 depends on core schema, contracts, and tooling from I1; I3 builds on task APIs plus knowledge-base scaffolding delivered in I2; I4 consumes heuristics + media foundations from I1 through I3 to unlock multi-event coordination; I5 finalizes display, observability, and release gates that rely on all previous iterations being code-complete and instrumented.

<!-- anchor: iteration-1-plan -->
### Iteration 1: Turbo Monorepo, Contracts, and Guardrails

*   **Iteration ID:** `I1`
*   **Goal:** Stand up the Turbo workspace, shared tooling, baseline Supabase schema, architecture diagrams, and guardrail documentation so subsequent agents can build features without reworking foundations.
*   **Prerequisites:** None.
*   **Iteration Narrative:** This iteration invests in deterministic developer experience (pnpm/turbo scripts, Doppler/Supabase automation), codifies architecture intent via diagrams and docs, and proves the schema + RLS stack so runtime work can safely branch in parallel. Deliverables emphasize text-based artifacts and automation so later feature work remains trivial to verify in CI.
*   **Success Metrics:**
    - pnpm install + `turbo run lint` complete in <4 minutes on CI runners.
    - Supabase migrations/tests run locally with a single `scripts/dev` command and surface zero RLS violations.
    - Diagrams + docs contain cross-links for every artifact referenced in Section 2.1.
*   **Risks & Mitigations:**
    - Risk: RLS rules block seeding; Mitigation: keep policies disabled until pgTAP passes, document toggles in catalog.
    - Risk: Turbo cache misconfigured; Mitigation: add verification step in CI doc and provide fallback `--no-cache` guidance.
    - Risk: Contributors skip Doppler; Mitigation: script enforces env check before starting dev servers.
*   **Exit Criteria:** Repo installs cleanly via pnpm, Supabase migrations and tests run locally and in CI, diagrams live under `docs/diagrams`, and operations documentation references the same anchors as the supplied blueprint.
*   **Tasks:**

<!-- anchor: task-i1-t1 -->
*   **Task 1.1:**
    *   **Task ID:** `I1.T1`
    *   **Description:** Initialize the Turbo repo with pnpm workspace, base package.json, lint/test scripts, and placeholder app/lib folders so future iterations can plug features into a consistent structure.
    *   **Agent Type Hint:** `SetupAgent`
    *   **Inputs:** Blueprint directives for repo structure and tooling conventions.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md"]
    *   **Target Files:** ["package.json", "pnpm-workspace.yaml", "turbo.json", "apps/prepchef/README.md", "libs/shared/package.json"]
    *   **Deliverables:**
        - Workspace skeleton with pnpm scripts for build/lint/test/format plus handy `pnpm dev:<app>` aliases.
        - Turbo pipeline definitions covering lint, test, build placeholders per package group and referencing caches/outputs.
        - Placeholder README inside each `apps/*` folder explaining intended purpose, entry command, and guardrails for imports.
        - Root README callout summarizing Node version, pnpm version pin, Flagsmith placeholder config, and Doppler note.
    *   **Acceptance Criteria:** pnpm install succeeds; `turbo run lint --dry` executes across placeholder packages; README documents instructions for running turborepo caching; repo root matches directory tree from Section 3 without stray files.
    *   **Dependencies:** []
    *   **Parallelizable:** No (foundation for all other work).

<!-- anchor: task-i1-t2 -->
*   **Task 1.2:**
    *   **Task ID:** `I1.T2`
    *   **Description:** Author contributor docs detailing coding standards, alias usage, ShadCN integration process, feature flag conventions, and Git/GitHub workflows so autonomous agents share a playbook.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Repo skeleton plus blueprint directives.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md", "README.md"]
    *   **Target Files:** ["CONTRIBUTING.md", "docs/operations/engineering_playbook.md", "docs/operations/feature_flag_runbook.md"]
    *   **Deliverables:**
        - CONTRIBUTING guide with pnpm/turbo commands, branch naming, code review expectations, ADR process, and testing gates.
        - Engineering playbook capturing alias usage, test coverage minimums, undo/audit requirements, environment setup, and layout of shared libraries.
        - Feature flag runbook describing Flagsmith environments, toggle lifecycle, exposure logging expectations, and rollback etiquette.
        - Checklist template for autonomous agents to self-verify compliance before closing tasks.
    *   **Acceptance Criteria:** Documents reference blueprint anchors, contain task checklists, and highlight automation to be built later; lint passes on Markdown (heading order, anchors) and links resolve to existing sections; GitHub templates updated if needed.
    *   **Dependencies:** [`I1.T1`]
    *   **Parallelizable:** Yes (documentation once skeleton exists).

<!-- anchor: task-i1-t3 -->
*   **Task 1.3:**
    *   **Task ID:** `I1.T3`
    *   **Description:** Produce the PrepChef component diagram showing server/client components, React Query caches, realtime adapter, mutation service, and undo controller interactions referencing Section 2.
    *   **Agent Type Hint:** `DiagrammingAgent`
    *   **Inputs:** Blueprint component descriptions and UI architecture notes.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md", "docs/architecture/06_UI_UX_Architecture.md"]
    *   **Target Files:** ["docs/diagrams/prepchef_components.puml", "docs/diagrams/diagram_index.md"]
    *   **Deliverables:**
        - PlantUML diagram file linking to PlantUML server or local render instructions plus metadata comments for maintainers.
        - Diagram index entry describing intent, dependencies, upcoming refinement tasks, and ADR references.
        - README snippet explaining how to regenerate PNG/SVG for design reviews and how to keep ASCII-safe labels.
    *   **Acceptance Criteria:** Diagram renders without syntax errors, includes every component mentioned in Section 2, uses ASCII-friendly labels, and cross-links to upcoming iteration tasks that rely on it; index table references iteration IDs.
    *   **Dependencies:** [`I1.T1`, `I1.T2`]
    *   **Parallelizable:** Yes (independent of schema work).

<!-- anchor: task-i1-t4 -->
*   **Task 1.4:**
    *   **Task ID:** `I1.T4`
    *   **Description:** Define initial Supabase schema migrations covering Companies, Users, Events, Tasks, CombinedTaskGroups, Stations, StaffSchedules, NotificationPreferences, and DisplaySnapshots, plus generate ERD diagram per Section 2.1.
    *   **Agent Type Hint:** `DatabaseAgent`
    *   **Inputs:** Data model overview, blueprint ERD requirements, and tenancy constraints.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md", "supabase/migrations/README.md"]
    *   **Target Files:** ["supabase/migrations/0001_base_schema.sql", "docs/diagrams/supabase_erd.mmd", "supabase/seed/base_seed.sql"]
    *   **Deliverables:**
        - SQL migration with tables, enums, indexes, and RLS placeholders disabled by default awaiting Task I1.T5.
        - Mermaid ERD source depicting relationships, undo tokens, audit references, JSONB fields, and station mapping.
        - Seed script populating demo companies/events/tasks for local dev plus instructions for `supabase db reset` and data anonymization.
    *   **Acceptance Criteria:** `supabase db lint` passes; ERD renders; seeds load via `supabase db reset`; JSONB columns and indexes align with Section 2 data model; comments reference blueprint anchors and iteration numbers.
    *   **Dependencies:** [`I1.T1`]
    *   **Parallelizable:** No (requires focus, blocks RLS/policy work).

<!-- anchor: task-i1-t5 -->
*   **Task 1.5:**
    *   **Task ID:** `I1.T5`
    *   **Description:** Implement baseline RLS policies, pgTAP tests, and the RLS policy catalog document describing actor/role contexts, impersonation scripts, and audit coverage expectations.
    *   **Agent Type Hint:** `SecurityAgent`
    *   **Inputs:** Base schema, blueprint RLS directives.
    *   **Input Files:** ["docs/architecture/01_Blueprint_Foundation.md", "supabase/migrations/0001_base_schema.sql"]
    *   **Target Files:** ["supabase/migrations/0002_rls_policies.sql", "supabase/tests/rls_policies.sql", "docs/security/rls_policies.md", "scripts/impersonate.ps1"]
    *   **Deliverables:**
        - SQL migration enabling RLS per table with role-checked policies referencing JWT claims and company scope.
        - pgTAP suite verifying staff/manager/event lead/owner contexts, undo token protection, and tenant isolation scenarios.
        - Markdown catalog summarizing each policy, risk category, verification method, and future TODOs for knowledge-base tables.
        - Script to impersonate roles locally via Supabase CLI for automation, with inline help text and exit codes.
    *   **Acceptance Criteria:** pgTAP tests run via `supabase test` and pass; documentation references tests and blueprint anchors; impersonation script outputs sample tokens and handles Windows/macOS shells.
    *   **Dependencies:** [`I1.T4`]
    *   **Parallelizable:** No (policy work must follow schema).

<!-- anchor: task-i1-t6 -->
*   **Task 1.6:**
    *   **Task ID:** `I1.T6`
    *   **Description:** Create environment automation including Doppler templates, Supabase CLI profiles, `supabase/config.toml`, and local dev scripts for running Supabase + Next.js with seeded data.
    *   **Agent Type Hint:** `SetupAgent`
    *   **Inputs:** Repo structure, seeds, and RLS policies.
    *   **Input Files:** ["docs/operations/engineering_playbook.md", "supabase/seed/base_seed.sql"]
    *   **Target Files:** [".doppler.yaml", "configs/doppler.template.yaml", "supabase/config.toml", "scripts/dev.ps1", "scripts/dev.sh"]
    *   **Deliverables:**
        - Doppler template listing required secrets, descriptions, environment mapping, and rotation cadence plus README snippet.
        - Supabase config pointing to local project reference IDs, port overrides, storage buckets, and real-time channel quotas.
        - Cross-platform dev script starting Supabase, running pnpm dev for apps/prepchef, seeding data, and surfacing cleanup instructions with colored output.
        - Troubleshooting section appended to playbook covering port conflicts, Docker fallback, and Windows WSL quirks.
    *   **Acceptance Criteria:** Running `scripts/dev` spins up Supabase + Next.js with seeded data and prints friendly instructions; Doppler template validated via `doppler run --config-template`; docs updated with steps and troubleshooting tips; CI ensures script has executable bit for bash.
    *   **Dependencies:** [`I1.T1`, `I1.T4`, `I1.T5`]
    *   **Parallelizable:** Yes (after schema + RLS stabilized).

<!-- anchor: task-i1-t7 -->
*   **Task 1.7:**
    *   **Task ID:** `I1.T7`
    *   **Description:** Establish baseline CI/CD automation (GitHub Actions) covering lint, typecheck, tests, Supabase migrations dry run, Storybook/Chromatic uploading stub, and OpenTelemetry bootstrap config.
    *   **Agent Type Hint:** `OpsAgent`
    *   **Inputs:** Turborepo scripts, seeds, RLS tests.
    *   **Input Files:** ["turbo.json", "supabase/migrations/0002_rls_policies.sql", "docs/operations/engineering_playbook.md"]
    *   **Target Files:** [".github/workflows/ci.yml", "docs/operations/ci_cd_overview.md", "configs/otel.config.json", ".github/workflows/chromatic.yml"]
    *   **Deliverables:**
        - GitHub Actions workflow chaining pnpm install -> turbo lint/test/build -> supabase db lint -> Storybook build -> Chromatic upload placeholder with matrix for Node versions.
        - Documentation describing approvals, artifact uploads, Doppler/Flagsmith secrets flow, fallback steps for self-hosted runners, and release gating.
        - OTEL config file describing service names, resource attributes, default exporters for local dev, and environment variable contract.
        - Chromatic workflow stub referencing libs/ui stories with TODO marker for authentication token plus README instructions for designers.
    *   **Acceptance Criteria:** Workflow executes successfully on branch push; docs show sample logs; OTEL config loads without JSON schema errors; Chromatic stub ready for later integration with secrets stored in Doppler; CI badge added to README.
    *   **Dependencies:** [`I1.T1`, `I1.T6`]
    *   **Parallelizable:** Yes (after tooling and scripts exist).

*   **Iteration Review Checklist:**
    - Verify diagrams render via CLI and exported PNG committed to artifacts folder.
    - Run `scripts/dev` then `pnpm test` to confirm seeds + RLS interplay.
    - Ensure documentation references anchors from blueprint and cross-links to iteration tasks for traceability.