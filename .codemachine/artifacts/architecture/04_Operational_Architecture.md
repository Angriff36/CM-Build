<!-- anchor: 3-0-proposed-architecture -->
## 3. Proposed Architecture (Operational View)
The operational view extends the structural blueprint by specifying how the Turbo monorepo, Vercel deployments, and Supabase services are configured, monitored, and governed in day to day execution.
Every operational choice reinforces the multi-tenant isolation mandates, the realtime contract, and the gloves-friendly UX expectations that drive fast tap-first interactions.
The scope of this document includes routine environment management, deployment guardrails, telemetry hooks, security enforcement, release governance, incident response, and the PlantUML deployment blueprint.

<!-- anchor: 3-1-operating-context-and-principles -->
### 3.1 Operating Context and Principles
Operational excellence begins with harmonizing all applications under a single Turbo workspace so that build pipelines, dependencies, and shared libraries remain deterministic.
The prepchef and caterking PWAs demand P99 latency below 150 ms for mutations; the operational focus is therefore on caching, short Supabase RPC paths, and Vercel Edge streaming for list views.
Each environment (development, staging, production) uses its own Vercel project, Supabase project, and Doppler config so that secrets, RLS policies, and migrations can be promoted in a controlled order.
Release engineering enforces that no application folder can deploy unless Turbo validates lint, test, build, and Supabase migration checks, preventing drift between code and data layers.
Ops teams treat Supabase as the authoritative data plane, so all Next.js API routes remain stateless orchestrators and can be recycled across Vercel regions without losing in-flight sessions.
Feature flags managed via Doppler-provisioned Flagsmith default to OFF, and operators must document exposures in runbooks to avoid flag drift across surfaces.
Explicit tenant isolation is verified through synthetic requests impersonating each role after every deployment, ensuring RLS has not regressed.
Operational KPIs track realtime subscription counts, Supabase RPC latency, Vercel Edge cold start rates, storage egress, and wall-display staleness windows to guarantee SLA adherence.
The architecture assumes online-only clients; therefore, error surfaces must fail closed with actionable banners and prevent writes when connectivity or auth is lost.
All automation, including migrations, fixture loads, and telemetry checks, runs inside Docker images to shield developers from host discrepancies and standardize deterministic builds.

<!-- anchor: 3-1-1-environment-profiles -->
#### 3.1.1 Environment Profiles
Development environments use Supabase CLI emulation plus Doppler dev scopes, enabling engineers to test RLS policies locally with seeded fixtures that match production schemas.
Staging mirrors production tier sizing to test Supabase realtime fan-out, image uploads, and Vercel Edge caching interactions before customer exposure.
Production spans Vercel deployment regions close to primary kitchens, but Supabase remains in a single-region cluster with PITR enabled and failover procedures defined in the runbooks.
Each environment sets strict TTL for artifacts: staging databases auto-reset weekly via Supabase snapshots, removing stale tenant data and guaranteeing reproducible QA cycles.
Doppler manages unique values for SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY per environment; no environment variables are allowed to leak through Vercel UI overrides.

<!-- anchor: 3-1-2-operational-principles -->
#### 3.1.2 Operational Principles
Principle one is consistency: only shared libs may talk to Supabase, so operations can patch data access or telemetry once and propagate across apps.
Principle two is visibility: all runtime components emit structured telemetry to the observability stack, and dashboards stay aligned with the naming conventions defined in libs/shared.
Principle three is guardrailed change: migrations, flags, and edge functions ship with documented rollback steps, and Doppler gating enforces approvals for production toggles.
Principle four is resilience: operators prefer Idempotent RPC operations that can be retried safely when clients double tap or network fails mid-flight.
Principle five is security by design: Supabase RLS, Flagsmith gating, and Vercel Edge Middleware combine to reject unauthorized route access before business logic executes.

<!-- anchor: 3-2-tenant-and-data-flows -->
### 3.2 Tenant and Data Flows
Data flows originate from staff or manager interactions, traverse Next.js server actions, call Supabase RPCs, write Postgres rows, and fan out through realtime channels named company:{company_id}:{entity}.
Multi-tenant isolation is enforced end to end by injecting company_id from Supabase Auth JWT claims into every RPC wrapper within libs/supabase, making accidental cross-tenant reads impossible.
Operational processes include nightly verification scripts that compare stored company_id values across tables, validating there are no orphaned records or mismatched tenant references.
Task dashboards rely on selective projection; operations enforce that query builders request only relevant fields (status, assigned_user_id, combined_group_id) to keep payloads under real-time budgets.
Event-based data flows feed both interactive clients and wall displays; operators maintain materialized views refreshed by Supabase cron jobs that aggregate tasks per station, enabling kiosk screens to stay extremely light.
Media uploads follow an operational pipeline: Next.js issues signed Supabase Storage URLs, uploads stream directly to buckets, Supabase Functions trigger transcoding, and metadata records update with processing state.
Undo flows rely on short-lived tokens stored in Postgres; operations set TTL clean-up jobs so that expired undo tokens do not accumulate and degrade storage.
Audit log writes accompany every critical mutation, and operations maintain background jobs that archive older audit log entries into cold storage while preserving the last 30 days for rapid inspection.
Cross-tenant analytics remain out of scope, but the operational plan reserves schema namespaces and Supabase views to add anonymized rollups later without rewriting ingestion logic.

