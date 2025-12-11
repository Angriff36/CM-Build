# RLS Policies Catalog

<!-- anchor: rls-policies-catalog -->

## Overview

This document catalogs all Row Level Security (RLS) policies implemented in the PrepChef application. Each policy enforces tenant isolation via `company_id` matching JWT claims and role-based access controls. Policies are verified through pgTAP tests and reference blueprint anchors for security directives.

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

## References

- Blueprint: 3-0-the-rulebook (Security)
- Tests: supabase/tests/rls_policies.sql
- Migration: supabase/migrations/0002_rls_policies.sql
