# Playwright Testing Documentation

## Overview

This directory contains end-to-end tests for the CaterKing platform using Playwright. The test suite covers admin board functionality, PrepChef task management, and task combination flows with chaos testing capabilities.

## Test Structure

### Test Files

- **`admin.board.spec.ts`** - Tests for the admin CRM task board including drag-and-drop functionality, staff filtering, and realtime updates
- **`prepchef.combine.spec.ts`** - Tests for PrepChef task combination flows including approval, rejection, and rollback scenarios
- **`prepchef.tasks.spec.ts`** - Tests for basic PrepChef task management including claiming and completion workflows

### Chaos Testing Helper

The **`helpers/realtimeChaos.ts`** file provides chaos testing capabilities to simulate network failures and ensure robust fallback behavior:

#### Features

- **Realtime Connection Drops**: Simulates WebSocket connection failures to test polling fallback
- **Conflicting Approvals**: Delays API responses to simulate race conditions
- **Network Latency**: Adds artificial delays to network requests
- **Undo Expiration**: Mocks time passage to test undo functionality limits
- **Offline Mode**: Blocks all network requests to test offline behavior

#### Usage

```typescript
import { RealtimeChaosHelper } from './helpers/realtimeChaos';

test('should handle realtime failures', async ({ page }) => {
  const chaosHelper = new RealtimeChaosHelper(page);

  // Enable chaos mode
  await chaosHelper.enableChaos();

  // Test behavior under chaos conditions
  await page.reload();
  await expect(page.locator('.task-board')).toBeVisible();

  // Reset chaos
  await chaosHelper.reset();
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run only chaos tests
npm run test:e2e:chaos
```

### Playwright Commands

```bash
# List all tests
npx playwright test --list

# Run specific test file
npx playwright test admin.board.spec.ts

# Run tests for specific project
npx playwright test --project=chromium

# Run tests with specific reporter
npx playwright test --reporter=html

# Run tests in headed mode
npx playwright test --headed
```

## Test Coverage

### Admin Board Tests

- ✅ Drag and drop functionality
- ✅ Event filtering
- ✅ Staff presence indicators
- ✅ Task priority indicators
- ✅ Realtime connection drop handling
- ✅ Accessibility compliance

### PrepChef Combine Tests

- ✅ Feature flag handling
- ✅ Task combination approval
- ✅ Task detail expansion
- ✅ Loading state management
- ✅ Offline fallback behavior
- ✅ Conflicting approval handling
- ✅ Undo expiration scenarios
- ✅ Accessibility compliance

### PrepChef Task Management Tests

- ✅ Dashboard display
- ✅ Task claiming workflow
- ✅ Task completion workflow
- ✅ Realtime updates
- ✅ Accessibility standards

## CI Integration

### Optional Chaos Testing

Chaos tests are configured to run as an optional CI job to avoid blocking deployments while still providing valuable stability insights:

```yaml
# Example CI configuration
- name: Run E2E Tests
  run: npm run test:e2e

- name: Run Chaos Tests (Optional)
  if: github.event_name == 'schedule' || contains(github.event.head_commit.message, '[chaos]')
  run: npm run test:e2e:chaos
```

### Triggers

Chaos tests can be triggered by:

- Scheduled runs (e.g., nightly)
- Commit messages containing `[chaos]`
- Manual workflow dispatch

## Best Practices

### Test Organization

- Use `test.describe` to group related tests
- Use `test.beforeEach` for common setup
- Use descriptive test names that explain the behavior
- Include accessibility testing in all suites

### Chaos Testing

- Always reset chaos state in `test.afterEach` or at the end of tests
- Use chaos testing to verify fallback behavior, not just error handling
- Test both graceful degradation and recovery scenarios
- Combine chaos testing with normal operation tests

### Error Handling

- Test for user-friendly error messages
- Verify proper error logging
- Test recovery from error states
- Ensure accessibility during error states

## Debugging

### Playwright Inspector

```bash
# Run tests with inspector
npx playwright test --debug

# Run specific test with inspector
npx playwright test admin.board.spec.ts --debug
```

### Trace Viewer

```bash
# View traces from last test run
npx playwright show-report

# Open specific trace
npx playwright show-report test-results
```

### Screenshots and Videos

Playwright automatically captures:

- Screenshots on test failure
- Videos for each test (when run in headed mode)
- Trace files for detailed debugging

## Configuration

### Browser Support

Tests run across:

- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

### Test Options

- **Parallel execution**: Enabled by default
- **Retries**: 2 retries on CI
- **Timeouts**: Default Playwright timeouts
- **Reporting**: HTML reports with traces

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Include chaos testing scenarios where applicable
3. Add accessibility tests
4. Update this documentation
5. Test across all supported browsers

## Troubleshooting

### Common Issues

- **Tests not found**: Verify `testDir` configuration in `playwright.config.ts`
- **Module not found**: Ensure dependencies are installed in `tests/` directory
- **Timeout errors**: Increase timeout in test configuration or add explicit waits
- **Flaky tests**: Add proper waits and use chaos testing to identify race conditions
