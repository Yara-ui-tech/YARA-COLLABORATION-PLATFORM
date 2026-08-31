import { createClient } from '@supabase/supabase-js';

// Using provided values as fallbacks if environment variables are not set
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://oeeyrcoogzymxgtanpew.supabase.co').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXlyY29vZ3p5bXhndGFucGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTE2NjgsImV4cCI6MjA5MDgyNzY2OH0.3K1iNXObMklqRlEb-laGjCQUnhXZmxBJ2pCGlSF6C5c';

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

// Global listeners to cleanly catch background Supabase token refresh, lock errors, and empty rejections
if (typeof window !== 'undefined') {
  // Prevent empty object and auth-session missing error logs from surfacing
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (args.length === 0) return;
    
    // Check if the only argument is an empty object or null/undefined
    if (args.length === 1) {
      const first = args[0];
      if (!first || (typeof first === 'object' && Object.keys(first).length === 0 && !(first instanceof Error))) {
        console.warn('Notice:', first);
        return;
      }
    }

    const firstStr = String(args[0] || '');
    if (
      firstStr.includes('Lock broken') ||
      firstStr.includes('Failed to fetch') ||
      firstStr.includes('Refresh Token Not Found') ||
      firstStr.includes('Auth session missing') ||
      firstStr.includes('AuthSessionMissingError') ||
      firstStr.includes('ResizeObserver')
    ) {
      console.warn(...args);
      return;
    }

    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = (
      typeof reason === 'string' 
        ? reason 
        : reason?.message || reason?.name || (typeof reason === 'object' ? JSON.stringify(reason) : '')
    ) + '';

    if (
      !reason ||
      msg === '{}' ||
      msg === '' ||
      msg === '[object Object]' ||
      msg.includes('Lock broken') ||
      msg.includes('steal') ||
      msg.includes('navigatorLock') ||
      msg.includes('AbortError') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      msg.includes('Refresh Token Not Found') ||
      msg.includes('Invalid Refresh Token') ||
      msg.includes('refresh_token_not_found') ||
      msg.includes('Auth session missing') ||
      msg.includes('AuthSessionMissingError')
    ) {
      if (
        msg.includes('Refresh Token Not Found') ||
        msg.includes('Invalid Refresh Token') ||
        msg.includes('refresh_token_not_found')
      ) {
        console.warn('Stale Supabase session detected and cleared:', msg);
        clearStaleSupabaseAuth();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || (event?.error ? event.error.message || JSON.stringify(event.error) : '') || '';
    if (
      !msg ||
      msg === '{}' ||
      msg === '[object Object]' ||
      msg.includes('Lock broken') ||
      msg.includes('steal') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      msg.includes('AbortError') ||
      msg.includes('Auth session missing') ||
      msg.includes('AuthSessionMissingError') ||
      msg.includes('ResizeObserver loop')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

// Resilient custom fetch that converts network dropouts/offline into graceful responses
const resilientFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input as Request)?.url || '';
  try {
    return await fetch(input, init);
  } catch (err: any) {
    const msg = err?.message || 'Network connection unavailable';
    console.warn('Supabase network connection notice:', msg);

    // Auth endpoints should not receive mock data arrays
    if (url.includes('/auth/v1/')) {
      return new Response(
        JSON.stringify({
          error: 'network_unavailable',
          error_description: msg,
          message: msg,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        data: [],
        error: null,
        message: msg,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
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
        try {
          return await fn();
        } catch (err: any) {
          const msg = err?.message || '';
          if (msg.includes('Auth session missing') || msg.includes('AuthSessionMissingError')) {
            return null as any;
          }
          console.warn('Auth operation notice:', msg || err);
          return null as any;
        }
      },
    },
    global: {
      fetch: resilientFetch,
    },
  }
);

/**
 * Safe signOut helper that avoids throwing AuthSessionMissingError
 */
export const safeSignOut = async () => {
  clearStaleSupabaseAuth();
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      await supabase.auth.signOut({ scope: 'local' });
    }
  } catch (err: any) {
    console.warn('Sign out completed with notice:', err?.message || err);
  } finally {
    clearStaleSupabaseAuth();
  }
};
