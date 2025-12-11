# Release Runbook

This runbook outlines the release process for the CaterKing platform, covering GitHub Actions CI/CD, Doppler secret management, Supabase migrations, Flagsmith feature flag approvals, and rollback flows.

## Environments

- **Development**: `ck-dev` - Local testing and development
- **Staging**: `ck-stg` - Pre-production validation
- **Production**: `ck-prod` - Live environment

## CI/CD Pipeline Overview

The CI/CD pipeline is automated through GitHub Actions with the following key stages:

1. **CI Workflow** (triggered on PR creation and push):
   - ESLint & Prettier code formatting checks
   - TypeScript strict mode type checking
   - Vitest unit tests execution
   - Supabase integration tests
   - Playwright E2E tests
   - Storybook visual regression tests

2. **Deploy Workflow** (triggered on merge to main):
   - Doppler secret synchronization
   - Supabase database migrations
   - Vercel application deployment
   - Flagsmith feature flag validation

## GitHub Actions Configuration

### CI Workflow Jobs

- `lint`: Runs ESLint and Prettier with custom monorepo rules
- `typecheck`: Validates TypeScript with strict mode and no implicit any
- `test`: Executes unit tests with minimum 80% coverage requirement
- `integration`: Tests API endpoints and database operations
- `e2e`: Runs critical user journey tests via Playwright
- `visual`: Validates UI components with accessibility tests (axe)

### Deploy Workflow Jobs

- `secrets-sync`: Synchronizes Doppler secrets for target environment
- `migrate`: Applies Supabase migrations with rollback validation
- `deploy`: Deploys application to Vercel with environment-specific configuration
- `validate`: Checks Flagsmith feature flags and dependencies

## Release Process

### Development Release

1. **Code Preparation**
   - Create feature branch from main
   - Implement changes following code standards
   - Run local tests and linting

2. **Pull Request Creation**
   - Push feature branch to repository
   - Create PR with detailed description
   - GitHub Actions automatically triggers CI workflow

3. **CI Validation**
   - ESLint & Prettier formatting checks
   - TypeScript strict mode validation
   - Vitest unit tests (minimum 80% coverage)
   - Supabase integration tests
   - Playwright E2E tests for critical journeys
   - Storybook accessibility tests

4. **Merge to Main**
   - Code review approval required
   - All CI checks must pass
   - Merge triggers automated staging deployment

### Staging Release

1. **Automated Staging Deployment**
   - Doppler syncs secrets for `ck-stg` environment
   - Supabase runs migrations in staging database
   - Vercel deploys to staging environment
   - Application available for QA testing

2. **Manual QA Validation**
   - Test critical user journeys
   - Validate new functionality
   - Check performance and accessibility
   - Verify error handling

3. **Feature Flag Validation**
   - Validate flags in Flagsmith `ck-stg` environment
   - Test flag toggle scenarios
   - Check flag dependencies and combinations
   - Verify telemetry logging for exposures

4. **Staging Approval**
   - QA team sign-off required
   - Performance benchmarks met
   - Security scans passed
   - Documentation updated

### Production Release

1. **Pre-Production Preparation**
   - Obtain stakeholder approval
   - Schedule maintenance window if needed
   - Prepare rollback plan
   - Notify users of upcoming changes

2. **Production Deployment**
   - Doppler syncs production secrets (`ck-prod`)
   - Supabase applies migrations to production database
   - Flagsmith flags validated and configured
   - Vercel deploys to production with zero-downtime

3. **Post-Deployment Validation**
   - Monitor application health metrics
   - Check error rates and response times
   - Validate feature flag performance
   - Test critical user journeys in production

4. **Production Confirmation**
   - All health checks passing
   - User feedback positive
   - Performance within acceptable ranges
   - Documentation complete

## Automation Scripts

### GitHub Actions Workflows

- **CI Workflow**: `.github/workflows/ci.yml` handles linting, testing, and quality gates
- **Deploy Workflow**: `.github/workflows/deploy.yml` manages environment deployments
- **Migration Scripts**: Supabase migrations run automatically via GitHub Actions
- **Secret Sync**: Doppler injects environment variables at deployment time

### Doppler Integration

```bash
# Sync secrets for specific environment
doppler run --config ck-stg --command "npm run build"
doppler run --config ck-prod --command "npm run start"

# Inject secrets during deployment
doppler secrets download --config ck-stg --format env
```

### Supabase Migration Commands

```bash
# Apply migrations
supabase db push --db-url $STAGING_DB_URL

# Generate migration files
supabase db diff --schema public --use-migra

# Rollback migrations
supabase db reset --db-url $STAGING_DB_URL
```

### Flagsmith API Integration

```bash
# Validate feature flags
curl -X GET "https://api.flagsmith.com/api/v1/flags/" \
  -H "x-environment-key: $FLAGS_API_KEY"

# Toggle feature flag
curl -X POST "https://api.flagsmith.com/api/v1/flags/{id}/toggle/" \
  -H "x-environment-key: $FLAGS_API_KEY"
```

## Rollback Procedures

### Emergency Rollback (Immediate Response)

1. **Feature Flag Toggle**
   - Access Flagsmith `ck-prod` environment
   - Toggle problematic features to "off"
   - Monitor error rates and user feedback
   - Document incident and rollback steps

2. **Application Rollback**
   - Identify last stable commit SHA
   - Use Vercel CLI to redeploy previous version:
     ```bash
     vercel rollback --to <commit-sha>
     ```
   - Verify application health

