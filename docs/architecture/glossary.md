# Architecture Glossary

This glossary defines key terms and technologies used throughout the CaterKing platform architecture. Terms are cross-referenced with relevant blueprint and plan documents for detailed context.

## Core Platform Terms

- **PWA (Progressive Web App):** A web application that can be installed on mobile devices and works offline. Referenced in [UI Interaction Blueprint](../ux/ui_interaction_blueprint.md) for offline handling patterns and service worker implementations.

- **RLS (Row-Level Security):** PostgreSQL feature for enforcing data access rules at the database row level. Defined in plan document [03_Verification_and_Glossary.md](../../.codemachine/artifacts/plan/03_Verification_and_Glossary.md) under verification strategy.

- **RPC (Remote Procedure Call):** A function call that executes on the database server. Used for complex database operations in Supabase integrations.

- **JWT (JSON Web Token):** A compact, URL-safe means of representing claims to be transferred between parties. Implemented for authentication and session management.

## Technology Stack

- **Supabase:** Open-source Firebase alternative providing database, auth, storage, and realtime services. Core infrastructure component referenced in [Component Overview Diagram](../diagrams/component_overview.puml).

- **Turbo:** Monorepo build system for JavaScript/TypeScript projects. Manages build pipeline and caching as described in [README.md](../README.md).

- **pnpm:** Package manager for JavaScript with efficient dependency handling. Workspace manager for the monorepo structure.

- **Next.js:** React framework for building server-side rendered and static web applications. Foundation for all frontend applications.

- **React Query:** Library for managing server state in React applications. Used for API state management and caching.

- **Tailwind CSS:** Utility-first CSS framework for rapid UI development. Design system foundation referenced in [UI Interaction Blueprint](../ux/ui_interaction_blueprint.md).

- **ShadCN UI:** Collection of reusable UI components built with Radix UI and Tailwind CSS. Shared component library.

- **Vercel:** Platform for deploying frontend applications with edge computing capabilities. Production deployment target.

## Operational Technologies

- **Doppler:** Secrets management platform for secure configuration handling. Environment variable injection for all deployments.

- **Flagsmith:** Feature flag management platform for controlled feature rollouts. Referenced in [Release Runbook](./release_runbook.md) for deployment strategies.

- **OpenTelemetry:** Observability framework for generating and collecting telemetry data. Monitoring and tracing implementation.

- **PlantUML:** Tool for generating UML diagrams from text-based descriptions. Used for all architecture diagrams.

- **OpenAPI:** Specification for defining RESTful APIs. API documentation and validation standard.

- **Zod:** TypeScript-first schema declaration and validation library. Runtime type validation for API payloads.

## Testing and Quality

- **Playwright:** End-to-end testing framework for web applications. Critical user journey testing as outlined in verification strategy.

- **Vitest:** Fast unit testing framework with TypeScript support. Unit and integration test execution.

- **Storybook:** Development environment for UI components in isolation. Component development and testing.

- **Chromatic:** Visual testing platform for Storybook components. UI regression testing.

## Database and Data

- **JSONB:** JSON binary data type in PostgreSQL for storing structured data. Flexible data storage for recipes and configurations.

- **Edge Functions:** Serverless functions that run at the network edge for low latency. Supabase serverless compute.

- **Realtime:** WebSocket-based communication for instant data synchronization. Live updates for task management.

## References

- **Plan Document:** [03_Verification_and_Glossary.md](../../.codemachine/artifacts/plan/03_Verification_and_Glossary.md) - Original glossary definitions and verification context.
- **UI Interaction Blueprint:** [ui_interaction_blueprint.md](../ux/ui_interaction_blueprint.md) - Implementation patterns and user experience terms.
- **Release Runbook:** [release_runbook.md](./release_runbook.md) - Operational and deployment terminology.