<!-- anchor: 3-2-1-realtime-management -->
#### 3.2.1 Realtime Management
Supabase realtime budgets per company_id constrain each tenant to a predictable number of channels so that no single customer can monopolize websocket resources.
Operations define channel conventions company:{company_id}:{tasks|events|recipes|display|audit} and use libs/shared helpers to enforce naming when clients subscribe, eliminating ad-hoc channel creation.
Health checks monitor websocket drop rates; if a threshold is exceeded, operations automatically toggle clients to 10-second polling and raise alerts via the observability platform.
Wall displays subscribe only to summary channels and degrade to a poller that reads /api/display/summary, keeping them within the SLA that allows 15 seconds of staleness.
Presence tracking writes heartbeat rows to Supabase; operations prune rows older than three minutes to prevent inaccurate online counts.

<!-- anchor: 3-2-2-data-quality -->
#### 3.2.2 Data Quality Controls
Operations maintain pgTAP suites verifying RLS, enum values, status transitions, and tenant scoping after each migration.
A nightly Supabase Function compares combined task groups with their originating tasks to ensure aggregated quantities remain consistent even after partial undo operations.
Recipes and methods include version metadata; operations enforce that editing flows increment version numbers and store change diffs in audit logs for compliance.
Telemetry-driven alerts flag when heuristics repeatedly suggest combinations that users reject, signaling data normalization issues needing review.

<!-- anchor: 3-3-runtime-and-release -->
### 3.3 Application Runtime & Release Engineering
Each Next.js app deploys to Vercel with `turbo run build --filter=<app>` gating the artifact; operations maintain caching for node_modules to keep build times predictable across CI and manual deploys.
Server Components fetch data via libs/supabase modules; operations audit these modules to ensure they stay Edge-compatible and avoid Node-specific APIs when running near Vercel edges.
React Query caches hydrate through bootstrap data passed by Server Components; the operations team validates hydration payload size during load tests to ensure mobile clients remain responsive over shaky Wi-Fi.
Turbo repo orchestrates shared library releases via Changesets; operations enforce semantic versioning and require release notes summarizing operational impact before merging to main.
CI pipelines (GitHub Actions) run lint, typecheck, unit tests, and Playwright smoke flows; operations treat a Playwright failure as a release blocker.
Supabase migrations run via Supabase CLI in CI before deploying; operations require both up and down migrations plus RLS tests.
Edge Functions used for heuristic matching, transcoding triggers, or admin automations are versioned alongside code and redeployed via Supabase CLI, ensuring no hidden state.
Operations define freeze windows where only hotfixes may deploy; release notes capture flag states, new RPC versions, and Supabase function revisions.
Admin CRM workflows include drag and drop assignment features; operations verify they stay Node runtime (non-edge) because they rely on libraries not Edge-safe.
Runtime configuration uses Doppler-injected secrets in both Vercel builds and Supabase functions; operations audit that no .env files exist locally or in the repository.

<!-- anchor: 3-3-1-build-pipelines -->
#### 3.3.1 Build Pipelines
Pipeline stage one checks formatting, lint, and tests via turbo run lint test.
Stage two builds shared libraries to ensure no breaking changes slip in; libs/ui builds also run Storybook to detect visual regressions.
Stage three runs `supabase db push --dry-run` to validate migrations, followed by `supabase gen types typescript` to refresh libs/supabase/src/types.ts, preventing runtime schema mismatches.
Stage four builds the target app, ensuring Next.js server actions compile cleanly for Edge or Node runtimes as designated by route.
Stage five packages artifacts and attaches metadata (git SHA, Changeset summary, Supabase schema version), giving operations traceability for rollbacks.
Successful pipeline runs emit events to the observability backend, marking the release candidate ready for Doppler approval.

<!-- anchor: 3-3-2-release-guardrails -->
#### 3.3.2 Release Guardrails
No release enters production unless staging environment has run for at least 24 hours without critical telemetry alerts.
Feature flags that gate heuristics must remain OFF in production until a runbook and rollback path exist; operations verify exposures through telemetry counters embedded in libs/shared/flags.
If migrations modify RLS, an ops-led change review occurs, and Supabase audit logs capture who applied migrations and at what time.
Rollback strategy couples Supabase PITR snapshot with Vercel redeploy to previous build; operations maintain scripts to reverse both quickly.
Hotfixes bypass freeze only with lead architect approval recorded in docs/architecture/adr.

