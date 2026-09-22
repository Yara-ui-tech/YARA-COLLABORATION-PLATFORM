import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://jrvkugzthnffsyrzvhqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impydmt1Z3p0aG5mZnN5cnp2aHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NTUzNDMsImV4cCI6MjA1NDQzMTM0M30.rYwK1Mv32c-R0n72g78y3hW3e8r_t9z8Y_x0Y0_Z0Y0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
