# UI Interaction Blueprint

This document outlines the interaction patterns, focus order, motion tokens, offline handling, and notifications for key surfaces in the CaterKing platform. It serves as a reference for developers and designers to ensure consistent user experiences across PrepChef, Admin CRM, and Display apps.

Cross-references to diagrams and architecture are included where relevant. See [docs/diagrams/knowledge_flow.mmd](../diagrams/knowledge_flow.mmd) for the knowledge flow diagram referenced in media loading interactions.

## PrepChef Recipe Drawer

### Interaction Patterns

- **Opening**: Tap recipe link in task row to expand drawer from right edge. Drawer traps focus and provides Escape key exit.
- **Navigation**: Tab through close button, tab bar (Steps, Ingredients, Media, Notes), and content. Swipe gestures on mobile for tab switching.
- **Closing**: Tap close button or swipe left. Focus returns to originating task row.
- **Scaling**: Adjust portion slider to scale ingredients; updates in real-time with unit conversions.

### Focus Order

1. Close button (top-right)
2. Tab bar (Steps first)
3. Content area (first step or ingredient)
4. Media controls (if present)
5. Scaling controls

### Motion Tokens

- **Entry**: Slide in from right with 300ms ease-out, opacity 0 to 1.
- **Exit**: Slide out to right with 200ms ease-in, opacity 1 to 0.
- **Tab Switch**: Fade transition 150ms, no slide to maintain context.

### Offline Handling

- Displays cached last-viewed content with "Offline" banner at top.
- Media thumbnails show placeholder; videos unavailable.
- Scaling disabled; shows "Reconnect to scale" message.
- References knowledge flow diagram fallback path (N -> O).

### Notifications

- None specific; integrates with global undo toasts if recipe viewed during task completion.

## Undo Toasts

### Interaction Patterns

- **Appearance**: Toast slides up from bottom after task completion, with countdown timer.
- **Actions**: Tap "Undo" to reverse; auto-dismisses after 5 minutes.
- **Accessibility**: Announced via aria-live polite; focusable for keyboard users.

### Focus Order

1. Undo button
2. Dismiss link (if present)
3. Timer (read-only)

### Motion Tokens

- **Entry**: Slide up from bottom 250ms ease-out.
- **Progress**: Timer bar animates linearly.
- **Exit**: Fade out 200ms on dismiss or expiration.

### Offline Handling

- Toasts persist locally; undo attempts show "Offline - contact manager" message.

### Notifications

- Toast content repeats action (e.g., "Marked Chicken Prep complete").
- Links to task detail for verification.

## Filters

### Interaction Patterns

- **Opening**: Tap filter icon to open sheet from bottom.
- **Selection**: Checkboxes for multi-select; radio for single choice.
- **Apply**: Tap "Apply" to update list; "Clear" resets.
- **Persistence**: Filters saved to URL for shareability.

### Focus Order

1. Search input
2. Filter sections (top to bottom)
3. Apply button
4. Clear button
5. Close button

### Motion Tokens

- **Sheet Entry**: Slide up from bottom 300ms ease-out.
- **Section Expand**: Height animation 200ms.

### Offline Handling

- Filters cached locally; apply disabled with "Offline" overlay.

### Notifications

- Badge on filter icon shows active count.

## Admin CMS Forms

### Interaction Patterns

- **Editing**: Inline edits with save/cancel; optimistic updates.
- **Validation**: Real-time feedback with error summaries.
- **Uploads**: Drag-drop for media; progress bars.

### Focus Order

1. Form fields (logical order)
2. Error messages (aria-describedby)
3. Save button
4. Cancel button

### Motion Tokens

- **Save**: Button loading spinner 500ms.
- **Error**: Shake animation 300ms for invalid fields.

### Offline Handling

- Forms disabled; shows "Reconnect to edit" banner.

### Notifications

- Success toast on save; error inline.

## Kiosk Display Transitions

### Interaction Patterns

- **Rotation**: Auto-cycle every 30s; manual via admin gesture.
- **States**: Summary grid -> urgent queue -> presence lane.

### Focus Order

- No focus; read-only surface.

### Motion Tokens

- **Transition**: Opacity fade 500ms between views.
- **Urgent Highlight**: Pulse animation for alerts.

### Offline Handling

- Shows "Offline" banner; cycles cached data.

### Notifications

- Urgent alerts pinned; chime on rotation.

## Offline Banners

### Interaction Patterns

- **Display**: Sticky banner at top with retry button.
- **Retry**: Tap to attempt reconnection.

### Focus Order

1. Retry button
2. Dismiss (if available)

### Motion Tokens

- **Entry**: Slide down 250ms.
- **Pulse**: Amber background pulse every 10s.

### Offline Handling

- Banner persists until connected.

### Notifications

- Aria-live assertive announcement.

## Appendices

### Motion Tokens Dictionary

- Ease-out: cubic-bezier(0.4, 0, 0.2, 1)
- Ease-in: cubic-bezier(0.4, 0, 1, 1)
- Durations: 150ms (fast), 250ms (normal), 500ms (slow)

### Accessibility Notes

- All surfaces follow WCAG 2.1 AA.
- Screen readers announce state changes.
- High contrast support via data attributes.

### Telemetry Integration

- Events logged per interaction (e.g., recipe_view, filter_apply).
- See appendices in architecture for full list.
