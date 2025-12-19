# CaterKing Platform Monorepo

Turbo + pnpm workspace for the CaterKing multi-tenant kitchen operations suite. The repo hosts every Next.js surface, shared libraries, Supabase schema, and operational docs referenced in the blueprint set.

## Project Summary

CaterKing is a comprehensive multi-tenant kitchen operations platform designed to streamline task management, recipe handling, and real-time coordination across PrepChef mobile apps, Admin CRM dashboards, and wall-mounted display kiosks. Built with Next.js, Supabase, and modern web technologies, it enables efficient kitchen workflows through intelligent task matching, media-rich recipes, and automated observability.

Key features include:

- Real-time task assignment and completion tracking
- Recipe management with media uploads and scaling
- Multi-tenant architecture with row-level security
- Progressive Web App capabilities for offline operation
- Automated CI/CD with feature flag rollouts
- Comprehensive monitoring and rollback procedures

## Prerequisites

- Node.js 20.10+
- pnpm 10.16+ (managed via Corepack)
- Supabase CLI (`npm i -g supabase`) for local database + migrations
- Doppler CLI for secrets management (`brew install dopplerhq/cli/doppler` or download binary)
- Flagsmith account + API key for feature flag toggles
- Optional: GitHub CLI + Vercel CLI for deployments

Ensure you have Supabase, Doppler, and Flagsmith project access before attempting local auth or realtime features.

## Quickstart Guide

### Local Development Setup

1. **Clone and Install Dependencies**

   ```bash
   git clone <repository-url>
   cd caterking-platform
   pnpm install
   ```

2. **Configure Environment Secrets**

   ```bash
   # Set up Doppler for secrets management
   doppler run -- pnpm dev:prepchef
   ```

3. **Start Development Server**

   ```bash
   pnpm dev:prepchef      # PrepChef app
   pnpm dev:admin-crm     # Admin CRM (when available)
   pnpm dev:display       # Display kiosk (when available)
   ```

4. **Run Quality Checks**
   ```bash
   pnpm lint              # ESLint across workspace
   pnpm typecheck         # TypeScript validation
   pnpm test              # Unit tests with Vitest
   pnpm build             # Production build verification
   ```

### Development Workflow

- Use `turbo run lint --dry` to validate script wiring without executing linters.
- Filter commands to specific packages: `pnpm build --filter=@codemachine/prepchef`
- Access Storybook for component development: `pnpm storybook`
- Run E2E tests: `pnpm test:e2e`

## Toolchain Pins & Secrets

> Node 20.10+ and pnpm 10.16.1 are enforced via `package.json` engines/packageManager--keep Corepack enabled so every contributor runs the same versions.

- **Node.js**: Use v20.10.0 or newer (LTS) to align with Supabase CLI and Next.js 15 runtime guarantees.
- **pnpm**: Corepack will download pnpm `10.16.1`, matching the repo-wide `packageManager` pin for deterministic lockfiles.
- **Flagsmith placeholder config**: The single `FLAGS_API_KEY` env var is injected by Doppler; for now point it at the shared `prep.dev` environment until per-env configs are created.
- **Doppler**: `doppler run -- pnpm dev:prepchef` (or any pnpm command) loads Supabase/Flagsmith tokens without local `.env` files. Use Doppler projects `ck-dev`, `ck-stg`, `ck-prod` once templates land.

## Turbo Cache Workflow

Turbo stores cache artifacts in `.turbo/` and respects remote caching when configured. While features are stubbed, you can still validate the pipeline:

1. Run `turbo run lint --dry` after editing any package scripts to ensure Turbo can walk the dependency graph without executing heavyweight tasks.
2. Run `turbo run lint test build --filter=@codemachine/prepchef` (or a library package) to warm caches; reruns pull from `.turbo` so only changed files re-execute.
3. If caches drift, nuke `.turbo` and rerun the commands--never commit `.turbo` artifacts.

## Workspace Layout

```
apps/          # Next.js applications (PrepChef bootstrapped, more coming)
libs/          # Shared UI + domain modules (ui scaffolded)
supabase/      # Schema, migrations, seeds (to be populated in I1.T2+)
api/           # OpenAPI specs + lint config
docs/          # Architecture, ADRs, diagrams
tests/         # Playwright + smoke fixtures (future)
tooling/       # CLI scripts, GitHub workflows
```

## Architecture

- [Component Overview](./docs/diagrams/component_overview.puml): Visual breakdown of apps, shared libraries, Supabase services, and external infrastructure (PlantUML).

## Environment & Tooling Notes

1. Use Doppler to materialize local env files: `doppler run -- supabase start` once templates land.
2. Supabase service role + anon keys should be injected at runtime; never commit `.env` files.
3. Flagsmith SDK keys live alongside Supabase keys and should be scoped per environment.
4. The guardrails in the "Standard Kit" doc (docs/architecture/01_Blueprint_Foundation.md) dictate lint/type/test behaviors; keep Turbo tasks in sync with those expectations.

## Release Timeline

### Iteration 1 (Foundation) - Completed

- Monorepo setup with Turbo and pnpm workspaces
- Supabase database schema with multi-tenant tables and RLS policies
- Shared UI library with design system components
- Core architecture diagrams (Component, ERD, Context)

### Iteration 2 (Task Management) - Completed

- Task management APIs and real-time updates
- PrepChef app task list UI components
- Basic authentication and role-based access
- Sequence diagrams for critical flows

### Iteration 3 (Recipe & Media) - Completed

- Recipe data models and admin CMS interfaces
- Media upload functionality with Supabase Storage
- Wall-mounted display application
- Deployment diagram and infrastructure docs

### Iteration 4 (Intelligence & UX) - Completed

- Task similarity heuristic matching
- Advanced filtering and search
- Undo functionality for operations
- Presence tracking and device monitoring

### Iteration 5 (Production Readiness) - In Progress

- Comprehensive testing suite implementation
- Performance optimization and caching
- Final UI polish and accessibility improvements
- Production deployment pipeline and monitoring
- Documentation finalization and stakeholder training

## Next Steps

- Complete Iteration 5 production readiness tasks
- Establish production monitoring and alerting
- Conduct stakeholder training sessions
- Execute production deployment and validation
