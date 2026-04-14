import { createClient } from '@supabase/supabase-js';

// Using provided values as fallbacks if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oeeyrcoogzymxgtanpew.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXlyY29vZ3p5bXhndGFucGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTE2NjgsImV4cCI6MjA5MDgyNzY2OH0.3K1iNXObMklqRlEb-laGjCQUnhXZmxBJ2pCGlSF6C5c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
