<!-- anchor: blueprint-foundation -->
# 01_Blueprint_Foundation.md

<!-- anchor: 1-0-project-scale-directives -->
### **1.0 Project Scale & Directives for Architects**

*   **Classification:** Large
*   **Rationale:** Multi-tenant real-time workflow across staff, managers, kiosks, and admin tooling requires coordinated Next.js apps, shared libraries, strict RLS, and Supabase realtime orchestration; the requirements span task automation, recipe knowledge, rich media, and operational governance beyond a typical MVP.
*   **Core Directive for Architects:** This is a **Large-scale** project. All downstream architecture MUST enforce high scalability, maintainability, and uncompromising Separation of Concerns; every decision shall anticipate future multi-location expansion, cross-platform clients, and rapid feature iteration without regressions.
*   **Key Scale Signals:**
    *   Multi-tenant isolation via RLS demands deterministic data models, company-scoped realtime channels, and zero shared mutable state between tenants.
    *   Concurrent mobile, kiosk, and desktop experiences require modular UI surfaces, shared domain contracts, and event-driven cache invalidation.
    *   Task consolidation heuristics and auto-scaling logic tie UI interactions to compute-heavy processes, necessitating boundary isolation for experimentation.
    *   Media management (images, videos, training content) raises storage, CDN, and transcoding pipelines that must not block task execution paths.
    *   Supabase realtime plus optimistic UI semantics mandate hardened conflict resolution strategies to avoid data divergence during peak prep windows.
    *   Expanding admin controls, auditability, and RBAC policies imply long-lived governance patterns and versioned schemas.
*   **Trajectory Alerts:**
    *   Future performance analytics and inventory features are out-of-scope yet influence current schema evolution; architects must allocate namespace capacity without implementing functionality.
    *   Scaling to multiple sites later will stress realtime fan-out, so channel naming and subscription budgets must be engineered now.
    *   Any assumption that React Native parity will be trivial is false; ensure UI primitives and hooks remain platform-neutral.
    *   Over-reliance on ad-hoc Supabase RPCs risks duplication; centralize stored procedure ownership in libs/supabase with typed exports only.
    *   Recipe media growth will pressure storage egress; plan for CDN-friendly caching headers and background encoding jobs from day one.
*   **Coordination Mandates:**
    *   Structural, Behavior, and Ops/DOCs architects must share a single terminology set for task lifecycle states, recipe artifacts, and role semantics.
    *   Shared libraries define the only allowable imports; any divergence triggers integration failure and should be prevented via lint rules.
    *   Feature work must ship behind environment-scoped flags with deterministic rollout plans and observability hooks.
    *   Every mutation path (UI, API, RPC) has to publish the same domain events and telemetry payloads to keep dashboards, wall displays, and admin flows aligned.
    *   Architectural narratives must be ready for Doppler-managed secrets and Vercel/Supabase deployment pipelines with zero local .env reliance.
    *   Edge runtimes and server components shall remain pure and deterministic; long-running operations belong in Supabase functions or background workers.
*   **Priority Outcomes for Architects:**
    *   Deliver a cohesive set of contracts so specialized architects can parallelize without merge conflicts or schema contention.
    *   Guarantee that task aggregation logic, media storage, and RBAC policies are testable in isolation with fixture data.
    *   Bake in resilience strategies (retry, idempotency tokens, conflict resolution) for all realtime mutations.
    *   Preserve performance budgets for mobile clients (low latency, minimal payloads, streaming lists) by enforcing API pagination and selective field projection.
    *   Document fallback behaviors for each client surface when realtime connectivity drops to ensure fail-closed semantics.
    *   Align on versioning approach for libs (semver + changesets) so that cross-app upgrades remain predictable.
*   **Scale-Ready Milestones:**
    *   Establish base Supabase schema, RLS policies, and generated types before any feature sprint begins to avoid contract churn mid-implementation.
    *   Deliver baseline realtime dashboards and kiosk display within first increments to validate channel conventions under load.
    *   Harden feature flag pipeline with staged environments plus telemetry instrumentation before enabling heuristic combinations for real users.
    *   Publish first integration-ready API spec and data dictionary so external partners or future inventory modules can hook in without rewrites.
