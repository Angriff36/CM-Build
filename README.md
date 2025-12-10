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
pnpm dev --filter @caterkingapp/prepchef
pnpm lint              # runs turbo run lint across the graph
pnpm typecheck         # tsc in every package via Turbo
pnpm test              # vitest suites (placeholder today)
pnpm build             # next build + library builds via Turbo pipeline
```

- Use `turbo run lint --dry` to validate script wiring without executing linters end-to-end.
- Filter any command to a single package via `--filter <package>`.

## Workspace Layout

```
apps/          # Next.js applications (PrepChef bootstrapped, more coming)
libs/          # Shared UI + domain modules (ui scaffolded)
supabase/      # Schema, migrations, seeds (to be populated in I1.T2+)
api/           # OpenAPI specs + lint config
docs/          # Architecture, ADRs, diagrams
tests/         # Playwright + smoke fixtures (future)
tooling/       # CLI scripts, GitHub workflows

## Architecture

*   [Component Overview](./docs/diagrams/component_overview.puml): Visual breakdown of apps, shared libraries, Supabase services, and external infrastructure (PlantUML).

## Environment & Tooling Notes

1. Use Doppler to materialize local env files: `doppler run -- supabase start` once templates land.
2. Supabase service role + anon keys should be injected at runtime; never commit `.env` files.
3. Flagsmith SDK keys live alongside Supabase keys and should be scoped per environment.
4. Adhere to the "Standard Kit" doc for TypeScript strictness, Turbo commands, and lint gates.

## Next Steps

- Flesh out Supabase schema + migrations under `supabase/migrations`.
- Add remaining apps (`caterking`, `admin-crm`, `display`) and shared libs.
- Document Doppler template + Github Actions workflows in `/docs` and `/tooling`.
```
