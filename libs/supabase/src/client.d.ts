import { Database } from './database.types';
export declare const getSupabaseEnv: () => {
    url: string;
    key: string;
};
export declare const createClient: () => import("@supabase/supabase-js").SupabaseClient<Database, "public", "public", {
    Tables: {
        audit_logs: {
            Row: {
                action: string;
                actor_id: string | null;
                company_id: string;
                created_at: string;
                diff: import("./database.types").Json | null;
                entity_id: string;
                entity_type: string;
                id: string;
            };
            Insert: {
                action: string;
                actor_id?: string | null;
                company_id: string;
                created_at?: string;
                diff?: import("./database.types").Json | null;
                entity_id: string;
                entity_type: string;
                id?: string;
            };
            Update: {
                action?: string;
                actor_id?: string | null;
                company_id?: string;
                created_at?: string;
                diff?: import("./database.types").Json | null;
                entity_id?: string;
                entity_type?: string;
                id?: string;
            };
            Relationships: [{
                foreignKeyName: "audit_logs_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }];
        };
        combined_task_groups: {
            Row: {
                aggregated_quantity: number;
                base_task_ids: string[];
                company_id: string;
                created_at: string;
                id: string;
            };
            Insert: {
                aggregated_quantity: number;
                base_task_ids: string[];
                company_id: string;
                created_at?: string;
                id?: string;
            };
            Update: {
                aggregated_quantity?: number;
                base_task_ids?: string[];
                company_id?: string;
                created_at?: string;
                id?: string;
            };
            Relationships: [{
                foreignKeyName: "combined_task_groups_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }];
        };
        companies: {
            Row: {
                created_at: string;
                id: string;
                name: string;
                settings: import("./database.types").Json;
                timezone: string;
                updated_at: string;
            };
            Insert: {
                created_at?: string;
                id?: string;
                name: string;
                settings?: import("./database.types").Json;
                timezone?: string;
                updated_at?: string;
            };
            Update: {
                created_at?: string;
                id?: string;
                name?: string;
                settings?: import("./database.types").Json;
                timezone?: string;
                updated_at?: string;
            };
            Relationships: [];
        };
        events: {
            Row: {
                company_id: string;
                created_at: string;
                description: string | null;
                id: string;
                name: string;
                scheduled_at: string;
                status: Database["public"]["Enums"]["event_status"];
                updated_at: string;
            };
            Insert: {
                company_id: string;
                created_at?: string;
                description?: string | null;
                id?: string;
                name: string;
                scheduled_at: string;
                status?: Database["public"]["Enums"]["event_status"];
                updated_at?: string;
            };
            Update: {
                company_id?: string;
                created_at?: string;
                description?: string | null;
                id?: string;
                name?: string;
                scheduled_at?: string;
                status?: Database["public"]["Enums"]["event_status"];
                updated_at?: string;
            };
            Relationships: [{
                foreignKeyName: "events_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }];
        };
        media_assets: {
            Row: {
                checksum: string | null;
                company_id: string;
                created_at: string;
                id: string;
                status: string;
                storage_path: string;
                type: string;
                updated_at: string;
                url: string;
            };
            Insert: {
                checksum?: string | null;
                company_id: string;
                created_at?: string;
                id?: string;
                status?: string;
                storage_path: string;
                type: string;
                updated_at?: string;
                url: string;
            };
            Update: {
                checksum?: string | null;
                company_id?: string;
                created_at?: string;
                id?: string;
                status?: string;
                storage_path?: string;
                type?: string;
                updated_at?: string;
                url?: string;
            };
            Relationships: [{
                foreignKeyName: "media_assets_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }];
        };
        method_documents: {
            Row: {
                company_id: string;
                content_url: string;
                created_at: string;
                id: string;
                recipe_id: string;
                type: string;
            };
            Insert: {
                company_id: string;
                content_url: string;
                created_at?: string;
                id?: string;
                recipe_id: string;
                type: string;
            };
            Update: {
                company_id?: string;
                content_url?: string;
                created_at?: string;
                id?: string;
                recipe_id?: string;
                type?: string;
            };
            Relationships: [{
                foreignKeyName: "method_documents_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }, {
                foreignKeyName: "method_documents_recipe_id_fkey";
                columns: ["recipe_id"];
                isOneToOne: false;
                referencedRelation: "recipes";
                referencedColumns: ["id"];
            }];
        };
        recipes: {
            Row: {
                company_id: string;
                created_at: string;
                id: string;
                ingredients: import("./database.types").Json;
                name: string;
                steps: import("./database.types").Json;
                updated_at: string;
                version: string | null;
            };
            Insert: {
                company_id: string;
                created_at?: string;
                id?: string;
                ingredients?: import("./database.types").Json;
                name: string;
                steps?: import("./database.types").Json;
                updated_at?: string;
                version?: string | null;
            };
            Update: {
                company_id?: string;
                created_at?: string;
                id?: string;
                ingredients?: import("./database.types").Json;
                name?: string;
                steps?: import("./database.types").Json;
                updated_at?: string;
                version?: string | null;
            };
            Relationships: [{
                foreignKeyName: "recipes_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }];
        };
        tasks: {
            Row: {
                assigned_user_id: string | null;
                company_id: string;
                created_at: string;
                event_id: string | null;
                id: string;
                meta: import("./database.types").Json | null;
                name: string;
                priority: string | null;
                quantity: number;
                recipe_id: string | null;
                status: Database["public"]["Enums"]["task_status"];
                undo_token: string | null;
                unit: string | null;
                updated_at: string;
            };
            Insert: {
                assigned_user_id?: string | null;
                company_id: string;
                created_at?: string;
                event_id?: string | null;
                id?: string;
                meta?: import("./database.types").Json | null;
                name: string;
                priority?: string | null;
                quantity?: number;
                recipe_id?: string | null;
                status?: Database["public"]["Enums"]["task_status"];
                undo_token?: string | null;
                unit?: string | null;
                updated_at?: string;
            };
            Update: {
                assigned_user_id?: string | null;
                company_id?: string;
                created_at?: string;
                event_id?: string | null;
                id?: string;
                meta?: import("./database.types").Json | null;
                name?: string;
                priority?: string | null;
                quantity?: number;
                recipe_id?: string | null;
                status?: Database["public"]["Enums"]["task_status"];
                undo_token?: string | null;
                unit?: string | null;
                updated_at?: string;
            };
            Relationships: [{
                foreignKeyName: "tasks_assigned_user_id_fkey";
                columns: ["assigned_user_id"];
                isOneToOne: false;
                referencedRelation: "users";
                referencedColumns: ["id"];
            }, {
                foreignKeyName: "tasks_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }, {
                foreignKeyName: "tasks_event_id_fkey";
                columns: ["event_id"];
                isOneToOne: false;
                referencedRelation: "events";
                referencedColumns: ["id"];
            }, {
                foreignKeyName: "tasks_recipe_id_fkey";
                columns: ["recipe_id"];
                isOneToOne: false;
                referencedRelation: "recipes";
                referencedColumns: ["id"];
            }];
        };
        users: {
            Row: {
                company_id: string;
                created_at: string;
                display_name: string | null;
                id: string;
                role: Database["public"]["Enums"]["user_role"];
                status: string;
                updated_at: string;
            };
            Insert: {
                company_id: string;
                created_at?: string;
                display_name?: string | null;
                id: string;
                role?: Database["public"]["Enums"]["user_role"];
                status?: string;
                updated_at?: string;
            };
            Update: {
                company_id?: string;
                created_at?: string;
                display_name?: string | null;
                id?: string;
                role?: Database["public"]["Enums"]["user_role"];
                status?: string;
                updated_at?: string;
            };
            Relationships: [{
                foreignKeyName: "users_company_id_fkey";
                columns: ["company_id"];
                isOneToOne: false;
                referencedRelation: "companies";
                referencedColumns: ["id"];
            }];
        };
    };
    Views: { [_ in never]: never; };
    Functions: {
        get_my_company_id: {
            Args: never;
            Returns: string;
        };
        get_my_role: {
            Args: never;
            Returns: Database["public"]["Enums"]["user_role"];
        };
    };
    Enums: {
        event_status: "draft" | "published" | "completed" | "archived";
        task_status: "pending" | "claimed" | "completed" | "verified";
        user_role: "owner" | "manager" | "event_lead" | "staff";
    };
    CompositeTypes: { [_ in never]: never; };
}, {
    PostgrestVersion: "12";
}>;
