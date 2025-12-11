# Specification Review & Recommendations: KitchenFlow Nexus

**Date:** 2025-12-10
**Status:** Awaiting Specification Enhancement

### **1.0 Executive Summary**

This document is an automated analysis of the provided project specifications. It has identified critical decision points that require explicit definition before architectural design can proceed.

**Required Action:** The user is required to review the assertions below and **update the original specification document** to resolve the ambiguities. This updated document will serve as the canonical source for subsequent development phases.

### **2.0 Synthesized Project Vision**

*Based on the provided data, the core project objective is to engineer a system that:*

Delivers a multi-tenant, real-time kitchen command platform that centralizes prep tasks, recipes, training, and staff coordination. The experience prioritizes mobile-first execution for staff while supplying managers with cross-event visibility, task aggregation, and operational controls through shared monorepo applications. Supabase provides the transactional, realtime, and media backbone while Next.js apps orchestrate UI, workflows, and edge APIs.

### **3.0 Critical Assertions & Required Clarifications**

---

#### **Assertion 1: Task Similarity Computation Ownership**

*   **Observation:** Task consolidation requires fuzzy text matching and ingredient normalization, yet the specification does not state where the similarity engine runs, when it executes, or how suggestions are persisted for review, leaving compute budgets and reliability undefined.
*   **Architectural Impact:** Placement of the similarity algorithm determines latency characteristics, Supabase resource sizing, data freshness guarantees, and whether mobile clients operate deterministically.
    *   **Path A (Edge Function Orchestrator):** Supabase Edge Functions react to task inserts or updates, compute similarity, and store candidate combinations for all clients to consume with guaranteed tenant isolation.
    *   **Path B (Next.js Background Worker):** A dedicated Next.js route or cron job scans tasks periodically, which simplifies coding but introduces drift between edits and available suggestions.
    *   **Path C (Client-Initiated Heuristics):** Mobile clients compute similarity locally and propose merges, which lowers backend cost but risks inconsistent grouping and exposes business logic on devices.
*   **Default Assumption & Required Action:** To protect multi-tenant consistency, the system will assume **Path A** with Supabase Edge Functions triggered by task mutations that emit deterministic suggestions back into a `task_similarity_candidates` table. **Update the specification** with the definitive component, trigger model, and expected SLA so infrastructure and library boundaries can be finalized.

---

#### **Assertion 2: Combined Task Lifecycle & Persistence Model**

*   **Observation:** The specification states that users can combine similar tasks and receive standardized instructions, yet it does not define whether combined work is represented as a new parent record, a virtual grouping, or inline edits to source tasks, nor how undo, progress tracking, or audit trails behave for grouped work.
*   **Architectural Impact:** The lifecycle definition controls schema design, optimistic update flows, Supabase RLS policies, and whether event dashboards operate on derived aggregates or canonical tasks.
    *   **Path A (Materialized Parent Task):** Create a `combined_tasks` entity that becomes the single actionable record while original tasks reference it, enabling precise ownership but introducing more tables and synchronization logic.
    *   **Path B (Virtual Tagging):** Keep each original task active and merely tag them with a shared identifier, letting clients render combined views without changing write paths, at the cost of complex UX for claim and completion.
    *   **Path C (One-Way Merge):** Replace original tasks with a consolidated record, simplifying UI but losing historical granularity and complicating undo requirements.
*   **Default Assumption & Required Action:** Implementation will assume **Path A** by maintaining a canonical combined task per suggestion with child membership rows and mirrored status transitions so that completion, undo, and audit logs stay traceable. **Update the specification** to confirm lifecycle semantics, required undo scope, and whether both parent and child tasks remain visible in analytics.

---

#### **Assertion 3: Quantity Scaling & Unit Normalization Strategy**