*   **Non-Negotiable Guardrails:**
    *   No direct database access from app folders; all SQL passes through Supabase RPCs or generated queries.
    *   No bypassing RLS even for admin tooling; testing and fixtures must impersonate roles instead.
    *   No duplication of UI components or hooks inside apps; every shared primitive lives in libs and ships with tests.
    *   No environment-specific business logic baked into clients; decisions hinge on configs, flags, or contracts.
    *   No release occurs without documented rollback plan, including flag toggles, migration reversions, and user messaging.

---

<!-- anchor: 2-0-the-standard-kit -->
### **2.0 The "Standard Kit" (Mandatory Technology Stack)**

*   **Architectural Style:** Modular monolithic Turbo repo with clearly bounded contexts, leveraging Next.js App Router plus Supabase-managed backend services; no microservice fragmentation until multi-location throughput exceeds Supabase limits.
    *   All business logic resides inside typed domain modules under `libs/shared` or Supabase SQL functions; app folders only orchestrate composition.
    *   Edge-compatible routes must be pure and avoid stateful libraries outside approved adapters.
*   **Frontend:** Next.js 15 (App Router, React 18 Server Components), Tailwind + ShadCN via `@caterkingapp/ui`, React Query for client cache, TanStack Router patterns discouraged.
    *   Prep-focused clients (apps/prepchef, apps/caterking) must prioritize streaming server components for initial payloads, then hydrate React Query for mutations.
    *   Admin CRM and kiosk display share layout primitives but cannot fork design tokens; they consume the same design system exports.
    *   Progressive Web App remains phase-1 mobile target; React Native/Expo work must reuse state machines and hooks from shared packages without duplicating logic.
*   **Backend Language/Framework:** TypeScript-only backend via Next.js API routes (Edge or Node runtimes) supplemented by Supabase SQL/RPC and optional Supabase Edge Functions for compute-heavy heuristics.
    *   Node runtime APIs may wrap Supabase RPC calls but never contain inline SQL.
    *   Python-only work is restricted to `libs/rag` ingestion utilities and cannot bleed into task orchestration.
*   **Database(s):** Supabase Postgres as the system of record, JSONB for flexible recipe/method payloads, Postgres functions for mutations; optional Redis cache is deferred until verifiable latency issues appear.
    *   Row-Level Security is mandatory on every table with company_id scoping; migrations must include RLS test harness updates.
    *   Materialized views for wall display summaries may be introduced but must refresh via Supabase cron with throttled cadence.
*   **Cloud Platform:** Vercel hosts all Next.js apps and API routes; Supabase covers Postgres, Auth, Storage, Functions, and Realtime; Doppler manages secrets.
    *   Environments: development, staging, production with isolated Supabase projects and Doppler configs; no shared credentials.
    *   CDN configuration leverages Vercel Edge Network for static assets and Supabase Storage CDN for media; cache busting uses fingerprinted URLs.
*   **Containerization:** Docker images only for CI validation (pnpm, turbo, Supabase CLI); production Next.js hosts on Vercel-managed containers, Supabase-managed Postgres only.
    *   Local dev may spin Supabase via `supabase start` but must not diverge from production schema; seeding uses `supabase/seed`.
    *   No Kubernetes until multi-region scaling requires it; horizontal scaling occurs through Vercel deployments and Supabase vertical tiers.
*   **Messaging/Queues:** Supabase Realtime is the canonical pub/sub; Postgres NOTIFY/LISTEN powers fine-grained subscriptions, and background jobs rely on Supabase Functions or cron triggers.
    *   If future background workers are needed, adopt simple queue tables with status transitions rather than external brokers.
    *   Event payloads must include version, company_id, entity_type, and actor metadata for traceability.
*   **Dev Tooling & Workflow:** pnpm 8+, Turbo 2+, TypeScript strict mode; commits require lint, typecheck, and unit tests across touched packages via `turbo run lint test build --filter=...`.
    *   Changesets govern package version bumps for shared libs.
    *   Git hooks enforce no default exports, alias usage, and consistent path imports.
