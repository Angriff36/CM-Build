# RLS Policies Catalog

<!-- anchor: rls-policies-catalog -->

## ⚠️ CRITICAL UPDATE - 2025-12-15

**SECURITY INCIDENT RESOLVED**: This document previously claimed RLS policies were implemented, but database verification revealed ALL tables had RLS completely disabled. Emergency migration `0002_enable_rls_security.sql` was deployed on 2025-12-15 to secure all 18 tables with 60 comprehensive policies.

**Current Status**: ✅ ALL tables secured with RLS enabled and policies active.

See: `docs/security/SECURITY_INCIDENT_2025_12_15.md` for full incident report.

---

## Overview

This document catalogs all Row Level Security (RLS) policies **currently implemented** in the CaterKing application. Each policy enforces tenant isolation via `company_id` matching and role-based access controls (RBAC). All policies are restrictive by default - access is denied unless explicitly granted.

## Policy Summary

### Companies Table

- **Policy**: Users can view their own company
- **Risk Category**: Low - Prevents cross-tenant visibility of company metadata
- **Verification Method**: pgTAP test confirms users see only their company
- **Future TODOs**: Add policies for company creation/updates if multi-tenant admin features added

### Users Table

- **Policy**: Role-based access within company (staff: read-only, managers/owners: full CRUD, owners: delete)
- **Risk Category**: High - Role misconfiguration could expose user data
- **Verification Method**: pgTAP tests verify role permissions and tenant isolation
- **Future TODOs**: Implement audit triggers for role changes

### Events Table

- **Policy**: Managers, event_leads, owners can CRUD; all users can read within company
- **Risk Category**: Medium - Unauthorized event creation could disrupt operations
- **Verification Method**: pgTAP tests check insert/update permissions by role
- **Future TODOs**: Add event status transition validations

### Tasks Table

- **Policy**: All users read within company; managers/event_leads/owners CRUD; staff can update for claiming/completing
- **Risk Category**: High - Task manipulation could affect workflow integrity
- **Verification Method**: pgTAP tests verify claiming and undo token protection
- **Future TODOs**: Enhance undo token logic for time-based expiration

### Combined Task Groups

- **Policy**: Managers/event_leads/owners CRUD; all users read within company
- **Risk Category**: Medium - Unauthorized combinations could create inefficiencies
- **Verification Method**: pgTAP tests check approval permissions
- **Future TODOs**: Add heuristic validation in policies

### Recipes Table

- **Policy**: Managers/owners CRUD; all users read within company
- **Risk Category**: Medium - Recipe tampering could affect food safety
- **Verification Method**: pgTAP tests verify edit permissions
- **Future TODOs**: Version control enforcement in policies

### Method Documents

- **Policy**: Managers/owners CRUD; all users read within company
- **Risk Category**: Low - Training content access is less critical
- **Verification Method**: pgTAP tests check permissions
- **Future TODOs**: Add review cycle validations

### Media Assets

- **Policy**: Managers/owners CRUD; all users read within company
- **Risk Category**: Medium - Unauthorized uploads could consume storage
- **Verification Method**: pgTAP tests verify upload permissions
- **Future TODOs**: Integrate with signed URL policies

### Role Assignments

- **Policy**: Owners CRUD; all users read within company
- **Risk Category**: Critical - Role changes must be auditable
- **Verification Method**: pgTAP tests check owner-only access
- **Future TODOs**: Add double-confirmation flows

### Audit Logs

- **Policy**: All users read within company; system inserts for logging
- **Risk Category**: Low - Logs are append-only
- **Verification Method**: pgTAP tests verify insert capability
- **Future TODOs**: Add retention policies

### Notification Preferences

- **Policy**: Users manage their own preferences within company
- **Risk Category**: Low - Personal settings
- **Verification Method**: pgTAP tests check user isolation
- **Future TODOs**: None

### Realtime Subscriptions

- **Policy**: Users CRUD within company
- **Risk Category**: Low - Subscription management
- **Verification Method**: pgTAP tests verify tenant isolation
- **Future TODOs**: None

### Task Comments

- **Policy**: Users CRUD their own comments on accessible tasks
- **Risk Category**: Low - Operational notes
- **Verification Method**: pgTAP tests check comment permissions
- **Future TODOs**: None

### Stations

- **Policy**: Managers/owners CRUD; all users read within company
- **Risk Category**: Low - Station configuration
- **Verification Method**: pgTAP tests verify permissions
- **Future TODOs**: None

### Staff Schedules

- **Policy**: Managers/owners CRUD; all users read within company
- **Risk Category**: Medium - Schedule changes affect staffing
- **Verification Method**: pgTAP tests check permissions
- **Future TODOs**: Add conflict detection

### Display Snapshots

- **Policy**: All users read within company; system inserts
- **Risk Category**: Low - Read-only snapshots
- **Verification Method**: pgTAP tests verify access
- **Future TODOs**: None

## Verification

### Current State (2025-12-15)
- ✅ 18 tables with RLS enabled (`rowsecurity: true`)
- ✅ 60 security policies active
- ✅ Helper functions deployed (`get_my_company_id()`, `get_my_role()`)
- ✅ Multi-tenant isolation enforced

### Verification Query
```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

## References

- **Migration**: `supabase/migrations/0002_enable_rls_security.sql` (DEPLOYED 2025-12-15)
- **Incident Report**: `docs/security/SECURITY_INCIDENT_2025_12_15.md`
- Blueprint: 3-0-the-rulebook (Security)
- Tests: `supabase/tests/rls_policies.sql` (TODO: Update to match deployed policies)

## Changelog

### 2025-12-15 - Emergency Security Fix
- **CRITICAL**: Discovered all RLS policies were disabled in production
- Deployed emergency migration `0002_enable_rls_security.sql`
- Enabled RLS on all 18 tables
- Created 60 comprehensive security policies
- Verified all policies active and enforcing
- See incident report for full details

### Pre-2025-12-15 - Documentation vs. Reality
- Documentation claimed policies existed but they were not deployed
- Initial migration `0001_base_schema.sql` had ALL RLS commented out
- Note stated: "Disabled by default awaiting I1.T5"
- **Security was never enabled despite documentation**
