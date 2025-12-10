<!-- anchor: iteration-5-plan -->
### Iteration 5: Hardening, Compliance & Launch Readiness

*   **Iteration ID:** `I5`
*   **Goal:** Finalize performance testing, compliance docs, rollout scripts, support playbooks, and cross-team sign-offs to ship MVP confidently.
*   **Prerequisites:** `I4`
*   **Tasks:**

<!-- anchor: task-i5-t1 -->
*   **Task 5.1:**
    *   **Task ID:** `I5.T1`
    *   **Description:** Conduct load + chaos tests (task surge, realtime drop, media backlog) using k6 or artillery scripts; document results and remediation backlog.
    *   **Agent Type Hint:** `PerformanceEngineer`
    *   **Inputs:** Performance doc, hooks, display snapshot.
    *   **Input Files:** [`tests/load/task_surge.js`, `tests/load/realtime_drop.js`, `docs/ops/performance.md`]
    *   **Target Files:** [`tests/load/task_surge.js`, `tests/load/realtime_drop.js`, `tests/load/media_backlog.js`, `docs/ops/performance.md`, `docs/ops/runbooks/realtime_outage.md`]
    *   **Deliverables:** Load scripts, chaos scenarios, summarized metrics + mitigation plan appended to performance doc.
    *   **Acceptance Criteria:** Tests simulate peak load; outputs stored for regression comparison; action items logged.
    *   **Dependencies:** `I4.T6`, `I4.T3`
    *   **Parallelizable:** No

<!-- anchor: task-i5-t2 -->
*   **Task 5.2:**
    *   **Task ID:** `I5.T2`
    *   **Description:** Complete compliance pack (audit log retention, GDPR/CCPA workflows, media retention overrides) referencing Access Matrix + security baseline.
    *   **Agent Type Hint:** `SecurityAgent`
    *   **Inputs:** Security baseline, runbooks.
    *   **Input Files:** [`docs/ops/compliance.md`, `docs/specs/access_matrix.md`, `docs/ops/security_baseline.md`]
    *   **Target Files:** [`docs/ops/compliance.md`, `docs/specs/access_matrix.md`, `docs/ops/security_baseline.md`]
    *   **Deliverables:** Compliance doc covering data retention, export/deletion scripts, audit log review cadence, owner assignments.
    *   **Acceptance Criteria:** Document signed by security lead; cross-links to runbooks + release checklist; action plan for upcoming audits.
    *   **Dependencies:** `I4.T7`
    *   **Parallelizable:** Yes

<!-- anchor: task-i5-t3 -->
*   **Task 5.3:**
    *   **Task ID:** `I5.T3`
    *   **Description:** Finalize kiosk + mobile accessibility audit (WCAG heuristics) and backlog items; update libs/ui tokens or components as needed.
    *   **Agent Type Hint:** `UXEngineer`
    *   **Inputs:** UI components, accessibility checklist.
    *   **Input Files:** [`docs/quality/accessibility_audit.md`, `libs/ui/src/components/*.tsx`, `apps/display/app/page.tsx`]
    *   **Target Files:** [`docs/quality/accessibility_audit.md`, `libs/ui/src/components/TaskRow.tsx`, `libs/ui/src/components/Toast.tsx`, `apps/display/components/SummaryGrid.tsx`]
    *   **Deliverables:** Audit doc summarizing tests (Axe, manual, keyboard), updated components reflecting fixes, backlog for non-critical items.
    *   **Acceptance Criteria:** Checklist items covered; high-contrast + focus ring verified; doc stored under docs/quality.
    *   **Dependencies:** `I3.T6`, `I3.T4`
    *   **Parallelizable:** Yes

<!-- anchor: task-i5-t4 -->
*   **Task 5.4:**
    *   **Task ID:** `I5.T4`
    *   **Description:** Execute release dry-run: apply migrations on staging, run CI, deploy to staging Vercel, verify doppler secrets + feature flags; capture timeline + sign-offs.
    *   **Agent Type Hint:** `DevOpsAgent`
    *   **Inputs:** Release guard workflow, runbooks.
    *   **Input Files:** [`docs/ops/release_checklist.md`, `.github/workflows/release.yml`, `tooling/scripts/release_guard.ps1`]
    *   **Target Files:** [`docs/ops/release_checklist.md`, `.github/workflows/release.yml`, `tooling/scripts/release_guard.ps1`, `docs/ops/post_release_report.md`]
    *   **Deliverables:** Completed checklist with timestamps, automation output logs, post-release report template.
    *   **Acceptance Criteria:** Dry-run replicable; gating script verifies migrations; report stored; issues logged as tickets.
    *   **Dependencies:** `I4.T11`
    *   **Parallelizable:** No

<!-- anchor: task-i5-t5 -->
*   **Task 5.5:**
    *   **Task ID:** `I5.T5`
    *   **Description:** Build customer support toolkit: FAQ, troubleshooting flows (task not syncing, kiosk offline, media stuck), template responses referencing docs.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Runbooks, telemetry plan, UI flows.
    *   **Input Files:** [`docs/support/faq.md`, `docs/support/troubleshooting.md`]
    *   **Target Files:** [`docs/support/faq.md`, `docs/support/troubleshooting.md`, `docs/support/templates.md`]
    *   **Deliverables:** Support docs with step-by-step instructions, sample reply macros, linking to runbooks + diagnostics scripts.
    *   **Acceptance Criteria:** Coverage for staff/manager/common scenarios; versioned references; accessible from docs index + README.
    *   **Dependencies:** `I4.T7`, `I4.T5`
    *   **Parallelizable:** Yes

