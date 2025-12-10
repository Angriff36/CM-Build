<!-- anchor: ui-ux-architecture -->
# UI/UX Architecture: CaterKing Platform

**Status:** UI_REQUIRED
<!-- anchor: 1-0-design-system-spec -->
## 1. Design System Specification

Tokens, typography, and interaction contracts live in `libs/ui/src/tokens` and export TypeScript constants consumed by Tailwind config so every app inherits identical styling under the Turbo workspace.
<!-- anchor: 1-1-color-palette -->
### 1.1 Color Palette

Color tokens favor high contrast with minimal saturation noise so staff can parse states quickly even under harsh lighting.
| Token | Value | Usage |
| --- | --- | --- |
| `--ck-color-ink-950` | #050608 | Primary dark canvas for kiosk displays and dim admin toolbars. |
| `--ck-color-ink-900` | #0F1115 | Header bars and overlay backgrounds on PrepChef. |
| `--ck-color-graphite-800` | #1C1F26 | Drawer shells and status banners across dark contexts. |
| `--ck-color-paper-0` | #FFFFFF | Default card and sheet surface on PrepChef mobile. |
| `--ck-color-paper-50` | #F8FAFC | Alternating table rows inside Admin CRM lists. |
| `--ck-color-paper-100` | #F1F5F9 | Filter backgrounds and collapsed sections. |
| `--ck-color-foam-200` | #E2E8F0 | Recipe drawer secondary background supporting media. |
| `--ck-color-slate-300` | #CBD5F6 | Neutral dividers and shimmering skeleton states. |
| `--ck-color-steel-400` | #94A3B8 | Icon strokes, slider rails, and outlines. |
| `--ck-color-ink-600` | #475569 | Secondary text for metadata lines. |
| `--ck-color-azure-500` | #0F8CF2 | Primary action backgrounds for Claim, Save, Assign. |
| `--ck-color-azure-600` | #0063CE | Pressed or active state for primary CTAs and nav focus. |
| `--ck-color-emerald-500` | #10B981 | Completion states and done badges. |
| `--ck-color-emerald-600` | #059669 | Hover/focus accent for completion surfaces. |
| `--ck-color-sun-400` | #FACC15 | Needs-attention statuses and urgent highlight glows. |
| `--ck-color-amber-600` | #D97706 | High-priority warnings and hold states. |
| `--ck-color-rose-500` | #F43F5E | Errors, destructive confirmations, failed uploads. |
| `--ck-color-plum-500` | #A855F7 | Combine suggestion badges and experimentation indicators. |
| `--ck-color-mint-300` | #6EE7B7 | Success pills on admin dashboards. |
| `--ck-color-ocean-700` | #0369A1 | Header gradient start on admin CRM and wall displays. |
| `--ck-color-cloud-100` | #E0F2FE | Recipe step highlight backgrounds and callouts. |
| `--ck-color-carbon-900` | #111827 | Primary text color for kiosk scoreboard and dark modes. |
| `--ck-color-focus-ring` | #1C64F2 | Focus outline color meeting WCAG 8:1 on light backgrounds. |
| `--ck-color-overlay-ink` | rgba(11,17,32,0.85) | Modal scrims and drawer overlays for contrast control. |
| `--ck-color-success-glow` | rgba(16,185,129,0.18) | Halo around combined tasks to reinforce merging. |
| `--ck-color-warning-glow` | rgba(234,179,8,0.22) | Halo around urgent or overdue items. |
| `--ck-color-destructive-glow` | rgba(244,63,94,0.25) | Background wash for destructive confirmations. |
| `--ck-color-body-text` | #0F172A | Default text color referencing font smoothing tokens. |
| `--ck-color-muted-text` | #475467 | Secondary metadata on admin tables. |
| `--ck-color-disabled` | #CBD5E1 | Disabled button fill, slider rails, icon hints. |

<!-- anchor: 1-1-1-base-neutrals -->
#### 1.1.1 Base Neutral Surfaces

- Light default surfaces pair `--ck-color-paper-0` cards with `--ck-color-ink-600` metadata text for a minimum 7:1 contrast.
- Dark surfaces rely on `--ck-color-ink-900` backgrounds with `--ck-color-paper-50` text to satisfy kiosk readability tests.
- Divider tokens use `--ck-color-slate-300` or `--ck-color-steel-400` to keep boundaries visible without shimmering under fluorescent lighting.
<!-- anchor: 1-1-2-semantic-status -->
#### 1.1.2 Semantic Status Scales

- Available tasks: base `--ck-color-paper-0`, accent `--ck-color-ink-600`, icon `ClipboardCheck`.
- Claimed tasks: base `--ck-color-azure-500`, hover `--ck-color-azure-600`, icon `UserCheck` plus assignee avatar.
- Working tasks: base `--ck-color-sun-400`, overlay `--ck-color-warning-glow`, icon `Timer` signifying active prep.
- Completed tasks: base `--ck-color-emerald-500`, text `--ck-color-paper-0`, icon `CheckCircle2`.
- Attention tasks: base `--ck-color-rose-500`, text `--ck-color-paper-0`, icon `AlertTriangle`.
<!-- anchor: 1-1-3-tag-palette -->
#### 1.1.3 Tag & Event Palette

- Station tags: prep=azure, hot=rose, pastry=plum, garde manger=mint.
- Event tags: wedding=plum gradient, corporate=azure gradient, tasting=mint gradient.
- Recipe tags: allergen icons with neutral base and tinted border for readability.
- Combined tasks: stack icon tinted `--ck-color-plum-500` with `--ck-color-success-glow` background.
- Method complexity: novice=cloud, intermediate=sun, advanced=ocean.
- Role chips: staff=ink, manager=azure, event lead=sun, owner=plum.
<!-- anchor: 1-1-4-overlay-gradients -->
#### 1.1.4 Overlay & Gradient Tokens

- Drawer scrims use `--ck-color-overlay-ink` at 85% opacity, fading in 120ms ease-out.
- Kiosk gradients apply `linear-gradient(135deg, --ck-color-ocean-700, --ck-color-ink-900)` to keep telemetry legible.
- Recipe hero overlays use `linear-gradient(180deg, rgba(5,6,8,0), rgba(5,6,8,0.65))` to back text.
- Media upload dropzones use `--ck-color-cloud-100` background with dashed `--ck-color-azure-500` border.
<!-- anchor: 1-2-typography -->
### 1.2 Typography

Inter var is the primary family with `font-feature-settings: 'cv11', 'ss01'` for numeric clarity; fallback stack uses system sans. Line heights stay between 1.25 and 1.5 for readability under glare.
<!-- anchor: 1-2-1-display-scale -->
#### 1.2.1 Display Scale

| Token | Size / Line | Use Cases |
| --- | --- | --- |
| Display-2XL | 32 / 38 | Kiosk hero counts, admin dashboards. |
| Display-XL | 28 / 34 | Event headers, detail views. |
| Display-LG | 24 / 30 | Section titles, summary cards. |
| Heading-MD | 20 / 26 | Task names, drawer headings. |
| Heading-SM | 18 / 24 | Recipe step titles, filter titles. |
| Heading-XS | 16 / 22 | Metadata labels, pill headers. |

<!-- anchor: 1-2-2-body-scale -->
#### 1.2.2 Body Scale

| Token | Size / Line | Use Cases |
| --- | --- | --- |
| Body-LG | 16 / 24 | Primary instructions, admin table text. |
| Body-MD | 14 / 20 | Metadata lines, input descriptions. |
| Body-SM | 12 / 18 | Badge text, button labels. |
| Body-XS | 11 / 16 | Dense tables, helper captions. |
| Caps-XS | 10 / 14 | Section overlines, tag labels. |

<!-- anchor: 1-2-3-mono-scale -->
#### 1.2.3 Numeric & Monospace Usage

- Mono-LG: 18 / 24 � kiosk timers and event countdowns.
- Mono-MD: 16 / 22 � quantity conversions and combine calculations.
- Mono-SM: 14 / 20 � audit IDs and undo tokens.
- Mono-XS: 12 / 18 � version numbers and release tags.
<!-- anchor: 1-3-spacing -->
### 1.3 Spacing & Sizing Scale

| Token | Value | Usage |
| --- | --- | --- |
| 3xs | 2px | Hairline separators and progress ticks. |
| 2xs | 4px | Badge padding and icon-text gaps. |
| xs | 6px | Compact pill spacing. |
| sm | 8px | Inline gaps inside cards. |
| md | 12px | Label-control spacing. |
| lg | 16px | Vertical rhythm in task rows. |
| xl | 20px | Card gutters on mobile. |
| 2xl | 24px | Drawer padding. |
| 3xl | 28px | Section spacing in recipe drawer. |
| 4xl | 32px | Between grouped CTAs. |
| 5xl | 40px | Hero gaps on kiosk. |
| 6xl | 48px | Admin grid gutters. |
| 7xl | 56px | Wall display tile spacing. |
| 8xl | 72px | Edge padding for display scoreboard. |
| 9xl | 96px | Top/bottom margin for kiosk summary. |
| 10xl | 128px | Rare hero spacing on marketing content. |

