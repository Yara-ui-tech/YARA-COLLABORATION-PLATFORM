import { Chapter, ChapterReport, NationalExecutiveAssessment } from '../types/chapters';
import { supabase } from '../lib/supabase';

const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'ch-cut-01',
    name: 'YARA Chinhoyi University of Technology (CUT) Chapter',
    code: 'YARA-CUT-01',
    category: 'university',
    institution_or_community: 'Chinhoyi University of Technology',
    province: 'Mashonaland West',
    district_or_city: 'Chinhoyi',
    banner_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
    description: 'The premier tertiary robotics chapter specializing in underwater exploration submersibles, IoT smart-agriculture telemetry, and micro-controller embedded systems. Leading technical research and mentoring local Mashonaland high schools.',
    established_date: '2024-02-15',
    status: 'chartered',
    total_members_count: 42,
    active_projects_count: 3,
    public_email: 'cut.chapter@yara.org.zw',
    public_phone: '+263 77 123 4567',
    public_social_links: {
      twitter: 'https://twitter.com/yara_cut',
      linkedin: 'https://linkedin.com/company/yara-cut-chapter',
      github: 'https://github.com/yara-cut-robotics'
    },
    meeting_schedule: 'Every Wednesday & Friday at 16:30 CAT',
    physical_location: 'CUT Innovation Complex, Mechatronics Wing, Lab 3',
    focus_areas: ['Submersible ROV Telemetry', 'Precision Agri-Drones', 'Edge AI Computer Vision', 'High School Outreach'],
    leaders: [
      {
        id: 'lead-1',
        name: 'Tariro Ndlovu',
        role: 'chairperson',
        email: 'tariro.n@cut.ac.zw',
        department_or_grade: 'Mechatronics Engineering Yr 3',
        is_public_contact: true
      },
      {
        id: 'lead-2',
        name: 'Kudzai Moyo',
        role: 'secretary',
        email: 'kudzai.m@cut.ac.zw',
        department_or_grade: 'Computer Science Yr 2',
        is_public_contact: true
      },
      {
        id: 'lead-3',
        name: 'Farai Gumbo',
        role: 'tech_lead',
        department_or_grade: 'Electronic Engineering Yr 4',
        is_public_contact: false
      }
    ],
    patron_advisor: {
      name: 'Dr. E. Munetsi',
      title: 'Senior Lecturer, Dept. of Mechatronics',
      organization: 'Chinhoyi University of Technology',
      email: 'emunetsi@cut.ac.zw'
    },
    projects: [
      {
        id: 'prj-1',
        title: 'Lake Kariba Hydro-Explorer Submersible ROV',
        description: 'Tethered underwater inspection drone engineered with live video streaming, salinity depth sensors, and dual brushless ballast thrusters.',
        category: 'robotics_hardware',
        status: 'testing',
        hardware_stack: ['Raspberry Pi 4', 'BLDC Thrusters', 'IMU 9-DOF', 'Pelican Waterproof Casing'],
        image_url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'prj-2',
        title: 'Solar Soil-Moisture Automated Telemetry Node',
        description: 'Low-power LoRa mesh nodes deployed across smallholder maize farms around Chinhoyi for soil nitrogen, moisture, and temperature monitoring.',
        category: 'iot_automation',
        status: 'in_progress',
        hardware_stack: ['ESP32', 'LoRa SX1278', 'Capacitive Soil Sensor', 'Lithium Solar Pack']
      }
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Mashonaland West Girls in Robotics Weekend Bootcamp',
        date: '2026-02-20',
        description: 'Trained 38 high school girls from Chinhoyi High and Lomagundi College in basic C++ robotics logic and circuit breadboarding.',
        impact_metric: '38 young women trained'
      }
    ],
    confidential_info: {
      internal_budget_balance_usd: 650,
      internal_bank_or_ecocash_details: 'Stanbic Bank Chinhoyi - Acc: 91400038491 / Ecocash Merchant: 48921',
      private_executive_notes: 'Chapter requires $200 grant top-up for 3 extra ESP32 camera sensors ahead of the National Championship.',
      inventory_access_code: 'LAB3-LOCK-8842',
      national_patron_supervisor: 'Eng. Blessing Chidzero',
      internal_drive_link: 'https://drive.google.com/drive/folders/cut-chapter-internal-2026'
    },
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2026-02-25T14:00:00Z'
  },
  {
    id: 'ch-uz-02',
    name: 'YARA University of Zimbabwe (UZ) Chapter',
    code: 'YARA-UZ-02',
    category: 'university',
    institution_or_community: 'University of Zimbabwe',
    province: 'Harare',
    district_or_city: 'Mount Pleasant, Harare',
    banner_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Flagship engineering chapter pioneering autonomous labyrinth navigational algorithms, smart electric mobility prototypes, and national curriculum peer tutoring.',
    established_date: '2024-05-10',
    status: 'chartered',
    total_members_count: 58,
    active_projects_count: 4,
    public_email: 'uz.chapter@yara.org.zw',
    meeting_schedule: 'Thursdays 16:00 - 18:00 & Saturdays 10:00 CAT',
    physical_location: 'UZ Faculty of Engineering & Built Environment, Room E12',
    focus_areas: ['Autonomous Maze Resolvers', 'Robotic Vision', 'Embedded C/C++', 'Secondary Mentorship'],
    leaders: [
      {
        id: 'uz-lead-1',
        name: 'Tendai Mutasa',
        role: 'chairperson',
        email: 'tendai.m@uz.ac.zw',
        department_or_grade: 'Electrical Engineering Yr 4',
        is_public_contact: true
      },
      {
        id: 'uz-lead-2',
        name: 'Ruvimbo Makoni',
        role: 'secretary',
        email: 'ruvimbo.m@uz.ac.zw',
        department_or_grade: 'Computer Engineering Yr 3',
        is_public_contact: true
      }
    ],
    patron_advisor: {
      name: 'Eng. K. Sibanda',
      title: 'Dean of Mechatronics',
      organization: 'University of Zimbabwe'
    },
    projects: [
      {
        id: 'uz-prj-1',
        title: 'FlashFlood Maze Path-Optimizer Robot',
        description: 'Micro-mouse robot with LiDAR obstacle mapping and A* flood-fill algorithmic navigation.',
        category: 'robotics_hardware',
        status: 'testing',
        hardware_stack: ['STM32 Nucleo', 'Time-of-Flight Sensors', 'Coreless DC Motors']
      }
    ],
    activities: [
      {
        id: 'uz-act-1',
        title: 'Harare High Schools Inter-Lab Robotics Exhibition',
        date: '2026-01-30',
        description: 'Hosted 120 students from 8 Harare high schools for live robotic arena demonstrations.',
        impact_metric: '120 students inspired'
      }
    ],
    confidential_info: {
      internal_budget_balance_usd: 920,
      internal_bank_or_ecocash_details: 'CABS Harare North - Acc: 1004928192',
      private_executive_notes: 'All 6 team robots registered and ready for YARA 2026 inspection.',
      inventory_access_code: 'ENG-E12-PAD-4019'
    },
    created_at: '2024-05-10T10:00:00Z',
    updated_at: '2026-02-20T11:00:00Z'
  },
  {
    id: 'ch-byo-03',
    name: 'YARA Bulawayo Community Youths Chapter',
    code: 'YARA-BYO-03',
    category: 'community_youth',
    institution_or_community: 'Bulawayo Youth Tech Hub & Community Center',
    province: 'Bulawayo',
    district_or_city: 'Bulawayo Central & Makokoba',
    banner_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    description: 'Empowering out-of-school and underprivileged youths in Bulawayo with practical vocational robotics, 3D printing, circuit soldering, and green tech recycling skills.',
    established_date: '2025-01-18',
    status: 'active',
    total_members_count: 36,
    active_projects_count: 2,
    public_email: 'bulawayo.youth@yara.org.zw',
    meeting_schedule: 'Every Tuesday & Thursday 14:00 - 17:00 CAT',
    physical_location: 'Makokoba Youth Center, Workshop Block A',
    focus_areas: ['E-Waste Robotics', 'Solar Inverter Kits', '3D Fabrication', 'Inclusive Youth Mentorship'],
    leaders: [
      {
        id: 'byo-lead-1',
        name: 'Sipho Nkomo',
        role: 'chairperson',
        is_public_contact: true
      },
      {
        id: 'byo-lead-2',
        name: 'Bongiwe Sibindi',
        role: 'secretary',
        email: 'bongiwe.s@byoyouth.org',
        is_public_contact: true
      }
    ],
    projects: [
      {
        id: 'byo-prj-1',
        title: 'Recycled E-Waste Line-Follower Buggy',
        description: 'Constructed completely using discarded DVD-drive stepper motors and recycled lithium 18650 laptop battery cells.',
        category: 'robotics_hardware',
        status: 'completed',
        hardware_stack: ['Arduino Nano', 'L298N Motor Driver', 'Recycled DVD chassis']
      }
    ],
    activities: [
      {
        id: 'byo-act-1',
        title: 'Makokoba Clean-up & Electronics Scavenge Workshop',
        date: '2026-02-10',
        description: 'Collected obsolete electronics to build 12 functioning robotics starter kits for community teenagers.',
        impact_metric: '12 kits constructed'
      }
    ],
    confidential_info: {
      internal_budget_balance_usd: 310,
      private_executive_notes: 'Applying for national parts subsidy to purchase 10 soldering irons.'
    },
    created_at: '2025-01-18T09:00:00Z',
    updated_at: '2026-02-22T10:00:00Z'
  },
  {
    id: 'ch-pe-04',
    name: 'YARA Prince Edward High School Chapter',
    code: 'YARA-PE-04',
    category: 'high_school',
    institution_or_community: 'Prince Edward School',
    province: 'Harare',
    district_or_city: 'Harare Central',
    banner_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    description: 'High school chapter cultivating young innovators in science, autonomous vehicles, and water tank monitoring robots. Multiple national STEM medalists.',
    established_date: '2024-09-01',
    status: 'chartered',
    total_members_count: 28,
    active_projects_count: 2,
    public_email: 'pe.robotics@yara.org.zw',
    meeting_schedule: 'Mondays & Fridays 14:30 - 16:30 CAT',
    physical_location: 'PE Physics & Design Technology Laboratories',
    focus_areas: ['Secondary Robotics', 'Hydro-Botics', 'Scratch & Arduino Code', 'Competition Prep'],
    leaders: [
      {
        id: 'pe-lead-1',
        name: 'Mufaro Chimutengwende',
        role: 'chairperson',
        department_or_grade: 'Upper 6 Sciences',
        is_public_contact: true
      },
      {
        id: 'pe-lead-2',
        name: 'Blessing Nyathi',
        role: 'secretary',
        email: 'blessing.nyathi@pe.edu.zw',
        department_or_grade: 'Lower 6 Sciences',
        is_public_contact: true
      }
    ],
    patron_advisor: {
      name: 'Mr. T. Dzvairo',
      title: 'Head of Physics & Robotics Club Patron',
      organization: 'Prince Edward School'
    },
    projects: [
      {
        id: 'pe-prj-1',
        title: 'Tigris Sub-Aquatic Drone v2',
        description: 'Tethered submarine drone designed for municipal swimming pool & water reservoir leak checks.',
        category: 'robotics_hardware',
        status: 'in_progress'
      }
    ],
    activities: [
      {
        id: 'pe-act-1',
        title: 'Junior Robotics Induction Week',
        date: '2026-01-22',
        description: 'Welcomed Form 1 & 2 students to hands-on sensor labs and breadboarding basics.',
        impact_metric: '40 new junior recruits'
      }
    ],
    confidential_info: {
      internal_budget_balance_usd: 450,
      private_executive_notes: 'School DT lab grant approved by School Development Committee.'
    },
    created_at: '2024-09-01T08:00:00Z',
    updated_at: '2026-02-18T10:00:00Z'
  },
  {
    id: 'ch-pri-05',
    name: 'YARA Junior Tech Builders Primary School Chapter',
    code: 'YARA-PRI-05',
    category: 'primary_school',
    institution_or_community: 'Avondale & Highlands Junior STEM Hub',
    province: 'Harare',
    district_or_city: 'Harare North',
    banner_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    description: 'Foundational early-childhood STEM chapter inspiring boys and girls ages 7–12 with block-based visual coding, LEGO robotics, micro:bit kits, and fun problem solving.',
    established_date: '2025-06-01',
    status: 'active',
    total_members_count: 24,
    active_projects_count: 1,
    public_email: 'primary.chapters@yara.org.zw',
    meeting_schedule: 'Saturday Mornings 09:00 - 11:30 CAT',
    physical_location: 'Highlands Community Library Junior Lab',
    focus_areas: ['Visual Block Coding', 'micro:bit Smart Inventions', 'Fun Mechanical Gearboxes', 'Early STEM'],
    leaders: [
      {
        id: 'pri-lead-1',
        name: 'Amai Chiedza Mtembu',
        role: 'patron_advisor',
        is_public_contact: true
      },
      {
        id: 'pri-lead-2',
        name: 'Anesu Marange',
        role: 'secretary',
        email: 'anesu.marange@primarystem.org',
        is_public_contact: true
      }
    ],
    projects: [
      {
        id: 'pri-prj-1',
        title: 'Micro:bit Smart Plant Water Reminder',
        description: 'Primary students built moisture sensing buzzers that sing cheerful songs when classroom plants need water.',
        category: 'iot_automation',
        status: 'completed'
      }
    ],
    activities: [
      {
        id: 'pri-act-1',
        title: 'Little Inventors Exhibition 2026',
        date: '2026-02-14',
        description: 'Parents and teachers gathered to watch 20 primary kids demonstrate dancing robots.',
        impact_metric: '20 kids completed certificates'
      }
    ],
    confidential_info: {
      internal_budget_balance_usd: 200,
      private_executive_notes: 'Donated 10 micro:bits received from STEM foundation.'
    },
    created_at: '2025-06-01T08:00:00Z',
    updated_at: '2026-02-15T09:00:00Z'
  }
];

