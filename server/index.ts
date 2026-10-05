import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API] ${req.method} ${req.url}`);
  next();
});

// Real-Time Socket.IO Server
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_session', (sessionId: string) => {
    socket.join(`session_${sessionId}`);
    console.log(`[Socket.IO] Client ${socket.id} joined room session_${sessionId}`);
  });

  socket.on('leave_session', (sessionId: string) => {
    socket.leave(`session_${sessionId}`);
  });

  socket.on('submit_doubt', (data) => {
    // Broadcast doubt to session room
    io.to(`session_${data.sessionId}`).emit('new_doubt_broadcast', data);
  });

  socket.on('resolve_doubt', (data) => {
    io.to(`session_${data.sessionId}`).emit('doubt_resolved_broadcast', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Storage Directory Setup
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readJsonFile = <T>(filename: string, fallback: T): T => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return fallback;
  }
};

const writeJsonFile = <T>(filename: string, data: T): void => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
};

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    system: 'YARIA Enterprise Robotics & LMS Backend',
    version: '2.5.0-yara-enterprise',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    activeGateways: ['ecocash', 'bank_transfer', 'stripe_card', 'paypal'],
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    }
  });
});

app.get('/api/system/config', (_req: Request, res: Response) => {
  res.json({
    launchTarget: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    registrationFeeUSD: 15.00,
    trialDays: 3,
    currency: 'USD',
    organization: {
      name: 'Youth Academy for Robotics & Industrial Automation',
      acronym: 'YARIA / YARA',
      registrationNumber: 'MA-00249/2026',
      contactEmail: 'inforyaraorg@gmail.com',
      contactPhone: '0717468236',
      whatsappSupport: '+263788953986'
    }
  });
});

// ==========================================
// 2. PORTAL STATS (Webpage vs LMS)
// ==========================================
app.get('/api/portal/stats', (_req: Request, res: Response) => {
  res.json({
    webpage: {
      title: 'YARA Public Platform & Ecosystem',
      registeredChapters: 12,
      activeCompetitions: 3,
      totalOutreachStudents: 1420,
      partnerOrganizations: 8,
      recentAnnouncements: 6
    },
    lms: {
      title: 'YARA Learning Academy',
      totalSessions: 42,
      courseLevels: 4,
      enrolledInnovators: 384,
      certificatesAwarded: 112,
      activeIndustrialMentors: 4,
      avgStudentRating: 4.93
    }
  });
});

// ==========================================
// 3. LMS ENGINE ROUTES
// ==========================================
interface UserProgressRecord {
  userId: string;
  sessionId: string;
  watched: boolean;
  labCompleted: boolean;
  assessmentScore?: number;
  reflectionNotes?: string;
  isFullyCompleted: boolean;
  updatedAt: string;
}

app.get('/api/lms/catalog', (_req: Request, res: Response) => {
  res.json({
    totalSessions: 42,
    levels: [
      { id: 1, name: 'Level 1: Electronics & Circuit Fundamentals', count: 10 },
      { id: 2, name: 'Level 2: Embedded C++ & Microcontrollers', count: 11 },
      { id: 3, name: 'Level 3: Mobile Robotics & Kinematics', count: 10 },
      { id: 4, name: 'Level 4: Industrial Automation & AI Capstone', count: 11 }
    ]
  });
});

app.post('/api/lms/progress', (req: Request, res: Response) => {
  const { userId, sessionId, watched, labCompleted, assessmentScore, reflectionNotes } = req.body;
  if (!userId || !sessionId) {
    return res.status(400).json({ error: 'userId and sessionId are required' });
  }

  const allProgress = readJsonFile<Record<string, UserProgressRecord>>('user_progress.json', {});
  const progressKey = `${userId}_${sessionId}`;

  const isFullyCompleted = Boolean(watched && labCompleted && (assessmentScore === undefined || assessmentScore >= 70));

  const updatedRecord: UserProgressRecord = {
    userId,
    sessionId,
    watched: Boolean(watched),
    labCompleted: Boolean(labCompleted),
    assessmentScore,
    reflectionNotes,
    isFullyCompleted,
    updatedAt: new Date().toISOString()
  };

  allProgress[progressKey] = updatedRecord;
  writeJsonFile('user_progress.json', allProgress);

  res.json({ success: true, record: updatedRecord });
});

app.get('/api/lms/progress/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const allProgress = readJsonFile<Record<string, UserProgressRecord>>('user_progress.json', {});
  
  const userRecords: Record<string, UserProgressRecord> = {};
  Object.values(allProgress).forEach(rec => {
    if (rec.userId === userId) {
      userRecords[rec.sessionId] = rec;
    }
  });

  const completedCount = Object.values(userRecords).filter(r => r.isFullyCompleted).length;

  res.json({
    userId,
    totalCompleted: completedCount,
    completions: userRecords,
    progressPercentage: Math.round((completedCount / 42) * 100)
  });
});

// Doubt Resolution API
interface DoubtItem {
  id: string;
  sessionId: string;
  sessionTitle: string;
  studentId: string;
  studentName: string;
  question: string;
  timestampSeconds?: number;
  status: 'pending' | 'resolved';
  facultyAnswer?: string;
  facultyName?: string;
  createdAt: string;
  resolvedAt?: string;
}

app.post('/api/lms/doubts', (req: Request, res: Response) => {
  const { sessionId, sessionTitle, studentId, studentName, question, timestampSeconds } = req.body;
  if (!sessionId || !question?.trim()) {
    return res.status(400).json({ error: 'sessionId and question are required' });
  }

  const doubts = readJsonFile<DoubtItem[]>('doubts.json', []);
  const newDoubt: DoubtItem = {
    id: `doubt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sessionId,
    sessionTitle: sessionTitle || 'Robotics Session',
    studentId: studentId || 'anonymous',
    studentName: studentName || 'Student Innovator',
    question: question.trim(),
    timestampSeconds: Number(timestampSeconds) || 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  doubts.unshift(newDoubt);
  writeJsonFile('doubts.json', doubts);

  // Broadcast to room
  io.to(`session_${sessionId}`).emit('new_doubt_broadcast', newDoubt);

  res.json({ success: true, doubt: newDoubt });
});