*   **CI/CD & Secrets:** GitHub Actions (or Vercel/GitHub integration) triggers Turbo pipelines; Doppler CLI injects secrets at build/deploy time; no plaintext secrets in repo or Vercel dashboard.
    *   Release channels: `main`→staging, tagged release→production; hotfixes require Doppler approval gates.
*   **Data Processing & Media:** Supabase Storage buckets partitioned per company; upload flows pass signed URLs with ACL enforced via policies.
    *   Media transcoding handled by Supabase Functions invoked post-upload; metadata persisted alongside tasks/recipes for deterministic playback.
    *   Thumbnail and preview assets stored with predictable suffixes for caching.
*   **State Management & Data Fetching:** React Query orchestrates client cache with suspense-friendly hooks while server components handle initial fetch via shared Supabase modules.
    *   Queries must return typed DTOs with minimal fields, relying on selectors to derive UI-friendly shapes.
    *   Mutations always call Supabase RPC wrappers that inject idempotency metadata and trigger optimistic cache updates.
    *   Realtime listeners hydrate React Query caches through centralized event handlers to prevent duplicated logic.
*   **Testing Stack:** Vitest for unit coverage, Playwright for end-to-end validation, and Storybook/Chromatic for visual regression on `libs/ui`.
    *   Shared libs require ≥80% statement coverage with Vitest before merge.
    *   Playwright suites run smoke flows (task claim, recipe view, admin edit) on every PR and nightly cron.
    *   Storybook stories double as accessibility regression gates for gloves-friendly components.
*   **Infrastructure as Code & Config:** Supabase CLI migrations plus Doppler templates define every environment; manual console edits are prohibited.
    *   Migrations live under `supabase/migrations` with timestamped folders and verification scripts.
    *   Doppler templates declare required secrets with descriptions; pipelines fail if secrets missing.
    *   Vercel project settings documented via `vercel.json` for headers and rewrites to keep config tracked.

---

<!-- anchor: 3-0-the-rulebook -->
### **3.0 The "Rulebook" (Cross-Cutting Concerns)**

*   **Feature Flag Strategy:** All net-new interactive functionality ships wrapped in client-side and server-side checks powered by Doppler-provisioned Flagsmith (default) or an equivalent library; flags are evaluated server-side for SSR paths and exposed to clients via typed context, with production defaults set to "off" until QA artifacts exist.
    *   Flag keys follow `scope.feature.variant` naming (e.g., `prep.task-combine.v2`); removal requires migration notes plus clean-up PR.
    *   Dark launches must emit telemetry for exposure, click-through, and error metrics.
*   **Observability (Logging, Metrics, Tracing):** Structured JSON logging (pino or console adapter) on server routes and Supabase Functions; browser logging limited to warn/error with redaction.
    *   Metrics exported via Vercel Edge Middleware-friendly endpoint and Supabase Functions using OpenTelemetry SDK; Prometheus-compatible format for future scraping.
    *   Distributed tracing spans across Next.js route handlers, Supabase RPC calls, and Realtime updates; trace IDs propagate via headers and database columns for audit.
*   **Security:** Supabase Auth is the sole identity provider; JWT claims embed company_id and role, consumed by RLS policies and Next.js middleware.
    *   All media uploads must use signed URLs scoped to company_id; server verifies MIME type and file size before handing off to Storage.
    *   Secrets never touch client bundles; environment variables flow through Doppler-managed runtime configs only.
    *   Dependency on TLS everywhere (Vercel defaults) plus HSTS for admin and kiosk surfaces.
*   **Access Control & Privacy:** Roles (staff, manager, event lead, owner) map to policy modules under `libs/shared/access`; UI surfaces cannot rely on client-side role filtering alone.
    *   Admin UX must include guard rails to prevent cross-company visibility even when super users operate multi-tenant dashboards.
    *   Audit logging for critical actions (task combination, recipe edits, role changes) is mandatory and must attach actor_id, timestamp, prior_value, new_value.