<!-- anchor: 1-3-1-grid -->
#### 1.3.1 Grid & Layout

- PrepChef uses a 4-column fluid grid with 16px gutters and sticky header + bottom nav.
- Tablets (641�1024px) show two columns for task list and drawer simultaneously.
- Admin CRM uses a 12-column grid with 24px gutters plus collapsible navigation.
- Display surfaces use freeform grids sized in multiples of 8px for readability at distance.
<!-- anchor: 1-3-2-elevation -->
#### 1.3.2 Elevation & Shadows

- `shadow-flat` = 0 0 0 1px rgba(15,23,42,0.08) � default card border.
- `shadow-floating` = 0 8px 24px rgba(15,23,42,0.16) � drawers and modals.
- `shadow-kiosk` = 0 20px 60px rgba(0,0,0,0.45) � wall display tiles.
- `shadow-pressed` = inset 0 2px 4px rgba(15,23,42,0.25) � pressed buttons.
- `shadow-warning` = 0 0 0 2px rgba(234,179,8,0.35) � urgent callouts.
<!-- anchor: 1-3-3-radius -->
#### 1.3.3 Border Radius Tokens

- `radius-none` = 0px for dividers.
- `radius-xs` = 4px for pills and badges.
- `radius-sm` = 6px for inputs.
- `radius-md` = 8px for buttons.
- `radius-lg` = 12px for cards.
- `radius-xl` = 16px for drawers.
- `radius-full` = 999px for avatar chips and toggles.
<!-- anchor: 1-4-component-tokens -->
### 1.4 Component Tokens

- `--ck-state-hover-opacity` = 0.92 keeps hover states subtle on tinted backgrounds.
- `--ck-state-pressed-translate` = 1px ensures physical press feedback.
- `--ck-state-disabled-opacity` = 0.45 prevents ghosting while keeping labels readable.
- `--ck-state-focus-duration` = 150ms to avoid flicker on keyboard navigation.
- `--ck-state-undo-duration` = 3200ms for toast timers, matching Supabase undo TTL.
- `--ck-state-badge-pulse` = keyframe animation for urgent tasks on kiosk only.
<!-- anchor: 1-4-2-focus -->
#### 1.4.2 Focus Rings & A11y Overlays

- Standard halo: 3px solid `--ck-color-focus-ring` with 2px offset.
- Dark mode halo: 3px solid `--ck-color-cloud-100` with azure inner shadow.
- Error halo: 3px solid `--ck-color-rose-500` triggered on invalid input blur.
- Keyboard trap outlines show on drawers and modals via `data-focus-scope` attributes.
<!-- anchor: 1-4-3-motion -->
#### 1.4.3 Motion & Micro-Interactions

- `ease-out-snap` cubic-bezier(0.16,1,0.3,1) animates task row expansion.
- `ease-in-fast` cubic-bezier(0.4,0,1,1) dismisses undo toasts quickly without jarring bounce.
- `duration-base` 180ms handles button and pill transitions.
- `duration-drawer` 240ms slides recipe drawer smoothly.
- `duration-kiosk` 800ms fades wall display tiles politely for at-a-distance readability.
<!-- anchor: 1-5-iconography -->
### 1.5 Iconography & Imagery

- Lucide icon set with 1.75px stroke ensures clarity under steam and glare.
- Icons always pair with text labels to avoid color-only communication.
- Recipe imagery auto-crops to 4:3 with focus point metadata stored in Supabase Storage.
- Video thumbnails include play badge plus duration pill using monospace typography.
- Combined task icon uses stacked cards motif tinted `--ck-color-plum-500`.
<!-- anchor: 1-6-data-density -->
### 1.6 Data Density Guidelines

- Mobile task list displays max two metadata lines per row to avoid cognitive overload.
- Admin tables use zebra striping beyond twelve rows to keep readability.
- Display tiles limit to four data points per tile; additional metrics rotate every eight seconds.
- Recipe drawer uses collapsible sections (Ingredients, Steps, Media, Notes) with sticky tab header.
- Filters show active states as chips above the fold for quick audit of context.
<!-- anchor: 1-7-accessibility-tokens -->
### 1.7 Accessibility Tokens

- `data-role-required` attribute toggles explanatory copy when current role lacks permission.
- `aria-live` containers wrap status banners so screen readers announce realtime updates clearly.
- `data-contrast` flag ensures kiosk mode switches to highest contrast palette automatically during low-light detection.
- `data-offline` attribute toggles greyed-out controls and writes reason copy when connectivity drops.
- `data-training` attribute marks recipe steps containing allergens so screen readers include warnings.
<!-- anchor: 1-8-tone-microcopy -->
### 1.8 Tone & Microcopy Guidance

- Voice is directive, concise, and action oriented: "Claim onion prep", "Undo completion", "Assign to Gaby".
- Avoid passive urgent text; highlight responsible action ("Finish in 5 min" not "Needs to be finished").
- Undo toasts always repeat the action that occurred plus a countdown ("Marked done � Undo (3s)").
- Recipes include short verbs first with bolded quantities for scanning.
- Manager-only warnings explicitly cite RBAC reason to prevent confusion ("Owner role required").
<!-- anchor: 2-0-component-architecture -->
## 2. Component Architecture

Component architecture follows Atomic Design, yet implementations live inside shared packages so Next.js apps simply compose them with typed data from libs/shared.
<!-- anchor: 2-1-overview -->
### 2.1 Methodology & Composition Overview

Atoms map to ShadCN primitives with CaterKing tokens; molecules compose micro-interactions; organisms align with routes or drawers; templates fix layout scaffolds per surface, all feature-flag aware.
<!-- anchor: 2-2-atomic-structure -->
### 2.2 Atomic Structure

Atom, molecule, and organism catalogs ensure 40�60 reusable building blocks aligned with the project's large-scale scope.
<!-- anchor: 2-2-1-atom-catalog -->
#### 2.2.1 Atom Catalog (20)

- **Primary Button** � Default CTA built from ShadCN Button styled for Claim/Save operations. Props: variant=primary / size=sm-md-lg / iconSlot / loading / disabled. States: default, hover, pressed, focus-visible, loading, offline-locked. Accessibility: role=button with aria-pressed when toggled and aria-live polite when loading. Usage: Reserve for Claim Task, Approve Combine, Save Recipe primary actions..
- **Secondary Button** � Low-emphasis outlined button for optional flows. Props: variant=secondary / size=xs-sm-md / iconSlot. States: default, hover, pressed, focus-visible. Accessibility: Maintains 3:1 outline contrast and 4.5:1 text contrast. Usage: Cancel, Skip, Load More interactions..
- **Destructive Button** � Red-toned CTA for irreversible operations such as deleting media. Props: variant=destructive / confirmText / loading. States: default, hover, pressed, confirm. Accessibility: Requires aria-describedby referencing warning copy. Usage: Only visible to roles allowed to delete tasks or media..
- **Ghost Button** � Text-only button on neutral surfaces for tertiary actions. Props: variant=ghost / iconSlot. States: default, hover, focus. Accessibility: Displays underline on focus to aid discovery. Usage: Used for See All links and kiosk view toggles..
- **Icon Button** � Square button with centered icon for filter toggles and kiosk actions. Props: size=xs-sm-md / aria-label / selected. States: default, hover, pressed, selected. Accessibility: aria-label describes action; focus halo persists. Usage: Filter toggles, view switches, kiosk rotation controls..
- **Status Dot** � Small circular badge representing availability or realtime health. Props: status=available-claimed-complete-urgent. States: static, pulsing. Accessibility: role=img with descriptive label for color independence. Usage: Prepended to task names and staff avatars..
- **Avatar Chip** � Rounded avatar or initials with optional presence ring. Props: src / initials / presence=online-idle-offline. States: default, stacked, ringed. Accessibility: Alt text includes role and staff name. Usage: Shows assignees on task cards and manager boards..
- **Numeric Badge** � Rounded pill with count for notifications or combine suggestions. Props: count / tone=info-success-warning. States: default, pulse. Accessibility: Announced via aria-label inside nav items. Usage: Displayed on nav icons, combine buttons, upload queue..
- **Inline Loader** � Spinner or progress bar sized to fit inside buttons and cards. Props: variant=spinner-bar / size=sm-md. States: spinning, determinate, success, fail. Accessibility: aria-live assertive with text for long operations. Usage: Used when claiming, combining, uploading media..
- **Text Input Field** � Rounded input with floating label for admin forms. Props: label / placeholder / value / error. States: default, focus, error, disabled. Accessibility: Label tied via id, describes error via aria-describedby. Usage: Recipe name, event title, search fields..
- **Search Input** � Input with search icon, clear button, and shortcuts. Props: placeholder / value / onClear / hotkey. States: idle, typing, loading. Accessibility: Exposes keyboard shortcut via aria-keyshortcuts. Usage: Filter tasks, recipes, staff directories..
- **Toggle Switch** � Large switch for binary settings such as filter toggles. Props: checked / disabled / labelPlacement. States: checked, unchecked, focus. Accessibility: role=switch with aria-checked state. Usage: Enable kiosk rotation, flag urgent tasks..
- **Checkbox Tile** � Checkbox with extended hit area and description text. Props: checked / description / disabled. States: checked, unchecked, indeterminate. Accessibility: Proper label association and 4px focus halo. Usage: Selecting tasks inside combine review or multi-select filters..
- **Radio Puck** � Circular radio optimized for gloves via 36px diameter. Props: value / checked / disabled. States: checked, unchecked. Accessibility: Announces via aria-checked. Usage: Selecting priority, role, or event filters..
- **Stepper Control** � Increment/decrement control for numeric fields like portions. Props: value / min / max / step. States: idle, disabled, pressed. Accessibility: Buttons use aria-label Increase quantity / Decrease quantity. Usage: Scaling combined tasks or adjusting recipe batch sizes..
- **Progress Sparkline** � Tiny horizontal indicator representing completion percentage. Props: value / tone. States: determinate, success. Accessibility: aria-valuenow, aria-valuemax for screen readers. Usage: Displayed on event summary cards and kiosk tiles..
- **Tag Pill** � Rounded pill for events, stations, allergens. Props: label / tone / icon. States: idle, selected, removable. Accessibility: Removable pills expose aria-label for Remove action. Usage: Filters, recipe metadata, component badges..
- **Tooltip Trigger** � Icon or word with tooltip for definitions. Props: content / alignment. States: hidden, visible. Accessibility: aria-describedby + focus trap ensures keyboard support. Usage: Explain heuristics, conversions, or RLS warnings..
- **Divider Rule** � 1px line or dotted rule for grouping. Props: orientation=horizontal-vertical. States: static. Accessibility: role=separator with aria-orientation. Usage: Between metadata clusters, nav sections, kiosk columns..
- **Focus Halo Utility** � Tokenized outline effect applied via CSS mixin. Props: color / offset / width. States: visible, suppressed. Accessibility: Ensures 3px halo meeting WCAG contrast requirements. Usage: Injected automatically into Button, Input, Toggle, and nav components..
<!-- anchor: 2-2-2-molecule-catalog -->
#### 2.2.2 Molecule Catalog (20)

