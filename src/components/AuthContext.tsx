import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  member_id: string | null;
  bio?: string;
  skills?: string[];
  interests?: string[];
  role: 'innovator' | 'mentor' | 'admin';
  educational_level?: 'junior' | 'intermediate' | 'senior' | 'tertiary' | 'teacher';
  registration_paid: boolean;
  subscription_expires_at: string;
  is_halted: boolean;
  trial_ends_at: string;
  created_at: string;
  
  // Mentor Stats
  rating: number;
  mentored_count: number;
  total_commission: number;
  commission_rate: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  isAccountActive: boolean;
  isSubscriptionExpired: boolean;
  isTrialExpired: boolean;
  isHalted: boolean;
  refreshProfile?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  isAccountActive: false,
  isSubscriptionExpired: false,
  isTrialExpired: false,
  isHalted: false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Device ID management
  const getDeviceId = () => {
    try {
      let id = localStorage.getItem('yaria_device_id');
      if (!id) {
        id = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('yaria_device_id', id);
      }
      return id;
    } catch (e) {
      console.warn('LocalStorage not available for device ID:', e);
      return 'fallback-device-id-' + Math.random().toString(36).substring(2);
    }
  };

  const isSubscriptionExpired = useMemo(() => {
    if (!profile?.subscription_expires_at) return false;
    return new Date(profile.subscription_expires_at) < new Date();
  }, [profile]);

  const isTrialExpired = useMemo(() => {
    if (!profile?.trial_ends_at || profile.registration_paid || profile.role === 'admin') return false;
    return new Date(profile.trial_ends_at) < new Date();
  }, [profile]);

  const isHalted = useMemo(() => {
    return !!profile?.is_halted || isTrialExpired;
  }, [profile, isTrialExpired]);

  const isAccountActive = useMemo(() => {
    if (!profile) return false;
    // Admins are always active
    if (profile.role === 'admin') return true;
    
    // Check for halt or expiry
    if (profile.is_halted) return false;
    if (isSubscriptionExpired) return false;
    if (isTrialExpired) return false;

    // Innovators need member_id
    return !!profile.member_id;
  }, [profile, isSubscriptionExpired, isTrialExpired]);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error.message);
        // If the refresh token is invalid, clear the session to stop the error loop
        if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
          supabase.auth.signOut();
        }
      }
      setUser(session?.user ?? null);
      setIsAuthReady(true);
      if (!session) setLoading(false);
    });

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const deviceId = getDeviceId();
        
        // Register/Update session (useful for analytics/security but no limit enforced)
        await supabase.from('user_sessions').upsert({
          user_id: user.id,
          device_id: deviceId,
          last_active: new Date().toISOString()
        }, { onConflict: 'user_id,device_id' });

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          if (error.code === 'PGRST116') {
            // Profile missing, create a default one
            const generatedMemberId = `YARIA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const isAdminEmail = user.email === 'manongwasimbarashe394@gmail.com' || user.email === 'goyaracorp@gmail.com';
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
                email: user.email,
                role: isAdminEmail ? 'admin' : 'innovator',
                member_id: user.user_metadata?.member_id || generatedMemberId,
                registration_paid: isAdminEmail, // Admins don't need to pay
                subscription_expires_at: new Date(Date.now() + (isAdminEmail ? 3650 : 30) * 24 * 60 * 60 * 1000).toISOString(),
                is_halted: false,
                trial_ends_at: new Date(Date.now() + (isAdminEmail ? 3650 : 4) * 24 * 60 * 60 * 1000).toISOString(),
              }, { onConflict: 'id' })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating default profile:', createError);
            } else {
              setProfile(newProfile as UserProfile);
            }
          }
        } else {
          // Hardcode override for state to reflect admin status for these specific emails
          const isAdminEmail = user.email === 'manongwasimbarashe394@gmail.com' || user.email === 'goyaracorp@gmail.com';
          const mergedProfile = {
            ...data,
            role: isAdminEmail ? 'admin' : data.role
          };
          setProfile(mergedProfile as UserProfile);
        }
        setLoading(false);
      };

      fetchProfile();

      // Real-time profile updates
      const profileSubscription = supabase
        .channel(`profile:${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${user.id}` 
        }, (payload) => {
          if (payload.new) {
            setProfile(payload.new as UserProfile);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(profileSubscription);
      };
    }
  }, [user]);

  // allow on-demand refresh of the profile
  const refreshProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && data) setProfile(data as UserProfile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, isAccountActive, isSubscriptionExpired, isTrialExpired, isHalted, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