const INITIAL_REPORTS: ChapterReport[] = [
  {
    id: 'rep-cut-2026-01',
    chapter_id: 'ch-cut-01',
    chapter_name: 'YARA Chinhoyi University of Technology (CUT) Chapter',
    chapter_category: 'university',
    report_title: 'CUT Chapter Q1 2026 Hardware Development & High School Outreach Report',
    period_type: 'quarterly',
    period_date: 'Q1 2026',
    submitted_by_name: 'Kudzai Moyo',
    submitted_by_role: 'Chapter Secretary',
    submitted_by_email: 'kudzai.m@cut.ac.zw',
    submitted_at: '2026-02-24T12:30:00Z',
    executive_summary: 'Over the past quarter, the CUT Chapter mobilized 42 registered active student engineers across mechatronics, electronic, and computer science departments. The Kariba Hydro-Explorer Submersible ROV reached 85% completion.',
    activities_undertaken: '1. Bi-weekly hardware lab sessions in CUT Mechatronics Lab 3.\n2. Hosted weekend outreach workshop for Lomagundi College and Chinhoyi High.\n3. Water tank buoyancy calibration testing at CUT swimming facility.',
    attendance_count: 38,
    hardware_projects_update: 'Submersible thrusters installed; Raspberry Pi GUI telemetry server successfully communicates via 30-meter ethernet tether.',
    challenges_and_needs: 'Need 2 replacement optical water depth sensors and additional 12V 10Ah LiFePO4 batteries.',
    report_document_url: 'https://docs.google.com/document/d/1YARA-CUT-Q1-2026-Report/edit?usp=sharing',
    financial_statement_url: 'https://docs.google.com/spreadsheets/d/1YARA-CUT-Finance-Q1-2026/edit',
    status: 'assessed',
    executive_assessment: {
      assessed_by_name: 'National Executive Director',
      assessed_by_email: 'goyaracorp@gmail.com',
      assessed_at: '2026-02-25T16:00:00Z',
      grade: 'Outstanding (A)',
      score_out_of_100: 96,
      national_executive_feedback: 'Exemplary report with verifiable milestones and high community outreach impact. Grant allocation approved for component subsidies.',
      action_items_for_chapter: 'Finalize competition safety checklist with National Chief Marshal before August event.',
      grant_allocation_recommended: true,
      recommended_grant_usd: 250
    }
  },
  {
    id: 'rep-pe-2026-02',
    chapter_id: 'ch-pe-04',
    chapter_name: 'YARA Prince Edward High School Chapter',
    chapter_category: 'high_school',
    report_title: 'Prince Edward Robotics Club Monthly Technical Progress',
    period_type: 'monthly',
    period_date: '2026-02',
    submitted_by_name: 'Blessing Nyathi',
    submitted_by_role: 'Club Secretary',
    submitted_by_email: 'blessing.nyathi@pe.edu.zw',
    submitted_at: '2026-02-22T09:15:00Z',
    executive_summary: 'Conducted 6 practical lab classes on circuit diagnostics and motor control. Form 3 and 4 students built two line-follower chassis.',
    activities_undertaken: 'Weekly physics lab sessions, safety gear training, and solder wire handling drills.',
    attendance_count: 24,
    hardware_projects_update: 'Completed 2 test rigs for autonomous maze obstacle clearance.',
    challenges_and_needs: 'Require 4 additional micro-USB programming cables.',
    report_document_url: 'https://docs.google.com/document/d/1PE-Robotics-Feb2026-Report/edit',
    status: 'submitted'
  }
];

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage error in chapters service:', err);
  }
}

