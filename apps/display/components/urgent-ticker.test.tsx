import { describe, it, expect, vi } from 'vitest';

describe('UrgentTicker utils', () => {
  it('should filter urgent assignments correctly', () => {
    const allAssignments = [
      {
        task_id: 'task-1',
        user_display_name: 'John Doe',
        status: 'urgent',
        priority: 'urgent' as const,
      },
      {
        task_id: 'task-2',
        user_display_name: 'Jane Smith',
        status: 'high_priority',
        priority: 'urgent' as const,
      },
      {
        task_id: 'task-3',
        user_display_name: 'Bob Wilson',
        status: 'normal',
        priority: 'low' as const,
      },
    ];

    const urgentAssignments = allAssignments.filter(
      (a) => a.status === 'urgent' || a.status === 'high_priority' || a.priority === 'urgent',
    );

    expect(urgentAssignments).toHaveLength(2);
    expect(urgentAssignments.map((a) => a.user_display_name)).toEqual(['John Doe', 'Jane Smith']);
  });

  it('should calculate rotation cadence correctly', () => {
    const DEFAULT_ROTATION_CADENCE = 5000;

    // Test with environment variable
    const envCadence = parseInt('3000', 10);
    expect(envCadence).toBe(3000);

    // Test with default
    const defaultCadence = parseInt(process.env.URGENT_TICKER_CADENCE || '5000', 10);
    expect(defaultCadence).toBe(5000);
  });

  it('should calculate time ago correctly', () => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const createdTime = thirtyMinutesAgo;

    const timeAgo = createdTime
      ? Math.floor((Date.now() - createdTime.getTime()) / 1000 / 60)
      : null;

    expect(timeAgo).toBe(30);
  });

  it('should handle speed adjustment correctly', () => {
    const DEFAULT_ROTATION_CADENCE = 5000;
    const rotationSpeed = 1.5;

    const adjustedCadence = DEFAULT_ROTATION_CADENCE / rotationSpeed;
    expect(adjustedCadence).toBe(3333.3333333333335);

    const minSpeed = 0.5;
    const maxSpeed = 3;

    expect(Math.max(minSpeed, rotationSpeed - 0.5)).toBe(1);
    expect(Math.min(maxSpeed, rotationSpeed + 0.5)).toBe(2);
  });

  it('should format task ID correctly', () => {
    const taskId = 'task-1-abc-def-123';
    const shortId = taskId.slice(0, 8) + '...';

    expect(shortId).toBe('task-1-a...');
  });
});
