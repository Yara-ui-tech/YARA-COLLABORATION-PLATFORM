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

// Global listeners to cleanly catch background Supabase token refresh and lock errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = (typeof reason === 'string' ? reason : reason?.message || reason?.name || '') + '';

    if (
      msg.includes('Lock broken') ||
      msg.includes('steal') ||
      msg.includes('navigatorLock') ||
      msg.includes('AbortError') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Refresh Token Not Found') ||
      msg.includes('Invalid Refresh Token') ||
      msg.includes('refresh_token_not_found')
    ) {
      if (
        msg.includes('Refresh Token Not Found') ||
        msg.includes('Invalid Refresh Token') ||
        msg.includes('refresh_token_not_found')
      ) {
        console.warn('Stale Supabase session detected and cleared:', msg);
        clearStaleSupabaseAuth();
      } else {
        console.warn('Suppressed background lock/network warning:', msg);
      }
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (
      msg.includes('Lock broken by another request') ||
      msg.includes('Failed to fetch')
    ) {
      console.warn('Suppressed global window error:', msg);
      event.preventDefault();
    }
  });
}

// Resilient custom fetch that converts network dropouts/offline into graceful responses
const resilientFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (err: any) {
    const msg = err?.message || '';
    if (err?.name === 'AbortError' || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      console.warn('Supabase network connection notice:', msg);
      return new Response(
        JSON.stringify({
          error: 'Network connection issue or offline',
          message: msg || 'Failed to fetch',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    throw err;
  }
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Provide an in-process lock to prevent Web Locks API steal conflicts in iframes and strict mode
      lock: async (_name, _acquireTimeout, fn) => {
        return await fn();
      },
    },
    global: {
      fetch: resilientFetch,
    },
  }
);