<!-- anchor: 3-4-supabase-operations -->
### 3.4 Supabase Data Platform Operations
Supabase hosts Postgres, Auth, Storage, Realtime, and Functions; operations treat it as managed but still enforce schema discipline through migrations and automated tests.
PITR maintains 14-day retention, and weekly snapshot exports stored in secure buckets allow offline audits.
RLS policies live within migrations; operations maintain policy templates referencing company_id scopes and role checks.
Supabase Auth manages roles; operations configure custom JWT claims to include company_id, role, and feature flag exposures, enabling Next.js middleware to act without additional lookups.
Storage buckets follow `company-{id}-media` naming and enforce signed URL access; background jobs mark uploads as expired if transcoding fails.
Edge functions handle heuristics, transcodes, and cron tasks; operations package them via Docker to ensure consistent dependencies.
Supabase monitors (SQL-based) watch for slow queries; operations tune indexes or adjust queries in libs/shared when telemetry surfaces regressions.
Operations maintain integration with Supabase logs into centralized observability stack (Logflare or Datadog) for unified tracing against Next.js routes.

<!-- anchor: 3-4-1-migrations-and-seeds -->
#### 3.4.1 Migrations and Seeds
Each migration includes forward SQL, rollback SQL, and RLS updates; operations reject PRs missing down migrations or tests referencing the new structures.
Seeds under supabase/seed contain anonymized tenants for dev/staging; operations run them via Supabase CLI to guarantee base data for Playwright tests.
After migrations run, operations regenerate TypeScript types to sync libs/supabase; failing to do so blocks the PR.
Schema diffing scripts compare staging vs production to detect drift, and operations treat diff mismatches as severity-one issues.

<!-- anchor: 3-4-2-storage-and-media -->
#### 3.4.2 Storage and Media Handling
Media uploads rely on signed URLs valid for five minutes; operations log issuance to detect abuse or unusual spikes.
Supabase Functions trigger on object creation to queue transcoding jobs; operations monitor queue length and call out if backlog exceeds five minutes.
Thumbnail generation stores derived files with predictable suffixes (-thumb, -preview), enabling clients to prefetch low-res assets; operations ensure cleanup scripts also delete derived assets when originals are removed.
Retention policies keep media for one year by default; owner roles can request extension, and operations document such changes in Doppler notes.
Storage egress is capped via budgeting alerts; operations plan additional CDN caching on Vercel if repeated hotspots occur.

<!-- anchor: 3-5-observability -->
### 3.5 Observability, Telemetry, and Diagnostics
Operations deploy Pino-based structured logging in Next.js routes and Supabase functions, with log drains to a centralized store.
OpenTelemetry instrumentation wraps API routes, RPC calls, and realtime events; trace IDs propagate via headers and Postgres columns for audit chains.
Metrics include request latency, RPC latency, realtime subscription counts, storage queue depth, feature flag exposures, and undo success rates.
Alerting rules cover 5xx spikes, latency thresholds, websocket drop rates, storage backlog, and Supabase function errors; alerts route to incident channels with runbook links.
Dashboards display KPIs for each tenant, enabling account managers to view adoption health.
User-focused metrics include time to claim tasks, number of combined tasks, and recipe drawer latency; operations monitor these to ensure user stories stay satisfied.
Synthetic monitors hit `/display`, `/tasks`, and `/admin/events` hourly, verifying realtime updates and fallback banners; results log to the observability backend for comparisons over time.
Client logs limit to warn/error; operations enforce redaction of PII before shipping to telemetry.

<!-- anchor: 3-5-1-telemetry-pipelines -->
#### 3.5.1 Telemetry Pipelines
Next.js middleware adds trace headers, and libs/shared instrumentation utilities carry them into Supabase RPC requests.
Realtime events include metadata {version, actor_id, company_id, entity_type}, enabling downstream analytics to reconstruct flows.
Feature flag exposures log variant, tenant, role, and route context, giving operations visibility into experiments.
Undo toast interactions emit telemetry so operators can assess whether undo SLA meets the five-minute target.

<!-- anchor: 3-5-2-incident-diagnostics -->
#### 3.5.2 Incident Diagnostics
Ops maintain runbooks for log scrubbing, Supabase query inspection, and release artifact retrieval.
Incident templates capture timeline, impact, root cause, and follow-up actions referencing docs/architecture anchors.
Post-incident reviews update docs and backlog; operations enforce that lessons learned feed into new runbooks or automation tasks.

<!-- anchor: 3-6-security-and-governance -->
### 3.6 Security, Compliance, and Governance
Supabase Auth with email invites enforces identity, and Next.js middleware verifies JWT freshness on every request.
Row-Level Security ensures company-level isolation; operations test policies regularly via Supabase CLI impersonation flows.
Role mapping uses libs/shared/access enumerations; UI guard rails plus backend enforcement prevent privilege escalation.
Media uploads run MIME checks and file size validations server-side before issuing signed URLs; operations log every signed URL issuance.
Secrets remain in Doppler; operations audit access logs and rotate credentials quarterly.
TLS is mandatory; Vercel handles cert rotation, and Supabase endpoints use HTTPS everywhere.
Audit logs capture entity_type, action, diff, timestamp, actor_id, company_id; operations maintain indexes for fast filtering per incident.
Access reviews occur quarterly; owners confirm staff lists, and operations disable unused accounts.

<!-- anchor: 3-6-1-governance-practices -->
#### 3.6.1 Governance Practices
ADRs stored in docs/architecture track major operational decisions; each ADR references blueprint anchors for traceability.
Change approval board includes lead architect and operations lead; migrations touching RLS or tenancy require their sign-off.
Feature flags removal requires cleanup PR referencing telemetry proof that variant is stable.

