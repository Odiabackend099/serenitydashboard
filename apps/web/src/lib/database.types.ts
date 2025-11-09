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
          name: string
          role: 'admin' | 'receptionist' | 'call_handler'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role: 'admin' | 'receptionist' | 'call_handler'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'admin' | 'receptionist' | 'call_handler'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          channel: string
          patient_ref: string
          status: string
          taken_over_by: string | null
          taken_over_at: string | null
          ai_confidence: number | null
          intent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel: string
          patient_ref: string
          status?: string
          taken_over_by?: string | null
          taken_over_at?: string | null
          ai_confidence?: number | null
          intent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel?: string
          patient_ref?: string
          status?: string
          taken_over_by?: string | null
          taken_over_at?: string | null
          ai_confidence?: number | null
          intent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          from_type: 'patient' | 'ai' | 'staff'
          body: string
          media_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          from_type: 'patient' | 'ai' | 'staff'
          body: string
          media_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          from_type?: 'patient' | 'ai' | 'staff'
          body?: string
          media_url?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_name: string | null
          patient_phone: string
          appointment_date: string
          appointment_time: string | null
          reason: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_name?: string | null
          patient_phone: string
          appointment_date: string
          appointment_time?: string | null
          reason?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_name?: string | null
          patient_phone?: string
          appointment_date?: string
          appointment_time?: string | null
          reason?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          name: string
          system_prompt: string
          voice_id: string | null
          faq_json: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          system_prompt: string
          voice_id?: string | null
          faq_json?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          system_prompt?: string
          voice_id?: string | null
          faq_json?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_config: {
        Row: {
          id: string
          version: number
          system_prompt: string
          voice_id: string
          assistant_id: string
          updated_by: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          version: number
          system_prompt: string
          voice_id: string
          assistant_id: string
          updated_by?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          version?: number
          system_prompt?: string
          voice_id?: string
          assistant_id?: string
          updated_by?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          meta_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          meta_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          meta_json?: Json | null
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          conversation_id: string | null
          patient_ref: string
          channel: string
          intent: string | null
          sentiment: string
          keywords: string[] | null
          priority: string
          status: string
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          patient_ref: string
          channel: string
          intent?: string | null
          sentiment?: string
          keywords?: string[] | null
          priority?: string
          status?: string
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          patient_ref?: string
          channel?: string
          intent?: string | null
          sentiment?: string
          keywords?: string[] | null
          priority?: string
          status?: string
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_snapshots: {
        Row: {
          id: string
          date: string
          total_conversations: number
          total_messages: number
          total_leads: number
          conversion_rate: number
          avg_response_time: string | null
          avg_ai_confidence: number
          staff_takeover_rate: number
          channel_breakdown: Json
          intent_breakdown: Json
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          total_conversations?: number
          total_messages?: number
          total_leads?: number
          conversion_rate?: number
          avg_response_time?: string | null
          avg_ai_confidence?: number
          staff_takeover_rate?: number
          channel_breakdown?: Json
          intent_breakdown?: Json
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_conversations?: number
          total_messages?: number
          total_leads?: number
          conversion_rate?: number
          avg_response_time?: string | null
          avg_ai_confidence?: number
          staff_takeover_rate?: number
          channel_breakdown?: Json
          intent_breakdown?: Json
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          type: string
          recipient: string
          subject: string | null
          body: string | null
          status: string
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          recipient: string
          subject?: string | null
          body?: string | null
          status?: string
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          recipient?: string
          subject?: string | null
          body?: string | null
          status?: string
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_name: string
          trigger_type: string
          trigger_data: Json | null
          status: string
          error_message: string | null
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workflow_name: string
          trigger_type: string
          trigger_data?: Json | null
          status: string
          error_message?: string | null
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workflow_name?: string
          trigger_type?: string
          trigger_data?: Json | null
          status?: string
          error_message?: string | null
          duration_ms?: number | null
          created_at?: string
        }
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
  }
}