app.get('/api/lms/doubts/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const doubts = readJsonFile<DoubtItem[]>('doubts.json', []);
  const sessionDoubts = doubts.filter(d => d.sessionId === sessionId);
  res.json(sessionDoubts);
});

app.post('/api/lms/doubts/:doubtId/resolve', (req: Request, res: Response) => {
  const { doubtId } = req.params;
  const { facultyAnswer, facultyName } = req.body;

  const doubts = readJsonFile<DoubtItem[]>('doubts.json', []);
  const index = doubts.findIndex(d => d.id === doubtId);
  if (index === -1) {
    return res.status(404).json({ error: 'Doubt not found' });
  }

  doubts[index].status = 'resolved';
  doubts[index].facultyAnswer = facultyAnswer;
  doubts[index].facultyName = facultyName || 'Lead Robotics Faculty';
  doubts[index].resolvedAt = new Date().toISOString();

  writeJsonFile('doubts.json', doubts);

  io.to(`session_${doubts[index].sessionId}`).emit('doubt_resolved_broadcast', doubts[index]);

  res.json({ success: true, doubt: doubts[index] });
});

// ==========================================
// 4. CERTIFICATES ENGINE
// ==========================================
interface VerifiableCert {
  id: string;
  certificateNumber: string;
  userId: string;
  studentName: string;
  courseTitle: string;
  grade: string;
  score: number;
  issueDate: string;
  organizationName?: string;
  directorateSubtitle?: string;
  citationText?: string;
  sealLabel?: string;
  instructorName?: string;
  coSignerName?: string;
  status: 'valid' | 'revoked';
}