<!-- anchor: 3-6-2-compliance-controls -->
#### 3.6.2 Compliance Controls
Audit data retains 30 days hot, 180 days cold; operations provide manual deletion scripts for GDPR/CCPA requests keyed by company_id.
Media bucket versioning keeps 30 days of history; restore procedures documented.

<!-- anchor: 3-7-resilience-and-runbooks -->
### 3.7 Resilience, Runbooks, and Operational Response
Realtime failure runbook instructs operations to notify users via in-app banner, switch clients to polling, and engage Supabase support if outage persists beyond 15 minutes.
Supabase outage runbook includes steps to pause deployments, capture telemetry, and assess whether to invoke PITR restore.
Storage backlog runbook details how to inspect transcoding queues, reprocess failed jobs, and reassign tasks referencing affected media.
Feature flag misconfiguration runbook clarifies how to revert flags to OFF via Doppler, validate exposures, and communicate to stakeholders.
Undo system failure runbook outlines how to disable undo toasts, log manual corrections, and run cleanup scripts.

<!-- anchor: 3-7-1-availability-targets -->
#### 3.7.1 Availability Targets
Prepchef and caterking apps aim for 99.5 percent monthly availability.
Admin CRM target is 99.0 percent because maintenance windows may affect advanced functions.
Wall display target is 99.9 percent for data freshness, defined as <15 seconds staleness in >99 percent of checks.

<!-- anchor: 3-7-2-runbook-catalog -->
#### 3.7.2 Runbook Catalog
Runbook 1: realtime outage.
Runbook 2: Supabase degraded query performance.
Runbook 3: Storage/transcoding backlog.
Runbook 4: Feature flag drift.
Runbook 5: Undo queue saturation.
Runbook 6: Audit log bloat.
Runbook 7: Deployment rollbacks.
Runbook 8: RLS regression detection.
Runbook 9: Device presence anomalies.
Runbook 10: Telemetry pipeline failure.

<!-- anchor: 3-8-cross-cutting-concerns -->
### 3.8 Cross-Cutting Concerns
*   **Authentication & Authorization:** Supabase Auth issues JWTs containing company_id and role claims; Next.js middleware validates tokens, injects claims into server actions, and libs/supabase enforces company_id scoping before calling RPCs. Role-based access control operates at Postgres via RLS matched to role enums, and UI guard rails in libs/shared/access prevent unauthorized actions from being initiated. Admin actions such as role changes or task combination approvals log to the audit log table with before/after diffs, allowing for forensic review.
*   **Logging & Monitoring:** Structured JSON logs generated via Pino adapters on API routes, server actions, and Supabase functions stream to the centralized observability stack. OpenTelemetry spans wrap request handlers, RPC calls, and realtime updates, enabling end-to-end tracing across Vercel and Supabase. Dashboards visualize latency, websocket drop rate, storage throughput, task throughput, and feature flag exposures. Alert policies route to the ops channel with runbook links when thresholds breach.
*   **Security Considerations:** HTTPS everywhere, HSTS for admin and kiosk surfaces, Doppler-secret-managed runtime values, signed media URLs, MIME validation, file size caps, and strict avoidance of inline SQL combine to create a hardened posture. RLS ensures all data operations are scoped by company_id and role while Supabase storage policies limit bucket access. Audit logs and quarterly access reviews ensure compliance readiness, and TLS termination remains under Vercel/Supabase-managed certificates.
*   **Scalability & Performance:** Vercel-managed stateless deployments scale horizontally by spinning up additional serverless instances, while Supabase handles vertical scaling of Postgres and Realtime. React Server Components stream data with minimal payloads, and React Query caches keep client interactions snappy. Task combination heuristics offload compute to Supabase functions, preventing Next.js runtimes from bottlenecking. Materialized views and selective projection keep wall displays performant even when tasks grow.
*   **Reliability & Availability:** PITR on Supabase, weekly snapshots, Vercel deployment rollbacks, realtime-to-polling fallbacks, and documented runbooks provide layered resilience. Health checks monitor websockets, RPC latency, and storage queues; when anomalies arise, operators follow runbooks that include user messaging templates and technical remediation steps. Feature flags default to safe states, ensuring partial deployments can be rolled back quickly if telemetry exposes regressions.

<!-- anchor: 3-9-deployment-view -->
### 3.9 Deployment View
Target operations leverage Vercel for frontend/API hosting and Supabase for database, auth, storage, realtime, and functions. Doppler injects secrets, GitHub Actions orchestrate builds, and Flagsmith controls feature rollout. The deployment view documents how apps and shared services map to infrastructure and how telemetry, storage, and feature flag tooling integrate.

<!-- anchor: 3-9-1-target-environment -->
#### 3.9.1 Target Environment
Cloud platform: Vercel for Next.js workloads, Supabase for managed Postgres/Auth/Storage/Realtime, Doppler for secrets, Flagsmith for feature flags, and Logflare/Datadog for observability as per blueprint mandates.
No Kubernetes is introduced; Docker usage remains limited to CI validation tasks and Supabase CLI interactions.
Environments remain segregated per blueprint: development, staging, production each with their own Supabase project and Doppler config.