- **Task Status Chip** � Combined tag showing task status, priority icon, and quantity. Props: status / priority / quantity / unit. States: available, claimed, urgent, completed. Accessibility: Includes aria-label summarizing status, priority, and quantity. Usage: Displayed inside every task card and kiosk tile..
- **Task Metadata Row** � Row containing event tag, station, due time, and user avatar. Props: eventName / station / dueAt / assignee. States: compact, expanded. Accessibility: Wraps dynamic data in <dl> for semantics. Usage: Used inside list rows, drawers, admin tables..
- **Claim Control Cluster** � Group of primary button, undo link, and timer showing time since claim. Props: status / assignee / undoToken. States: claimable, claimed, working, blocked. Accessibility: Focus order cycles button ? timer ? undo link with aria-live updates. Usage: Embedded within each task row on PrepChef..
- **Task Timer Row** � Monospace countdown with color-coded thresholds. Props: targetTime / severity. States: normal, warning, overdue. Accessibility: Announces threshold crossings via aria-live assertive. Usage: Appears inside urgent cards, display tiles, admin dashboards..
- **Recipe Ingredient Row** � Shows bold quantity, unit, ingredient, and optional allergen icons. Props: quantity / unit / ingredient / allergenFlags. States: standard, scaled, combined. Accessibility: Quantities read with unit conversions; allergens include sr-only warnings. Usage: Recipe drawer and admin recipe editor..
- **Recipe Step Card** � Numbered step with instructions, media thumbnail, and timer. Props: stepNumber / body / mediaUrl / timer. States: default, expanded, video-playing. Accessibility: Uses ordered list semantics and ARIA roles for video control hints. Usage: Used on mobile drawer and admin method viewer..
- **Combine Suggestion Card** � Displays matching tasks, normalized quantity, and accept or decline buttons. Props: suggestionId / taskList / normalizedQuantity / confidence. States: pending, accepted, dismissed. Accessibility: List of merged tasks uses <ul> with aria-live for updates. Usage: PrepChef combine tab and admin review surfaces..
- **Filter Pill Group** � Horizontal scroll of interactive pills representing active filters. Props: filters[] / onClearAll. States: empty, active. Accessibility: Wraps pills in <nav> with aria-label Active filters. Usage: Displayed below header on PrepChef and in admin forms..
- **Filter Drawer Header** � Contains search input, summary count, and close button. Props: title / count / onClose. States: sticky, scrolled. Accessibility: Close button uses aria-label referencing sheet title. Usage: Filters drawer across apps..
- **Undo Toast** � Floating toast summarizing last action with undo CTA. Props: message / undoLabel / timeout / severity. States: visible, counting-down, dismissed. Accessibility: aria-live polite, focus trap when keyboard triggered. Usage: PrepChef actions, admin CRUD, kiosk warnings (read-only)..
- **Event Summary Card** � Card showing event name, date, task counts, staffing heat map. Props: event / counts / staffing. States: active, scheduled, completed. Accessibility: Structured as <article> with heading for quick navigation. Usage: Admin dashboard, display summary, manager board..
- **Staff Presence Tile** � Tile showing staff avatar, current tasks, and station. Props: staff / currentTask / station / availability. States: available, busy, offline. Accessibility: Announces presence transitions via aria-live and uses color + icon. Usage: Manager assignment board and kiosk presence column..
- **Media Upload Row** � Row with thumbnail, progress bar, status icon, and retry control. Props: fileName / size / progress / status. States: pending, uploading, processing, ready, failed. Accessibility: aria-valuenow for progress; failure states include descriptive text. Usage: Admin upload route, recipe editor, method viewer..
- **Role Guard Banner** � Inline banner clarifying RBAC restrictions and action needed. Props: roleRequired / action. States: info, warning. Accessibility: role=alert with link to documentation. Usage: Displayed when staff tries to assign tasks beyond role or edit recipes..
- **Search & Filter Bar** � Sticky header containing search input, filter icon, and summary counts. Props: placeholder / filterCount / summary. States: idle, typing, filtered. Accessibility: Wraps search input with labelled icon button for filter drawer. Usage: Used on `/tasks`, `/admin/tasks`, `/admin/staff`..
- **Station Summary Card** � Card summarizing tasks per station with progress bars. Props: stationName / counts / topTask. States: balanced, overloaded. Accessibility: ARIA labels call out overload state and number of tasks. Usage: Manager board and display station view..
- **Display Stats Tile** � Large numeric tile for kiosk showing label, value, delta, and icon. Props: label / value / delta / severity. States: stable, warning, urgent. Accessibility: High contrast text plus sr-only label describing severity. Usage: Wall display loops and admin overview page..
- **Notification Preference Row** � Row containing channel toggle, quiet hours, and last update. Props: channel / enabled / quietHours. States: enabled, disabled, pending. Accessibility: Switch includes aria-describedby referencing quiet hours. Usage: Admin CRM user settings..
- **Method Stepper** � Vertical timeline showing progress through training method steps. Props: steps[] / currentIndex. States: locked, available, completed. Accessibility: Structured as <ol> with progressbar for percent done. Usage: Method viewer and onboarding flows..
- **Tag Manager Row** � Row that lets owners manage tags with inline add or remove actions. Props: tag / usageCount / editable. States: read-only, editing. Accessibility: Adds sr-only text for remove buttons indicating tag usage. Usage: Admin recipes, staff roles, event metadata..
<!-- anchor: 2-2-3-organism-catalog -->
#### 2.2.3 Organism Catalog (20)

