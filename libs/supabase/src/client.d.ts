export declare const getSupabaseEnv: () => {
    url: string;
    key: string;
};
export declare const createClient: () => import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