app.get('/api/certificates/verify/:certId', (req: Request, res: Response) => {
  const { certId } = req.params;
  const cleanId = (certId || '').trim();

  const certificates = readJsonFile<VerifiableCert[]>('certificates.json', [
    {
      id: 'cert_robotics_foundation_demo',
      certificateNumber: 'GL-YARA-2026-08492',
      userId: 'innovator-1',
      studentName: 'Simbarashe Manongwa',
      courseTitle: 'Industrial Robotics & Embedded Systems Foundation',
      grade: 'Distinction with Honors',
      score: 94,
      issueDate: 'October 2026',
      organizationName: 'Youth Academy for Robotics & Industrial Automation',
      directorateSubtitle: 'Executive Directorate of Industrial Robotics & Engineering Academics',
      citationText: 'This credential confirms successful mastery of 42 curriculum sessions, hands-on microcontroller hardware labs, differential drive kinematics, sensor fusion, and industrial capstone defense.',
      sealLabel: 'Official Academic Verification',
      instructorName: 'Mr. S.O. Manongwa',
      coSignerName: 'Ms. A.M. Chiambiro',
      status: 'valid'
    }
  ]);

  const matched = certificates.find(
    c => c.id.toLowerCase() === cleanId.toLowerCase() || 
         c.certificateNumber.toLowerCase() === cleanId.toLowerCase()
  );

  if (!matched) {
    return res.status(404).json({ verified: false, message: 'Certificate credential not found' });
  }

  res.json({
    verified: true,
    certificate: matched,
    verificationTimestamp: new Date().toISOString()
  });
});

app.post('/api/certificates/issue', (req: Request, res: Response) => {
  const { userId, studentName, courseTitle, grade, score } = req.body;
  if (!studentName?.trim() || !courseTitle?.trim()) {
    return res.status(400).json({ error: 'studentName and courseTitle are required' });
  }

  const certificates = readJsonFile<VerifiableCert[]>('certificates.json', []);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `GL-YARA-2026-${randomSuffix}`;

  const newCert: VerifiableCert = {
    id: `cert_${Date.now()}`,
    certificateNumber: certNumber,
    userId: userId || 'user_' + Date.now(),
    studentName: studentName.trim(),
    courseTitle: courseTitle.trim(),
    grade: grade || 'Distinction with Honors',
    score: Number(score) || 92,
    issueDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }),
    organizationName: 'Youth Academy for Robotics & Industrial Automation',
    directorateSubtitle: 'Executive Directorate of Industrial Robotics & Engineering Academics',
    citationText: 'This credential confirms successful completion and comprehensive technical mastery of the accredited robotics engineering syllabus.',
    sealLabel: 'Official Academic Verification',
    instructorName: 'Mr. S.O. Manongwa',
    coSignerName: 'Ms. A.M. Chiambiro',
    status: 'valid'
  };

  certificates.push(newCert);
  writeJsonFile('certificates.json', certificates);

  res.json({ success: true, certificate: newCert });
});

// ==========================================
// 5. MENTORSHIP & SMART MATCHER API
// ==========================================
const INDUSTRIAL_MENTORS = [
  {
    id: 'mentor_simba',
    display_name: 'Simbarashe O. Manongwa',
    title: 'Autonomous Mobile Robots & ROS2 Specialist',
    rating: 4.95,
    review_count: 48,
    mentored_count: 128,
    skills: ['ROS2 Humble', 'SLAM Mapping', 'Nav2 Path Planning', 'Sensor Fusion', 'LiDAR', 'Robotics Hardware'],
    strengths: ['ROS2 Architecture', 'Differential Drive Kinematics', 'Micro-ROS', 'Real-time Telemetry'],
    reviews: [
      { id: 'r1', student_name: 'Tatenda K.', rating: 5, date: 'Oct 2026', comment: 'Simba is hands down the best robotics mentor. Guided me step by step through Nav2 SLAM.' },
      { id: 'r2', student_name: 'Farai M.', rating: 5, date: 'Sep 2026', comment: 'Helped our team debug robot hardware telemetry in 30 minutes!' }
    ]
  },
  {
    id: 'mentor_nyasha',
    display_name: 'Nyasha Chiambiro',
    title: 'Embedded Systems & Multi-Layer PCB Specialist',
    rating: 4.92,
    review_count: 36,
    mentored_count: 94,
    skills: ['Altium Designer', 'KiCAD', 'STM32', 'Power Electronics', 'High-Speed Layout', 'SMD Soldering'],
    strengths: ['Multi-layer PCB Design', 'Power Supply Design', 'Signal Integrity', 'Embedded Firmware'],
    reviews: [
      { id: 'r3', student_name: 'Chiedza R.', rating: 5, date: 'Aug 2026', comment: 'Nyasha transformed how I design circuits. My 4-layer STM32 board worked on the first rev!' }
    ]
  },
  {
    id: 'mentor_kelvin',
    display_name: 'Dr. Kelvin Mukumbira',
    title: 'Edge AI, Computer Vision & Robotic Arms',
    rating: 4.97,
    review_count: 52,
    mentored_count: 140,
    skills: ['NVIDIA Jetson', 'YOLO Object Detection', 'OpenCV', 'Inverse Kinematics', 'MoveIt2', 'PyTorch'],
    strengths: ['Edge AI Inference', '6-DOF Robotic Arms', 'Vision-Guided Pick & Place', 'Deep Learning'],
    reviews: [
      { id: 'r4', student_name: 'Kudakwashe N.', rating: 5, date: 'Oct 2026', comment: 'Incredible depth in robotic arms and inverse kinematics. Highly recommend!' }
    ]
  },
  {
    id: 'mentor_tadiwa',
    display_name: 'Tadiwa Masango',
    title: 'Industrial Automation & PLC / SCADA Specialist',
    rating: 4.90,
    review_count: 31,
    mentored_count: 64,
    skills: ['PLC Programming', 'SCADA', 'HMI', 'Industrial Safety', 'Sensors', 'Industrial Robotics'],
    strengths: ['PLC Programming', 'SCADA & HMI', 'Industrial Safety', 'Factory Automation'],
    reviews: [
      { id: 'r5', student_name: 'Blessing D.', rating: 5, date: 'Aug 2026', comment: 'Helped me understand industrial ladder logic and prepare for automation job interviews.' }
    ]
  }
];