<!-- anchor: 3-9-2-deployment-strategy -->
#### 3.9.2 Deployment Strategy
Turbo repo builds each app via pnpm and Next.js build steps, storing artifacts per environment.
GitHub Actions apply Supabase migrations and functions before Vercel deploys new builds; Doppler ensures secrets are in place prior to runtime.
Rollbacks redeploy previous Vercel builds, restore Supabase databases via PITR snapshots if needed, and disable experimental flags until the issue is isolated.
Flagsmith toggles heuristics gradually, with telemetry verifying exposure.
Supabase storage and functions deploy via CLI, referencing the same git SHA to guarantee traceability.

<!-- anchor: 3-9-3-deployment-diagram -->
#### 3.9.3 Deployment Diagram
~~~plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Deployment.puml
DeploymentNode(dev, "Developer Workstation", "Docker + pnpm") {
  Container(web, "Turbo Monorepo", "Next.js + pnpm", "Runs tests, lint, build")
}
DeploymentNode(ci, "GitHub Actions", "CI/CD") {
  Container(gh_build, "Turbo Pipeline", "Node 20", "Builds apps and shared libs")
  Container(gh_supabase, "Supabase CLI Jobs", "Node + Supabase CLI", "Applies migrations and deploys functions")
}
DeploymentNode(vercel, "Vercel", "Edge + Serverless", "Hosts Next.js Apps") {
  Container(prepchef, "apps/prepchef", "Next.js 15", "Staff PWA")
  Container(caterking, "apps/caterking", "Next.js 15", "Light Ops App")
  Container(admincrm, "apps/admin-crm", "Next.js 15", "Manager/Admin dashboard")
  Container(display, "apps/display", "Next.js 15", "Wall/Kiosk display")
  Container(middleware, "Edge Middleware", "Edge Runtime", "Auth + flag enforcement")
}
DeploymentNode(supabase, "Supabase Project", "Postgres/Auth/Storage/Realtime/Functions") {
  ContainerDb(db, "Postgres", "RLS Protected", "Multi-tenant data store")
  Container(auth, "Supabase Auth", "JWT", "Identity + session management")
  Container(storage, "Supabase Storage", "Buckets", "Media uploads and transcoding triggers")
  Container(rt, "Supabase Realtime", "Websocket", "Realtime channels per company")
  Container(fn, "Supabase Functions", "Edge Functions", "Heuristics, cron, transcoding orchestrations")
}
DeploymentNode(doppler, "Doppler", "Secrets Manager", "Injects secrets into Vercel and Supabase")
DeploymentNode(flagsmith, "Flagsmith", "Feature Flags", "Controls staged rollouts")
DeploymentNode(observability, "Observability Stack", "Logflare/Datadog", "Logs, metrics, tracing")
Rel(web, gh_build, "Push code")
Rel(gh_build, gh_supabase, "Trigger migrations + functions")
Rel(gh_build, vercel, "Deploy artifacts")
Rel(gh_supabase, supabase, "Apply migrations and functions")
Rel(vercel, supabase, "Supabase client calls, Auth, Storage, Realtime")
Rel(vercel, flagsmith, "Fetch feature flags via server middleware")
Rel(vercel, doppler, "Secrets injection at build/deploy")
Rel(vercel, observability, "Ship logs and traces")
Rel(supabase, observability, "Database/functions metrics & logs")
@enduml
~~~
<!-- anchor: 3-10-operational-checklists -->
### 3.10 Operational Checklists
The following checklists codify daily, weekly, and monthly operator routines so that no environment drifts from the standards established in the blueprint.
Each checklist item maps to an owner role, includes a verification method, and references relevant automation when available.

<!-- anchor: 3-10-1-daily-checklist -->
#### 3.10.1 Daily Checklist
1. Confirm all Vercel deployments are green across prepchef, caterking, admin-crm, and display.
2. Review Flagsmith dashboard for unexpected flag flips and compare exposures to telemetry counts.
3. Validate Supabase realtime subscription counts per tenant remain within expected ranges.
4. Check Doppler audit logs for unauthorized secret access attempts.
5. Inspect GitHub Actions pipelines triggered overnight for failures that require reruns.
6. Run synthetic monitors manually if automated runs missed the schedule.
7. Review storage backlog metrics to ensure transcoding jobs completed within five minutes.
8. Validate undo token cleanup job executed and confirm backlog is below 100 rows.
9. Confirm audit log ingestion is running and indexes remain under threshold.
10. Inspect Admin CRM route logs for unusual 4xx spikes indicating potential RLS regression.
11. Ensure `/display` kiosks responded to latest heartbeat and show current data.
12. Spot check Supabase RLS policies via CLI impersonation for staff and manager roles.
13. Verify Playwright smoke tests executed and stored artifacts for reference.
14. Observe Realtime drop rate dashboards for anomalies and record in daily log.
15. Confirm scheduled Supabase functions completed successfully via logs.
16. Check Supabase storage bucket growth to ensure budgets will not be exceeded this week.
17. Review flagged heuristics suggestions to detect emerging false positives.
18. Send summary of user-impacting incidents, even if zero, to leadership channel.
19. Validate open incidents have owners and next-review timestamps.
20. Confirm auto-scaling limits on Vercel remain consistent with expected traffic.
21. Inspect Next.js serverless logs for repeated warnings requiring backlog tickets.
22. Run short load test against `/api/tasks` to confirm latency remains under SLA.