*   **Performance & Resilience:** Mobile clients target <150ms interaction latency for state changes; API responses >500ms trigger alerts.
    *   Mutations require idempotency keys (task_id + actor_id + operation) to survive double taps or flaky connectivity.
    *   Realtime subscriptions must auto-retry with exponential backoff and degrade gracefully to polling for essential views.
    *   Payloads for task dashboards limited to visible window + summary counts; use pagination, filters, and server-driven cursors.
*   **Data Lifecycle & Governance:** Every schema migration updates Supabase migration scripts, type generation, and seeds; down migrations must be tested.
    *   Recipe and method revisions store version_id and maintain history for rollback.
    *   PII (staff names, contact info) is limited; ensure compliance with data retention (delete upon company removal).
*   **Testing & Quality Gates:** Unit tests for shared domain logic, integration tests for RPC endpoints, visual regression tests for key UI flows (task dashboard, recipe drawer).
    *   Contract tests enforce API payloads between UI apps and libs; snapshot tests fail if DTOs change unexpectedly.
    *   Synthetic monitoring hits `/display` and `/admin/events` hourly to confirm realtime updates.
*   **Disaster Recovery & Backup:** Supabase PITR enabled; documented RTO/RPO (≤15 min data loss tolerance).
    *   Media bucket versioning on for 30 days; restore scripts scripted via Supabase CLI.
    *   Runbook for failover when realtime channel budget exceeded (throttle, partition, degrade features).
*   **Compliance & Auditability:** Maintain change logs for domain models; align with food safety record-keeping though formal certification not yet required.
    *   Logging retains 30 days hot, 180 days cold storage; GDPR/CCPA requests go through manual deletion scripts referencing company_id.
*   **Release Management & Change Control:** Semver tags map to release notes that capture migrations, flag states, and rollback levers.
    *   Canary releases deploy to staging watchers for 24 hours before production promotion unless hotfix.
    *   Change approval board (lead architect + ops) signs off on migrations touching RLS or tenant boundaries.
*   **Data Residency & Tenant Isolation:** Centralized Supabase hosting still enforces logical separation via company_id scoping, RLS, and namespacing.
    *   Backups/exports include tenant filters; cross-tenant analytics require aggregated, anonymized snapshots.
    *   Multi-company admins must switch contexts explicitly; blended dashboards are forbidden.
*   **Resilience Testing:** Chaos drills simulate realtime channel drops, Supabase failovers, and flag misconfigurations at least quarterly.
    *   Automated scripts toggle connectivity mid-test to confirm UI fallback flows.
    *   Post-drill reports feed Ops Docs for future runbooks.
*   **Knowledge Management:** Architecture decisions recorded in ADRs stored under `docs/architecture`; updates reference blueprint anchors.
    *   Every specialist architect submits ADR for boundary-changing decisions.
    *   ADRs reference feature flags, telemetry requirements, and rollback considerations.

---

<!-- anchor: 4-0-the-blueprint -->
### **4.0 The "Blueprint" (Core Components & Boundaries)**