*   **Observation:** Auto-scaling and unit conversion are mandated, yet the source of truth for ingredient units, allowed measurement vocabularies, rounding rules, and per-company overrides remain unspecified, preventing deterministic calculations.
*   **Architectural Impact:** The conversion strategy influences database schemas (JSONB vs structured tables), shared library design, validation pipelines, and whether Supabase RPCs can guarantee accurate math across metric, imperial, and volumetric units.
    *   **Path A (Central Measurement Dictionary):** Maintain a canonical measurement registry in `libs/shared` plus supporting tables so every ingredient references a base unit with conversion factors, ensuring predictable scaling across tenants.
    *   **Path B (Recipe-Scoped Conversions):** Allow each recipe to embed conversion metadata inside JSONB, which accelerates authoring but multiplies risk of inconsistent units and complicates aggregation.
    *   **Path C (External Measurement Service):** Rely on a third-party conversion API or microservice that standardizes units, adding latency and cost but guaranteeing scientific accuracy.
*   **Default Assumption & Required Action:** The build will assume **Path A** with a curated unit graph stored centrally, including rounding and precision policies enforced via Zod validators and Supabase constraints. **Update the specification** to state whether tenants can override conversions, how precision should be displayed, and what fallback behavior applies when conversions fail.

---

#### **Assertion 4: Media Upload & Processing Pipeline**

*   **Observation:** Recipes and methods include images and video uploads with optional transcoding, yet the ingest path, file size expectations, authentication method, and background processing responsibilities remain undefined.
*   **Architectural Impact:** Upload topology dictates client SDK integration, signed URL policies, Doppler secret distribution, bandwidth planning, and whether Supabase storage alone suffices for high-volume media.
    *   **Path A (Direct Supabase Signed Uploads):** Clients request signed URLs from Next.js, upload directly to Supabase Storage, and invoke Supabase Functions for thumbnailing, minimizing server load.
    *   **Path B (Next.js Proxy Upload):** Media flows through Next.js API routes for validation before storage, simplifying ACLs but heavily taxing Vercel bandwidth quotas.
    *   **Path C (External Media Pipeline):** Integrate a dedicated media service (e.g., Mux, Cloudinary) to handle encoding, adding cost but providing robust streaming and analytics.
*   **Default Assumption & Required Action:** Delivery will assume **Path A** with strict file-size limits enforced in shared validation utilities, plus asynchronous Supabase Functions for thumbnail generation stored alongside originals. **Update the specification** to document maximum file sizes, required codecs, retention rules, and whether kiosk displays need adaptive streaming so infrastructure provisioning can commence.

---

#### **Assertion 5: Role-Based Permission Granularity & RLS Matrix**

*   **Observation:** Roles are listed (staff, manager, event lead, owner) with general capabilities, yet the precise CRUD permissions for tasks, events, recipes, media, and combination approvals are unspecified, making it impossible to codify RLS policies or UI gating rules.
*   **Architectural Impact:** A definitive authorization matrix is required to design Supabase policies, JWT claim structures, optimistic updates, and to prevent privilege escalation across tenants.
    *   **Path A (Operational Constraint):** Staff may only claim, unclaim, and complete tasks; managers and event leads handle creation, assignment, and combination approval; owners manage recipes, media, and user role changes.
    *   **Path B (Collaborative Edit):** Staff can also create or edit tasks during service, demanding nuanced RLS policies and UI safeguards for collisions.
    *   **Path C (Owner-Delegated Admin):** Owners delegate subsets of administrative power to managers via configurable scopes, requiring schema support for granular permission flags and more complex policy expressions.
*   **Default Assumption & Required Action:** The implementation will proceed with **Path A** to minimize RLS complexity for MVP while reserving space for future scope expansion. **Update the specification** with a full CRUD-per-role matrix, escalation rules, and any kiosk-specific visibility exceptions so the database policies and shared hooks can be generated confidently.

### **4.0 Next Steps**

Upon the user's update of the original specification document, the development process will be unblocked and can proceed to the architectural design phase.
