# Task Combination Heuristics Specification

## Overview

This specification describes the task combination heuristics pipeline implemented as a Supabase Edge Function. The system analyzes tasks within a company to identify similar preparation steps that can be combined for efficiency.

## Pipeline Description

### 1. Input Processing

- **Endpoint**: `POST /functions/v1/task_heuristics`
- **Input**: `{ "company_id": "uuid" }`
- **Authentication**: Requires JWT with manager+ role for the specified company
- **Validation**: Company access verified via RLS

### 2. Task Retrieval

- Query tasks from `tasks` table where:
  - `company_id` matches input
  - `status` in ('available', 'claimed', 'in_progress')
- Fields used: `id`, `name`, `quantity`, `unit`

### 3. Heuristics Computation

- **Name Similarity**: Normalize task names (lowercase, remove punctuation, split into words)
  - Compute Jaccard similarity on word sets
  - Weight: 0.6

- **Unit Normalization**: Map units to canonical forms (see metadata.json)
  - Exact match bonus
  - Weight: 0.3

- **Quantity Similarity**: For matching units, compute ratio similarity
  - Weight: 0.1

- **Total Score**: Weighted sum of above components

### 4. Suggestion Generation

- Generate bidirectional suggestions for task pairs with score > 0.5
- Store in `task_similarity_suggestions` table:
  - `company_id`, `task_id`, `suggested_task_id`, `similarity_score`

### 5. Output & Notifications

- **Response**: `{ "success": true, "suggestions_count": number }`
- **Audit Logging**: Record generation event in `audit_logs`
- **Realtime Notification**: Broadcast to `company:{company_id}:task_similarity_suggestions`

## Rollback Procedures

### Manual Deletion

- Delete suggestions by company: `DELETE FROM task_similarity_suggestions WHERE company_id = ?`
- Delete by task: `DELETE FROM task_similarity_suggestions WHERE task_id = ? OR suggested_task_id = ?`

### Automated Cleanup

- Suggestions expire implicitly via business logic (no explicit TTL)
- Re-run heuristics overwrites existing suggestions via upsert

## Telemetry Requirements

### Success Metrics

- Suggestions generated count
- Processing time
- Error rates

### Failure Tracking

- Authentication failures
- Database errors
- Computation timeouts

### Observability

- Structured logging with Pino
- Metrics via Vercel Edge Middleware
- Traces across Supabase RPC calls

## JSON Examples

### Request

```json
{
  "company_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response

```json
{
  "success": true,
  "suggestions_count": 12
}
```

### Suggestion Record

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "company_id": "550e8400-e29b-41d4-a716-446655440000",
  "task_id": "550e8400-e29b-41d4-a716-446655440002",
  "suggested_task_id": "550e8400-e29b-41d4-a716-446655440003",
  "similarity_score": 0.75,
  "created_at": "2025-12-11T10:00:00Z"
}
```

### Metadata

```json
{
  "version": "1.0.0",
  "thresholds": {
    "min_similarity_score": 0.5
  },
  "tunables": {
    "name_weight": 0.6,
    "unit_weight": 0.3,
    "quantity_weight": 0.1
  }
}
```

## Blueprint References

- **2.0 The "Standard Kit"**: Supabase Edge Functions for compute-heavy heuristics
- **3.0 The "Rulebook"**: Feature flags, observability, security, audit logging
- **5.0 The "Contract"**: Task and CombinedTaskGroup entities, realtime contracts

## Acceptance Criteria

- Function deploys successfully via Supabase CLI
- CLI tests confirm suggestions generated for sample tasks
- Spec includes blueprint anchors and JSON examples
