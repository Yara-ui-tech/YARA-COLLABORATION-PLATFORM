import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, clearStaleSupabaseAuth, safeSignOut } from '../lib/supabase';

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  member_id: string | null;
  bio?: string;
  skills?: string[];
  interests?: string[];
  role: 'innovator' | 'mentor' | 'admin' | 'teacher';
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
  signOut?: () => Promise<void>;
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
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const PROFILE_STORAGE_PREFIX = 'yaria_cached_profile_';

const isUserAdmin = (email?: string, userRole?: string): boolean => {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return (
    cleanEmail === 'manongwasimbarashe394@gmail.com' ||
    cleanEmail === 'goyaracorp@gmail.com' ||
    userRole === 'admin'
  );
};

const buildFallbackProfile = (authUser: User): UserProfile => {
  const isAdmin = isUserAdmin(authUser.email, authUser.user_metadata?.role);
  const rawRole = authUser.user_metadata?.role;
  const isTeacher = rawRole === 'teacher' || authUser.user_metadata?.tier === 'T1' || authUser.user_metadata?.educational_level === 'teacher';
  const resolvedRole: 'innovator' | 'mentor' | 'admin' | 'teacher' = isAdmin
    ? 'admin'
    : rawRole === 'mentor'
    ? 'mentor'
    : isTeacher
    ? 'teacher'
    : 'innovator';

  const defaultMemberId =
    authUser.user_metadata?.member_id ||
    `YARIA-${new Date().getFullYear()}-${authUser.id.substring(0, 4).toUpperCase()}`;

  const displayName =
    authUser.user_metadata?.display_name ||
    authUser.user_metadata?.full_name ||
    authUser.email?.split('@')[0] ||
    (isAdmin ? 'YARA Admin' : isTeacher ? 'Educator' : 'Innovator');

  return {
    id: authUser.id,
    display_name: displayName,
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '',
    member_id: defaultMemberId,
    bio: authUser.user_metadata?.bio || (isTeacher ? 'Passionate educator driving digital literacy and AI in schools.' : 'Passionate about robotics, electronics, and African innovation.'),
    skills: authUser.user_metadata?.skills || (isTeacher ? ['AI in Education', 'Curriculum Design', 'STEM Pedagogy'] : ['Robotics', 'MicroPython', 'Arduino']),
    interests: authUser.user_metadata?.interests || (isTeacher ? ['Generative AI', 'Classroom Automation', 'EdTech'] : ['Hardware Design', 'Automation']),
    role: resolvedRole,
    educational_level: isTeacher ? 'teacher' : (authUser.user_metadata?.educational_level || (isAdmin ? 'tertiary' : 'junior')),
    registration_paid: isAdmin || resolvedRole === 'mentor' || isTeacher,
    subscription_expires_at: new Date(
      Date.now() + (isAdmin ? 3650 : 365) * 24 * 60 * 60 * 1000
    ).toISOString(),
    trial_ends_at: new Date(
      Date.now() + (isAdmin ? 3650 : 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
    is_halted: false,
    created_at: authUser.created_at || new Date().toISOString(),
    rating: 5.0,
    mentored_count: 0,
    total_commission: 0,
    commission_rate: 0.1,
  };
};

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
    if (!profile) return false;
    if (profile.role === 'admin' || profile.role === 'mentor' || profile.role === 'teacher') return false;
    if (profile.registration_paid) return false;
    if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) return false;
    if (!profile.subscription_expires_at) return false;
    return new Date(profile.subscription_expires_at) < new Date();
  }, [profile]);

  const isTrialExpired = useMemo(() => {
    if (!profile) return false;
    if (profile.role === 'admin' || profile.role === 'mentor' || profile.role === 'teacher') return false;
    if (profile.registration_paid) return false;
    if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()) return false;
    if (!profile.trial_ends_at) return false;
    return new Date(profile.trial_ends_at) < new Date();
  }, [profile]);

  const isHalted = useMemo(() => {
    return !!profile?.is_halted;
  }, [profile]);

  const isAccountActive = useMemo(() => {
    if (!profile) return false;
    if (profile.role === 'admin' || profile.role === 'mentor' || profile.role === 'teacher') return true;
    if (profile.is_halted) return false;
    if (profile.registration_paid) return true;
    if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()) return true;
    if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) return true;
    if (isTrialExpired) return false;
    if (isSubscriptionExpired) return false;

    return true;
  }, [profile, isSubscriptionExpired, isTrialExpired]);

  // Helper to persist profile in localStorage
  const persistProfileLocally = (p: UserProfile) => {
    try {
      localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${p.id}`, JSON.stringify(p));
    } catch {
      // ignore
    }
  };

  // Helper to load profile from localStorage
  const getCachedProfile = (userId: string): UserProfile | null => {
    try {
      const stored = localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session check notice:', error.message);
          const isInvalidToken =
            error.message.includes('Refresh Token Not Found') ||
            error.message.includes('Invalid Refresh Token') ||
            error.message.includes('refresh_token_not_found') ||
            (error as any).status === 400;

          if (isInvalidToken) {
            safeSignOut();
          }
        }

        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            const cached = getCachedProfile(currentUser.id);
            const initialProfile = cached || buildFallbackProfile(currentUser);
            const isAdmin = isUserAdmin(currentUser.email, initialProfile.role);
            setProfile({
              ...initialProfile,
              role: isAdmin ? 'admin' : initialProfile.role
            });
          }
          setIsAuthReady(true);
          if (!currentUser) setLoading(false);
        }
      } catch (err: any) {
        console.warn('Authentication initialization warning:', err?.message || err);
        const isInvalidToken =
          err?.message?.includes('Refresh Token Not Found') ||
          err?.message?.includes('Invalid Refresh Token') ||
          err?.message?.includes('refresh_token_not_found');

        if (isInvalidToken) {
          safeSignOut();
        }

        if (mounted) {
          setUser(null);
          setProfile(null);
          setIsAuthReady(true);
          setLoading(false);
        }
      }
    };

    checkSession();

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (session?.user) {
        setUser(session.user);
        const cached = getCachedProfile(session.user.id);
        const initialProfile = cached || buildFallbackProfile(session.user);
        const isAdmin = isUserAdmin(session.user.email, initialProfile.role);
        setProfile({
          ...initialProfile,
          role: isAdmin ? 'admin' : initialProfile.role
        });
        setIsAuthReady(true);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let isSubscribed = true;

    const fetchProfile = async () => {
      const deviceId = getDeviceId();
      
      // Attempt to register session quietly in background without blocking
      supabase.from('user_sessions').upsert({
        user_id: user.id,
        device_id: deviceId,
        last_active: new Date().toISOString()
      }, { onConflict: 'user_id,device_id' }).then(() => {}).catch(() => {});

      let resolvedProfile: UserProfile | null = null;

      try {
        // Safe timeout promise to avoid infinite network delays
        const fetchPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        const timeoutPromise = new Promise<{ data: null; error: { message: string; code: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Profile fetch timeout', code: 'TIMEOUT' } }), 6000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        if (!error && data) {
          const isAdmin = isUserAdmin(user.email, data.role);
          resolvedProfile = {
            ...data,
            role: isAdmin ? 'admin' : data.role,
            registration_paid: isAdmin ? true : !!data.registration_paid
          } as UserProfile;
        } else if (error && (error as any).code === 'PGRST116') {
          // Profile not yet created in table, create it
          const fallback = buildFallbackProfile(user);
          try {
            const { data: newProfile } = await supabase
              .from('profiles')
              .upsert(fallback, { onConflict: 'id' })
              .select()
              .single();
            
            if (newProfile) {
              resolvedProfile = newProfile as UserProfile;
            } else {
              resolvedProfile = fallback;
            }
          } catch {
            resolvedProfile = fallback;
          }
        } else {
          // Supabase network, timeout, or schema error: use cache or fallback
          const cached = getCachedProfile(user.id);
          resolvedProfile = cached || buildFallbackProfile(user);
        }
      } catch {
        // Complete offline/network failure handling
        const cached = getCachedProfile(user.id);
        resolvedProfile = cached || buildFallbackProfile(user);
      }

      if (isSubscribed && resolvedProfile) {
        const isAdmin = isUserAdmin(user.email, resolvedProfile.role);
        const finalProfile = {
          ...resolvedProfile,
          role: isAdmin ? 'admin' : resolvedProfile.role,
          registration_paid: isAdmin ? true : !!resolvedProfile.registration_paid
        };
        setProfile(finalProfile);
        persistProfileLocally(finalProfile);
        setLoading(false);
      }
    };

    fetchProfile();

    // Real-time profile updates with safe error catching
    let profileChannel: any = null;
    try {
      profileChannel = supabase
        .channel(`profile:${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${user.id}` 
        }, (payload) => {
          if (payload.new && isSubscribed) {
            const isAdmin = isUserAdmin(user.email, (payload.new as any).role);
            const updated = {
              ...(payload.new as UserProfile),
              role: isAdmin ? 'admin' : (payload.new as any).role,
              registration_paid: isAdmin ? true : !!(payload.new as any).registration_paid
            };
            setProfile(updated);
            persistProfileLocally(updated);
          }
        })
        .subscribe();
    } catch {
      // Safe realtime fallback
    }

    return () => {
      isSubscribed = false;
      if (profileChannel) {
        try {
          supabase.removeChannel(profileChannel);
        } catch {
          // ignore
        }
      }
    };
  }, [user]);

  // allow on-demand refresh of the profile and cross-check subscriptions table
  const refreshProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      let currentProfile: UserProfile | null = data ? (data as UserProfile) : null;

      if (!currentProfile) {
        currentProfile = getCachedProfile(user.id) || buildFallbackProfile(user);
      }

      // Check subscriptions table if not admin or mentor
      if (currentProfile && !currentProfile.registration_paid && currentProfile.role !== 'admin' && currentProfile.role !== 'mentor') {
        try {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
            .order('created_at', { ascending: false })
            .limit(1);

          if (subData && subData.length > 0) {
            const sub = subData[0];
            if (sub.status === 'active' && new Date(sub.expires_at) > new Date()) {
              currentProfile = {
                ...currentProfile,
                registration_paid: true,
                subscription_expires_at: sub.expires_at
              };
              try {
                await supabase
                  .from('profiles')
                  .update({
                    registration_paid: true,
                    subscription_expires_at: sub.expires_at
                  })
                  .eq('id', user.id);
              } catch {
                // ignore
              }
            }
          }
        } catch {
          // ignore
        }
      }

      if (currentProfile) {
        const isAdmin = isUserAdmin(user.email, currentProfile.role);
        const finalProfile = {
          ...currentProfile,
          role: isAdmin ? 'admin' : currentProfile.role,
          registration_paid: isAdmin ? true : !!currentProfile.registration_paid
        };
        setProfile(finalProfile);
        persistProfileLocally(finalProfile);
      }
    } catch {
      // If network fails during refresh, retain existing state
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setLoading(false);
      await safeSignOut();
    } catch (err) {
      console.warn('Sign out handler notice:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
      clearStaleSupabaseAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, isAccountActive, isSubscriptionExpired, isTrialExpired, isHalted, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
