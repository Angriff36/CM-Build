# Project Specifications

Product Requirements Document — Kitchen Management Platform
1. Elevator Pitch

A unified kitchen management platform that transforms chaotic, multi-event food preparation into an organized, real-time workflow. The system centralizes tasks, recipes, and methods while automatically standardizing and combining work across events. It empowers kitchen staff to claim and complete tasks efficiently, and equips managers with visibility and control, resulting in streamlined execution, reduced waste, and consistent product quality.

2. Who is this app for

The platform is designed for:

Kitchen staff executing prep work during events

Managers and event leads overseeing workflow, assignments, and progress

Business owners maintaining recipes, methods, staff, and event operations at a high level

Primary users in V1 are staff and managers; administrative users become more relevant as expanded features are introduced.

3. Functional Requirements — What it does
3.1 Task Management

Real-time dashboard displaying all tasks across events

Users can claim tasks, unclaim, mark complete, and view status updates

Managers can assign tasks manually

System supports real-time status tracking of all activity (available, claimed, completed)

3.2 Task Consolidation & Standardization

Detects identical or similar tasks across dishes and events

Highlights and suggests similar tasks as potential combinations to users (not auto-combined)

Users can opt-in to combine suggested tasks

Task similarity uses advanced heuristic matching beyond simple keyword matching (Path B):

Fuzzy text comparison (Levenshtein distance or similar algorithms)

Ingredient normalization and semantic equivalence (e.g., "diced onion" ≈ "onion, diced")

Unit-aware quantity matching (2 cups ≈ 16 oz when applicable)

Context-aware bundling logic considering prep method, timing, and equipment

Requires user confirmation before merging to prevent false positives

Auto-calculates unit conversions and scaling across volume/weight systems when tasks are combined

Outputs standardized instructions for the combined task

3.3 Multi-Event Coordination

Supports concurrent events with separate prep lists

Cross-event aggregation for shared tasks and ingredients

Event-level attributes (recipes, portions, staff, etc.)

3.4 Recipes & Methods Knowledge Base

Recipes stored in a per-company, isolated database (multi-tenant)

Fully editable by the business

Supports images and video uploads

Recipes displayed in an on-demand side panel for reference by staff

3.5 Methods & Skill Documentation

Businesses can upload detailed procedural guides

Can include video tutorials and step-by-step instructions

Designed for training, onboarding, and standardization

3.6 Permissions / Roles

Roles: Staff, Manager, Event Lead, Owner

Controls access to task assignment, editing data, and event visibility

3.7 Platform Support

Mobile apps (iOS + Android) optimized for kitchen use

Web app for business management and administrative workflows

Unified real-time experience across platforms

4. User Stories — How users interact
Staff

"I can open the dashboard and see all tasks available to me in real time."

"I can claim a task so other staff know I am working on it."

"I can mark a task complete so it updates for the rest of the team."

"I can view a recipe or method while performing a task."

Manager / Event Lead

"I can assign tasks to staff manually."

"I can monitor which tasks are claimed and completed across events."

"I can see an aggregated view of work across multiple events."

Business Owner

"I can upload and edit recipes specific to my business."

"I can upload videos and procedural methods that staff can view."

"I can manage roles and access levels for users."

5. User Interface — How it will look
Task Dashboard (Kitchen App)

A real-time activity board showing:

All active tasks across events

Status: unclaimed / claimed / completed

User working on each task

Task grouping suggestions (e.g., suggest combining similar onion chopping tasks for user approval)

UI characteristics:

Optimized for mobile/tablet

Large tap targets

Minimal cognitive load

Recipe + Method Viewer

Slide-out side panel

Displays instructions, photos, videos

Quick navigation within the recipe or method

Event Management (Web)

Table/list view of events

Detail view showing tasks, staff, methods, recipes

Administrative controls for roles, recipes, uploads

6. Non-Functional Requirements
Real-Time Architecture

Live updates across all user devices

Minimal latency

Multi-Tenancy

Strict isolation of business data

Security

Role-based access control

Secure media upload storage

Scalability (Tier 1 - Single Location)

Architecture targets typical kitchen operations with:

Approximately 10 events per week

Under 200 tasks total across all concurrent events

Fewer than five simultaneous events at peak

Designed for single-location kitchens as primary use case

7. Out-of-Scope (MVP)

These features are planned for future releases:

Performance metrics / analytics

Inventory management

Supplier integrations (e.g., FSA)

Costing, waste analysis, forecasting

8. Success Metrics

Initial release should improve:

Task completion efficiency

Staff clarity around responsibilities

Reduction of duplicate work

Recipe consistency across staff members

Future KPIs (post-MVP):

Labor efficiency

Food waste metrics

Cost of goods sold

Inventory utilization

Software Requirements Specification — CaterKing (Next.js + Supabase)
System Design

CaterKing is a real-time, multi-tenant kitchen management platform designed to streamline task execution, reduce duplicated work, and increase operational clarity for commercial kitchens.

The system enables staff to:

View all tasks across events

Claim, complete, and collaborate on tasks

Access recipes, ingredients, and step-by-step media

Receive automatic task aggregation and scaling

Managers can:

Assign tasks

Monitor progress and workloads

Configure recipes and methods

Manage events, staffing, and content

The platform supports three modes of interaction:

Mobile-first interface for staff to execute tasks quickly with minimal cognitive load
  - Phase 1: Progressive Web App (PWA) - Next.js-based, works on iOS and Android
  - Phase 2: React Native/Expo apps (if needed for native features)
  - Turbo monorepo and pnpm are compatible with both PWA and React Native

Desktop dashboard for administrative workflows

Wall-mounted screen for passive real-time status monitoring

Value propositions:

Reduce communication overhead

Prevent duplicated or missed work

Standardize recipes across locations

Enable rapid onboarding and training

Increase efficiency during peak hours

Architecture Pattern
Turbo Monorepo with Next.js Applications and Shared Libraries

Modular, Extensible Design

The system is designed as a modular platform enabling third-party and internal applications to integrate seamlessly. Other apps (staffing/payroll, kanban boards, scheduling, etc.) can:

Leverage shared Supabase schema and RLS policies

Subscribe to Realtime events via company-scoped channels

Invoke shared domain logic through libs/shared exports

Access authenticated user context via Supabase JWT claims

Build isolated UIs while maintaining unified real-time state

Workspace Structure

The project is organized as a Turbo monorepo with the following structure:

apps/ — Next.js application shells (routing + minimal composition)
  - prepchef/ — Full-featured catering operations app (core MVP)
  - caterking/ — Simplified catering operations app (core MVP)
  - admin-crm/ — Admin CRM dashboard app (core MVP)
  - [future apps] — Staffing/payroll, scheduling, kanban, analytics, etc. (extensible)

libs/ — Shared libraries with typed exports
  - ui/ — All ShadCN/Tailwind components, design system, and UI primitives
  - supabase/ — Typed Supabase client, query helpers, RLS-safe operations, Realtime adapters
  - shared/ — Domain models, Zod validators, cross-app utilities, integration hooks
  - rag/ — Document ingestion and RAG processing (Python-based)
  - mcp/ — MCP integrations and tooling
  - [extensibility] — Integration points, plugin architecture, event schemas (future)

supabase/ — Database migrations, policies, seeds
  - Schema supports multi-app ecosystem; extensible tables with JSONB metadata fields
  - RLS policies account for multiple application contexts

All applications compose functionality from shared libraries. No duplicated logic, hooks, or data access layers are allowed inside apps. Third-party apps must integrate via documented shared libs and Realtime channels, not by direct database access.

Integration & Extensibility

Third-party and future internal applications integrate via:

Shared Supabase schema with documented RLS policies

Shared domain models and validators (libs/shared)

Realtime channel subscriptions for cross-app state synchronization

Common authentication context (Supabase JWT claims)

Documented API contracts for task, recipe, user, and event entities

Apps maintain isolated feature domains (e.g., payroll app manages payroll-specific tables) while respecting company-level RLS enforcement

Future extensibility may include event-driven architecture or webhook dispatchers for loosely coupled integrations

Frontend + Backend Integration

Next.js App Router provides co-located UI and API layers

Server Components for optimized data rendering

Edge Runtime for low-latency operations

Backend Logic

Supabase SQL/RPC handles atomic business operations

Edge functions for computational tasks (optional)

Real-time Integration

Supabase Realtime broadcasts DB changes to all connected clients instantly

Real-time channels follow naming convention: company:{company_id}:{entity_type}:{optional_app_context}
Examples: company:123:tasks, company:123:recipes, company:123:staffing:payroll
All subscriptions scoped by company_id for tenant isolation

