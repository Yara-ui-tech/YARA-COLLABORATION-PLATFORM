import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle2, Lock, Unlock, Search, RefreshCw, Sparkles, UserCheck, Check,
  Eye, Edit3, Download, Printer, ShieldCheck, DollarSign, X, Clock, FileText, CheckCircle
} from 'lucide-react';
import { 
  isCertificateUnlockedByAdmin, 
  unlockCertificateByAdmin, 
  lockCertificateByAdmin,
  batchUnlockCertificatesByAdmin,
  getAllUserCompletions
} from '../../services/yaraLmsService';
import { getAllCourses, getAllUserProgrammingCertificates } from '../../services/programmingCoursesService';
import { supabase } from '../../lib/supabase';
import { getAllEventRegistrations, updateRegistrationStatus } from '../../services/eventRegistrationService';
import IndividualCertificateEditModal from './IndividualCertificateEditModal';

interface StudentCertificateRow {
  id?: string;
  userId: string;
  studentName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  category: string;
  completedAt: string;
  certificateNumber: string;
  isUnlocked: boolean;
  institution?: string;
  province?: string;
  grade?: string;
  rawReg?: any;
}

interface SubscriptionRow {
  id: string;
  userEmail: string;
  fullName: string;
  schoolInstitution?: string;
  province?: string;
  subscriptionType: string;
  amountUsd: number;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rawReg?: any;
}

