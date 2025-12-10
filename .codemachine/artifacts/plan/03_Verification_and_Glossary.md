<!-- anchor: verification-and-integration-strategy -->
## 6. Verification and Integration Strategy

*   **Testing Levels:**
    - Unit: Vitest suites across `libs/shared`, `libs/ui`, `libs/supabase` verifying DTO validation, hooks, UI state machines; mandated in tasks I2.T9, I3.T6, I4.T10.
    - Integration: Supabase pgTAP + impersonation scripts (I2.T10), Playwright flows (I2.T9, I3.T10, I4.T10, I5.T11) covering PrepChef, Admin, Display, Notifications; load/chaos tests (I5.T1) simulate concurrency + realtime drops.
    - E2E: Release regression suite (I5.T11) spans PrepChef + Admin + Display, run before each release; includes kiosk offline, notification storms, role change flows.
    - Accessibility: Storybook axe checks, manual audits (I5.T3) for mobile/kiosk; ensures tokens maintain contrast + focus states.
*   **CI/CD:**
    - GitHub Actions pipelines from I1.T9 run lint ? typecheck ? unit tests ? Supabase CLI dry-run ? build; Chromatic + Playwright artifacts uploaded for review.
    - Monitor workflow (I4.T5) executes synthetic checks against `/tasks`, `/admin/events`, `/display`, `/api/health/realtime` and reports to observability dashboards.
    - Release guard workflow (I4.T11, I5.T4) enforces changesets, Doppler promotion, migration verification, feature flag audit before tagging/staging deployment; records audit trail.
    - Deployment uses Vercel preview/staging/production, Supabase migrations via CLI, Doppler for secrets; release checklist documented in `docs/ops/release_checklist.md`.
*   **Code Quality Gates:**
    - Lint (ESLint, Stylelint) + format enforced via Turbo tasks; failure blocks merge.
    - TS strict mode, no `any`, no default exports; path aliases validated via ESLint plugin.
    - Coverage thresholds (=80% libs, 100% critical flows) tracked in testing matrix (I3.T5, I4.T10, I5.T11).
    - Observability instrumentation required for new endpoints/components prior to merge (I3.T9), ensuring telemetry parity.
    - Feature flags documented + exposures tracked; no feature merges without spec + flag register update.
*   **Artifact Validation:**
    - PlantUML/Mermaid diagrams linted via CI using `plantuml`/`mmdc` CLI; failing render blocks PR.
    - OpenAPI spec validated with Spectral (I2.T1); JSON Schemas (display snapshot) validated via ajv tests (I4.T2).
    - Migration scripts checked with pgTAP + Supabase CLI diff (I1.T6, I2.T10) before applying.
    - Documentation anchors validated through manifest task (I5.T8); doc lint ensures headings + anchors align with plan manifest.
    - Playwright screenshot diffs stored for UI-critical surfaces; Chromatic ensures libs/ui components remain stable.

<!-- anchor: glossary -->
## 7. Glossary

1. **ADR:** Architecture Decision Record capturing context, choice, and consequences referenced in docs/adr.
2. **App Router:** Next.js routing paradigm enabling server components per app.
3. **Audit Log:** Supabase table recording entity, action, diff, actor_id for compliance + undo debugging.
4. **Doppler:** Secrets management platform providing environment-scoped runtime configs.
5. **Flagsmith:** Feature flag service gating heuristics, undo windows, kiosk fallbacks.
6. **Heuristic Engine:** Supabase function generating task combination suggestions with normalized units.
7. **PITR:** Point-In-Time Recovery setting on Supabase for database rollback.
8. **PrepChef:** Staff-facing PWA for realtime task execution.
9. **Realtime Snapshot:** Display payload conforming to `display_snapshot.schema.json` for kiosk offline mode.
10. **Undo Token:** Short-lived identifier allowing reversal of claim/complete actions; emitted by RPCs and tracked by notification service.
11. **Supabase Function:** Edge function executing heuristics, media processing, cron jobs, invoked via RPC or event triggers.
12. **Synthetic Monitor:** Automated script hitting key endpoints to validate uptime and data freshness.
13. **Turbo Repo:** Monorepo build orchestrator running lint/test/build tasks per package.
14. **Vitest/Playwright:** Testing stacks for unit/integration and e2e flows respectively.
15. **Observability Stack:** OpenTelemetry + log sink capturing metrics/events/traces for operations dashboards.