- **Task List Panel** � Virtualized list with grouped sections, sticky header, and realtime badges. Props: sections[] / filters / realtimeStatus. States: loading, populated, stale, offline. Accessibility: Uses <section> with aria-labelledby and virtualization-friendly sr-only announcements. Usage: Backbone of `/tasks`, `/my`, and `/filters` views..
- **Task Detail Drawer** � Drawer overlay showing instructions, ingredients, media, and actions. Props: task / recipe / methods / actions. States: collapsed, expanded, pinned. Accessibility: Traps focus, provides escape shortcuts, keeps close button within reach. Usage: Toggles from any task row and pinned on tablets..
- **Combine Review Drawer** � Side panel summarizing heuristically matched tasks with approval controls. Props: suggestions[] / filters. States: pending, accepted, dismissed. Accessibility: Ordered list of tasks with justificatory copy for each match. Usage: PrepChef combine route and admin combine queue..
- **Recipe Drawer** � Slide-out with tabs for Steps, Ingredients, Media, Notes. Props: recipe / selectedTab / scaling. States: loading, ready, offline. Accessibility: Tabs use role=tablist with keyboard support and sr-only instructions. Usage: PrepChef, CaterKing, and admin reference surfaces..
- **Filter Sheet** � Full-height modal sheet with sectioned filters and apply or clear actions. Props: sections[] / activeFilters. States: hidden, visible. Accessibility: Focus trap and inert backdrop to satisfy accessibility. Usage: Filters for tasks, staff, events, recipes..
- **Bottom Navigation Bar** � Persistent nav with My Tasks, All Tasks, Filters, Search. Props: items[] / active. States: default, badge, disabled. Accessibility: Labels always visible; uses aria-current for active route. Usage: PrepChef mobile..
- **Manager Kanban Board** � Drag-and-drop board grouping tasks by status or station. Props: columns[] / draggable / presence. States: dragging, drop-allowed, drop-blocked. Accessibility: Keyboard reordering supported via roving tabindex. Usage: Admin CRM tasks route and event command center..
- **Event Timeline Surface** � Timeline view showing events plotted by scheduled time with progress. Props: events[] / timelineRange. States: dense, sparse. Accessibility: Provides textual summary when canvas rendering occurs. Usage: Admin events route and kiosk schedule view..
- **Staff Assignment Board** � Grid showing staff vs tasks with manual assignment controls. Props: staff[] / tasks[] / assignments. States: idle, editing, conflict. Accessibility: Cells expose aria-describedby referencing assignment info. Usage: Manager surfaces and event leads..
- **Media Library Grid** � Responsive grid of thumbnails with filters and uploader. Props: media[] / filters. States: loading, filtering, selection. Accessibility: Toggle list or grid view with accessible buttons, alt text on thumbnails. Usage: Admin upload route and recipe attachments..
- **Role Management Table** � Table summarizing users, roles, invites, and actions. Props: users[] / pagination. States: view, edit, pending. Accessibility: Uses <table> semantics and action buttons with sr-only text. Usage: Admin staff management page..
- **Recipe Editor Workspace** � Multi-column layout for editing metadata, ingredients, steps, media. Props: recipeDraft / validationState. States: draft, saving, conflict. Accessibility: Autosaves announce via aria-live; validations reference help text. Usage: Admin recipe route..
- **Method Viewer Canvas** � Video player plus transcript and progress tracking. Props: method / progress / resources. States: playing, paused, offline. Accessibility: Captions default on; transcripts accessible via <details>. Usage: PrepChef recipe drawer and admin training..
- **Display Scoreboard Wall** � Full-screen grid summarizing tasks, events, urgent queue. Props: company / summary / refreshState. States: live, stale, offline. Accessibility: High contrast accessible from 10m; limited animation. Usage: apps/display default route..
- **Display Alert Feed** � Vertical ticker with urgent tasks and assignments. Props: alerts[] / rotationInterval. States: idle, rotating, paused. Accessibility: Slow scroll speed and sr-only label Alert ticker. Usage: Kiosk side panel..
- **Admin Dashboard Shell** � Layout with persistent side nav, top bar, content region, detail panel. Props: navItems / breadcrumbs / user. States: expanded, collapsed. Accessibility: Side nav uses button with aria-expanded for collapse. Usage: Admin default shell reused across modules..
- **Task Creation Wizard** � Stepper guiding managers through new task creation across events. Props: steps / currentStep / validation. States: editing, reviewing, submitting. Accessibility: Stepper announces step count and progress. Usage: Admin or event leads when seeding tasks..
- **Audit Log Viewer** � List of audit entries with filters by entity, actor, time. Props: filters / logs[]. States: loading, filtered. Accessibility: Records use <article> semantics and include sr-only diff summary. Usage: Owner and manager oversight..
- **Notification Center Panel** � Panel listing in-app notifications with actions (jump, dismiss). Props: notifications[] / filters. States: unread, read, pinned. Accessibility: ARIA list with roles for buttons and sr-only timestamps. Usage: PrepChef and admin global header..
- **Training Playlist Browser** � List of training playlists with progress bars and tags. Props: playlists[] / assigned. States: assigned, optional. Accessibility: Each playlist uses <section> with heading and sr-only instructions. Usage: Method documentation center and onboarding flows..
<!-- anchor: 2-2-4-template-library -->
#### 2.2.4 Template Library (10)

- **PrepChef Daily Run Template** � Stacks header summary, filter pills, task list, bottom nav. Composition: HeaderSummary + FilterPills + TaskListPanel + BottomNav. Data Flow: Server components load tasks; React Query handles mutations.. Notes: Used on `/tasks` and `/my` with minimal variance..
- **PrepChef Filter Deep Dive Template** � Half-screen sheet with categories, toggles, and apply bar. Composition: FilterDrawerHeader + FilterSections + StickyActionRow. Data Flow: Filters stored in URL params for shareability.. Notes: Locks background scroll and dims content below..
- **Combine Decision Template** � Two-column layout showing suggestion list and breakdown panel. Composition: SuggestionList + TaskBreakdown + ApprovalFooter. Data Flow: Supabase edge function populates normalized quantities.. Notes: Feature flag `prep.task-combine.v1` gates release..
- **Recipe Reference Template** � Drawer with tabs, step list, ingredient grid, media viewer. Composition: TabHeader + StepList + IngredientGrid + MediaCarousel. Data Flow: Streaming server component hydrates instructions while React Query caches conversions.. Notes: Matches both PrepChef and CaterKing surfaces..
- **Event Setup Template** � Admin flow combining event summary, staff assignment, and default tasks. Composition: EventForm + StaffPicker + TaskTemplateList. Data Flow: Uses libs/shared/events to create skeleton event.. Notes: Auto-saves drafts with version markers..
- **Staff Assignment Template** � Board showing staff vs tasks with drag handles. Composition: StaffAssignmentBoard + FilterBar. Data Flow: React Query mutation hitting Supabase RPC assign_task.. Notes: Role-guarded to manager+ roles..
- **Media Upload Template** � Column layout with upload queue, storage usage, and metadata form. Composition: UploadDropzone + MediaUploadRowList + StorageMeter. Data Flow: Uploads use signed URLs with progress events.. Notes: Exposes failure states and retry controls..
- **Role Change Template** � Modal summarizing new role permissions with confirm CTA. Composition: RoleGuardBanner + ChangeSummary + ConfirmBar. Data Flow: Calls Supabase RPC to update role assignment and refresh via realtime.. Notes: Double confirmation for owner-level promotions..
- **Display Loop Template** � Full-screen carousels rotating task summaries, urgent queue, presence heatmap. Composition: DisplayStatsGrid + UrgentTicker + PresenceLane. Data Flow: Reads from summary endpoint with SSE fallback.. Notes: Auto refresh every eight seconds or on realtime push..
- **Admin Insight Template** � Card-based analytic view with charts and tables. Composition: InsightFilterBar + ChartGrid + DataTable. Data Flow: Server components fetch aggregated counts; charts rehydrate via client component.. Notes: Future-ready for analytics expansion..
<!-- anchor: 2-3-component-hierarchy-diagram -->
### 2.3 Component Hierarchy Diagram (PlantUML)

~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
skinparam packageStyle rectangle
package "libs/ui" {
  [Button]
  [Tag Pill]
  [Status Dot]
  [Avatar Chip]
}
package "libs/shared" {
  [useTaskListHook]
  [useRealtimeChannel]
}
package "apps/prepchef" {
  [Task List Panel]
  [Task Detail Drawer]
}
package "apps/admin-crm" {
  [Manager Kanban Board]
  [Recipe Editor Workspace]
}
package "apps/display" {
  [Display Scoreboard Wall]
}
[Button] --> [Task List Panel]
[Tag Pill] --> [Task List Panel]
[Status Dot] --> [Task List Panel]
[Avatar Chip] --> [Task Detail Drawer]
[Tag Pill] --> [Manager Kanban Board]
[Button] --> [Recipe Editor Workspace]
[Status Dot] --> [Display Scoreboard Wall]
[useTaskListHook] --> [Task List Panel]
[useRealtimeChannel] --> [Display Scoreboard Wall]
@enduml
~~~

<!-- anchor: 2-4-interaction-patterns -->
### 2.4 Interaction Patterns & State Sync

- Optimistic mutation pattern: React Query updates task state immediately, then Supabase realtime reconfirms or rolls back.
- Undo orchestration: each mutation returns undo_token stored in toast queue; tokens expire after five minutes or conflicting change.
- Presence updates: `useRealtimeChannel` maps presence payloads to Avatar Chip halos to show who is active on each event.
- Combine approvals: suggestions render in lists where Accept triggers Supabase RPC, updates group_id, and logs audit entry.
- Media uploads: dropzone collects multiple files, shows Inline Loader bar, and posts to Supabase Storage with progress.
<!-- anchor: 2-5-device-guidance -->
### 2.5 Device-Specific Component Guidance

