// ==============================================================================
// YARA ACADEMY: ROBOTICS & ENGINEERING TRAINING SERVICE
// ==============================================================================

import { supabase } from '../lib/supabase';
import { 
  RoboticsProgramme, 
  RoboticsCertificationPathway, 
  RoboticsLearnerEnrolment,
  RoboticsLearningPassport,
  RoboticsTeacherEnrolment,
  RoboticsSchoolPartnershipRequest,
  RoboticsAttendanceRecord,
  RoboticsAssessmentRecord,
  RoboticsCertificationLevelId,
  RoboticsProgrammeId,
  StudentGroupEntry
} from '../types/roboticsTraining';

const STORAGE_KEYS = {
  ENROLMENTS: 'yara_robotics_enrolments_v1',
  TEACHERS: 'yara_robotics_teachers_v1',
  PARTNERSHIPS: 'yara_robotics_partnerships_v1',
  ATTENDANCE: 'yara_robotics_attendance_v1',
  ASSESSMENTS: 'yara_robotics_assessments_v1',
  CERTIFICATES: 'yara_robotics_certificates_v1'
};

// ------------------------------------------------------------------------------
// 1. OFFICIAL PROGRAMMES CATALOG WITH SPECIFIED PRICING
// ------------------------------------------------------------------------------
export const ROBOTICS_PROGRAMMES_CATALOG: RoboticsProgramme[] = [
  {
    id: 'curriculum_primary',
    title: 'Curriculum-Based Robotics (Primary)',
    category: 'curriculum',
    targetAudience: 'Primary School (Grades 1 – 7)',
    ageRange: '6 – 12 Years',
    feePerLearner: 25,
    feeStructure: 'complete_programme',
    durationDescription: 'Full Primary Syllabus (Term-based)',
    minimumLessonsOrSessions: 10,
    description: 'Structured, hands-on foundational robotics syllabus integrating block coding, visual electronics, simple machines, and creative motor control.',
    features: [
      'Full primary syllabus coverage with teacher guide',
      'Visual Scratch block programming & breadboard logic',
      'Interactive sensors (light, ultrasonic, touch)',
      'Certificate of Completion upon syllabus sign-off'
    ],
    syllabusTopics: [
      'Introduction to Robots & Safety',
      'Ohm’s Law & Light Up LEDs',
      'Sensors as Senses (Sight, Distance, Touch)',
      'Motors, Wheels & Chassis Assembly',
      'Mini Maze Navigation Project'
    ],
    badge: '$25 Complete Syllabus',
    isPopular: true
  },
  {
    id: 'curriculum_highschool',
    title: 'Curriculum-Based Robotics (High School)',
    category: 'curriculum',
    targetAudience: 'High School (Forms 1 – 6)',
    ageRange: '13 – 19 Years',
    feePerLearner: 40,
    feeStructure: 'complete_programme',
    durationDescription: 'Full Secondary Syllabus (Term-based)',
    minimumLessonsOrSessions: 12,
    description: 'Rigorous STEM curriculum bridging embedded C++, Arduino/ESP32 architecture, robotic kinematics, autonomous algorithms, and real-world engineering design.',
    features: [
      'Comprehensive secondary robotics syllabus',
      'Embedded C++ firmware and Arduino/ESP32 coding',
      'Line-following, obstacle avoidance & PWM motor control',
      'Engineering notebook documentation & technical project defense'
    ],
    syllabusTopics: [
      'Microcontroller Architecture & Digital I/O',
      'Pulse Width Modulation (PWM) & Motor Drivers',
      'Autonomous Sensor Fusion (IR + Ultrasonic)',
      'PID Control Loops & Line Tracking',
      'Robotics Capstone Defense'
    ],
    badge: '$40 Complete Syllabus',
    isPopular: true
  },
  {
    id: 'weekly_club_primary',
    title: 'Weekly Robotics Clubs (Primary)',
    category: 'club',
    targetAudience: 'Primary School Clubs',
    ageRange: '7 – 12 Years',
    feePerLearner: 5,
    feeStructure: 'per_session',
    durationDescription: 'Weekly 90-minute Sessions (Term-long)',
    minimumLessonsOrSessions: 10,
    description: 'Energetic after-school club where kids build, race, and code fun robot contraptions each week in small collaborative peer squads.',
    features: [
      'Weekly hands-on build challenges',
      'Team robot racing and maze puzzles',
      'Continuous skill progression'
    ],
    syllabusTopics: [
      'Robot Chassis Design',
      'Obstacle Navigators',
      'Sumo Bot Challenges',
      'Clean Energy & Solar Power'
    ],
    badge: '$5 Per Session'
  },
  {
    id: 'weekly_club_secondary',
    title: 'Weekly Robotics Clubs (Secondary)',
    category: 'club',
    targetAudience: 'Secondary & High School Clubs',
    ageRange: '13 – 18 Years',
    feePerLearner: 5,
    feeStructure: 'per_session',
    durationDescription: 'Weekly 2-hour Sessions (Term-long)',
    minimumLessonsOrSessions: 12,
    description: 'Advanced innovation lab sessions focusing on competitive robotics, autonomous maze exploration, and underwater drone prototyping.',
    features: [
      'Competitive robotics league preparation',
      'CAD 3D modeling and mechanical chassis builds',
      'Telemetry, IoT and wireless communication'
    ],
    syllabusTopics: [
      'Competition Maze Mapping',
      'Underwater ROV Thrusters',
      'Wireless Bluetooth / Wi-Fi Telemetry',
      'Team Hackathon Sprints'
    ],
    badge: '$5 Per Session'
  },
  {
    id: 'monthly_workshop_primary',
    title: 'Monthly Robotics Workshops (Primary)',
    category: 'workshop',
    targetAudience: 'Weekend Learners & Beginners',
    ageRange: '6 – 12 Years',
    feePerLearner: 5,
    feeStructure: 'per_session',
    durationDescription: 'Monthly Saturday Intensives (3 Hours)',
    description: 'Immersive weekend discovery workshops where young innovators dive deep into a specific invention topic from biomimicry to robotic arms.',
    features: [
      'Take-home robot project files',
      'Zero prior experience required',
      'Engaging certified YARA mentors'
    ],
    syllabusTopics: [
      'Hydraulic Robotic Grippers',
      'Smart Traffic Lights',
      'Solar Buggie Construction'
    ],
    badge: '$5 Per Session'
  },
  {
    id: 'monthly_workshop_secondary',
    title: 'Monthly Robotics Workshops (Secondary)',
    category: 'workshop',
    targetAudience: 'Secondary Students & STEM Hobbyists',
    ageRange: '13 – 19 Years',
    feePerLearner: 5,
    feeStructure: 'per_session',
    durationDescription: 'Monthly Saturday Intensives (4 Hours)',
    description: 'Intensive deep-dive masterclasses covering sensor calibration, edge AI, computer vision camera tracking, and industrial automation.',
    features: [
      'Advanced hardware experimentation',
      'Direct mentorship from engineering practitioners',
      'Portfolio-grade project deliverables'
    ],
    syllabusTopics: [
      'ESP32 Camera Vision Tracking',
      'Inverse Kinematics of 4-Axis Arm',
      'Edge Machine Learning for Voice Commands'
    ],
    badge: '$5 Per Session'
  },
  {
    id: 'comprehensive_certification',
    title: 'Comprehensive Robotics Training & Certification',
    category: 'certification',
    targetAudience: 'Learners seeking formal accredited milestones',
    ageRange: 'All Ages (ECD to Tertiary)',
    feePerLearner: 5,
    feeStructure: 'per_lesson',
    durationDescription: 'Flexible lesson schedule with progressive assessment gates',
    minimumLessonsOrSessions: 10,
    description: 'The standard pathway for structured, audited robotics credentials. Certification is awarded after mandatory attendance, skill evaluations, and project defenses.',
    features: [
      '$5 per lesson pay-as-you-progress',
      'Official YARA Digital Certificate with QR verification',
      'Graded assessments across hardware, code, and project defense'
    ],
    syllabusTopics: [
      'Level 1: Robotics Explorer',
      'Level 2: Junior Robotics',
      'Level 3: Secondary Robotics',
      'Level 4: Advanced Robotics & Engineering'
    ],
    badge: '$5 Per Lesson'
  },
  {
    id: 'holiday_bootcamp_junior',
    title: 'Holiday Robotics Bootcamp (Junior Explorer)',
    category: 'bootcamp',
    targetAudience: 'Holiday break learners (ECD – Grade 7)',
    ageRange: '6 – 12 Years',
    feePerLearner: 20,
    feeStructure: 'complete_programme',
    durationDescription: '3-Day Intensive Holiday Build Camp (9:00 AM – 1:00 PM)',
    minimumLessonsOrSessions: 6,
    description: 'An action-packed holiday experience where learners spend school break turning ideas into moving robots, building friend networks, and presenting team creations.',
    features: [
      '3 full days of hands-on robot building',
      'Daily take-home projects and fun challenges',
      'Bootcamp Explorer Certificate of Achievement'
    ],
    syllabusTopics: [
      'Day 1: Electronic Circuits & Light Shows',
      'Day 2: Motorized Roaming Robots',
      'Day 3: Grand Arena Maze Showdown'
    ],
    badge: 'Holiday Accelerator',
    isPopular: true
  },
  {
    id: 'holiday_bootcamp_senior',
    title: 'Holiday Robotics Bootcamp (Senior Innovators)',
    category: 'bootcamp',
    targetAudience: 'Holiday break learners (High School & Tertiary)',
    ageRange: '13 – 20 Years',
    feePerLearner: 35,
    feeStructure: 'complete_programme',
    durationDescription: '5-Day Full-Week Holiday Sprint (9:00 AM – 3:30 PM)',
    minimumLessonsOrSessions: 10,
    description: 'Fast-paced, team-based hardware sprint where high schoolers and university innovators build an autonomous rescue or underwater robot from scratch.',
    features: [
      'Full week engineering immersion',
      'Competition-standard testing arena',
      'Portfolio defense & digital credential'
    ],
    syllabusTopics: [
      'Days 1-2: CAD Mechanics & Sensor Interfacing',
      'Days 3-4: Autonomous Navigation & Microcontroller Firmware',
      'Day 5: Live Project Defense & Awards'
    ],
    badge: 'Holiday Intensive'
  }
];

