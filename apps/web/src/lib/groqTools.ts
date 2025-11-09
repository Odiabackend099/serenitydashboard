/**
 * Groq Tool-Calling Integration for Serenity Royale Hospital
 * 
 * AI Agent Rules:
 * - READ-ONLY database access via stats endpoints
 * - All "write" actions routed through n8n workflows
 * - Sensitive actions require UI confirmation
 * 
 * Security: All Groq API calls now go through Supabase Edge Function
 * to keep the API key secure on the backend.
 */

import { supabase } from './supabase';
import { logger } from './logger';

// Get Supabase URL for Edge Function
const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) throw new Error('VITE_SUPABASE_URL not configured');
  return url;
};

// Helper function to validate and parse JSON responses
async function validateJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    logger.error('Expected JSON but got:', text.substring(0, 200));
    throw new Error(`Server returned ${contentType || 'non-JSON'} response instead of JSON`);
  }

  try {
    return await response.json();
  } catch (error) {
    logger.error('Failed to parse JSON response:', error);
    throw new Error('Invalid JSON response from server');
  }
}

// ============================================
// TOOL DEFINITIONS
// ============================================

// ADMIN TOOLS - Full backend access (requires authentication)
export const adminTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_stats',
      description: 'Get real-time hospital statistics (conversations, messages, calls, appointments)',
      parameters: {
        type: 'object',
        properties: {
          metric: {
            type: 'string',
            enum: ['conversations_today', 'messages_today', 'calls_today', 'upcoming_appointments', 'all'],
            description: 'The statistic to retrieve',
          },
        },
        required: ['metric'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'trigger_automation',
      description: 'Trigger n8n workflow automation (requires confirmation for sensitive actions)',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['send_email', 'book_event', 'send_whatsapp', 'daily_summary', 'book_appointment', 'reschedule_appointment', 'cancel_appointment'],
            description: 'The automation action to trigger',
          },
          payload: {
            type: 'object',
            description: 'Action-specific parameters',
          },
        },
        required: ['action', 'payload'],
      },
    },
  },
];

// PUBLIC TOOLS - Safe tools for public users (appointment booking with email confirmation)
export const publicTools = [
  {
    type: 'function' as const,
    function: {
      name: 'book_appointment_with_confirmation',
      description: 'Book an appointment for a patient and send confirmation email. Use this after collecting appointment details.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Patient full name',
          },
          email: {
            type: 'string',
            description: 'Patient email address',
          },
          phone: {
            type: 'string',
            description: 'Patient phone number',
          },
          date: {
            type: 'string',
            description: 'Appointment date (e.g., "2024-01-15")',
          },
          time: {
            type: 'string',
            description: 'Appointment time (e.g., "2:30 PM")',
          },
          reason: {
            type: 'string',
            description: 'Reason for appointment',
          },
        },
        required: ['name', 'email', 'date', 'time'],
      },
    },
  },
];

// Legacy export for backward compatibility
export const tools = adminTools;

// Get tools based on mode (public vs authenticated)
export function getToolsForMode(mode: 'public' | 'private' = 'private'): any[] {
  return mode === 'public' ? publicTools : adminTools;
}

// ============================================
// TOOL IMPLEMENTATIONS
// ============================================

export async function getStats(metric: string): Promise<any> {
  // Route through assistant-call Edge Function for proper audit logging
  const supabaseUrl = getSupabaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/assistant-call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      tool_name: 'get_stats',
      args: { metric },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Stats request failed:', errorText);
    throw new Error(`Failed to get stats (${response.status}): ${errorText}`);
  }

  return await validateJsonResponse(response);
}

export async function triggerAutomation(action: string, payload: any): Promise<any> {
  // Route through assistant-call Edge Function which forwards to n8n
  const supabaseUrl = getSupabaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/assistant-call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      tool_name: action, // 'send_email', 'book_appointment', etc.
      args: payload,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Automation request failed:', errorText);
    throw new Error(`Automation failed (${response.status}): ${errorText}`);
  }

  return await validateJsonResponse(response);
}

