#!/usr/bin/env tsx

/**
 * Test script for observability bootstrap functionality
 */

import { execSync } from 'node:child_process';
import { join } from 'node:path';

function testBootstrapScript() {
  console.log('Testing observability bootstrap script...');

  try {
    // Test with minimal environment to ensure validation works
    const result = execSync('tsx scripts/observability/bootstrap.ts', {
      cwd: process.cwd(),
      env: {
        ...process.env,
        TEAMS_WEBHOOK_URL: 'https://test.webhook.microsoft.com/teams',
        SLACK_WEBHOOK_URL: 'https://test.webhook.slack.com/slack',
        // Omit optional keys to test skip logic
      },
      stdio: 'pipe',
      timeout: 30000,
    });

    const output = result.toString();
    console.log('Bootstrap script output:');
    console.log(output);

    // Verify key phrases in output
    const expectedPhrases = [
      'Starting observability bootstrap',
      'Available optional integrations',
      'Observability bootstrap completed successfully',
      'Teams & Slack configured',
    ];

    for (const phrase of expectedPhrases) {
      if (!output.includes(phrase)) {
        throw new Error(`Expected phrase not found in output: "${phrase}"`);
      }
    }

    console.log('✅ Bootstrap script test passed');
    return true;
  } catch (error) {
    console.error('❌ Bootstrap script test failed:', error.message);
    return false;
  }
}

function testDashboardJson() {
  console.log('Testing dashboard JSON parsing...');

  try {
    const fs = require('node:fs');
    const path = require('node:path');

    const dashboardPath = path.join(
      process.cwd(),
      'docs',
      'operations',
      'observability_dashboard.md',
    );
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');

    const dashboardJsonMatch = dashboardContent.match(/```json\n([\s\S]*?)\n```/);
    if (!dashboardJsonMatch) {
      throw new Error('Dashboard JSON not found');
    }

    const dashboardConfig = JSON.parse(dashboardJsonMatch[1]);

    // Verify required structure
    if (!dashboardConfig.dashboard) {
      throw new Error('Missing dashboard object');
    }

    if (!dashboardConfig.dashboard.panels || !Array.isArray(dashboardConfig.dashboard.panels)) {
      throw new Error('Missing or invalid panels array');
    }

    if (dashboardConfig.dashboard.panels.length === 0) {
      throw new Error('No panels defined in dashboard');
    }

    console.log(
      `✅ Dashboard JSON test passed - found ${dashboardConfig.dashboard.panels.length} panels`,
    );
    return true;
  } catch (error) {
    console.error('❌ Dashboard JSON test failed:', error.message);
    return false;
  }
}

function testAlertMatrix() {
  console.log('Testing alert matrix structure...');

  try {
    const fs = require('node:fs');
    const path = require('node:path');

    const alertPath = path.join(process.cwd(), 'docs', 'operations', 'alert_matrix.md');
    const alertContent = fs.readFileSync(alertPath, 'utf-8');

    // Verify key sections exist
    const requiredSections = [
      'Alert Configuration Overview',
      'Alert Matrix Table',
      'Webhook Configuration',
      'Escalation Procedures',
    ];

    for (const section of requiredSections) {
      if (!alertContent.includes(section)) {
        throw new Error(`Missing section: ${section}`);
      }
    }

    // Verify table structure
    if (!alertContent.includes('| Metric') || !alertContent.includes('| Warning Threshold')) {
      throw new Error('Alert matrix table not properly formatted');
    }

    console.log('✅ Alert matrix test passed');
    return true;
  } catch (error) {
    console.error('❌ Alert matrix test failed:', error.message);
    return false;
  }
}

function main() {
  console.log('Running observability tests...\n');

  const results = [testDashboardJson(), testAlertMatrix(), testBootstrapScript()];

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\nTest Results: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('🎉 All observability tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
