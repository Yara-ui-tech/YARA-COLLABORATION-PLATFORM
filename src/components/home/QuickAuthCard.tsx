import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, safeSignOut } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BookOpen,
  LogOut,
  IdCard
} from 'lucide-react';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';

interface QuickAuthCardProps {
  onGuestExplore?: () => void;
}

export default function QuickAuthCard({ onGuestExplore }: QuickAuthCardProps) {
  const navigate = useNavigate();
  const { user, profile, isAuthReady, signOut, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loginMethod, setLoginMethod] = useState<'email' | 'memberId'>('email');
  
  // Fields
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'innovator' | 'teacher'>('innovator');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already logged in, show authenticated quick launcher
  if (isAuthReady && user) {
    const isAdmin = profile?.role === 'admin' || user.email === 'manongwasimbarashe394@gmail.com' || user.email === 'goyaracorp@gmail.com';
    const isTeacher = profile?.role === 'teacher';

    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/20">
                {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Signed In
                  </span>
                  {profile?.member_id && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {profile.member_id}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white truncate max-w-[200px]">
                  {profile?.display_name || user.email}
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                if (signOut) signOut();
                else safeSignOut();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Type:</span>
              <span className="font-bold text-white capitalize">{profile?.role || 'Student Innovator'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Robotics Tier:</span>
              <span className="font-bold text-cyan-400">{(profile as any)?.tier || 'Tier 1 (Curious Beginner)'}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                if (isAdmin) navigate('/admin');
                else if (isTeacher) navigate('/educator-portal');
                else navigate('/dashboard');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 transition hover:scale-102 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enter LMS Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#lms"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('lms');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/learn');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer text-center"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Continue Learning Micro-Modules</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle Sign In & Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        let loginEmail = email.trim();

        if (loginMethod === 'memberId') {
          const cleanId = memberId.trim();
          if (!cleanId) throw new Error('Please enter your Member ID (e.g. YARA-2026-XXXX).');

          const { data: prof, error: lookupErr } = await supabase
            .from('profiles')
            .select('email, is_halted')
            .ilike('member_id', cleanId)
            .maybeSingle();

          if (lookupErr || !prof?.email) {
            throw new Error('Member ID not found. Please verify your ID or sign in with your email.');
          }
          if (prof.is_halted) {
            throw new Error('Your account has been temporarily halted by an administrator.');
          }
          loginEmail = prof.email;
        }

        if (!loginEmail) throw new Error('Please enter your email or Member ID.');
        if (!password) throw new Error('Please enter your password.');

        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password
        });

        if (signInErr) throw signInErr;

        if (signInData.user) {
          const uRole = signInData.user.user_metadata?.role;
          const uEmail = signInData.user.email?.toLowerCase();
          const isAdmin = uEmail === 'manongwasimbarashe394@gmail.com' || uEmail === 'goyaracorp@gmail.com' || uRole === 'admin';

          if (isAdmin) navigate('/admin');
          else if (uRole === 'teacher') navigate('/educator-portal');
          else navigate('/dashboard');
        }
      } else {
        // Sign Up
        const cleanEmail = email.trim().toLowerCase();
        if (!displayName.trim()) throw new Error('Please enter your full name.');
        if (!cleanEmail) throw new Error('Please enter your email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const generatedId = `YARA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              display_name: displayName.trim(),
              role,
              tier: role === 'teacher' ? 'T1' : 'T1',
              member_id: generatedId
            }
          }
        });

        if (signUpErr) throw signUpErr;

        if (signUpData.user) {
          try {
            await supabase.from('profiles').upsert({
              id: signUpData.user.id,
              display_name: displayName.trim(),
              email: cleanEmail,
              role,
              tier: 'T1',
              member_id: generatedId,
              is_halted: false
            }, { onConflict: 'id' });
          } catch (upsertErr) {
            console.warn('Profile sync warning:', upsertErr);
          }

          if (signUpData.session) {
            if (role === 'teacher') navigate('/educator-portal');
            else navigate('/dashboard');
          } else {
            setSuccessMsg('Account created successfully! Check your email to confirm, or sign in.');
            setMode('signin');
          }
        }
      }
    } catch (err: any) {
      console.warn('Auth error:', err);
      const msg = err?.message || 'Authentication failed. Please check credentials.';
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email, Member ID, or password.');
      } else if (msg.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.');
        setMode('signin');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-box" className="w-full max-w-md mx-auto p-6 sm:p-7 rounded-3xl bg-slate-900/95 border border-slate-800 hover:border-blue-500/40 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left transition-all">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        
        {/* Mode Selector Tabs (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to LMS</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join YARA Free</span>
          </button>
        </div>

        {/* Header Title */}
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>{mode === 'signin' ? 'Sign In to Your Learning Account' : 'Create Free Robotics Account'}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {mode === 'signin' 
              ? 'Access 42 micro-modules, hardware quizzes, and certificates.' 
              : 'Join over 1,200 African students and teachers in hands-on STEM.'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tinashe Moyo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          )}

          {mode === 'signin' && (
            <div className="flex items-center justify-between text-[11px] pb-0.5">
              <span className="text-slate-400">Login with:</span>
              <div className="flex items-center gap-2 font-bold">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`cursor-pointer ${loginMethod === 'email' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Email Address
                </button>
                <span className="text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => setLoginMethod('memberId')}
                  className={`cursor-pointer ${loginMethod === 'memberId' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Member ID
                </button>
              </div>
            </div>
          )}

          {/* Identifier Input (Email or Member ID) */}
          {mode === 'signin' && loginMethod === 'memberId' ? (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">YARA Member ID</label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="YARA-2026-XXXX"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono transition"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@school.ac.zw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Role selector for Signup */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">I am joining as a:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('innovator')}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    role === 'innovator'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Innovator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    role === 'teacher'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Teacher / Patron</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition hover:scale-102 cursor-pointer pt-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>SIGN IN TO LMS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>CREATE FREE ACCOUNT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Explore Option */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-2">
          <a
            href="#lms"
            onClick={(e) => {
              e.preventDefault();
              loginAsGuest();
              if (onGuestExplore) {
                onGuestExplore();
              } else {
                const el = document.getElementById('lms');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/learn');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-400 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Or explore courses as Guest (No login required) &darr;</span>
          </a>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
      />
    </div>
  );
}