- **PrepChef Mobile**
  - Sticky header with summary counts
  - Bottom nav with large tap targets
  - Drawer that overlays 90% width

- **PrepChef Tablet**
  - Two-pane layout keeps list and drawer visible
  - Recipe imagery expands to left half
  - Filter sheet appears as side panel

- **Admin Desktop**
  - Persistent side nav with collapse toggle
  - Detail drawer floats over tables
  - Drag handles sized for pointer

- **Display**
  - Auto-rotating tiles with eight second interval
  - Large typography using Display tokens
  - Offline banner pinned to bottom

<!-- anchor: 2-6-motion-guidelines -->
### 2.6 Motion & Micro-Interaction Scripts

- Task row expands downward using ease-out-snap to reveal secondary controls.
- Recipe drawer slides from right with slight overshoot to mimic physical sheet.
- Undo toast counts down using progress bar that shrinks linearly.
- Display tiles fade rather than slide to avoid motion sickness when viewed from afar.
- Manager drag handles animate drop targets with scale-up effect when a valid assignment is available.
<!-- anchor: 2-7-content-modularity -->
### 2.7 Content Modularity & Feature Flags

Feature flags from Flagsmith (via libs/shared/flags) wrap experimental UI such as combine heuristics v2, training checklists, and kiosk alert severity. Each flagged component accepts `isEnabled` prop plus fallback UI so toggles can occur server-side without flicker.
<!-- anchor: 2-8-component-qa -->
### 2.8 Component QA & Storybook Coverage

Every atom, molecule, and organism includes Storybook stories with Chromatic snapshots covering default, hover, focus, disabled, error, and realtime states. Accessibility tests (axe) run per story to maintain WCAG compliance.
<!-- anchor: 3-0-application-structure -->
## 3. Application Structure & User Flows

Route architecture maps to App Router segments with shared layouts in `app/(shell)/layout.tsx` so stateful providers (React Query, Supabase) remain consistent across screens.
<!-- anchor: 3-1-routes -->
### 3.1 Route Definitions

| Route | Surface | Roles | Purpose | Access Notes |
| --- | --- | --- | --- | --- |
| `/tasks` | PrepChef | staff, manager, event lead | Primary mobile task inbox with realtime summary. | Requires active session, company scope, subscribes to tasks + events channels. |
| `/tasks/[id]` | PrepChef | staff, manager | Direct link to expanded task drawer. | Prefetches recipe and method data server-side. |
| `/my` | PrepChef | staff | Assigned tasks filter with quick status counts. | Shows only tasks where assigned_user_id matches current user. |
| `/filters` | PrepChef | all | Saved filter combinations and filter builder. | Hydrates from query params and writes to Supabase profile settings. |
| `/recipes/[id]` | PrepChef | staff, manager | Recipe viewer for quick reference. | Loads recipe JSONB fields via server component and caches via ISR. |
| `/combine` | PrepChef | manager, event lead | Combine suggestion queue for approvals. | Feature flag gated, requires manager role per RLS. |
| `/admin` | Admin CRM | manager, owner | Dashboard summarizing events, staff, tasks, media. | Loads metrics via server components plus React Query hydration. |
| `/admin/events` | Admin CRM | manager, owner | Event list with filters and timeline view. | Supports pagination and shareable filter URLs. |
| `/admin/tasks` | Admin CRM | manager, event lead | Task board with drag and drop assignment. | Requires websocket to observe updates and falls back to five second polling. |
| `/admin/staff` | Admin CRM | manager, owner | Staff directory with roles, invites, presence. | Writes to Supabase via RPC for role updates. |
| `/admin/recipes` | Admin CRM | owner | Recipe management and version history. | Uploads media, handles optimistic locking. |
| `/admin/upload` | Admin CRM | manager, owner | Bulk media upload console. | Uses signed URLs and SSE for processing status. |
| `/admin/settings` | Admin CRM | owner | Company settings and flag toggles. | Strict RBAC plus audit logging for each change. |
| `/display` | Display | all (read-only) | Default wall display summary view. | Auto refresh with SSE fallback. |
| `/display/wall` | Display | all | Full-screen scoreboard. | No interactions; views kiosk summary snapshots. |
| `/display/alerts` | Display | all | Alert ticker focusing on urgent or overdue tasks. | Rotates content automatically and highlights offline states. |
| `/display/stations` | Display | all | Station-specific board showing assignments and statuses. | Cycle per station or show multi-column view. |

<!-- anchor: 3-2-layout-patterns -->
### 3.2 Layout Patterns & Contextual Variations

- PrepChef uses sticky header and floating bottom nav so filters and navigation stay reachable regardless of scroll.
- CaterKing surfaces reuse PrepChef layout but show aggregated event panel at top for smaller teams.
- Admin CRM uses Layout component with persistent side nav; detail drawers overlay content without losing scroll position.
- Display app uses layout handling screen orientation and rotation intervals with passive components only.
<!-- anchor: 3-3-navigation -->
### 3.3 Navigation & Context Switching

- Bottom nav exposes My Tasks, All Tasks, Filters, Search; each item surfaces numeric badges where relevant.
- Global header shows company name, realtime status pill, profile avatar with quick role switch if user has multi-company access.
- Admin breadcrumbs use `next/navigation` to manage deep linking for events, tasks, recipes, and staff.
- Kiosk nav is hidden but rotation controls are accessible via secure admin gesture to avoid casual tampering.
<!-- anchor: 3-4-data-contexts -->
### 3.4 Screen Data Contexts

- PrepChef Task List: tasks (paged and filtered), stats summary, user presence, feature flags, offline state.
- Task Drawer: recipe, methods, media, undo queue, assigned users, timers.
- Admin Events: event list, counts by state, timeline data, staff assignments.
- Admin Tasks: board columns, staff list, presence, combined group metadata.
- Display: summary snapshot, urgent queue, presence heartbeat, kiosk health telemetry.
<!-- anchor: 3-5-critical-flows -->
### 3.5 Critical User Journeys (PlantUML)

<!-- anchor: 3-5-1-task-claim -->
#### 3.5.1 Task Claim and Completion Journey

Key Highlights: 4 steps
- Staff sees aggregated tasks on `/tasks` with statuses updated through React Query caches tied to realtime events.
- Tapping Claim triggers server action `claim_task` and disables other claim controls via optimistic updates.
- Completion uses the same mutation pipeline and exposes undo toast.
- Realtime broadcasts confirm or roll back optimistic state to all connected clients.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Staff Tablet" as F1_1
participant "PrepChef UI" as F1_2
participant "Next.js Server Action" as F1_3
participant "Supabase RPC" as F1_4
participant "Supabase Realtime" as F1_5
participant "Peer Clients" as F1_6
F1_1 -> F1_2 : Tap Claim on task
F1_2 -> F1_3 : Invoke claim_task action
F1_3 -> F1_4 : call claim_task
F1_4 -> F1_5 : Emit task_claimed event
F1_5 -> F1_2 : Deliver task update
F1_2 -> F1_1 : Render claimed state + Undo toast
F1_5 -> F1_6 : Broadcast claimed update
@enduml
~~~

<!-- anchor: 3-5-2-recipe-reference -->
#### 3.5.2 Recipe Reference Within Task Flow

Key Highlights: 4 steps
- Staff expands task row to open recipe drawer without leaving context.
- Drawer loads Steps, Ingredients, Media via streaming server component for immediate readability.
- User can play method video or view ingredient scaling, then collapse drawer to continue work.
- UI logs telemetry event for recipe view to gauge documentation usage.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Staff Tablet" as F2_1
participant "Task Row" as F2_2
participant "Recipe Drawer" as F2_3
participant "Supabase Storage" as F2_4
participant "Telemetry" as F2_5
F2_1 -> F2_2 : Tap Recipe
F2_2 -> F2_3 : Expand drawer and focus close control
F2_3 -> F2_4 : Request media signed URL
F2_3 -> F2_1 : Stream instructions + imagery
F2_3 -> F2_5 : Log recipe_view event
F2_1 -> F2_2 : Close drawer and resume list
@enduml
~~~

<!-- anchor: 3-5-3-manager-assign -->
#### 3.5.3 Manager Assignment Flow

Key Highlights: 4 steps
- Manager opens `/admin/tasks` board filtered by event.
- Dragging task card onto staff column triggers optimistic assignment update.
- Server action calls Supabase RPC to set assigned_user_id and emits audit log.
- Realtime updates refresh PrepChef lists instantly.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Manager Desktop" as F3_1
participant "Admin Board" as F3_2
participant "Next.js Server Action" as F3_3
participant "Supabase RPC" as F3_4
participant "Audit Log" as F3_5
participant "Realtime" as F3_6
participant "PrepChef UI" as F3_7
F3_1 -> F3_2 : Drag card to staff
F3_2 -> F3_3 : Submit assignment payload
F3_3 -> F3_4 : call assign_task
F3_4 -> F3_5 : Insert assignment event
F3_4 -> F3_6 : Emit task_assigned
F3_6 -> F3_2 : Confirm new assignment
F3_6 -> F3_7 : Update assignee avatar
@enduml
~~~