<!-- anchor: 3-10-2-weekly-checklist -->
#### 3.10.2 Weekly Checklist
1. Rotate Supabase service role keys through Doppler and redeploy to refresh secrets.
2. Regenerate Supabase types to catch schema drift.
3. Review ADR backlog and ensure recent operational decisions are documented.
4. Conduct RLS regression tests with new fixture data.
5. Refresh staging database from production snapshot after anonymization.
6. Execute Supabase storage cleanup for expired media.
7. Evaluate telemetry to see if any feature flags can progress to next rollout stage.
8. Audit GitHub repository for default export or path alias violations.
9. Trigger chaos drill toggling realtime channels to polling to rehearse fallback flows.
10. Update runbooks with lessons from incidents or simulations.
11. Review Supabase function runtimes for budget overages.
12. Inspect Vercel Edge cold start metrics to detect regressions.
13. Validate Playwright coverage includes newly merged flows.
14. Perform manual review of combined task audit logs for anomalies.
15. Sample recipe revisions to ensure versioning and diffs recorded properly.
16. Update operations dashboards with any new KPIs requested by leadership.
17. Evaluate log storage costs and adjust retention windows if necessary.
18. Test manual PITR restoration against staging to confirm readiness.
19. Send weekly operational report summarizing KPIs, incidents, and planned improvements.
20. Review backlog of automation tasks and reprioritize based on incident data.

<!-- anchor: 3-10-3-monthly-checklist -->
#### 3.10.3 Monthly Checklist
1. Conduct full access review with business owners to remove inactive users.
2. Validate Doppler role assignments and rotate credentials per policy.
3. Run full Supabase schema diff comparing dev, staging, and production.
4. Refresh Supabase storage lifecycle rules and confirm TTL accuracy.
5. Audit feature flags, removing dead code paths via clean-up PRs.
6. Execute failover drill using Supabase PITR plus Vercel rollback.
7. Analyze telemetry for top latency offenders and plan optimizations.
8. Update chaos engineering scenarios and rehearse new ones.
9. Review compliance obligations (GDPR/CCPA) and confirm deletion workflows operate.
10. Inspect Supabase indexes and vacuum plans to prevent bloat.
11. Validate observability alert thresholds still match business expectations.
12. Conduct dependency review for libs/shared and libs/ui, planning updates.
13. Assess automation coverage to identify manual steps to eliminate next quarter.
14. Publish monthly operational summary to leadership and attach metrics.

<!-- anchor: 3-11-incident-communication -->
### 3.11 Incident Communication Templates
Clear communication reduces confusion during outages; templates include trigger criteria, initial announcement, ongoing updates, and resolution notes.

<!-- anchor: 3-11-1-initial-notice -->
#### 3.11.1 Initial Notice Template
Audience: internal stakeholders and support leads.
Channel: incident Slack channel + email summary.
Script: describe symptom, scope, affected surfaces (prepchef, caterking, admin, display), current status (investigating), and ETA for next update.
Include runbook link relevant to incident type and on-call owner contact.

<!-- anchor: 3-11-2-update-template -->
#### 3.11.2 Ongoing Update Template
Every 30 minutes provide update with current mitigation step, telemetry trend, user impact, and blockers.
Document actions taken, expected next steps, and requests for additional support.

<!-- anchor: 3-11-3-resolution-template -->
#### 3.11.3 Resolution Template
Summarize root cause, fix implemented, rollback status, feature flag adjustments, and verification steps completed.
Include follow-up items with owners and deadlines.

<!-- anchor: 3-11-4-postmortem-template -->
#### 3.11.4 Postmortem Template
Structure includes summary, impact, detection, response timeline, root cause analysis, corrective actions, and learning outcomes.
Tie each corrective action to backlog tickets and runbook updates.

<!-- anchor: 3-11-5-communication-checklist -->
#### 3.11.5 Communication Checklist
1. Assign communications lead separate from technical lead.
2. Track update cadence via reminders to avoid missed intervals.
3. Keep stakeholder list updated with contact info and timezone.
4. Record transcription of major announcements for post-incident review.
5. Share final summary with customer success teams for external messaging.

