export type Json =
  | string
  | number
  | boolean
  | null
  | {
      [key: string]: Json | undefined;
    }
  | Json[];
export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          company_id: string;
          created_at: string;
          diff: Json | null;
          entity_id: string;
          entity_type: string;
          id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          company_id: string;
          created_at?: string;
          diff?: Json | null;
          entity_id: string;
          entity_type: string;
          id?: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          company_id?: string;
          created_at?: string;
          diff?: Json | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'combined_task_groups_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      companies: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          settings: Json;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          settings?: Json;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          settings?: Json;
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
          status: Database['public']['Enums']['event_status'];
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          scheduled_at: string;
          status?: Database['public']['Enums']['event_status'];
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          scheduled_at?: string;
          status?: Database['public']['Enums']['event_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'media_assets_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'method_documents_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'method_documents_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      recipes: {
        Row: {
          company_id: string;
          created_at: string;
          id: string;
          ingredients: Json;
          name: string;
          steps: Json;
          updated_at: string;
          version: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          id?: string;
          ingredients?: Json;
          name: string;
          steps?: Json;
          updated_at?: string;
          version?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          id?: string;
          ingredients?: Json;
          name?: string;
          steps?: Json;
          updated_at?: string;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recipes_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          assigned_user_id: string | null;
          company_id: string;
          created_at: string;
          event_id: string | null;
          id: string;
          meta: Json | null;
          name: string;
          priority: string | null;
          quantity: number;
          recipe_id: string | null;
          status: Database['public']['Enums']['task_status'];
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
          meta?: Json | null;
          name: string;
          priority?: string | null;
          quantity?: number;
          recipe_id?: string | null;
          status?: Database['public']['Enums']['task_status'];
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
          meta?: Json | null;
          name?: string;
          priority?: string | null;
          quantity?: number;
          recipe_id?: string | null;
          status?: Database['public']['Enums']['task_status'];
          undo_token?: string | null;
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_assigned_user_id_fkey';
            columns: ['assigned_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          company_id: string;
          created_at: string;
          display_name: string | null;
          id: string;
          role: Database['public']['Enums']['user_role'];
          status: string;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: Database['public']['Enums']['user_role'];
          status?: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: Database['public']['Enums']['user_role'];
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_my_company_id: {
        Args: never;
        Returns: string;
      };
      get_my_role: {
        Args: never;
        Returns: Database['public']['Enums']['user_role'];
      };
    };
    Enums: {
      event_status: 'draft' | 'published' | 'completed' | 'archived';
      task_status: 'pending' | 'claimed' | 'completed' | 'verified';
      user_role: 'owner' | 'manager' | 'event_lead' | 'staff';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;
export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;
export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;
export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
export declare const Constants: {
  readonly graphql_public: {
    readonly Enums: Record<string, never>;
  };
  readonly public: {
    readonly Enums: {
      readonly event_status: readonly ['draft', 'published', 'completed', 'archived'];
      readonly task_status: readonly ['pending', 'claimed', 'completed', 'verified'];
      readonly user_role: readonly ['owner', 'manager', 'event_lead', 'staff'];
    };
  };
};
export {};