export const CertificateUnlockAdminManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'subscriptions'>('certificates');
  
  // Certificates State
  const [certRows, setCertRows] = useState<StudentCertificateRow[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [searchCertQuery, setSearchCertQuery] = useState('');
  const [certFilterStatus, setCertFilterStatus] = useState<'all' | 'pending' | 'unlocked'>('all');

  // Modal Editing & Viewing State
  const [editingCertRow, setEditingCertRow] = useState<StudentCertificateRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingCertRow, setViewingCertRow] = useState<StudentCertificateRow | null>(null);

  // Subscriptions State
  const [subRows, setSubRows] = useState<SubscriptionRow[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [searchSubQuery, setSearchSubQuery] = useState('');
  const [subFilterStatus, setSubFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCertificatesData();
    loadSubscriptionsData();
  }, []);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Load Certificates Data
  // ───────────────────────────────────────────────────────────────────────────
  const loadCertificatesData = async () => {
    setLoadingCerts(true);
    try {
      // Fetch Supabase Event & LMS Registrations
      const eventRegs = await getAllEventRegistrations();

      // Fetch Supabase Profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email, school_organization, province')
        .order('created_at', { ascending: false });

      const studentList = profiles && profiles.length > 0 ? profiles : [
        { id: 'demo_learner_01', display_name: 'Tatenda Mutasa', email: 'tatenda@yara.org' },
        { id: 'demo_learner_02', display_name: 'Rutendo Moyo', email: 'rutendo@yara.org' }
      ];

      const allRows: StudentCertificateRow[] = [];
      const courses = getAllCourses();

      // Convert Event Registrations (AI Bootcamp, etc.)
      eventRegs.forEach(reg => {
        const code = (reg.registration_code || reg.id).toUpperCase();
        const certNum = reg.certificate_number || `YARA-AI-EDU-2026-${code.replace('YARA-AI-', '')}`;
        allRows.push({
          id: reg.id,
          userId: reg.id,
          studentName: reg.full_name,
          userEmail: reg.email,
          courseId: 'ai-for-educators-2026',
          courseTitle: 'AI for Educators – Online Bootcamp 2026',
          category: 'AI & Digital Pedagogy',
          completedAt: reg.certificate_unlocked_at ? new Date(reg.certificate_unlocked_at).toLocaleDateString() : '2026-09-04',
          certificateNumber: certNum,
          isUnlocked: Boolean(reg.certificate_unlocked && reg.approval_status === 'approved'),
          institution: reg.school_institution,
          province: reg.province,
          grade: reg.certificate_grade || 'Certified Educator - AI & Digital Pedagogy (Honors)',
          rawReg: reg
        });
      });

      // Convert LMS Learners & Programming Courses
      for (const st of studentList) {
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
            completedAt: new Date().toLocaleDateString(),
            certificateNumber: `YARA-LMS-ROB-${st.id.slice(0, 6).toUpperCase()}`,
            isUnlocked: unlocked,
            institution: (st as any).school_organization || 'YARA Learning Academy',
            province: (st as any).province || 'National',
            grade: 'Robotics Academy Graduate (Honors)'
          });
        }

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
            certificateNumber: pc.certificateNumber,
            isUnlocked: unlocked,
            grade: pc.grade
          });
        }
      }

      // Fallback sample courses if list is sparse
      if (allRows.length < 3) {
        courses.slice(0, 3).forEach((c, idx) => {
          const demoUserId = `demo_user_${idx}`;
          const unlocked = isCertificateUnlockedByAdmin(demoUserId, c.id);
          allRows.push({
            userId: demoUserId,
            studentName: idx === 0 ? 'Dr. Farai Muringani' : idx === 1 ? 'Chipo Mazhindu' : 'Tinashe Chikosi',
            userEmail: `learner_${idx}@yara.org`,
            courseId: c.id,
            courseTitle: c.title,
            category: c.category,
            completedAt: new Date().toLocaleDateString(),
            certificateNumber: `YARA-CERT-2026-00${idx + 1}`,
            isUnlocked: unlocked,
            grade: 'Mastery Pass (92%)'
          });
        });
      }

      setCertRows(allRows);
    } catch (e) {
      console.error('Error loading certificate rows:', e);
    } finally {
      setLoadingCerts(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Load Subscriptions Data
  // ───────────────────────────────────────────────────────────────────────────
  const loadSubscriptionsData = async () => {
    setLoadingSubs(true);
    try {
      const eventRegs = await getAllEventRegistrations();
      
      const subs: SubscriptionRow[] = eventRegs.map(reg => ({
        id: reg.id,
        userEmail: reg.email,
        fullName: reg.full_name,
        schoolInstitution: reg.school_institution,
        province: reg.province,
        subscriptionType: reg.continuous_support_opt_in ? 'Educator Bootcamp + Term Support' : 'Educator AI Bootcamp Pass',
        amountUsd: reg.registration_fee || (reg.continuous_support_opt_in ? 25 : 10),
        paymentMethod: reg.payment_method || 'ecocash_usd',
        paymentReference: reg.payment_reference || reg.registration_code || 'REF-PENDING',
        paymentStatus: reg.payment_status || 'submitted',
        approvalStatus: reg.approval_status || 'pending',
        createdAt: new Date(reg.created_at || Date.now()).toLocaleDateString(),
        rawReg: reg
      }));

      // Add sample LMS Subscriptions if needed
      if (subs.length < 2) {
        subs.push({
          id: 'sub_lms_demo_01',
          userEmail: 'manongwasimbarashe394@gmail.com',
          fullName: 'Simbarashe Manongwa',
          schoolInstitution: 'Harare Institute of Technology',
          province: 'Harare',
          subscriptionType: 'YARA LMS Full Academy Annual Pass',
          amountUsd: 15.00,
          paymentMethod: 'ecocash_usd',
          paymentReference: 'MP20260919.1420.A92',
          paymentStatus: 'verified',
          approvalStatus: 'approved',
          createdAt: new Date().toLocaleDateString()
        });
      }

      setSubRows(subs);
    } catch (e) {
      console.error('Error loading subscription rows:', e);
    } finally {
      setLoadingSubs(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Certificate Lock & Unlock Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const handleToggleLockStatus = async (row: StudentCertificateRow) => {
    const newUnlockedState = !row.isUnlocked;

    if (row.rawReg) {
      // Sync Event Registration in DB
      await updateRegistrationStatus(
        row.rawReg.id,
        {
          payment_status: newUnlockedState ? 'verified' : 'submitted',
          approval_status: newUnlockedState ? 'approved' : 'pending',
          certificate_unlocked: newUnlockedState
        }
      );
    }

    if (newUnlockedState) {
      unlockCertificateByAdmin(row.userId, row.courseId);
      showNotice('success', `Certificate for ${row.studentName} UNLOCKED! Student can now view & download.`);
    } else {
      lockCertificateByAdmin(row.userId, row.courseId);
      showNotice('error', `Certificate for ${row.studentName} LOCKED again by Admin.`);
    }

    setCertRows(prev =>
      prev.map(r => (r.userId === row.userId && r.courseId === row.courseId ? { ...r, isUnlocked: newUnlockedState } : r))
    );
  };

  const handleBatchUnlockAll = () => {
    const pending = certRows.filter(r => !r.isUnlocked);
    if (pending.length === 0) {
      alert('No certificates currently awaiting unlock.');
      return;
    }
    const keys = pending.map(p => ({ userId: p.userId, courseId: p.courseId }));
    const count = batchUnlockCertificatesByAdmin(keys);

    pending.forEach(async p => {
      if (p.rawReg) {
        await updateRegistrationStatus(
          p.rawReg.id,
          { payment_status: 'verified', approval_status: 'approved', certificate_unlocked: true }
        );
      }
    });

    setCertRows(prev => prev.map(r => ({ ...r, isUnlocked: true })));
    showNotice('success', `Successfully unlocked ${count} certificates! All students can download their credentials.`);
  };

  const handlePrintCertificate = (row: StudentCertificateRow) => {
    setViewingCertRow(row);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Subscription Approval Handler
  // ───────────────────────────────────────────────────────────────────────────
  const handleApproveSubscription = async (sub: SubscriptionRow) => {
    try {
      if (sub.rawReg) {
        await updateRegistrationStatus(
          sub.rawReg.id,
          {
            payment_status: 'verified',
            approval_status: 'approved',
            certificate_unlocked: true
          }
        );
      }

      setSubRows(prev =>
        prev.map(s => (s.id === sub.id ? { ...s, paymentStatus: 'verified', approvalStatus: 'approved' } : s))
      );

      // Also unlock cert if matching
      unlockCertificateByAdmin(sub.userEmail, 'ai-for-educators-2026');

      showNotice('success', `Subscription for ${sub.fullName} (${sub.userEmail}) APPROVED! Full LMS access granted.`);
    } catch (err) {
      console.error('Approve subscription error:', err);
      showNotice('error', 'Failed to approve subscription. Please try again.');
    }
  };

  // Filtered lists
  const filteredCerts = certRows.filter(r => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchCertQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchCertQuery.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchCertQuery.toLowerCase()) ||
      r.certificateNumber.toLowerCase().includes(searchCertQuery.toLowerCase());

    if (certFilterStatus === 'pending') return matchesSearch && !r.isUnlocked;
    if (certFilterStatus === 'unlocked') return matchesSearch && r.isUnlocked;
    return matchesSearch;
  });

  const filteredSubs = subRows.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchSubQuery.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchSubQuery.toLowerCase()) ||
      s.paymentReference.toLowerCase().includes(searchSubQuery.toLowerCase());

    if (subFilterStatus === 'pending') return matchesSearch && s.approvalStatus !== 'approved';
    if (subFilterStatus === 'approved') return matchesSearch && s.approvalStatus === 'approved';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
              Faculty Certification & Billing Council
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
              Executive Sign-Off & Approvals
            </span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Certificates & Subscription Approvals Console
          </h3>
          <p className="text-slate-300 text-xs max-w-xl">
            View, edit, download, unlock, or lock certificates. Verify EcoCash & USD payments and approve LMS subscriptions with 1-click execution.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'certificates'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificates Console ({certRows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'subscriptions'
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Subscriptions & Approvals ({subRows.length})</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
              : 'bg-red-950/90 text-red-300 border border-red-500/40'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: CERTIFICATES CONSOLE */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchCertQuery}
                onChange={e => setSearchCertQuery(e.target.value)}
                placeholder="Search student, course, or cert ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setCertFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    certFilterStatus === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({certRows.length})
                </button>
                <button
                  onClick={() => setCertFilterStatus('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    certFilterStatus === 'pending' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Locked ({certRows.filter(r => !r.isUnlocked).length})
                </button>
                <button
                  onClick={() => setCertFilterStatus('unlocked')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    certFilterStatus === 'unlocked' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unlocked ({certRows.filter(r => r.isUnlocked).length})
                </button>
              </div>

              <button
                onClick={handleBatchUnlockAll}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md shrink-0 cursor-pointer"
              >
                <Unlock size={14} />
                <span>Batch Unlock</span>
              </button>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Student Learner</th>
                    <th className="p-4">Course / Event Title</th>
                    <th className="p-4">Certificate ID &amp; Grade</th>
                    <th className="p-4">Access Status</th>
                    <th className="p-4 text-center">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCerts ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">
                        Loading student certificates...
                      </td>
                    </tr>
                  ) : filteredCerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">
                        No certificate records found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredCerts.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{r.studentName}</div>
                          <div className="text-[10px] text-slate-400">{r.userEmail}</div>
                          {r.institution && (
                            <div className="text-[10px] font-bold text-indigo-600 mt-0.5">{r.institution}</div>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-800">{r.courseTitle}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span className="font-semibold text-slate-600">{r.category}</span>
                            <span>•</span>
                            <span>Issue Date: {r.completedAt}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] w-fit">
                            {r.certificateNumber}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-1">
                            {r.grade || 'Standard Passing Honors'}
                          </div>
                        </td>

                        <td className="p-4">
                          {r.isUnlocked ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit border border-emerald-200">
                              <Unlock size={11} className="text-emerald-700" />
                              <span>Unlocked</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit border border-amber-200">
                              <Lock size={11} className="text-amber-700" />
                              <span>Locked (Pending)</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* VIEW Button */}
                            <button
                              onClick={() => setViewingCertRow(r)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                              title="View Certificate Details & Preview"
                            >
                              <Eye size={13} />
                              <span className="hidden lg:inline">View</span>
                            </button>

                            {/* EDIT Button */}
                            <button
                              onClick={() => {
                                setEditingCertRow(r);
                                setIsEditModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all border border-cyan-200"
                              title="Edit Certificate Fields"
                            >
                              <Edit3 size={13} />
                              <span className="hidden lg:inline">Edit</span>
                            </button>

                            {/* DOWNLOAD Button */}
                            <button
                              onClick={() => handlePrintCertificate(r)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all border border-indigo-200"
                              title="Download & Print Certificate"
                            >
                              <Printer size={13} />
                              <span className="hidden lg:inline">Download</span>
                            </button>

                            {/* LOCK AGAIN / UNLOCK Toggle Button */}
                            {r.isUnlocked ? (
                              <button
                                onClick={() => handleToggleLockStatus(r)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-sm cursor-pointer transition-all"
                                title="Lock certificate back down"
                              >
                                <Lock size={13} />
                                <span>Lock Again</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleLockStatus(r)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-sm cursor-pointer transition-all"
                                title="Unlock certificate for student"
                              >
                                <Unlock size={13} />
                                <span>Unlock Cert</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: SUBSCRIPTIONS & APPROVALS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Subscriptions Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchSubQuery}
                onChange={e => setSearchSubQuery(e.target.value)}
                placeholder="Search by subscriber name, email, ref code..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSubFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subFilterStatus === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({subRows.length})
              </button>
              <button
                onClick={() => setSubFilterStatus('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subFilterStatus === 'pending' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Approval ({subRows.filter(s => s.approvalStatus !== 'approved').length})
              </button>
              <button
                onClick={() => setSubFilterStatus('approved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subFilterStatus === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({subRows.filter(s => s.approvalStatus === 'approved').length})
              </button>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Subscriber</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Payment &amp; EcoCash Ref</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingSubs ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">
                        Loading subscriptions...
                      </td>
                    </tr>
                  ) : filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">
                        No subscription records found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map((sub, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{sub.fullName}</div>
                          <div className="text-[10px] text-slate-400">{sub.userEmail}</div>
                          {sub.schoolInstitution && (
                            <div className="text-[10px] font-bold text-indigo-600 mt-0.5">{sub.schoolInstitution}</div>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-800">{sub.subscriptionType}</div>
                          <div className="text-[10px] font-black text-emerald-600 mt-0.5">
                            US${sub.amountUsd.toFixed(2)} Annual / Term Access
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] w-fit">
                            {sub.paymentReference}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 mt-1 uppercase">
                            Method: {sub.paymentMethod.replace('_', ' ')}
                          </div>
                        </td>

                        <td className="p-4">
                          {sub.approvalStatus === 'approved' ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit border border-emerald-200">
                              <CheckCircle2 size={11} className="text-emerald-700" />
                              <span>Active &amp; Approved</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit border border-amber-200">
                              <Clock size={11} className="text-amber-700" />
                              <span>Pending Admin Verification</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {sub.approvalStatus === 'approved' ? (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                              <CheckCircle size={15} /> Approved &amp; Active
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveSubscription(sub)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 ml-auto cursor-pointer shadow-md transition-all hover:scale-105"
                            >
                              <ShieldCheck size={14} />
                              <span>Approve Subscription</span>
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
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* INDIVIDUAL CERTIFICATE EDIT MODAL */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {editingCertRow && (
        <IndividualCertificateEditModal
          isOpen={isEditModalOpen}
          registration={
            editingCertRow.rawReg || {
              id: editingCertRow.userId,
              full_name: editingCertRow.studentName,
              email: editingCertRow.userEmail,
              school_institution: editingCertRow.institution || 'YARA Learning Academy',
              province: editingCertRow.province || 'Harare',
              role_title: 'Educator & STEM Learner',
              certificate_number: editingCertRow.certificateNumber,
              certificate_grade: editingCertRow.grade || 'Certified Master Honors',
              certificate_unlocked: editingCertRow.isUnlocked,
              certificate_unlocked_at: new Date().toISOString()
            } as any
          }
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCertRow(null);
          }}
          onUpdated={() => {
            loadCertificatesData();
            showNotice('success', `Certificate for ${editingCertRow.studentName} updated successfully.`);
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* CERTIFICATE PREVIEW MODAL */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {viewingCertRow && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setViewingCertRow(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <Award className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="text-lg font-black text-white">Accredited Certificate View</h4>
                <p className="text-xs text-slate-400">YARA National &amp; Continental Credential Registry</p>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400">Awarded To</div>
                  <div className="text-xl font-black text-white">{viewingCertRow.studentName}</div>
                  <div className="text-xs text-slate-400">{viewingCertRow.userEmail}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  viewingCertRow.isUnlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {viewingCertRow.isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1">
                <div className="text-xs text-slate-400 font-bold uppercase">Course / Academy</div>
                <div className="text-sm font-bold text-slate-200">{viewingCertRow.courseTitle}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Certificate Number</div>
                  <div className="font-mono font-bold text-amber-300">{viewingCertRow.certificateNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Honors / Grade</div>
                  <div className="font-bold text-slate-200">{viewingCertRow.grade || 'Certified Master Honors'}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setViewingCertRow(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => handlePrintCertificate(viewingCertRow)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2"
              >
                <Printer size={14} />
                <span>Print / Export Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
