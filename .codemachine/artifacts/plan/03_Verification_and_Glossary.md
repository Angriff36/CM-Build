## 5. Verification and Integration Strategy

- **Testing Levels:** Unit tests for libs with Vitest; integration tests for RPCs; E2E with Playwright for key flows.
- **CI/CD:** GitHub Actions with Turbo pipelines; lint, typecheck, test on PR; build on merge.
- **Code Quality Gates:** ESLint, Prettier, TypeScript strict; coverage >80% for libs.
- **Artifact Validation:** PlantUML renders; OpenAPI validates; JSON Schema checks data.

## 6. Glossary

- **PWA:** Progressive Web App.
- **RLS:** Row-Level Security in Supabase.
- **RPC:** Remote Procedure Call.
- **JWT:** JSON Web Token.
- **Supabase:** Managed backend service.
- **Turbo:** Monorepo build tool.
- **pnpm:** Package manager.
- **Next.js:** React framework.
- **React Query:** State management.
- **Tailwind CSS:** Utility CSS.
- **ShadCN UI:** Component library.
- **Vercel:** Hosting platform.
- **Doppler:** Secrets manager.
- **Flagsmith:** Feature flags.
- **OpenTelemetry:** Observability.
- **PlantUML:** Diagram tool.
- **OpenAPI:** API spec.
- **Zod:** Validation library.
- **Playwright:** E2E testing.
- **Vitest:** Unit testing.
- **Storybook:** Component docs.
- **Chromatic:** Visual testing.
- **JSONB:** JSON storage.
- **Edge Functions:** Serverless functions.
- **Realtime:** WebSocket sync.
