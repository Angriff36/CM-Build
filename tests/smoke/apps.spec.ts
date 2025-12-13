/**
 * Smoke tests - Quick runtime validation
 * Catches: Missing providers, hook errors, component crashes, import errors
 */

import { test, expect } from '@playwright/test';

const APPS = [
  { name: 'admin-crm', port: 9002, paths: ['/', '/events'] },
  { name: 'display', port: 9003, paths: ['/'] },
  { name: 'prepchef', port: 9001, paths: ['/'] },
];

test.describe('App Smoke Tests', () => {
  for (const app of APPS) {
    test.describe(app.name, () => {
      for (const path of app.paths) {
        test(`${app.name}${path} loads without runtime errors`, async ({ page }) => {
          // Listen for console errors
          const errors: string[] = [];
          page.on('console', (msg) => {
            if (msg.type() === 'error') {
              errors.push(msg.text());
            }
          });

          // Listen for page errors (uncaught exceptions)
          page.on('pageerror', (error) => {
            errors.push(error.message);
          });

          // Navigate to page
          const response = await page.goto(`http://localhost:${app.port}${path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });

          // Check response is OK
          expect(response?.status()).toBeLessThan(400);

          // Check page loaded
          await expect(page.locator('body')).toBeVisible();

          // Wait a moment for React to mount and providers to initialize
          await page.waitForTimeout(2000);

          // Check for runtime errors
          if (errors.length > 0) {
            console.error(`Errors found on ${app.name}${path}:`, errors);
            throw new Error(`Runtime errors detected: ${errors.join(', ')}`);
          }
        });
      }
    });
  }
});

test.describe('Critical Provider Checks', () => {
  test('admin-crm has QueryClientProvider', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      if (error.message.includes('QueryClient')) {
        errors.push(error.message);
      }
    });

    await page.goto('http://localhost:9002/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });

  test('display has QueryClientProvider', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      if (error.message.includes('QueryClient')) {
        errors.push(error.message);
      }
    });

    await page.goto('http://localhost:9003/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });

  test('prepchef has QueryClientProvider', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      if (error.message.includes('QueryClient')) {
        errors.push(error.message);
      }
    });

    await page.goto('http://localhost:9001/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });
});
