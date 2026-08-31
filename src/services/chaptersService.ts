import { 
  Chapter, ChapterReport, NationalExecutiveAssessment, ChapterLeader, 
  ChapterLeaderRole, ChapterFinancialData, ChapterMember, ChapterRegistrationRequest 
} from '../types/chapters';
import { supabase } from '../lib/supabase';

export const PROVINCIAL_LEAD_UNIVERSITIES: Record<string, { universityName: string; chapterCode: string; defaultChapterName: string }> = {
  'Mashonaland West': {
    universityName: 'Chinhoyi University of Technology (CUT)',
    chapterCode: 'YARA-CUT-01',
    defaultChapterName: 'YARA Chinhoyi University of Technology (CUT) Chapter'
  },
  'Harare': {
    universityName: 'University of Zimbabwe (UZ) & HIT',
    chapterCode: 'YARA-UZ-02',
    defaultChapterName: 'YARA University of Zimbabwe (UZ) Chapter'
  },
  'Bulawayo': {
    universityName: 'National University of Science and Technology (NUST)',
    chapterCode: 'YARA-NUST-01',
    defaultChapterName: 'YARA NUST Bulawayo Chapter'
  },
  'Midlands': {
    universityName: 'Midlands State University (MSU)',
    chapterCode: 'YARA-MSU-01',
    defaultChapterName: 'YARA Midlands State University (MSU) Chapter'
  },
  'Manicaland': {
    universityName: 'Manicaland State University of Applied Sciences (MSUAS)',
    chapterCode: 'YARA-MSUAS-01',
    defaultChapterName: 'YARA Manicaland State University Chapter'
  },
  'Masvingo': {
    universityName: 'Great Zimbabwe University (GZU)',
    chapterCode: 'YARA-GZU-01',
    defaultChapterName: 'YARA Great Zimbabwe University (GZU) Chapter'
  },
  'Mashonaland Central': {
    universityName: 'Bindura University of Science Education (BUSE)',
    chapterCode: 'YARA-BUSE-01',
    defaultChapterName: 'YARA Bindura University (BUSE) Chapter'
  },
  'Mashonaland East': {
    universityName: 'Marondera University of Agricultural Sciences and Technology (MUAST)',
    chapterCode: 'YARA-MUAST-01',
    defaultChapterName: 'YARA MUAST Mashonaland East Chapter'
  },
  'Matabeleland North': {
    universityName: 'Lupane State University (LSU)',
    chapterCode: 'YARA-LSU-01',
    defaultChapterName: 'YARA Lupane State University (LSU) Chapter'
  },
  'Matabeleland South': {
    universityName: 'Gwanda State University (GSU)',
    chapterCode: 'YARA-GSU-01',
    defaultChapterName: 'YARA Gwanda State University (GSU) Chapter'
  }
};