<!-- anchor: task-i5-t6 -->
*   **Task 5.6:**
    *   **Task ID:** `I5.T6`
    *   **Description:** Implement analytics hooks (task efficiency, combine adoption, recipe view counts) writing to Supabase views + dashboards for leadership.
    *   **Agent Type Hint:** `DataEngineer`
    *   **Inputs:** Telemetry events, Supabase views.
    *   **Input Files:** [`supabase/migrations/20250509_metrics.sql`, `apps/admin-crm/components/InsightsTab.tsx`, `docs/ops/metrics_catalog.md`]
    *   **Target Files:** [`supabase/migrations/20250509_metrics.sql`, `apps/admin-crm/components/InsightsTab.tsx`, `docs/ops/metrics_catalog.md`]
    *   **Deliverables:** Metrics views (task throughput, combine acceptance, recipe drawer dwell), Admin insights tab, catalog updates.
    *   **Acceptance Criteria:** Views efficient; insights tab renders charts; doc describes metric definitions + owners.
    *   **Dependencies:** `I3.T9`, `I4.T6`
    *   **Parallelizable:** No

<!-- anchor: task-i5-t7 -->
*   **Task 5.7:**
    *   **Task ID:** `I5.T7`
    *   **Description:** Perform security penetration checks (role escalation attempts, API abuse, storage access) and patch findings; update security baseline.
    *   **Agent Type Hint:** `SecurityAgent`
    *   **Inputs:** RLS tests, security doc.
    *   **Input Files:** [`tooling/scripts/security_scan.ps1`, `docs/ops/security_baseline.md`, `docs/ops/compliance.md`]
    *   **Target Files:** [`tooling/scripts/security_scan.ps1`, `docs/ops/security_baseline.md`, `docs/ops/compliance.md`]
    *   **Deliverables:** Automated scan script or steps, remediation summary, baseline updates.
    *   **Acceptance Criteria:** Findings resolved or tracked; doc lists next review date.
    *   **Dependencies:** `I2.T10`, `I5.T2`
    *   **Parallelizable:** No

<!-- anchor: task-i5-t8 -->
*   **Task 5.8:**
    *   **Task ID:** `I5.T8`
    *   **Description:** Finalize manifest + documentation cross-check (anchors, plan manifest JSON) ensuring all artifacts addressable; run doc lint.
    *   **Agent Type Hint:** `DocumentationAgent`
    *   **Inputs:** Entire doc set, plan requirement.
    *   **Input Files:** [`plan_manifest.json`, `docs/README.md`, `docs/specs/*`]
    *   **Target Files:** [`plan_manifest.json`, `docs/README.md`, `docs/specs/walkthrough.md`]
    *   **Deliverables:** Valid manifest referencing anchors, doc lint job results, README updates.
    *   **Acceptance Criteria:** Manifest passes JSON schema; doc lint clean; README includes quick links.
    *   **Dependencies:** All prior tasks referencing artifacts
    *   **Parallelizable:** No

<!-- anchor: task-i5-t9 -->
*   **Task 5.9:**
    *   **Task ID:** `I5.T9`
    *   **Description:** Prepare go-live communication pack (internal announcement, change log, training schedule) and align with operations calendar.
    *   **Agent Type Hint:** `ProjectManager`
    *   **Inputs:** Walkthrough doc, support toolkit, release plan.
    *   **Input Files:** [`docs/ops/change_log.md`, `docs/ops/comm_plan.md`]
    *   **Target Files:** [`docs/ops/change_log.md`, `docs/ops/comm_plan.md`, `docs/specs/walkthrough.md`]
    *   **Deliverables:** Change log for MVP, comm plan with audience-specific messaging, training timeline referencing docs.
    *   **Acceptance Criteria:** Stakeholders listed; plan approved; change log covers features + flags.
    *   **Dependencies:** `I3.T11`, `I5.T5`
    *   **Parallelizable:** Yes

<!-- anchor: task-i5-t10 -->
*   **Task 5.10:**
    *   **Task ID:** `I5.T10`
    *   **Description:** Execute PITR + rollback drill combining Supabase restore + Vercel rollback; capture steps, timings, lessons.
    *   **Agent Type Hint:** `DevOpsAgent`
    *   **Inputs:** Release checklist, runbooks, Supabase CLI.
    *   **Input Files:** [`docs/ops/dr_drill.md`, `tooling/scripts/pitr_restore.sh`]
    *   **Target Files:** [`docs/ops/dr_drill.md`, `tooling/scripts/pitr_restore.sh`, `docs/ops/runbooks/realtime_outage.md`]
    *   **Deliverables:** Script automating PITR restore, documented drill results, updates to runbooks with actual timings.
    *   **Acceptance Criteria:** Drill completes within SLA; doc stored; action items tracked.
    *   **Dependencies:** `I4.T11`, `I5.T4`
    *   **Parallelizable:** No

<!-- anchor: task-i5-t11 -->
*   **Task 5.11:**
    *   **Task ID:** `I5.T11`
    *   **Description:** Final QA regression (PrepChef, Admin, Display, Notifications) plus sign-off checklist capturing owners, tests run, outstanding risks.
    *   **Agent Type Hint:** `QualityAgent`
    *   **Inputs:** Testing matrix, new features, support toolkit.
    *   **Input Files:** [`tests/e2e/regression_suite.spec.ts`, `docs/quality/testing_matrix.md`, `docs/ops/release_checklist.md`]
    *   **Target Files:** [`tests/e2e/regression_suite.spec.ts`, `docs/quality/testing_matrix.md`, `docs/ops/release_checklist.md`]
    *   **Deliverables:** Consolidated regression suite, updated matrix showing 100% coverage for MVP features, final release checklist sign-offs.
    *   **Acceptance Criteria:** Regression passes; matrix flagged green; release checklist signed by Eng/Ops/Product.
    *   **Dependencies:** `I5.T1`–`I5.T10`
    *   **Parallelizable:** No
