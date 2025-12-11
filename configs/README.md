# Doppler Configuration README

This directory contains Doppler configuration templates and scripts for managing environment-specific secrets across the CaterKing platform.

## Files

- `doppler.env.template` - Doppler template for generating environment files
- `../scripts/env/sync_secrets.ps1` - PowerShell script for Windows environments
- `../scripts/env/sync_secrets.sh` - Bash script for macOS/Linux environments

## Usage

### Environment Setup

The platform uses three environments:

- **Development**: `ck-dev` project with `dev` config
- **Staging**: `ck-stg` project with `stg` config
- **Production**: `ck-prod` project with `prod` config

### Sync Secrets

#### Windows (PowerShell)

```powershell
# Sync development secrets
.\scripts\env\sync_secrets.ps1

# Sync staging secrets
.\scripts\env\sync_secrets.ps1 -Config stg

# Validate secrets only
.\scripts\env\sync_secrets.ps1 -Validate
```

#### macOS/Linux (Bash)

```bash
# Sync development secrets
./scripts/env/sync_secrets.sh

# Sync staging secrets
./scripts/env/sync_secrets.sh stg

# Validate secrets only
./scripts/env/sync_secrets.sh dev --validate
```

### Manual Doppler Commands

#### Template Validation

```bash
# Validate template with development config
doppler secrets substitute configs/doppler.env.template --project ck-dev --config dev

# Generate .env file from template
doppler secrets substitute configs/doppler.env.template --project ck-dev --config dev > .env
```

#### Direct Secret Download

```bash
# Download secrets as environment file
doppler secrets download --project ck-dev --config dev --format env > .env

# Download secrets as JSON
doppler secrets download --project ck-dev --config dev --format json
```

## Required Secrets

The following secrets must be configured in each Doppler project:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Anonymous key for Supabase client
- `SUPABASE_PROJECT_ID` - Project reference ID
- `SUPABASE_PORT` - Database port (54321/54322/54323)
- `SUPABASE_STORAGE_BUCKET` - Storage bucket name
- `SUPABASE_REALTIME_QUOTA` - Real-time channel quota
- `FLAGS_API_KEY` - Flagsmith API key

## Environment Matrix

| Environment | Project | Config | Supabase Port | Storage Bucket | Realtime Quota |
| ----------- | ------- | ------ | ------------- | -------------- | -------------- |
| Development | ck-dev  | dev    | 54321         | default        | 100            |
| Staging     | ck-stg  | stg    | 54322         | staging        | 200            |
| Production  | ck-prod | prod   | 54323         | production     | 500            |

## Rotation Cadence

- **Monthly**: SUPABASE_URL, SUPABASE_ANON_KEY, FLAGS_API_KEY
- **Never**: SUPABASE_PROJECT_ID, SUPABASE_PORT, SUPABASE_STORAGE_BUCKET, SUPABASE_REALTIME_QUOTA

## Troubleshooting

### Common Issues

1. **"You must specify a project" error**
   - Ensure the project name is correct (ck-dev, ck-stg, ck-prod)
   - Check Doppler authentication: `doppler login`

2. **Template validation fails**
   - Verify all required secrets exist in the project
   - Check template syntax with `doppler secrets substitute --help`

3. **Port conflicts**
   - See troubleshooting section in engineering playbook
   - Use Docker fallback if local Postgres conflicts

4. **Windows WSL issues**
   - Install Doppler CLI in WSL, not Windows
   - Ensure Docker Desktop WSL integration is enabled

### Validation Commands

```bash
# Validate required secrets exist
./scripts/env/sync_secrets.sh dev --validate

# Test template rendering
doppler secrets substitute configs/doppler.env.template --project ck-dev --config dev

# Check Doppler configuration
doppler configure list
```
