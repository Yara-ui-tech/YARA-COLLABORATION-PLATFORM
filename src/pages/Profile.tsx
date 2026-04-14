import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Briefcase, Award, Settings, Save, Loader2, CheckCircle2, XCircle, Clock, Plus, X, Camera, CreditCard, ShieldCheck } from 'lucide-react';
import { ASSETS } from '../constants/assets';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    skills: [] as string[],
    interests: [] as string[],
    role: 'innovator',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        role: profile.role || 'innovator',
      });
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
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        // Detailed error handling merged from remote
        if (uploadError.message?.includes("Unexpected token 'T'") || uploadError.message?.includes("is not valid JSON")) {
          throw new Error('Storage service returned an invalid response. This usually means the "avatars" bucket does not exist or is not public. Please create it in your Supabase dashboard.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Automatically save the profile update
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (profileError) throw profileError;

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
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          skills: formData.skills,
          interests: formData.interests,
          role: formData.role,
        })
        .eq('id', user.id);
      
      if (error) throw error;
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
              {/* Subscription Status */}
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
        </div>
      </div>
    </div>
  );
}