*   **System Overview:** CaterKing operates as a Turbo-managed suite of Next.js applications sharing a typed Supabase backend; UIs compose server components with realtime subscriptions, while Supabase handles persistence, auth, storage, and low-latency event broadcasting so that staff, managers, and admin tools remain synchronized.
*   **Core Architectural Principle:** Separation of Concerns is enforced by funneling all domain logic into shared libraries and Supabase procedures; apps orchestrate, never duplicate, and each component interacts through explicit contracts so that updates to one boundary never require code edits in another, only contract bumps.
*   **Key Components/Services:**
    *   **apps/prepchef (Staff PWA):** Mobile-first Next.js app delivering task lists, claiming/completion flows, and recipe drawer overlays with offline-aware UI fallbacks.
        *   Consumes typed hooks from `libs/shared/tasks`; all realtime data flows through `useRealtimeChannel` adapter.
        *   Emits telemetry for every interaction plus feature-flag exposures.
    *   **apps/caterking (Lightweight Ops App):** Simplified view for smaller teams needing essential dashboards; shares UI primitives but restricts admin actions.
        *   Focuses on aggregated event view and quick task combination prompts.
    *   **apps/admin-crm (Manager/Admin Web):** Desktop interface for event planning, staff assignments, recipe/method CMS, and media uploads.
        *   Integrates drag/drop task assignment boards with optimistic mutation pipelines.
    *   **apps/display (Kiosk/Wall Mode):** Passive Next.js surface rendering aggregated statistics, statuses, and assignment boards in auto-refresh loops.
        *   Reads from summary endpoints/materialized views; no mutations allowed.
    *   **libs/ui (Design System):** Tailwind + ShadCN component library exporting atoms, molecules, templates; enforces gloves-friendly sizing and accessibility.
        *   Houses color tokens, typography scales, and responsive containers.
    *   **libs/shared (Domain Models & Utilities):** Type-safe DTOs, Zod validators, finite state machines for task lifecycle, and combinator logic for heuristics.
        *   Provides canonical enums for roles, statuses, units, and heuristics.
    *   **libs/supabase (Data Access Layer):** Generated types, query helpers, RLS-safe RPC wrappers, and idempotent mutation helpers.
        *   Owns Supabase client instantiation (browser/server) and caching hints.
    *   **supabase/sql (Database & RPC):** Schema migrations, triggers, RLS policies, stored procedures (`claim_task`, `complete_task`, `combine_tasks`), and cron tasks.
        *   Includes unit tests (pgTAP or equivalent) for RLS enforcement.
    *   **Supabase Realtime Channels:** Company-scoped channels (`company:{company_id}:{entity}`) broadcasting tasks, events, recipes, and audit logs.
        *   Names enforced by shared helper; unauthorized subscriptions rejected server-side.
    *   **Media Processing Pipeline:** Supabase Storage buckets, upload API routes, background functions for transcoding, metadata persistence in Postgres.
        *   Provides signed URL issuance, progress tracking, and cleanup jobs.
    *   **Feature Flag Service Integration:** Flagsmith SDK wrapper in shared libs plus server middleware to inject evaluated flags into React contexts.
        *   Controls phased rollout for heuristics, UI toggles, and experimental flows.
    *   **Observability Stack:** OpenTelemetry instrumentation, log shipping to provider (e.g., Logflare or Datadog), metrics endpoints, alerting rules.
        *   Tied into Doppler-managed API keys and Vercel cron jobs for health checks.
    *   **CI/CD Pipeline:** Turbo + pnpm tasks, Supabase migration verification, component storybook visual tests, artifact bundling for Vercel deploys.
        *   Blocks merges unless migrations, types, and lint pass.
    *   **Access Governance Module:** Policy definitions, audit log appender, admin guard rails for RBAC operations.
        *   Ensures UI block + backend enforcement occur simultaneously.
    *   **Task Aggregation Engine:** Heuristic matching service (Supabase function) that normalizes ingredients, units, and textual similarity to propose combinations.
        *   Exposes suggestion feeds and persists combined group metadata with traceability.
    *   **Notification & Undo Service:** Provides ephemeral toasts, global undo queue, and server acknowledgement to ensure state parity.
        *   Maintains short-lived cache for revert operations keyed by task + timestamp.
    *   **Testing & Fixture Suite:** Shared dataset builder, scenario scripts (single event, multi-event, heavy media), and integration harness.
        *   Required for Behavior Architect to validate concurrency.
    *   **Data Sync & Migration Toolkit:** Scripts and Supabase helpers for seeding, anonymization, and tenant-specific exports.
        *   Includes fixture packs for local dev and QA linked to company personas.
        *   Automates checksum validation post-migration.
    *   **Training Content Service:** Manages onboarding sequences, method playlists, and tutorial progression tracking.
        *   Ties into media pipeline for video gating and completion telemetry.
        *   Surfaces recommended methods contextually in prep apps.
    *   **Session Presence Tracker:** Tracks active devices, heartbeats, and focus views to inform wall displays and managers.
        *   Persists presence states per company/channel for occupancy analytics.
        *   Powers alerts when kiosks or tablets silently fail.
    *   **Notification Dispatcher (Future-ready):** Abstraction for push/email connectors, currently outputting in-app toasts but architected for expansion.
        *   Normalizes payload templates and priority levels.
        *   Hooks into feature flags to gate experimental channels.
    *   **Deployment Governance Suite:** Automation that couples turborepo status, Doppler configs, and Supabase migrations for repeatable releases.
        *   Validates migrations applied before Vercel promotion.
        *   Rolls back to previous deployment plus database snapshot on failure.
