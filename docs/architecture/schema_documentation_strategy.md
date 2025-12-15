# Schema Documentation Strategy

## Executive Summary

This document outlines the consolidated approach to maintaining database schema documentation, preventing divergence between documentation and implementation, and ensuring single source of truth for all database-related artifacts.

## Problems Identified

### 1. Duplicate ERD Diagrams

**Issue**: Two ERD files exist with different levels of detail:
- `docs/diagrams/erd.mmd` (110 lines) - Basic, simplified version
- `docs/diagrams/supabase_erd.mmd` (244 lines) - Comprehensive version with changelog

**Risk**: Documentation drift where one diagram becomes outdated while the other is maintained.

**Resolution**:
- **PRIMARY SOURCE**: `docs/diagrams/supabase_erd.mmd`
- **ACTION**: Remove `docs/diagrams/erd.mmd` to eliminate ambiguity
- **RATIONALE**: The supabase_erd.mmd includes a changelog, additional tables (18 vs 9), and matches the actual database implementation

### 2. SQL Function Variable Shadowing Bugs

**Issue**: SQL functions `combine_tasks.sql` and `undo_combine.sql` contained variable shadowing bugs where function parameters had the same names as local variables and table columns, causing WHERE clauses to compare columns to themselves.

**Examples Fixed**:
```sql
-- BEFORE (BUG):
WHERE combined_group_id = combined_group_id AND company_id = company_id

-- AFTER (FIXED):
WHERE combined_group_id = p_combined_group_id AND company_id = v_company_id
```

**Resolution**:
- Use prefix convention: `p_` for parameters, `v_` for variables
- Applied to: `combine_tasks.sql`, `undo_combine.sql`
- Fixed schema mismatch in `undo_tokens` insert (removed non-existent `audit_log_id` column)

### 3. Business Logic Documentation Drift Risk

**Issue**: Business logic defined in `docs/specs/task_combination.md` is implemented in:
- SQL: `supabase/functions/combine_tasks.sql`, `undo_combine.sql`
- Edge Function: `supabase/functions/task_heuristics/index.ts`

**Risk**: Changes to implementation may not be reflected in specifications, or vice versa.

## Consolidated Documentation Strategy

### Single Source of Truth Hierarchy

```
1. DATABASE SCHEMA (Live Database)
   ↓
2. MIGRATION FILES (supabase/migrations/*.sql)
   ↓
3. ERD DIAGRAM (docs/diagrams/supabase_erd.mmd)
   ↓
4. BUSINESS LOGIC SPECS (docs/specs/*.md)
   ↓
5. IMPLEMENTATION (SQL functions, Edge functions, API routes)
```

### Maintenance Rules

#### Rule 1: Database Schema Changes
**When**: Adding/modifying tables, columns, constraints, indexes

**Process**:
1. Create migration file in `supabase/migrations/` with descriptive name
2. Include detailed markdown comment at top explaining:
   - What changed
   - Why it changed
   - Tables/columns affected
   - Security implications (RLS policies)
3. Apply migration using `mcp__supabase__apply_migration`
4. Update ERD diagram (`docs/diagrams/supabase_erd.mmd`)
5. Add entry to ERD changelog section
6. Update affected business logic specs if applicable

#### Rule 2: Business Logic Changes
**When**: Modifying task combination rules, similarity algorithms, status transitions

**Process**:
1. Update specification document (`docs/specs/*.md`) FIRST
2. Include version number and date in spec
3. Implement changes in code (SQL functions, Edge functions, API routes)
4. Add inline code comments referencing the spec section
5. Update tests to validate new behavior
6. Document in spec's "Changelog" section

#### Rule 3: SQL Function Modifications
**When**: Changing stored procedures/functions

**Process**:
1. Use consistent naming conventions:
   - Parameters: `p_` prefix (e.g., `p_task_ids`)
   - Variables: `v_` prefix (e.g., `v_company_id`)
   - Never shadow column names with variable names
2. Include header comment with function purpose and parameters
3. Update related spec documents
4. Test with realistic data scenarios

### Documentation Maintenance Checklist

When making ANY database-related change, verify:

- [ ] Migration file created and applied
- [ ] ERD diagram updated (`docs/diagrams/supabase_erd.mmd`)
- [ ] ERD changelog section updated with date and changes
- [ ] Affected specs updated (`docs/specs/`)
- [ ] SQL functions use proper naming conventions (p_, v_ prefixes)
- [ ] No variable shadowing in SQL functions
- [ ] RLS policies updated if needed
- [ ] Tests updated to cover changes
- [ ] API routes updated if schema changes affect them

## Files to Remove

The following files should be removed to eliminate ambiguity:

1. **`docs/diagrams/erd.mmd`**
   - Reason: Superseded by `supabase_erd.mmd`
   - Contains outdated/simplified schema
   - Not maintained with changelog

## Validation Scripts

### Validate ERD vs Database Schema

```sql
-- Run this query to compare documented tables vs actual tables
WITH documented_tables AS (
  -- List tables from ERD comments
  SELECT unnest(ARRAY[
    'companies', 'users', 'events', 'tasks', 'recipes',
    'method_documents', 'combined_task_groups', 'media_assets',
    'audit_logs', 'notification_preferences', 'realtime_subscriptions',
    'task_comments', 'stations', 'staff_schedules', 'role_assignments',
    'display_snapshots', 'task_similarity_suggestions', 'undo_tokens'
  ]) AS table_name
),
actual_tables AS (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
)
SELECT
  COALESCE(d.table_name, a.table_name) AS table_name,
  CASE
    WHEN d.table_name IS NULL THEN 'MISSING FROM DOCS'
    WHEN a.table_name IS NULL THEN 'MISSING FROM DATABASE'
    ELSE 'OK'
  END AS status
FROM documented_tables d
FULL OUTER JOIN actual_tables a ON d.table_name = a.table_name
ORDER BY status, table_name;
```

### Detect SQL Variable Shadowing

```bash
# Grep for common variable shadowing patterns in SQL functions
grep -r "company_id uuid;" supabase/functions/*.sql
grep -r "user_id uuid;" supabase/functions/*.sql
grep -r "task_id uuid;" supabase/functions/*.sql

# Look for WHERE clauses that might have shadowing issues
grep -r "WHERE.*=.*AND company_id = company_id" supabase/functions/*.sql
```

## Future Improvements

1. **Automated ERD Generation**: Explore tools that can generate ERD diagrams from database schema automatically
2. **Schema Versioning**: Add explicit version numbers to ERD changelog
3. **Pre-commit Hooks**: Validate that migrations have corresponding ERD updates
4. **Integration Tests**: Add tests that verify SQL functions match business logic specs
5. **Documentation Linting**: Create custom linter to detect common documentation drift patterns

## References

- Database Schema: `supabase/migrations/`
- Primary ERD: `docs/diagrams/supabase_erd.mmd`
- Business Logic Specs: `docs/specs/`
- SQL Functions: `supabase/functions/*.sql`
- Edge Functions: `supabase/functions/*/index.ts`

## Changelog

### 2025-12-15
- Initial documentation strategy created
- Fixed variable shadowing bugs in `combine_tasks.sql` and `undo_combine.sql`
- Identified `erd.mmd` for removal
- Established naming conventions for SQL variables
- Fixed schema mismatch in `undo_tokens` insert statement
