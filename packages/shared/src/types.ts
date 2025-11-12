export type Role = 'admin' | 'receptionist' | 'call_handler';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type Channel = 'whatsapp' | 'voice';

export interface Conversation {
  id: string;
  channel: Channel;
  patientRef: string;
  status: 'active' | 'closed' | 'escalated';
}

export interface Message {
  id: string;
  conversationId: string;
  from: 'patient' | 'ai' | 'staff';
  body: string;
  mediaUrl?: string | null;
  ts: string;
}

export interface Appointment {
  id: string;
  patientRef: string;
  start: string;
  end: string;
  doctor: string;
  source: 'ai' | 'staff';
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  voiceId?: string | null;
  faqJson?: unknown;
  createdBy: string;
}