*   **Integration Scenarios:**
    *   Task dashboard ↔ Supabase RPC ↔ Realtime ensures fast claim/complete loops with idempotent tokens.
    *   Recipe drawer pulls from shared data service plus media pipeline, streaming instructions before full hydration.
    *   Admin CRM triggers stored procedures for bulk staff assignment, pushing summary events to display app.
    *   Feature flag service toggles heuristics, instrumented through observability stack for safe rollouts.
*   **Data Flow Highlights:**
    *   User interaction → Next.js server action → Supabase RPC → Realtime broadcast → React Query cache update.
    *   Media upload → signed URL issuance → storage write → function-based transcoding → metadata persist → UI refresh via realtime.
    *   Task combination suggestion → heuristic engine → approved by manager → combined group stored → tasks broadcast to all channels.
    *   Audit-critical action → RPC writes audit log → analytics snapshot → operations dashboard.
*   **Failure Domains:**
    *   Realtime outages degrade to polling plus UI banners; no hidden retries without user awareness.
    *   Supabase storage failures trigger queued uploads with exponential backoff and alerting via observability stack.
    *   Feature flag service downtime defaults to conservative (flag off) state with fallback logic documented.
*   **Boundary Considerations:**
    *   UI apps communicate only via shared packages; cross-app dependencies are forbidden.
    *   RPC layer serves as the contraction point between UI and data; each function documented with contract tests.
    *   Kiosk display draws from summary tables to protect realtime budgets.
    *   Flag service and observability wrappers are consumable by all components but configured centrally.

---

<!-- anchor: 5-0-the-contract -->
### **5.0 The "Contract" (API & Data Definitions)**

*   **Primary API Style:** RESTful JSON APIs exposed through Next.js route handlers, described via OpenAPI definitions stored in repo; all mutations ultimately call Supabase RPCs, and websockets (Supabase Realtime) mirror state changes.
*   **Data Model - Core Entities:**
    *   **Company:** `id`, `name`, `timezone`, `settings(jsonb)`, `created_at`.
        *   Contract Notes: company_id required on every child table; deletion cascades triggered via Supabase function with audit log capture.
    *   **User:** `id`, `company_id`, `role`, `display_name`, `avatar_url`, `contact_info(jsonb)`, `status`.
        *   Contract Notes: role is enum (staff|manager|event_lead|owner); derived claims appear in JWT and `libs/shared/access`.
    *   **Event:** `id`, `company_id`, `name`, `scheduled_at`, `location`, `notes`, `status`.
        *   Contract Notes: tasks reference event_id; status transitions limited to scheduled|active|complete|archived.
    *   **Task:** `id`, `company_id`, `event_id`, `name`, `quantity`, `unit`, `status`, `priority`, `assigned_user_id`, `combined_group_id`, `instructions_ref`, `undo_token`.
        *   Contract Notes: statuses (available|claimed|in_progress|completed); optimistic updates require server timestamp to reconcile.
    *   **CombinedTaskGroup:** `id`, `company_id`, `base_task_ids(jsonb)`, `aggregated_quantity`, `unit`, `heuristic_metadata(jsonb)`, `approved_by_user_id`.
        *   Contract Notes: groups stay immutable post-approval; decompose via explicit API only.
    *   **Recipe:** `id`, `company_id`, `name`, `ingredients(jsonb)`, `steps(jsonb)`, `media_urls(jsonb)`, `version`, `tags`, `allergen_flags`.
        *   Contract Notes: version increments on edit; clients request specific version_id for reproducibility.
    *   **MethodDocument:** `id`, `company_id`, `title`, `steps(jsonb)`, `video_refs(jsonb)`, `skill_level`, `last_reviewed_by`.
        *   Contract Notes: accessible offline? no; but UI caches step data per session.
    *   **MediaAsset:** `id`, `company_id`, `url`, `type`, `thumbnail_url`, `duration`, `checksum`, `storage_path`.
        *   Contract Notes: uploads tracked with status (pending|processing|ready|failed); deletion enforces ownership.
    *   **RoleAssignment:** `id`, `company_id`, `user_id`, `role`, `granted_by`, `granted_at`, `revoked_at`.
        *   Contract Notes: ensures auditable RBAC changes; UI reads aggregated view but writes only through RPC.
    *   **AuditLog:** `id`, `company_id`, `user_id`, `entity_type`, `entity_id`, `action`, `diff(jsonb)`, `created_at`.
        *   Contract Notes: append-only; required for regulatory reviews and debugging.
    *   **NotificationPreference:** `id`, `company_id`, `user_id`, `channel`, `enabled`, `quiet_hours`.
        *   Contract Notes: channel options limited to push|email|sms (future) but schema ready.
    *   **RealtimeSubscription:** `id`, `company_id`, `channel_name`, `last_seen_event_id`, `device_id`.
        *   Contract Notes: helps track kiosk or tablet health; Behavior Architect may use for heartbeat logic.
    *   **TaskComment:** `id`, `task_id`, `company_id`, `author_id`, `body`, `created_at`.
        *   Contract Notes: limited to short operational notes; sanitized for display in UI.
    *   **Station:** `id`, `company_id`, `name`, `type`, `sort_order`.
        *   Contract Notes: tasks reference station_id for filtering, routing, and kiosk grouping.
    *   **StaffSchedule:** `id`, `company_id`, `user_id`, `event_id`, `shift_start`, `shift_end`, `role_override`.
        *   Contract Notes: informs workload balancing, staffing heatmaps, and future analytics.
    *   **DisplaySnapshot:** `id`, `company_id`, `payload(jsonb)`, `captured_at`.
        *   Contract Notes: caches kiosk data for offline diagnostics and compliance review.
