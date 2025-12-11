# Supabase Migration Playbook

## 1. Overview

This playbook defines the standard operating procedures for managing database schema changes, migrations, and seed data within the CodeMachine ecosystem. It adheres to the **Operational Architecture (Section 3.4.1)** and enforces strict guardrails to prevent schema drift and ensure type safety.

**Target Audience:** Backend Engineers, DevOps, System Architects.

**Related Documentation:**

- [Access Matrix](../specs/access_matrix.md): Definitive guide for RLS policies and role-based access control.
- [Entity Relationship Diagram (ERD)](../diagrams/erd.mmd): Visualization of the current schema relationships.

---

## 2. Prerequisites & Tooling

All database operations requires the following tools:

1.  **Supabase CLI**: [Installation Guide](https://supabase.com/docs/guides/cli)
2.  **Docker**: Required for local development instance.
3.  **Doppler CLI**: Used to inject secrets for CI/CD and production operations.

### Environment Setup

Secrets are managed via Doppler. Ensure you are authenticated:

```bash
doppler login
doppler setup --project codemachine --config dev
```

---

## 3. Local Development Workflow

### 3.1 Starting the Local Environment

Initialize the local Supabase stack. This spins up the database, studio, and edge functions locally.

```bash
supabase start
```

_Output will provide local API URLs and the Studio URL (usually http://localhost:54323)._

### 3.2 Creating a New Migration

All schema changes must be versioned via migrations. Manual edits via the Studio UI are **strictly prohibited** for persistent changes.

1.  **Generate Migration File**:

    ```bash
    supabase migration new <descriptive_name>
    # Example: supabase migration new add_users_table
    ```

    This creates a file in `supabase/migrations/<timestamp>_add_users_table.sql`.

2.  **Drafting SQL**:
    - Write standard PostgreSQL/SQL code.
    - **Mandatory**: Every migration file MUST include a commented-out "Down Migration" or "Rollback" section at the bottom, or a corresponding script must be prepared.
    - **RLS**: Row Level Security policies must be defined immediately for all new tables. Consult the [Access Matrix](../specs/access_matrix.md) for required policies.

    ```sql
    -- UP MIGRATION
    create table public.profiles (
      id uuid references auth.users not null,
      username text unique,
      primary key (id)
    );
    alter table public.profiles enable row level security;

    -- ROLLBACK (Keep this valid SQL, commented out or in a separate known location)
    -- drop table public.profiles;
    ```

3.  **Applying Changes Locally**:
    ```bash
    supabase db reset
    ```
    _Note: `db reset` recreates the local DB, applies all migrations, and runs seeds. Use `supabase db push` for non-destructive updates if preferred during rapid iteration, but `reset` is the gold standard for verification._

### 3.3 Managing Seed Data

Seed data lives in `supabase/seeds/seed.sql`. This data is used for local development and CI testing.

- **Update**: Modify `supabase/seeds/seed.sql` to include anonymized test data.
- **Apply**: Seeds are automatically applied on `supabase db reset`.

---

## 4. Verification & Type Safety

### 4.1 Automated Tests (pgTAP)

Database tests should be written using `pgTAP` and placed in `supabase/tests/`.

- **Run Tests**:
  ```bash
  supabase test db
  ```
  _Tests must pass before committing._

### 4.2 Generating TypeScript Types

After any schema change, you **MUST** regenerate the TypeScript definitions to keep the codebase in sync.

```bash
# Ensure target directory exists
mkdir -p libs/supabase/src

# Generate types
supabase gen types typescript --local > libs/supabase/src/database.types.ts
```

_Failure to run this will cause type errors in the application layer and block CI._

---

## 5. Deployment & Release

### 5.1 CI/CD Integration

Migrations are applied automatically via GitHub Actions pipelines.

- **Secrets**: `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` are injected via Doppler.
- **Command**:
  ```bash
  doppler run -- supabase db push --linked
  ```

### 5.2 Drift Detection

The CI pipeline checks for schema drift between the migration history and the actual database state.

- **Rule**: Any mismatch is treated as a severity-one issue.
- **Resolution**: If drift is detected, use `supabase db diff` locally to verify and create a remedial migration.

---

## 6. Rollback Protocol

Per **Operational Architecture (3.3.2)**, rollbacks rely on a dual strategy:

1.  **Immediate Revert (Migration-based)**:
    - Execute the "Rollback SQL" defined in the migration plan.
    - Command: Manually connect via admin connection string and execute the revert script.

2.  **Catastrophic Recovery (PITR)**:
    - If data corruption occurs, restore the Supabase project to a Point-in-Time Recovery snapshot from before the bad deployment.
    - Simultaneously redeploy the previous Vercel build to ensure code matches the database schema.

---

## 7. Operational Checklists

### 7.1 Pre-Commit Checklist (Developer)

- [ ] Migration created via CLI (not UI).
- [ ] Up SQL written and verified locally.
- [ ] Down/Rollback SQL prepared/documented.
- [ ] RLS Policies enabled and tested.
- [ ] `supabase test db` passes (pgTAP).
- [ ] `supabase db reset` runs successfully without errors.
- [ ] Types regenerated (`libs/supabase/src/database.types.ts`).

### 7.2 Pull Request Review Checklist (Reviewer)

- [ ] Check migration file timestamp order.
- [ ] Verify RLS policies: "Deny by default" approach used?
- [ ] Check for destructive operations (DROP COLUMN, renaming) - are they safe?
- [ ] Ensure corresponding TypeScript changes are included in the PR.
- [ ] Verify no "magic strings" or hardcoded secrets in SQL.

### 7.3 Release Checklist (Ops)

- [ ] Backup point established (automatic for PITR).
- [ ] Verify `libs/shared/flags` telemetry covers any new schema-dependent features.
- [ ] Confirm Staging environment has run stable for 24h (for major schema refactors).
