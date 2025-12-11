# Environment Matrix

This document outlines the environment-specific configurations for the platform.

## Environments

| Environment | Supabase Project ID | Vercel Project | Flagsmith Environment | Release Cadence |
| ----------- | ------------------- | -------------- | --------------------- | --------------- |
| Development | dev-project-id      | dev-vercel     | ck-dev                | Daily           |
| Staging     | stg-project-id      | stg-vercel     | ck-stg                | Weekly          |
| Production  | prod-project-id     | prod-vercel    | ck-prod               | Monthly         |

## Supabase Configurations

- **Development**: Local setup with port 54321, storage bucket 'default', realtime quota 100
- **Staging**: Staging project with port 54322, storage bucket 'staging', realtime quota 200
- **Production**: Production project with port 54323, storage bucket 'production', realtime quota 500