// ------------------------------------------------------------------------------
// 2. CERTIFICATION PATHWAYS SPECIFICATION
// ------------------------------------------------------------------------------
export const ROBOTICS_PATHWAYS_CATALOG: RoboticsCertificationPathway[] = [
  {
    id: 'level_1_explorer',
    levelNumber: 1,
    levelTitle: 'Level 1 – Robotics Explorer Certificate',
    targetAudience: 'ECD / Infants / Early Primary',
    minimumRequirements: 'Minimum 10 lessons completed + practical mini-build',
    requiredLessonsOrSessions: 10,
    feePerUnit: 5,
    minimumCost: 50,
    color: 'from-sky-500 to-blue-600',
    accentColor: '#00C6FF',
    description: 'Foundational introduction to cause-and-effect electronics, visual block logic, and motor movements for our youngest learners.',
    learningOutcomes: [
      'Identify basic electronic components (battery, switch, LED, DC motor)',
      'Construct closed circuits safely without short circuits',
      'Program simple sequence movements in Scratch block environments',
      'Demonstrate teamwork and safe tool handling'
    ],
    sampleProject: 'Light-Seeking Bug Bot & Musical Doorbell'
  },
  {
    id: 'level_2_junior',
    levelNumber: 2,
    levelTitle: 'Level 2 – Junior Robotics Certificate',
    targetAudience: 'Grades 3 – 7 (Primary)',
    minimumRequirements: 'Minimum 10 lessons completed + sensor obstacle project',
    requiredLessonsOrSessions: 10,
    feePerUnit: 5,
    minimumCost: 50,
    color: 'from-blue-600 to-indigo-700',
    accentColor: '#1976D2',
    description: 'Intermediate robotic design with input sensors, logic decisions, and autonomous two-wheel drive chassis mechanics.',
    learningOutcomes: [
      'Understand voltage, current, resistance and sensor dividers',
      'Interface ultrasonic distance and infrared line sensors',
      'Write conditional if-else loops for autonomous obstacle evasion',
      'Assemble a durable dual-motor chassis with castor wheel'
    ],
    prerequisites: 'Level 1 or teacher recommendation',
    sampleProject: 'Autonomous Obstacle-Evading Rover'
  },
  {
    id: 'level_3_secondary',
    levelNumber: 3,
    levelTitle: 'Level 3 – Secondary Robotics Certificate',
    targetAudience: 'High School (Forms 1 – 6)',
    minimumRequirements: 'Minimum 12 sessions completed + autonomous maze defense',
    requiredLessonsOrSessions: 12,
    feePerUnit: 5,
    minimumCost: 60,
    isProvisionalPricing: true,
    color: 'from-indigo-700 to-purple-800',
    accentColor: '#0D47A1',
    description: 'Text-based embedded C++ programming, Arduino/ESP32 systems, PID control loops, and national robotics competition trials.',
    learningOutcomes: [
      'Write modular C++ firmware with functions, interrupts and timers',
      'Implement PWM motor speed regulation and H-bridge drivers',
      'Calibrate sensor arrays for high-speed black line tracking',
      'Produce technical documentation and defend project against rubrics'
    ],
    prerequisites: 'Level 2 Junior Certificate or equivalent electronics knowledge',
    sampleProject: 'Precision Line-Tracking & Maze-Navigating Robot'
  },
  {
    id: 'level_4_advanced',
    levelNumber: 4,
    levelTitle: 'Level 4 – Advanced Robotics & Engineering Certificate',
    targetAudience: 'Tertiary & Advanced High School Innovators',
    minimumRequirements: 'Custom training duration + practical engineering prototype & jury defense',
    requiredLessonsOrSessions: 16,
    feePerUnit: 7.5,
    minimumCost: 120,
    color: 'from-purple-800 to-slate-900',
    accentColor: '#0A1B4D',
    description: 'Applied robotics engineering including computer vision, ROS/ESP-IDF, underwater robotics (ROV), and societal impact deployment in African communities.',
    learningOutcomes: [
      'Develop embedded computer vision for color and marker tracking',
      'Design waterproof enclosures and thruster kinematics for underwater ROVs',
      'Implement cloud telemetry, wireless control and remote diagnostics',
      'Defend a rigorous 21-point engineering report before an expert jury'
    ],
    prerequisites: 'Level 3 Secondary Certificate or tertiary engineering enrollment',
    sampleProject: 'Underwater Exploration ROV or Agri-Tech Crop Scouting Drone'
  },
  {
    id: 'teacher_cpd',
    levelNumber: 5,
    levelTitle: 'Teacher Professional Development Certificate',
    targetAudience: 'Educators, Club Patrons & STEM Facilitators',
    minimumRequirements: 'Minimum 5 intensive sessions ($10/session = $50 min) + curriculum delivery assessment',
    requiredLessonsOrSessions: 5,
    feePerUnit: 10,
    minimumCost: 50,
    color: 'from-emerald-600 to-teal-800',
    accentColor: '#10B981',
    description: 'Professional accreditation empowering classroom teachers to lead school robotics clubs, teach STEM curricula, and prepare teams for competitions.',
    learningOutcomes: [
      'Master classroom management of hardware components and robotics kits',
      'Integrate robotics lessons seamlessly into national school timetables',
      'Diagnose and troubleshoot common student wiring and code bugs',
      'Coach competitive robotics teams adhering to official rubrics'
    ],
    sampleProject: 'School Robotics Club Term Curriculum & Lesson Plan Portfolio'
  }
];

