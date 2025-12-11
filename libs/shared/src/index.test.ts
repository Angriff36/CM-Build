import { describe, expect, it } from 'vitest';
import { UserRole, UserStatus, TaskStatus, EventStatus } from './index';

describe('Shared Enums', () => {
  it('exports UserRole', () => {
    expect(UserRole.STAFF).toBe('staff');
    expect(UserRole.MANAGER).toBe('manager');
    expect(UserRole.EVENT_LEAD).toBe('event_lead');
    expect(UserRole.OWNER).toBe('owner');
  });

  it('exports UserStatus', () => {
    expect(UserStatus.ACTIVE).toBe('active');
  });

  it('exports TaskStatus', () => {
    expect(TaskStatus.PENDING).toBe('pending');
  });

  it('exports EventStatus', () => {
    expect(EventStatus.DRAFT).toBe('draft');
  });
});
