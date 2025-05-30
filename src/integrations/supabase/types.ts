export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      lost_found_posts: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          last_seen_date: string | null
          last_seen_location: string | null
          pet_age: number | null
          pet_breed: string | null
          pet_color: string | null
          pet_gender: string | null
          pet_id: string | null
          pet_name: string | null
          pet_type: string | null
          resolved_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          pet_age?: number | null
          pet_breed?: string | null
          pet_color?: string | null
          pet_gender?: string | null
          pet_id?: string | null
          pet_name?: string | null
          pet_type?: string | null
          resolved_at?: string | null
          status: string
          title: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          pet_age?: number | null
          pet_breed?: string | null
          pet_color?: string | null
          pet_gender?: string | null
          pet_id?: string | null
          pet_name?: string | null
          pet_type?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lost_found_posts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_found_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nfc_tags: {
        Row: {
          id: string
          tag_code: string
          pet_id: string | null
          user_id: string | null
          is_active: boolean
          created_at: string
          activated_at: string | null
          notes: string | null
          tag_type: string
          status: string
          last_updated: string
        }
        Insert: {
          id?: string
          tag_code: string
          pet_id?: string | null
          user_id?: string | null
          is_active?: boolean
          created_at?: string
          activated_at?: string | null
          notes?: string | null
          tag_type?: string
          status?: string
          last_updated?: string
        }
        Update: {
          id?: string
          tag_code?: string
          pet_id?: string | null
          user_id?: string | null
          is_active?: boolean
          created_at?: string
          activated_at?: string | null
          notes?: string | null
          tag_type?: string
          status?: string
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfc_tags_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfc_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      nfc_scans: {
        Row: {
          id: string
          tag_id: string
          pet_id: string | null
          location: Json | null
          created_at: string
          device_info: Json | null
          scanner_ip: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          tag_id: string
          pet_id?: string | null
          location?: Json | null
          created_at?: string
          device_info?: Json | null
          scanner_ip?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          tag_id?: string
          pet_id?: string | null
          location?: Json | null
          created_at?: string
          device_info?: Json | null
          scanner_ip?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfc_scans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfc_scans_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "nfc_tags"
            referencedColumns: ["tag_code"]
          },
          {
            foreignKeyName: "nfc_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pets: {
        Row: {
          birthday: string | null
          breed: string | null
          color: string | null
          created_at: string | null
          emergency_contact: Json | null
          gender: string | null
          id: string
          is_active: boolean | null
          last_scanned_at: string | null
          medical_info: Json | null
          microchip_id: string | null
          name: string
          notes: string | null
          owner_id: string
          profile_image_url: string | null
          qr_code_url: string | null
          scan_count: number | null
          type: string
          veterinarian: Json | null
          weight_kg: number | null
        }
        Insert: {
          birthday?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string | null
          emergency_contact?: Json | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_scanned_at?: string | null
          medical_info?: Json | null
          microchip_id?: string | null
          name: string
          notes?: string | null
          owner_id: string
          profile_image_url?: string | null
          qr_code_url?: string | null
          scan_count?: number | null
          type: string
          veterinarian?: Json | null
          weight_kg?: number | null
        }
        Update: {
          birthday?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string | null
          emergency_contact?: Json | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_scanned_at?: string | null
          medical_info?: Json | null
          microchip_id?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          profile_image_url?: string | null
          qr_code_url?: string | null
          scan_count?: number | null
          type?: string
          veterinarian?: Json | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string
          plan: string | null
          role: string | null
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id: string
          plan?: string | null
          role?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string | null
          role?: string | null
        }
        Relationships: []
      }
      scans: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          location: Json | null
          pet_id: string
          scanner_ip: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          location?: Json | null
          pet_id: string
          scanner_ip?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          location?: Json | null
          pet_id?: string
          scanner_ip?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_categories: {
        Row: {
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          created_at: string | null
          id: string
          items: Json
          payment_info: Json | null
          shipping_address: Json
          status: string
          total_amount: number
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          items: Json
          payment_info?: Json | null
          shipping_address: Json
          status?: string
          total_amount: number
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json
          payment_info?: Json | null
          shipping_address?: Json
          status?: string
          total_amount?: number
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          attributes: Json | null
          category_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_bestseller: boolean | null
          is_new: boolean | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          sale_price: number | null
          sku: string | null
          stock: number
          store_id: string | null
          tags: string[] | null
          thumbnail: string | null
          updated_at: string | null
        }
        Insert: {
          attributes?: Json | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_new?: boolean | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          sale_price?: number | null
          sku?: string | null
          stock?: number
          store_id?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          updated_at?: string | null
        }
        Update: {
          attributes?: Json | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_new?: boolean | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          sale_price?: number | null
          sku?: string | null
          stock?: number
          store_id?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_store_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_stores: {
        Row: {
          address: string | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          social_media: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          social_media?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          social_media?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_images: {
        Row: {
          id: string
          pet_id: string
          image_url: string
          is_primary: boolean
          caption: string | null
          created_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          pet_id: string
          image_url: string
          is_primary?: boolean
          caption?: string | null
          created_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          pet_id?: string
          image_url?: string
          is_primary?: boolean
          caption?: string | null
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_images_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          id: string
          user_id: string
          previous_plan: string | null
          new_plan: string | null
          change_date: string
          request_id: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          previous_plan?: string | null
          new_plan?: string | null
          change_date?: string
          request_id?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          previous_plan?: string | null
          new_plan?: string | null
          change_date?: string
          request_id?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_requests: {
        Row: {
          created_at: string
          current_plan: string
          id: string
          notes: string | null
          payment_method: string
          phone_number: string
          requested_plan: string
          status: string
          transaction_proof_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_plan: string
          id?: string
          notes?: string | null
          payment_method: string
          phone_number: string
          requested_plan: string
          status?: string
          transaction_proof_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_plan?: string
          id?: string
          notes?: string | null
          payment_method?: string
          phone_number?: string
          requested_plan?: string
          status?: string
          transaction_proof_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          title: string
          video_url: string | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          title: string
          video_url?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          language: string | null
          last_login: string | null
          last_name: string | null
          notification_settings: Json | null
          phone: string | null
          plan: string | null
          role: string | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          notification_settings?: Json | null
          phone?: string | null
          plan?: string | null
          role?: string | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          notification_settings?: Json | null
          phone?: string | null
          plan?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_scan_count: {
        Args: { animal_id: string }
        Returns: boolean
      }
      set_supabase_url: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
