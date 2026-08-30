import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

let supabaseClient: SupabaseClient | null = null;

if (config.isSupabaseConfigured) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey || config.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log('[Supabase Client] Initialized successfully with remote endpoint:', config.supabaseUrl);
  } catch (err) {
    console.error('[Supabase Client Error] Failed to initialize client:', err);
  }
} else {
  console.log('[Supabase Client] Remote Supabase not configured. Using local prototype repository fallback.');
}

export const supabase = supabaseClient;
