# Contributing to CaterKing Platform

Welcome! This guide outlines the processes and standards for contributing to the CaterKing platform monorepo. By following these guidelines, you ensure high-quality, consistent code that aligns with our architectural principles outlined in the [Blueprint Foundation](../architecture/01_Blueprint_Foundation.md#blueprint-foundation).

## Prerequisites

Before contributing, ensure you have the setup described in the [README](../README.md#prerequisites):

- Node.js 20.10+
- pnpm 10.16+
- Supabase CLI
- Doppler CLI
- Flagsmith account

## Development Workflow

### Commands

All commands are managed through Turbo and pnpm. Key commands include:

- `pnpm install` - Install dependencies
- `pnpm dev:prepchef` - Start the PrepChef app in development
- `pnpm lint` - Run linting across the workspace
- `pnpm typecheck` - Run TypeScript checks
- `pnpm test` - Run tests
- `pnpm build` - Build all packages

Use `--filter=<package>` to run commands on specific packages, e.g., `pnpm lint --filter=@caterkingapp/ui`.

### Branch Naming

Follow this convention for branch names:

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `docs/<description>` - Documentation updates
- `refactor/<description>` - Code refactoring

Keep branch names descriptive and lowercase, using hyphens for separation.

### ShadCN Integration Process

When adding new UI components:

1. Check if component exists in `@caterkingapp/ui`
2. If not, add via ShadCN CLI in `libs/ui`:
   ```bash
   cd libs/ui
   npx shadcn@latest add <component-name>
   ```
3. Export from `libs/ui/src/index.ts`
4. Use in apps via `@caterkingapp/ui` alias
5. Add Storybook stories and ensure accessibility

### Feature Flag Conventions

All net-new interactive functionality ships behind feature flags:

- Flag keys follow `scope.feature.variant` naming (e.g., `prep.task-combine.v2`)
- Defaults set to "off" in production until QA validation
- Implement client-side and server-side checks
- Emit telemetry for exposure, click-through, and errors
- Include rollback plan in PR description

See the [Feature Flag Runbook](docs/operations/feature_flag_runbook.md) for details.

### Git/GitHub Workflows

- **Commits**: Use conventional commits; hooks enforce lint/type/test gates
- **Pull Requests**: Require review; include rollback plans for migrations/flags
- **Releases**: `main`→staging, tagged release→production; hotfixes require approval
- **ADR Process**: Create ADRs in `docs/adr/` for architectural decisions

### Code Review Expectations

All changes require pull request review. Reviewers check for:

- Adherence to the [Standard Kit](../architecture/01_Blueprint_Foundation.md#2-0-the-standard-kit) technology stack
- Compliance with [Non-Negotiable Guardrails](../architecture/01_Blueprint_Foundation.md#blueprint-foundation)
- Proper use of shared libraries and aliases
- Feature flags implemented for new functionality
- Test coverage and quality gates
- Documentation updates where needed

### ADR Process

For architectural decisions, follow the ADR (Architectural Decision Record) process:

1. Create a new ADR in `docs/adr/` following the template
2. Reference relevant blueprint anchors
3. Include impact analysis and testing plans
4. Submit for review and approval

### Testing Gates

Before merging:

- Lint and typecheck pass across touched packages
- Unit tests achieve ≥80% coverage on shared libs
- Integration tests pass for affected RPC endpoints
- Visual regression tests pass for UI changes

## Checklist for Contributors

- [ ] Code follows TypeScript strict mode and uses path aliases
- [ ] No direct database access; all SQL via Supabase RPCs
- [ ] Shared UI components used from `@caterkingapp/ui`
- [ ] Feature flags implemented for new functionality
- [ ] Tests added/updated with adequate coverage
- [ ] Documentation updated if APIs or processes changed
- [ ] ADR created for architectural changes
- [ ] Pull request includes rollback plan if applicable