3. **Database Rollback**
   - Initiate Supabase Point-in-Time Recovery (PITR)
   - Select restore point prior to deployment
   - Validate data integrity post-restore

### Planned Rollback (Scheduled Maintenance)

1. **Preparation Phase**
   - Test rollback procedures in staging environment
   - Prepare Supabase migration reversion scripts
   - Identify rollback window and user impact
   - Communicate maintenance schedule

2. **Execution Steps**
   - Place application in maintenance mode
   - Redeploy previous stable commit via Vercel
   - Apply database rollback using Supabase PITR
   - Validate all system components

3. **Post-Rollback Validation**
   - Run full test suite against rolled-back version
   - Verify data consistency and integrity
   - Monitor system performance and error rates
   - Confirm user functionality restored

### Database Rollback Procedures

#### Supabase PITR Process

1. Access Supabase dashboard → Database → Time Travel
2. Select restore point (minimum 1 hour retention)
3. Choose recovery target (timestamp or transaction)
4. Initiate restore process (typically 5-15 minutes)
5. Validate data integrity post-recovery

#### Migration Rollback

```sql
-- Example migration rollback script
-- File: supabase/migrations/20241201_rollback_feature_x.sql

DROP TABLE IF EXISTS feature_x_data;
ALTER TABLE users DROP COLUMN IF EXISTS feature_x_enabled;
DELETE FROM schema_migrations WHERE version = '20241201_add_feature_x';
```

### Application Rollback Procedures

#### Vercel Rollback Commands

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Rollback to previous commit
vercel rollback --to <commit-sha>

# Force rollback (bypass approval)
vercel rollback --force <deployment-url>
```

#### Feature Flag Instant Rollback

- Toggle flags off via Flagsmith dashboard
- Changes take effect within 30 seconds
- No application redeployment required
- Provides immediate user impact mitigation

## Feature Flag Toggles

### Flagsmith Environment Configuration

- **Development**: `ck-dev` - Local testing and feature development
- **Staging**: `ck-stg` - Pre-production validation and QA testing
- **Production**: `ck-prod` - Live environment with controlled rollouts

### Doppler Integration

- Doppler injects `FLAGS_API_KEY` for each environment
- Environment-specific configurations maintained in Doppler templates
- Runtime secret injection ensures secure flag management

### Flag Lifecycle Management

1. **Creation Phase**
   - Create flag in Flagsmith with `scope.feature.variant` naming
   - Set default to "off" in production environment
   - Add to Doppler templates with detailed descriptions
   - Document flag purpose and dependencies in ADR

2. **Rollout Phase**
   - Enable in development for initial testing
   - Promote to staging for QA validation
   - Monitor telemetry and performance metrics
   - Use canary releases for gradual production rollout

3. **Operation Phase**
   - Log all flag exposures for telemetry collection
   - Monitor flag performance and user impact
   - Test flag combinations in QA environment
   - Document flag relationships and dependencies

4. **Removal Phase**
   - Document removal plan in migration notes
   - Create cleanup PR after flag retirement
   - Update Doppler templates and remove unused flags
   - Communicate deprecation to development team

### Flag Validation Requirements

- All flags must pass accessibility tests (axe)
- Flag combinations tested in QA environment
- Telemetry logging implemented for all exposures
- Rollback procedures documented for each flag
- Dependent features degrade gracefully when disabled

## Communications

### Pre-Release Communications

- Notify development team of upcoming deployment schedule
- Share release notes with feature descriptions and impacts
- Communicate maintenance windows to stakeholders
- Provide user-facing notifications for significant changes

### Release Day Communications

- Deploy status updates via team chat (Slack/Teams)
- Production deployment confirmation with timestamp
- Include rollback plan and contact information in release notes
- Monitor user feedback channels for immediate issues

### Post-Release Communications

- Share deployment success metrics and performance data
- Document any issues and resolutions encountered
- Update team on next release timeline and priorities
- Archive release notes and incident reports

### Incident Communications

- Immediate alert for production issues
- Status page updates during ongoing incidents
- Post-incident review with root cause analysis
- Lessons learned and prevention measures

## Release Checklist

### Pre-Release Preparation

- [ ] Code reviewed and approved by required team members
- [ ] All tests pass (unit, integration, E2E, visual regression)
- [ ] Test coverage meets minimum 80% requirement
- [ ] Database migrations tested in staging environment
- [ ] Feature flags created and validated in staging
- [ ] Performance benchmarks met in staging
- [ ] Security scans completed and passed
- [ ] Documentation updated (API docs, user guides, runbooks)

### Release Execution

- [ ] Doppler secrets validated for target environment
- [ ] Manual approval obtained from designated stakeholders
- [ ] Rollback plan documented and tested
- [ ] Maintenance window scheduled if required
- [ ] User notifications prepared and scheduled
- [ ] Monitoring dashboards configured and tested

### Post-Release Validation

- [ ] Production deployment completed successfully
- [ ] Health checks passing for all system components
- [ ] Error rates within acceptable thresholds
- [ ] User functionality validated and working
- [ ] Performance metrics meeting SLA requirements
- [ ] Feature flag telemetry collecting properly
- [ ] Security posture maintained (no new vulnerabilities)

### Release Closure

- [ ] Communications sent to all stakeholders
- [ ] Post-deployment monitoring initiated and automated
- [ ] Release notes published and archived
- [ ] Incident reports created if issues occurred
- [ ] Lessons learned documented for future releases
- [ ] Next release planning initiated
