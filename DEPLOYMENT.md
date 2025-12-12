# Deployment Checklist

## Pre-Deployment Validation

### Code Quality

- [x] TypeScript strict mode: zero errors across all packages
  - Command: `pnpm typecheck`
  - Threshold: 0 errors
- [x] ESLint: all rules pass, no suppressions
  - Command: `pnpm lint`
  - Threshold: 0 warnings/errors
- [x] Unit tests: >80% coverage
  - Command: `pnpm test:unit --coverage`
  - Threshold: >80% coverage
- [x] Integration tests: API contract tests pass
  - Command: `pnpm test:contract`
  - Threshold: 100% pass rate
- [x] E2E tests: >95% success rate
  - Command: `pnpm test:e2e`
  - Threshold: >95% pass rate
- [x] Comprehensive E2E test suite
  - Tests: task-claim-complete, task-combination, recipe-viewer, offline-fallback, admin-workflows, kiosk-realtime
  - Command: `pnpm test:e2e --grep "@E2E"`
  - Threshold: >95% pass rate across all workflows

### Performance

- [x] Lighthouse: mobile score >90, desktop score >95
  - Command: `pnpm lighthouse`
  - Threshold: Mobile >90, Desktop >95
- [x] Bundle size: prepchef <200KB, admin-crm <250KB gzipped
  - Command: `pnpm build && pnpm bundle:analyze`
  - Threshold: PrepChef <200KB, Admin CRM <250KB
- [x] API response time: <200ms for task operations
  - Command: `pnpm k6 run tests/perf/heuristics.k6.js`
  - Threshold: <200ms 95th percentile
- [x] Realtime latency: <500ms from database change to UI update
  - Command: `pnpm test:e2e --grep "realtime"`
  - Threshold: <500ms end-to-end
- [x] Database query performance: task list load <100ms for 200 concurrent tasks
  - Command: `pnpm db:profile`
  - Threshold: <100ms for 200 tasks

### Security

- [x] API routes validated with Zod
  - Command: `pnpm test:security`
  - Threshold: 100% routes validated
- [x] RLS policies enforced
  - Command: `cd supabase && pnpm test:rls`
  - Threshold: 100% policies pass
- [x] No hardcoded secrets
  - Command: `pnpm trufflehog`
  - Threshold: 0 secrets detected
- [x] Secret scanning passes
  - Command: `pnpm audit --audit-level high`
  - Threshold: 0 high/critical vulnerabilities

### Accessibility

- [x] axe-core: zero violations
  - Command: `pnpm test:e2e --grep "accessibility"`
  - Threshold: 0 violations
- [x] WCAG compliance verified
  - Command: `pnpm lighthouse --accessibility`
  - Threshold: >95 accessibility score

### Documentation

- [x] README updated for each package
  - Manual check: Review apps/\*/README.md
- [x] Architecture diagrams current
  - Manual check: Review docs/diagrams/
- [x] API documentation complete
  - Command: `pnpm api:docs`
  - Threshold: All endpoints documented

## Deployment Steps

1. **Merge to main branch**
   - Ensure all PR checks pass
   - Require approval from code owners

2. **CI/CD pipeline runs validation suite**
   - Automatic: TypeScript, ESLint, tests, bundle-size, security, accessibility, performance
   - Command: Triggered by push to main
   - Timeout: 30 minutes max

3. **Manual review of validation results**
   - Review GitHub Actions logs
   - Check performance benchmarks vs thresholds
   - Verify security scan results
   - Sign-off required from QA lead

4. **Deploy to staging**
   - Command: `pnpm deploy:staging`
   - Environment: staging.codmachine.com
   - Database: staging seed data

5. **Run smoke tests on staging**
   - Command: `pnpm test:smoke --env staging`
   - Tests: Basic functionality, login, task operations
   - Threshold: 100% pass rate

6. **Deploy to production**
   - Command: `pnpm deploy:prod`
   - Environment: app.codmachine.com
   - Requires: Staging sign-off + production approval

7. **Monitor post-deployment metrics**
   - Check application logs
   - Monitor performance dashboards
   - Verify realtime functionality
   - Alert on errors >5%

## Rollback Plan

### Automated Rollback Triggers

- API error rate >10% for 5 minutes
- Performance degradation >50% from baseline
- Critical security vulnerability detected
- Database connection failures >5%

### Rollback Procedures

#### Application Rollback

1. Identify failing deployment via monitoring alerts
2. Execute: `pnpm rollback:app --to <previous-version>`
3. Verify: Application loads and basic functionality works
4. Monitor: Error rates return to normal

#### Database Rollback

1. Check migration scripts in `supabase/migrations/`
2. Execute: `cd supabase && pnpm migration:rollback`
3. Verify: Data integrity and RLS policies
4. Test: Core workflows still function

#### Feature Flags

- Available flags: `realtime_enabled`, `task_suggestions`, `admin_crm`
- Disable via: `pnpm feature:toggle <flag> false`
- Gradual rollout: Enable for 10% → 50% → 100% of users

### Communication Plan

- Alert team via Slack #deployments channel
- Notify stakeholders for production incidents
- Post-mortem meeting within 24 hours
- Update status page for user-facing issues

### Recovery Time Objectives

- Application rollback: <15 minutes
- Database rollback: <30 minutes
- Full system recovery: <1 hour
- Data loss tolerance: <1 minute (via backups)