<!-- anchor: 3-5-4-combine-approval -->
#### 3.5.4 Combine Suggestion Approval Flow

Key Highlights: 4 steps
- Manager opens combine drawer to review heuristically matched tasks.
- Selecting Accept merges tasks via Supabase function and updates combined_group_id.
- UI shows breakdown for transparency and logs audit entry.
- Realtime updates remove merged tasks from other clients' lists.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Manager Tablet" as F4_1
participant "Combine Drawer" as F4_2
participant "Supabase Edge Function" as F4_3
participant "Supabase RPC" as F4_4
participant "Realtime" as F4_5
participant "Peer Clients" as F4_6
F4_1 -> F4_2 : Tap Accept
F4_2 -> F4_3 : call combine_tasks
F4_3 -> F4_4 : Write combined group
F4_4 -> F4_5 : Publish combine event
F4_5 -> F4_1 : Update drawer state
F4_5 -> F4_6 : Remove merged duplicates
@enduml
~~~

<!-- anchor: 3-5-5-media-upload -->
#### 3.5.5 Media Upload & Method Update Flow

Key Highlights: 4 steps
- Owner opens `/admin/upload` to add training video.
- Dropzone obtains signed URL and shows progress via Inline Loader.
- After upload, Supabase function triggers transcoding and notifies UI.
- Method viewer references processed media with fallback thumbnail.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Owner Desktop" as F5_1
participant "Upload Template" as F5_2
participant "Supabase Storage" as F5_3
participant "Supabase Function" as F5_4
participant "Method Viewer" as F5_5
F5_1 -> F5_2 : Drop file
F5_2 -> F5_3 : PUT signed URL
F5_3 -> F5_4 : Trigger transcoding
F5_4 -> F5_2 : Emit processing status
F5_2 -> F5_5 : Refresh media list
F5_5 -> F5_1 : Show ready state
@enduml
~~~

<!-- anchor: 3-5-6-role-change -->
#### 3.5.6 Role Change & RBAC Confirmation Flow

Key Highlights: 4 steps
- Owner selects staff member in `/admin/staff` and chooses new role.
- Modal summarises permissions and requires confirmation.
- Server action updates role via Supabase RPC, logs audit, and invalidates caches.
- Affected user receives notification center message and sees updated capabilities.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Owner Desktop" as F6_1
participant "Role Modal" as F6_2
participant "Next.js Server Action" as F6_3
participant "Supabase RPC" as F6_4
participant "Audit Log" as F6_5
participant "Notification Center" as F6_6
participant "Staff Tablet" as F6_7
F6_1 -> F6_2 : Select new role
F6_2 -> F6_3 : Confirm role change
F6_3 -> F6_4 : call update_role
F6_4 -> F6_5 : Record change
F6_4 -> F6_6 : Push role change event
F6_6 -> F6_1 : Display confirmation
F6_6 -> F6_7 : Render updated permissions banner
@enduml
~~~

<!-- anchor: 3-5-7-undo-flow -->
#### 3.5.7 Undo Completion Safety Flow

Key Highlights: 4 steps
- After marking a task done, toast appears with Undo CTA and countdown.
- Undo calls Supabase RPC passing undo_token for idempotent reversal.
- If token expires, toast updates to show reason and suggests contacting manager.
- Undo state sync ensures other clients revert without conflicting statuses.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Staff Tablet" as F7_1
participant "Undo Toast" as F7_2
participant "Next.js Server Action" as F7_3
participant "Supabase RPC" as F7_4
participant "Realtime" as F7_5
participant "Peer Clients" as F7_6
F7_1 -> F7_2 : View toast with timer
F7_1 -> F7_2 : Tap Undo
F7_2 -> F7_3 : Send undo request
F7_3 -> F7_4 : call undo_task
F7_4 -> F7_5 : Publish undo event
F7_5 -> F7_1 : Show restored state
F7_5 -> F7_6 : Revert task state
@enduml
~~~

<!-- anchor: 3-5-8-recipe-create -->
#### 3.5.8 Recipe Creation & Publish Flow

Key Highlights: 4 steps
- Owner uses Recipe Editor workspace to input metadata, ingredients, steps, and media.
- Autosave drafts every 15 seconds to Supabase JSONB with version increment.
- Publishing runs validations, triggers Supabase RPC to finalize version, and broadcasts event.
- PrepChef caches new recipe for immediate reference in tasks.
~~~plantuml
@startuml
skinparam backgroundColor #FFFFFF
participant "Owner Desktop" as F8_1
participant "Recipe Editor" as F8_2
participant "Autosave Service" as F8_3
participant "Supabase RPC" as F8_4
participant "Realtime" as F8_5
participant "PrepChef UI" as F8_6
F8_1 -> F8_2 : Fill out form
F8_2 -> F8_3 : Persist draft
F8_3 -> F8_4 : store recipe_draft
F8_1 -> F8_2 : Click Publish
F8_2 -> F8_4 : call publish_recipe
F8_4 -> F8_5 : Broadcast recipe_published
F8_5 -> F8_6 : Preload latest recipe
@enduml
~~~

<!-- anchor: 3-6-multi-device -->
### 3.6 Multi-Device Continuity & Session Presence

Presence service writes device heartbeats to Supabase so PrepChef, Admin, and Display know when to degrade gracefully. Tablets maintain focus_view metadata so managers can view who is triaging which section, kiosks store device_id with heartbeat to detect offline states, and admin dashboards show per-device uptime for troubleshooting.
<!-- anchor: 3-7-wall-display -->
### 3.7 Wall Display Experience

- Wall display uses color-coded tiles with minimal animation to prevent distraction and burn-in.
- Layout cycles summary grid ? urgent queue ? presence lane ? offline diagnostics every 30 seconds.
- Each rotation emits telemetry event for monitoring loops.
- Display surfaces run in kiosk mode without pointer; admin gesture (hold + code) opens settings.
<!-- anchor: 3-8-error-fallbacks -->
### 3.8 Error & Offline Fallbacks

- If Supabase realtime disconnects, UI shows amber banner and falls back to ten second polling, ensuring no silent failures.
- Offline tasks freeze claim buttons and show grey overlay with reason copy.
- Recipe drawer caches last viewed instructions and surfaces offline message when storage fetch fails.
- Admin forms show inline error summary referencing fields per WCAG guidelines.
<!-- anchor: 4-0-cross-cutting -->
## 4. Cross-Cutting Concerns

Cross-cutting strategies ensure state, accessibility, performance, and safety remain consistent across surfaces.
<!-- anchor: 4-1-state-management -->
### 4.1 State Management

React Query orchestrates client state with caches keyed by company_id plus route-specific filters; server components deliver initial data. Optimistic updates follow idempotency tokens stored per mutation, and undo queues persist per session to maintain independence across open tabs.
<!-- anchor: 4-2-realtime -->
### 4.2 Realtime Synchronization

Supabase realtime channels `company:{company_id}:{entity}` stream JSON payloads with version metadata. Clients subscribe only to required entity types per surface to minimize bandwidth. Reconnect logic exponential backoffs and surfaces offline banners after three failed attempts. Display surfaces degrade to summary API plus timestamp check.
<!-- anchor: 4-3-responsive -->
### 4.3 Responsive Design & Breakpoints

| Breakpoint | Range | Layout Pattern |
| --- | --- | --- |
| xs | <480px | Single column, condensed header, hidden meta. |
| sm | 481-640px | Bottom nav visible, two-column grids hidden. |
| md | 641-1024px | Two-pane layout on tablets. |
| lg | 1025-1440px | Three-column admin boards. |
| xl | >1440px | Wide-screen dashboards and kiosk presentations. |
- Tailwind config exported from libs/ui ensures identical breakpoints across apps.
- Mobile-first CSS ensures kiosk and admin surfaces override with min-width queries as needed.

<!-- anchor: 4-4-accessibility -->
### 4.4 Accessibility Strategy

Semantic HTML first: lists use <ul>/<ol>, tables use <table>, status banners use role=status. Keyboard navigation ensures focus order follows visual order; drawers trap focus but keep Escape exit. Screen reader copy clarifies combine heuristics and warns when tasks share allergens. Color + icon + text used simultaneously; e.g., status dot plus label plus icon. Motion respects prefers-reduced-motion; display surfaces reduce transitions automatically.
<!-- anchor: 4-5-performance -->
### 4.5 Performance & Optimization

