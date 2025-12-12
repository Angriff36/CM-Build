# Deployment Checklist

## Pre-Deployment Validation

### Code Quality

- [ ] TypeScript strict mode: zero errors across all packages
- [ ] ESLint: all rules pass, no suppressions
- [ ] Unit tests: >80% coverage
- [ ] Integration tests: API contract tests pass
- [ ] E2E tests: >95% success rate

### Performance

- [ ] Lighthouse: mobile score >90, desktop score >95
- [ ] Bundle size: prepchef <200KB, admin-crm <250KB gzipped
- [ ] API response time: <200ms for task operations
- [ ] Realtime latency: <500ms from database change to UI update
- [ ] Database query performance: task list load <100ms for 200 concurrent tasks

### Security

- [ ] API routes validated with Zod
- [ ] RLS policies enforced
- [ ] No hardcoded secrets
- [ ] Secret scanning passes

### Accessibility

- [ ] axe-core: zero violations
- [ ] WCAG compliance verified

### Documentation

- [ ] README updated for each package
- [ ] Architecture diagrams current
- [ ] API documentation complete

## Deployment Steps

1. Merge to main branch
2. CI/CD pipeline runs validation suite
3. Manual review of validation results
4. Deploy to staging
5. Run smoke tests on staging
6. Deploy to production
7. Monitor post-deployment metrics

## Rollback Plan

- Automated rollback on critical failures
- Database migration rollback scripts ready
- Feature flags available for quick disable
