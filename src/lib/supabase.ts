import { createClient } from '@supabase/supabase-js';

// Using provided values as fallbacks if environment variables are not set
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://oeeyrcoogzymxgtanpew.supabase.co').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXlyY29vZ3p5bXhndGFucGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTE2NjgsImV4cCI6MjA5MDgyNzY2OH0.3K1iNXObMklqRlEb-laGjCQUnhXZmxBJ2pCGlSF6C5c';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
}

/**
 * Cleanly remove stale or corrupted Supabase auth tokens from localStorage
 */
export const clearStaleSupabaseAuth = () => {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase.auth') || key.startsWith('yaria_cached_profile_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  } catch (e) {
    console.warn('Failed to clear storage:', e);
  }
};

// Global listener to cleanly catch background Supabase token refresh errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || '';
    if (
      msg.includes('Refresh Token Not Found') ||
      msg.includes('Invalid Refresh Token') ||
      msg.includes('refresh_token_not_found')
    ) {
      console.warn('Stale Supabase session detected and cleared:', msg);
      clearStaleSupabaseAuth();
      event.preventDefault();
    }
  });
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

