<!-- anchor: iteration-5-plan -->
### Iteration 5: Display Surface, Observability, and Release Readiness

*   **Iteration ID:** `I5`
*   **Goal:** Finalize kiosk/display experience, automation/observability pipelines, CI/CD diagramming, and release governance so the platform can ship with confidence.
*   **Prerequisites:** `I1`-`I4` complete (features + governance).
*   **Iteration Narrative:** With functionality in place, this iteration polishes the display wall, ensures telemetry and alerting operate, codifies CI/CD diagrams/runbooks, conducts resilience drills, and completes documentation plus automation backlog tasks needed before GA. Work also finalizes Doppler/Flagsmith configuration per environment and release communications.
*   **Success Metrics:**
    - Display refresh <15 seconds staleness in chaos drills.
    - Observability dashboards cover latency, realtime drops, media queue, feature flag exposures.
    - Release checklist + automation reduces manual steps to <5 actions.
*   **Risks & Mitigations:**
    - Risk: Observability noise; Mitigation: threshold tuning + severity tags.
    - Risk: Release scripts outdated; Mitigation: integrate CI verifications + doc updates.
    - Risk: Display offline detection fails; Mitigation: heartbeat monitoring + alerts.
*   **Exit Criteria:** Kiosk UI complete, telemetry dashboards live, CI/CD diagram committed, automation scripts + release runbook published, resilience drills executed, plan manifest ready for downstream agents.
*   **Tasks:**

