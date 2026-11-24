import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Briefcase, Award, Settings, Save, Loader2, CheckCircle2, XCircle, Clock, Plus, X, Camera, CreditCard, ShieldCheck, LogOut, Building2, MapPin, HeartHandshake, Globe, Download, Printer, FileText } from 'lucide-react';
import { ASSETS } from '../constants/assets';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AFRICAN_COUNTRIES, ZIMBABWE_PROVINCES, ZIMBABWE_PROVINCES_LIST, POPULAR_ZIMBABWE_SCHOOLS } from '../constants/locationsData';
import { StipendSlip } from '../types/stipends';
import { stipendService } from '../services/stipendService';
import { downloadStipendSlipPdf, printStipendSlip } from '../utils/stipendSlipPrinter';

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    gender: 'boy' as 'girl' | 'boy',
    bio: '',
    avatar_url: '',
    skills: [] as string[],
    interests: [] as string[],
    role: 'innovator',
    country: 'Zimbabwe',
    province: '',
    district: '',
    city: '',
    ward: '',
    school_institution: '',
    location_region: '',
    disability_type: 'none',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [myStipendSlips, setMyStipendSlips] = useState<StipendSlip[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<StipendSlip | null>(null);

  useEffect(() => {
    if (profile) {
      const resolvedGender = (profile.gender || (profile as any)?.social_links?.gender || (profile as any)?.accessibility_preferences?.gender || 'boy') as 'girl' | 'boy';
      setFormData({
        display_name: profile.display_name || '',
        gender: resolvedGender,
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        role: profile.role || 'innovator',
        country: profile.country || 'Zimbabwe',
        province: profile.province || '',
        district: profile.district || '',
        city: profile.city || '',
        ward: profile.ward || profile.community || '',
        school_institution: profile.school_institution || '',
        location_region: profile.location_region || '',
        disability_type: profile.disability_type || 'none',
      });

      // Load user's official stipend slips (mentors, employees, trainers, coaches, etc.)
      const loadSlips = async () => {
        try {
          const mine = await stipendService.getStipendsForUser(profile.id, profile.email, profile.display_name);
          setMyStipendSlips(mine);
        } catch {}
      };
      loadSlips();

      const handleDisbursed = () => {
        loadSlips();
      };
      window.addEventListener('yara_stipend_disbursed', handleDisbursed);
      return () => {
        window.removeEventListener('yara_stipend_disbursed', handleDisbursed);
      };
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    setUploading(true);
    try {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file (JPG, PNG, GIF, WebP)');
      }

      // Check file size (limit to 2MB for avatars as per remote suggestion)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image is too large. Maximum size is 2MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage (avatars bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        // Common clearer messages
        if (/(bucket|not found|does not exist)/i.test(uploadError.message || '')) {
          throw new Error('Upload failed: the "avatars" storage bucket does not exist in your Supabase project. Create the bucket or ask an admin to create it.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath as string);
      if (!publicUrl) throw new Error('Failed to obtain public URL for uploaded avatar. Check bucket/public settings.');

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

      // Automatically save the profile update
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // refresh client-side profile cache
      if (refreshProfile) await refreshProfile();

      alert('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Detailed upload error:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}. 
      
Possible causes:
1. The "avatars" storage bucket does not exist in your Supabase project.
2. The "avatars" bucket is not set to "Public".
3. Row Level Security (RLS) policies for the "avatars" bucket are missing or restrictive.
4. Your internet connection is unstable.`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fullLocation = [
        formData.ward.trim(),
        formData.city.trim(),
        formData.district.trim(),
        formData.province.trim(),
        formData.country.trim()
      ].filter(Boolean).join(', ');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          gender: formData.gender,
          social_links: { ...((profile as any)?.social_links || {}), gender: formData.gender },
          accessibility_preferences: { ...((profile as any)?.accessibility_preferences || {}), gender: formData.gender },
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          skills: formData.skills,
          interests: formData.interests,
          role: formData.role,
          country: formData.country.trim() || 'Zimbabwe',
          province: formData.province.trim() || null,
          district: formData.district.trim() || null,
          city: formData.city.trim() || null,
          ward: formData.ward.trim() || null,
          community: formData.ward.trim() || null,
          school_institution: formData.school_institution.trim() || null,
          location_region: fullLocation || formData.location_region.trim() || null,
          disability_type: formData.disability_type,
        })
        .eq('id', user.id);
      
      try {
        await supabase.auth.updateUser({
          data: {
            display_name: formData.display_name,
            gender: formData.gender,
            country: formData.country.trim() || 'Zimbabwe',
            province: formData.province.trim() || null,
            district: formData.district.trim() || null,
            city: formData.city.trim() || null,
            ward: formData.ward.trim() || null,
            school_institution: formData.school_institution.trim() || null,
          }
        });
      } catch (authErr) {
        console.warn('Metadata update note:', authErr);
      }
      
      if (error) throw error;
      if (refreshProfile) await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  const getTrialDaysLeft = () => {
    if (!profile?.trial_ends_at) return 0;
    const now = new Date();
    const end = new Date(profile.trial_ends_at);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getTrialDaysLeft();

  const selectedProvinceData = formData.province ? ZIMBABWE_PROVINCES[formData.province] : null;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h2>
          <p className="text-slate-500 font-medium">Manage your personal information and professional identity.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Member ID</span>
            <span className="text-sm font-black text-indigo-600">{profile?.member_id}</span>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2",
              isEditing ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700" : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isEditing ? <Save className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-indigo-50/50 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-black border-4 border-white shadow-xl overflow-hidden">
                <img 
                  src={profile?.avatar_url || ASSETS.DEFAULT_AVATAR} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{profile?.display_name}</h3>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">{profile?.role}</p>
            
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-2xs ${
                formData.gender === 'girl'
                  ? 'bg-pink-50 text-pink-700 border-pink-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                <span>{formData.gender === 'girl' ? '👧' : '👦'}</span>
                <span>{formData.gender === 'girl' ? 'Girl Innovator (Female)' : 'Boy Innovator (Male)'}</span>
              </span>
            </div>
            
            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
              {/* Equity & Underserved Area Scholarship Badge */}
              {(profile?.is_fee_exempt || profile?.is_underserved_scholarship) ? (
                <div className="p-6 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col items-center space-y-2.5 text-emerald-900 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-sm">Equity Scholarship Active</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mt-0.5">
                      100% Free Lifetime Platform Access ($0.00)
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1 leading-relaxed">
                      {profile?.underserved_scholarship_reason || 'Underserved Community/School Exemption'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Standard Subscription Status */
                <div className={cn(
                  "p-6 rounded-3xl border-2 flex flex-col items-center space-y-3",
                  profile?.is_halted ? "bg-red-50 border-red-100 text-red-700" : 
                  (new Date(profile?.subscription_expires_at || '') < new Date() ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-emerald-50 border-emerald-100 text-emerald-700")
                )}>
                  <ShieldCheck className="w-10 h-10" />
                  <div className="text-center">
                    <p className="font-bold text-lg">Subscription</p>
                    <p className="text-xs font-black uppercase tracking-widest opacity-80">
                      {profile?.is_halted ? 'Halted' : 
                       (new Date(profile?.subscription_expires_at || '') < new Date() ? 'Expired' : 'Active')}
                    </p>
                    {profile?.subscription_expires_at && (
                      <p className="text-[10px] mt-1 opacity-60">
                        Expires: {new Date(profile.subscription_expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => signOut?.()}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight flex items-center space-x-3">
              <User className="w-6 h-6 text-indigo-600" />
              <span>Personal Information</span>
            </h3>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Profile Picture URL (Optional)</label>
                <div className="relative group">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="url"
                    disabled={!isEditing}
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium disabled:opacity-70 pl-12"
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">You can also use the camera icon on your profile card to upload a file.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Display Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Gender / Parity Identification
                  </label>
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                    50/50 Gender Parity Standard
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setFormData({ ...formData, gender: 'girl' })}
                    className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      formData.gender === 'girl'
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">👧</span>
                    <span>Girl / Female</span>
                  </button>
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setFormData({ ...formData, gender: 'boy' })}
                    className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                      formData.gender === 'boy'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">👦</span>
                    <span>Boy / Male</span>
                  </button>
                </div>
              </div>

              {/* Geographical Location & School Categorisation */}
              <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Geographical Location &amp; School Categorisation
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Used for province/district robotics tournament divisions, club mentorship, and equity tracking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Country</span>
                    </label>
                    <select
                      disabled={!isEditing}
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-bold text-slate-800 disabled:opacity-70"
                    >
                      {AFRICAN_COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Province */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span>Province / Region</span>
                    </label>
                    {formData.country === 'Zimbabwe' ? (
                      <select
                        disabled={!isEditing}
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '', city: '' })}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-bold text-slate-800 disabled:opacity-70"
                      >
                        <option value="">Select Province...</option>
                        {ZIMBABWE_PROVINCES_LIST.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        placeholder="e.g. Gauteng, Copperbelt"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-medium text-slate-800 disabled:opacity-70"
                      />
                    )}
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>District</span>
                    </label>
                    {selectedProvinceData ? (
                      <select
                        disabled={!isEditing}
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-bold text-slate-800 disabled:opacity-70"
                      >
                        <option value="">Select District...</option>
                        {selectedProvinceData.districts.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="e.g. Makonde, Harare Urban, Binga"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-medium text-slate-800 disabled:opacity-70"
                      />
                    )}
                  </div>

                  {/* City / Town */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>City / Town</span>
                    </label>
                    <input
                      type="text"
                      list="profile-city-suggestions"
                      disabled={!isEditing}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Harare, Bulawayo, Chinhoyi"
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-medium text-slate-800 disabled:opacity-70"
                    />
                    {selectedProvinceData && (
                      <datalist id="profile-city-suggestions">
                        {selectedProvinceData.cities.map(c => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    )}
                  </div>

                  {/* Community / Ward */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Community / Ward</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      placeholder="e.g. Ward 4, Highfield, Chikangwe"
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-medium text-slate-800 disabled:opacity-70"
                    />
                  </div>

                  {/* School / Institution */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>School / Institution</span>
                    </label>
                    <input
                      type="text"
                      list="profile-school-suggestions"
                      disabled={!isEditing}
                      value={formData.school_institution}
                      onChange={(e) => setFormData({ ...formData, school_institution: e.target.value })}
                      placeholder="e.g. Nemakonde High School"
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl py-2.5 px-3 focus:outline-none focus:border-indigo-600 transition-all text-xs font-medium text-slate-800 disabled:opacity-70"
                    />
                    <datalist id="profile-school-suggestions">
                      {POPULAR_ZIMBABWE_SCHOOLS.map(s => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <span>♿</span>
                    <span>Disability Accommodation</span>
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.disability_type}
                    onChange={(e) => setFormData({ ...formData, disability_type: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs font-medium disabled:opacity-70"
                  >
                    <option value="none">Standard Support</option>
                    <option value="visual">Visual Impairment (Screen reader / High contrast)</option>
                    <option value="hearing">Hearing Impairment (Visual captions)</option>
                    <option value="motor">Motor Impairment (Keyboard navigation)</option>
                    <option value="cognitive_dyslexia">Learning / Dyslexia (Reading ruler / Dyslexic font)</option>
                    <option value="other">Other specialized accommodation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Bio</label>
                <textarea
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself and your passion for innovation..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium min-h-[150px] resize-none disabled:opacity-70"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center justify-between">
                    <span>Skills</span>
                    <Award className="w-4 h-4 text-indigo-600" />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold flex items-center space-x-2">
                        <span>{skill}</span>
                        {isEditing && (
                          <button onClick={() => removeSkill(skill)} className="hover:text-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="Add skill..."
                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-4 focus:outline-none focus:border-indigo-600 transition-all text-sm font-medium"
                      />
                      <button onClick={addSkill} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center justify-between">
                    <span>Interests</span>
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <span key={interest} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center space-x-2">
                        <span>{interest}</span>
                        {isEditing && (
                          <button onClick={() => removeInterest(interest)} className="hover:text-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        placeholder="Add interest..."
                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-4 focus:outline-none focus:border-indigo-600 transition-all text-sm font-medium"
                      />
                      <button onClick={addInterest} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Official Stipend & Compensation Slips (For Mentors, Employees, Trainers, Coaches) */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Official Stipend &amp; Compensation Slips</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Computerized NPO stipend slips with payment references, allowances, and T&amp;S for your records.
                </p>
              </div>

              {myStipendSlips.length > 0 && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  {myStipendSlips.length} Verified Payment {myStipendSlips.length === 1 ? 'Slip' : 'Slips'}
                </span>
              )}
            </div>

            {myStipendSlips.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Disbursed Stipend Slips Found</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When an administrator authorizes your mentorship, coaching, training, or employee stipend in the admin console, your official receipt slip will appear here for download.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">Slip Ref</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Breakdown</th>
                      <th className="py-3 px-4">Amount Received</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4 text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myStipendSlips.map(slip => (
                      <tr key={slip.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{slip.id}</td>
                        <td className="py-3 px-4 text-slate-600">{slip.disbursement_date}</td>
                        <td className="py-3 px-4 text-slate-600">
                          Base: ${Number(slip.base_stipend).toFixed(2)} | Allowances: ${Number(slip.allowance_amount).toFixed(2)} | T&amp;S: ${Number(slip.travel_subsistence_ts).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-600 text-sm">
                          ${Number(slip.net_amount_received).toFixed(2)} {slip.currency}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{slip.payment_reference}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => printStipendSlip(slip)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                              title="Print Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadStipendSlipPdf(slip)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