*   **API Endpoints (Representative Contracts):**
    *   `GET /api/tasks?event_id=&status=` returns paginated task summary objects with embedded recipe snippet references.
    *   `POST /api/tasks/:id/claim` expects `actor_id`, optional `note`; response includes server timestamp, optimistic tokens, and realtime channel hints.
    *   `POST /api/tasks/combine` accepts array of task_ids plus normalization metadata; returns combined group object or reason for rejection.
    *   `GET /api/events` filters by date range; includes aggregated status counts for dashboard badges.
    *   `POST /api/recipes` uploads metadata and requests signed URLs for media attachments; all writes must include version comment.
    *   `GET /api/methods/:id` streams JSON chunked response for large procedural docs to keep UI responsive.
    *   `POST /api/users/role` triggers RoleAssignment creation and emits audit log entry.
    *   `GET /api/display/summary` serves kiosk digest aggregated from materialized views; clients poll every 15 seconds if realtime not available.
    *   `PUT /api/recipes/:id` enforces optimistic locking via `version` field and returns diff summary for audit logs.
    *   `POST /api/media/sign` issues upload URLs and policy tokens scoped to company_id and MIME type.
    *   `GET /api/methods` supports pagination, tag filtering, and search for training assets.
    *   `POST /api/events` creates event skeleton plus optional default task templates seeded from recipes.
*   **Realtime Contracts:** Channel naming `company:{company_id}:{entity}`; payload schema includes `type`, `entity_id`, `data`, `previous`, `actor`, `timestamp`, `source`.
    *   Clients subscribe only to allowed entity sets based on role; unauthorized subscription attempts log security events.
    *   Undo actions rely on `undo_token` echoed via realtime to ensure other clients can reinstate state.
*   **DTO Validation Rules:** Zod schemas in `libs/shared` define every payload, and both UI and API enforce them.
    *   Server rejects requests failing schema validation before hitting database to minimize attack surface.
    *   Responses include `schema_version` fields to enable client compatibility checks.
    *   Breaking schema changes require version bump and migration script for cached/offline data.