<!-- anchor: task-i5-t1 -->
*   **Task 5.1:**
    *   **Task ID:** `I5.T1`
    *   **Description:** Finalize display app polish (kiosk mode detection, admin gesture for settings, offline snapshot caching, rotation scheduling) and integrate device heartbeat watcher + alerts.
    *   **Agent Type Hint:** `FrontendAgent`
    *   **Inputs:** Display components, heartbeat data, blueprint wall requirements.
    *   **Input Files:** ["apps/display/app/page.tsx", "docs/architecture/06_UI_UX_Architecture.md", "docs/operations/media_pipeline.md"]
    *   **Target Files:** ["apps/display/app/layout.tsx", "apps/display/components/device-status.tsx", "apps/display/hooks/useHeartbeat.ts", "docs/operations/display_runbook.md"]
    *   **Deliverables:**
        - Full-screen layout with kiosk lock, admin gesture instructions, offline banner.
        - Heartbeat hook monitoring `/api/presence` + raising toast/alert when device stale.
        - Device status component referencing presence table.
        - Runbook citing heartbeat thresholds, manual refresh instructions, signage guidelines.
    *   **Acceptance Criteria:** Display responds to orientation change; offline fallback shows timestamp; heartbeat alerts delivered; runbook cross-links to automation.
    *   **Dependencies:** [`I4.T5`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i5-t2 -->
*   **Task 5.2:**
    *   **Task ID:** `I5.T2`
    *   **Description:** Author CI/CD pipeline diagram (Mermaid) and documentation describing GitHub Actions, Doppler, Supabase migrations, Flagsmith approvals, and rollback flows.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** CI workflows, release process, blueprint directives.
    *   **Input Files:** [".github/workflows/ci.yml", "docs/operations/ci_cd_overview.md"]
    *   **Target Files:** ["docs/diagrams/cicd_pipeline.mmd", "docs/operations/release_runbook.md"]
    *   **Deliverables:**
        - Mermaid diagram mapping code push -> CI -> migrations -> preview -> staging -> prod with approvals.
        - Release runbook enumerating steps, automation scripts, rollback levers, flag toggles, communications.
    *   **Acceptance Criteria:** Diagram renders; runbook references Doppler/Flagsmith flows; release checklist appended to repository docs.
    *   **Dependencies:** [`I1.T7`, `I4.T6`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i5-t3 -->
*   **Task 5.3:**
    *   **Task ID:** `I5.T3`
    *   **Description:** Configure environment-specific Doppler + Flagsmith settings (dev/staging/prod), automation scripts for secret sync, feature flag defaults, and verification commands.
    *   **Agent Type Hint:** `OpsAgent`
    *   **Inputs:** Doppler templates, flag runbook.
    *   **Input Files:** ["configs/doppler.template.yaml", "docs/operations/feature_flag_runbook.md"]
    *   **Target Files:** ["scripts/env/sync_secrets.ps1", "scripts/env/sync_secrets.sh", "docs/operations/environment_matrix.md", "docs/operations/feature_flag_matrix.md"]
    *   **Deliverables:**
        - Cross-platform secret sync scripts verifying required keys exist for each environment.
        - Environment matrix doc listing Supabase project IDs, Vercel projects, Flagsmith envs, release cadence.
        - Feature flag matrix capturing default states, rollout owners, telemetry metrics, kill-switch details.
    *   **Acceptance Criteria:** Scripts exit nonzero when secrets missing; docs highlight owners; CI job runs sync script dry-run; autop-run adds unstoppable.
    *   **Dependencies:** [`I1.T6`, `I1.T7`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i5-t4 -->
*   **Task 5.4:**
    *   **Task ID:** `I5.T4`
    *   **Description:** Build observability dashboards (Logflare/Datadog/Grafana) with panels for API latency, realtime drop rate, media queue depth, undo success, combine exposures; codify alert thresholds + notification channels.
    *   **Agent Type Hint:** `OpsAgent`
    *   **Inputs:** OTEL config, metrics instrumentation, blueprint observability section.
    *   **Input Files:** ["configs/otel.config.json", "docs/operations/media_pipeline.md", "docs/architecture/04_Operational_Architecture.md"]
    *   **Target Files:** ["docs/operations/observability_dashboard.md", "docs/operations/alert_matrix.md", "scripts/observability/bootstrap.ts"]
    *   **Deliverables:**
        - Dashboard definitions (JSON or Terraform) for key metrics; screenshot or embed for docs.
        - Alert matrix mapping metrics -> severity -> runbook links.
        - Bootstrap script calling observability API to create resources.
    *   **Acceptance Criteria:** Dashboards accessible; alerts configured with Teams/Slack webhooks; docs show sample graphs + thresholds; script idempotent.
    *   **Dependencies:** [`I1.T7`, `I4.T6`]
    *   **Parallelizable:** No (ops-critical).

<!-- anchor: task-i5-t5 -->
*   **Task 5.5:**
    *   **Task ID:** `I5.T5`
    *   **Description:** Conduct resilience drills (realtime outage, Supabase restart, media backlog) and document results, patching scripts/UX fallback as needed.
    *   **Agent Type Hint:** `ReliabilityAgent`
    *   **Inputs:** Runbooks, automation, display + PrepChef UIs.
    *   **Input Files:** ["docs/operations/display_runbook.md", "docs/operations/audit_runbook.md", "tests/playwright/helpers/realtimeChaos.ts"]
    *   **Target Files:** ["docs/operations/resilience_report.md", "apps/prepchef/components/offline-banner.tsx", "apps/display/components/offline-banner.tsx"]
    *   **Deliverables:**
        - Formal report per drill summarizing scenario, impact, remediation, follow-ups.
        - UI updates for offline banners referencing telemetry/perf data.
        - Checklist verifying user messaging, logging, and auto-recovery sequences.
    *   **Acceptance Criteria:** Drills executed; issues logged + tracked; UI banners accessible; docs link to follow-up tickets.
    *   **Dependencies:** [`I5.T1`, `I5.T4`]
    *   **Parallelizable:** No (requires coordination).

<!-- anchor: task-i5-t6 -->
*   **Task 5.6:**
    *   **Task ID:** `I5.T6`
    *   **Description:** Automate operations backlog items (Supabase impersonation tests nightly, automation backlog tracker, Slack bot for incidents) per Section 3.13.
    *   **Agent Type Hint:** `AutomationAgent`
    *   **Inputs:** Backlog list, scripts, CI workflows.
    *   **Input Files:** ["docs/operations/automation_backlog.md", "scripts/impersonate.ps1", "docs/operations/incident_templates.md"]
    *   **Target Files:** [".github/workflows/nightly-impersonation.yml", "scripts/bots/incident_notifier.ts", "docs/operations/automation_status.md"]
    *   **Deliverables:**
        - Nightly workflow running Supabase impersonation tests + posting summary to Slack.
        - Incident notifier script hooking into observability alerts for communications.
        - Automation status doc tracking completed vs pending backlog items.
    *   **Acceptance Criteria:** Workflow logs accessible; Slack message sample documented; automation status updated.
    *   **Dependencies:** [`I1.T5`, `I4.T6`]
    *   **Parallelizable:** Yes.

<!-- anchor: task-i5-t7 -->
*   **Task 5.7:**
    *   **Task ID:** `I5.T7`
    *   **Description:** Finalize documentation set (README polish, architecture glossary sync, plan manifest) and deliver training for stakeholders (ops, managers, engineers) referencing artifacts.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** All prior docs.
    *   **Input Files:** ["README.md", "docs/ux/ui_interaction_blueprint.md", "docs/operations/release_runbook.md"]
    *   **Target Files:** ["README.md", "docs/operations/training_agenda.md", "docs/architecture/glossary.md", ".codemachine/artifacts/plan/plan_manifest.json"]
    *   **Deliverables:**
        - Updated README with summary, quickstart, architecture diagram links, release timeline.
        - Training agenda for different personas linking to runbooks + diagrams.
        - Glossary sync referencing blueprint + plan anchors.
        - Plan manifest JSON indexing anchors (fulfilling instructions for downstream agents).
    *   **Acceptance Criteria:** Docs reference anchors; training agenda distributed; plan manifest validated (JSON schema) and lists all major sections/tasks.
    *   **Dependencies:** [All prior tasks]
    *   **Parallelizable:** No (final consolidation).

<!-- anchor: task-i5-t8 -->
*   **Task 5.8:**
    *   **Task ID:** `I5.T8`
    *   **Description:** Run final Playwright regression plus manual QA verifying display, PrepChef, Admin CRM, notifications, feature flags, and undo flows under production-like data, documenting sign-off.
    *   **Agent Type Hint:** `QATestingAgent`
    *   **Inputs:** Completed UIs, automation scripts.
    *   **Input Files:** ["tests/playwright/prepchef.tasks.spec.ts", "tests/playwright/admin.board.spec.ts", "docs/operations/resilience_report.md"]
    *   **Target Files:** ["tests/playwright/regression.suite.json", "docs/operations/qa_signoff.md"]
    *   **Deliverables:**
        - Consolidated Playwright suite invoking all spec files with tags for surfaces.
        - QA sign-off doc listing scenarios, failures, mitigations, pending risks.
    *   **Acceptance Criteria:** Suite passes; sign-off doc signed by QA + ops leads; gating tasks tracked in issue tracker.
    *   **Dependencies:** [`I5.T1`-`I5.T7`]
    *   **Parallelizable:** No.

*   **Iteration Review Checklist:**
    - Validate display offline simulation and capture screenshot for runbook.
    - Review observability alerts to ensure no false positives for 24h.
    - Conduct release dry-run using runbook and automation scripts.