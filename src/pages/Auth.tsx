import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthContext';
import { LogIn, UserPlus, Github, Mail, Lock, User, ArrowRight, Loader2, Lightbulb, Users, DollarSign } from 'lucide-react';
import { ASSETS } from '../constants/assets';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'memberId' | 'email'>('memberId');
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'innovator' | 'mentor' | 'admin'>('innovator');
  const [educationalLevel, setEducationalLevel] = useState<'junior' | 'intermediate' | 'senior' | 'tertiary' | 'teacher'>('junior');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const [courseFee, setCourseFee] = useState({ amount: 15, currency: 'USD', message: 'To continue after your trial, the platform subscription and Virtual Training sessions cost USD$15.' });
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'course_fee')
        .single();
      
      if (data?.value) {
        setCourseFee(data.value);
      }
    };
    fetchSettings();
  }, []);

  if (isAuthReady && user) {
    return <Navigate to="/" />;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        let loginEmail = email;
        
        if (loginMethod === 'memberId') {
          // 1. Look up email by Member ID
          const { data: profileData, error: lookupError } = await supabase
            .from('profiles')
            .select('email, registration_paid')
            .eq('member_id', memberId)
            .single();

          if (lookupError || !profileData) {
            throw new Error('Invalid Member ID. Please check and try again or use Email Login.');
          }
          
          if (!profileData.registration_paid) {
            throw new Error('Your account is not yet activated. Please contact an administrator after making your payment.');
          }
          
          loginEmail = profileData.email;
        }

        // 2. Sign in with the email
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email: loginEmail, 
          password 
        });
        
        if (signInError) throw signInError;

        // 3. Check if account is activated (for email login)
        if (loginMethod === 'email' && signInData.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('registration_paid, role')
            .eq('id', signInData.user.id)
            .single();
          
          const isAdminRole = profileData?.role === 'admin';
          
          if (profileData && !profileData.registration_paid && !isAdminRole) {
            await supabase.auth.signOut();
            throw new Error('Your account is not yet activated. Please contact an administrator after making your payment.');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              role: role,
            },
          },
        });
        if (error) throw error;
        
        if (data.user) {
          const generatedMemberId = `YARIA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            display_name: displayName,
            email: email,
            role: role,
            member_id: generatedMemberId,
            educational_level: educationalLevel,
            registration_paid: role === 'admin', // Admin role defaults to paid (DB will revert if unauthorized)
            trial_ends_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'id' });
          
          if (profileError) {
            console.error('Profile setup error:', profileError);
          } else {
            setShowSuccessModal(true);
            return; // Don't navigate yet, show modal
          }
        }
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = async () => {
    if (confirm('This will clear all local session data and log you out. Continue?')) {
      localStorage.clear();
      sessionStorage.clear();
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Branding & Info */}
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <img src={ASSETS.AUTH_HERO_BG} alt="Background" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 overflow-hidden shadow-xl">
              {ASSETS.LOGO ? (
                <img src={ASSETS.LOGO} alt="YARIA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-3xl font-black tracking-tighter text-indigo-600">Y</span>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
              Empowering the next generation of <span className="text-indigo-200">African Innovators.</span>
            </h1>
            <p className="text-indigo-100 text-lg font-medium leading-relaxed opacity-90">
              Join YARIA to collaborate, share ideas, and find mentorship in robotics and tech.
            </p>
          </div>

          <div className="relative z-10 mt-12 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center backdrop-blur-sm">
                <Lightbulb className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <p className="font-bold text-white">Share Ideas</p>
                <p className="text-sm text-indigo-100 opacity-80">Collaborate with peers across the continent.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <p className="font-bold text-white">Find Mentors</p>
                <p className="text-sm text-indigo-100 opacity-80">Get guidance from industry experts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-10 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            {!isLogin && (
              <p className="text-sm text-slate-500 mt-2">
                After signing up, please contact an admin to pay and receive your Member ID.
              </p>
            )}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {isLogin ? (
                <div className="space-y-5">
                  <div className="flex items-center space-x-4 mb-2">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('memberId')}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border-2",
                        loginMethod === 'memberId' ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-100 text-slate-500"
                      )}
                    >
                      Member ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border-2",
                        loginMethod === 'email' ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-100 text-slate-500"
                      )}
                    >
                      Email
                    </button>
                  </div>

                  {loginMethod === 'memberId' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Member ID</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                          type="text"
                          required
                          value={memberId}
                          onChange={(e) => setMemberId(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium pl-12"
                          placeholder="YARIA-2024-0001"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium pl-12"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium pl-12"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium pl-12"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-medium pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">I am a...</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('innovator')}
                      className={cn(
                        "py-3 rounded-2xl font-bold text-xs transition-all border-2",
                        role === 'innovator' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200"
                      )}
                    >
                      Innovator
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('mentor')}
                      className={cn(
                        "py-3 rounded-2xl font-bold text-xs transition-all border-2",
                        role === 'mentor' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200"
                      )}
                    >
                      Mentor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={cn(
                        "py-3 rounded-2xl font-bold text-xs transition-all border-2",
                        role === 'admin' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200"
                      )}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Learning Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['junior', 'intermediate', 'senior', 'tertiary', 'teacher'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEducationalLevel(level)}
                        className={cn(
                          "py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2",
                          educationalLevel === level ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200"
                        )}
                      >
                        {level === 'junior' && 'Junior (Form 1-2)'}
                        {level === 'intermediate' && 'Intermediate (Form 3-4)'}
                        {level === 'senior' && 'Senior (Form 5-6)'}
                        {level === 'tertiary' && 'Tertiary'}
                        {level === 'teacher' && 'Teacher'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 py-4 rounded-2xl hover:bg-slate-50 hover:border-indigo-100 transition-all font-bold text-slate-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={handleResetSession}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mt-4"
            >
              Having trouble? Reset local session data
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Welcome to YARIA!</h3>
              <p className="text-slate-600 mb-6">
                You have been registered as a <span className="font-bold text-indigo-600 uppercase">{educationalLevel}</span>.
              </p>
              
              <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 mb-8">
                <div className="flex items-center justify-center space-x-2 text-amber-700 font-bold mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Platform Access & Training</span>
                </div>
                <p className="text-amber-600 text-sm font-medium mb-4">
                  {courseFee.message.includes(courseFee.amount.toString()) ? courseFee.message : `${courseFee.message} (Amount: ${courseFee.currency}$${courseFee.amount})`}
                </p>
                <div className="flex items-center justify-center space-x-2 text-amber-700 font-bold mb-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Free Trial Active</span>
                </div>
                <p className="text-amber-600 text-sm font-medium">
                  You have <span className="font-black">4 days</span> of free access to all features. 
                  After this period, you will need to subscribe to continue your journey.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Start Exploring
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