// Helper storage functions
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`LocalStorage write error for ${key}:`, err);
  }
}

// ------------------------------------------------------------------------------
// SERVICE METHODS
// ------------------------------------------------------------------------------
export const roboticsTrainingService = {
  // Catalog retrieval
  getProgrammes: (): RoboticsProgramme[] => {
    return ROBOTICS_PROGRAMMES_CATALOG;
  },

  getProgrammeById: (id: string): RoboticsProgramme | undefined => {
    return ROBOTICS_PROGRAMMES_CATALOG.find(p => p.id === id);
  },

  getPathways: (): RoboticsCertificationPathway[] => {
    return ROBOTICS_PATHWAYS_CATALOG;
  },

  getPathwayById: (id: string): RoboticsCertificationPathway | undefined => {
    return ROBOTICS_PATHWAYS_CATALOG.find(p => p.id === id);
  },

  // Calculate dynamic fees based on selections
  calculateEnrolmentFee: (
    programmeId: RoboticsProgrammeId,
    learnerCount: number,
    includeHardwareKit: boolean = false,
    certificationLevelId?: RoboticsCertificationLevelId
  ): {
    calculatedFee: number;
    hardwareKitFee: number;
    totalPayable: number;
    breakdownText: string;
  } => {
    const programme = ROBOTICS_PROGRAMMES_CATALOG.find(p => p.id === programmeId);
    const count = Math.max(1, learnerCount || 1);
    const kitUnitCost = 50; // $50 standard starter hardware kit

    let baseFee = 25 * count;
    let breakdown = '';

    if (programme) {
      if (programme.feeStructure === 'complete_programme') {
        baseFee = programme.feePerLearner * count;
        breakdown = `${count} learner(s) × $${programme.feePerLearner} (Complete programme)`;
      } else if (programme.feeStructure === 'per_session') {
        baseFee = programme.feePerLearner * count;
        breakdown = `${count} learner(s) × $${programme.feePerLearner} per session`;
      } else if (programme.feeStructure === 'per_lesson') {
        // Certification per lesson
        const pathway = ROBOTICS_PATHWAYS_CATALOG.find(p => p.id === certificationLevelId);
        const minLessons = pathway?.requiredLessonsOrSessions || 10;
        baseFee = programme.feePerLearner * minLessons * count;
        breakdown = `${count} learner(s) × ${minLessons} lessons @ $${programme.feePerLearner}/lesson`;
      }
    }

    const kitFee = includeHardwareKit ? kitUnitCost * count : 0;
    const total = baseFee + kitFee;

    return {
      calculatedFee: baseFee,
      hardwareKitFee: kitFee,
      totalPayable: total,
      breakdownText: breakdown
    };
  },

  // Learner Enrolment
  submitEnrolment: async (payload: Omit<RoboticsLearnerEnrolment, 'id' | 'created_at'>): Promise<RoboticsLearnerEnrolment> => {
    const id = 'r_enrol_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newEnrolment: RoboticsLearnerEnrolment = {
      ...payload,
      id,
      created_at: new Date().toISOString()
    };

    const current = getLocal<RoboticsLearnerEnrolment[]>(STORAGE_KEYS.ENROLMENTS, []);
    setLocal(STORAGE_KEYS.ENROLMENTS, [newEnrolment, ...current]);

    // Async attempt to persist in Supabase
    try {
      await supabase.from('robotics_enrolments').insert({
        id: newEnrolment.id,
        user_id: newEnrolment.userId,
        enrolment_type: newEnrolment.enrolmentType,
        primary_contact_name: newEnrolment.primaryContactName,
        primary_contact_email: newEnrolment.primaryContactEmail,
        primary_contact_phone: newEnrolment.primaryContactPhone,
        school_or_chapter_name: newEnrolment.schoolOrChapterName,
        grade_or_education_level: newEnrolment.gradeOrEducationLevel,
        programme_id: newEnrolment.programmeId,
        programme_title: newEnrolment.programmeTitle,
        certification_level_id: newEnrolment.certificationLevelId,
        location_option: newEnrolment.locationOption,
        preferred_schedule: newEnrolment.preferredSchedule,
        students_list: newEnrolment.studentsList,
        learner_count: newEnrolment.learnerCount,
        calculated_fee: newEnrolment.calculatedFee,
        include_hardware_kit: newEnrolment.includeHardwareKit,
        hardware_kit_fee: newEnrolment.hardwareKitFee,
        total_payable_amount: newEnrolment.totalPayableAmount,
        payment_status: newEnrolment.paymentStatus,
        enrolment_status: newEnrolment.enrolmentStatus,
        notes: newEnrolment.notes,
        created_at: newEnrolment.created_at
      });
    } catch (err) {
      console.warn('Supabase remote insert fallback to local storage:', err);
    }

    return newEnrolment;
  },

  getAllEnrolments: async (): Promise<RoboticsLearnerEnrolment[]> => {
    try {
      const { data, error } = await supabase
        .from('robotics_enrolments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          created_at: d.created_at,
          userId: d.user_id,
          enrolmentType: d.enrolment_type || 'individual',
          primaryContactName: d.primary_contact_name,
          primaryContactEmail: d.primary_contact_email,
          primaryContactPhone: d.primary_contact_phone,
          parentOrGuardianName: d.parent_guardian_name,
          schoolOrChapterName: d.school_or_chapter_name,
          gradeOrEducationLevel: d.grade_or_education_level,
          programmeId: d.programme_id,
          programmeTitle: d.programme_title,
          certificationLevelId: d.certification_level_id,
          locationOption: d.location_option || 'school_lab',
          preferredSchedule: d.preferred_schedule || 'weekday_afternoon',
          studentsList: d.students_list || [],
          learnerCount: d.learner_count || 1,
          calculatedFee: Number(d.calculated_fee || 0),
          includeHardwareKit: Boolean(d.include_hardware_kit),
          hardwareKitFee: Number(d.hardware_kit_fee || 0),
          totalPayableAmount: Number(d.total_payable_amount || 0),
          paymentStatus: d.payment_status || 'pending',
          enrolmentStatus: d.enrolment_status || 'submitted',
          assignedTrainerName: d.assigned_trainer_name,
          notes: d.notes
        }));
      }
    } catch {}

    return getLocal<RoboticsLearnerEnrolment[]>(STORAGE_KEYS.ENROLMENTS, []);
  },

  getUserEnrolments: async (userId?: string, userEmail?: string): Promise<RoboticsLearnerEnrolment[]> => {
    const all = await roboticsTrainingService.getAllEnrolments();
    if (!userId && !userEmail) return all.slice(0, 5); // Return demo/recent if guest
    return all.filter(e => 
      (userId && e.userId === userId) || 
      (userEmail && e.primaryContactEmail?.toLowerCase() === userEmail.toLowerCase())
    );
  },

  updateEnrolmentStatus: async (
    enrolmentId: string, 
    status: RoboticsLearnerEnrolment['enrolmentStatus'],
    trainerName?: string
  ): Promise<boolean> => {
    const all = getLocal<RoboticsLearnerEnrolment[]>(STORAGE_KEYS.ENROLMENTS, []);
    const updated = all.map(e => {
      if (e.id === enrolmentId) {
        return {
          ...e,
          enrolmentStatus: status,
          assignedTrainerName: trainerName || e.assignedTrainerName
        };
      }
      return e;
    });
    setLocal(STORAGE_KEYS.ENROLMENTS, updated);

    try {
      await supabase
        .from('robotics_enrolments')
        .update({ 
          enrolment_status: status, 
          assigned_trainer_name: trainerName 
        })
        .eq('id', enrolmentId);
    } catch {}

    return true;
  },

  // Robotics Learning Passport Generator
  getLearningPassport: async (
    userId?: string, 
    learnerName: string = 'YARA Learner',
    schoolName: string = 'St. George’s College Robotics Chapter'
  ): Promise<RoboticsLearningPassport> => {
    const enrolments = await roboticsTrainingService.getUserEnrolments(userId);
    const activeEnrolment = enrolments[0];

    // Determine current level and stats
    const levelId = activeEnrolment?.certificationLevelId || 'level_2_junior';
    const pathway = ROBOTICS_PATHWAYS_CATALOG.find(p => p.id === levelId) || ROBOTICS_PATHWAYS_CATALOG[1];

    const attended = Math.min(pathway.requiredLessonsOrSessions, 8);
    const required = pathway.requiredLessonsOrSessions;
    const progress = Math.round((attended / required) * 100);

    return {
      learnerId: userId || 'demo_learner_01',
      learnerName: activeEnrolment?.primaryContactName || learnerName,
      schoolName: activeEnrolment?.schoolOrChapterName || schoolName,
      gradeLevel: activeEnrolment?.gradeOrEducationLevel || 'Grade 6 / Form 1',
      currentLevel: pathway.id,
      levelTitle: pathway.levelTitle,
      sessionsAttended: attended,
      requiredSessions: required,
      lessonsCompleted: attended,
      totalLessonsRequired: required,
      progressPercentage: progress,
      projectsCompleted: [
        {
          id: 'proj_01',
          title: 'Obstacle-Evading Rover (Dual Infrared)',
          description: 'Constructed 2WD robot chassis with LM393 IR comparator circuit for obstacle rollback.',
          completedDate: '2026-10-15',
          score: 92,
          badge: 'Gold Distinction'
        },
        {
          id: 'proj_02',
          title: 'Ultrasonic Distance Ping Sensor Radar',
          description: 'Interfaced HC-SR04 sonar module with multi-tone piezo buzzer warning system.',
          completedDate: '2026-11-04',
          score: 88,
          badge: 'Merit'
        }
      ],
      skillsAcquired: [
        'Closed Circuit Breadboarding',
        'DC Motor H-Bridge Kinematics',
        'HC-SR04 Sonar Timing',
        'Conditional Control Logic',
        'Soldering & Wire Management',
        'Engineering Logbook Defense'
      ],
      assessmentResults: [
        {
          assessmentName: 'Mid-Term Circuit & Breadboarding Assessment',
          score: 28,
          maxScore: 30,
          date: '2026-10-20',
          feedback: 'Exceptional tidy wiring and deep grasp of current dividers.'
        },
        {
          assessmentName: 'Practical Obstacle Avoidance Trial',
          score: 45,
          maxScore: 50,
          date: '2026-11-10',
          feedback: 'Robot completed maze with zero collisions. Excellent sensor response.'
        }
      ],
      isEligibleForCertificate: attended >= required,
      certificatesEarned: [
        {
          certificateNumber: 'YARA-ROB-2026-0842',
          levelTitle: 'Level 1 – Robotics Explorer Certificate',
          issueDate: '2026-09-30',
          verificationQrHash: 'yara_cert_rob_0842',
          grade: 'Distinction',
          downloadUrl: '/verify-certificate?cert=YARA-ROB-2026-0842'
        }
      ]
    };
  },

  // Teacher Development Portal
  registerTeacher: async (payload: Omit<RoboticsTeacherEnrolment, 'id' | 'created_at' | 'sessionsCompleted' | 'requiredSessions' | 'status' | 'totalCost'>): Promise<RoboticsTeacherEnrolment> => {
    const id = 'r_teach_' + Date.now().toString(36);
    const required = 5;
    const sessionCost = 10;
    const kitCost = payload.purchasedRoboticsKit ? 50 : 0;
    const totalCost = (required * sessionCost) + kitCost;

    const newTeacher: RoboticsTeacherEnrolment = {
      ...payload,
      id,
      created_at: new Date().toISOString(),
      sessionsCompleted: 1,
      requiredSessions: required,
      totalCost,
      status: 'enrolled'
    };

    const current = getLocal<RoboticsTeacherEnrolment[]>(STORAGE_KEYS.TEACHERS, []);
    setLocal(STORAGE_KEYS.TEACHERS, [newTeacher, ...current]);

    try {
      await supabase.from('robotics_teacher_enrolments').insert({
        id: newTeacher.id,
        user_id: newTeacher.userId,
        teacher_name: newTeacher.teacherName,
        email: newTeacher.email,
        phone: newTeacher.phone,
        school_name: newTeacher.schoolName,
        subject_taught: newTeacher.subjectTaught,
        province: newTeacher.province,
        city: newTeacher.city,
        sessions_completed: newTeacher.sessionsCompleted,
        required_sessions: newTeacher.requiredSessions,
        purchased_robotics_kit: newTeacher.purchasedRoboticsKit,
        total_cost: newTeacher.totalCost,
        status: newTeacher.status,
        payment_status: newTeacher.paymentStatus,
        created_at: newTeacher.created_at
      });
    } catch {}

    return newTeacher;
  },

  getTeacherEnrolments: async (): Promise<RoboticsTeacherEnrolment[]> => {
    return getLocal<RoboticsTeacherEnrolment[]>(STORAGE_KEYS.TEACHERS, []);
  },

  // School Partnerships Portal
  submitPartnershipRequest: async (payload: Omit<RoboticsSchoolPartnershipRequest, 'id' | 'created_at' | 'status'>): Promise<RoboticsSchoolPartnershipRequest> => {
    const id = 'r_school_' + Date.now().toString(36);
    const newRequest: RoboticsSchoolPartnershipRequest = {
      ...payload,
      id,
      created_at: new Date().toISOString(),
      status: 'submitted'
    };

    const current = getLocal<RoboticsSchoolPartnershipRequest[]>(STORAGE_KEYS.PARTNERSHIPS, []);
    setLocal(STORAGE_KEYS.PARTNERSHIPS, [newRequest, ...current]);

    try {
      await supabase.from('robotics_school_partnerships').insert({
        id: newRequest.id,
        school_name: newRequest.schoolName,
        contact_person_name: newRequest.contactPersonName,
        contact_role: newRequest.contactRole,
        email: newRequest.email,
        phone: newRequest.phone,
        province: newRequest.province,
        district: newRequest.district,
        city: newRequest.city,
        school_type: newRequest.schoolType,
        estimated_learners: newRequest.estimatedLearners,
        requested_offerings: newRequest.requestedOfferings,
        has_existing_lab: newRequest.hasExistingLab,
        preferred_start_date: newRequest.preferredStartDate,
        additional_message: newRequest.additionalMessage,
        status: newRequest.status,
        created_at: newRequest.created_at
      });
    } catch {}

    return newRequest;
  },

  getPartnershipRequests: async (): Promise<RoboticsSchoolPartnershipRequest[]> => {
    return getLocal<RoboticsSchoolPartnershipRequest[]>(STORAGE_KEYS.PARTNERSHIPS, []);
  },

  // Issue digital certificate
  issueRoboticsCertificate: async (
    learnerName: string,
    schoolName: string,
    levelId: RoboticsCertificationLevelId,
    grade: string = 'Distinction'
  ): Promise<{ certificateNumber: string; verificationUrl: string }> => {
    const certNum = `YARA-ROB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pathway = ROBOTICS_PATHWAYS_CATALOG.find(p => p.id === levelId) || ROBOTICS_PATHWAYS_CATALOG[1];
    const verificationUrl = `/verify-certificate?cert=${encodeURIComponent(certNum)}`;

    const certRecord = {
      certificate_number: certNum,
      student_name: learnerName,
      course_title: `Robotics & Engineering: ${pathway.levelTitle}`,
      level_number: pathway.levelNumber,
      score: grade === 'Distinction' ? 95 : 85,
      grade: grade,
      issue_date: new Date().toISOString(),
      issuing_authority: 'Young Africans Robotics Association (YARA)',
      president_signature_name: 'Simbarashe Manongwa',
      president_title: 'President & Technical Director, YARA',
      metadata: {
        schoolName,
        levelId,
        minimumLessons: pathway.requiredLessonsOrSessions
      }
    };

    try {
      await supabase.from('certificates').insert(certRecord);
    } catch {}

    return {
      certificateNumber: certNum,
      verificationUrl
    };
  }
};