export async function bookAppointmentWithConfirmation(
  name: string,
  email: string,
  phone: string,
  date: string,
  time: string,
  reason?: string
): Promise<any> {
  // Call n8n webhook directly for appointment booking + email confirmation
  const n8nWebhookBase = import.meta.env.VITE_N8N_WEBHOOK_BASE;
  if (!n8nWebhookBase) {
    throw new Error('N8N webhook not configured');
  }

  // Use the serenity-webhook-v2 endpoint (matches SIMPLIFIED_WORKING_WORKFLOW.json)
  const response = await fetch(`${n8nWebhookBase}/serenity-webhook-v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Primary fields for n8n workflow
      message: `Appointment booking request from ${name}`,
      userId: email,
      channel: 'web',
      intent: 'appointment',

      // Patient contact (both formats for compatibility)
      patientName: name,
      patientEmail: email,
      patientPhone: phone,
      patient_name: name,
      patient_email: email,
      patient_phone: phone,

      // Appointment details (both formats)
      appointmentDate: date,
      appointmentTime: time,
      appointmentReason: reason || 'General consultation',
      appointmentType: 'consultation',
      appointment_date: date,
      appointment_time: time,
      appointment_reason: reason || 'General consultation',
      appointment_type: 'consultation',

      // Legacy fields for backward compatibility
      name,
      email,
      phone,
      date,
      time,
      reason: reason || 'General consultation',

      // Metadata
      source: 'groq_text_chat',
      action: 'book_appointment_with_confirmation',
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Appointment booking failed:', errorText);
    throw new Error(`Appointment booking failed: ${errorText}`);
  }

  return await validateJsonResponse(response);
}

// ============================================
// TOOL VALIDATION & TESTING
// ============================================

/**
 * Test tool execution and return explicit success/failure status
 * Returns: { ok: true, data: any } or { ok: false, error: string }
 */
export async function testToolExecution(toolName: string, args: any): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    switch (toolName) {
      case 'get_stats': {
        const result = await getStats(args.metric);
        return { ok: true, data: result };
      }

      case 'trigger_automation': {
        const result = await triggerAutomation(args.action, args.payload);
        return { ok: true, data: result };
      }

      default:
        return { ok: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

// ============================================
// TOOL EXECUTION ROUTER
// ============================================

export async function executeTool(toolCall: any): Promise<string> {
  const { name, arguments: args } = toolCall.function;
  const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

  try {
    switch (name) {
      case 'get_stats':
        const stats = await getStats(parsedArgs.metric);
        return JSON.stringify({ success: true, data: stats });

      case 'trigger_automation':
        const result = await triggerAutomation(parsedArgs.action, parsedArgs.payload);
        return JSON.stringify({ success: true, data: result });

      case 'book_appointment_with_confirmation':
        const booking = await bookAppointmentWithConfirmation(
          parsedArgs.name,
          parsedArgs.email,
          parsedArgs.phone,
          parsedArgs.date,
          parsedArgs.time,
          parsedArgs.reason
        );
        return JSON.stringify({
          success: true,
          message: 'Appointment booked and confirmation email sent!',
          data: booking
        });

      default:
        return JSON.stringify({ success: false, error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ success: false, error: error.message });
  }
}

// ============================================
// MAIN CHAT COMPLETION WITH TOOL CALLING
// ============================================

export async function chatWithTools(
  messages: Array<{ role: string; content: string }>,
  onToolCall?: (toolName: string, args: any) => Promise<boolean>, // Return true to proceed, false to cancel
  toolsToUse: any[] = adminTools, // Tools to make available
  systemPromptOverride?: string // Optional custom system prompt
): Promise<string> {
  const defaultSystemPrompt = `You are a helpful medical assistant for Serenity Royale Hospital.
You can view statistics and trigger automations via approved tools.
Always be professional, HIPAA-compliant, and ask for confirmation before sensitive actions.
If asked about patient data you don't have access to, politely explain you can only view aggregate stats.`;

  const systemPrompt = {
    role: 'system',
    content: systemPromptOverride || defaultSystemPrompt,
  };

  let fullMessages = [systemPrompt, ...messages];
  let iterations = 0;
  const MAX_ITERATIONS = 5;
  const supabaseUrl = getSupabaseUrl();

  // Get auth token for Edge Function
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Call Groq via Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/groq-chat`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        messages: fullMessages,
        model: 'llama-3.1-8b-instant',
        tools: toolsToUse,
      tool_choice: toolsToUse.length > 0 ? 'auto' : 'none',
      temperature: 0.7,
      max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logger.error('Groq Edge Function error:', error);
      throw new Error(`Groq Edge Function error: ${response.status} ${error}`);
    }

    const completion = await validateJsonResponse(response);

    // Handle tool results from Edge Function
    if (completion.tool_results && completion.tool_results.length > 0) {
      const toolResults = completion.tool_results;

      // Validate tool execution success and check for user denials
      let allToolsSucceeded = true;
      for (const toolResult of toolResults) {
        const content = JSON.parse(toolResult.content);

        // Check if tool execution failed
        if (content.error) {
          logger.error(`Tool ${toolResult.name} failed:`, content.error);
          allToolsSucceeded = false;
        }

        // Check if tool was denied by user (special error code)
        if (content.error && content.error.includes('User denied')) {
          logger.log(`Tool ${toolResult.name} denied by user`);
          return "I understand you don't want to proceed with that action. Is there anything else I can help you with?";
        }
      }

      // Add assistant message + tool results to conversation
      const assistantMessage = completion.choices?.[0]?.message;
      if (assistantMessage) {
        fullMessages = [
          ...fullMessages,
          assistantMessage,
          ...toolResults,
        ];
      }

      // Continue loop to get final response
      continue;
    }

    const message = completion.choices?.[0]?.message;

    if (!message) {
      throw new Error('No response from Groq');
    }

    // Check if there are tool calls that need user confirmation BEFORE execution
    if (message.tool_calls && message.tool_calls.length > 0 && onToolCall) {
      // Check each tool call for user approval
      for (const toolCall of message.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

        // Ask for user confirmation
        const approved = await onToolCall(name, parsedArgs);

        if (!approved) {
          // User denied the action - return immediately without executing
          return "I understand you don't want to proceed with that action. Is there anything else I can help you with?";
        }
      }
      // If we get here, user approved all tool calls
      // Continue to add message and let Edge Function execute tools on next iteration
    }

    // If no tool calls, return the final response
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content || 'I apologize, I could not generate a response.';
    }

    // Tool calls were made and approved - Edge Function will execute them on next iteration
    // Add message to conversation and continue
    fullMessages = [
      ...fullMessages,
      message,
    ];
  }
  
  return 'I apologize, I reached the maximum number of tool calls. Please try rephrasing your request.';
}
