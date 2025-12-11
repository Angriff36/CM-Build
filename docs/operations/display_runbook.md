# Display Runbook

## Overview

The display app provides a kiosk-mode wall display for CaterKing operations, showing task summaries, urgent assignments, device presence, and diagnostics. It rotates views every 30 seconds and handles offline scenarios gracefully.

## Kiosk Mode

- **Detection**: Automatically detects kiosk browsers or fullscreen mode.
- **Lock**: Hides cursor and requests fullscreen on load.
- **Admin Access**: Hold Shift + type 'ADMIN' to open settings modal.

## Heartbeat Monitoring

- **Endpoint**: `/api/presence`
- **Check Interval**: Every 60 seconds
- **Stale Threshold**: 5 minutes since last heartbeat
- **Alerts**: Browser alert when stale; check device connection

## Offline Handling

- **Fallback**: Shows cached data with timestamp when offline
- **Caching**: Stores last fetched data in localStorage
- **Banner**: Amber banner for realtime disconnect, grey for offline mode

## Rotation Scheduling

- **Views**: Summary grid, urgent queue, presence lane, offline diagnostics
- **Interval**: 30 seconds
- **Telemetry**: Logs rotation events to console

## Manual Refresh

- Reload page or trigger refresh via admin settings

## Signage Guidelines

- Color-coded tiles to avoid distraction
- Minimal animation to prevent burn-in
- Ensure high contrast for visibility

## Cross-links

- See [Media Pipeline](../operations/media_pipeline.md) for queue monitoring patterns and automation integration
- [UI/UX Architecture](../../architecture/06_UI_UX_Architecture.md) for design details and observability requirements
- [Feature Flag Runbook](./feature_flag_runbook.md) for display configuration management
- [Audit Runbook](./audit_runbook.md) for device presence logging and compliance
