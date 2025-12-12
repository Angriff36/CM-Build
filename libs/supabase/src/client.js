import { createClient as createSupabaseClient } from '@supabase/supabase-js';
export const getSupabaseEnv = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error('Supabase environment variables missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    }
    return { url, key };
};
export const createClient = () => {
    const { url, key } = getSupabaseEnv();
    return createSupabaseClient(url, key);
};
