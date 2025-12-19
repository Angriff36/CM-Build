# PrepChef Staff PWA

PrepChef is the mobile-first experience used by kitchen staff to claim, execute, and complete prep tasks. It streams task lists via React Server Components, hydrates React Query for mutations, and logs telemetry for every interaction so managers can audit throughput.

## Daily Commands

```bash
pnpm dev:prepchef                         # Turbo-filtered Next.js dev server
pnpm lint --filter @codemachine/prepchef # next lint scoped to this app
pnpm test --filter @codemachine/prepchef # vitest placeholder suites
pnpm build --filter @codemachine/prepchef
```

- `pnpm dev:prepchef` proxies through `turbo run dev` so caches remain consistent with the rest of the workspace.
- Use Doppler + Flagsmith configs outlined in the repo root README before hitting Supabase auth flows.

## Import Guardrails

- Only import domain logic from `@codemachine/shared/*` or `@codemachine/supabase/*`; app folders orchestrate UI and never redeclare business rules.
- UI primitives (buttons, layouts, icons) must come from `@codemachine/ui`.
- Never reach into other apps or use deep relative paths that bypass shared packages--lint rules will block merges if this guardrail is broken.

## Entry Surface

- Next.js App Router under `apps/prepchef/app` is the single entry point. Route handlers must remain edge-compatible unless a feature explicitly requires Node runtime APIs.
- Feature flags for experimental flows should read from the shared Flagsmith context so exposures are tracked uniformly.

## Task Dashboard

The main task management interface at `/tasks` provides:

- Real-time task list with filtering by event, status, and search
- Claim and complete actions with optimistic updates
- Gloves-friendly large tap targets for accessibility
- WCAG 2.1 AA compliant UI

### Components

- **TaskDashboard** (`components/TaskDashboard.tsx`): Main container with real-time updates and state management
- **TaskRow** (`components/TaskRow.tsx`): Individual task display with action buttons
- **TaskFilters** (`components/TaskFilters.tsx`): Filtering controls for events, status, and search

### Features

- **Real-time Synchronization**: Uses Supabase realtime subscriptions for live updates
- **Optimistic Updates**: Immediate UI feedback when claiming/completing tasks
- **Advanced Filtering**: Filter by event, multiple status options, and text search
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation
- **Gloves-friendly UI**: Large tap targets (minimum 44px) for kitchen staff use

### Testing

- Unit tests with >80% coverage for all components
- Integration tests for user interactions
- Accessibility compliance testing
- Real-time functionality testing
