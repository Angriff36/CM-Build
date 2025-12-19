# Admin CRM Interface

The Admin CRM provides business owners and managers with comprehensive tools for managing events, staff, and recipes in the catering platform.

## Features

### Event Management

- **Event List View**: Browse all events with status indicators and key details
- **Create/Edit Events**: Full CRUD operations with form validation
- **Role-Based Access**: Owner, manager, and event lead permissions

### Staff Management

- **Staff Directory**: View staff members with presence indicators
- **Task Assignment**: Drag-and-drop interface for assigning tasks to staff
- **Staff CRUD**: Add, edit, and remove staff members with role management

### Recipe Editing

- **Ingredient Management**: Add/remove ingredients with quantity and units
- **Step Builder**: Create and reorder cooking steps
- **Media Upload**: Upload images/videos with progress indicators
- **Offline Support**: Handles offline scenarios gracefully

## User Roles & Permissions

### Owner

- Full access to all features
- User management capabilities
- System configuration

### Manager

- Event management and staff scheduling
- Recipe curation and task assignment oversight

### Event Lead

- Event-specific management within assigned events
- Task assignment within their events

### Staff

- Task claiming and completion
- Recipe viewing
- Limited profile management

## Technical Implementation

### Components

- `EventForm`: Modal form for event creation/editing with Zod validation
- `RecipeEditor`: Comprehensive recipe editing with media upload
- `StaffPage`: Drag-and-drop task assignment using @dnd-kit

### State Management

- React Query for server state
- Custom hooks for domain logic
- Realtime updates via Supabase channels

### Validation & Error Handling

- Zod schemas for runtime validation
- User-friendly error messages
- Form shake animations for invalid fields

### Accessibility

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility

## Usage

### Events

1. Navigate to `/events`
2. Click "Create Event" to add new events
3. Use Edit/Delete buttons for existing events

### Staff

1. Navigate to `/staff`
2. Drag tasks from "Unassigned" to staff members
3. Use Add/Edit staff buttons for personnel management

### Recipes

1. Navigate to `/recipes/[id]`
2. Edit recipe name, ingredients, and steps
3. Upload media files via drag-and-drop or file picker

## Development

### Running Tests

```bash
npm run test -- __tests__/AdminCRM.test.tsx
```

### Building

```bash
npm run build
```

## Dependencies

- `@dnd-kit/core`: Drag-and-drop functionality
- `@tanstack/react-query`: Data fetching and caching
- `zod`: Schema validation
- `@codemachine/shared`: Shared utilities and hooks