<!-- anchor: 3-12-operational-metrics -->
### 3.12 Operational Metrics Catalog
The metrics catalog enumerates the quantitative signals operators track to maintain SLAs and plan capacity. Each metric includes name, description, owner, target, and data source.
1. Metric 01: Request latency P95 for `/api/tasks`, target <200 ms, source Vercel logs.
2. Metric 02: Supabase RPC latency P95, target <150 ms, source Supabase metrics.
3. Metric 03: Realtime subscription count per tenant, target <200 connections, source Supabase heartbeat table.
4. Metric 04: Websocket drop rate percentage, target <0.5 percent, source observability alerts.
5. Metric 05: Undo success percentage, target >98 percent, source telemetry events.
6. Metric 06: Combined task suggestion acceptance rate, target >60 percent, source heuristics logs.
7. Metric 07: Storage transcoding queue depth, target <20 pending, source Supabase function logs.
8. Metric 08: Supabase function invocation error rate, target <1 percent.
9. Metric 09: Flagsmith API latency, target <100 ms.
10. Metric 10: Feature flag exposure count per tenant per day, monitored for anomalies.
11. Metric 11: Admin CRM drag-drop success latency, target <300 ms.
12. Metric 12: Recipe drawer open-to-first-byte time, target <250 ms.
13. Metric 13: Media upload success rate, target >99 percent.
14. Metric 14: Audit log ingestion lag, target <5 seconds.
15. Metric 15: Supabase storage growth per tenant per week, target under budget.
16. Metric 16: Vercel Edge cold start rate, target <5 percent of invocations.
17. Metric 17: Supabase PITR snapshot age, target <24 hours old.
18. Metric 18: Synthetic monitor success across `/display`, target 100 percent.
19. Metric 19: Playwright smoke suite pass rate, target 100 percent.
20. Metric 20: Build pipeline duration, target <10 minutes.
21. Metric 21: Database connection count per tenant, target <50.
22. Metric 22: Combined task rollback occurrences, target <5 per week.
23. Metric 23: Undo queue backlog, target <100 tokens.
24. Metric 24: Supabase index bloat percentage, target <20 percent.
25. Metric 25: Observability log ingestion lag, target <2 minutes.
26. Metric 26: On-call response time to P1 incidents, target <5 minutes.
27. Metric 27: Supabase cron job success rate, target 100 percent.
28. Metric 28: Doppler access anomalies, target zero unexpected accesses.
29. Metric 29: Flagsmith rollout stages completed on time, target 100 percent.
30. Metric 30: Device presence heartbeat freshness for kiosks, target <60 seconds.
31. Metric 31: Combined task heuristics CPU usage, target <60 percent of function limit.
32. Metric 32: Supabase storage egress per tenant, target within budget.
33. Metric 33: Admin CRM data export time, target <5 seconds.
34. Metric 34: Recipe version rollback requests, target <2 per month.
35. Metric 35: Supabase failover drills executed, target 1 per quarter.
36. Metric 36: Number of unreviewed ADRs, target zero backlog.
37. Metric 37: Runbooks updated after incidents, target 100 percent.
38. Metric 38: Observability dashboard data freshness, target <1 minute.
39. Metric 39: Feature flag drift incidents, target zero.
40. Metric 40: RLS regression tests coverage, target >95 percent.
41. Metric 41: Media retention exceptions per month, target <3.
42. Metric 42: Supabase storage cleanup jobs success, target 100 percent.
43. Metric 43: Supabase index creation failures, target zero.
44. Metric 44: GitHub Actions reruns per release, target <1.
45. Metric 45: Supabase CLI migration duration, target <2 minutes.
46. Metric 46: Observability alert false positives, target <10 percent.
47. Metric 47: Manual incident escalations beyond on-call, target <1 per month.
48. Metric 48: Time between incident detection and customer notification, target <10 minutes.
49. Metric 49: PITR restore test success rate, target 100 percent.
50. Metric 50: Percentage of automated checklist steps, target >70 percent.
51. Metric 51: Number of tasks per event processed via heuristics, track for scaling.
52. Metric 52: Recipe media transcoding success, target >99 percent.
53. Metric 53: Supabase storage signed URL issuance anomalies, target zero.
54. Metric 54: Next.js server action timeout rate, target <0.1 percent.
55. Metric 55: Auditor request response time, target <2 days.
56. Metric 56: Synthetic kiosk refresh staleness, target <15 seconds.
57. Metric 57: Admin upload throughput, target >10 MB/s.
58. Metric 58: Supabase row lock contention incidents, target zero.
59. Metric 59: Data export throughput for future integrations, track baseline.
60. Metric 60: Flagsmith SDK cache hit rate, target >95 percent.
61. Metric 61: Number of manual Supabase console interventions, target zero.
62. Metric 62: Supabase Storage pre-signed URL failure count, target <5 per month.
63. Metric 63: CLI-based impersonation tests executed, target 100 percent weekly.
64. Metric 64: Combined group audit log diff accuracy, target 100 percent.
65. Metric 65: Undo toast display latency, target <150 ms.
66. Metric 66: Staff device offline alerts, target zero unacknowledged.
67. Metric 67: Observability ingestion cost per tenant, track trending.
68. Metric 68: Media bucket versioning restores executed, target <1 per quarter but ready.
69. Metric 69: Cron job scheduling drift, target zero missed schedules.
70. Metric 70: Server component data fetch errors, target <0.1 percent.
71. Metric 71: Admin CRM role change approvals processed, track for compliance.
72. Metric 72: Supabase function deployment failures, target zero.
73. Metric 73: Schema drift detection delta, target zero differences.
74. Metric 74: Onboarding compliance tasks completed, target 100 percent.
75. Metric 75: API error budget consumption, stay within SLO agreements.
76. Metric 76: Observability backlog of unresolved alerts, target <5.
77. Metric 77: Supabase CPU utilization, target <70 percent sustained.
78. Metric 78: Post-incident action completion rate, target 100 percent.
79. Metric 79: Device presence false positives, target <1 percent.
80. Metric 80: Flagsmith SDK sync errors, target zero.
81. Metric 81: Supabase log retention compliance, track auto-expiration success.
82. Metric 82: Next.js build cache hit rate, target >80 percent.
83. Metric 83: Media CDN cache hit rate, target >90 percent once enabled.
84. Metric 84: Observability trace sampling percentage, maintain 100 percent for critical routes.
85. Metric 85: Database vacuum success logs, target 100 percent.
86. Metric 86: Lint/typecheck failure ratio, keep under 2 percent of runs.
87. Metric 87: Playwright flake rate, target <3 percent.
88. Metric 88: Supabase realtime channel creation errors, target zero.
89. Metric 89: Realtime heartbeat latency, target <1 second.
90. Metric 90: Task assignment failure reports from support, target <2 per month.
91. Metric 91: Data export request response time, target <4 hours.
92. Metric 92: Observability dashboard adoption, track active viewers weekly.
93. Metric 93: Admin CRM file upload error rate, target <1 percent.
94. Metric 94: Supabase row-level security test runtime, target <5 minutes.
95. Metric 95: Heuristic tuning cycle time, target monthly adjustments.
96. Metric 96: Recipe drawer offline cache usage, should remain near zero to confirm online assumption.
97. Metric 97: Staff device version compliance, target >95 percent on latest release.
98. Metric 98: CLI automation coverage percentage, target >80 percent of runbooks automated.
99. Metric 99: Observability alert acknowledgement time, target <3 minutes.
100. Metric 100: Disaster recovery drill completeness, target 100 percent of checklist executed.

