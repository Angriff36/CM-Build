# PrepChef Staff PWA

PrepChef is the mobile-first experience used by kitchen staff to claim, execute, and complete prep tasks. It streams task lists via React Server Components, hydrates React Query for mutations, and logs telemetry for every interaction so managers can audit throughput.

## Daily Commands

```bash
pnpm dev:prepchef                         # Turbo-filtered Next.js dev server
pnpm lint --filter @caterkingapp/prepchef # next lint scoped to this app
pnpm test --filter @caterkingapp/prepchef # vitest placeholder suites
pnpm build --filter @caterkingapp/prepchef
```

- `pnpm dev:prepchef` proxies through `turbo run dev` so caches remain consistent with the rest of the workspace.
- Use Doppler + Flagsmith configs outlined in the repo root README before hitting Supabase auth flows.

## Import Guardrails

- Only import domain logic from `@caterkingapp/shared/*` or `@caterkingapp/supabase/*`; app folders orchestrate UI and never redeclare business rules.
- UI primitives (buttons, layouts, icons) must come from `@caterkingapp/ui`.
- Never reach into other apps or use deep relative paths that bypass shared packages--lint rules will block merges if this guardrail is broken.

## Entry Surface

- Next.js App Router under `apps/prepchef/app` is the single entry point. Route handlers must remain edge-compatible unless a feature explicitly requires Node runtime APIs.
- Feature flags for experimental flows should read from the shared Flagsmith context so exposures are tracked uniformly.
