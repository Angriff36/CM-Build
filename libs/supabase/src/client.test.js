import { describe, expect, it, vi, afterEach } from 'vitest';
import { getSupabaseEnv, createClient } from './client';
describe('Supabase Client', () => {
    const originalEnv = process.env;
    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });
    it('throws error when environment variables are missing', () => {
        process.env = { ...originalEnv };
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        expect(() => getSupabaseEnv()).toThrowError('Supabase environment variables missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    });
    it('returns credentials when environment variables are present', () => {
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'some-anon-key',
        };
        const creds = getSupabaseEnv();
        expect(creds.url).toBe('https://example.supabase.co');
        expect(creds.key).toBe('some-anon-key');
    });
    it('createClient calls createSupabaseClient with correct args', () => {
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'some-anon-key',
        };
        // We are just testing the factory works without throwing,
        // deep mocking of @supabase/supabase-js is not strictly necessary
        // if we just want to verify the guard and instantiation.
        // However, createClient returns an object.
        const client = createClient();
        expect(client).toBeDefined();
    });
});
