/* eslint-disable @typescript-eslint/no-explicit-any */
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Views: {
      [key: string]: {
        Row: any;
      };
    };
    Functions: {
      [key: string]: {
        Args: any;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: any;
    };
    CompositeTypes: {
      [key: string]: any;
    };
  };
};
