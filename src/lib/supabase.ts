import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yyytinalsavikewukfxn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey && typeof window !== 'undefined') {
  console.warn(
    '[Nextia] Supabase Anon Key is missing. Auth and database features will use mock data.\n' +
    'Add VITE_SUPABASE_ANON_KEY to your .env file or Vercel Environment Variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
