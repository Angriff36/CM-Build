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

### Performance Thresholds

#### API Response Times (SLA Requirements)

- **95th Percentile**: <200ms for all endpoints (critical SLA)
- **99th Percentile**: <500ms for all endpoints (burst tolerance)
- **Heuristics Endpoint**: <200ms for 200 tasks with early exits
- **Task Board Queries**: <150ms for filtered task lists
- **Real-time Subscriptions**: <100ms latency from DB to UI

#### Resource Usage Limits

- **Heuristics Execution**: <10 seconds for 200 tasks (timeout at 30s)
- **Memory Usage**: <100MB peak during operations (alert at 80MB)
- **CPU Usage**: <90% sustained (auto-scale at 80%)
- **Database Connections**: <50 concurrent (pool at 20)
- **Real-time Channels**: <8 per event (throttle above)

#### Client-side Performance

- **Page Load Times**: <3 seconds for initial loads
- **Board Render Time**: <200ms for 200 tasks with virtualization
- **DnD Operations**: <100ms drag end latency
- **Real-time Updates**: Throttle at >10 updates/second per client
- **Component Memory**: <30MB for task board with 200 tasks

#### Load Testing Benchmarks (k6)

- **Baseline Load**: 20 concurrent users, 85 req/s throughput
- **Peak Load**: 50 concurrent users, 195 req/s throughput
- **Burst Testing**: 3 rapid calls, <650ms 99th percentile
- **Error Rate**: <5% under all load conditions
- **Sustained Load**: 24-hour stress test, stable performance

#### Database Query Performance (with indexes)

- **Task Fetch (company+status)**: <20ms (idx_tasks_company_status)
- **Board Filter (company+event+status)**: <25ms (idx_tasks_company_event_status)
- **Assignment Lookup (company+user)**: <15ms (idx_tasks_company_assigned_user)
- **Similarity Suggestions**: <30ms (idx_task_similarity_suggestions_company_score)

#### Gating & Alert Thresholds

- **Critical Alerts**: Heuristics >10s, DB latency >500ms, Memory >100MB
- **Warning Alerts**: Render >200ms, DnD >100ms, Realtime >150ms
- **Automated Responses**: Auto-scale at 80% CPU, Throttle at 10 req/min, Fallback to polling

### Pre-commit Hooks

Git hooks enforce:

- No default exports
- Alias usage (no relative imports)
- Consistent path formatting

### CI/CD Pipeline

- Lint, typecheck, and test on every PR
- Supabase migration verification
- Visual regression tests for UI changes
- Performance benchmarks against thresholds
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

## Troubleshooting

### Port Conflicts

If Supabase fails to start due to port conflicts:

1. Check what's using the ports: `lsof -i :54321` (macOS/Linux) or `netstat -ano | findstr :54321` (Windows)
2. Stop conflicting services or change Supabase ports in `supabase/config.toml`
3. Alternative: Use Docker fallback if local Postgres conflicts

### Docker Fallback

For environments without local Postgres:

1. Ensure Docker Desktop is running
2. Supabase will automatically use Docker containers
3. If issues persist, run `docker system prune` to clean up

### Windows WSL Quirks

When using WSL on Windows:

1. Install Supabase CLI in WSL, not Windows
2. Ensure Docker Desktop WSL integration is enabled
3. Use `wsl.exe` paths for file access if needed
4. Port forwarding: Access apps via `localhost` from Windows browser
5. File permissions: Run scripts with proper WSL user context

### Doppler Issues

- **Access Denied**: Verify Doppler login and project membership
- **Missing Secrets**: Run `./scripts/env/sync_secrets.sh --validate` to check required secrets
- **Template Validation**: Use `doppler run --config-template configs/doppler.template.yaml -- echo "Valid"`

### Common Dev Script Errors

- **pnpm not found**: Install pnpm globally or use `npm run dev` temporarily
- **Supabase seed fails**: Check database connection and migration status
- **App won't start**: Verify Node.js version and dependency installation

## Future Automation

- Automated ADR validation against blueprint anchors
- Coverage reporting integrated with PR comments
- Automated dependency updates via Renovate
- Enhanced lint rules for guardrail enforcement
