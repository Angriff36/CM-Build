# Alert Matrix

This document defines the alert matrix for the CaterKing platform, mapping operational metrics to severity levels, notification channels, and runbook links. Alerts are configured in Logflare/Datadog/Grafana with webhooks to Teams and Slack channels.

## Alert Configuration Overview

- **Severity Levels**:
  - **Info**: Informational alerts for monitoring trends
  - **Warning**: Actionable alerts requiring attention within 30 minutes
  - **Critical**: High-priority alerts requiring immediate response (<5 minutes)

- **Notification Channels**:
  - **Teams**: Primary channel for ops team (#ops-incidents)
  - **Slack**: Backup channel (#caterking-alerts)
  - **On-call Pager**: For critical alerts outside business hours

- **Thresholds**: Based on operational metrics catalog targets, with warning at 80% of critical threshold

## Alert Matrix Table

| Metric                                   | Warning Threshold     | Critical Threshold | Severity | Notification Channels | Runbook Link                                     | Description                          |
| ---------------------------------------- | --------------------- | ------------------ | -------- | --------------------- | ------------------------------------------------ | ------------------------------------ |
| API Latency P95 (/api/tasks)             | >160ms (80% of 200ms) | >200ms             | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#api-latency-spike    | High latency impacts user experience |
| Supabase RPC Latency P95                 | >120ms (80% of 150ms) | >150ms             | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#rpc-performance      | Database performance degradation     |
| Realtime Drop Rate                       | >0.4% (80% of 0.5%)   | >0.5%              | Warning  | Teams, Slack          | docs/operations/runbooks.md#realtime-outage      | Websocket connection issues          |
| Media Queue Depth                        | >16 (80% of 20)       | >20                | Warning  | Teams, Slack          | docs/operations/runbooks.md#storage-backlog      | Transcoding backlog buildup          |
| Undo Success Rate                        | <98.4% (80% of 98%)   | <98%               | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#undo-failures        | Core feature reliability             |
| Combine Acceptance Rate                  | <48% (80% of 60%)     | <60%               | Warning  | Teams, Slack          | docs/operations/runbooks.md#heuristics-tuning    | AI suggestion effectiveness          |
| Storage Transcoding Success              | <99.2% (80% of 99%)   | <99%               | Warning  | Teams, Slack          | docs/operations/runbooks.md#media-processing     | Media upload failures                |
| Supabase Function Error Rate             | >0.8% (80% of 1%)     | >1%                | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#function-errors      | Edge function failures               |
| Realtime Subscription Count per Tenant   | >160 (80% of 200)     | >200               | Warning  | Teams, Slack          | docs/operations/runbooks.md#realtime-capacity    | Connection limits exceeded           |
| Flagsmith API Latency                    | >80ms (80% of 100ms)  | >100ms             | Warning  | Teams, Slack          | docs/operations/runbooks.md#feature-flag-latency | Feature flag service issues          |
| Admin CRM Drag-Drop Latency              | >240ms (80% of 300ms) | >300ms             | Warning  | Teams, Slack          | docs/operations/runbooks.md#admin-performance    | Admin UI responsiveness              |
| Recipe Drawer Latency                    | >200ms (80% of 250ms) | >250ms             | Warning  | Teams, Slack          | docs/operations/runbooks.md#recipe-performance   | Recipe access delays                 |
| Audit Log Ingestion Lag                  | >4s (80% of 5s)       | >5s                | Warning  | Teams, Slack          | docs/operations/runbooks.md#audit-lag            | Compliance logging delays            |
| Vercel Edge Cold Start Rate              | >4% (80% of 5%)       | >5%                | Warning  | Teams, Slack          | docs/operations/runbooks.md#cold-starts          | Deployment performance               |
| Synthetic Monitor Success                | <100%                 | <100%              | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#synthetic-failures   | Uptime monitoring failures           |
| Playwright Smoke Pass Rate               | <100%                 | <100%              | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#test-failures        | CI/CD quality gates                  |
| Build Pipeline Duration                  | >8min (80% of 10min)  | >10min             | Warning  | Teams, Slack          | docs/operations/runbooks.md#build-delays         | Release velocity impact              |
| Database Connection Count per Tenant     | >40 (80% of 50)       | >50                | Warning  | Teams, Slack          | docs/operations/runbooks.md#connection-limits    | Resource exhaustion                  |
| Undo Queue Backlog                       | >80 (80% of 100)      | >100               | Warning  | Teams, Slack          | docs/operations/runbooks.md#undo-backlog         | Memory pressure                      |
| Supabase Index Bloat                     | >16% (80% of 20%)     | >20%               | Warning  | Teams, Slack          | docs/operations/runbooks.md#index-bloat          | Query performance degradation        |
| Observability Log Ingestion Lag          | >1.6min (80% of 2min) | >2min              | Warning  | Teams, Slack          | docs/operations/runbooks.md#log-ingestion        | Monitoring data delay                |
| On-call Response Time                    | >4min (80% of 5min)   | >5min              | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#response-time        | Incident handling SLA                |
| Supabase Cron Job Success                | <100%                 | <100%              | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#cron-failures        | Scheduled task failures              |
| Doppler Access Anomalies                 | >0                    | >0                 | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#doppler-anomalies    | Secret access security               |
| Device Presence Heartbeat Freshness      | >48s (80% of 60s)     | >60s               | Warning  | Teams, Slack          | docs/operations/runbooks.md#device-heartbeat     | Kiosk offline detection              |
| Combined Task Heuristics CPU             | >48% (80% of 60%)     | >60%               | Warning  | Teams, Slack          | docs/operations/runbooks.md#cpu-usage            | Function resource limits             |
| Supabase Storage Egress per Tenant       | Exceeds budget        | Exceeds budget     | Warning  | Teams, Slack          | docs/operations/runbooks.md#egress-budget        | Cost overrun                         |
| Admin CRM Data Export Time               | >4s (80% of 5s)       | >5s                | Warning  | Teams, Slack          | docs/operations/runbooks.md#export-time          | Data export delays                   |
| Supabase PITR Snapshot Age               | >19.2h (80% of 24h)   | >24h               | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#pitr-age             | Backup freshness                     |
| Staff Device Offline Alerts              | >0 unacknowledged     | >0 unacknowledged  | Info     | Teams                 | docs/operations/runbooks.md#device-offline       | Operational awareness                |
| Observability Ingestion Cost per Tenant  | Trending up           | Budget exceeded    | Warning  | Teams, Slack          | docs/operations/runbooks.md#ingestion-cost       | Cost monitoring                      |
| Cron Job Scheduling Drift                | >0 missed             | >0 missed          | Warning  | Teams, Slack          | docs/operations/runbooks.md#cron-drift           | Task scheduling issues               |
| Server Component Data Fetch Errors       | >0.08% (80% of 0.1%)  | >0.1%              | Warning  | Teams, Slack          | docs/operations/runbooks.md#data-fetch-errors    | Application errors                   |
| Supabase Function Deployment Failures    | >0                    | >0                 | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#deployment-failures  | Release blocking                     |
| Schema Drift Detection                   | >0 differences        | >0 differences     | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#schema-drift         | Data integrity                       |
| API Error Budget Consumption             | Exceeds SLO           | Exceeds SLO        | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#error-budget         | SLA breach                           |
| Observability Unresolved Alerts Backlog  | >4 (80% of 5)         | >5                 | Warning  | Teams, Slack          | docs/operations/runbooks.md#alert-backlog        | Alert management                     |
| Supabase CPU Utilization                 | >56% (80% of 70%)     | >70%               | Warning  | Teams, Slack          | docs/operations/runbooks.md#cpu-utilization      | Resource saturation                  |
| Post-incident Action Completion          | <100%                 | <100%              | Info     | Teams                 | docs/operations/runbooks.md#post-incident        | Process compliance                   |
| Device Presence False Positives          | >0.8% (80% of 1%)     | >1%                | Info     | Teams                 | docs/operations/runbooks.md#false-positives      | Monitoring accuracy                  |
| Flagsmith SDK Sync Errors                | >0                    | >0                 | Warning  | Teams, Slack          | docs/operations/runbooks.md#sdk-sync             | Feature flag reliability             |
| Supabase Log Retention Compliance        | <100%                 | <100%              | Warning  | Teams, Slack          | docs/operations/runbooks.md#log-retention        | Compliance risk                      |
| Next.js Build Cache Hit Rate             | <80%                  | <80%               | Info     | Teams                 | docs/operations/runbooks.md#build-cache          | Build optimization                   |
| Media CDN Cache Hit Rate                 | <90%                  | <90%               | Info     | Teams                 | docs/operations/runbooks.md#cdn-cache            | Performance optimization             |
| Observability Trace Sampling             | <100%                 | <100%              | Warning  | Teams, Slack          | docs/operations/runbooks.md#trace-sampling       | Observability coverage               |
| Database Vacuum Success                  | <100%                 | <100%              | Warning  | Teams, Slack          | docs/operations/runbooks.md#vacuum-success       | Maintenance failures                 |
| Lint/Typecheck Failure Ratio             | >1.6% (80% of 2%)     | >2%                | Warning  | Teams, Slack          | docs/operations/runbooks.md#lint-failures        | Code quality                         |
| Playwright Flake Rate                    | >2.4% (80% of 3%)     | >3%                | Warning  | Teams, Slack          | docs/operations/runbooks.md#flake-rate           | Test reliability                     |
| Supabase Realtime Channel Errors         | >0                    | >0                 | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#channel-errors       | Realtime failures                    |
| Realtime Heartbeat Latency               | >0.8s (80% of 1s)     | >1s                | Warning  | Teams, Slack          | docs/operations/runbooks.md#heartbeat-latency    | Connection health                    |
| Task Assignment Failures                 | >1.6 (80% of 2/month) | >2/month           | Info     | Teams                 | docs/operations/runbooks.md#assignment-failures  | Support tickets                      |
| Data Export Request Time                 | >3.2h (80% of 4h)     | >4h                | Warning  | Teams, Slack          | docs/operations/runbooks.md#export-request-time  | Customer delays                      |
| Admin CRM File Upload Error Rate         | >0.8% (80% of 1%)     | >1%                | Warning  | Teams, Slack          | docs/operations/runbooks.md#upload-errors        | Admin functionality                  |
| Supabase RLS Test Runtime                | >4min (80% of 5min)   | >5min              | Warning  | Teams, Slack          | docs/operations/runbooks.md#rls-test-runtime     | Security testing                     |
| Heuristic Tuning Cycle Time              | >1 month              | >1 month           | Info     | Teams                 | docs/operations/runbooks.md#tuning-cycle         | AI maintenance                       |
| Recipe Drawer Offline Cache Usage        | >0                    | >0                 | Warning  | Teams, Slack          | docs/operations/runbooks.md#offline-cache        | Assumption validation                |
| Staff Device Version Compliance          | <95%                  | <95%               | Info     | Teams                 | docs/operations/runbooks.md#version-compliance   | Update management                    |
| CLI Automation Coverage                  | <80%                  | <80%               | Info     | Teams                 | docs/operations/runbooks.md#automation-coverage  | Process improvement                  |
| Observability Alert Acknowledgement Time | >2.4min (80% of 3min) | >3min              | Warning  | Teams, Slack          | docs/operations/runbooks.md#acknowledgement-time | Response efficiency                  |
| Disaster Recovery Drill Completeness     | <100%                 | <100%              | Critical | Teams, Slack, Pager   | docs/operations/runbooks.md#dr-drill             | Preparedness                         |

## Webhook Configuration

Alerts are sent via webhooks to:

- **Teams Webhook URL**: `${TEAMS_WEBHOOK_URL}`
- **Slack Webhook URL**: `${SLACK_WEBHOOK_URL}`

Environment variables are managed in Doppler.

## Escalation Procedures

- **Warning**: Acknowledge within 30 minutes, resolve within 2 hours
- **Critical**: Page on-call immediately, resolve within 1 hour
- **Info**: Monitor trends, no immediate action required

## Runbook Maintenance

Runbooks are updated after each incident per section 3.5.2 of Operational Architecture. Links point to `docs/operations/runbooks.md` with anchors for each scenario.
