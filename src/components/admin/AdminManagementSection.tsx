import React, { useState } from 'react';
import { ShieldCheck, UserPlus, UserX, Crown, Check, X, Search, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { cn } from '../../lib/utils';

export interface AdminUserProfile {
  id: string;
  display_name?: string;
  email?: string;
  member_id?: string | null;
  avatar_url?: string;
  role: string;
  headline?: string;
  registration_paid?: boolean;
  subscription_expires_at?: string;
  is_halted?: boolean;
  created_at?: string;
}

interface Props {
  users: AdminUserProfile[];
  onRefresh: () => void;
}

export default function AdminManagementSection({ users, onRefresh }: Props) {
  const { profile: currentAdminProfile, user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleTitleInput, setRoleTitleInput] = useState('Executive Platform Administrator');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const adminUsers = users.filter(u => u.role === 'admin');
  const nonAdminUsers = users.filter(u => u.role !== 'admin');

  const handlePromoteToAdmin = async (targetUserId: string, targetName: string) => {
    if (!window.confirm(`Are you sure you want to promote ${targetName} to System Administrator?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          headline: 'System Administrator'
        })
        .eq('id', targetUserId);

      if (error) throw error;

      setMessage({ type: 'success', text: `Successfully promoted ${targetName} to System Administrator.` });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to promote user.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleDemoteAdmin = async (targetUserId: string, targetName: string, targetEmail?: string) => {
    if (targetEmail === currentUser?.email) {
      alert('You cannot demote your own administrator account.');
      return;
    }
    if (!window.confirm(`Revoke administrator privileges for ${targetName}?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'member'
        })
        .eq('id', targetUserId);

      if (error) throw error;

      setMessage({ type: 'success', text: `Revoked admin privileges for ${targetName}.` });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update admin status.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleAddAdminDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setMessage({ type: 'error', text: 'Please provide an email address.' });
      return;
    }

    setLoading(true);
    try {
      // Find if profile already exists in DB
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', emailInput.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            headline: roleTitleInput || 'System Administrator'
          })
          .eq('id', existingUser.id);

        if (error) throw error;
        setMessage({ type: 'success', text: `Elevated existing user ${existingUser.display_name || emailInput} to Administrator.` });
      } else {
        // Create new designated admin record
        const newId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: newId,
            email: emailInput.trim().toLowerCase(),
            display_name: nameInput.trim() || emailInput.split('@')[0],
            role: 'admin',
            headline: roleTitleInput || 'Executive Administrator',
            is_verified: true,
            status: 'approved'
          });

        if (error) throw error;
        setMessage({ type: 'success', text: `Created new Administrator profile for ${emailInput}.` });
      }

      setIsAddingAdmin(false);
      setEmailInput('');
      setNameInput('');
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add administrator.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const filteredAdmins = adminUsers.filter(u => 
    (u.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.headline || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>Administrator Council</span>
          </div>
          <h3 className="text-xl font-black text-white">System Administrators & Permissions</h3>
          <p className="text-xs text-slate-300 font-medium">
            Manage authorized administrators with full system access across curriculum, live event rooms, approval workflows, and M&E financial ledgers.
          </p>
        </div>

        <button
          onClick={() => setIsAddingAdmin(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Administrator</span>
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold",
              message.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdmins.map(admin => (
          <div key={admin.id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {admin.display_name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{admin.display_name || 'System Admin'}</h4>
                  <p className="text-[11px] font-mono text-slate-500">{admin.email || 'No email'}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-wider">
                Admin
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {admin.headline || 'Executive System Administrator'}
            </p>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-100">
              <span>Full System Clearance</span>
              {admin.email !== currentUser?.email && (
                <button
                  onClick={() => handleDemoteAdmin(admin.id, admin.display_name || 'Admin', admin.email)}
                  className="text-red-600 hover:text-red-800 font-bold hover:underline"
                >
                  Revoke Role
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isAddingAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-lg text-slate-900">Add Administrator</h3>
                </div>
                <button 
                  onClick={() => setIsAddingAdmin(false)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdminDirectly} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Admin Email Address *</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="colleague@yaria.org"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="e.g. Dr. Nyasha Mutasa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Administrative Designation</label>
                  <input
                    type="text"
                    value={roleTitleInput}
                    onChange={e => setRoleTitleInput(e.target.value)}
                    placeholder="e.g. Regional Competition Director / Financial Officer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAdmin(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Confirm & Grant Admin"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
