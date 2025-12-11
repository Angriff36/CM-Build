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
