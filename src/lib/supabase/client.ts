import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gdqcjcogpymuwfivoeok.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TbnmvgWB1jz8VvwroR0IOA_UnOlajaR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('not found')) {
        return {
          connected: true,
          message: 'Connected to Supabase endpoint (Database tables need initialization).',
        };
      }
      return {
        connected: false,
        message: error.message,
      };
    }
    return {
      connected: true,
      message: 'Connected & synchronized with Supabase database.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Unable to connect to Supabase.',
    };
  }
}