Third-party apps subscribe to relevant channels and trigger local state updates via their own React Query invalidation

Cross-app awareness enabled through shared event schemas published to Realtime broadcasts

Infrastructure Goals

Fast development velocity

Clear domain boundaries

Scalable modular structure

Minimal operational burden

Deployment

Vercel for frontend/API

Supabase for DB, Auth, Storage, Realtime

This approach delivers the scalability benefits of service separation without microservice complexity while maintaining a single codebase through the Turbo monorepo structure.

State Management

State is managed using a hybrid architecture optimized for performance, clarity, and real-time collaboration:

React Server Components

Fetch primary data on initial render

Reduce client-side fetch complexity

React Query

Manage client caching and optimistic updates

Sync UI with server state

Supabase Realtime

Broadcast updates, eliminating polling

Propagate task state changes instantly

Real-time channels keyed by company_id for tenant isolation

Optimistic UI Pattern

Mutations apply optimistically for perceived performance

Final state always reconciles against Supabase Realtime events

Local cache invalidated on realtime confirmation

Conflict Resolution (Last-Write-Wins - Path A):

Server timestamp determines final state in concurrent edit scenarios

Simple deterministic behavior: latest database write wins

Minimal risk of data loss for task state mutations (claims, completions)

Future iterations may implement manual conflict resolution UI if needed

Offline Support

Online-only application: no offline capabilities required

Clients require active connectivity to Supabase at all times

Clients fail closed during connectivity loss

Scaling considerations:

Architecture supports horizontal scaling via:

Distributed caching

Incremental revalidation

Real-time subscription channels

Redux or event-sourcing could be introduced for enterprise-grade workflows, but not necessary at MVP scale

Design goal:

“Fast, tap-first interface with immediate feedback, even in chaotic, high-pressure environments.”

User-Interface-Design

Data Flow
Lifecycle-Based Workflow

Task Lifecycle

Creation (via event or manager)

Aggregation / Combining

Claiming

In-progress

Completion

Review / Audit

Recipe Lifecycle

Creation and storage

Scaling and transformation

Instruction display

Optional updates

Version persistence

Runtime Data Flow

Input: User claims or completes a task

Processing: Request sent to API route → RPC

Database Update

Broadcast: Supabase realtime notifies all clients

UI Update: React Query invalidates local cache

Review: Updated status visible via dashboard / display

Value outcome:

Reduces communication overhead, eliminates duplicated work, and creates real-time shared awareness.

CaterKing-Product-Requirements

Technical Stack

Package Management

pnpm 8+ (exclusive package manager)

No npm, yarn, or Bun usage permitted

Monorepo Management

Turbo 2+ for workspace orchestration

All applications must succeed with turbo build --filter=<app>

TypeScript Standards

TypeScript strict mode enabled

No `any` or implicit-any types

Named exports only (default exports prohibited)

All Supabase queries use generated types from libs/supabase/src/types.ts

Code Organization

