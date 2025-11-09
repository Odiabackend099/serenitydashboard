import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase environment variables not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in apps/web/.env.local');
}
// Create Supabase client with error handling
let supabaseClient;
try {
    supabaseClient = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');
}
catch (error) {
    logger.error('Failed to create Supabase client:', error);
    // Fallback to placeholder client
    supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
}
export const supabase = supabaseClient;
// Helper to check if Supabase is configured
export function isSupabaseConfigured() {
    return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
}
