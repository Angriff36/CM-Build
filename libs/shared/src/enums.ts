export enum UserRole {
  STAFF = 'staff',
  MANAGER = 'manager',
  EVENT_LEAD = 'event_lead',
  OWNER = 'owner',
}

export enum UserStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  DISABLED = 'disabled',
}

export enum TaskStatus {
  PENDING = 'pending',
  CLAIMED = 'claimed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}