All imports use @caterkingapp/* path aliases

Example: import { Button } from '@caterkingapp/ui'

Direct relative imports between apps/libs are prohibited

Application Layer

Next.js 15

React 18

App Router

React Server Components

UI Layer

Tailwind CSS

ShadCN UI (via @caterkingapp/ui shared library)

All UI components sourced from libs/ui

State Management

React Query

Supabase Realtime

Backend Logic

Next.js API Routes

Supabase Edge Functions (optional)

SQL/RPC stored procedures

Data Layer

Supabase Postgres

JSONB for recipes and ingredients

Storage

Supabase Storage (media, images, video)

Media Standards

Managed transcoding via Supabase Functions with loose encoding standards

No strict codec enforcement or maximum file size limits

Thumbnail generation recommended but not mandatory

Minimal validation on upload

Secrets Management

All secrets managed via Doppler

No .env files or ad-hoc secret injection

Required secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

Hosting

Vercel (frontend + API)

Supabase hosting

Scalability benefits:

CDN + edge distribution

API-side rate limiting

Subscription channel partitioning

User-Interface-Design

Authentication Process

Supabase Auth manages (Self-Contained - Path A):

Email/password registration and login

Optional email verification

Identity management

Role assignment via JWT claims

Session management:

Secure JWT token storage

Automatic rotation

Multi-context persistence

Note: SSO/federated identity providers (Google, Microsoft) deferred to post-MVP; current implementation prioritizes simplicity

Roles

staff

manager

event lead

owner

Access Control

Enforced via Postgres Row-Level Security (RLS) — no UI-driven authorization

Roles (staff, manager, event lead, owner) map directly to JWT claims and RLS policy conditions

All sensitive operations protected at database level via RLS policies

Every database action is guarded by tenant-scoped RLS rules

Security Model (RLS-Only - Path A):

Relies solely on database-level RLS policies for tenant isolation

No additional application-layer tenant checks required at MVP stage

Cost-effective approach leveraging Supabase built-in features

Audit logging implemented via trigger-based audit tables (optional for MVP)

Multi-tenant enforcement:

Every row is scoped to company_id, enforced server-side via RLS policies

All queries and mutations must include company_id context

Schema migrations must include RLS policy updates and tenant isolation tests

Value:

Ensures data isolation between companies without manual overhead and prevents privilege escalation

CaterKing-Product-Requirements

Route Design
Staff-Facing Routes
/tasks
/my
/filters
/task/:id
/recipe/:id

Management Dashboard
/admin
/admin/events
/admin/tasks
/admin/staff
/admin/recipes
/admin/upload

Kiosk Display (Passive)
/display


Route goals:

Mobile-first layouts

Large tap targets

Minimal navigation complexity

User-Interface-Design

API Design
REST-ish API Routes

Tasks:

GET    /api/tasks
POST   /api/tasks/:id/claim
POST   /api/tasks/:id/complete
POST   /api/tasks/combine


Events:

GET    /api/events
POST   /api/events


Recipes:

GET    /api/recipes
POST   /api/recipes
PUT    /api/recipes/:id


Users:

GET    /api/users
POST   /api/users/role

Authentication

Handled by Supabase Auth
(No custom auth endpoints required)

Real-Time

Not an endpoint — handled through database listeners

RPC Procedures (Recommended)
claim_task(task_id, user_id)
complete_task(task_id)
combine_tasks(task_array jsonb)


Benefits:

Atomic operations

Reduced race conditions

More predictable state

CaterKing-Product-Requirements

Database Design ERD

Note: All table names and field names must match the generated types in libs/supabase/src/types.ts

Companies
id
name

Users
id
company_id (references companies.id)
role
display_name

Events
id
company_id (references companies.id)
name
date

Tasks
id
event_id
company_id (references companies.id)
name
quantity
unit
status
assigned_user_id
combined_group_id

Recipes
id
company_id (references companies.id)
name
ingredients (jsonb)
steps (jsonb)
media_urls (jsonb)

Media
id
company_id (references companies.id)
url
type

Optional: Audit Logs (Enterprise)
id
company_id (references companies.id)
user_id
entity_type
action_type
timestamp
metadata (jsonb)


Value outcome:

Supports traceability, compliance, and performance analytics.

Relationships

Company → Users

Company → Events → Tasks

Company → Recipes → Media

Tasks → Combined Groups

Security is enforced via RLS at the DB level.

All tables must include company_id for multi-tenant isolation.

CaterKing-Product-Requirements

User Interface Design Document — Checklist Command Center

This document describes the MVP user interface design for a kitchen management platform used by kitchen staff in high-pressure environments, optimized for clarity, cognitive simplicity, and fast completion of prep tasks.

1. Layout Structure
1.1 Primary Screen: Task List

The central UI is a vertical list of large task rows, showing:

Task name (short label)

Quantity / unit

Status button (claim/complete)

Assigned user indicator

Event or dish tag (small)

Optional "group count" if auto-combined

Tasks are grouped in sections based on dynamic filters:

All tasks (default)

By task type (chop, portion, mix, etc.)

By event

By station (prep, hot line, pastry)

By day (today, tomorrow)

Each section includes:

Title

Count of tasks

Collapse/expand control

1.2 Header Bar

Fixed at top of screen:

Brand/logo (small)

Live summary:
“Available | Claimed | Complete”

Quick filter button

User avatar/profile (optional)

1.3 Bottom Action Bar (Mobile Only)

Persistent footer with:

“My Tasks”

“All Tasks”

“Filters”

“Search”

Large tap targets for gloves.

1.4 Expandable Task Detail

Tapping a row expands a drawer-style panel with:

Full instructions

Ingredients

Images

Video tutorials

Links to recipe

Close button is large and persistent.

1.5 Wall-Mounted Screen Mode

Separate display mode that shows:

Task counts

Who is working on what

Biggest tasks remaining

Urgent tasks

Auto-refresh loop

No interaction required

1.6 Desktop Dashboard

Web app for managers with:

Overview of events

Task board

Staff assignment panel

Recipe/method editor

Media upload tools

Not optimized for day-to-day task execution.

2. Core Components
2.1 Task Row

Large, tappable item containing:

Task name (2–6 words)

Quantity (bold)

Status button:

“CLAIM”

“WORKING”

“DONE”

Avatar/initial of assignee

Icons indicating:

Combined task

Urgency

Requires recipe

Size: minimum height 64–72px

2.2 Status Buttons

States:

Gray: Unclaimed

Blue: Claimed

Green: Complete

Yellow: Needs attention

Actions:

Tap once to change state

No confirmation dialogs

2.3 Filter Panel

Simple list of tappable filters:

By Task Type

By Event

By Station

By Status

By User

By Priority

Toggles, not dropdowns.

2.4 Recipe Drawer

Information shown when expanded:

Step-by-step method

Ingredient list

Quantity scaling

Photos

Video

Notes

Allergens

Close button always visible.

2.5 Combine Indicator

If system merges tasks:

Icon: stack of cards

Label: “x3 combined”

Tap for breakdown

3. Interaction Patterns
3.1 Fast, Single-Action Controls

Tap to claim

Tap to complete

Tap to unclaim

Tap to assign to self

No typing required for basic operations.

3.2 Priority-Based Interaction

Urgent tasks appear:

Higher in list

With highlighted background

With alert icon

3.3 Auto-Combine Suggestion

System detects similar tasks and prompts:

“Combine 4 chopping tasks?”
[YES] [NO]

3.4 Recipe Access

Tap task → drawer opens
No full page navigation.

3.5 Undo

Simple global undo:

“Marked complete — undo?”

Appears for 2–3 seconds.

4. Visual Design Elements & Color Scheme
4.1 Purpose

Visual clarity in:

Wet, messy, loud environments

Low attention

Gloves

Movement

4.2 Color

Neutral base:

White background

Black text

Accent colors:

Blue: Active/Working

Green: Complete

Gray: Available

Yellow: Needs attention

Event/dish tags:

Soft colors or muted pills

4.3 Typography

Sans-serif, bold weights:

Task name: Large, bold (16–18px)

Quantity: Medium, bold (14–16px)

Labels: Small, all caps (10–12px)

Absolutely no thin weights.

4.4 Iconography

Large, simple icons:

No decorative visuals

Always paired with text

5. Mobile, Web App, Desktop Considerations
5.1 Mobile (Primary Platform)

One-handed use

Bottom navigation bar

Vertical scrolling

Quick taps

Gloves compatible

Minimal text input

5.2 Wall-Mounted Screens

Passive display

Large tiles

Big text

Auto refresh

No user interaction

Focus:

Status

Progress

Assignment

5.3 Desktop

Used for:

Planning

Scheduling

Assignment

Editing recipes

Uploading media

Layout:

Multi-column

Dense data tables

Drag-and-drop optional

Not optimized for kitchen workflow.

6. Typography
Font Family

Inter, Roboto, or system sans

High legibility

Weights

Bold for tasks

Regular for metadata

Sizes

Minimum 14px mobile text

Minimum 16px desktop text

Contrast

Black text on white background except:

Status buttons

Alerts

7. Accessibility

Although no specific requirements were provided, the environment demands functional accessibility:

7.1 High Contrast

Avoid low-contrast color pairings

Use black text predominantly

7.2 Large Targets

Buttons minimum 44px tall

Rows minimum 64px tall

7.3 Minimal Cognitive Load

Short labels

Consistent controls

No hidden gestures

7.4 Interruptions & Movement

No modal blockers

No time-based auto-dismiss except small undo toast

7.5 Color Independence

Status indicated by color + icon + text

Not color alone

SUMMARY

This UI is designed to support fast, frictionless task execution by kitchen staff working in:

Wet environments

Loud spaces

Constant motion

High-pressure timelines

With gloves

Core principles:

Checklist-first

Status-first

Tap-first

No typing

Minimal cognitive overhead

The system should feel like a digital version of the annotated prep sheets, not a generic app UI.