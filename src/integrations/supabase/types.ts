export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
          id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
        Row: {
          account_number: string | null
          account_opening_date: string
          account_status: string | null
          added_by: string | null
          contact_id: string | null
          created_at: string
          current_margin: number | null
          employee_id: string | null
          id: string
          initial_margin: number | null
          margin_history: Json | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_opening_date: string
          account_status?: string | null
          added_by?: string | null
          contact_id?: string | null
          created_at?: string
          current_margin?: number | null
          employee_id?: string | null
          id?: string
          initial_margin?: number | null
          margin_history?: Json | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_opening_date?: string
          account_status?: string | null
          added_by?: string | null
          contact_id?: string | null
          created_at?: string
          current_margin?: number | null
          employee_id?: string | null
          id?: string
          initial_margin?: number | null
          margin_history?: Json | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_accounts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_followups: {
        Row: {
          added_by: string | null
          comments: string | null
          completed: boolean | null
          contact_id: string | null
          created_at: string
          employee_id: string | null
          followup_date: string
          id: string
          next_followup_date: string | null
          notification_sent: boolean | null
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          comments?: string | null
          completed?: boolean | null
          contact_id?: string | null
          created_at?: string
          employee_id?: string | null
          followup_date: string
          id?: string
          next_followup_date?: string | null
          notification_sent?: boolean | null
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          comments?: string | null
          completed?: boolean | null
          contact_id?: string | null
          created_at?: string
          employee_id?: string | null
          followup_date?: string
          id?: string
          next_followup_date?: string | null
          notification_sent?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_followups_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_followups_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_meetings: {
        Row: {
          added_by: string | null
          contact_id: string | null
          created_at: string
          duration_minutes: number | null
          employee_id: string | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          meeting_date: string
          meeting_type: string | null
          next_steps: string | null
          notes: string | null
          outcome: string | null
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          contact_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          employee_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          meeting_date: string
          meeting_type?: string | null
          next_steps?: string | null
          notes?: string | null
          outcome?: string | null
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          contact_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          employee_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          meeting_date?: string
          meeting_type?: string | null
          next_steps?: string | null
          notes?: string | null
          outcome?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_meetings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_meetings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          added_by: string | null
          category: string
          company: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          category?: string
          company?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          category?: string
          company?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      kpi_data: {
        Row: {
          added_by: string | null
          calls: number | null
          created_at: string
          date: string
          employee_id: string | null
          id: string
          in_house_meetings: number | null
          leads_generated: number | null
          margin: number | null
          out_house_meetings: number | null
          product_knowledge: number | null
          smd: number | null
          solo_closing: number | null
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          calls?: number | null
          created_at?: string
          date: string
          employee_id?: string | null
          id?: string
          in_house_meetings?: number | null
          leads_generated?: number | null
          margin?: number | null
          out_house_meetings?: number | null
          product_knowledge?: number | null
          smd?: number | null
          solo_closing?: number | null
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          calls?: number | null
          created_at?: string
          date?: string
          employee_id?: string | null
          id?: string
          in_house_meetings?: number | null
          leads_generated?: number | null
          margin?: number | null
          out_house_meetings?: number | null
          product_knowledge?: number | null
          smd?: number | null
          solo_closing?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