*   **Versioning & Compatibility:** Domain contracts follow semver; major bumps need migration guides and release notes mapped to new capabilities.
    *   Feature flags guard new DTO fields until all clients upgrade.
    *   Realtime payloads include compatibility metadata so older clients safely ignore unknown fields.
*   **Data Migration Protocols:** Each migration PR documents forward/backward steps, RLS adjustments, and validation queries.
    *   Dry runs execute via staging Supabase project snapshots with automated comparison.
    *   Post-migration verification compares row counts, indexes, and policy state for drift detection.
    *   Rollback scripts stored alongside forward migrations for immediate use.

---

<!-- anchor: 6-0-the-safety-net -->
### **6.0 The "Safety Net" (Ambiguities & Assumptions)**

*   **Identified Ambiguities:**
    *   Scope of heuristic similarity tuning (simple fuzzy text vs. ML-driven) is unspecified.
    *   Wall-mounted display refresh cadence and allowable latency windows are not defined.
    *   Media upload size limits, codec expectations, and retention policies remain vague.
    *   Recipe/method editing workflow for multi-user scenarios lacks guidance (locking, drafts, approvals).
    *   Undo duration and scope (task-only vs. cross-entity) are not described.
    *   Notification channels (push, SMS, email) are hinted but not formally prioritized.
    *   Future analytics/inventory integrations have no interface definition yet may influence schema.
    *   Staffing/role provisioning flows (invites, SSO) lack clarity.
    *   Offline support is declared out-of-scope, but degraded behavior expectations need confirmation.
    *   Third-party integrations (calendars, procurement) are absent but may surface soon.
*   **Governing Assumptions:**
    *   Similarity engine stays heuristic-based for MVP, relying on deterministic fuzzy text + ingredient normalization; Behavior Architect should expose tuning parameters via feature flags.
    *   Wall display tolerates up to 15-second staleness, relying on realtime when possible and falling back to short polling; Ops Architect must codify this SLA.
    *   Media uploads capped at 500MB per asset with best-effort transcoding; Owner role approves retention beyond 1 year.
    *   Recipe and method edits use optimistic locking with version bump + change summary; no live co-editing for MVP.
    *   Undo applies to task completion/claim actions only, within 5 minutes or before conflicting change; other entities require manual revert workflows.
    *   Notifications default to in-app toasts and future push; SMS/email connectors stubbed but not implemented.
    *   Analytics/inventory placeholders occupy schema namespace but remain inactive; Structural Architect ensures columns flagged as future_use.
    *   User onboarding uses email invite flow via Supabase Auth magic links; SSO deferred.
    *   Offline mode remains unsupported; clients display fail-closed banners and prevent state changes until connectivity restored.
    *   External integrations will connect via future service modules; current architecture must expose integration-ready APIs but not implement adapters.
    *   Compliance requirements align with standard kitchen operations; no HIPAA/FDA-grade logging beyond described audit logs unless new directive arrives.
*   **Risk Watchlist:**
    *   Realtime channel saturation when >5 concurrent events occurs; monitor connection counts and throttle as needed.
    *   Supabase storage costs could spike with unbounded media; set budgets and alerts early.
    *   Task combination heuristics may introduce errors if ingredients mislabeled; provide manual override UI and audit tracking.
    *   Role misconfiguration might expose cross-company data; enforce double-confirmation flows for role changes.
    *   Feature flag drift between clients and server could desync experiences; track exposures via telemetry and block mismatched versions.
*   **Fallback Directives:**
    *   When Supabase realtime fails, switch to 10-second polling plus offline banner messaging without user prompts.
    *   If media uploads stall, queue tasks and notify managers via admin alerts to reassign work.
    *   Should recipe drawer fail to load, present condensed instructions from cached data with warning banner.
    *   For Doppler outage, block deployments and lock environment modifications until service restored.
*   **Decision Log Requirements:**
    *   Each ambiguity resolution is logged referencing this blueprint anchor plus ADR ID for traceability.
    *   Specialized architects append impact analysis and testing plan before implementing assumption-based work.
    *   Ops team maintains changelog of policy updates tied to release tags for audit trails.

