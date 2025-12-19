import { describe, expect, it, vi } from 'vitest';
import { UserRole, UserStatus, TaskStatus, EventStatus } from './index';

// Mock supabase client to avoid import issues in tests
vi.mock('@codemachine/supabase/client', () => ({
  createClient: vi.fn(),
}));

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
    expect(TaskStatus.AVAILABLE).toBe('available');
    expect(TaskStatus.CLAIMED).toBe('claimed');
    expect(TaskStatus.IN_PROGRESS).toBe('in_progress');
    expect(TaskStatus.COMPLETED).toBe('completed');
  });

  it('exports EventStatus', () => {
    expect(EventStatus.DRAFT).toBe('draft');
  });
});
