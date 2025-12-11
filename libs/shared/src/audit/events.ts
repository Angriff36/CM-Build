// Audit event constants for shared use across the application
export const AUDIT_EVENTS = {
  // Task actions
  CLAIM: 'claim',
  COMPLETE: 'complete',
  UNDO: 'undo',
  REASSIGN: 'reassign',

  // Combination actions
  COMBINE: 'combine',
  APPROVE_COMBINE: 'approve_combine',
  REJECT_COMBINE: 'reject_combine',
  UNDO_COMBINE: 'undo_combine',

  // Display actions
  SNAPSHOT: 'snapshot',

  // Rollback actions
  ROLLBACK: 'rollback',

  // Other
  INSERT: 'insert',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type AuditEvent = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS];
