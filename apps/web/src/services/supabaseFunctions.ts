import { supabase } from '../lib/supabase';

// Types for Supabase Edge Functions responses
interface BusinessAnalyticsResponse {
  success: boolean;
  data?: {
    total_conversations: number;
    total_appointments: number;
    compliance_rate: number;
    business_intelligence: {
      predicted_growth: number;
      risk_factors: string[];
      recommendations: string[];
    };
    compliance_metrics: {
      gdpr_compliance: boolean;
      hipaa_compliance: boolean;
      audit_score: number;
      critical_alerts: string[];
    };
  };
  error?: string;
}

interface BusinessRulesResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface AppointmentManagementResponse {
  success: boolean;
  data?: {
    appointments: any[];
    total_count: number;
    upcoming_count: number;
    confirmed_count: number;
  };
  error?: string;
}

interface SettingsResponse {
  success: boolean;
  data?: {
    vapi_api_key?: string;
    n8n_webhook_url?: string;
    google_calendar_enabled?: boolean;
    twilio_whatsapp_number?: string;
    business_hours?: {
      start: string;
      end: string;
    };
    appointment_settings?: {
      min_notice_hours: number;
      max_advance_days: number;
      working_days: number[];
    };
  };
  error?: string;
}

class SupabaseFunctionsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://yfrpxqvjshwaaomgcaoq.supabase.co/functions/v1';
  }

  // Business Analytics Functions
  async getBusinessAnalytics() {
    try {
      const { data, error } = await supabase.functions.invoke('business-analytics', {
        body: { action: 'get_dashboard_metrics' }
      });

      if (error) throw error;
      return data as BusinessAnalyticsResponse;
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      throw error;
    }
  }

  async getComplianceMetrics() {
    try {
      const { data, error } = await supabase.functions.invoke('business-analytics', {
        body: { action: 'get_compliance_metrics' }
      });

      if (error) throw error;
      return data as BusinessAnalyticsResponse;
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
      throw error;
    }
  }

  // Business Rules Functions
  async validateBusinessRules(rules: any) {
    try {
      const { data, error } = await supabase.functions.invoke('business-rules', {
        body: { action: 'validate_rules', rules }
      });

      if (error) throw error;
      return data as BusinessRulesResponse;
    } catch (error) {
      console.error('Error validating business rules:', error);
      throw error;
    }
  }

  async checkCompliance(patientId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('business-rules', {
        body: { action: 'check_compliance', patient_id: patientId }
      });

      if (error) throw error;
      return data as BusinessRulesResponse;
    } catch (error) {
      console.error('Error checking compliance:', error);
      throw error;
    }
  }

  // Appointment Management Functions
  async getAppointments(filters?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    patient_id?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('appointment-management', {
        body: { action: 'get_appointments', filters }
      });

      if (error) throw error;
      return data as AppointmentManagementResponse;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: {
    patient_name: string;
    patient_phone: string;
    appointment_date: string;
    appointment_time: string;
    reason: string;
    provider_id?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('appointment-management', {
        body: { action: 'create_appointment', appointment_data: appointmentData }
      });

      if (error) throw error;
      return data as AppointmentManagementResponse;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(appointmentId: string, updates: any) {
    try {
      const { data, error } = await supabase.functions.invoke('appointment-management', {
        body: { action: 'update_appointment', appointment_id: appointmentId, updates }
      });

      if (error) throw error;
      return data as AppointmentManagementResponse;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async deleteAppointment(appointmentId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('appointment-management', {
        body: { action: 'delete_appointment', appointment_id: appointmentId }
      });

      if (error) throw error;
      return data as AppointmentManagementResponse;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Settings Functions
  async getSettings() {
    try {
      const { data, error } = await supabase.functions.invoke('business-rules', {
        body: { action: 'get_settings' }
      });

      if (error) throw error;
      return data as SettingsResponse;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  async updateSettings(settings: any) {
    try {
      const { data, error } = await supabase.functions.invoke('business-rules', {
        body: { action: 'update_settings', settings }
      });

      if (error) throw error;
      return data as SettingsResponse;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  async validateSettings(settings: any) {
    try {
      const { data, error } = await supabase.functions.invoke('business-rules', {
        body: { action: 'validate_settings', settings }
      });

      if (error) throw error;
      return data as BusinessRulesResponse;
    } catch (error) {
      console.error('Error validating settings:', error);
      throw error;
    }
  }

  // Helper method to handle real-time subscriptions
  subscribeToAppointments(callback: (appointments: any[]) => void) {
    return supabase
      .channel('appointments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, () => {
        // When appointments change, fetch fresh data
        this.getAppointments().then(response => {
          if (response.success && response.data) {
            callback(response.data.appointments);
          }
        }).catch(error => {
          console.error('Error fetching updated appointments:', error);
        });
      })
      .subscribe();
  }

  // Helper method to handle real-time settings updates
  subscribeToSettings(callback: (settings: any) => void) {
    return supabase
      .channel('settings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'settings'
      }, () => {
        // When settings change, fetch fresh data
        this.getSettings().then(response => {
          if (response.success && response.data) {
            callback(response.data);
          }
        }).catch(error => {
          console.error('Error fetching updated settings:', error);
        });
      })
      .subscribe();
  }
}

export const supabaseFunctions = new SupabaseFunctionsService();