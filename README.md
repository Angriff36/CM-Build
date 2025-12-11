# CaterKing Platform Monorepo

Turbo + pnpm workspace for the CaterKing multi-tenant kitchen operations suite. The repo hosts every Next.js surface, shared libraries, Supabase schema, and operational docs referenced in the blueprint set.

## Prerequisites

- Node.js 20.10+
- pnpm 10.16+ (managed via Corepack)
- Supabase CLI (`npm i -g supabase`) for local database + migrations
- Doppler CLI for secrets management (`brew install dopplerhq/cli/doppler` or download binary)
- Flagsmith account + API key for feature flag toggles
- Optional: GitHub CLI + Vercel CLI for deployments

Ensure you have Supabase, Doppler, and Flagsmith project access before attempting local auth or realtime features.

## Getting Started

```bash
pnpm install           # install and link all workspace packages
pnpm dev:prepchef      # Turbo-filtered dev server for the PrepChef app
pnpm lint              # runs turbo run lint across the graph
pnpm typecheck         # tsc in every package via Turbo
pnpm test              # vitest suites (placeholder today)
pnpm build             # next build + library builds via Turbo pipeline
```

- Use `turbo run lint --dry` to validate script wiring without executing linters end-to-end.
- Filter any command to a single package via `--filter <package>`.

## Toolchain Pins & Secrets

> Node 20.10+ and pnpm 10.16.1 are enforced via `package.json` engines/packageManager--keep Corepack enabled so every contributor runs the same versions.

- **Node.js**: Use v20.10.0 or newer (LTS) to align with Supabase CLI and Next.js 15 runtime guarantees.
- **pnpm**: Corepack will download pnpm `10.16.1`, matching the repo-wide `packageManager` pin for deterministic lockfiles.
- **Flagsmith placeholder config**: The single `FLAGS_API_KEY` env var is injected by Doppler; for now point it at the shared `prep.dev` environment until per-env configs are created.
- **Doppler**: `doppler run -- pnpm dev:prepchef` (or any pnpm command) loads Supabase/Flagsmith tokens without local `.env` files. Use Doppler projects `ck-dev`, `ck-stg`, `ck-prod` once templates land.

## Turbo Cache Workflow

Turbo stores cache artifacts in `.turbo/` and respects remote caching when configured. While features are stubbed, you can still validate the pipeline:

1. Run `turbo run lint --dry` after editing any package scripts to ensure Turbo can walk the dependency graph without executing heavyweight tasks.
2. Run `turbo run lint test build --filter=@caterkingapp/prepchef` (or a library package) to warm caches; reruns pull from `.turbo` so only changed files re-execute.
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

*   [Component Overview](./docs/diagrams/component_overview.puml): Visual breakdown of apps, shared libraries, Supabase services, and external infrastructure (PlantUML).

## Environment & Tooling Notes

1. Use Doppler to materialize local env files: `doppler run -- supabase start` once templates land.
2. Supabase service role + anon keys should be injected at runtime; never commit `.env` files.
3. Flagsmith SDK keys live alongside Supabase keys and should be scoped per environment.
4. The guardrails in the "Standard Kit" doc (docs/architecture/01_Blueprint_Foundation.md) dictate lint/type/test behaviors; keep Turbo tasks in sync with those expectations.

## Next Steps

- Flesh out Supabase schema + migrations under `supabase/migrations`.
- Add remaining apps (`caterking`, `admin-crm`, `display`) and shared libs.
- Document Doppler template + Github Actions workflows in `/docs` and `/tooling`.
