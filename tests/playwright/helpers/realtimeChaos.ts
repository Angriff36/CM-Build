import { Page, Route } from '@playwright/test';

/**
 * Chaos testing helper for simulating realtime connection failures
 * and network issues to ensure polling fallback works correctly.
 */
export class RealtimeChaosHelper {
  private page: Page;
  private chaosEnabled = false;
  private originalDateNow?: () => number;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Enable chaos mode - simulates realtime connection drops
   */
  async enableChaos() {
    if (this.chaosEnabled) return;

    this.chaosEnabled = true;
    // Intercept WebSocket connections and fail them randomly
    await this.page.route('**/realtime/**', (route: Route) => {
      if (Math.random() < 0.5) {
        // 50% chance of failure
        route.abort('failed');
      } else {
        route.continue();
      }
    });
  }

  /**
   * Disable chaos mode - restore normal realtime connections
   */
  async disableChaos() {
    if (!this.chaosEnabled) return;

    this.chaosEnabled = false;
    await this.page.unroute('**/realtime/**');
  }

  /**
   * Simulate conflicting approvals by delaying responses
   */
  async simulateConflictingApprovals() {
    await this.page.route('**/rpc/combine_tasks', async (route: Route) => {
      // Delay response to simulate race conditions
      setTimeout(() => route.continue(), 2000);
    });
  }

  /**
   * Simulate network latency for all requests
   */
  async simulateNetworkLatency(delay = 1000) {
    await this.page.route('**/*', async (route: Route) => {
      // Don't delay static resources
      if (
        route.request().resourceType() === 'document' ||
        route.request().resourceType() === 'stylesheet' ||
        route.request().resourceType() === 'script'
      ) {
        await route.continue();
      } else {
        setTimeout(() => route.continue(), delay);
      }
    });
  }

  /**
   * Simulate undo expiration by mocking timer
   */
  async simulateUndoExpiration() {
    // Store original Date.now
    this.originalDateNow = Date.now;

    await this.page.evaluate(() => {
      // Mock Date.now to simulate time passing (24 hours)
      const originalNow = Date.now;
      Date.now = () => originalNow() + 24 * 60 * 60 * 1000;
    });
  }

  /**
   * Simulate offline mode by blocking all network requests
   */
  async simulateOfflineMode() {
    await this.page.route('**/*', (route: Route) => {
      route.abort('failed');
    });
  }

  /**
   * Reset all chaos simulations
   */
  async reset() {
    await this.disableChaos();
    await this.page.unroute('**/rpc/combine_tasks');
    await this.page.unroute('**/*');

    // Restore Date.now if it was modified
    if (this.originalDateNow) {
      await this.page.evaluate((originalNow: () => number) => {
        Date.now = originalNow;
      }, this.originalDateNow);
      this.originalDateNow = undefined;
    }
  }

  /**
   * Get current chaos state
   */
  isEnabled(): boolean {
    return this.chaosEnabled;
  }
}
