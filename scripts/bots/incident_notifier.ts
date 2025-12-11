#!/usr/bin/env tsx

/**
 * Incident Notifier Bot
 *
 * This script hooks into observability alerts and sends notifications to Slack/Teams.
 * It can be run as a webhook receiver or as a periodic checker.
 *
 * Usage:
 * - Webhook mode: tsx scripts/bots/incident_notifier.ts --webhook
 * - Check mode: tsx scripts/bots/incident_notifier.ts --check
 *
 * Environment Variables:
 * - SLACK_WEBHOOK_URL: Slack webhook URL for notifications
 * - TEAMS_WEBHOOK_URL: Teams webhook URL for notifications (optional)
 * - PORT: Port for webhook server (default: 3001)
 */

import { createServer } from 'http';
import { parse } from 'url';

interface Alert {
  name: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  runbook_link?: string;
  timestamp: string;
  source: string;
}

async function sendNotification(alert: Alert, webhookUrl: string) {
  const payload = {
    text: `*${alert.severity.toUpperCase()}*: ${alert.name}\n${alert.message}\nRunbook: ${alert.runbook_link || 'N/A'}\nSource: ${alert.source}\nTime: ${alert.timestamp}`,
    attachments: [
      {
        color:
          alert.severity === 'critical'
            ? 'danger'
            : alert.severity === 'warning'
              ? 'warning'
              : 'good',
        fields: [
          {
            title: 'Severity',
            value: alert.severity,
            short: true,
          },
          {
            title: 'Source',
            value: alert.source,
            short: true,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to send notification to ${webhookUrl}: ${response.statusText}`);
    } else {
      console.log(`Notification sent for alert: ${alert.name}`);
    }
  } catch (error) {
    console.error(`Error sending notification: ${error}`);
  }
}

async function handleAlert(alert: Alert) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;

  if (slackWebhook) {
    await sendNotification(alert, slackWebhook);
  }

  if (teamsWebhook) {
    await sendNotification(alert, teamsWebhook);
  }

  if (!slackWebhook && !teamsWebhook) {
    console.warn('No webhook URLs configured. Set SLACK_WEBHOOK_URL or TEAMS_WEBHOOK_URL');
  }
}

function startWebhookServer(port: number = 3001) {
  const server = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/alert') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const alert: Alert = JSON.parse(body);
          console.log(`Received alert: ${alert.name}`);

          await handleAlert(alert);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        } catch (error) {
          console.error('Error processing alert:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid alert format' }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    console.log(`Incident notifier webhook server listening on port ${port}`);
    console.log('Send POST requests to /alert with alert JSON payload');
  });
}

async function checkAlerts() {
  // This would integrate with actual observability APIs
  // For now, simulate checking for alerts
  console.log('Checking for new alerts...');

  // Example: Query Datadog/Logflare APIs for recent alerts
  // This is a placeholder - actual implementation would depend on the observability setup

  const mockAlerts: Alert[] = [
    // Add logic to fetch real alerts here
  ];

  for (const alert of mockAlerts) {
    await handleAlert(alert);
  }

  console.log('Alert check completed.');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--webhook')) {
    const port = parseInt(process.env.PORT || '3001', 10);
    startWebhookServer(port);
  } else if (args.includes('--check')) {
    await checkAlerts();
  } else {
    console.log('Usage:');
    console.log('  --webhook: Start webhook server to receive alerts');
    console.log('  --check: Check for new alerts and send notifications');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
