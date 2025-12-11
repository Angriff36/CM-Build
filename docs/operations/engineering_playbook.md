# Engineering Playbook

This playbook serves as the operational guide for engineering practices within the CaterKing platform monorepo. It details coding standards, tooling usage, and quality gates to ensure consistent, high-quality contributions aligned with the [Standard Kit](../architecture/01_Blueprint_Foundation.md#2-0-the-standard-kit) and [Non-Negotiable Guardrails](../architecture/01_Blueprint_Foundation.md#blueprint-foundation).

## Environment Setup

### Prerequisites

Follow the [README prerequisites](../README.md#prerequisites) for Node.js, pnpm, Supabase CLI, Doppler, and Flagsmith.

### Local Development

1. Clone the repository and install dependencies:

   ```bash
   pnpm install
   ```

2. Set up local Supabase:

   ```bash
   doppler run -- supabase start
   ```

3. Start development servers:

   ```bash
   pnpm dev:prepchef  # For PrepChef app
   pnpm dev:caterking # For CaterKing app (when available)
   ```

4. Run quality checks:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

### Doppler Secrets Management

Use Doppler for all environment variables. Never commit `.env` files.

- Development: `doppler run -- pnpm dev:prepchef`
- Staging/Production: Configured via Doppler projects (`ck-stg`, `ck-prod`)

## Shared Libraries Layout

The monorepo enforces strict separation of concerns with shared libraries under `libs/`:

- **`libs/ui`**: Design system with Tailwind + ShadCN components. All UI primitives must come from here.
- **`libs/shared`**: Domain models, utilities, enums, and business logic. No app-specific code.
- **`libs/supabase`**: Data access layer with typed clients, RPC wrappers, and query helpers.

### Import Rules

- Use path aliases defined in `tsconfig.base.json`: `@caterkingapp/ui`, `@caterkingapp/shared`, `@caterkingapp/supabase`
- No relative imports across apps; all shared code via aliases
- No direct database access from apps; route through `libs/supabase`

## Alias Usage

Path aliases enforce the shared-library-only architecture:

```typescript
// Correct: Import from shared libraries
import { Button } from '@caterkingapp/ui';
import { TaskStatus } from '@caterkingapp/shared';
import { supabase } from '@caterkingapp/supabase';

// Incorrect: Direct relative imports
import Button from '../../../libs/ui/src/Button';
```

See `tsconfig.base.json` for the complete alias mapping.

## ShadCN Integration Process

When adding new UI components:

1. Check if component exists in `libs/ui`
2. If not, add via ShadCN CLI:
   ```bash
   cd libs/ui
   npx shadcn@latest add <component-name>
   ```
3. Export from `libs/ui/src/index.ts`
4. Use in apps via `@caterkingapp/ui` alias
5. Add Storybook stories and tests

All components must support gloves-friendly tap targets and accessibility standards.

## Test Coverage Minimums

- **Shared Libraries**: ≥80% statement coverage with Vitest
- **Apps**: Unit tests for critical paths; integration tests for RPC endpoints
- **UI Components**: Storybook stories double as accessibility regression tests

Run tests: `pnpm test --filter=<package>`

## Undo/Audit Requirements

### Undo Implementation

- All mutations include `undo_token` for revert capability
- Undo available for 5 minutes or until conflicting change
- UI shows undo toasts with clear revert actions

### Audit Logging

- Critical actions (task edits, role changes) log to `audit_logs` table
- Include `actor_id`, `timestamp`, `prior_value`, `new_value`
- Mandatory for regulatory compliance

## Quality Gates

### Pre-commit Hooks

Git hooks enforce:

- No default exports
- Alias usage (no relative imports)
- Consistent path formatting

### CI/CD Pipeline

- Lint, typecheck, and test on every PR
- Supabase migration verification
- Visual regression tests for UI changes
- Blocks merges until all gates pass

## Checklist for Autonomous Agents

Before closing tasks, verify:

- [ ] Code uses path aliases and shared libraries
- [ ] No direct database access; all via Supabase RPCs
- [ ] Feature flags implemented for new functionality
- [ ] Test coverage meets minimums
- [ ] Undo/audit requirements implemented
- [ ] Documentation updated
- [ ] ADR created for architectural changes
- [ ] Lint, typecheck, and tests pass
- [ ] Rollback plan documented

## Future Automation

- Automated ADR validation against blueprint anchors
- Coverage reporting integrated with PR comments
- Automated dependency updates via Renovate
- Enhanced lint rules for guardrail enforcement
