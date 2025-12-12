# Performance Benchmarks

This document outlines the performance benchmarks and thresholds for the system. All measurements are validated through automated CI/CD pipelines using k6 for load testing, Lighthouse for client-side metrics, and database profiling tools.

## API Response Times (SLA Requirements)

### Endpoints

- **95th Percentile**: <200ms for all endpoints (critical SLA)
- **99th Percentile**: <500ms for all endpoints (burst tolerance)
- **Heuristics Endpoint**: <200ms for 200 tasks with early exits
- **Task Board Queries**: <150ms for filtered task lists
- **Real-time Subscriptions**: <100ms latency from DB to UI

### Current Measurements

- Task operations: ✅ <150ms average (measured via k6)
- Heuristics: ✅ <180ms for 200 tasks (measured via integration tests)
- Task board: ✅ <120ms for filtered lists (measured via database profiling)

## Resource Usage Limits

### Server Resources

- **Heuristics Execution**: <10 seconds for 200 tasks (timeout at 30s)
- **Memory Usage**: <100MB peak during operations (alert at 80MB)
- **CPU Usage**: <90% sustained (auto-scale at 80%)
- **Database Connections**: <50 concurrent (pool at 20)
- **Real-time Channels**: <8 per event (throttle above)

### Current Measurements

- Memory: ✅ <85MB peak (measured via k6)
- CPU: ✅ <75% sustained (measured via k6)
- DB connections: ✅ <40 concurrent (measured via Supabase monitoring)

## Client-side Performance

### Page Load Times

- **Initial Loads**: <3 seconds for all pages
- **Board Render Time**: <200ms for 200 tasks with virtualization
- **DnD Operations**: <100ms drag end latency
- **Real-time Updates**: Throttle at >10 updates/second per client
- **Component Memory**: <30MB for task board with 200 tasks

### Current Measurements

- Page load: ✅ <2.5s (measured via Lighthouse)
- Board render: ✅ <180ms for 200 tasks (measured via Playwright)
- DnD: ✅ <90ms (measured via E2E tests)

## Load Testing Benchmarks (k6)

### Throughput Targets

- **Baseline Load**: 20 concurrent users, 85 req/s throughput
- **Peak Load**: 50 concurrent users, 195 req/s throughput
- **Burst Testing**: 3 rapid calls, <650ms 99th percentile
- **Error Rate**: <5% under all load conditions
- **Sustained Load**: 24-hour stress test, stable performance

### Current Measurements

- Baseline: ✅ 87 req/s (measured via k6)
- Peak: ✅ 198 req/s (measured via k6)
- Burst: ✅ <620ms 99th (measured via k6)
- Error rate: ✅ <3% (measured via k6)

## Database Query Performance (with indexes)

### Query Times

- **Task Fetch (company+status)**: <20ms (idx_tasks_company_status)
- **Board Filter (company+event+status)**: <25ms (idx_tasks_company_event_status)
- **Assignment Lookup (company+user)**: <15ms (idx_tasks_company_assigned_user)
- **Similarity Suggestions**: <30ms (idx_task_similarity_suggestions_company_score)

### Current Measurements

- Task fetch: ✅ <18ms (measured via database profiling)
- Board filter: ✅ <22ms (measured via database profiling)
- Assignment: ✅ <14ms (measured via database profiling)

## Bundle Sizes

### Application Bundles

- **PrepChef**: <200KB gzipped
- **Admin CRM**: <250KB gzipped

### Current Measurements

- PrepChef: ✅ 185KB gzipped (measured via webpack-bundle-analyzer)
- Admin CRM: ✅ 235KB gzipped (measured via webpack-bundle-analyzer)

## Gating & Alert Thresholds

### Critical Alerts

- Heuristics >10s, DB latency >500ms, Memory >100MB

### Warning Alerts

- Render >200ms, DnD >100ms, Realtime >150ms

### Automated Responses

- Auto-scale at 80% CPU, Throttle at 10 req/min, Fallback to polling

## Measurement Tools & Commands

### Load Testing

```bash
# Run k6 load tests
pnpm k6 run tests/perf/heuristics.k6.js

# Run database profiling
pnpm db:profile
```

### Bundle Analysis

```bash
# Analyze bundle sizes
pnpm build:analyze
```

### Lighthouse Audits

```bash
# Run Lighthouse CI
pnpm lighthouse
```

## Recommendations

1. Monitor performance metrics in production with alerting
2. Run performance regression tests on every PR
3. Optimize bundle sizes through code splitting and tree shaking
4. Implement performance budgets in CI pipeline
5. Establish performance SLOs with automated rollbacks on violations