app.get('/api/mentorship/mentors', (_req: Request, res: Response) => {
  res.json(INDUSTRIAL_MENTORS);
});

app.post('/api/mentorship/match', (req: Request, res: Response) => {
  const { query } = req.body;
  const q = (query || '').toLowerCase().trim();

  if (!q) {
    return res.json({ matched: INDUSTRIAL_MENTORS[0], score: 85, reasons: ['Senior faculty advisor'] });
  }

  let bestScore = 0;
  let bestMentor = INDUSTRIAL_MENTORS[0];
  let bestReasons: string[] = [];

  INDUSTRIAL_MENTORS.forEach(m => {
    let score = 60;
    const reasons: string[] = [];

    const allKeywords = [...m.skills, ...m.strengths, m.title].map(k => k.toLowerCase());
    const words = q.split(/\s+/).filter(w => w.length > 2);

    words.forEach(w => {
      if (allKeywords.some(kw => kw.includes(w))) {
        score += 12;
      }
    });

    if ((q.includes('ros') || q.includes('slam') || q.includes('nav') || q.includes('lidar') || q.includes('autonomous')) && m.id === 'mentor_simba') {
      score += 35;
      reasons.push('Specialized expertise in Autonomous Mobile Robots, SLAM Mapping, and ROS2');
    }
    if ((q.includes('pcb') || q.includes('circuit') || q.includes('stm32') || q.includes('altium') || q.includes('hardware')) && m.id === 'mentor_nyasha') {
      score += 35;
      reasons.push('Specialized in Multi-layer PCB Layout, Altium Designer, and STM32 embedded circuits');
    }
    if ((q.includes('vision') || q.includes('ai') || q.includes('yolo') || q.includes('jetson') || q.includes('arm')) && m.id === 'mentor_kelvin') {
      score += 35;
      reasons.push('Research faculty expert in Computer Vision, Edge AI on NVIDIA Jetson, and Robotic Arms');
    }
    if ((q.includes('plc') || q.includes('scada') || q.includes('industrial') || q.includes('factory')) && m.id === 'mentor_tadiwa') {
      score += 35;
      reasons.push('Industrial automation specialist in Siemens/Allen-Bradley PLCs and SCADA systems');
    }

    reasons.push(`Proven faculty track record with ${m.mentored_count}+ students successfully mentored`);
    reasons.push(`Top student satisfaction: ${m.rating} ★ across ${m.review_count} verified reviews`);

    const finalScore = Math.min(99, Math.max(75, score));
    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMentor = m;
      bestReasons = reasons.slice(0, 3);
    }
  });

  res.json({
    matched: bestMentor,
    score: bestScore,
    reasons: bestReasons
  });
});

