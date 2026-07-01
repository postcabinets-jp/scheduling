export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          timezone: string
          locale: string
          brand_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          bio?: string | null
          avatar_url?: string | null
          timezone?: string
          locale?: string
          brand_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          bio?: string | null
          avatar_url?: string | null
          timezone?: string
          locale?: string
          brand_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_connections: {
        Row: {
          id: string
          user_id: string
          provider: 'google' | 'outlook' | 'apple'
          account_email: string
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'google' | 'outlook' | 'apple'
          account_email: string
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          is_primary?: boolean
        }
        Relationships: []
      }
      availability_schedules: {
        Row: {
          id: string
          user_id: string
          name: string
          timezone: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          timezone?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          timezone?: string
          is_default?: boolean
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          id: string
          schedule_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          schedule_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Update: {
          day_of_week?: number
          start_time?: string
          end_time?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          id: string
          user_id: string
          schedule_id: string | null
          slug: string
          title: string
          description: string | null
          duration_minutes: number
          buffer_before_min: number
          buffer_after_min: number
          max_bookings_per_day: number | null
          min_notice_hours: number
          future_booking_days: number
          location_type: 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person' | 'custom'
          location_value: string | null
          color: string
          is_active: boolean
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          schedule_id?: string | null
          slug: string
          title: string
          description?: string | null
          duration_minutes: number
          buffer_before_min?: number
          buffer_after_min?: number
          max_bookings_per_day?: number | null
          min_notice_hours?: number
          future_booking_days?: number
          location_type: 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person' | 'custom'
          location_value?: string | null
          color?: string
          is_active?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          schedule_id?: string | null
          slug?: string
          title?: string
          description?: string | null
          duration_minutes?: number
          buffer_before_min?: number
          buffer_after_min?: number
          max_bookings_per_day?: number | null
          min_notice_hours?: number
          future_booking_days?: number
          location_type?: 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person' | 'custom'
          location_value?: string | null
          color?: string
          is_active?: boolean
          is_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      date_overrides: {
        Row: {
          id: string
          user_id: string
          date: string
          is_blocked: boolean
          slots: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          is_blocked?: boolean
          slots?: Json | null
        }
        Update: {
          is_blocked?: boolean
          slots?: Json | null
        }
        Relationships: []
      }
      event_type_questions: {
        Row: {
          id: string
          event_type_id: string
          label: string
          type: 'text' | 'textarea' | 'select' | 'checkbox' | 'phone'
          options: Json | null
          is_required: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          event_type_id: string
          label: string
          type: 'text' | 'textarea' | 'select' | 'checkbox' | 'phone'
          options?: Json | null
          is_required?: boolean
          sort_order?: number
        }
        Update: {
          label?: string
          type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'phone'
          options?: Json | null
          is_required?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          event_type_id: string
          host_user_id: string
          invitee_name: string
          invitee_email: string
          invitee_timezone: string
          start_at: string
          end_at: string
          status: 'confirmed' | 'cancelled' | 'rescheduled' | 'no_show'
          cancel_reason: string | null
          meeting_url: string | null
          reschedule_token: string
          cancel_token: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_type_id: string
          host_user_id: string
          invitee_name: string
          invitee_email: string
          invitee_timezone?: string
          start_at: string
          end_at: string
          status?: 'confirmed' | 'cancelled' | 'rescheduled' | 'no_show'
          cancel_reason?: string | null
          meeting_url?: string | null
          reschedule_token?: string
          cancel_token?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'confirmed' | 'cancelled' | 'rescheduled' | 'no_show'
          cancel_reason?: string | null
          meeting_url?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      booking_answers: {
        Row: {
          id: string
          booking_id: string
          question_id: string
          value: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          question_id: string
          value?: string | null
        }
        Update: {
          value?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          slug: string
          name: string
          owner_id: string
          plan: 'free' | 'pro'
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          owner_id: string
          plan?: 'free' | 'pro'
          created_at?: string
        }
        Update: {
          name?: string
          plan?: 'free' | 'pro'
        }
        Relationships: []
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          team_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          role?: 'owner' | 'admin' | 'member'
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          id: string
          user_id: string
          url: string
          events: string[]
          secret: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          events?: string[]
          secret?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          url?: string
          events?: string[]
          is_active?: boolean
        }
        Relationships: []
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

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type EventType = Database['public']['Tables']['event_types']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type AvailabilitySchedule = Database['public']['Tables']['availability_schedules']['Row']
export type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row']
export type EventTypeQuestion = Database['public']['Tables']['event_type_questions']['Row']
export type BookingAnswer = Database['public']['Tables']['booking_answers']['Row']
export type DateOverride = Database['public']['Tables']['date_overrides']['Row']
export type CalendarConnection = Database['public']['Tables']['calendar_connections']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Webhook = Database['public']['Tables']['webhooks']['Row']

export type BookingWithEventType = Booking & {
  event_types: EventType
}

export type EventTypeWithSchedule = EventType & {
  availability_schedules: AvailabilitySchedule | null
  event_type_questions: EventTypeQuestion[]
}
