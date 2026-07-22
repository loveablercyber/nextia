import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.info('[Nextia] Supabase disabled; using local PostgreSQL data paths.');
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://supabase-disabled.invalid',
  isSupabaseConfigured ? supabaseAnonKey : 'supabase-disabled',
  isSupabaseConfigured
    ? undefined
    : {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
);
