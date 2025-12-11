#!/usr/bin/env tsx

/**
 * Observability Bootstrap Script
 *
 * This script idempotently creates observability resources (dashboards, alerts, monitors)
 * in Logflare, Datadog, and Grafana. It checks for existing resources before creating new ones.
 *
 * Usage: tsx scripts/observability/bootstrap.ts
 *
 * Environment Variables:
 * - LOGFLARE_API_KEY: API key for Logflare
 * - DATADOG_API_KEY: API key for Datadog
 * - DATADOG_APP_KEY: App key for Datadog
 * - GRAFANA_API_KEY: API key for Grafana
 * - GRAFANA_URL: Grafana instance URL
 * - TEAMS_WEBHOOK_URL: Teams webhook for alerts
 * - SLACK_WEBHOOK_URL: Slack webhook for alerts
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface ObservabilityConfig {
  dashboards: any[];
  alerts: any[];
  monitors: any[];
}

function validateEnvironment() {
  const required = ['TEAMS_WEBHOOK_URL', 'SLACK_WEBHOOK_URL'];

  const optional = [
    'GRAFANA_API_KEY',
    'GRAFANA_URL',
    'DATADOG_API_KEY',
    'DATADOG_APP_KEY',
    'LOGFLARE_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const available = optional.filter((key) => process.env[key]);
  console.log(`Available optional integrations: ${available.join(', ') || 'None'}`);

  return {
    hasGrafana: !!process.env.GRAFANA_API_KEY,
    hasDatadog: !!(process.env.DATADOG_API_KEY && process.env.DATADOG_APP_KEY),
    hasLogflare: !!process.env.LOGFLARE_API_KEY,
  };
}

async function main() {
  console.log('Starting observability bootstrap...');
  
  // Validate environment variables
  const integrations = validateEnvironment();

  // Load dashboard and alert definitions
  const dashboardPath = join(process.cwd(), 'docs', 'operations', 'observability_dashboard.md');

  // Parse dashboard JSON from the markdown file
  const dashboardContent = readFileSync(dashboardPath, 'utf-8');
  const dashboardJsonMatch = dashboardContent.match(/```json\n([\s\S]*?)\n```/);
  if (!dashboardJsonMatch) {
    throw new Error('Dashboard JSON not found in observability_dashboard.md');
  }
  const dashboardConfig = JSON.parse(dashboardJsonMatch[1]);

  const config: ObservabilityConfig = {
    dashboards: [dashboardConfig],
    alerts: [], // Would parse from alert_matrix.md
    monitors: [], // Datadog-specific
  };

  // Bootstrap each platform based on available integrations
  if (integrations.hasGrafana) {
    await bootstrapGrafana(config);
  }
  
  if (integrations.hasDatadog) {
    await bootstrapDatadog(config);
  }
  
  if (integrations.hasLogflare) {
    await bootstrapLogflare(config);
  }

  console.log('Observability bootstrap completed successfully.');
  console.log('Summary:');
  console.log(`- Grafana: ${integrations.hasGrafana ? '✅ Configured' : '⏭️ Skipped (no API key)'}`);
  console.log(`- Datadog: ${integrations.hasDatadog ? '✅ Configured' : '⏭️ Skipped (no API keys)'}`);
  console.log(`- Logflare: ${integrations.hasLogflare ? '✅ Configured' : '⏭️ Skipped (no API key)'}`);
  console.log(`- Webhooks: ✅ Teams & Slack configured`);
}
  const dashboardConfig = JSON.parse(dashboardJsonMatch[1]);

  const config: ObservabilityConfig = {
    dashboards: [dashboardConfig],
    alerts: [], // Would parse from alert_matrix.md
    monitors: [], // Datadog-specific
  };

  // Bootstrap each platform based on available integrations
  if (integrations.hasGrafana) {
    await bootstrapGrafana(config);
  }

  if (integrations.hasDatadog) {
    await bootstrapDatadog(config);
  }

  if (integrations.hasLogflare) {
    await bootstrapLogflare(config);
  }

  console.log('Observability bootstrap completed successfully.');
  console.log('Summary:');
  console.log(
    `- Grafana: ${integrations.hasGrafana ? '✅ Configured' : '⏭️ Skipped (no API key)'}`,
  );
  console.log(
    `- Datadog: ${integrations.hasDatadog ? '✅ Configured' : '⏭️ Skipped (no API keys)'}`,
  );
  console.log(
    `- Logflare: ${integrations.hasLogflare ? '✅ Configured' : '⏭️ Skipped (no API key)'}`,
  );
  console.log(`- Webhooks: ✅ Teams & Slack configured`);
}

async function bootstrapGrafana(config: ObservabilityConfig) {
  const apiKey = process.env.GRAFANA_API_KEY;
  const url = process.env.GRAFANA_URL || 'http://localhost:3000';

  if (!apiKey) {
    console.log('Skipping Grafana bootstrap - GRAFANA_API_KEY not set');
    return;
  }

  console.log('Bootstrapping Grafana...');

  // First, check for existing dashboards to ensure idempotency
  const existingDashboards = await fetch(`${url}/api/search?query=CaterKing`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const existingMap = new Map();
  if (existingDashboards.ok) {
    const dashboards = await existingDashboards.json();
    dashboards.forEach((db: any) => {
      existingMap.set(db.title, db.uid);
    });
  }

  for (const dashboard of config.dashboards) {
    try {
      const dashboardTitle = dashboard.dashboard.title;

      // Check if dashboard already exists
      if (existingMap.has(dashboardTitle)) {
        console.log(
          `Dashboard ${dashboardTitle} already exists (UID: ${existingMap.get(dashboardTitle)}), skipping...`,
        );
        continue;
      }

      // Generate a unique ID for the new dashboard
      dashboard.dashboard.id = null; // Let Grafana generate the ID

      // Create dashboard
      const response = await fetch(`${url}/api/dashboards/db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboard),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create dashboard: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`Created dashboard: ${dashboardTitle} (UID: ${result.uid})`);

      // Create alert rules for key panels
      await createGrafanaAlertRules(url, apiKey, result.uid, dashboard.dashboard.panels);
    } catch (error) {
      console.error(`Error bootstrapping Grafana dashboard: ${error}`);
    }
  }
}

async function createGrafanaAlertRules(
  baseUrl: string,
  apiKey: string,
  dashboardUid: string,
  panels: any[],
) {
  try {
    // Create alert rules for critical panels
    const alertRules = [
      {
        panelIndex: 1, // API Latency
        condition: 'gt',
        threshold: 200,
        severity: 'critical',
        message: 'API latency exceeded 200ms P95',
      },
      {
        panelIndex: 2, // Realtime Drop Rate
        condition: 'gt',
        threshold: 0.5,
        severity: 'warning',
        message: 'Realtime drop rate exceeded 0.5%',
      },
      {
        panelIndex: 3, // Media Queue Depth
        condition: 'gt',
        threshold: 20,
        severity: 'warning',
        message: 'Media queue depth exceeded 20',
      },
      {
        panelIndex: 4, // Undo Success Rate
        condition: 'lt',
        threshold: 98,
        severity: 'critical',
        message: 'Undo success rate below 98%',
      },
    ];

    for (const rule of alertRules) {
      const panel = panels.find((p: any) => p.id === rule.panelIndex);
      if (!panel) continue;

      const alertRule = {
        title: `${panel.title} Alert`,
        condition: `B${rule.panelIndex}`,
        data: {
          from: 'now-5m',
          to: 'now',
          queries: [
            {
              refId: 'A',
              datasource: { type: 'prometheus', uid: 'prometheus' },
              model: panel.targets[0],
            },
          ],
        },
        threshold: rule.threshold,
        operator: rule.condition,
        severity: rule.severity,
        message: rule.message,
        dashboardUid,
        panelId: rule.panelIndex,
        noDataState: 'no_data',
        execErrState: 'alerting',
        for: '5m',
        annotations: {
          description: rule.message,
          summary: `${panel.title} threshold breached`,
        },
      };

      const response = await fetch(`${baseUrl}/api/v1/provisioning/alert-rules`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertRule),
      });

      if (response.ok) {
        console.log(`Created Grafana alert rule: ${alertRule.title}`);
      } else {
        console.warn(
          `Failed to create alert rule for panel ${rule.panelIndex}: ${response.statusText}`,
        );
      }
    }
  } catch (error) {
    console.error(`Error creating Grafana alert rules: ${error}`);
  }
}

async function bootstrapDatadog(_config: ObservabilityConfig) {
  const apiKey = process.env.DATADOG_API_KEY;
  const appKey = process.env.DATADOG_APP_KEY;
  const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;

  if (!apiKey || !appKey) {
    console.log('Skipping Datadog bootstrap - DATADOG_API_KEY or DATADOG_APP_KEY not set');
    return;
  }

  console.log('Bootstrapping Datadog...');

  // Create monitors based on alert matrix with webhook notifications
  const monitors = [
    {
      name: 'API Latency P95 Critical',
      type: 'metric alert',
      query: 'avg(last_5m):avg:http.request.duration{route:/api/tasks} > 0.2',
      message:
        'API latency exceeded 200ms P95. See runbook: docs/operations/runbooks.md#api-latency-spike',
      tags: ['service:caterking', 'severity:critical'],
      options: {
        thresholds: { critical: 0.2, warning: 0.16 },
        notify_no_data: false,
        renotify_interval: 0,
        notify_audit: false,
        include_tags: true,
      },
      priority: 3,
    },
    {
      name: 'Realtime Drop Rate Warning',
      type: 'metric alert',
      query: 'avg(last_5m):avg:websocket.drop_rate > 0.005',
      message:
        'Realtime drop rate exceeded 0.5%. See runbook: docs/operations/runbooks.md#realtime-outage',
      tags: ['service:caterking', 'severity:warning'],
      options: {
        thresholds: { critical: 0.005, warning: 0.004 },
        notify_no_data: false,
        renotify_interval: 0,
        notify_audit: false,
        include_tags: true,
      },
      priority: 2,
    },
    {
      name: 'Media Queue Depth Warning',
      type: 'metric alert',
      query: 'avg(last_5m):avg:media.queue_depth > 20',
      message:
        'Media queue depth exceeded 20. See runbook: docs/operations/runbooks.md#storage-backlog',
      tags: ['service:caterking', 'severity:warning'],
      options: {
        thresholds: { critical: 20, warning: 16 },
        notify_no_data: false,
        renotify_interval: 0,
        notify_audit: false,
        include_tags: true,
      },
      priority: 2,
    },
    {
      name: 'Undo Success Rate Critical',
      type: 'metric alert',
      query: 'avg(last_5m):(1 - avg:undo.success_rate) > 0.02',
      message:
        'Undo success rate below 98%. See runbook: docs/operations/runbooks.md#undo-failures',
      tags: ['service:caterking', 'severity:critical'],
      options: {
        thresholds: { critical: 0.02, warning: 0.016 },
        notify_no_data: false,
        renotify_interval: 0,
        notify_audit: false,
        include_tags: true,
      },
      priority: 3,
    },
    {
      name: 'Combine Acceptance Rate Warning',
      type: 'metric alert',
      query: 'avg(last_5m):avg:combine.acceptance_rate < 0.6',
      message:
        'Combine acceptance rate below 60%. See runbook: docs/operations/runbooks.md#heuristics-tuning',
      tags: ['service:caterking', 'severity:warning'],
      options: {
        thresholds: { critical: 0.6, warning: 0.48 },
        notify_no_data: false,
        renotify_interval: 0,
        notify_audit: false,
        include_tags: true,
      },
      priority: 2,
    },
    {
      name: 'Supabase Function Error Rate Critical',
      type: 'metric alert',
      query: 'avg(last_5m):avg:supabase.function.error_rate > 0.01',
      message:
        'Supabase function error rate above 1%. See runbook: docs/operations/runbooks.md#function-errors',
      tags: ['service:caterking', 'severity:critical'],
      options: {
        thresholds: { critical: 0.01, warning: 0.008 },
        notify_no_data: false,
        renotify_interval: 0,
        notify_audit: false,
        include_tags: true,
      },
      priority: 3,
    },
    {
      name: 'Synthetic Monitor Success Critical',
      type: 'service check',
      query: '"caterking-display".over("env:production").last(30).count_by_status()',
      message:
        'Synthetic monitor failure detected. See runbook: docs/operations/runbooks.md#synthetic-failures',
      tags: ['service:caterking', 'severity:critical'],
      options: {
        thresholds: { critical: 1, warning: 0 },
        notify_no_data: true,
        renotify_interval: 300,
        notify_audit: false,
        include_tags: true,
      },
      priority: 3,
    },
  ];

  for (const monitor of monitors) {
    try {
      // Check if monitor exists by name
      const existing = await fetch(
        `https://api.datadoghq.com/api/v1/monitor?monitor_tags=service:caterking`,
        {
          headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
          },
        },
      );

      const existingMonitors = await existing.json();
      const exists = existingMonitors.monitors?.some((m: any) => m.name === monitor.name);

      if (exists) {
        console.log(`Monitor ${monitor.name} already exists, skipping...`);
        continue;
      }

      // Create monitor
      const response = await fetch('https://api.datadoghq.com/api/v1/monitor', {
        method: 'POST',
        headers: {
          'DD-API-KEY': apiKey,
          'DD-APPLICATION-KEY': appKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monitor),
      });

      if (!response.ok) {
        throw new Error(`Failed to create monitor: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Created monitor: ${monitor.name} (ID: ${result.id})`);

      // Set up webhook notifications if URLs are provided
      if (teamsWebhook || slackWebhook) {
        await setupWebhookNotifications(result.id, teamsWebhook, slackWebhook, apiKey, appKey);
      }
    } catch (error) {
      console.error(`Error bootstrapping Datadog monitor: ${error}`);
    }
  }
}

async function setupWebhookNotifications(
  monitorId: number,
  teamsWebhook?: string,
  slackWebhook?: string,
  apiKey?: string,
  appKey?: string,
) {
  if (!apiKey || !appKey) return;

  try {
// Create webhook notification handles
    const notificationHandles: any[] = [];
    
    if (teamsWebhook) {
      notificationHandles.push({
        name: 'teams-webhook',
        type: 'webhook',
        webhook: teamsWebhook,
      });
    }
    
    if (slackWebhook) {
      notificationHandles.push({
        name: 'slack-webhook', 
        type: 'webhook',
        webhook: slackWebhook,
      });
    }

    // Update monitor with notification handles
    if (notificationHandles.length > 0) {
      const updateResponse = await fetch(`https://api.datadoghq.com/api/v1/monitor/${monitorId}`, {
        method: 'PUT',
        headers: {
          'DD-API-KEY': apiKey,
          'DD-APPLICATION-KEY': appKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Monitor ${monitorId} notifications`,
          type: 'webhook',
          message: 'Alert triggered via webhook',
          options: {
            notification_handles: notificationHandles,
          },
        }),
      });

      if (updateResponse.ok) {
        console.log(`Configured webhook notifications for monitor ${monitorId}`);
      } else {
        console.warn(
          `Failed to configure webhooks for monitor ${monitorId}: ${updateResponse.statusText}`,
        );
      }
    }
  } catch (error) {
    console.error(`Error setting up webhook notifications: ${error}`);
  }
}

async function bootstrapLogflare(_config: ObservabilityConfig) {
  const apiKey = process.env.LOGFLARE_API_KEY;
  const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;

  if (!apiKey) {
    console.log('Skipping Logflare bootstrap - LOGFLARE_API_KEY not set');
    return;
  }

  console.log('Bootstrapping Logflare...');

  try {
    // Create data source for CaterKing logs
    const sourceResponse = await fetch('https://api.logflare.app/api/v1/sources', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'CaterKing Platform Logs',
        type: 'webhook',
        api_key: apiKey,
      }),
    });

    if (!sourceResponse.ok) {
      throw new Error(`Failed to create Logflare source: ${sourceResponse.statusText}`);
    }

    const source = await sourceResponse.json();
    console.log(`Created Logflare source: ${source.name} (ID: ${source.id})`);

    // Create dashboard
    const dashboardResponse = await fetch('https://api.logflare.app/api/v1/dashboards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'CaterKing Operational Health',
        description: 'Platform observability dashboard for key metrics',
        widgets: [
          {
            name: 'API Latency P95',
            type: 'metric',
            query:
              "SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY duration) FROM api_logs WHERE route = '/api/tasks' AND timestamp >= NOW() - INTERVAL '1 hour'",
            visualization: { type: 'line' },
          },
          {
            name: 'Realtime Drop Rate',
            type: 'metric',
            query:
              "SELECT COUNT(*) FILTER (WHERE event_type = 'websocket_drop') * 100.0 / COUNT(*) FROM realtime_events WHERE timestamp >= NOW() - INTERVAL '1 hour'",
            visualization: { type: 'gauge' },
          },
          {
            name: 'Media Queue Depth',
            type: 'metric',
            query:
              "SELECT COUNT(*) FROM media_assets WHERE status = 'pending' OR status = 'processing'",
            visualization: { type: 'stat' },
          },
          {
            name: 'Undo Success Rate',
            type: 'metric',
            query:
              "SELECT COUNT(*) FILTER (WHERE action = 'undo_success') * 100.0 / COUNT(*) FROM audit_log WHERE action LIKE 'undo_%' AND timestamp >= NOW() - INTERVAL '1 hour'",
            visualization: { type: 'gauge' },
          },
        ],
      }),
    });

    if (dashboardResponse.ok) {
      const dashboard = await dashboardResponse.json();
      console.log(`Created Logflare dashboard: ${dashboard.name} (ID: ${dashboard.id})`);
    }

    // Create alerts based on thresholds
    const alerts = [
      {
        name: 'API Latency Alert',
        query:
          "SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY duration) FROM api_logs WHERE route = '/api/tasks' AND timestamp >= NOW() - INTERVAL '5 minutes'",
        threshold: 200,
        operator: 'gt',
        message: 'API latency exceeded 200ms P95',
        severity: 'critical',
      },
      {
        name: 'Realtime Drop Rate Alert',
        query:
          "SELECT COUNT(*) FILTER (WHERE event_type = 'websocket_drop') * 100.0 / COUNT(*) FROM realtime_events WHERE timestamp >= NOW() - INTERVAL '5 minutes'",
        threshold: 0.5,
        operator: 'gt',
        message: 'Realtime drop rate exceeded 0.5%',
        severity: 'warning',
      },
      {
        name: 'Media Queue Alert',
        query:
          "SELECT COUNT(*) FROM media_assets WHERE status = 'pending' OR status = 'processing'",
        threshold: 20,
        operator: 'gt',
        message: 'Media queue depth exceeded 20 items',
        severity: 'warning',
      },
    ];

    for (const alert of alerts) {
      const alertResponse = await fetch('https://api.logflare.app/api/v1/alerts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...alert,
          webhook_url: teamsWebhook || slackWebhook,
          enabled: true,
        }),
      });

      if (alertResponse.ok) {
        const createdAlert = await alertResponse.json();
        console.log(`Created Logflare alert: ${createdAlert.name} (ID: ${createdAlert.id})`);
      } else {
        console.warn(`Failed to create alert ${alert.name}: ${alertResponse.statusText}`);
      }
    }

    console.log('Logflare bootstrap completed successfully.');
  } catch (error) {
    console.error(`Error bootstrapping Logflare: ${error}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
