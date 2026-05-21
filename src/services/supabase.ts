import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://shlxdjdopplnyxzpiclg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin que bypassa RLS usando a service role key.
// Usado apenas para escrita de dados de admin (updateUnit, etc).
// Se a service key não estiver configurada, usa o cliente padrão (pode falhar por RLS).
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : supabase;