export function formatRoleName(role: ChapterLeaderRole | string): string {
  switch (role) {
    case 'chairperson':
      return 'President / Chairperson';
    case 'vice_chair':
      return 'Vice President / Vice Chair';
    case 'secretary':
      return 'Secretary General';
    case 'vice_secretary':
      return 'Vice Secretary';
    case 'treasurer':
      return 'Treasurer / Finance Lead';
    case 'tech_lead':
      return 'Technical Lead / Robotics Marshal';
    case 'public_relations':
      return 'Communications & PR';
    case 'patron_advisor':
      return 'Faculty Patron / Advisor';
    default:
      return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

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
    description: 'The premier tertiary robotics chapter and assigned Provincial Lead University for Mashonaland West. Specializing in underwater exploration submersibles, IoT smart-agriculture telemetry, and micro-controller embedded systems. Mentors all secondary, high school, and community chapters across Mashonaland West.',
    established_date: '2024-02-15',
    status: 'chartered',
    approval_status: 'approved',
    is_provincial_lead_university: true,
    supervised_chapter_count: 3,
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
        id: 'cut-lead-1',
        name: 'Tariro Ndlovu',
        role: 'chairperson',
        email: 'tariro.n@cut.ac.zw',
        phone: '+263 77 123 4567',
        department_or_grade: 'Mechatronics Engineering Yr 3',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-15T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'cut-lead-2',
        name: 'Kudzai Moyo',
        role: 'secretary',
        email: 'kudzai.m@cut.ac.zw',
        phone: '+263 77 234 5678',
        department_or_grade: 'Computer Science Yr 2',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-15T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'cut-lead-3',
        name: 'Nyasha Mupfumi',
        role: 'treasurer',
        email: 'nyasha.m@cut.ac.zw',
        phone: '+263 77 345 6789',
        department_or_grade: 'Accounting & Finance Yr 3',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-15T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: false,
        can_submit_financial_reports: true
      },
      {
        id: 'cut-lead-4',
        name: 'Farai Gumbo',
        role: 'tech_lead',
        email: 'farai.g@cut.ac.zw',
        phone: '+263 77 456 7890',
        department_or_grade: 'Electronic Engineering Yr 4',
        is_public_contact: false,
        is_approved_by_admin: true,
        can_submit_general_reports: true,
        can_submit_financial_reports: false
      }
    ],
    members: [
      {
        id: 'cut-mem-1',
        name: 'Tariro Ndlovu',
        email: 'tariro.n@cut.ac.zw',
        phone: '+263 77 123 4567',
        role: 'President / Chairperson',
        department_or_grade: 'Mechatronics Engineering Yr 3',
        joined_date: '2024-02-15',
        is_leadership: true,
        status: 'core_member',
        skills: ['Embedded C', 'Robotics Hardware', 'Leadership']
      },
      {
        id: 'cut-mem-2',
        name: 'Kudzai Moyo',
        email: 'kudzai.m@cut.ac.zw',
        phone: '+263 77 234 5678',
        role: 'Secretary General',
        department_or_grade: 'Computer Science Yr 2',
        joined_date: '2024-02-15',
        is_leadership: true,
        status: 'core_member',
        skills: ['Python', 'Technical Documentation', 'Web Telemetry']
      },
      {
        id: 'cut-mem-3',
        name: 'Nyasha Mupfumi',
        email: 'nyasha.m@cut.ac.zw',
        phone: '+263 77 345 6789',
        role: 'Treasurer / Finance Lead',
        department_or_grade: 'Accounting & Finance Yr 3',
        joined_date: '2024-03-01',
        is_leadership: true,
        status: 'core_member',
        skills: ['Budgeting', 'Grant Acquittal', 'Procurement']
      },
      {
        id: 'cut-mem-4',
        name: 'Farai Gumbo',
        email: 'farai.g@cut.ac.zw',
        phone: '+263 77 456 7890',
        role: 'Robotics Marshal & Hardware Lead',
        department_or_grade: 'Electronic Engineering Yr 4',
        joined_date: '2024-02-20',
        is_leadership: true,
        status: 'core_member',
        skills: ['PCB Design', 'Motor ESCs', 'Brushless Thrusters']
      },
      {
        id: 'cut-mem-5',
        name: 'Tatenda Mutasa',
        email: 'tatenda.m@cut.ac.zw',
        phone: '+263 77 567 8901',
        role: 'Sensors & Telemetry Specialist',
        department_or_grade: 'Applied Physics Yr 2',
        joined_date: '2025-01-10',
        status: 'active',
        skills: ['LoRa', 'Hydro-Sensors', 'Arduino']
      },
      {
        id: 'cut-mem-6',
        name: 'Ropafadzo Sithole',
        email: 'ropa.sithole@cut.ac.zw',
        phone: '+263 77 678 9012',
        role: 'Junior Research Engineer',
        department_or_grade: 'Software Engineering Yr 1',
        joined_date: '2025-09-15',
        status: 'active',
        skills: ['OpenCV', 'React', 'Raspberry Pi']
      },
      {
        id: 'cut-mem-7',
        name: 'Anesu Chigumba',
        email: 'anesu.chigumba@cut.ac.zw',
        phone: '+263 77 789 0123',
        role: '3D CAD & Fabrication Member',
        department_or_grade: 'Mechanical Engineering Yr 2',
        joined_date: '2025-02-01',
        status: 'active',
        skills: ['SolidWorks', '3D Printing', 'Structural Design']
      },
      {
        id: 'cut-mem-8',
        name: 'Tinotenda Mashonganyika',
        email: 'tinotenda.m@cut.ac.zw',
        phone: '+263 77 890 1234',
        role: 'Autonomous Navigation Cadet',
        department_or_grade: 'Mechatronics Yr 1',
        joined_date: '2026-01-10',
        status: 'cadet',
        skills: ['C++', 'PID Control', 'Sensors']
      }
    ],
    patron_advisor: {
      name: 'Dr. E. Munetsi',
      title: 'Senior Lecturer, Dept. of Mechatronics',
      organization: 'Chinhoyi University of Technology',
      email: 'emunetsi@cut.ac.zw',
      phone: '+263 71 234 5678'
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
        description: 'Trained 38 high school girls from Chinhoyi High and Kutama College in basic C++ robotics logic and circuit breadboarding.',
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
    id: 'ch-kut-06',
    name: 'YARA Kutama College Robotics Chapter',
    code: 'YARA-KUT-06',
    category: 'high_school',
    institution_or_community: 'Kutama College (St Francis Xavier)',
    province: 'Mashonaland West',
    district_or_city: 'Zvimba, Mashonaland West',
    banner_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    logo_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
    description: 'Premier high school robotics chapter in Mashonaland West under the direct mentorship and provincial leadership of Chinhoyi University of Technology (CUT). Innovating in solar smart carts, agricultural soil sensors, and competitive maze solving.',
    established_date: '2024-08-10',
    status: 'chartered',
    approval_status: 'approved',
    is_provincial_lead_university: false,
    assigned_provincial_university_id: 'ch-cut-01',
    assigned_provincial_university_name: 'YARA Chinhoyi University of Technology (CUT) Chapter',
    total_members_count: 26,
    active_projects_count: 2,
    public_email: 'kutama.robotics@yara.org.zw',
    public_phone: '+263 77 334 4556',
    meeting_schedule: 'Tuesdays & Thursdays 15:30 - 17:00 CAT',
    physical_location: 'Kutama Science Wing, Computer & Physics Lab',
    focus_areas: ['Autonomous Maze Solvers', 'Solar Agriculture Bots', 'Micro:bit Embedded Code', 'National STEM Olympiad'],
    leaders: [
      {
        id: 'kut-lead-1',
        name: 'Munyaradzi Mataranyika',
        role: 'chairperson',
        email: 'munya.mataranyika@kutama.edu.zw',
        phone: '+263 77 334 4556',
        department_or_grade: 'Upper 6 Physics & Maths',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-18T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'kut-lead-2',
        name: 'Panashe Chuma',
        role: 'secretary',
        email: 'panashe.chuma@kutama.edu.zw',
        phone: '+263 77 445 5667',
        department_or_grade: 'Lower 6 Sciences',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-18T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      }
    ],
    members: [
      {
        id: 'kut-mem-1',
        name: 'Munyaradzi Mataranyika',
        email: 'munya.mataranyika@kutama.edu.zw',
        phone: '+263 77 334 4556',
        role: 'President / Chairperson',
        department_or_grade: 'Upper 6 Sciences',
        joined_date: '2024-08-10',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'kut-mem-2',
        name: 'Panashe Chuma',
        email: 'panashe.chuma@kutama.edu.zw',
        phone: '+263 77 445 5667',
        role: 'Secretary General',
        department_or_grade: 'Lower 6 Sciences',
        joined_date: '2024-08-10',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'kut-mem-3',
        name: 'Tawana Mukaro',
        email: 'tawana.m@kutama.edu.zw',
        phone: '+263 77 556 6778',
        role: 'Hardware Builder',
        department_or_grade: 'Form 4 Science',
        joined_date: '2025-01-15',
        status: 'active'
      },
      {
        id: 'kut-mem-4',
        name: 'Kudakwashe Zvobgo',
        email: 'kuda.zvobgo@kutama.edu.zw',
        phone: '+263 77 667 7889',
        role: 'Line Follower Pilot',
        department_or_grade: 'Form 3 STEM',
        joined_date: '2025-02-10',
        status: 'active'
      }
    ],
    patron_advisor: {
      name: 'Brother J. Mukondiwa',
      title: 'Head of Physics & Club Patron',
      organization: 'Kutama College',
      email: 'jmukondiwa@kutama.edu.zw',
      phone: '+263 77 999 1122'
    },
    projects: [
      {
        id: 'kut-prj-1',
        title: 'Zvimba Agri-Sense Rover',
        description: 'Autonomous soil moisture and temperature recording buggy with Bluetooth live logging to teacher tablet.',
        category: 'iot_automation',
        status: 'testing',
        hardware_stack: ['Arduino Uno', 'DHT22', 'HC-05 Bluetooth', '2WD Chassis']
      }
    ],
    activities: [
      {
        id: 'kut-act-1',
        title: 'CUT Mechatronics Provincial Mentorship Day',
        date: '2026-02-12',
        description: 'CUT university mentors visited Kutama College for hands-on calibration of solar rovers.',
        impact_metric: '26 students mentored'
      }
    ],
    confidential_info: {
      internal_budget_balance_usd: 380,
      private_executive_notes: 'Mentored monthly by CUT Chapter Lead Tariro Ndlovu.'
    },
    created_at: '2024-08-10T10:00:00Z',
    updated_at: '2026-02-24T12:00:00Z'
  },
  {
    id: 'ch-chinhoyi-high-07',
    name: 'YARA Chinhoyi High School Robotics Chapter',
    code: 'YARA-CHS-07',
    category: 'high_school',
    institution_or_community: 'Chinhoyi High School',
    province: 'Mashonaland West',
    district_or_city: 'Chinhoyi Urban',
    banner_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    logo_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=200&q=80',
    description: 'High school chapter based in Chinhoyi Urban under the provincial coordination of CUT University Chapter. Active in clean water testing robotics and STEM girl initiatives.',
    established_date: '2025-01-20',
    status: 'chartered',
    approval_status: 'approved',
    is_provincial_lead_university: false,
    assigned_provincial_university_id: 'ch-cut-01',
    assigned_provincial_university_name: 'YARA Chinhoyi University of Technology (CUT) Chapter',
    total_members_count: 22,
    active_projects_count: 1,
    public_email: 'chinhoyi.high@yara.org.zw',
    meeting_schedule: 'Wednesdays 15:00 - 16:30 CAT',
    physical_location: 'Chinhoyi High School Computer Lab',
    focus_areas: ['Micro:bit Telemetry', 'Water Purity Sensing', 'Girls in Robotics'],
    leaders: [
      {
        id: 'chs-lead-1',
        name: 'Chido Govera',
        role: 'chairperson',
        email: 'chido.govera@chinhoyihigh.ac.zw',
        department_or_grade: 'Lower 6 Sciences',
        is_public_contact: true,
        is_approved_by_admin: true,
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      }
    ],
    members: [
      {
        id: 'chs-mem-1',
        name: 'Chido Govera',
        email: 'chido.govera@chinhoyihigh.ac.zw',
        role: 'President / Chairperson',
        department_or_grade: 'Lower 6 Sciences',
        joined_date: '2025-01-20',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'chs-mem-2',
        name: 'Makanaka Mhere',
        email: 'makanaka.m@chinhoyihigh.ac.zw',
        role: 'Lead Programmer',
        department_or_grade: 'Form 4 Science',
        joined_date: '2025-01-25',
        status: 'active'
      }
    ],
    patron_advisor: {
      name: 'Mrs. S. Maruta',
      title: 'Senior Chemistry & Science Teacher',
      organization: 'Chinhoyi High School'
    },
    projects: [
      {
        id: 'chs-prj-1',
        title: 'Manyame River Water Quality pH Rover',
        description: 'Floating buoy sensor that measures water pH and turbidity for local agriculture.',
        category: 'iot_automation',
        status: 'in_progress'
      }
    ],
    activities: [],
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2026-02-20T11:00:00Z'
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
    logo_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=200&q=80',
    description: 'Flagship engineering chapter and assigned Provincial Lead University for Harare Province. Pioneering autonomous labyrinth navigational algorithms, smart electric mobility prototypes, and mentoring secondary high school chapters across Harare.',
    established_date: '2024-05-10',
    status: 'chartered',
    approval_status: 'approved',
    is_provincial_lead_university: true,
    supervised_chapter_count: 2,
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
        phone: '+263 77 888 1111',
        department_or_grade: 'Electrical Engineering Yr 4',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-12T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'uz-lead-2',
        name: 'Ruvimbo Makoni',
        role: 'secretary',
        email: 'ruvimbo.m@uz.ac.zw',
        phone: '+263 77 888 2222',
        department_or_grade: 'Computer Engineering Yr 3',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-12T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'uz-lead-3',
        name: 'Simbarashe Dube',
        role: 'treasurer',
        email: 'simba.dube@uz.ac.zw',
        phone: '+263 77 888 3333',
        department_or_grade: 'Business Studies & Finance Yr 3',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-12T10:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: false,
        can_submit_financial_reports: true
      }
    ],
    members: [
      {
        id: 'uz-mem-1',
        name: 'Tendai Mutasa',
        email: 'tendai.m@uz.ac.zw',
        phone: '+263 77 888 1111',
        role: 'President / Chairperson',
        department_or_grade: 'Electrical Engineering Yr 4',
        joined_date: '2024-05-10',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'uz-mem-2',
        name: 'Ruvimbo Makoni',
        email: 'ruvimbo.m@uz.ac.zw',
        phone: '+263 77 888 2222',
        role: 'Secretary General',
        department_or_grade: 'Computer Engineering Yr 3',
        joined_date: '2024-05-10',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'uz-mem-3',
        name: 'Simbarashe Dube',
        email: 'simba.dube@uz.ac.zw',
        phone: '+263 77 888 3333',
        role: 'Treasurer / Finance Lead',
        department_or_grade: 'Business Studies & Finance Yr 3',
        joined_date: '2024-06-01',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'uz-mem-4',
        name: 'Tinashe Gwanzura',
        email: 'tinashe.g@uz.ac.zw',
        phone: '+263 77 888 4444',
        role: 'Robotics & Control Engineer',
        department_or_grade: 'Mechatronics Yr 3',
        joined_date: '2024-06-15',
        status: 'active'
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
    logo_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=200&q=80',
    description: 'Empowering out-of-school and underprivileged youths in Bulawayo with practical vocational robotics, 3D printing, circuit soldering, and green tech recycling skills.',
    established_date: '2025-01-18',
    status: 'active',
    approval_status: 'approved',
    is_provincial_lead_university: false,
    assigned_provincial_university_name: 'YARA NUST Bulawayo Chapter',
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
        email: 'sipho.n@byoyouth.org',
        phone: '+263 77 999 0001',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-18T09:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'byo-lead-2',
        name: 'Bongiwe Sibindi',
        role: 'secretary',
        email: 'bongiwe.s@byoyouth.org',
        phone: '+263 77 999 0002',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-18T09:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'byo-lead-3',
        name: 'Themba Khumalo',
        role: 'treasurer',
        email: 'themba.k@byoyouth.org',
        phone: '+263 77 999 0003',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-18T09:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: false,
        can_submit_financial_reports: true
      }
    ],
    members: [
      {
        id: 'byo-mem-1',
        name: 'Sipho Nkomo',
        email: 'sipho.n@byoyouth.org',
        role: 'President / Chairperson',
        joined_date: '2025-01-18',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'byo-mem-2',
        name: 'Bongiwe Sibindi',
        email: 'bongiwe.s@byoyouth.org',
        role: 'Secretary General',
        joined_date: '2025-01-18',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'byo-mem-3',
        name: 'Themba Khumalo',
        email: 'themba.k@byoyouth.org',
        role: 'Treasurer',
        joined_date: '2025-01-18',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'byo-mem-4',
        name: 'Nolwazi Dube',
        email: 'nolwazi.d@byoyouth.org',
        role: 'Community Maker',
        joined_date: '2025-02-01',
        status: 'active'
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
    logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
    description: 'High school chapter cultivating young innovators in science, autonomous vehicles, and water tank monitoring robots under the mentorship of the UZ Chapter. Multiple national STEM medalists.',
    established_date: '2024-09-01',
    status: 'chartered',
    approval_status: 'approved',
    is_provincial_lead_university: false,
    assigned_provincial_university_id: 'ch-uz-02',
    assigned_provincial_university_name: 'YARA University of Zimbabwe (UZ) Chapter',
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
        email: 'mufaro.c@pe.edu.zw',
        phone: '+263 77 111 2233',
        department_or_grade: 'Upper 6 Sciences',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-14T08:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'pe-lead-2',
        name: 'Blessing Nyathi',
        role: 'secretary',
        email: 'blessing.nyathi@pe.edu.zw',
        phone: '+263 77 222 3344',
        department_or_grade: 'Lower 6 Sciences',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-14T08:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'pe-lead-3',
        name: 'Tinashe Kambarami',
        role: 'treasurer',
        email: 'tinashe.k@pe.edu.zw',
        department_or_grade: 'Upper 6 Commercials',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-14T08:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: false,
        can_submit_financial_reports: true
      }
    ],
    members: [
      {
        id: 'pe-mem-1',
        name: 'Mufaro Chimutengwende',
        email: 'mufaro.c@pe.edu.zw',
        role: 'President / Chairperson',
        department_or_grade: 'Upper 6 Sciences',
        joined_date: '2024-09-01',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'pe-mem-2',
        name: 'Blessing Nyathi',
        email: 'blessing.nyathi@pe.edu.zw',
        role: 'Secretary General',
        department_or_grade: 'Lower 6 Sciences',
        joined_date: '2024-09-01',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'pe-mem-3',
        name: 'Tinashe Kambarami',
        email: 'tinashe.k@pe.edu.zw',
        role: 'Treasurer',
        department_or_grade: 'Upper 6 Commercials',
        joined_date: '2024-09-01',
        is_leadership: true,
        status: 'core_member'
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
    logo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    description: 'Foundational early-childhood STEM chapter inspiring boys and girls ages 7–12 with block-based visual coding, LEGO robotics, micro:bit kits, and fun problem solving.',
    established_date: '2025-06-01',
    status: 'active',
    approval_status: 'approved',
    is_provincial_lead_university: false,
    assigned_provincial_university_name: 'YARA University of Zimbabwe (UZ) Chapter',
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
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-10T08:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat'
      },
      {
        id: 'pri-lead-2',
        name: 'Anesu Marange',
        role: 'secretary',
        email: 'anesu.marange@primarystem.org',
        is_public_contact: true,
        is_approved_by_admin: true,
        approved_by_admin_at: '2026-01-10T08:00:00Z',
        approved_by_admin_name: 'National Executive Secretariat',
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      }
    ],
    members: [
      {
        id: 'pri-mem-1',
        name: 'Anesu Marange',
        email: 'anesu.marange@primarystem.org',
        role: 'Lead Instructor & Secretary',
        joined_date: '2025-06-01',
        is_leadership: true,
        status: 'core_member'
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

const INITIAL_REGISTRATION_REQUESTS: ChapterRegistrationRequest[] = [
  {
    id: 'req-msu-01',
    proposed_name: 'YARA Midlands State University (MSU) Chapter',
    category: 'university',
    institution_or_community: 'Midlands State University',
    province: 'Midlands',
    district_or_city: 'Gweru',
    logo_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    description: 'Proposed Provincial Lead University Chapter for Midlands Province. Focusing on mining robotics automation, smart agriculture drone telemetry, and mentoring high schools across Gweru and Kwekwe.',
    physical_location: 'MSU Gweru Main Campus, Faculty of Science & Technology Lab 4',
    meeting_schedule: 'Tuesdays & Fridays 16:00 CAT',
    focus_areas: ['Mining Telemetry', 'Drone Automation', 'High School Mentorship', 'C++ Robotics'],
    public_email: 'msu.robotics@yara.org.zw',
    public_phone: '+263 77 456 1234',
    total_members_count: 32,
    members: [
      {
        id: 'msu-m-1',
        name: 'Tinashe Mugadza',
        email: 'tinashe.mugadza@msu.ac.zw',
        phone: '+263 77 456 1234',
        role: 'Proposed President / Chairperson',
        department_or_grade: 'Computer Science Yr 3',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'msu-m-2',
        name: 'Chiedza Bhebhe',
        email: 'chiedza.b@msu.ac.zw',
        phone: '+263 77 456 5678',
        role: 'Proposed Secretary General',
        department_or_grade: 'Telecommunications Engineering Yr 2',
        is_leadership: true,
        status: 'core_member'
      },
      {
        id: 'msu-m-3',
        name: 'Kudzaishe Shumba',
        email: 'kuda.shumba@msu.ac.zw',
        phone: '+263 77 456 9012',
        role: 'Proposed Treasurer',
        department_or_grade: 'Finance Yr 3',
        is_leadership: true,
        status: 'core_member'
      }
    ],
    leaders: [
      {
        id: 'msu-l-1',
        name: 'Tinashe Mugadza',
        role: 'chairperson',
        email: 'tinashe.mugadza@msu.ac.zw',
        phone: '+263 77 456 1234',
        department_or_grade: 'Computer Science Yr 3',
        is_public_contact: true,
        is_approved_by_admin: false,
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      },
      {
        id: 'msu-l-2',
        name: 'Chiedza Bhebhe',
        role: 'secretary',
        email: 'chiedza.b@msu.ac.zw',
        phone: '+263 77 456 5678',
        department_or_grade: 'Telecommunications Engineering Yr 2',
        is_public_contact: true,
        is_approved_by_admin: false,
        can_submit_general_reports: true,
        can_submit_financial_reports: true
      }
    ],
    patron_advisor: {
      name: 'Prof. M. Zhou',
      title: 'Dean of Information & Communication Technology',
      organization: 'Midlands State University',
      email: 'mzhou@msu.ac.zw',
      phone: '+263 71 888 9999'
    },
    assigned_provincial_university_name: 'Midlands State University (MSU) [Provincial Lead]',
    applicant_name: 'Tinashe Mugadza',
    applicant_email: 'tinashe.mugadza@msu.ac.zw',
    applicant_phone: '+263 77 456 1234',
    applicant_role: 'Founder & Student Lead',
    status: 'pending',
    created_at: '2026-02-26T08:30:00Z',
    updated_at: '2026-02-26T08:30:00Z'
  }
];

export function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// USER CHAPTER AUTO-DETECTION UPON SIGN-IN / SIGN-UP
// -------------------------------------------------------------

export interface DetectedUserAffiliation {
  chapter: Chapter;
  matchedMember?: ChapterMember;
  matchedLeader?: ChapterLeader;
  role: string;
  isLeader: boolean;
  matchField: 'email' | 'name' | 'phone';
  provincialLeadInfo?: {
    isLeadUniversity: boolean;
    assignedLeadName?: string;
  };
}

/**
 * Automatically inspects user's email, name, or phone number against all active chapters
 * to determine their registered chapter affiliation and role.
 */
export async function detectUserChapter(
  userQuery?: { email?: string | null; name?: string | null; phone?: string | null } | string
): Promise<DetectedUserAffiliation | null> {
  let email = '';
  let name = '';
  let phone = '';

  if (typeof userQuery === 'string') {
    const q = userQuery.trim().toLowerCase();
    if (q.includes('@')) {
      email = q;
    } else if (/^(\+?[0-9\s-]{7,})$/.test(q)) {
      phone = q.replace(/[\s-]/g, '');
    } else {
      name = q;
    }
  } else if (userQuery) {
    email = (userQuery.email || '').trim().toLowerCase();
    name = (userQuery.name || '').trim().toLowerCase();
    phone = (userQuery.phone || '').replace(/[\s-]/g, '');
  }

  if (!email && !name && !phone) return null;

  const chapters = await getChapters(true);

  for (const ch of chapters) {
    // 1. Check leaders list
    if (ch.leaders && ch.leaders.length > 0) {
      for (const leader of ch.leaders) {
        const lEmail = (leader.email || '').trim().toLowerCase();
        const lName = (leader.name || '').trim().toLowerCase();
        const lPhone = (leader.phone || '').replace(/[\s-]/g, '');

        if (email && lEmail && lEmail === email) {
          return {
            chapter: ch,
            matchedLeader: leader,
            role: formatRoleName(leader.role),
            isLeader: true,
            matchField: 'email',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (name && lName && (lName === name || lName.includes(name) || name.includes(lName))) {
          return {
            chapter: ch,
            matchedLeader: leader,
            role: formatRoleName(leader.role),
            isLeader: true,
            matchField: 'name',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (phone && lPhone && (lPhone === phone || lPhone.endsWith(phone.slice(-9)))) {
          return {
            chapter: ch,
            matchedLeader: leader,
            role: formatRoleName(leader.role),
            isLeader: true,
            matchField: 'phone',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }
      }
    }

    // 2. Check general members roster
    if (ch.members && ch.members.length > 0) {
      for (const mem of ch.members) {
        const mEmail = (mem.email || '').trim().toLowerCase();
        const mName = (mem.name || '').trim().toLowerCase();
        const mPhone = (mem.phone || '').replace(/[\s-]/g, '');

        if (email && mEmail && mEmail === email) {
          return {
            chapter: ch,
            matchedMember: mem,
            role: mem.role || 'Member',
            isLeader: !!mem.is_leadership,
            matchField: 'email',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (name && mName && (mName === name || mName.includes(name) || name.includes(mName))) {
          return {
            chapter: ch,
            matchedMember: mem,
            role: mem.role || 'Member',
            isLeader: !!mem.is_leadership,
            matchField: 'name',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }

        if (phone && mPhone && (mPhone === phone || mPhone.endsWith(phone.slice(-9)))) {
          return {
            chapter: ch,
            matchedMember: mem,
            role: mem.role || 'Member',
            isLeader: !!mem.is_leadership,
            matchField: 'phone',
            provincialLeadInfo: {
              isLeadUniversity: !!ch.is_provincial_lead_university,
              assignedLeadName: ch.assigned_provincial_university_name
            }
          };
        }
      }
    }
  }

  return null;
}

// -------------------------------------------------------------
// CHAPTER REGISTRATION & ADMIN APPROVAL WORKFLOW
// -------------------------------------------------------------

export async function getChapterRegistrationRequests(): Promise<ChapterRegistrationRequest[]> {
  const localReqs = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  try {
    const { data, error } = await supabase.from('chapter_registration_requests').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // fallback to local
  }
  return localReqs;
}

export async function submitChapterRegistrationRequest(
  request: Omit<ChapterRegistrationRequest, 'id' | 'status' | 'created_at' | 'updated_at'>
): Promise<ChapterRegistrationRequest> {
  // Enforce YARA in proposed name
  let name = request.proposed_name.trim();
  if (!/^YARA\b/i.test(name) && !name.includes('YARA')) {
    name = `YARA ${name}`;
  }

  // Determine provincial university lead alignment
  const provinceLead = PROVINCIAL_LEAD_UNIVERSITIES[request.province];
  const isProvincialLead = request.category === 'university' && (!request.assigned_provincial_university_name || request.assigned_provincial_university_name.includes(request.institution_or_community));

  const newRequest: ChapterRegistrationRequest = {
    ...request,
    proposed_name: name,
    id: 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    status: 'pending',
    assigned_provincial_university_name: isProvincialLead 
      ? `${request.institution_or_community} [Designated Provincial University Lead]`
      : (provinceLead ? provinceLead.defaultChapterName : request.assigned_provincial_university_name),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const requests = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  const updated = [newRequest, ...requests];
  setLocal('yara_chapter_registration_requests', updated);

  try {
    await supabase.from('chapter_registration_requests').insert(newRequest);
  } catch {
    // safe fallback
  }

  return newRequest;
}

export async function approveChapterRegistration(
  requestId: string,
  adminNotes?: string,
  adminName: string = 'National Executive Secretariat'
): Promise<Chapter | null> {
  const requests = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  const reqIdx = requests.findIndex(r => r.id === requestId);
  if (reqIdx < 0) return null;

  const req = requests[reqIdx];
  req.status = 'approved';
  req.admin_notes = adminNotes || 'Approved by National Executive. Chapter is officially chartered.';
  req.updated_at = new Date().toISOString();
  setLocal('yara_chapter_registration_requests', requests);

  // Generate unique chapter code
  const provinceAbbr = (req.province || 'ZW').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const instAbbr = (req.institution_or_community || 'CH').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const code = `YARA-${provinceAbbr}-${instAbbr}-${Math.floor(10 + Math.random() * 90)}`;

  const isProvLead = req.category === 'university';

  // Prepare approved leaders list with pins
  const approvedLeaders = (req.leaders || []).map(l => ({
    ...l,
    is_approved_by_admin: true,
    approved_by_admin_at: new Date().toISOString(),
    approved_by_admin_name: adminName,
    access_pin: `${code}-${l.role.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    can_submit_general_reports: true,
    can_submit_financial_reports: ['chairperson', 'secretary', 'treasurer'].includes(l.role)
  }));

  // Build new chapter
  const newChapter: Chapter = {
    id: 'ch-' + Date.now().toString(36),
    name: req.proposed_name,
    code,
    category: req.category,
    institution_or_community: req.institution_or_community,
    province: req.province,
    district_or_city: req.district_or_city,
    banner_url: req.banner_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    logo_url: req.logo_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
    description: req.description,
    established_date: new Date().toISOString().split('T')[0],
    status: 'chartered',
    approval_status: 'approved',
    registration_request_id: req.id,
    is_provincial_lead_university: isProvLead,
    assigned_provincial_university_name: req.assigned_provincial_university_name,
    total_members_count: req.total_members_count || (req.members?.length || 1),
    active_projects_count: 0,
    public_email: req.public_email,
    public_phone: req.public_phone,
    meeting_schedule: req.meeting_schedule,
    physical_location: req.physical_location,
    focus_areas: req.focus_areas && req.focus_areas.length > 0 ? req.focus_areas : ['Robotics', 'STEM', 'Community Innovation'],
    leaders: approvedLeaders,
    members: req.members || [],
    projects: [],
    activities: [],
    patron_advisor: req.patron_advisor,
    confidential_info: {
      internal_budget_balance_usd: 0,
      national_patron_supervisor: adminName,
      private_executive_notes: `Charter approved on ${new Date().toLocaleDateString()}. Initial setup grant pending.`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const updatedChapters = [newChapter, ...chapters];
  setLocal('yara_chapters_data', updatedChapters);

  try {
    await supabase.from('chapters').insert(newChapter);
    await supabase.from('chapter_registration_requests').update({
      status: 'approved',
      admin_notes: req.admin_notes,
      updated_at: req.updated_at
    }).eq('id', requestId);
  } catch {
    // fallback
  }

  return newChapter;
}

export async function rejectChapterRegistration(
  requestId: string,
  adminNotes: string
): Promise<boolean> {
  const requests = getLocal<ChapterRegistrationRequest[]>('yara_chapter_registration_requests', INITIAL_REGISTRATION_REQUESTS);
  const reqIdx = requests.findIndex(r => r.id === requestId);
  if (reqIdx < 0) return false;

  requests[reqIdx].status = 'rejected';
  requests[reqIdx].admin_notes = adminNotes;
  requests[reqIdx].updated_at = new Date().toISOString();
  setLocal('yara_chapter_registration_requests', requests);

  try {
    await supabase.from('chapter_registration_requests').update({
      status: 'rejected',
      admin_notes: adminNotes,
      updated_at: requests[reqIdx].updated_at
    }).eq('id', requestId);
  } catch {
    // fallback
  }

  return true;
}

// -------------------------------------------------------------
// CHAPTER MEMBERS ROSTER MANAGEMENT
// -------------------------------------------------------------

export async function addChapterMember(
  chapterId: string,
  member: Omit<ChapterMember, 'id'>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const newMember: ChapterMember = {
    ...member,
    id: 'mem-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    joined_date: member.joined_date || new Date().toISOString().split('T')[0],
    status: member.status || 'active'
  };

  const existingMembers = chapters[chIdx].members || [];
  chapters[chIdx].members = [newMember, ...existingMembers];
  chapters[chIdx].total_members_count = chapters[chIdx].members.length;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      members: chapters[chIdx].members,
      total_members_count: chapters[chIdx].total_members_count,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function updateChapterMember(
  chapterId: string,
  memberId: string,
  updates: Partial<ChapterMember>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const members = chapters[chIdx].members || [];
  const mIdx = members.findIndex(m => m.id === memberId);
  if (mIdx < 0) return null;

  members[mIdx] = { ...members[mIdx], ...updates };
  chapters[chIdx].members = members;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      members: chapters[chIdx].members,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function deleteChapterMember(
  chapterId: string,
  memberId: string
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const members = (chapters[chIdx].members || []).filter(m => m.id !== memberId);
  chapters[chIdx].members = members;
  chapters[chIdx].total_members_count = members.length;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      members: chapters[chIdx].members,
      total_members_count: chapters[chIdx].total_members_count,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

// -------------------------------------------------------------
// CHAPTER RETRIEVAL & CRUD
// -------------------------------------------------------------

export async function getChapters(includeConfidential: boolean = false): Promise<Chapter[]> {
  const local = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  try {
    const { data, error } = await supabase.from('chapters').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      if (!includeConfidential) {
        return data.map(ch => ({
          ...ch,
          confidential_info: undefined
        }));
      }
      return data;
    }
  } catch {
    // fallback to local
  }

  if (!includeConfidential) {
    return local.map(ch => ({
      ...ch,
      confidential_info: undefined
    }));
  }
  return local;
}

export async function getChapterById(id: string, includeConfidential: boolean = false): Promise<Chapter | null> {
  const chapters = await getChapters(includeConfidential);
  return chapters.find(c => c.id === id) || null;
}

export async function createChapter(chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> {
  const newChapter: Chapter = {
    ...chapter,
    id: 'ch-' + Date.now().toString(36),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const updated = [newChapter, ...chapters];
  setLocal('yara_chapters_data', updated);

  try {
    await supabase.from('chapters').insert(newChapter);
  } catch {
    // fallback
  }

  return newChapter;
}

export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const idx = chapters.findIndex(c => c.id === id);
  if (idx < 0) return null;

  chapters[idx] = {
    ...chapters[idx],
    ...updates,
    updated_at: new Date().toISOString()
  };

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update(chapters[idx]).eq('id', id);
  } catch {
    // fallback
  }

  return chapters[idx];
}

export async function deleteChapter(id: string): Promise<boolean> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const filtered = chapters.filter(c => c.id !== id);
  setLocal('yara_chapters_data', filtered);

  try {
    await supabase.from('chapters').delete().eq('id', id);
  } catch {
    // fallback
  }

  return true;
}

// -------------------------------------------------------------
// LEADERSHIP VERIFICATION & AUDIT PIN HELPERS
// -------------------------------------------------------------

export interface LeadershipVerificationResult {
  isAuthorized: boolean;
  isApprovedSecretary?: boolean;
  matchedLeaderId?: string;
  matchedLeaderName?: string;
  matchedRole?: string;
  matchedRoleType?: ChapterLeaderRole | string;
  verificationMethod?: 'roster_email' | 'access_pin' | 'admin_override' | 'auth_session';
  approvedAt?: string;
  approvedBy?: string;
  canSubmitGeneralReports?: boolean;
  canSubmitFinancialReports?: boolean;
  reason?: string;
}

export function verifyLeadershipAuthorization(
  chapter: Chapter,
  submitterEmail?: string,
  submitterName?: string,
  accessPin?: string,
  isAdmin: boolean = false,
  reportCategory: 'general' | 'financial' | 'project_milestone' = 'general'
): LeadershipVerificationResult {
  if (isAdmin) {
    return {
      isAuthorized: true,
      isApprovedSecretary: true,
      matchedRole: 'National Executive Administrator',
      verificationMethod: 'admin_override',
      canSubmitGeneralReports: true,
      canSubmitFinancialReports: true
    };
  }

  const cleanPin = accessPin ? accessPin.trim().toUpperCase() : '';
  const cleanEmail = submitterEmail ? submitterEmail.trim().toLowerCase() : '';

  // 1. PIN verification
  if (cleanPin && chapter.leaders && chapter.leaders.length > 0) {
    const pinMatchedLeader = chapter.leaders.find(
      l => (l.access_pin && l.access_pin.toUpperCase() === cleanPin) ||
           (l.secretary_access_pin && l.secretary_access_pin.toUpperCase() === cleanPin)
    );

    if (pinMatchedLeader) {
      if (pinMatchedLeader.is_approved_by_admin === false) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Leadership Approval Pending: ${pinMatchedLeader.name} is registered as ${formatRoleName(pinMatchedLeader.role)} on ${chapter.name}, but has NOT yet been approved by the National Executive Admin.`
        };
      }

      const isFinancialRole = ['treasurer', 'chairperson', 'secretary', 'vice_chair', 'vice_secretary'].includes(pinMatchedLeader.role);
      const isGeneralRole = ['secretary', 'vice_secretary', 'chairperson', 'vice_chair'].includes(pinMatchedLeader.role);

      const canDoFinancial = pinMatchedLeader.can_submit_financial_reports ?? isFinancialRole;
      const canDoGeneral = pinMatchedLeader.can_submit_general_reports ?? isGeneralRole;

      if (reportCategory === 'financial' && !canDoFinancial) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Role Restriction: ${pinMatchedLeader.name} (${formatRoleName(pinMatchedLeader.role)}) does not have permission to submit official financial statements.`
        };
      }

      if (reportCategory !== 'financial' && !canDoGeneral) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Role Restriction: ${pinMatchedLeader.name} (${formatRoleName(pinMatchedLeader.role)}) does not have permission to submit general chapter reports.`
        };
      }

      return {
        isAuthorized: true,
        isApprovedSecretary: true,
        matchedLeaderId: pinMatchedLeader.id,
        matchedLeaderName: pinMatchedLeader.name,
        matchedRole: `${formatRoleName(pinMatchedLeader.role)} (Admin-Approved)`,
        matchedRoleType: pinMatchedLeader.role,
        verificationMethod: 'access_pin',
        approvedAt: pinMatchedLeader.approved_by_admin_at,
        approvedBy: pinMatchedLeader.approved_by_admin_name || 'National Executive Admin',
        canSubmitGeneralReports: canDoGeneral,
        canSubmitFinancialReports: canDoFinancial
      };
    }
  }

  // 2. Email verification against chapter leadership roster
  if (cleanEmail && chapter.leaders && chapter.leaders.length > 0) {
    const leaderByEmail = chapter.leaders.find(l => l.email?.toLowerCase() === cleanEmail);

    if (leaderByEmail) {
      if (leaderByEmail.is_approved_by_admin === false) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Leadership Approval Pending: ${leaderByEmail.name} is registered as ${formatRoleName(leaderByEmail.role)} on ${chapter.name}, but has NOT yet been approved by the National Executive Admin in the dashboard.`
        };
      }

      const isFinancialRole = ['treasurer', 'chairperson', 'secretary', 'vice_chair', 'vice_secretary'].includes(leaderByEmail.role);
      const isGeneralRole = ['secretary', 'vice_secretary', 'chairperson', 'vice_chair'].includes(leaderByEmail.role);

      const canDoFinancial = leaderByEmail.can_submit_financial_reports ?? isFinancialRole;
      const canDoGeneral = leaderByEmail.can_submit_general_reports ?? isGeneralRole;

      if (reportCategory === 'financial' && !canDoFinancial) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Role Restriction: ${leaderByEmail.name} is registered as ${formatRoleName(leaderByEmail.role)}. Financial statements must be submitted by an Admin-Approved Chapter Treasurer, President/Chairperson, or Secretary.`
        };
      }

      if (reportCategory !== 'financial' && !canDoGeneral) {
        return {
          isAuthorized: false,
          isApprovedSecretary: false,
          reason: `Role Restriction: ${leaderByEmail.name} is registered as ${formatRoleName(leaderByEmail.role)}. General progress reports must be submitted by an Admin-Approved Chapter Secretary or Chairperson.`
        };
      }

      return {
        isAuthorized: true,
        isApprovedSecretary: true,
        matchedLeaderId: leaderByEmail.id,
        matchedLeaderName: leaderByEmail.name,
        matchedRole: `${formatRoleName(leaderByEmail.role)} (Admin-Approved)`,
        matchedRoleType: leaderByEmail.role,
        verificationMethod: 'roster_email',
        approvedAt: leaderByEmail.approved_by_admin_at,
        approvedBy: leaderByEmail.approved_by_admin_name || 'National Executive Admin',
        canSubmitGeneralReports: canDoGeneral,
        canSubmitFinancialReports: canDoFinancial
      };
    }
  }

  // If no match found
  if (cleanEmail) {
    return {
      isAuthorized: false,
      isApprovedSecretary: false,
      reason: `Unauthorized: The email "${cleanEmail}" is not recognized as an admin-approved Chapter Leader for ${chapter.name}.`
    };
  }

  return {
    isAuthorized: false,
    isApprovedSecretary: false,
    reason: 'Authorization Required: Official reports must be submitted by Chapter Leadership (President/Chairperson, Secretary, or Treasurer) assigned and approved by the National Executive Admin.'
  };
}

export function verifySecretaryAuthorization(
  chapter: Chapter,
  submitterEmail?: string,
  submitterName?: string,
  secretarialAccessPin?: string,
  isAdmin: boolean = false,
  reportCategory: 'general' | 'financial' | 'project_milestone' = 'general'
): LeadershipVerificationResult {
  return verifyLeadershipAuthorization(
    chapter,
    submitterEmail,
    submitterName,
    secretarialAccessPin,
    isAdmin,
    reportCategory
  );
}

export async function approveChapterLeader(
  chapterId: string, 
  leaderId: string, 
  permissions?: {
    can_submit_general_reports?: boolean;
    can_submit_financial_reports?: boolean;
    access_pin?: string;
  },
  adminName: string = 'National Executive Admin'
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const targetLeader = (chapters[chIdx].leaders || []).find(l => l.id === leaderId);
  if (!targetLeader) return null;

  const rolePrefix = targetLeader.role === 'treasurer' ? 'TREAS' : targetLeader.role === 'chairperson' ? 'PRES' : 'SEC';
  const cleanCode = chapters[chIdx].code.replace(/[^A-Z0-9]/gi, '');
  const generatedPin = permissions?.access_pin || `${cleanCode}-${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  const isFinancialDefault = ['treasurer', 'chairperson', 'secretary'].includes(targetLeader.role);
  const isGeneralDefault = ['secretary', 'vice_secretary', 'chairperson'].includes(targetLeader.role);

  targetLeader.is_approved_by_admin = true;
  targetLeader.approved_by_admin_at = new Date().toISOString();
  targetLeader.approved_by_admin_name = adminName;
  targetLeader.access_pin = generatedPin;
  targetLeader.secretary_access_pin = generatedPin;
  targetLeader.can_submit_general_reports = permissions?.can_submit_general_reports ?? isGeneralDefault;
  targetLeader.can_submit_financial_reports = permissions?.can_submit_financial_reports ?? isFinancialDefault;

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: new Date().toISOString()
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function revokeChapterLeaderApproval(
  chapterId: string,
  leaderId: string
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const targetLeader = (chapters[chIdx].leaders || []).find(l => l.id === leaderId);
  if (!targetLeader) return null;

  targetLeader.is_approved_by_admin = false;
  targetLeader.approved_by_admin_at = undefined;
  targetLeader.approved_by_admin_name = undefined;
  targetLeader.access_pin = undefined;
  targetLeader.secretary_access_pin = undefined;

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: new Date().toISOString()
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export const approveChapterSecretary = approveChapterLeader;
export const revokeChapterSecretary = revokeChapterLeaderApproval;

export async function addChapterLeader(
  chapterId: string,
  leader: Omit<ChapterLeader, 'id'>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const cleanCode = chapters[chIdx].code.replace(/[^A-Z0-9]/gi, '');
  const rolePrefix = leader.role === 'treasurer' ? 'TREAS' : leader.role === 'chairperson' ? 'PRES' : 'SEC';
  const accessPin = leader.access_pin || `${cleanCode}-${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newLeader: ChapterLeader = {
    ...leader,
    id: 'lead-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    access_pin: accessPin,
    secretary_access_pin: accessPin,
    is_approved_by_admin: leader.is_approved_by_admin ?? true,
    approved_by_admin_at: leader.is_approved_by_admin ? new Date().toISOString() : undefined,
    approved_by_admin_name: leader.is_approved_by_admin ? 'National Executive Admin' : undefined
  };

  const leaders = chapters[chIdx].leaders || [];
  chapters[chIdx].leaders = [...leaders, newLeader];
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function updateChapterLeader(
  chapterId: string,
  leaderId: string,
  updates: Partial<ChapterLeader>
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const leaders = chapters[chIdx].leaders || [];
  const lIdx = leaders.findIndex(l => l.id === leaderId);
  if (lIdx < 0) return null;

  leaders[lIdx] = { ...leaders[lIdx], ...updates };
  chapters[chIdx].leaders = leaders;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

export async function deleteChapterLeader(
  chapterId: string,
  leaderId: string
): Promise<Chapter | null> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chIdx = chapters.findIndex(c => c.id === chapterId);
  if (chIdx < 0) return null;

  const leaders = (chapters[chIdx].leaders || []).filter(l => l.id !== leaderId);
  chapters[chIdx].leaders = leaders;
  chapters[chIdx].updated_at = new Date().toISOString();

  setLocal('yara_chapters_data', chapters);

  try {
    await supabase.from('chapters').update({
      leaders: chapters[chIdx].leaders,
      updated_at: chapters[chIdx].updated_at
    }).eq('id', chapterId);
  } catch {
    // fallback
  }

  return chapters[chIdx];
}

// -------------------------------------------------------------
// CHAPTER REPORTS
// -------------------------------------------------------------

const INITIAL_REPORTS: ChapterReport[] = [
  {
    id: 'rep-cut-2026-01',
    chapter_id: 'ch-cut-01',
    chapter_name: 'YARA Chinhoyi University of Technology (CUT) Chapter',
    chapter_category: 'university',
    report_title: 'CUT Chapter Q1 2026 Hardware Development & High School Outreach Report',
    report_category: 'general',
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
    is_locked: true,
    locked_at: '2026-02-24T12:30:00Z',
    locked_by_name: 'Kudzai Moyo (Approved Chapter Secretary)',
    leadership_verified: true,
    leadership_approved_by_admin: true,
    secretary_verified: true,
    leadership_verification_method: 'roster_email',
    secretary_verification_method: 'roster_email',
    document_seal_code: 'YARA-NAT-SEAL-CUT96',
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
    id: 'rep-cut-fin-2026',
    chapter_id: 'ch-cut-01',
    chapter_name: 'YARA Chinhoyi University of Technology (CUT) Chapter',
    chapter_category: 'university',
    report_title: 'CUT Chapter Q1 2026 Treasury & Grant Acquittal Statement',
    report_category: 'financial',
    period_type: 'financial',
    period_date: 'Q1 2026',
    submitted_by_name: 'Nyasha Mupfumi',
    submitted_by_role: 'Chapter Treasurer',
    submitted_by_email: 'nyasha.m@cut.ac.zw',
    submitted_at: '2026-02-25T14:10:00Z',
    executive_summary: 'Comprehensive financial accounting of chapter funds, national grant acquittal, component procurement, and lab maintenance expenses for Q1 2026.',
    activities_undertaken: 'Procured waterproof housings, ESC motor controllers, and funded transport for 38 participants during the Girls in Robotics Bootcamp.',
    attendance_count: 42,
    hardware_projects_update: 'Financially acquitted $450 grant received from National Secretariat with itemized invoices attached.',
    challenges_and_needs: 'Budget balance is currently $650; requesting $200 additional support for national competition components.',
    report_document_url: 'https://docs.google.com/spreadsheets/d/1YARA-CUT-Treasury-Q1-2026/edit',
    financial_statement_url: 'https://docs.google.com/spreadsheets/d/1YARA-CUT-Treasury-Q1-2026/edit',
    financial_data: {
      opening_balance_usd: 400,
      total_inflow_usd: 700,
      total_expenditure_usd: 450,
      closing_balance_usd: 650,
      grant_received_usd: 500,
      grant_acquittal_notes: 'All grant funds allocated toward waterproof ROV chassis and LoRa agricultural test nodes.',
      category_breakdown: {
        hardware_and_components_usd: 280,
        logistics_and_transport_usd: 70,
        competition_and_events_usd: 40,
        workshop_materials_and_catering_usd: 60,
        tools_and_equipment_usd: 0,
        miscellaneous_usd: 0
      },
      treasurer_certified: true,
      treasurer_name: 'Nyasha Mupfumi'
    },
    status: 'assessed',
    is_locked: true,
    locked_at: '2026-02-25T14:10:00Z',
    locked_by_name: 'Nyasha Mupfumi (Approved Chapter Treasurer)',
    leadership_verified: true,
    leadership_approved_by_admin: true,
    secretary_verified: true,
    leadership_verification_method: 'roster_email',
    document_seal_code: 'YARA-NAT-FIN-CUT42',
    executive_assessment: {
      assessed_by_name: 'National Financial Comptroller',
      assessed_by_email: 'goyaracorp@gmail.com',
      assessed_at: '2026-02-26T10:00:00Z',
      grade: 'Outstanding (A)',
      score_out_of_100: 98,
      national_executive_feedback: 'All receipts verified and aligned with chapter project milestones. Full compliance with YARA financial audit standards.',
      grant_allocation_recommended: true,
      recommended_grant_usd: 200
    }
  },
  {
    id: 'rep-pe-2026-02',
    chapter_id: 'ch-pe-04',
    chapter_name: 'YARA Prince Edward High School Chapter',
    chapter_category: 'high_school',
    report_title: 'Prince Edward Robotics Club Monthly Technical Progress',
    report_category: 'general',
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
    status: 'submitted',
    is_locked: true,
    locked_at: '2026-02-22T09:15:00Z',
    locked_by_name: 'Blessing Nyathi (Approved Club Secretary)',
    leadership_verified: true,
    leadership_approved_by_admin: true,
    secretary_verified: true,
    leadership_verification_method: 'roster_email',
    secretary_verification_method: 'roster_email',
    document_seal_code: 'YARA-NAT-SEAL-PE24'
  }
];

export async function getChapterReports(chapterId?: string): Promise<ChapterReport[]> {
  const local = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  let allReports = local;

  try {
    const { data, error } = await supabase.from('chapter_reports').select('*').order('submitted_at', { ascending: false });
    if (!error && data && data.length > 0) {
      allReports = data;
    }
  } catch {
    // fallback
  }

  if (chapterId) {
    return allReports.filter(r => r.chapter_id === chapterId);
  }
  return allReports;
}

export async function submitChapterReport(
  reportData: Omit<ChapterReport, 'id' | 'submitted_at' | 'status' | 'is_locked' | 'locked_at' | 'locked_by_name' | 'document_seal_code' | 'leadership_verified' | 'leadership_approved_by_admin' | 'secretary_verified' | 'secretary_approved_by_admin'>,
  options?: {
    secretarialAccessPin?: string;
    isAdmin?: boolean;
  }
): Promise<ChapterReport> {
  const chapters = getLocal<Chapter[]>('yara_chapters_data', INITIAL_CHAPTERS);
  const chapter = chapters.find(c => c.id === reportData.chapter_id);
  if (!chapter) {
    throw new Error('Chapter not found in registry.');
  }

  const category = reportData.report_category || (reportData.period_type === 'financial' ? 'financial' : 'general');

  const verification = verifyLeadershipAuthorization(
    chapter,
    reportData.submitted_by_email,
    reportData.submitted_by_name,
    options?.secretarialAccessPin,
    options?.isAdmin || false,
    category
  );

  if (!verification.isAuthorized) {
    throw new Error(verification.reason || 'Unauthorized report submission.');
  }

  const now = new Date().toISOString();
  const shouldLock = true;
  const sealCode = `YARA-SEAL-${chapter.code.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString(36).toUpperCase()}`;

  const newReport: ChapterReport = {
    chapter_id: reportData.chapter_id,
    chapter_name: reportData.chapter_name,
    chapter_category: reportData.chapter_category,
    report_title: reportData.report_title,
    report_category: category,
    period_type: reportData.period_type,
    period_date: reportData.period_date,
    submitted_by_name: reportData.submitted_by_name,
    submitted_by_role: verification.matchedRole || reportData.submitted_by_role || 'Approved Chapter Leader',
    submitted_by_email: reportData.submitted_by_email,
    submitted_by_leader_id: verification.matchedLeaderId,
    executive_summary: reportData.executive_summary,
    activities_undertaken: reportData.activities_undertaken,
    attendance_count: reportData.attendance_count,
    hardware_projects_update: reportData.hardware_projects_update,
    challenges_and_needs: reportData.challenges_and_needs,
    report_document_url: reportData.report_document_url,
    financial_statement_url: reportData.financial_statement_url,
    financial_data: reportData.financial_data,
    supporting_images: reportData.supporting_images,
    id: 'rep-' + Date.now().toString(36),
    submitted_at: now,
    status: 'submitted',
    is_locked: shouldLock,
    locked_at: shouldLock ? now : undefined,
    locked_by_name: shouldLock ? `${reportData.submitted_by_name} (${verification.matchedRole || 'Approved Leader'})` : undefined,
    leadership_verified: true,
    leadership_approved_by_admin: true,
    secretary_verified: true,
    secretary_approved_by_admin: true,
    leadership_verification_method: verification.verificationMethod || 'roster_email',
    secretary_verification_method: verification.verificationMethod || 'roster_email',
    document_seal_code: sealCode
  };

  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const updated = [newReport, ...reports];
  setLocal('yara_chapter_reports', updated);

  try {
    await supabase.from('chapter_reports').insert(newReport);
  } catch {
    // fallback
  }

  return newReport;
}

export async function toggleChapterReportLock(
  reportId: string, 
  locked: boolean, 
  operatorName: string = 'National Executive'
): Promise<ChapterReport | null> {
  const reports = getLocal<ChapterReport[]>('yara_chapter_reports', INITIAL_REPORTS);
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx < 0) return null;

  reports[idx].is_locked = locked;
  if (locked) {
    reports[idx].locked_at = new Date().toISOString();
    reports[idx].locked_by_name = operatorName;
    if (!reports[idx].document_seal_code) {
      reports[idx].document_seal_code = `YARA-SEAL-NAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }
  }

  setLocal('yara_chapter_reports', reports);

  try {
    await supabase.from('chapter_reports').update({
      is_locked: locked,
      locked_at: reports[idx].locked_at,
      locked_by_name: reports[idx].locked_by_name,
      document_seal_code: reports[idx].document_seal_code
    }).eq('id', reportId);
  } catch {
    // fallback
  }

  return reports[idx];
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
  reports[idx].is_locked = true;
  reports[idx].locked_at = new Date().toISOString();
  reports[idx].locked_by_name = assessment.assessed_by_name || 'National Executive Committee';

  setLocal('yara_chapter_reports', reports);

  try {
    await supabase.from('chapter_reports').update({
      status: 'assessed',
      executive_assessment: assessment,
      is_locked: true,
      locked_at: reports[idx].locked_at,
      locked_by_name: reports[idx].locked_by_name
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
  const target = reports.find(r => r.id === reportId);
  if (target && target.is_locked) {
    throw new Error('Cannot delete a locked National submission. Unlock first in the National Admin Console.');
  }

  const filtered = reports.filter(r => r.id !== reportId);
  setLocal('yara_chapter_reports', filtered);
  return true;
}

