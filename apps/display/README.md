# Display App

A Next.js application for kiosk displays showing real-time task summaries and urgent alerts.

## Features

- **Summary Grid**: Shows available/claimed/completed tasks grouped by event and station
- **Urgent Ticker**: Rotating display of high-priority tasks with audible cues
- **Real-time Updates**: WebSocket-based real-time data with polling fallback
- **Offline Support**: Graceful handling of connection losses with cached data
- **Accessibility**: Full screen reader support and keyboard navigation

## Configuration

### Environment Variables

```bash
# Rotation cadence for urgent ticker (milliseconds)
DISPLAY_ROTATION_CADENCE=5000

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Doppler Configuration

The rotation cadence for the urgent ticker can be configured via the `DISPLAY_ROTATION_CADENCE` environment variable, stored in Doppler. It specifies the interval in milliseconds between cycling urgent tasks. Default is 5000ms (5 seconds).

Example Doppler config:

```
DISPLAY_ROTATION_CADENCE=3000
```

### Runtime Configuration

The urgent ticker rotation speed can be configured at runtime via:

1. **Environment Variable**: `DISPLAY_ROTATION_CADENCE` (default: 5000ms)
2. **Window Config**: `window.__DISPLAY_CONFIG__.rotationCadence`
3. **User Controls**: Speed adjustment buttons in the ticker (0.5x - 3x)

## Components

### SummaryGrid

Displays task summary cards grouped by event and station.

**Props:**

- `cards: SummaryCard[]` - Array of summary cards
- `capturedAt: string` - Timestamp of last data capture
- `stalenessMs: number` - Data staleness in milliseconds

**Features:**

- Groups cards by event_id and station_id
- Shows average task duration
- Highlights urgent items with red styling
- Displays staleness warnings

### UrgentTicker

Rotating banner for urgent tasks with accessibility controls.

**Props:**

- `assignments: AssignmentSummary[]` - Array of urgent assignments

**Features:**

- Automatic rotation with configurable cadence
- Manual navigation (previous/next/pause)
- Speed control (0.5x - 3x)
- Sound toggle for audible cues
- Screen reader support
- Keyboard navigation

### useDisplayData Hook

Custom hook for fetching and managing display data.

**Options:**

- `event_scope?: string` - Filter by specific event
- `station_scope?: string` - Filter by specific station
- `agg?: 'hourly' | 'live'` - Data aggregation level
- `since?: string` - Get data since specific timestamp

**Returns:**

- Query data and loading states
- Real-time connection status
- Offline banner state
- Manual refresh function
- Connection attempt tracking

## API Integration

The app integrates with the `/api/display/summary` endpoint:

```typescript
interface DisplaySummaryResponse {
  cards: SummaryCard[];
  assignments: AssignmentSummary[];
  captured_at: string;
  staleness_ms: number;
  realtime_channel: string;
}
```

## Real-time Architecture

1. **Primary**: Supabase realtime subscriptions
2. **Fallback**: HTTP polling every 30 seconds
3. **Offline**: Cached data with staleness indicators
4. **Health Checks**: Connection monitoring with automatic retry

## Accessibility

- **Screen Readers**: Full ARIA support with live regions
- **Keyboard Navigation**: All controls accessible via keyboard
- **Visual Indicators**: High contrast styling for urgent items
- **Speed Control**: Adjustable rotation speed for different needs
- **Sound Options**: Toggle for audible cues

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Testing

The app includes comprehensive tests for:

- Component rendering and behavior
- Hook functionality and error handling
- User interactions and accessibility
- API integration and data flow

Run tests with: `pnpm test`
