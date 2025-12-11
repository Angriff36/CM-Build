<!-- anchor: verification-and-integration-strategy -->
## 5. Verification and Integration Strategy

*   **Testing Levels:**
    - Unit: Vitest suites cover shared DTOs, hooks, utilities, Supabase RPC wrappers (`libs/shared`, `libs/supabase`), media pipeline helpers, and heuristics calculations, targeting >=80% coverage.
    - Integration: Supabase pgTAP exercises schema + RLS; Next.js API handlers tested via supertest; Supabase Edge Functions include k6/perf checks; React Query hooks verified against mocked Supabase client.
    - End-to-End: Playwright suites span PrepChef (tasks, recipe drawer, combine), Admin CRM (board, recipes, playlists), and Display (offline fallback), including chaos helper toggling realtime.
    - Performance/Resilience: k6/perf scripts run under load, resilience drills simulate realtime outage, Supabase restart, media backlog, and display offline.
*   **CI/CD Expectations:**
    - GitHub Actions pipeline executes pnpm install -> turbo lint/test/build -> Supabase lint/tests -> Storybook/Chromatic -> Playwright (selective on PR, full on release) -> Spectral OpenAPI lint -> Deploy preview gating.
    - Nightly workflows run impersonation tests, contract suite, perf smoke, automation backlog status updates, and environment sync dry-run.
    - Release pipeline references `docs/operations/release_runbook.md`, toggling Flagsmith gating, running migrations, verifying observability dashboards.
*   **Quality Gates:**
    - Lint (ESLint, Stylelint, Markdown) must pass with zero warnings; TypeScript strict errors blocked.
    - Vitest coverage enforced (>=80% libs/shared + libs/supabase, >=70% libs/ui), Chromatic diff approval required for UI changes.
    - pgTAP suite ensures RLS + policy integrity; failing tests block merges; automation surfaces failures in Slack.
    - Contract tests ensure API responses match OpenAPI spec; schema_version increments accompany breaking changes.
*   **Artifact Validation:**
    - PlantUML/Mermaid diagrams linted via CI script; `docs/diagrams/diagram_index.md` cross-checked against spec list.
    - OpenAPI spec validated with Spectral + generated client sample; docs reference iteration ID for traceability.
    - Runbooks/training docs anchored with references to blueprint/plan anchors; plan manifest enumerates all anchors for agents.
    - Media pipeline validated by uploading sample assets through CLI and verifying statuses/log entries.
*   **Release Readiness:**
    - Checklist covers README update, plan manifest generation, Doppler/Flagsmith sync, Supabase migrations applied, dashboards green, QA sign-off captured, resilience drills reported.
    - Rollback plan includes Supabase PITR coordinates, Vercel redeploy command, feature flag kill-switch instructions, communication templates from incident playbook.

<!-- anchor: glossary -->
## 6. Glossary

1. **ADR:** Architecture Decision Record documenting why/how a decision was made and linking to blueprint anchors.
2. **App Router:** Next.js routing paradigm using server components + nested layouts.
3. **Audit Log:** Postgres table tracking entity change history with diffs + actor metadata.
4. **Chromatic:** Visual regression service for Storybook snapshots in libs/ui.
5. **CI/CD Pipeline:** Turbo + GitHub Actions workflow described in `docs/operations/release_runbook.md` and diagrammed in `docs/diagrams/cicd_pipeline.mmd`.
6. **Combine Suggestion:** Heuristic-generated recommendation to merge similar prep tasks; requires manager approval and is gated by feature flag `prep.task-combine.v1`.
7. **Doppler Template:** Configuration describing environment secrets, owners, rotation cadence used by `scripts/env/sync_secrets.*`.
8. **Feature Flag Matrix:** Document enumerating Flagsmith toggles, defaults, telemetry metrics, and rollback plan.
9. **Heuristic Engine:** Supabase Edge Function analyzing tasks to normalize ingredients/units, generate TaskSimilaritySuggestions, and store metadata for review.
10. **OpenAPI Spec:** Canonical REST contract stored at `api/openapi.yaml`, linted via Spectral, consumed by UI + tests.
11. **PrepChef Drawer:** Sliding UI component showing recipes/methods/media inline within tasks, built in `apps/prepchef/components/recipe-drawer.tsx`.
12. **Realtime Adapter:** Hook in `libs/supabase/src/realtime/useRealtimeChannel.ts` wrapping Supabase channels with reconnection + polling fallback logic.
13. **RLS Catalog:** Living doc `docs/security/rls_policies.md` enumerating every row-level security policy, tests, impersonation commands.
14. **Undo Token:** Short-lived identifier returned from task mutations enabling rollback; stored in `undo_tokens` table and enforced in UI via Notification/Undo service.
15. **Wall Display SLA:** Contract stating kiosk data must be <15 seconds stale, enforced through heartbeat monitoring + fallback snapshots.