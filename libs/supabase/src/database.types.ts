export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          company_id: string
          created_at: string
          diff: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          diff?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          diff?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      combined_task_groups: {
        Row: {
          aggregated_quantity: number
          approved_by_user_id: string | null
          base_task_ids: Json
          company_id: string
          created_at: string
          heuristic_metadata: Json
          id: string
          unit: string | null
        }
        Insert: {
          aggregated_quantity: number
          approved_by_user_id?: string | null
          base_task_ids?: Json
          company_id: string
          created_at?: string
          heuristic_metadata?: Json
          id?: string
          unit?: string | null
        }
        Update: {
          aggregated_quantity?: number
          approved_by_user_id?: string | null
          base_task_ids?: Json
          company_id?: string
          created_at?: string
          heuristic_metadata?: Json
          id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combined_task_groups_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combined_task_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          settings: Json
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          settings?: Json
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          settings?: Json
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      display_snapshots: {
        Row: {
          captured_at: string
          company_id: string
          id: string
          payload: Json
        }
        Insert: {
          captured_at?: string
          company_id: string
          id?: string
          payload?: Json
        }
        Update: {
          captured_at?: string
          company_id?: string
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "display_snapshots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          company_id: string
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          checksum: string | null
          company_id: string
          created_at: string
          duration: number | null
          id: string
          status: string
          storage_path: string
          thumbnail_url: string | null
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          checksum?: string | null
          company_id: string
          created_at?: string
          duration?: number | null
          id?: string
          status?: string
          storage_path: string
          thumbnail_url?: string | null
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          checksum?: string | null
          company_id?: string
          created_at?: string
          duration?: number | null
          id?: string
          status?: string
          storage_path?: string
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      method_documents: {
        Row: {
          company_id: string
          created_at: string
          id: string
          last_reviewed_by: string | null
          skill_level: string | null
          steps: Json
          title: string
          video_refs: Json
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          last_reviewed_by?: string | null
          skill_level?: string | null
          steps?: Json
          title: string
          video_refs?: Json
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          last_reviewed_by?: string | null
          skill_level?: string | null
          steps?: Json
          title?: string
          video_refs?: Json
        }
        Relationships: [
          {
            foreignKeyName: "method_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "method_documents_last_reviewed_by_fkey"
            columns: ["last_reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel: string
          company_id: string
          enabled: boolean
          id: string
          quiet_hours: string | null
          user_id: string
        }
        Insert: {
          channel: string
          company_id: string
          enabled?: boolean
          id?: string
          quiet_hours?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          company_id?: string
          enabled?: boolean
          id?: string
          quiet_hours?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_subscriptions: {
        Row: {
          channel_name: string
          company_id: string
          device_id: string | null
          id: string
          last_heartbeat_at: string | null
          last_seen_event_id: string | null
        }
        Insert: {
          channel_name: string
          company_id: string
          device_id?: string | null
          id?: string
          last_heartbeat_at?: string | null
          last_seen_event_id?: string | null
        }
        Update: {
          channel_name?: string
          company_id?: string
          device_id?: string | null
          id?: string
          last_heartbeat_at?: string | null
          last_seen_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "realtime_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          company_id: string
          created_at: string
          id: string
          ingredients: Json
          name: string
          steps: Json
          updated_at: string
          version: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          ingredients?: Json
          name: string
          steps?: Json
          updated_at?: string
          version?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          ingredients?: Json
          name?: string
          steps?: Json
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_assignments: {
        Row: {
          company_id: string
          granted_at: string
          granted_by: string
          id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          granted_at?: string
          granted_by: string
          id?: string
          revoked_at?: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          granted_at?: string
          granted_by?: string
          id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_assignments_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          company_id: string
          event_id: string | null
          id: string
          role_override: Database["public"]["Enums"]["user_role"] | null
          shift_end: string
          shift_start: string
          user_id: string
        }
        Insert: {
          company_id: string
          event_id?: string | null
          id?: string
          role_override?: Database["public"]["Enums"]["user_role"] | null
          shift_end: string
          shift_start: string
          user_id: string
        }
        Update: {
          company_id?: string
          event_id?: string | null
          id?: string
          role_override?: Database["public"]["Enums"]["user_role"] | null
          shift_end?: string
          shift_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          company_id: string
          id: string
          name: string
          sort_order: number
          type: string
        }
        Insert: {
          company_id: string
          id?: string
          name: string
          sort_order?: number
          type: string
        }
        Update: {
          company_id?: string
          id?: string
          name?: string
          sort_order?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_id: string
          body: string
          company_id: string
          created_at: string
          id: string
          task_id: string
        }
        Insert: {
          author_id: string
          body: string
          company_id: string
          created_at?: string
          id?: string
          task_id: string
        }
        Update: {
          author_id?: string
          body?: string
          company_id?: string
          created_at?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_similarity_suggestions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          similarity_score: number
          suggested_task_id: string
          task_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          similarity_score: number
          suggested_task_id: string
          task_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          similarity_score?: number
          suggested_task_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_similarity_suggestions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_similarity_suggestions_suggested_task_id_fkey"
            columns: ["suggested_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_similarity_suggestions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_user_id: string | null
          combined_group_id: string | null
          company_id: string
          created_at: string
          event_id: string | null
          id: string
          instructions_ref: string | null
          name: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          quantity: number
          recipe_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          undo_token: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          combined_group_id?: string | null
          company_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          instructions_ref?: string | null
          name: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          quantity?: number
          recipe_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          undo_token?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          combined_group_id?: string | null
          company_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          instructions_ref?: string | null
          name?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          quantity?: number
          recipe_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          undo_token?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_combined_group_id_fkey"
            columns: ["combined_group_id"]
            isOneToOne: false
            referencedRelation: "combined_task_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      undo_tokens: {
        Row: {
          company_id: string
          created_at: string
          expires_at: string
          id: string
          task_id: string
          token: string
        }
        Insert: {
          company_id: string
          created_at?: string
          expires_at: string
          id?: string
          task_id: string
          token: string
        }
        Update: {
          company_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          task_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "undo_tokens_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "undo_tokens_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string
          contact_info: Json
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          contact_info?: Json
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          contact_info?: Json
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_status: "scheduled" | "active" | "complete" | "archived"
      task_priority: "low" | "normal" | "high" | "urgent"
      task_status: "available" | "claimed" | "in_progress" | "completed"
      user_role: "owner" | "manager" | "event_lead" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      event_status: ["scheduled", "active", "complete", "archived"],
      task_priority: ["low", "normal", "high", "urgent"],
      task_status: ["available", "claimed", "in_progress", "completed"],
      user_role: ["owner", "manager", "event_lead", "staff"],
    },
  },
} as const

