import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import { triggerLeadCapture, triggerSentimentAlert, triggerAppointmentBooking } from '../lib/n8nWebhooks';
import { chatWithTools, testToolExecution, getToolsForMode } from '../lib/groqTools';
import {
  MessageCircle,
  Mic,
  Send,
  X,
  Calendar,
  Pill,
  FileText,
  HelpCircle,
  Clock,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';

type Role = 'user' | 'assistant' | 'system';
type MessageFrom = 'patient' | 'ai' | 'staff';
type ChatMode = 'text' | 'voice';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error';

interface ChatMessage {
  role: Role;
  content: string;
  from?: MessageFrom;
  status?: MessageStatus;
  timestamp?: Date;
}

interface VoiceStatus {
  status: 'idle' | 'connecting' | 'active' | 'ended' | 'error';
  transcript: string[];
  error?: string;
}

// Helper Components

// Typing Indicator
function TypingIndicator() {
  return (
    <div className="text-left">
      <div className="inline-block rounded-lg px-3 py-2 bg-gray-200 dark:bg-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// Chat Skeleton Loading
function ChatSkeleton() {
  return (
    <div className="space-y-3 p-4 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
      <div className="h-12 bg-blue-200 dark:bg-blue-800 rounded-lg w-2/3 ml-auto" />
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5" />
    </div>
  );
}

// Message Status Icon
function MessageStatusIcon({ status }: { status?: MessageStatus }) {
  if (!status) return null;

  switch (status) {
    case 'sending':
      return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;
    case 'sent':
      return <Check className="w-3 h-3 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-3 h-3 text-red-500" />;
  }
}

// Quick Actions
interface QuickAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

const quickActions: QuickAction[] = [
  { icon: <Calendar className="w-5 h-5" />, label: 'Book Appointment', prompt: 'I need to book an appointment' },
  { icon: <Pill className="w-5 h-5" />, label: 'Medication Info', prompt: 'Tell me about my medications' },
  { icon: <FileText className="w-5 h-5" />, label: 'Test Results', prompt: 'Show my recent test results' },
  { icon: <HelpCircle className="w-5 h-5" />, label: 'Ask Question', prompt: 'I have a general health question' }
];

function QuickActions({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
      {quickActions.map((action, i) => (
        <button
          key={i}
          onClick={() => onSelect(action.prompt)}
          className="flex items-center gap-2 p-2 rounded-lg bg-healthcare-bg-secondary dark:bg-healthcare-dark-bg-secondary hover:bg-healthcare-accent/10 dark:hover:bg-healthcare-accent/20 transition-all border border-gray-200 dark:border-gray-700 group"
          title={action.label}
        >
          <div className="text-healthcare-primary dark:text-healthcare-accent group-hover:scale-110 transition-transform">
            {action.icon}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

// Environment variable getters
// Groq API key is now handled by Supabase Edge Function - no longer needed in frontend
function getGroqApiKey(): string | undefined {
  // This function is kept for backward compatibility but always returns undefined
  // All Groq calls now go through Supabase Edge Function
  return undefined;
}

function getGroqModel(): string {
  return (import.meta.env.VITE_GROQ_MODEL as string) || 'llama-3.1-8b-instant';
}

function getAssistantId(): string | undefined {
  return import.meta.env.VITE_VAPI_ASSISTANT_ID as string | undefined;
}

function getVapiPublicKey(): string | undefined {
  return import.meta.env.VITE_VAPI_PUBLIC_KEY as string | undefined;
}

// Groq AI chat completion (now uses Edge Function)
async function groqChat(messages: ChatMessage[], mode: 'public' | 'private' = 'private'): Promise<string> {
  // All Groq calls now go through Supabase Edge Function
  const simpleMessages = messages.map(({ role, content }) => ({
    role: role as any,
    content
  }));

  // Get appropriate tools based on mode
  const tools = getToolsForMode(mode);

  // Use mode-specific system prompt
  const systemPrompt = mode === 'public'
    ? `You are a helpful medical assistant for Serenity Royale Hospital.

Your role:
- Provide general health information and help patients with basic inquiries
- Help patients book appointments using the book_appointment_with_confirmation tool
- Be friendly, professional, and HIPAA-compliant

When booking appointments:
1. Collect: name, email, phone, preferred date, time, and reason
2. Use the book_appointment_with_confirmation tool to book and send confirmation email
3. Confirm with patient that they will receive an email confirmation

For specific medical advice or to access patient records, patients should contact the hospital directly or speak with their healthcare provider.`
    : `You are an AI Business Assistant for Serenity Royale Hospital administration.

Your role is to help the business owner/admin with:
- 📊 Analytics & Insights: View hospital statistics, conversation trends, appointment data
- 📅 Operations Management: Monitor daily activities, track patient engagement
- 🤖 AI Agent Management: Provide insights on AI performance and patient interactions
- 📧 Communication: Send notifications, emails, and manage automated workflows
- 💡 Business Intelligence: Answer questions about operations, suggest improvements

Available Tools:
1. get_stats - View real-time hospital statistics (conversations, messages, calls, appointments)
2. trigger_automation - Execute automated workflows (emails, notifications, reports)

Guidelines:
- Be proactive and suggest relevant insights based on data
- Always ask for confirmation before triggering sensitive actions
- Focus on business outcomes and operational efficiency
- Maintain HIPAA compliance in all communications
- Provide actionable recommendations when possible

You are here to make the admin's job easier by providing quick access to data and automations.`;

  return await chatWithTools(simpleMessages, undefined, tools, systemPrompt);
}

// Groq AI with tool-calling support (now uses Edge Function)
async function groqChatWithTools(
  messages: ChatMessage[],
  onToolCall?: (toolName: string, args: any) => Promise<boolean>,
  mode: 'public' | 'private' = 'private'
): Promise<string> {
  // Convert to format expected by chatWithTools
  const simpleMessages = messages.map(({ role, content }) => ({
    role: role as any,
    content
  }));

  // Get appropriate tools based on mode
  const tools = getToolsForMode(mode);

  // Use mode-specific system prompt
  const systemPrompt = mode === 'public'
    ? `You are a helpful medical assistant for Serenity Royale Hospital.

Your role:
- Provide general health information and help patients with basic inquiries
- Help patients book appointments using the book_appointment_with_confirmation tool
- Be friendly, professional, and HIPAA-compliant

When booking appointments:
1. Collect: name, email, phone, preferred date, time, and reason
2. Use the book_appointment_with_confirmation tool to book and send confirmation email
3. Confirm with patient that they will receive an email confirmation

For specific medical advice or to access patient records, patients should contact the hospital directly or speak with their healthcare provider.`
    : `You are an AI Business Assistant for Serenity Royale Hospital administration.

Your role is to help the business owner/admin with:
- 📊 Analytics & Insights: View hospital statistics, conversation trends, appointment data
- 📅 Operations Management: Monitor daily activities, track patient engagement
- 🤖 AI Agent Management: Provide insights on AI performance and patient interactions
- 📧 Communication: Send notifications, emails, and manage automated workflows
- 💡 Business Intelligence: Answer questions about operations, suggest improvements

Available Tools:
1. get_stats - View real-time hospital statistics (conversations, messages, calls, appointments)
2. trigger_automation - Execute automated workflows including:
   - Book appointments: action="book_appointment", payload={name, email, phone, date, time, reason}
   - Reschedule: action="reschedule_appointment", payload={name, email, date, time, previousDate, previousTime, reason}
   - Cancel: action="cancel_appointment", payload={name, email, date, time}
   - Send follow-up: action="send_followup", payload={name, email, message}

How to Book/Manage Appointments:
When admin asks to book an appointment, use trigger_automation with:
- action: "book_appointment"
- payload: {
    patientName: "Full Name",
    patientEmail: "email@example.com",
    patientPhone: "+1234567890",
    appointmentDate: "January 15th, 2025",
    appointmentTime: "10:00 AM",
    appointmentReason: "Reason for visit",
    actionType: "create"
  }

Guidelines:
- Be proactive and suggest relevant insights based on data
- Always confirm appointment details before booking
- For appointment actions, collect ALL required information first
- Focus on business outcomes and operational efficiency
- Maintain HIPAA compliance in all communications

You are here to make the admin's job easier by providing quick access to data and automations.`;

  return await chatWithTools(simpleMessages, onToolCall, tools, systemPrompt);
}

interface ChatWidgetProps {
  mode?: 'public' | 'private';
  showWelcomeMessage?: boolean;
  initialOpen?: boolean;
}

export default function ChatWidget({
  mode: widgetMode = 'private',
  showWelcomeMessage = true,
  initialOpen = false,
  disableVoice = false // New prop to disable voice mode (for admin dashboard)
}: ChatWidgetProps & { disableVoice?: boolean } = {}) {
  const [open, setOpen] = useState(initialOpen);
  const [mode, setMode] = useState<ChatMode>('text');
  const [messages, setMessages] = useState<ChatMessage[]>(
    showWelcomeMessage
      ? [{
          role: 'assistant',
          content: widgetMode === 'public'
            ? 'Hi! How can I help you today?'
            : '👋 Hi! I\'m your AI Business Assistant. I can help you with:\n\n📊 View hospital statistics\n📅 Book/manage appointments for patients\n📧 Send confirmation emails & notifications\n💡 Get operational insights\n\nTry: "Book an appointment for [patient name] at [email] for [date] at [time]"',
          from: 'ai',
          timestamp: new Date()
        }]
      : []
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    status: 'idle',
    transcript: []
  });
  const [appointmentData, setAppointmentData] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    date?: string;
    time?: string;
    reason?: string;
  }>({});

  const endRef = useRef<HTMLDivElement | null>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const conversationStartTime = useRef<number>(Date.now());

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, voiceStatus.transcript]);

  // Initialize VAPI client
  useEffect(() => {
    const publicKey = getVapiPublicKey();
    if (!publicKey) {
      console.warn('VITE_VAPI_PUBLIC_KEY not configured');
      return;
    }

    if (!vapiRef.current) {
      vapiRef.current = new Vapi(publicKey);

      // VAPI event listeners
      vapiRef.current.on('call-start', () => {
        console.log('[VAPI] Call started');
        setVoiceStatus({ status: 'active', transcript: [] });
      });

      vapiRef.current.on('call-end', () => {
        console.log('[VAPI] Call ended');
        setVoiceStatus((prev) => ({ ...prev, status: 'ended' }));
      });

      vapiRef.current.on('speech-start', () => {
        console.log('[VAPI] User started speaking');
      });

      vapiRef.current.on('speech-end', () => {
        console.log('[VAPI] User stopped speaking');
      });

      vapiRef.current.on('message', (message: any) => {
        console.log('[VAPI] Message:', message);

        // Handle transcript updates
        if (message.type === 'transcript' && message.transcript) {
          const speaker = message.role === 'user' ? 'Patient' : 'AI';
          const transcriptLine = `${speaker}: ${message.transcript}`;

          setVoiceStatus((prev) => ({
            ...prev,
            transcript: [...prev.transcript, transcriptLine]
          }));

          // Persist transcript to Supabase
          if (conversationId && isSupabaseConfigured()) {
            persistMessage(
              message.role === 'user' ? 'patient' : 'ai',
              message.transcript,
              conversationId
            ).catch(console.error);
          }
        }
      });

      vapiRef.current.on('error', (error: any) => {
        console.error('[VAPI] Error:', error);
        setVoiceStatus({
          status: 'error',
          transcript: [],
          error: error?.message || 'Voice call failed'
        });
      });
    }

    return () => {
      // Cleanup on unmount
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [conversationId]);

  // Create conversation on widget open
  useEffect(() => {
    if (open && !conversationId) {
      createConversation().catch(console.error);
    }
  }, [open, conversationId]);

  // Setup Supabase Realtime subscription
  useEffect(() => {
    if (!conversationId || !isSupabaseConfigured()) return;

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('[Supabase] New message:', payload);
          const newMsg = payload.new as any;

          // Only add to UI if it's from staff (patient/ai already added locally)
          if (newMsg.from_type === 'staff') {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: newMsg.body,
                from: 'staff'
              }
            ]);
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  const supabaseConfigured = isSupabaseConfigured();
  // Groq is now handled via Supabase Edge Function - available if Supabase is configured
  const canUseClientGroq = supabaseConfigured;
  const canUseVapi = !!getAssistantId() && !!getVapiPublicKey();

  // Create new conversation
  async function createConversation() {
    if (!supabaseConfigured) {
      console.error('[ChatWidget] Supabase not configured');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Database not configured. Please set up Supabase. See SUPABASE_MIGRATION.md for instructions.',
          from: 'ai'
        }
      ]);
      return;
    }

    try {
      const insertData: Database['public']['Tables']['conversations']['Insert'] = {
        channel: 'webchat',
        patient_ref: `patient-${Date.now()}`, // In production, use authenticated patient ID
        status: 'open'
      };
      const { data, error } = await supabase
        // @ts-expect-error - Supabase type inference issue with placeholder URLs
        .from('conversations')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // @ts-expect-error - Supabase type inference issue with placeholder URLs
      setConversationId(data.id);
      console.log('[ChatWidget] Conversation created:', data.id);
    } catch (error: any) {
      console.error('[ChatWidget] Create conversation error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error creating conversation: ${error.message}. Check Supabase configuration.`,
          from: 'ai'
        }
      ]);
    }
  }

  // Persist message to Supabase
  async function persistMessage(from: MessageFrom, body: string, convId: string) {
    if (!supabaseConfigured) {
      console.warn('[ChatWidget] Supabase not configured, skipping message persistence');
      return;
    }

    try {
      const insertData: Database['public']['Tables']['messages']['Insert'] = {
        conversation_id: convId,
        from_type: from,
        body: body,
        media_url: null
      };
      // @ts-expect-error - Supabase type inference issue with placeholder URLs
      const { error } = await supabase.from('messages').insert(insertData);

      if (error) throw error;

      console.log(`[ChatWidget] Message persisted: ${from}`);
    } catch (error: any) {
      console.error('[ChatWidget] Persist message error:', error);
    }
  }

  // Detect appointment intent from message
  function detectAppointmentIntent(text: string): boolean {
    const lowerText = text.toLowerCase();
    const appointmentKeywords = [
      'appointment',
      'book',
      'schedule',
      'visit',
      'consultation',
      'see doctor',
      'meet',
      'available',
      'when can i'
    ];
    return appointmentKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Extract appointment details from conversation
  function extractAppointmentDetails(messages: ChatMessage[]): {
    date?: string;
    time?: string;
    reason?: string;
  } {
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    const details: { date?: string; time?: string; reason?: string } = {};

    // Extract date patterns (e.g., "tomorrow", "next Monday", "December 10")
    const datePatterns = [
      /tomorrow/i,
      /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
      /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/i
    ];

    for (const pattern of datePatterns) {
      const match = allText.match(pattern);
      if (match) {
        details.date = match[0];
        break;
      }
    }

    // Extract time patterns
    const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/;
    const timeMatch = allText.match(timePattern);
    if (timeMatch) {
      details.time = timeMatch[0];
    }

    // Extract reason
    const reasonPatterns = [
      /(?:for|because|regarding|about)\s+([^.!?]+)/i,
      /(?:checkup|consultation|follow-up|emergency|pain|issue)/i
    ];

    for (const pattern of reasonPatterns) {
      const match = allText.match(pattern);
      if (match) {
        details.reason = match[0];
        break;
      }
    }

    return details;
  }

  // Test tool execution (returns explicit ok: true/false)
  async function testTools() {
    console.log('🧪 Testing tool execution...');

    // Test 1: get_stats
    const statsTest = await testToolExecution('get_stats', { metric: 'all' });
    console.log('📊 Stats Test:', statsTest.ok ? '✅ OK' : '❌ FAILED', statsTest);

    // Test 2: Display results in chat
    const testMsg: ChatMessage = {
      role: 'assistant',
      content: statsTest.ok
        ? `✅ Tool test PASSED!\n\nStats retrieved: ${JSON.stringify(statsTest.data, null, 2)}`
        : `❌ Tool test FAILED: ${statsTest.error}`,
      from: 'ai'
    };
    setMessages((prev) => [...prev, testMsg]);

    return statsTest.ok;
  }

  // Handle quick action selection
  function handleQuickAction(prompt: string) {
    setInput(prompt);
    // Auto-send after a short delay to show the prompt in the input
    setTimeout(() => handleSend(), 100);
  }

  // Handle text message send
  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    if (!conversationId) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Creating conversation, please wait...',
          from: 'ai',
          timestamp: new Date()
        }
      ]);
      await createConversation();
      return;
    }

    setInput('');
    setSending(true);
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      from: 'patient',
      status: 'sending',
      timestamp: new Date()
    };
    const next = [...messages, userMsg];
    setMessages(next);

    // Update message status to 'sent' after short delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m === userMsg ? { ...m, status: 'sent' as MessageStatus } : m
        )
      );
    }, 300);

    // Persist user message
    if (supabaseConfigured) {
      await persistMessage('patient', text, conversationId);
      // Update to 'delivered' after persistence
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m === userMsg ? { ...m, status: 'delivered' as MessageStatus } : m
          )
        );
      }, 600);
    }

    try {
      // Show typing indicator
      setIsTyping(true);

      // Groq is now handled via Supabase Edge Function - always available if Supabase is configured
      if (!supabaseConfigured) {
        setIsTyping(false);
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: 'Error: Supabase not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
          from: 'ai',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      } else {
        // Use tool-calling version with confirmation for sensitive actions
        // SECURITY: Pass widgetMode to enforce tool restrictions
        const reply = await groqChatWithTools(next, async (toolName, args) => {
          // Ask for confirmation for sensitive automation triggers
          if (toolName === 'trigger_automation') {
            const action = args.action;
            const confirmMsg = `The AI wants to ${action}. Allow this action?`;
            return window.confirm(confirmMsg);
          }
          return true; // Auto-approve read-only tools like get_stats
        }, widgetMode);

        // Hide typing indicator
        setIsTyping(false);

        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: reply,
          from: 'ai',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (supabaseConfigured) {
          await persistMessage('ai', reply, conversationId);
        }

        // Trigger n8n workflows after every 3rd message
        const allMessages = [...next, aiMsg];
        if (allMessages.length >= 3 && allMessages.length % 3 === 0) {
          const messageHistory = allMessages.map(m => ({ role: m.role, content: m.content }));
          triggerLeadCapture(
            conversationId,
            `patient-${conversationId?.slice(0, 8)}`,
            'webchat',
            messageHistory
          ).catch(console.error);
        }

        // Check for appointment intent
        const hasAppointmentIntent = detectAppointmentIntent(text) || detectAppointmentIntent(reply);

        if (hasAppointmentIntent) {
          console.log('🗓️  Appointment intent detected!');

          // Extract appointment details from conversation
          const appointmentDetails = extractAppointmentDetails(allMessages);

          // Check if we have contact info in appointmentData state
          const hasContactInfo = appointmentData.email || appointmentData.phone || appointmentData.name;

          // If we don't have contact info, ask for it
          if (!hasContactInfo && !appointmentData.email) {
            const contactMsg: ChatMessage = {
              role: 'assistant',
              content: 'Great! To book your appointment, I\'ll need your email address and phone number. Could you please provide them?',
              from: 'ai',
              timestamp: new Date()
            };
            setMessages((prev) => [...prev, contactMsg]);
            if (supabaseConfigured) {
              await persistMessage('ai', contactMsg.content, conversationId);
            }
          } else {
            // We have contact info, trigger the appointment booking workflow
            console.log('📧 Triggering appointment booking with n8n...');

            await triggerAppointmentBooking(
              conversationId,
              `patient-${conversationId?.slice(0, 8)}`,
              appointmentDetails.date,
              appointmentDetails.time,
              appointmentDetails.reason,
              appointmentData.email,
              appointmentData.phone,
              appointmentData.name
            ).catch(console.error);

            const confirmMsg: ChatMessage = {
              role: 'assistant',
              content: `✅ Your appointment request has been submitted${appointmentData.email ? ` to ${appointmentData.email}` : ''}! You should receive a confirmation email shortly. Our staff will contact you within 24 hours to confirm the exact time slot.`,
              from: 'ai',
              timestamp: new Date()
            };
            setMessages((prev) => [...prev, confirmMsg]);
            if (supabaseConfigured) {
              await persistMessage('ai', confirmMsg.content, conversationId);
            }
          }
        }

        // Check for contact info in message (email/phone patterns)
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\+\d{1,3}\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}\b/;

        const emailMatch = text.match(emailPattern);
        const phoneMatch = text.match(phonePattern);

        if (emailMatch || phoneMatch) {
          setAppointmentData(prev => ({
            ...prev,
            email: emailMatch ? emailMatch[0] : prev.email,
            phone: phoneMatch ? phoneMatch[0] : prev.phone
          }));
          console.log('📝 Contact info captured:', { email: emailMatch?.[0], phone: phoneMatch?.[0] });
        }

        // Check for negative sentiment and trigger alert
        const replyLower = reply.toLowerCase();
        const textLower = text.toLowerCase();
        const negativeKeywords = ['angry', 'frustrated', 'terrible', 'worst', 'upset'];
        const hasNegativeSentiment = negativeKeywords.some(kw => textLower.includes(kw));

        if (hasNegativeSentiment) {
          triggerSentimentAlert(
            conversationId,
            `patient-${conversationId?.slice(0, 8)}`,
            'negative',
            allMessages.map(m => ({ role: m.role, content: m.content }))
          ).catch(console.error);
        }
      }
    } catch (e: any) {
      setIsTyping(false);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Error: ${e?.message || 'Unknown error'}`,
        from: 'ai',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);

      // Update user message to error status
      setMessages((prev) =>
        prev.map((m) =>
          m === userMsg ? { ...m, status: 'error' as MessageStatus } : m
        )
      );
    } finally {
      setSending(false);
    }
  }

  // Start VAPI Web voice call
  async function startVoiceCall() {
    const assistantId = getAssistantId();
    if (!assistantId || !vapiRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Voice mode not configured. Check VITE_VAPI_ASSISTANT_ID and VITE_VAPI_PUBLIC_KEY.',
          from: 'ai'
        }
      ]);
      return;
    }

    if (!conversationId) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Creating conversation...', from: 'ai' }
      ]);
      await createConversation();
      return;
    }

    try {
      setVoiceStatus({ status: 'connecting', transcript: [] });

      // Start VAPI Web call (WebRTC, not phone call)
      await vapiRef.current.start(assistantId);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Voice call started. Speak now!', from: 'ai' }
      ]);
    } catch (e: any) {
      console.error('[VAPI] Start error:', e);
      setVoiceStatus({
        status: 'error',
        transcript: [],
        error: e?.message || 'Failed to start voice call'
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Voice error: ${e?.message}`, from: 'ai' }
      ]);
    }
  }

  // End VAPI voice call
  function endVoiceCall() {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setVoiceStatus((prev) => ({ ...prev, status: 'ended' }));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Voice call ended.', from: 'ai' }
      ]);
    }
  }

  // Toggle chat mode
  function toggleMode() {
    if (mode === 'text') {
      setMode('voice');
    } else {
      if (voiceStatus.status === 'active') {
        endVoiceCall();
      }
      setMode('text');
    }
  }

  return (
    <div>
      {/* Toggle button */}
      <button
        className="fixed bottom-4 right-4 bg-healthcare-primary dark:bg-healthcare-accent text-white px-4 py-3 rounded-full shadow-lg hover:bg-healthcare-accent dark:hover:bg-healthcare-primary transition-all z-50 flex items-center gap-2 group"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-widget"
      >
        {open ? (
          <>
            <X className="w-5 h-5" />
            <span>Close</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Chat</span>
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          id="chat-widget"
          className="fixed bottom-20 right-4 w-96 max-h-[70vh] bg-white dark:bg-healthcare-dark-bg-elevated border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl flex flex-col z-40 animate-slideInFromRight"
        >
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-healthcare-primary dark:bg-healthcare-dark-bg-secondary text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Serenity" className="w-8 h-8 rounded-md" />
              <div className="flex flex-col">
                <span className="font-semibold">Serenity Assistant</span>
                <span className="text-xs opacity-90 flex items-center gap-1">
                  {mode === 'text' ? (
                    <>
                      <MessageCircle className="w-3 h-3" /> Text Chat
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3" /> Voice Mode
                    </>
                  )}
                </span>
              </div>
              {!supabaseConfigured && (
                <span className="text-xs bg-red-500 px-2 py-0.5 rounded">DB Not Configured</span>
              )}
            </div>
            {!disableVoice && (
              <button
                className="px-2 py-1 bg-white dark:bg-gray-700 text-healthcare-primary dark:text-healthcare-accent text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center gap-1"
                onClick={toggleMode}
                disabled={voiceStatus.status === 'active' || voiceStatus.status === 'connecting'}
                title={mode === 'text' ? 'Switch to Voice' : 'Switch to Text'}
              >
                {mode === 'text' ? (
                  <>
                    <Mic className="w-3 h-3" /> Voice
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-3 h-3" /> Text
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Actions - only show when no messages except welcome */}
          {messages.length <= 1 && mode === 'text' && <QuickActions onSelect={handleQuickAction} />}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-healthcare-dark-bg-primary">
            {/* Show skeleton when loading conversation */}
            {isLoading && <ChatSkeleton />}

            {!isLoading && messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    'inline-block rounded-lg px-3 py-2 max-w-[80%] shadow-sm animate-slideIn ' +
                    (m.role === 'user'
                      ? 'bg-healthcare-primary dark:bg-healthcare-accent text-white'
                      : 'bg-white dark:bg-healthcare-dark-bg-secondary text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700')
                  }
                >
                  <div className="text-xs opacity-70 mb-1 flex items-center justify-between gap-2">
                    <span>{m.from === 'patient' ? 'You' : m.from === 'ai' ? 'AI' : 'Staff'}</span>
                    {m.timestamp && (
                      <span className="text-[10px]">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.role === 'user' && m.status && (
                    <div className="flex justify-end mt-1">
                      <MessageStatusIcon status={m.status} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}

            {/* Voice transcript display */}
            {mode === 'voice' && voiceStatus.transcript.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <div className="text-xs font-semibold text-gray-600 mb-1">Live Transcript:</div>
                <div className="bg-yellow-50 p-2 rounded text-xs space-y-1">
                  {voiceStatus.transcript.slice(-5).map((line, i) => (
                    <div key={i} className="text-gray-700">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voice status indicator */}
            {mode === 'voice' && (
              <div className="flex items-center justify-center">
                {voiceStatus.status === 'connecting' && (
                  <span className="text-sm text-blue-600 animate-pulse">Connecting...</span>
                )}
                {voiceStatus.status === 'active' && (
                  <span className="text-sm text-green-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Voice call active
                  </span>
                )}
                {voiceStatus.status === 'error' && (
                  <span className="text-sm text-red-600">Error: {voiceStatus.error}</span>
                )}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input area */}
          {mode === 'text' ? (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-healthcare-dark-bg-elevated rounded-b-lg">
              <div className="flex gap-2">
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded-lg flex-1 px-3 py-2 text-sm bg-white dark:bg-healthcare-dark-bg-secondary text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-healthcare-primary dark:focus:ring-healthcare-accent transition-all"
                  placeholder={canUseClientGroq ? 'Type a message…' : 'Configure Supabase'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={sending}
                  aria-label="Chat message input"
                />
                <button
                  className="px-4 py-2 bg-healthcare-primary dark:bg-healthcare-accent text-white rounded-lg hover:bg-healthcare-accent dark:hover:bg-healthcare-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center gap-2 shadow-sm"
                  onClick={handleSend}
                  disabled={sending || !canUseClientGroq || !input.trim()}
                  aria-label="Send message"
                  title="Send message (Enter)"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-healthcare-dark-bg-elevated rounded-b-lg flex gap-2">
              {voiceStatus.status === 'idle' ||
              voiceStatus.status === 'ended' ||
              voiceStatus.status === 'error' ? (
                <button
                  className="w-full px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all font-medium flex items-center justify-center gap-2"
                  onClick={startVoiceCall}
                  disabled={!canUseVapi}
                  aria-label="Start voice call"
                >
                  <Mic className="w-5 h-5" /> Start Voice Call
                </button>
              ) : (
                <button
                  className="w-full px-4 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all font-medium flex items-center justify-center gap-2"
                  onClick={endVoiceCall}
                  disabled={voiceStatus.status === 'connecting'}
                  aria-label="End voice call"
                >
                  <X className="w-5 h-5" /> End Call
                </button>
              )}
            </div>
          )}

          {/* Footer info */}
          <div className="px-3 py-1 bg-gray-100 dark:bg-healthcare-dark-bg-secondary text-xs text-gray-500 dark:text-gray-400 text-center rounded-b-lg border-t border-gray-200 dark:border-gray-700">
            {conversationId ? (
              <>
                Session: {conversationId.slice(0, 8)}...
                {supabaseConfigured && (
                  <span className="ml-2 text-green-600 dark:text-green-400">✓ Connected</span>
                )}
              </>
            ) : (
              'Loading...'
            )}
          </div>
        </div>
      )}
    </div>
  );
}
