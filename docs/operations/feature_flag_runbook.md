# Feature Flag Runbook

This runbook details the feature flag strategy for the CaterKing platform, ensuring safe rollouts, telemetry collection, and rollback capabilities as per the [Rulebook](../architecture/01_Blueprint_Foundation.md#3-0-the-rulebook).

## Flagsmith Environments

Feature flags are managed through Flagsmith, provisioned via Doppler:

- **Development**: `ck-dev` - For local testing and development
- **Staging**: `ck-stg` - Pre-production validation
- **Production**: `ck-prod` - Live environment

Environment-specific projects ensure isolation. Use Doppler to inject `FLAGS_API_KEY` at runtime.

## Toggle Lifecycle

### Creation

1. Create flag in Flagsmith with key following `scope.feature.variant` format (e.g., `prep.task-combine.v2`)
2. Set default to "off" in production
3. Add to Doppler templates with descriptions

### Rollout

1. Enable in development for testing
2. Promote to staging for QA validation
3. Monitor telemetry before production enablement
4. Use canary releases for gradual rollout

### Removal

1. Document removal in migration notes
2. Create cleanup PR after flag retirement
3. Update Doppler templates

## Exposure Logging Expectations

All flag evaluations must emit telemetry:

- **Client-side**: Log exposure on component mount/render
- **Server-side**: Log evaluation in middleware/API routes
- **Metrics**: Track click-through, error rates, and conversion

Use structured logging with flag key, user context, and outcome.

## Rollback Etiquette

### Emergency Rollback

1. Toggle flag to "off" in Flagsmith
2. Monitor error rates and user feedback
3. Document incident and rollback steps

### Planned Rollback

1. Include rollback plan in release notes
2. Test rollback in staging first
3. Have migration reversion scripts ready

### Flag Dependencies

- Document flag relationships in ADR
- Ensure dependent features degrade gracefully
- Test flag combinations in QA

## Checklist for Autonomous Agents

- [ ] Flag key follows `scope.feature.variant` naming
- [ ] Default set to "off" in production
- [ ] Telemetry logging implemented for exposures
- [ ] Rollback plan documented
- [ ] Doppler template updated
- [ ] ADR created for new flags
- [ ] Testing includes flag toggle scenarios
- [ ] Cleanup PR planned for flag removal
