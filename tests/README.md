# Testing

## Playwright Tests

Run the Playwright test suites:

```bash
npx playwright test
```

### Admin Board Tests

Located in `tests/playwright/admin.board.spec.ts`, these tests verify:

- Drag and drop functionality on the task board
- Staff filtering
- Audit log links

### PrepChef Combine Tests

Located in `tests/playwright/prepchef.combine.spec.ts`, these tests verify:

- Task combination approval and rejection
- Rollback functionality
- Offline fallback when realtime connections fail

### E2E Integration Tests

Located in `tests/e2e/`, these comprehensive end-to-end tests cover all user flows with >95% success rate requirement and <5 minute execution time.

#### Performance Requirements

- **Success Rate**: All tests must pass with >95% success rate
- **Execution Time**: Complete test suite must run in <5 minutes
- **SLA Compliance**: Kiosk display updates must verify 15-second SLA

Run E2E tests:

```bash
npx playwright test --project=e2e-prepchef
npx playwright test --project=e2e-admin
npx playwright test --project=e2e-display
```

Or run all E2E:

```bash
npx playwright test --project="e2e-*"
```

#### Test Coverage

- **task-claim-complete.spec.ts**: Staff claims task → sees realtime update → completes → sees confirmation
- **task-combination.spec.ts**: Task combination suggestion → accept → verify merged task in list
- **recipe-viewer.spec.ts**: Recipe viewer opens → displays media → user can interact
- **offline-fallback.spec.ts**: Offline fallback → browser loses connection → polling activates
- **admin-workflows.spec.ts**: Manager assigns task → triggers notification → staff sees assignment; Admin uploads media → verifies storage bucket access
- **kiosk-realtime.spec.ts**: Kiosk display updates → verifies 15-second SLA compliance

#### Test Features

- **Accessibility Testing**: All E2E tests include keyboard navigation and ARIA compliance checks
- **Chaos Testing**: Integration with RealtimeChaosHelper for network failure simulation
- **Multi-User Workflows**: Tests spanning multiple user roles (staff, manager, admin, kiosk)
- **Realtime Verification**: Validates realtime updates and polling fallback mechanisms

### Chaos Testing

Use the `RealtimeChaosHelper` in `tests/playwright/helpers/realtimeChaos.ts` to simulate:

- Realtime connection drops
- Conflicting approvals
- Undo expiration

To run chaos tests in CI:

```bash
npx playwright test --grep "chaos"
```

Or as an optional job in your CI pipeline.