// 1. GET ALL CHAPTERS (Public View Strips Confidential Fields if user is not authorized)
export async function getChapters(isAdmin = false): Promise<Chapter[]> {
  const list = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  
  if (isAdmin) {
    return list;
  }

  // Strip confidential info for public consumers
  return list.map(ch => {
    const { confidential_info, ...publicChapter } = ch;
    return publicChapter as Chapter;
  });
}

// 2. GET SINGLE CHAPTER BY ID
export async function getChapterById(id: string, isAdmin = false, userEmail?: string): Promise<Chapter | null> {
  const list = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const ch = list.find(c => c.id === id);
  if (!ch) return null;

  // Check if user is chapter secretary or leader
  const isChapterLeader = userEmail && ch.leaders?.some(l => l.email?.toLowerCase() === userEmail.toLowerCase());

  if (isAdmin || isChapterLeader) {
    return ch;
  }

  const { confidential_info, ...publicChapter } = ch;
  return publicChapter as Chapter;
}

// 3. CREATE CHAPTER (Admin)
export async function createChapter(chapterData: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> {
  const newChapter: Chapter = {
    ...chapterData,
    id: 'ch-' + Date.now().toString(36),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const list = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const updated = [newChapter, ...list];
  setLocal('yara_chapters_data', updated);

  try {
    await supabase.from('chapters').insert(newChapter);
  } catch {
    // safe fallback
  }

  return newChapter;
}

// 4. UPDATE CHAPTER
export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
  const list = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const idx = list.findIndex(c => c.id === id);
  if (idx < 0) return null;

  const updatedChapter: Chapter = {
    ...list[idx],
    ...updates,
    updated_at: new Date().toISOString()
  };

  list[idx] = updatedChapter;
  setLocal('yara_chapters_data', list);

  try {
    await supabase.from('chapters').update(updatedChapter).eq('id', id);
  } catch {
    // fallback
  }

  return updatedChapter;
}

// 5. DELETE CHAPTER (Admin)
export async function deleteChapter(id: string): Promise<boolean> {
  const list = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const filtered = list.filter(c => c.id !== id);
  setLocal('yara_chapters_data', filtered);

  try {
    await supabase.from('chapters').delete().eq('id', id);
  } catch {
    // fallback
  }

  return true;
}

// =========================================================================
// CHAPTER SECRETARY REPORTS & NATIONAL EXECUTIVE ASSESSMENTS
// =========================================================================

export async function getChapterReports(chapterId?: string): Promise<ChapterReport[]> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  if (chapterId) {
    return reports.filter(r => r.chapter_id === chapterId);
  }
  return reports;
}

