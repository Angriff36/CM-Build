import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('../../../../libs/supabase/src/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      rpc: vi.fn(() => ({
        data: {},
        error: null,
      })),
    })),
    channel: vi.fn(() => ({
      send: vi.fn(),
    })),
  })),
}));

// Mock errors
vi.mock('../../../../libs/shared/src/utils/errors', () => ({
  mapSupabaseError: vi.fn((error) => ({
    status: 500,
    error: { code: 'INTERNAL_ERROR', message: 'Internal error' },
  })),
}));

describe('Task Contract Tests', () => {
  describe('/api/tasks/suggestions', () => {
    it('GET returns valid schema', async () => {
      const { GET } = await import('../../../apps/prepchef/app/api/tasks/suggestions/route');
      const request = new NextRequest('http://localhost/api/tasks/suggestions');
      const response = await GET(request);
      const json = await response.json();

      expect(json).toHaveProperty('data.suggestions');
      expect(json.meta).toHaveProperty('schema_version', '1.2');
      expect(json.meta).toHaveProperty('heuristic_version');
    });

    it('POST returns valid schema', async () => {
      const { POST } = await import('../../../apps/prepchef/app/api/tasks/suggestions/route');
      const request = new NextRequest('http://localhost/api/tasks/suggestions', {
        method: 'POST',
        body: JSON.stringify({ filters: {} }),
      });
      const response = await POST(request);
      const json = await response.json();

      expect(json).toHaveProperty('data.suggestions');
      expect(json.meta).toHaveProperty('schema_version', '1.2');
    });
  });

  describe('/api/tasks/combine', () => {
    it('POST returns valid schema', async () => {
      const { POST } = await import('../../../apps/prepchef/app/api/tasks/combine/route');
      const request = new NextRequest('http://localhost/api/tasks/combine', {
        method: 'POST',
        body: JSON.stringify({
          taskIds: ['uuid1'],
          approvedBy: 'uuid2',
          heuristicsMetadata: {},
          idempotencyKey: 'key',
        }),
      });
      const response = await POST(request);
      const json = await response.json();

      expect(json).toHaveProperty('data.combinedGroup');
      expect(json).toHaveProperty('data.primaryTask');
      expect(json.meta).toHaveProperty('schema_version', '1.2');
    });
  });

  describe('/api/tasks/combine/rollback', () => {
    it('POST returns valid schema', async () => {
      const { POST } = await import('../../../apps/prepchef/app/api/tasks/combine/rollback/route');
      const request = new NextRequest('http://localhost/api/tasks/combine/rollback', {
        method: 'POST',
        body: JSON.stringify({ group_id: 'uuid' }),
      });
      const response = await POST(request);
      const json = await response.json();

      expect(json).toHaveProperty('data.tasks');
      expect(json.meta).toHaveProperty('schema_version', '1.2');
    });
  });

  describe('/api/tasks/bulk-assign', () => {
    it('POST returns valid schema', async () => {
      const { POST } = await import('../../../apps/prepchef/app/api/tasks/bulk-assign/route');
      const request = new NextRequest('http://localhost/api/tasks/bulk-assign', {
        method: 'POST',
        body: JSON.stringify({
          assignments: [{ taskId: 'uuid1', targetUserId: 'uuid2' }],
          reason: 'shift-handoff',
          idempotencyKey: 'key',
        }),
      });
      const response = await POST(request);
      const json = await response.json();

      expect(json).toHaveProperty('data.assignments');
      expect(json.meta).toHaveProperty('schema_version', '1.2');
    });
  });

  describe('/api/display/summary', () => {
    it('GET returns valid schema', async () => {
      const { GET } = await import('../../../apps/display/app/api/summary/route');
      const request = new NextRequest('http://localhost/api/display/summary');
      const response = await GET(request);
      const json = await response.json();

      expect(json).toHaveProperty('data.cards');
      expect(json).toHaveProperty('data.assignments');
      expect(json.meta).toHaveProperty('schema_version', '1.2');
      expect(json.meta).toHaveProperty('captured_at');
    });
  });
});
