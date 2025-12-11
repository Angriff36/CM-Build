# Observability Dashboards

This document defines the observability dashboards for the CaterKing platform, covering key metrics for API latency, realtime drop rate, media queue depth, undo success, and combine exposures. Dashboards are configured in Logflare, Datadog, and Grafana to provide unified visibility across environments.

## Dashboard Overview

The main dashboard "CaterKing Operational Health" aggregates KPIs from the operational metrics catalog (section 3.12 of Operational Architecture). It includes panels for:

- API Latency (P95)
- Realtime Drop Rate
- Media Queue Depth
- Undo Success Rate
- Combine Exposures Acceptance Rate
- Additional supporting metrics (RPC latency, storage growth, etc.)

Dashboards are tenant-scoped where applicable, allowing account managers to monitor adoption health per customer.

## Grafana Dashboard Definition

The following JSON can be imported into Grafana to create the dashboard. It assumes a Prometheus-compatible data source (adapt for Logflare/Datadog as needed).

```json
{
  "dashboard": {
    "id": null,
    "title": "CaterKing Operational Health",
    "tags": ["caterking", "observability"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "API Latency P95 (/api/tasks)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{route=\"/api/tasks\"}[5m]))",
            "legendFormat": "P95 Latency"
          }
        ],
        "yAxes": [
          {
            "unit": "seconds",
            "min": 0,
            "max": 0.5
          }
        ],
        "thresholds": [
          {
            "value": 0.2,
            "colorMode": "critical",
            "op": "gt"
          }
        ]
      },
      {
        "id": 2,
        "title": "Realtime Drop Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(websocket_drops_total[5m]) / rate(websocket_connections_total[5m]) * 100",
            "legendFormat": "Drop Rate %"
          }
        ],
        "yAxes": [
          {
            "unit": "percent",
            "min": 0,
            "max": 1
          }
        ],
        "thresholds": [
          {
            "value": 0.5,
            "colorMode": "warning",
            "op": "gt"
          }
        ]
      },
      {
        "id": 3,
        "title": "Media Queue Depth",
        "type": "graph",
        "targets": [
          {
            "expr": "media_queue_pending_count",
            "legendFormat": "Pending Items"
          }
        ],
        "yAxes": [
          {
            "unit": "short",
            "min": 0,
            "max": 50
          }
        ],
        "thresholds": [
          {
            "value": 20,
            "colorMode": "warning",
            "op": "gt"
          }
        ]
      },
      {
        "id": 4,
        "title": "Undo Success Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(undo_success_total[5m]) / rate(undo_attempts_total[5m]) * 100",
            "legendFormat": "Success Rate %"
          }
        ],
        "yAxes": [
          {
            "unit": "percent",
            "min": 95,
            "max": 100
          }
        ],
        "thresholds": [
          {
            "value": 98,
            "colorMode": "critical",
            "op": "lt"
          }
        ]
      },
      {
        "id": 5,
        "title": "Combine Exposures Acceptance Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(combine_accepted_total[5m]) / rate(combine_suggested_total[5m]) * 100",
            "legendFormat": "Acceptance Rate %"
          }
        ],
        "yAxes": [
          {
            "unit": "percent",
            "min": 50,
            "max": 80
          }
        ],
        "thresholds": [
          {
            "value": 60,
            "colorMode": "warning",
            "op": "lt"
          }
        ]
      },
      {
        "id": 6,
        "title": "Supabase RPC Latency P95",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(supabase_rpc_duration_seconds_bucket[5m]))",
            "legendFormat": "P95 RPC Latency"
          }
        ],
        "yAxes": [
          {
            "unit": "seconds",
            "min": 0,
            "max": 0.2
          }
        ],
        "thresholds": [
          {
            "value": 0.15,
            "colorMode": "critical",
            "op": "gt"
          }
        ]
      },
      {
        "id": 7,
        "title": "Realtime Subscription Count per Tenant",
        "type": "table",
        "targets": [
          {
            "expr": "sum(realtime_subscriptions) by (company_id)",
            "legendFormat": "{{company_id}}"
          }
        ],
        "thresholds": [
          {
            "value": 200,
            "colorMode": "warning",
            "op": "gt"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5m"
  }
}
```

## Sample Graphs

Below are ASCII representations of sample graphs (replace with actual screenshots in production).

### API Latency P95

```
Latency (ms)
  250 |          *
  200 |         ***
  150 |       ******
  100 |     *********
   50 |   ************
    0 |________________
      Time (last hour)
Threshold: 200ms (red line)
```

### Realtime Drop Rate

```
Drop Rate (%)
  1.0 |
  0.8 |
  0.6 |    *
  0.4 |   ***
  0.2 |  *****
  0.0 |_________
      Time
Threshold: 0.5% (yellow line)
```

### Media Queue Depth

```
Queue Depth
   25 |
   20 |    * (threshold)
   15 |   ***
   10 |  *****
    5 | ******
    0 |_________
      Time
```

### Undo Success Rate

```
Success Rate (%)
  100 | ************
   98 |    * (threshold)
   96 |
   94 |
      Time
```

### Combine Exposures Acceptance Rate

```
Acceptance Rate (%)
   70 |   ***
   65 |  *****
   60 |    * (threshold)
   55 |
      Time
```

## Logflare/Datadog Configuration

For Logflare:

- Create a dashboard named "CaterKing Ops"
- Add charts for each metric using LiveView queries
- Example query for API latency: `SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY duration) FROM api_logs WHERE route = '/api/tasks'`

For Datadog:

- Use the dashboard JSON import feature
- Configure monitors for thresholds
- Set up SLO widgets for key metrics

## Access and Permissions

- Dashboards are accessible via the observability platform URLs
- Tenant-specific views require company_id filtering
- Account managers have read-only access to their tenant's data
- Ops team has full edit permissions

## Data Freshness

- Dashboard data refreshes every 1 minute (target <1 minute lag)
- Alerts trigger within 5 minutes of threshold breach
- Historical data retained for 30 days in hot storage