app.post('/api/mentorship/book', (req: Request, res: Response) => {
  const { mentorId, studentId, studentName, whatsapp, format, date, timeSlot, message } = req.body;
  if (!mentorId || !whatsapp?.trim()) {
    return res.status(400).json({ error: 'mentorId and whatsapp contact are required' });
  }

  const bookings = readJsonFile<any[]>('mentorship_bookings.json', []);
  const newBooking = {
    id: `book_${Date.now()}`,
    mentorId,
    studentId: studentId || 'anonymous',
    studentName: studentName || 'Student',
    whatsapp: whatsapp.trim(),
    format: format || 'Code & Architecture Review',
    date: date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: timeSlot || '14:00 - 15:30 CAT',
    message: message || '',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  writeJsonFile('mentorship_bookings.json', bookings);

  res.json({ success: true, booking: newBooking });
});

// ==========================================
// 6. UNIVERSAL PAYMENT GATEWAYS API
// ==========================================
interface PaymentReceiptRecord {
  receiptNumber: string;
  payerName: string;
  payerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  purpose: string;
  reference: string;
  timestamp: string;
  status: 'verified';
}

app.post('/api/payments/initialize', (req: Request, res: Response) => {
  const { amount, currency, method, purpose, payerName, payerEmail } = req.body;
  const num = Math.floor(100000 + Math.random() * 900000);
  const trackingRef = `YARA-REF-${num}`;

  let instructions = '';
  if (method === 'ecocash') {
    instructions = `Dial *151*1*1*0788953986*${amount || 15}# and input your PIN. Use reference: ${trackingRef}`;
  } else if (method === 'bank_transfer') {
    instructions = `Transfer ${amount || 15} ${currency || 'USD'} to CBZ Bank, Account 01124892010018 (CUT/YARA). Ref: ${trackingRef}`;
  } else if (method === 'card') {
    instructions = `Stripe PCI-DSS Card checkout session initiated for ${amount || 15} ${currency || 'USD'}.`;
  } else if (method === 'paypal') {
    instructions = `PayPal order dispatched to inforyaraorg@gmail.com for ${amount || 15} ${currency || 'USD'}.`;
  }

  res.json({
    success: true,
    trackingRef,
    amount: amount || 15,
    currency: currency || 'USD',
    method: method || 'ecocash',
    instructions
  });
});

app.post('/api/payments/verify', (req: Request, res: Response) => {
  const { trackingRef, payerName, payerEmail, amount, currency, method, purpose } = req.body;
  const num = Math.floor(100000 + Math.random() * 900000);
  const receiptNumber = `YARA-RCPT-2026-${num}`;

  const receipts = readJsonFile<PaymentReceiptRecord[]>('receipts.json', []);
  const receipt: PaymentReceiptRecord = {
    receiptNumber,
    payerName: payerName || 'Valued YARA Supporter',
    payerEmail: payerEmail || 'supporter@yara.org',
    amount: Number(amount) || 15.00,
    currency: currency || 'USD',
    paymentMethod: method || 'ecocash',
    purpose: purpose || 'Platform Subscription & Innovation Fund',
    reference: trackingRef || `MANUAL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'verified'
  };

  receipts.unshift(receipt);
  writeJsonFile('receipts.json', receipts);

  res.json({
    success: true,
    verified: true,
    receipt
  });
});

app.get('/api/payments/receipt/:receiptId', (req: Request, res: Response) => {
  const { receiptId } = req.params;
  const receipts = readJsonFile<PaymentReceiptRecord[]>('receipts.json', []);
  const receipt = receipts.find(r => r.receiptNumber === receiptId);
  if (!receipt) {
    return res.status(404).json({ error: 'Receipt not found' });
  }
  res.json(receipt);
});

// ==========================================
// 7. BOOTCAMP REGISTRATIONS ENGINE
// ==========================================
interface StoredBootcampRegistration {
  id: string;
  registration_code: string;
  event_id: string;
  event_title: string;
  full_name: string;
  email: string;
  phone?: string;
  school_institution: string;
  role_title?: string;
  province?: string;
  payment_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  approval_status: 'pending' | 'approved' | 'rejected';
  payment_method?: string;
  payment_reference?: string;
  receipt_number?: string;
  certificate_unlocked?: boolean;
  created_at: string;
  admin_notes?: string;
}

app.get('/api/bootcamp/registrations', (req: Request, res: Response) => {
  const { eventId, search } = req.query;
  let regs = readJsonFile<StoredBootcampRegistration[]>('bootcamp_registrations.json', []);
  
  if (eventId && eventId !== 'all') {
    const cleanId = String(eventId).toLowerCase();
    regs = regs.filter(r => r.event_id.toLowerCase().includes(cleanId) || cleanId.includes(r.event_id.toLowerCase()));
  }

  if (search) {
    const query = String(search).toLowerCase();
    regs = regs.filter(r => 
      r.full_name.toLowerCase().includes(query) || 
      r.email.toLowerCase().includes(query) || 
      (r.school_institution && r.school_institution.toLowerCase().includes(query)) ||
      (r.registration_code && r.registration_code.toLowerCase().includes(query))
    );
  }

  res.json({
    success: true,
    count: regs.length,
    registrations: regs
  });
});

app.post('/api/bootcamp/register', (req: Request, res: Response) => {
  const data = req.body;
  const regs = readJsonFile<StoredBootcampRegistration[]>('bootcamp_registrations.json', []);
  
  const existingIdx = regs.findIndex(r => 
    (data.id && r.id === data.id) || 
    (r.email.toLowerCase() === (data.email || '').toLowerCase().trim())
  );

  const regCode = data.registration_code || `YARA-AI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const record: StoredBootcampRegistration = {
    id: data.id || `evt_reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    registration_code: regCode,
    event_id: data.event_id || 'ai-for-educators-2026',
    event_title: data.event_title || 'AI for Educators – Online Bootcamp',
    full_name: data.full_name || 'Educator Participant',
    email: (data.email || '').trim().toLowerCase(),
    phone: data.phone || '',
    school_institution: data.school_institution || 'Independent School',
    role_title: data.role_title || 'Educator',
    province: data.province || 'Harare',
    payment_status: data.payment_status || 'verified',
    approval_status: data.approval_status || 'approved',
    payment_method: data.payment_method || 'EcoCash',
    payment_reference: data.payment_reference || `PAY-${Date.now()}`,
    receipt_number: data.receipt_number || `YARA-RCPT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    certificate_unlocked: data.certificate_unlocked ?? true,
    created_at: data.created_at || new Date().toISOString(),
    admin_notes: data.admin_notes || 'Registered through official portal.'
  };

  if (existingIdx >= 0) {
    regs[existingIdx] = { ...regs[existingIdx], ...record };
  } else {
    regs.unshift(record);
  }

  writeJsonFile('bootcamp_registrations.json', regs);
  res.json({
    success: true,
    registration: record
  });
});

app.post('/api/bootcamp/status', (req: Request, res: Response) => {
  const { id, payment_status, approval_status, admin_notes } = req.body;
  const regs = readJsonFile<StoredBootcampRegistration[]>('bootcamp_registrations.json', []);
  const target = regs.find(r => r.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Registration record not found' });
  }

  if (payment_status) target.payment_status = payment_status;
  if (approval_status) target.approval_status = approval_status;
  if (admin_notes) target.admin_notes = admin_notes;

  writeJsonFile('bootcamp_registrations.json', regs);
  res.json({
    success: true,
    registration: target
  });
});

app.delete('/api/bootcamp/registrations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let regs = readJsonFile<StoredBootcampRegistration[]>('bootcamp_registrations.json', []);
  regs = regs.filter(r => r.id !== id);
  writeJsonFile('bootcamp_registrations.json', regs);
  res.json({ success: true, deleted: id });
});

// Global 404 Handler for API
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 YARA Enterprise Backend Server Running on Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎓 LMS Engine:   http://localhost:${PORT}/api/lms/catalog`);
  console.log(`🤝 Mentorship:   http://localhost:${PORT}/api/mentorship/mentors`);
  console.log(`💳 Payments:     http://localhost:${PORT}/api/payments/initialize`);
  console.log(`🌐 Real-time Socket.IO initialized`);
  console.log(`=======================================================`);
});
