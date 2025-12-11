# Feature Flag Matrix

This document defines the feature flags managed via Flagsmith, including defaults, rollout owners, telemetry metrics, and kill switches. All flags default to "off" in production for safety, as per the [Feature Flag Runbook](feature_flag_runbook.md).

## Flag Defaults

| Flag Key                  | Dev Default | Staging Default | Prod Default | Rollout Owner | Telemetry Metric      | Kill Switch | Description                        |
| ------------------------- | ----------- | --------------- | ------------ | ------------- | --------------------- | ----------- | ---------------------------------- |
| prep.task.combine.v2      | on          | off             | off          | Dev Team      | Task combination rate | Yes         | Enables new task combination logic |
| ui.new_dashboard          | on          | off             | off          | UI Team       | Dashboard load time   | Yes         | New dashboard UI components        |
| beta.features             | on          | off             | off          | Product Team  | Feature adoption      | Yes         | Beta feature access                |
| performance.optimizations | off         | off             | off          | Ops Team      | Page load times       | No          | Performance enhancements           |
| realtime.updates          | on          | on              | on           | Dev Team      | Real-time latency     | Yes         | Real-time task updates             |

## Lifecycle Management

Flags follow the process in `feature_flag_runbook.md`: creation with `scope.feature.variant` naming, rollout starting in dev, monitoring via telemetry, and removal with cleanup PRs.

## Verification Commands

- Validate flag defaults: `doppler run --config ck-prod -- flagsmith get-flags`
- Check rollout status: Flagsmith dashboard or API
