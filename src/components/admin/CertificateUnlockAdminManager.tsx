import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle2, Lock, Unlock, Search, RefreshCw, Sparkles, UserCheck, Check
} from 'lucide-react';
import { 
  isCertificateUnlockedByAdmin, 
  unlockCertificateByAdmin, 
  batchUnlockCertificatesByAdmin,
  getAllUserCompletions
} from '../../services/yaraLmsService';
import { getAllCourses, getAllUserProgrammingCertificates } from '../../services/programmingCoursesService';
import { supabase } from '../../lib/supabase';

interface StudentCertificateRow {
  userId: string;
  studentName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  category: string;
  completedAt: string;
  isUnlocked: boolean;
}

export const CertificateUnlockAdminManager: React.FC = () => {
  const [rows, setRows] = useState<StudentCertificateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'unlocked'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch student profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .order('created_at', { ascending: false });

      const studentList = profiles && profiles.length > 0 ? profiles : [
        { id: 'demo_learner_01', display_name: 'Tatenda Mutasa', email: 'tatenda@yara.org' },
        { id: 'demo_learner_02', display_name: 'Rutendo Moyo', email: 'rutendo@yara.org' }
      ];

      const allRows: StudentCertificateRow[] = [];
      const courses = getAllCourses();

      for (const st of studentList) {
        // Robotics Academy Capstone check
        const comps = getAllUserCompletions(st.id);
        const hasRoboticsCompleted = Object.values(comps).some((c: any) => c?.isFullyCompleted);

        if (hasRoboticsCompleted) {
          const unlocked = isCertificateUnlockedByAdmin(st.id, 'yara-robotics-academy');
          allRows.push({
            userId: st.id,
            studentName: st.display_name || st.email.split('@')[0],
            userEmail: st.email,
            courseId: 'yara-robotics-academy',
            courseTitle: 'YARA Robotics & Innovation Academy (Levels 0 — 8)',
            category: 'Robotics & Hardware',
            completedAt: new Date().toISOString(),
            isUnlocked: unlocked
          });
        }

        // Programming Courses Certs check
        const progCerts = getAllUserProgrammingCertificates(st.id);
        for (const pc of progCerts) {
          const unlocked = isCertificateUnlockedByAdmin(st.id, pc.courseId);
          allRows.push({
            userId: st.id,
            studentName: pc.studentName || st.display_name || st.email,
            userEmail: pc.userEmail || st.email,
            courseId: pc.courseId,
            courseTitle: pc.courseTitle,
            category: pc.courseCategory,
            completedAt: pc.issueDate,
            isUnlocked: unlocked
          });
        }

        // Fallback default sample if empty
        if (allRows.length === 0) {
          courses.forEach(c => {
            const unlocked = isCertificateUnlockedByAdmin(st.id, c.id);
            allRows.push({
              userId: st.id,
              studentName: st.display_name || 'Innovator Learner',
              userEmail: st.email,
              courseId: c.id,
              courseTitle: c.title,
              category: c.category,
              completedAt: new Date().toLocaleDateString(),
              isUnlocked: unlocked
            });
          });
        }
      }

      setRows(allRows);
    } catch (e) {
      console.error('Error loading certificate rows:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnlockSingle = (userId: string, courseId: string, name: string) => {
    unlockCertificateByAdmin(userId, courseId);
    setRows(prev => prev.map(r => (r.userId === userId && r.courseId === courseId) ? { ...r, isUnlocked: true } : r));
    setNotification({ type: 'success', text: `Certificate for ${name} unlocked! Student can now download their certificate.` });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBatchUnlockAll = () => {
    const pending = rows.filter(r => !r.isUnlocked);
    if (pending.length === 0) {
      alert('No certificates currently awaiting unlock.');
      return;
    }
    const keys = pending.map(p => ({ userId: p.userId, courseId: p.courseId }));
    const count = batchUnlockCertificatesByAdmin(keys);
    setRows(prev => prev.map(r => ({ ...r, isUnlocked: true })));
    setNotification({ type: 'success', text: `Successfully unlocked ${count} certificates! All eligible students can download.` });
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = rows.filter(r => {
    const matchesSearch = 
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'pending') return !r.isUnlocked;
    if (filterStatus === 'unlocked') return r.isUnlocked;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
              Faculty Certification Council
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
              Admin Unlock Sign-Off
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">Student Certificate Unlocks</h3>
          <p className="text-xs text-slate-300">
            Review completed courses and unlock accredited certificates for students (mirroring AI Bootcamp workflow).
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleBatchUnlockAll}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
          >
            <Unlock size={14} />
            <span>Unlock All Completed Certificates</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student or course..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            All ({rows.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Pending Unlock ({rows.filter(r => !r.isUnlocked).length})
          </button>
          <button
            onClick={() => setFilterStatus('unlocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filterStatus === 'unlocked' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Unlocked ({rows.filter(r => r.isUnlocked).length})
          </button>
        </div>
      </div>

      {/* Table of Certificates */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Course Completed</th>
              <th className="p-4">Track</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                  No certificate records matching filter.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{r.studentName}</div>
                    <div className="text-[10px] text-slate-400">{r.userEmail}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{r.courseTitle}</div>
                    <div className="text-[10px] text-slate-400">Completed: {r.completedAt}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-600 capitalize">
                    {r.category.replace('_', ' ')}
                  </td>
                  <td className="p-4">
                    {r.isUnlocked ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} /> Unlocked by Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                        <Lock size={12} /> Pending Admin Sign-Off
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {r.isUnlocked ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <Check size={14} /> Ready for Download
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUnlockSingle(r.userId, r.courseId, r.studentName)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 ml-auto cursor-pointer shadow-sm"
                      >
                        <Unlock size={13} />
                        <span>Unlock Certificate</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