export async function submitChapterReport(
  reportData: Omit<ChapterReport, 'id' | 'submitted_at' | 'status' | 'executive_assessment'>
): Promise<ChapterReport> {
  const newReport: ChapterReport = {
    ...reportData,
    id: 'rep-' + Date.now().toString(36),
    submitted_at: new Date().toISOString(),
    status: 'submitted'
  };

  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const updated = [newReport, ...reports];
  setLocal('yara_chapter_reports', updated);

  try {
    await supabase.from('chapter_reports').insert(newReport);
  } catch {
    // safe fallback
  }

  return newReport;
}

export async function assessChapterReport(
  reportId: string,
  assessment: NationalExecutiveAssessment
): Promise<ChapterReport | null> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx < 0) return null;

  reports[idx].status = 'assessed';
  reports[idx].executive_assessment = assessment;

  setLocal('yara_chapter_reports', reports);

  try {
    await supabase.from('chapter_reports').update({
      status: 'assessed',
      executive_assessment: assessment
    }).eq('id', reportId);
  } catch {
    // fallback
  }

  return reports[idx];
}

export async function updateChapterReportStatus(reportId: string, status: ChapterReport['status']): Promise<boolean> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx < 0) return false;

  reports[idx].status = status;
  setLocal('yara_chapter_reports', reports);
  return true;
}

export async function deleteChapterReport(reportId: string): Promise<boolean> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const filtered = reports.filter(r => r.id !== reportId);
  setLocal('yara_chapter_reports', filtered);
  return true;
}
