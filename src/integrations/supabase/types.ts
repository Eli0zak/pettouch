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
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
          updated_at: string
          type: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
          updated_at?: string
          type?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
          updated_at?: string
          type?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
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
          profile_image_url: string | null
          resolved_at: string | null
          status: string
          title: string
          user_id: string
          government: string | null
          area: string | null
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
          profile_image_url?: string | null
          resolved_at?: string | null
          status: string
          title: string
          type: 'lost' | 'found'
          user_id: string
          government?: string | null
          area?: string | null
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
          profile_image_url?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          type?: 'lost' | 'found'
          user_id?: string
          government?: string | null
          area?: string | null
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
          }
        ]
      }
      lost_found_interactions: {
        Row: {
          id: string
          post_id: string
          interaction_type: 'found' | 'know'
          name: string
          email: string
          phone: string | null
          message: string
          user_id: string | null
          created_at: string
          read_at: string | null
          resolved_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          interaction_type: 'found' | 'know'
          name: string
          email: string
          phone?: string | null
          message: string
          user_id?: string | null
          created_at?: string
          read_at?: string | null
          resolved_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          interaction_type?: 'found' | 'know'
          name?: string
          email?: string
          phone?: string | null
          message?: string
          user_id?: string | null
          created_at?: string
          read_at?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lost_found_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "lost_found_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lost_found_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      }
      pet_images: {
        Row: {
          id: string
          pet_id: string
          image_url: string
          is_primary: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          pet_id: string
          image_url: string
          is_primary?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          pet_id?: string
          image_url?: string
          is_primary?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_images_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