Performance budgets: TTI <3s on 4G for PrepChef, <2s for kiosk refresh, <4s for admin heavy tables. Code splitting: Next.js server components stream data, client components only hydrate interactive sections. Image optimization: Supabase Storage signed URLs specify width and height query params. Virtualization: Task list, audit log viewer, and recipe lists use react-virtualized wrappers. Memoization: Expensive derived counts computed via selectors to avoid repeated calculations.
<!-- anchor: 4-6-backend-integration -->
### 4.6 Backend Integration & Error Handling

APIs follow REST-ish pattern described in the blueprint, returning JSON with `data`, `meta`, `errors` envelope. Supabase RPC wrappers live in libs/supabase and return typed results for UI consumption, while React Query interceptors map errors to friendly copy plus action suggestions.
<!-- anchor: 4-7-error-handling -->
### 4.7 Error States & Messaging

Claim conflict: show message "Task already claimed by {user}" with option to open their task details. Combine failure: show reason returned by heuristics (insufficient similarity, role mismatch). Upload failure: show status row with retry button plus log ID for support. Role violation: display Role Guard Banner describing required role and linking to support doc. Realtime disconnect: sticky banner offering retry and fallback to refresh.
<!-- anchor: 4-8-localization -->
### 4.8 Localization & Copy Flexibility

Phase one supports English but copy uses i18n keys stored in libs/shared/i18n for future locales. Data-driven units show both metric and imperial conversions where applicable. Date and time formatting uses company timezone settings from Supabase. Glove-friendly copy avoids idioms, staying direct and translatable.
<!-- anchor: 4-9-security -->
### 4.9 Security & Privacy Considerations

Supabase Auth session tokens stored in secure cookies; UI never handles raw secrets. Media uploads validated for MIME type before signed URL issuance. Audit logs appended for combine approvals, role changes, recipe edits, and media deletions. Sensitive identifiers truncated on UI; managers must intentionally click to reveal full IDs.
<!-- anchor: 4-10-observability -->
### 4.10 Observability & Telemetry

OpenTelemetry instrumentation wraps key interactions; telemetry events include session_id, company_id, actor_role, and feature flag exposures. UI logs minimal metadata to console; server logs structured JSON forwarded to Logflare or Datadog. Synthetic monitors ping `/display` and `/admin/events` hourly to verify realtime streaming. Feature flags emit exposure events to detect drift between clients.
<!-- anchor: 5-0-tooling -->
## 5. Tooling & Dependencies

Tooling enforces consistency, ensures quality, and adheres to pnpm + Turbo workflows.
<!-- anchor: 5-1-core-dependencies -->
### 5.1 Core Dependencies

- Next.js 15 App Router for all apps with Server Components.
- React 18 with concurrent features for streaming UIs.
- @tanstack/react-query for caching and mutations.
- Supabase JS client via libs/supabase for data access and realtime.
- Tailwind CSS configured via libs/ui tokens.
- ShadCN UI components curated inside libs/ui.
- Flagsmith SDK for feature flag evaluation.
- Framer Motion (limited) for micro-interactions subject to reduced motion settings.
<!-- anchor: 5-2-dev-tooling -->
### 5.2 Development Tooling & Workflow

- pnpm 8+ for package management and consistent lockfiles.
- Turbo 2+ pipelines for lint, test, build per package.
- ESLint with custom rules banning default exports and enforcing alias imports.
- Prettier for formatting; stylelint for Tailwind class ordering.
- Storybook for visual documentation and Chromatic for regression detection.
- Vitest for unit tests across libs/ui and libs/shared.
- Playwright for end-to-end flows (task claim, recipe view, admin role change).
<!-- anchor: 5-3-design-ops -->
### 5.3 DesignOps & Collaboration

- Design artifacts live in Figma with tokens synced to code via tokens studio plugin feeding libs/ui JSON.
- Storybook docs display token tables, component props, and usage guidelines across apps.
- ADRs recorded under `docs/architecture` for any design debt or experiment.
- Cross-functional reviews reference this document via anchors for traceability.
<!-- anchor: 5-4-testing -->
### 5.4 Testing & Validation Pipelines

- Vitest covers shared logic (task filters, heuristics), achieving =80 percent coverage.
- Playwright scripts simulate staff claiming tasks on tablets, managers assigning tasks on desktop, and display loops verifying rotation.
- Storybook accessibility tests (axe) enforce color contrast and semantic structure.
- Visual regression suite for kiosk ensures text remains legible after token changes.



<!-- anchor: 6-0-appendices -->
## 6. Appendices & Validation

Appendices catalog checklists, dictionaries, and telemetry contracts to keep QA aligned.

<!-- anchor: 6-1-accessibility-checklist -->
### 6.1 Accessibility Checklist

- Task list rows announce status, quantity, and owner via screen reader friendly text.
- All buttons include discernible text (no icon-only without aria-label).
- Drawer close buttons remain in same relative position across contexts.
- Keyboard focus order matches visual order even when drawers open.
- Toast content accessible and focusable for undo actions.
- Kiosk uses high contrast theme at all times with color blind safe palette.
- Recipe steps numbered sequentially inside <ol>.
- Media players include captions by default.
- Inputs expose error text with aria-describedby references.
- Role guard banners use role=alert for immediate notification.
- Display ticker respects reduced motion by disabling scroll.
- Iconography avoids meaning conveyed only by color.
- Offline banner includes instructions for reconnection.
- Tap targets exceed 44px to support gloved hands.
- Screen reader skip link jumps to task list.
- Search input exposes keyboard shortcut (/) via aria-keyshortcuts.
- Drag-and-drop surfaces provide keyboard alternatives.
- Undo toasts accessible via Tab even if triggered via pointer.
- Kiosk offline state read via sr-only text for ADA kitchens.
- High contrast mode toggled via data attribute for future OS detection.

<!-- anchor: 6-2-task-state-dictionary -->
### 6.2 Task State Dictionary

| State | Description | UI Treatment | Undo Window |
| --- | --- | --- | --- |
| available | Task ready to be claimed. | White card, Claim CTA, grey metadata. | n/a. |
| claimed | Task assigned to staff. | Azure background, avatar, Release action. | Five minutes if unstarted. |
| in_progress | Task actively being worked. | Sun highlight, timer row, Working CTA. | Two minutes. |
| completed | Task finished and awaiting review. | Emerald card, strike-through optional, Undo toast. | Five minutes. |
| combined | Task merged with others. | Plum badge, combined icon, breakdown link. | Undo via manager only. |
| blocked | Task paused due to dependency. | Amber banner with reason text. | n/a. |
| archived | Task removed from active list. | Hidden from PrepChef, visible in admin table. | n/a. |

<!-- anchor: 6-3-telemetry-events -->
### 6.3 Telemetry Events & Metadata

| Event | Trigger | Payload | Purpose |
| --- | --- | --- | --- |
| task_claim | Staff claims task | task_id, company_id, actor_role, latency_ms | Measure claim latency. |
| task_complete | Staff completes task | task_id, undo_token, duration_s | Track efficiency. |
| task_undo | Undo triggered | task_id, actor_id, seconds_since_complete | Ensure undo reliability. |
| recipe_view | Recipe drawer opened | recipe_id, step_count, has_media | Gauge documentation usage. |
| combine_review | Combine drawer opened | suggestion_count, accept_rate | Tune heuristics. |
| role_change | Owner updates role | user_id, previous_role, new_role | Audit RBAC. |
| media_upload | File upload | file_type, size_mb, duration | Monitor storage usage. |
| display_refresh | Display rotation | device_id, latency_ms | Detect kiosk lag. |
| filter_apply | Filters submitted | filters[], result_count | Improve UX decisions. |
| presence_heartbeat | Client ping | device_id, view, up_time | Detect offline devices. |
| assignment_drag | Manager reassigns task | task_id, old_user, new_user | Balance load. |
| method_complete | Staff finishes method doc | method_id, duration | Training metrics. |
| alert_ack | User acknowledges alert | alert_id, actor_role | Monitor urgency handling. |
| offline_banner | Connectivity lost | view_id, seconds_offline | Reliability tracking. |
| undo_expired | Undo attempted after TTL | task_id, seconds_since | Improve messaging. |
| flag_exposure | Feature flag read | flag_key, variant, route | Detect drift. |
| kiosk_error | Display error | code, description | Ops response. |
| recipe_publish | Recipe published | recipe_id, version | Content release tracking. |
| method_upload | Method media uploaded | method_id, media_type | Training coverage. |
| scroll_depth | Admin scrolls list | route, percent | Performance heuristics. |

<!-- anchor: 6-4-responsive-cases -->
### 6.4 Responsive Pattern Case Matrix

