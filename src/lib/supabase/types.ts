/**
 * Auto-generated Supabase type stub.
 *
 * Replace this file with the output of:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/lib/supabase/types.ts
 *
 * Or use the Supabase CLI:
 *   supabase gen types typescript --local > src/lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "coach" | "parent" | "player";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: AppRole;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: AppRole;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: AppRole;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          profile_id: string;
          coach_id: string | null;
          date_of_birth: string | null;
          position: string | null;
          level: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          coach_id?: string | null;
          date_of_birth?: string | null;
          position?: string | null;
          level?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          coach_id?: string | null;
          date_of_birth?: string | null;
          position?: string | null;
          level?: string | null;
          notes?: string | null;
        };
      };
      parents: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      parent_player_links: {
        Row: {
          id: string;
          parent_id: string;
          player_id: string;
          relationship: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          player_id: string;
          relationship?: string | null;
          created_at?: string;
        };
        Update: {
          relationship?: string | null;
        };
      };
      training_plans: {
        Row: {
          id: string;
          player_id: string;
          coach_id: string;
          title: string;
          weekly_focus: string | null;
          coach_note: string | null;
          is_active: boolean;
          week_start: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          coach_id: string;
          title: string;
          weekly_focus?: string | null;
          coach_note?: string | null;
          is_active?: boolean;
          week_start?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          weekly_focus?: string | null;
          coach_note?: string | null;
          is_active?: boolean;
          week_start?: string | null;
        };
      };
      session_templates: {
        Row: {
          id: string;
          coach_id: string;
          title: string;
          type: string | null;
          duration_minutes: number | null;
          tag: string | null;
          content: Json | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          title: string;
          type?: string | null;
          duration_minutes?: number | null;
          tag?: string | null;
          content?: Json | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          type?: string | null;
          duration_minutes?: number | null;
          tag?: string | null;
          content?: Json | null;
          is_published?: boolean;
        };
      };
      sessions: {
        Row: {
          id: string;
          plan_id: string | null;
          template_id: string | null;
          player_id: string;
          scheduled_at: string | null;
          completed_at: string | null;
          day_label: string | null;
          focus: string | null;
          drills: Json | null;
          recovery_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id?: string | null;
          template_id?: string | null;
          player_id: string;
          scheduled_at?: string | null;
          completed_at?: string | null;
          day_label?: string | null;
          focus?: string | null;
          drills?: Json | null;
          recovery_note?: string | null;
          created_at?: string;
        };
        Update: {
          scheduled_at?: string | null;
          completed_at?: string | null;
          focus?: string | null;
          drills?: Json | null;
          recovery_note?: string | null;
        };
      };
      progress_notes: {
        Row: {
          id: string;
          player_id: string;
          author_id: string;
          session_id: string | null;
          body: string;
          visibility: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          author_id: string;
          session_id?: string | null;
          body: string;
          visibility?: string;
          created_at?: string;
        };
        Update: {
          body?: string;
          visibility?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          subject: string | null;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          subject?: string | null;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
      };
      leads: {
        Row: {
          id: string;
          first_name: string;
          email: string;
          phone: string | null;
          child_name: string | null;
          age_group: string | null;
          source: string;
          utm_campaign: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          status: LeadStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
          booked_at: string | null;
          attended_at: string | null;
          converted_at: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          email: string;
          phone?: string | null;
          child_name?: string | null;
          age_group?: string | null;
          source?: string;
          utm_campaign?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          status?: LeadStatus;
          notes?: string | null;
          created_at?: string;
          booked_at?: string | null;
          attended_at?: string | null;
          converted_at?: string | null;
        };
        Update: {
          first_name?: string;
          email?: string;
          phone?: string | null;
          child_name?: string | null;
          age_group?: string | null;
          source?: string;
          status?: LeadStatus;
          notes?: string | null;
          booked_at?: string | null;
          attended_at?: string | null;
          converted_at?: string | null;
        };
      };
      email_sequences: {
        Row: {
          id: string;
          lead_id: string;
          template_key: string;
          scheduled_for: string;
          sent_at: string | null;
          cancelled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          template_key: string;
          scheduled_for: string;
          sent_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
        };
        Update: {
          sent_at?: string | null;
          cancelled_at?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          lead_id: string | null;
          parent_name: string;
          parent_email: string;
          parent_phone: string | null;
          player_name: string;
          player_age: string | null;
          session_type: string;
          preferred_date: string;
          preferred_time: string;
          status: BookingStatus;
          notes: string | null;
          created_at: string;
          confirmed_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          parent_name: string;
          parent_email: string;
          parent_phone?: string | null;
          player_name: string;
          player_age?: string | null;
          session_type: string;
          preferred_date: string;
          preferred_time: string;
          status?: BookingStatus;
          notes?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          status?: BookingStatus;
          notes?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
        };
      };
    };
    Enums: {
      app_role: AppRole;
      lead_status: LeadStatus;
      booking_status: BookingStatus;
    };
  };
}

export type LeadStatus = "new" | "contacted" | "booked" | "attended" | "converted" | "lost";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
