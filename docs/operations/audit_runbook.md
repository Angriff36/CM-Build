# Audit Runbook

## Overview

This runbook describes the audit logging system for PrepChef, including access controls, retention policies, and export procedures. The audit system tracks all critical actions to ensure accountability and compliance.

## Access Controls

### Reading Audit Logs

- **Policy**: All authenticated users within a company can read audit logs for their company.
- **Implementation**: Enforced via Row Level Security (RLS) on `audit_logs` table.
- **Roles**: No role restrictions for reading; system handles inserts automatically.
- **Verification**: pgTAP tests confirm tenant isolation and read permissions.

### Writing Audit Logs

- **Policy**: Only system functions can insert audit entries; no direct user inserts allowed.
- **Implementation**: Functions use `SECURITY DEFINER` and insert via triggers or explicit logging.
- **Roles**: Automatic based on user context in functions.
- **Verification**: pgTAP tests verify insert capability for system operations.

## Retention Policies

### Current Policy

- **Retention Period**: Indefinite (no automatic deletion).
- **Rationale**: Audit logs are critical for compliance and debugging; retention TBD based on legal requirements.
- **Storage**: Logs stored in `audit_logs` table with JSONB diffs for detailed change tracking.
- **Critical Events**: Combination approvals, rollbacks, and reassignments flagged for extended retention.

### Future Enhancements

- Implement time-based retention (e.g., 7 years for compliance).
- Add archival to cheaper storage for older logs.
- Compress old log diffs to reduce storage costs.
- Tiered retention: Critical events (7 years), routine events (2 years).

## Export Procedures

### Manual Export

1. **Query Logs**: Use Supabase client or direct SQL to query `audit_logs` table.
2. **Filters**: Filter by `company_id`, date range, `entity_type`, `action`, etc.
3. **Format**: Export as CSV or JSON.
4. **Example CLI**: Run `scripts/audit/report.ts` for last 24h summary.

### CLI Report Generation

- **Script**: `scripts/audit/report.ts`
- **Usage**: `node scripts/audit/report.ts`
- **Output**: Formatted table of critical events from last 24 hours
- **Events Tracked**: combine, approve_combine, reject_combine, reassign, snapshot, undo, undo_combine, rollback
- **Environment**: Requires SUPABASE_URL and SUPABASE_ANON_KEY
- **Format**: Timestamp, User ID, Entity, Action, Details (truncated)

**Example Output:**

```
Audit Report - Last 24 Hours
==============================

Timestamp           User ID                             Entity         Action          Details
-------------------- ------------------------------------ -------------- --------------- --------------------------------------------------
2025-12-11 14:30:22 123e4567-e89b-12d3-a456-426614174000 task:123e4567  approve_combine {"suggestion_id":"456e...", "task_ids":["123e..."]}
2025-12-11 14:25:15 123e4567-e89b-12d3-a456-426614174000 task:789e0123  rollback       {"rollback_diff":{"status":"claimed"->"available"}}

Total events: 2
```

### Automated Export

- **Scheduled**: Use cron jobs or Supabase Edge Functions for periodic exports.
- **Destinations**: Export to S3, GCS, or internal storage.
- **Formats**: JSON lines for ingestion into SIEM systems.

### Compliance Exports

- **On-Demand**: Generate exports for audits or legal requests.
- **Verification**: Include hash verification for integrity.
- **Retention**: Exported files retained per compliance requirements.

## Key Actions Logged

- Task claims, completions, undos
- Task combinations (combine, approve_combine, reject_combine, undo_combine)
- Board reassignments (reassign)
- Display snapshots (snapshot)
- Rollback actions with detailed before/after state diffs
- Role changes and user management
- All mutations include undo_token referencing audit_log_id for revert capability

## Enhanced Audit Infrastructure

### Rollback Logging

- **Function**: `log_rollback(entity_type, entity_id, rollback_diff, reason)`
- **Purpose**: Captures detailed state changes during rollback operations
- **Diff Format**: JSONB containing before/after state comparison
- **Access**: Managers and above can log rollbacks
- **Audit Link**: Rollback entries reference original audit_log_id

### Combination Approval Workflow

- **Approve Function**: `approve_combine(suggestion_id)` - Combines tasks and logs approval
- **Reject Function**: `reject_combine(suggestion_id)` - Logs rejection with reasoning
- **Audit Trail**: Complete chain from suggestion → decision → action → rollback
- **Undo Tokens**: Each combination generates undo token linked to audit_log_id

### Display Snapshot Logging

- **Function**: `log_snapshot(display_id, snapshot_data)` - Captures display state
- **Data**: Full snapshot data stored in diff field for reconstruction
- **Access**: All authenticated users can log snapshots
- **Use Case**: Audit trail for display changes and board reassignments

## Monitoring

- **Alerts**: Monitor for unusual activity (e.g., high volume of undos).
- **Dashboards**: Use audit logs for operational dashboards.
- **Reports**: Generate weekly summaries of critical actions.

## References

- RLS Policies: `docs/security/rls_policies.md`
- Schema: `supabase/migrations/0002_rls_policies.sql`
- Tests: `supabase/tests/rls_policies.sql`
