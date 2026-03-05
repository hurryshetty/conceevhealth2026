export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      doctor_reviews: {
        Row: {
          area: string
          created_at: string
          doctor_id: string
          id: string
          image_url: string | null
          name: string
          quote: string
          rating: number
        }
        Insert: {
          area: string
          created_at?: string
          doctor_id: string
          id?: string
          image_url?: string | null
          name: string
          quote: string
          rating?: number
        }
        Update: {
          area?: string
          created_at?: string
          doctor_id?: string
          id?: string
          image_url?: string | null
          name?: string
          quote?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "doctor_reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: string
          cities: string[]
          consultation_fee: string
          created_at: string
          designation: string
          experience: string
          hospitals: string[]
          id: string
          image_url: string | null
          languages: string[]
          name: string
          qualifications: string[]
          slug: string
          specializations: string[]
          surgeries: string[]
        }
        Insert: {
          bio?: string
          cities?: string[]
          consultation_fee?: string
          created_at?: string
          designation: string
          experience: string
          hospitals?: string[]
          id?: string
          image_url?: string | null
          languages?: string[]
          name: string
          qualifications?: string[]
          slug: string
          specializations?: string[]
          surgeries?: string[]
        }
        Update: {
          bio?: string
          cities?: string[]
          consultation_fee?: string
          created_at?: string
          designation?: string
          experience?: string
          hospitals?: string[]
          id?: string
          image_url?: string | null
          languages?: string[]
          name?: string
          qualifications?: string[]
          slug?: string
          specializations?: string[]
          surgeries?: string[]
        }
        Relationships: []
      }
      leads: {
        Row: {
          city: string
          created_at: string
          id: string
          name: string
          phone: string
          procedure_interest: string
          source_page: string | null
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          name: string
          phone: string
          procedure_interest: string
          source_page?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          procedure_interest?: string
          source_page?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          area: string
          city_id: string
          created_at: string
          id: string
          name: string
          surgeries: string[]
        }
        Insert: {
          area: string
          city_id: string
          created_at?: string
          id?: string
          name: string
          surgeries?: string[]
        }
        Update: {
          area?: string
          city_id?: string
          created_at?: string
          id?: string
          name?: string
          surgeries?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      package_reviews: {
        Row: {
          city: string
          created_at: string
          id: string
          name: string
          package_id: string
          rating: number
          text: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          name: string
          package_id: string
          rating?: number
          text: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          name?: string
          package_id?: string
          rating?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          avg_rating: number
          cities: string[]
          created_at: string
          description: string
          duration: string | null
          icon_name: string
          id: string
          includes: string[]
          overview: string | null
          price: string
          recovery: string | null
          slug: string
          specialty_id: string | null
          success_rate: string | null
          tag: string | null
          title: string
          total_patients: string | null
        }
        Insert: {
          avg_rating?: number
          cities?: string[]
          created_at?: string
          description?: string
          duration?: string | null
          icon_name?: string
          id?: string
          includes?: string[]
          overview?: string | null
          price: string
          recovery?: string | null
          slug: string
          specialty_id?: string | null
          success_rate?: string | null
          tag?: string | null
          title: string
          total_patients?: string | null
        }
        Update: {
          avg_rating?: number
          cities?: string[]
          created_at?: string
          description?: string
          duration?: string | null
          icon_name?: string
          id?: string
          includes?: string[]
          overview?: string | null
          price?: string
          recovery?: string | null
          slug?: string
          specialty_id?: string | null
          success_rate?: string | null
          tag?: string | null
          title?: string
          total_patients?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
