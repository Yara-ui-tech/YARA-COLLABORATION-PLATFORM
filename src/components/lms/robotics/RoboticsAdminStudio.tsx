import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  DollarSign, 
  School, 
  FileText, 
  ShieldCheck, 
  Plus, 
  ExternalLink,
  ChevronDown,
  UserCheck,
  Calendar,
  AlertCircle,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';
import { 
  roboticsTrainingService, 
  ROBOTICS_PROGRAMMES_CATALOG,
  ROBOTICS_PATHWAYS_CATALOG 
} from '../../../services/roboticsTrainingService';
import { 
  RoboticsLearnerEnrolment, 
  RoboticsSchoolPartnershipRequest,
  RoboticsTeacherEnrolment,
  RoboticsCertificationLevelId 
} from '../../../types/roboticsTraining';
import { RoboticsDigitalCertificateModal } from './RoboticsDigitalCertificateModal';

export const RoboticsAdminStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'enrolments' | 'partnerships' | 'teachers' | 'cert_issue'>('enrolments');
  const [enrolments, setEnrolments] = useState<RoboticsLearnerEnrolment[]>([]);
  const [partnerships, setPartnerships] = useState<RoboticsSchoolPartnershipRequest[]>([]);
  const [teachers, setTeachers] = useState<RoboticsTeacherEnrolment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnrolment, setSelectedEnrolment] = useState<RoboticsLearnerEnrolment | null>(null);

  // Certificate Issuance State
  const [issuingModalOpen, setIssuingModalOpen] = useState(false);
  const [issuedCert, setIssuedCert] = useState<{
    certificateNumber: string;
    learnerName: string;
    levelTitle: string;
    programmeCompleted: string;
    schoolName: string;
  } | null>(null);

  // Manual Certificate Issue Form State
  const [manualCertForm, setManualCertForm] = useState({
    learnerName: '',
    schoolName: '',
    levelId: 'level_2_junior' as RoboticsCertificationLevelId,
    grade: 'Distinction'
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eData, pData, tData] = await Promise.all([
        roboticsTrainingService.getAllEnrolments(),
        roboticsTrainingService.getPartnershipRequests(),
        roboticsTrainingService.getTeacherEnrolments()
      ]);
      setEnrolments(eData);
      setPartnerships(pData);
      setTeachers(tData);
    } catch (err) {
      console.error('Failed to load admin robotics data', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStatusUpdate = async (id: string, status: RoboticsLearnerEnrolment['enrolmentStatus']) => {
    await roboticsTrainingService.updateEnrolmentStatus(id, status);
    setEnrolments(prev => prev.map(e => e.id === id ? { ...e, enrolmentStatus: status } : e));
    showNotice(`Enrolment #${id} status updated to ${status.toUpperCase()}`);
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCertForm.learnerName) return;

    const pathway = ROBOTICS_PATHWAYS_CATALOG.find(p => p.id === manualCertForm.levelId);
    const result = await roboticsTrainingService.issueRoboticsCertificate(
      manualCertForm.learnerName,
      manualCertForm.schoolName || 'Independent YARA Chapter',
      manualCertForm.levelId,
      manualCertForm.grade
    );

    setIssuedCert({
      certificateNumber: result.certificateNumber,
      learnerName: manualCertForm.learnerName,
      levelTitle: pathway?.levelTitle || 'Junior Robotics Certificate',
      programmeCompleted: 'Robotics & Engineering Accredited Training',
      schoolName: manualCertForm.schoolName || 'YARA Innovation Academy'
    });
    setIssuingModalOpen(true);
    showNotice(`Certificate #${result.certificateNumber} officially generated & signed!`);
  };

  // Metrics
  const totalLearners = enrolments.reduce((sum, e) => sum + (e.learnerCount || 1), 0);
  const totalRevenue = enrolments.reduce((sum, e) => sum + (e.totalPayableAmount || 0), 0);
  const activeEnrolments = enrolments.filter(e => e.enrolmentStatus === 'active' || e.enrolmentStatus === 'confirmed').length;

  const filteredEnrolments = enrolments.filter(e => 
    e.primaryContactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.schoolOrChapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.programmeTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Learners Registered</div>
          <div className="text-2xl font-black text-[#0A1B4D] mt-1">{totalLearners}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{enrolments.length} enrolment records</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold uppercase">Active Programme Roster</div>
          <div className="text-2xl font-black text-[#0D47A1] mt-1">{activeEnrolments}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In session & confirmed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold uppercase">Partner Schools</div>
          <div className="text-2xl font-black text-[#1976D2] mt-1">{partnerships.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Institutional inquiries</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Pipeline Dues</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">${totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Calculated programme fees</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('enrolments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'enrolments'
              ? 'bg-[#0D47A1] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Learner Enrolments ({enrolments.length})
        </button>

        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'partnerships'
              ? 'bg-[#0D47A1] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <School className="w-4 h-4" />
          School Partnerships ({partnerships.length})
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'teachers'
              ? 'bg-[#0D47A1] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Teacher CPD ({teachers.length})
        </button>

        <button
          onClick={() => setActiveTab('cert_issue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'cert_issue'
              ? 'bg-[#0D47A1] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Generate Digital Certificates
        </button>
      </div>

      {/* TAB 1: ENROLMENTS ROSTER */}
      {activeTab === 'enrolments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search learner, school, programme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
              />
            </div>
            <button
              onClick={loadData}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Contact / Learner</th>
                    <th className="p-4">School & Grade</th>
                    <th className="p-4">Selected Programme</th>
                    <th className="p-4">Learners</th>
                    <th className="p-4">Fee / Dues</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnrolments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No robotics enrolments found. New registrations will populate here in real-time.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrolments.map((enrol) => (
                      <tr key={enrol.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-bold text-[#0A1B4D]">{enrol.primaryContactName}</div>
                          <div className="text-[11px] text-slate-400">{enrol.primaryContactEmail} • {enrol.primaryContactPhone}</div>
                          {enrol.parentOrGuardianName && (
                            <span className="text-[10px] text-slate-500">Guardian: {enrol.parentOrGuardianName}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-700">{enrol.schoolOrChapterName}</div>
                          <div className="text-[11px] text-slate-400">{enrol.gradeOrEducationLevel}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#0D47A1]">{enrol.programmeTitle}</div>
                          <div className="text-[11px] text-slate-500 capitalize">Location: {enrol.locationOption.replace(/_/g, ' ')}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                            {enrol.learnerCount} Student(s)
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-slate-900">${enrol.totalPayableAmount}</div>
                          <span className={`text-[10px] font-bold uppercase ${
                            enrol.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {enrol.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={enrol.enrolmentStatus}
                            onChange={(e) => handleStatusUpdate(enrol.id, e.target.value as any)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active</option>
                            <option value="graduated">Graduated</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedEnrolment(enrol)}
                            className="px-3 py-1.5 rounded-lg bg-[#E8F4FF] hover:bg-[#1976D2] hover:text-white text-[#0D47A1] font-bold transition text-xs"
                          >
                            Roster ({enrol.studentsList?.length || enrol.learnerCount})
                          </button>
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

      {/* TAB 2: SCHOOL PARTNERSHIPS */}
      {activeTab === 'partnerships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerships.map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E8F4FF] text-[#0D47A1] font-bold text-[10px] uppercase">
                    {p.schoolType} School
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#0A1B4D] mb-1">{p.schoolName}</h4>
                <p className="text-xs text-slate-500 mb-3">{p.province}, {p.city}</p>
                
                <div className="space-y-1 text-xs text-slate-700 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div><strong>Contact:</strong> {p.contactPersonName} ({p.contactRole})</div>
                  <div><strong>Phone:</strong> {p.phone}</div>
                  <div><strong>Email:</strong> {p.email}</div>
                  <div><strong>Expected Learners:</strong> {p.estimatedLearners}</div>
                </div>

                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Requested Offerings
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p.requestedOfferings?.map((off, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        {off.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Status: <strong className="text-[#0D47A1] capitalize">{p.status}</strong>
                </span>
                <a
                  href={`mailto:${p.email}?subject=YARA Robotics Training Partnership Proposal for ${encodeURIComponent(p.schoolName)}`}
                  className="px-3 py-1.5 rounded-lg bg-[#0D47A1] text-white text-xs font-bold hover:bg-[#0A1B4D] transition flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Liaison
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: TEACHER CPD */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#0A1B4D] text-sm">{t.teacherName}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{t.schoolName} • {t.subjectTaught}</p>
              <div className="text-xs text-slate-600 space-y-1 mb-3">
                <div>Phone: {t.phone}</div>
                <div>Completed: {t.sessionsCompleted} of {t.requiredSessions} sessions</div>
                <div>Kit Ordered: {t.purchasedRoboticsKit ? 'Yes ($50 hardware pack)' : 'No'}</div>
                <div>Total: <strong>${t.totalCost}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MANUAL CERTIFICATE ISSUE */}
      {activeTab === 'cert_issue' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0A1B4D]">Issue Official YARA Robotics Certificate</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administratively generate, sign, and assign verifiable digital credentials with embedded QR verification.
            </p>
          </div>

          <form onSubmit={handleIssueCertificate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Learner Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Farai Nyasha Moyo"
                value={manualCertForm.learnerName}
                onChange={(e) => setManualCertForm({ ...manualCertForm, learnerName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution</label>
              <input
                type="text"
                placeholder="e.g. St. George's College Robotics Chapter"
                value={manualCertForm.schoolName}
                onChange={(e) => setManualCertForm({ ...manualCertForm, schoolName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Certification Level</label>
                <select
                  value={manualCertForm.levelId}
                  onChange={(e) => setManualCertForm({ ...manualCertForm, levelId: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold"
                >
                  <option value="level_1_explorer">Level 1 – Robotics Explorer</option>
                  <option value="level_2_junior">Level 2 – Junior Robotics</option>
                  <option value="level_3_secondary">Level 3 – Secondary Robotics</option>
                  <option value="level_4_advanced">Level 4 – Advanced Robotics</option>
                  <option value="teacher_cpd">Teacher Professional Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Awarded Grade</label>
                <select
                  value={manualCertForm.grade}
                  onChange={(e) => setManualCertForm({ ...manualCertForm, grade: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold"
                >
                  <option value="Distinction">Distinction (Top 10%)</option>
                  <option value="Merit">Merit</option>
                  <option value="Pass">Pass</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0A1B4D] text-white font-bold text-xs shadow-md transition"
            >
              Issue Digital Certificate & Sign
            </button>
          </form>
        </div>
      )}

      {/* Selected Enrolment Roster Drawer */}
      {selectedEnrolment && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0A1B4D]">
                  Student Roster • {selectedEnrolment.schoolOrChapterName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEnrolment.programmeTitle} • {selectedEnrolment.learnerCount} Registered Learner(s)
                </p>
              </div>
              <button
                onClick={() => setSelectedEnrolment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {(!selectedEnrolment.studentsList || selectedEnrolment.studentsList.length === 0) ? (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <div><strong>Individual Learner:</strong> {selectedEnrolment.primaryContactName}</div>
                  <div><strong>Grade Level:</strong> {selectedEnrolment.gradeOrEducationLevel}</div>
                  <div><strong>Contact:</strong> {selectedEnrolment.primaryContactPhone}</div>
                </div>
              ) : (
                selectedEnrolment.studentsList.map((st, i) => (
                  <div key={st.id || i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#0A1B4D]">{i + 1}. {st.fullName}</div>
                      <div className="text-[11px] text-slate-500">Grade: {st.ageOrGrade} • Gender: {st.gender || 'Not specified'}</div>
                    </div>
                    {st.guardianPhone && (
                      <span className="text-[11px] text-slate-500">Parent: {st.guardianPhone}</span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedEnrolment(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Certificate Preview Modal */}
      {issuedCert && (
        <RoboticsDigitalCertificateModal
          isOpen={issuingModalOpen}
          onClose={() => setIssuingModalOpen(false)}
          certificateNumber={issuedCert.certificateNumber}
          learnerName={issuedCert.learnerName}
          levelTitle={issuedCert.levelTitle}
          programmeCompleted={issuedCert.programmeCompleted}
          schoolName={issuedCert.schoolName}
        />
      )}
    </div>
  );
};