- XS device + offline: hide imagery, show offline banner pinned.
- XS device + urgent: highlight urgent tasks at top even if not filtered.
- SM device + keyboard open: bottom nav compresses to icons only.
- MD tablet + landscape: show list and drawer side-by-side.
- MD tablet + kiosk mode: disable pointer states, enlarge fonts.
- LG desktop + drag: show column drop indicators.
- LG desktop + detail pinned: allow resizing between list and drawer.
- XL display + rotation: animate opacity only when switching views.
- XL display + offline: show full-screen offline banner with reconnect instructions.
- PrepChef + future right-to-left: ensure nav mirrors automatically.
- Admin + long names: clamp text with tooltip for overflow handling.
- Admin + multi-select filter: show checkboxes in two columns.
- Kiosk + bright light: auto switch to high contrast palette.
- Kiosk + night mode: reduce brightness via CSS variable.
- Tablet + external keyboard: show focus outlines persistently.
- Tablet + multi-window: preserve state per viewport.
- Mobile + video playback: collapse instructions to show video full height.
- Mobile + voiceover: ensure announcements do not overlap content.
- Desktop + zoom 200%: layout reflows to single column without clipping.
- Desktop + printer: admin tables use print stylesheet for compliance.

<!-- anchor: 6-5-copy-style -->
### 6.5 Copy Style & Localization Keys

| Key | Default Copy | Context |
| --- | --- | --- |
| `tasks.available.count` | {count} Available | Header summary. |
| `tasks.claim.cta` | Claim | Primary button. |
| `tasks.release.cta` | Release | Secondary action. |
| `tasks.complete.cta` | Done | Completion button. |
| `tasks.undo.toast` | Marked {name} complete | Undo toast message. |
| `filters.clear` | Clear filters | Filter footer. |
| `filters.apply` | Show {count} tasks | Filter footer. |
| `combine.accept` | Combine tasks | Combine drawer. |
| `combine.dismiss` | Keep separate | Combine drawer. |
| `recipe.drawer.title` | Recipe | Drawer tab label. |
| `recipe.ingredients.title` | Ingredients | Drawer tab. |
| `recipe.steps.title` | Steps | Drawer tab. |
| `recipe.media.title` | Media | Drawer tab. |
| `display.offline` | Display offline, retrying... | Kiosk banner. |
| `admin.assign.toast` | Assigned to {user} | Admin board toast. |
| `admin.roleguard.copy` | Only {role} can perform this action | Role guard banner. |
| `upload.progress` | Uploading {file} | Media uploader. |
| `upload.failed` | Upload failed ? retry | Media uploader. |
| `notifications.empty` | All caught up | Notification center. |
| `presence.idle` | Idle | Presence tile. |
| `presence.active` | Working | Presence tile. |
| `method.progress` | {done}/{total} steps complete | Method viewer. |
| `undo.expired` | Undo window ended | Undo toast. |
| `offline.copy` | Connection lost ? display is read only | Offline banner. |
| `filters.active` | {count} active filters | Filter pill group. |
| `kiosk.rotation` | Next view in {seconds}s | Kiosk caption. |
| `alert.urgent` | Urgent | Alert tile. |
| `alert.resolved` | Resolved | Alert tile. |
| `event.timeline.now` | Now | Timeline marker. |
| `event.timeline.next` | Next {time} | Timeline marker. |

<!-- anchor: 6-6-qa-heuristics -->
### 6.6 QA Heuristics & Scenario Matrix

- Single event with ten tasks and three staff; ensure combine suggestions appear when tasks share normalized ingredient.
- Multi-event weekend with fifty tasks and five staff; verify virtualization keeps scroll smooth.
- Role mismatch attempt; confirm Role Guard Banner plus server error alignment.
- Simultaneous claim attempt by two devices; ensure second device sees conflict toast.
- Undo after expiration; confirm message instructs user to contact manager.
- Offline kiosk; ensure offline banner plus last-known data cached.
- Media upload failure; ensure row displays retry option.
- Recipe version conflict; ensure admin sees diff summary and conflict resolution tips.
- Drag assignment invalid due to RBAC; show error and revert card.
- Combine reject; ensure tasks return to queue immediately.
- Display rotation after data flood; ensure throttling prevents flicker.
- Feature flag disabled; confirm fallback component renders gracefully.
- Large number of filters; ensure chips wrap and provide horizontal scroll.
- Audit log viewer; ensure virtualization and date filters operate smoothly.
- Method viewer offline; show cached transcript plus offline banner.
- Supabase realtime outage; confirm polling fallback and user messaging.
- Supabase storage latency; show spinner with explanatory text.
- Admin board with 200 tasks; verify drag interactions remain performant.
- Presence heartbeats missing; show offline avatar halos.
- Doppler flag misconfiguration; ensure default state is safe off and telemetry logs event.


<!-- anchor: 6-7-undo-playbook -->
### 6.7 Undo & Notification Playbook

- Every mutation response carries undo_token, expires after conflicting write or five minutes.
- Undo toast copy always repeats action and target entity.
- Toast timer uses progress bar plus numeric countdown for clarity.
- Notifications center stores last 20 events per device with badge on nav.
- Real-time undo success triggers success chime on kiosk for visibility.
- Failed undo shows error plus suggestion to contact manager.
- System logs undo_attempt telemetry for audit and rate analysis.
- Notifications list groups by entity (task, recipe, media) with icons.
- High-priority notifications (alerts) pin to top until acknowledged.
- Undo actions respect RBAC; unauthorized undo attempts show guard banner.
- Notification preferences respect quiet hours stored per user.
- Kiosk surfaces only Urgent notifications to avoid noise.
- Admin CRM exposes notification stream filterable by entity type.
- Undo toast always includes secondary link to view entity detail.
- Staff can clear notifications individually or clear all with confirmation.
- Toast stack limited to two to avoid cognitive overload.
- Notifications older than 24h auto-archive but remain in audit log.
- Undo tokens include locale-safe timestamp for forensic review.
- Push notifications (future) will mirror same payload schema.
- All notification payloads include feature flag context for experiments.

<!-- anchor: 6-8-deployment-checklist -->
### 6.8 Deployment & Validation Checklist

- Verify Supabase migrations applied and RLS policies enabled.
- Confirm Doppler configs for SUPABASE_URL/KEYS set per environment.
- Run `turbo run lint test build --filter=...` for touched packages.
- Execute Playwright smoke tests (task claim, recipe view, admin role change).
- Validate Storybook Chromatic snapshot status for libs/ui components.
- Ensure feature flags defaults documented before release.
- Check `/display` synthetic monitor status and websocket health.
- Confirm media upload storage bucket quotas below alert threshold.
- Validate undo telemetry dashboards show expected volume post-release.
- Review audit logs for role changes in staging prior to promoting build.
- Update release notes with schema changes and rollback instructions.
- Trigger soft rollout via Flagsmith (enable for staging company).
- Monitor Supabase realtime channel metrics for dropped connections.
- Double-check kiosk auto-rotation interval set to 15s by config.
- Rehearse failover plan for display clients (refresh, resubscribe).
- Capture pre-release screenshots for documentation and training.
- Ensure admin CRM hotkeys documented in in-app help.
- Validate accessibility checklist run for new templates.
- Communicate maintenance window to managers via notification center.
- Archive previous appendix version in docs/architecture for traceability.


<!-- anchor: 6-9-kiosk-monitoring -->
### 6.9 Kiosk Monitoring Notes

- Wall displays send heartbeat every 10 seconds with device_id and view slug.
- Offline threshold set to 15 seconds; UI shows amber banner at 20 seconds.
- Managers can trigger manual refresh via hidden long-press gesture.
- Display app caches last three payloads to show staleness diff.
- SSE fallback polls `/api/display/summary` when websocket unavailable.
- Kiosk rotation order configurable via admin CRM (default: summary ? urgent ? stations).
- Brightness auto-adjust uses ambient sensor input when available; fallback schedule uses daypart config.
- Display logs include connection_id so ops can trace failing devices.
- Alert ticker highlights tasks overdue >15 minutes in red for immediate action.
- Display layout avoids scrolling text for ADA compliance; ticker scroll limited to 16px/s.
- Managers receive notification if display misses three heartbeats consecutively.
- Kiosk supports safe-mode view that hides staff names for visitor tours.
- Wall display theme toggles between light/dark via scheduled triggers (prep vs service).
- Device provisioning script auto-registers display via admin CRM with QR code.
- Kiosk offline fallback instructs staff to refresh or escalate to manager.
- Display telemetry includes fps + CPU usage to monitor rendering issues.
- Multi-display sites tag each unit with station context for targeted messaging.
- Kiosk loops include occasional recipe highlights flagged by owner role.
- Display UI purposely omits undo controls to avoid accidental interactions.
- Future plan: integrate audible chime when urgent queue exceeds threshold.


<!-- anchor: 6-10-observability-metrics -->
### 6.10 Observability Metrics

- Task mutation latency median <150ms, p95 <400ms measured via telemetry pipeline.
- Realtime subscription reconnect count tracked per device to flag flaky networks.
- Media upload success rate targeted at 99%; failures auto-alert owner role.
- Undo usage rate monitored per event to detect training issues or bugs.
- Display heartbeat uptime expected ?99%; deviations trigger incident review.