<!-- anchor: 3-13-automation-backlog -->
### 3.13 Automation Backlog
1. Automate Supabase impersonation tests to run after each deployment.
2. Build GitHub Action to enforce Doppler secret references exist for new env vars.
3. Script detection of stale Flagsmith flags and open cleanup issues automatically.
4. Create CLI to snapshot runbook versions and highlight drift.
5. Automate Playwright environment seeding to reduce manual prep.
6. Codify kiosk heartbeat monitoring alerts into on-call rotation tooling.
7. Build Slack bot to acknowledge and track incident communication cadence.
8. Automate Supabase storage cleanup for orphaned thumbnails.
9. Integrate astronomical calendars for kitchen schedule load planning to predict spikes.
10. Add script to verify PlantUML deployment diagram stays updated with new apps.
11. Generate release note templates from Changesets automatically.
12. Automate staging refresh pipeline with anonymization verification.
13. Build telemetry-driven heuristics tuning report to inform Behavior Architect.
14. Automate RLS test scaffolding when new tables introduced.
15. Script to diff Supabase SQL definitions in PRs and flag missing RLS clauses.
16. Build CLI to check undone tasks older than SLA and raise alerts.
17. Automate log sampling configuration to adjust when volume spikes.
18. Develop PR bot summarizing operational impact of code changes.
19. Automate DR drill scheduling and result tracking.
20. Build Slack reminder for monthly access review tasks.

<!-- anchor: 3-14-operational-data-table -->
### 3.14 Operational Data Table
| Data Set | Description | Owner | Refresh Cadence | Notes |
| --- | --- | --- | --- | --- |
| Tenants Snapshot | Company-level stats, events, staff counts | Ops Analyst | Daily | Exported from Supabase view company_overview_v1 |
| Task Throughput | Tasks created/claimed/completed by hour | Ops + Behavior | Hourly | Derived from materialized view tasks_summary_mv |
| Recipe Version History | Latest version per recipe and changelog | Admin Lead | Daily | Pulled from recipes_version_view |
| Media Processing Queue | Pending vs complete counts | Media Lead | 10 min | Source Supabase function telemetry |
| Incident Log | Active incidents and status | Ops Lead | Real-time | Managed in docs/architecture incident board |
| Runbook Inventory | Document list with owner and update date | Ops PM | Weekly | Stored in docs/architecture/runbooks.md |
| Feature Flag Matrix | Flags by environment and status | Ops Lead | Daily | Synced from Flagsmith API |
| Realtime Capacity | Connection count per tenant and threshold | Ops Engineer | 5 min | Derived from presence table |
| Storage Budget Tracker | Bucket usage per tenant | Media Lead | Weekly | Data from Supabase storage metrics |
| Supabase Function Inventory | Function name, runtime, schedule | Ops Engineer | Weekly | Inventory ensures tests exist |
| Telemetry Coverage | Percent of routes with tracing | Observability Lead | Monthly | Source from instrumentation audit |
| Schema Drift Report | Differences between envs | Database Lead | Weekly | Auto-generated diff logs |
| Compliance Requests | PII deletion/export tickets | Compliance Officer | Monthly | Sourced from support tool |
| Automation Progress | Completed vs planned automation tasks | Ops PM | Biweekly | Visualized in operations dashboard |
| Device Health | Online/offline status of kiosks and tablets | Support Lead | 10 min | Derived from heartbeat table |
