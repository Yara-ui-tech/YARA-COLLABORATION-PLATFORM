export type EventPaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type EventApprovalStatus = 'pending' | 'approved' | 'rejected';
export type EventTimelineStatus = 'upcoming' | 'live' | 'closed';

export interface EventAccessResult {
  is_granted: boolean;
  reason: 'unregistered' | 'unpaid' | 'payment_submitted' | 'payment_verified' | 'approved' | 'rejected';
  message: string;
  registration?: EventRegistration | null;
  timeline_status: EventTimelineStatus;
  canEnter?: boolean;
  statusType?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  event_title: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  school_institution: string;
  role_title: string;
  province: string;
  registration_fee: number;
  currency: string;
  continuous_support_opt_in: boolean;
  
  // Payment Verification
  payment_status: EventPaymentStatus;
  payment_method?: 'ecocash' | 'innbucks' | 'card_stripe' | 'bank_transfer' | 'manual_admin' | 'zipit';
  payment_reference?: string;
  proof_of_payment_url?: string;
  paid_at?: string;
  
  // Admin Approval
  approval_status: EventApprovalStatus;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  
  // Live Attendance
  has_entered_event: boolean;
  last_entered_at?: string;
  entry_count: number;
  
  created_at: string;
  updated_at?: string;
}

export interface BootcampModule {
  id: string;
  day: number;
  date: string;
  title: string;
  duration: string;
  description: string;
  topics: string[];
  trainer: string;
  resources: { name: string; type: 'pdf' | 'doc' | 'prompt_template' | 'video'; url: string }[];
  is_live?: boolean;
}

export const AI_FOR_EDUCATORS_EVENT = {
  id: 'ai-for-educators-2026',
  title: 'AI for Educators – Online Bootcamp',
  event_name: 'AI for Educators – Online Bootcamp',
  full_title: 'YARA AI FOR EDUCATORS: FIVE-DAY INTRODUCTORY ONLINE BOOTCAMP',
  slug: 'ai-for-educators',
  organiser: 'Young Africans Robotics Association (YARA)',
  theme: 'EMPOWER • EDUCATE • INNOVATE',
  tagline: 'Empower. Educate. Innovate.',
  course_level: 'INTRODUCTORY',
  level_description: 'This is an introductory, practical course for educators and education professionals who are beginning their journey with Artificial Intelligence and digital tools. No advanced technical or programming knowledge is required. The purpose is to build confidence, demonstrate practical possibilities and help participants begin using AI and digital tools responsibly in their everyday educational work.',
  eventType: 'Live Online Training',
  event_type: 'Live Online Training',
  startDate: '2026-08-31T08:00:00.000Z',
  endDate: '2026-09-04T18:00:00.000Z',
  start_date: '2026-08-31T08:00:00.000Z',
  close_date: '2026-09-04T18:00:00.000Z',
  dates_display: '31 August – 4 September 2026',
  registrationFeeUSD: 10,
  continuousSupportUSD: 15,
  continuousSupportInterval: 'per term',
  image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80',
  description:
    'The YARA AI for Educators Online Bootcamp introduces educators to practical uses of Artificial Intelligence and digital technologies across teaching, assessment, administration, communication, research, content creation and productivity. Participants will learn where automation can reduce repetitive work, where human judgement must remain central, and how to combine AI with familiar digital tools to improve educational practice.',
  target_participants: [
    'Teachers and educators',
    'School heads and administrators',
    'Ministry and education delegates',
    'Education officers',
    'Teacher trainers',
    'ICT/digital learning coordinators',
    'Lecturers',
    'Education support personnel'
  ],
  learning_objectives: [
    'Understand the basic concepts of AI, generative AI, automation and digital education tools.',
    'Build confidence in using AI assistants and other accessible digital tools without requiring programming skills.',
    'Learn practical prompting techniques for common education tasks.',
    'Use AI and digital tools to create and improve lesson plans, schemes of work and teaching resources.',
    'Use AI and digital assessment tools to create quizzes, tests, question banks, rubrics, marking guides, feedback and other assessment materials.',
    'Explore responsible automation of repetitive educator tasks while maintaining human review and decision-making.',
    'Use digital tools to support learner activities, differentiation, communication, research and collaboration.',
    'Understand privacy, accuracy, bias, copyright, academic integrity and responsible AI use.',
    'Create a simple personal AI-and-digital-tool workflow that can be applied after the course.'
  ],
  practical_automation_areas: [
    'Lesson planning',
    'Schemes of work',
    'Teaching resources',
    'Quizzes and tests',
    'Question banks',
    'Rubrics and marking guides',
    'Feedback preparation',
    'Learner activity generation',
    'Reports and documentation',
    'Meeting agendas and minutes',
    'Professional correspondence',
    'Research and summarisation',
    'Data organisation',
    'Digital forms',
    'Resource sharing',
    'Communication',
    'Repetitive administrative workflows'
  ],
  expected_outcomes: [
    'Participants can explain the basic role of AI, digital tools and automation in education.',
    'Participants can write effective prompts for common education tasks.',
    'Participants can use AI to support lesson planning, content creation and classroom activities.',
    'Participants can use AI and digital tools to create, organise and support assessments.',
    'Participants can identify repetitive tasks suitable for responsible automation.',
    'Participants can use AI for administration, communication, research and productivity.',
    'Participants can critically review AI outputs before using them.',
    'Participants understand responsible AI practices and the importance of human judgement.',
    'Each participant completes a practical AI-enhanced education workflow or project.'
  ],
  core_philosophy: 'AI DOES NOT REPLACE THE EDUCATOR.',
  core_philosophy_subtitle: 'This introductory course gives educators practical tools to work smarter, automate responsibly and focus more on teaching and learners.',
  certification_note: 'Certificates of Completion will be offered after the scheduled one-day physical practical session. The physical session provides participants with an opportunity to consolidate the knowledge gained during the introductory online programme through hands-on activities and practical application.',
  five_day_programme: [
    {
      day: 1,
      title: 'DAY 1 — AI & DIGITAL TOOLS: GETTING STARTED',
      date: 'Monday, 31 August 2026',
      sessions: [
        {
          session: 'Introduction to AI in Education',
          practical_focus: 'What AI is, generative AI, AI assistants, digital tools, automation and realistic expectations for educators.'
        },
        {
          session: 'AI Tools for Educators',
          practical_focus: 'Guided introduction to accessible AI and digital tools for teaching, learning, assessment and administration.'
        },
        {
          session: 'AI in the Education Workflow',
          practical_focus: 'Identify repetitive tasks that can be assisted or partially automated while keeping educators in control.'
        },
        {
          session: 'First Practical AI Activities',
          practical_focus: 'Participants practise asking AI for explanations, ideas, summaries, classroom activities and professional support.'
        },
        {
          session: 'Accuracy and Verification',
          practical_focus: 'Understand AI errors, hallucinations, bias and why outputs must be checked before educational use.'
        }
      ]
    },
    {
      day: 2,
      title: 'DAY 2 — PROMPTING, LESSON PLANNING & CONTENT CREATION',
      date: 'Tuesday, 1 September 2026',
      sessions: [
        {
          session: 'The Art of Prompting',
          practical_focus: 'Learn how to give AI clear instructions using role, task, context, requirements and output format.'
        },
        {
          session: 'AI for Lesson Planning',
          practical_focus: 'Create lesson objectives, lesson plans, activities, homework and learning outcomes.'
        },
        {
          session: 'AI for Schemes of Work',
          practical_focus: 'Use AI to organise topics, sequences, activities and curriculum-support plans.'
        },
        {
          session: 'AI for Teaching Materials',
          practical_focus: 'Create worksheets, notes, summaries, examples, stories, revision materials and learner activities.'
        },
        {
          session: 'Digital Content and Presentation Tools',
          practical_focus: 'Explore tools that help educators turn ideas into presentations, visual resources and structured learning content.'
        }
      ]
    },
    {
      day: 3,
      title: 'DAY 3 — AI & DIGITAL ASSESSMENT',
      date: 'Wednesday, 2 September 2026',
      sessions: [
        {
          session: 'Introduction to Digital Assessment',
          practical_focus: 'Understand online quizzes, forms, question banks, digital submissions and automated assessment workflows.'
        },
        {
          session: 'AI-Assisted Question Creation',
          practical_focus: 'Generate multiple-choice, short-answer, structured and discussion questions with appropriate educator review.'
        },
        {
          session: 'AI for Tests and Examinations',
          practical_focus: 'Develop assessment papers, answer keys, marking guides and question variations.'
        },
        {
          session: 'Rubrics, Feedback and Marking Support',
          practical_focus: 'Use AI and digital tools to create rubrics, feedback comments and marking-support resources.'
        },
        {
          session: 'Assessment Automation',
          practical_focus: 'Explore ways to automate repetitive assessment tasks such as organising responses, generating summaries, identifying common errors and preparing feedback.'
        },
        {
          session: 'Quality Control',
          practical_focus: 'Check AI-generated assessments for accuracy, curriculum alignment, fairness, difficulty and suitability for learners.'
        }
      ]
    },
    {
      day: 4,
      title: 'DAY 4 — AUTOMATION, PRODUCTIVITY & EDUCATION ADMINISTRATION',
      date: 'Thursday, 3 September 2026',
      sessions: [
        {
          session: 'Automating Repetitive Educator Tasks',
          practical_focus: 'Identify tasks that can be simplified, templated or partially automated.'
        },
        {
          session: 'AI for School Administration',
          practical_focus: 'Draft reports, letters, notices, meeting agendas, minutes, summaries, plans and routine documentation.'
        },
        {
          session: 'AI for Communication',
          practical_focus: 'Prepare professional communication for parents, learners, colleagues, school leadership and education stakeholders.'
        },
        {
          session: 'AI for Research and Information Management',
          practical_focus: 'Summarise documents, organise information, compare ideas and support research workflows.'
        },
        {
          session: 'Digital Collaboration & Organisation',
          practical_focus: 'Explore digital tools for shared documents, forms, calendars, task management, resource sharing and collaboration.'
        },
        {
          session: 'Human Oversight',
          practical_focus: 'Understand what should never be fully automated, especially high-stakes decisions involving learners, staff and confidential information.'
        }
      ]
    },
    {
      day: 5,
      title: 'DAY 5 — PRACTICAL APPLICATION, RESPONSIBLE AI & PERSONAL TOOLKIT',
      date: 'Friday, 4 September 2026',
      certificate_note: 'Participants who complete the programme and attend the scheduled one-day physical practical session will be eligible to receive a YARA Certificate of Completion.',
      sessions: [
        {
          session: 'Responsible AI in Education',
          practical_focus: 'Privacy, learner data, academic integrity, copyright, bias, misinformation and ethical use.'
        },
        {
          session: 'Designing an AI-Enhanced Educator Workflow',
          practical_focus: 'Combine AI and digital tools into a simple workflow for teaching, assessment or administration.'
        },
        {
          session: 'Final Practical Project',
          practical_focus: 'Participants create a practical AI-enhanced education package based on a real need from their own professional environment.'
        },
        {
          session: 'Peer Review and Improvement',
          practical_focus: 'Participants share outputs, receive feedback and improve their work.'
        },
        {
          session: 'Personal AI & Digital Toolkit',
          practical_focus: 'Build a reusable collection of prompts, templates, tools and workflows.'
        },
        {
          session: 'Reflection, Assessment & Next Steps',
          practical_focus: 'Review learning, identify future development needs and explore continued YARA support.'
        }
      ]
    }
  ],
  modules: [
    {
      id: 'day-1',
      day: 1,
      date: 'Monday, 31 August 2026',
      title: 'AI & Digital Tools: Getting Started',
      duration: '2.5 Hours (16:00 - 18:30 CAT)',
      description: 'Introduction to AI in education, accessible tools, workflow integration, first hands-on activities, accuracy and verification.',
      topics: [
        'Introduction to AI in Education: Concepts, Generative AI & realistic expectations',
        'AI Tools for Educators: Accessible digital tools for teaching & administration',
        'AI in the Education Workflow: Identifying repetitive tasks with human oversight',
        'First Practical AI Activities: Asking AI for explanations, summaries & ideas',
        'Accuracy and Verification: Catching errors, hallucinations & bias'
      ],
      trainer: 'YARA Senior AI Faculty',
      resources: [
        { name: 'AI & Digital Tools Getting Started Guide.pdf', type: 'pdf', url: '#' },
        { name: 'Educator Prompt Engineering Cheat Sheet.pdf', type: 'pdf', url: '#' }
      ]
    },
    {
      id: 'day-2',
      day: 2,
      date: 'Tuesday, 1 September 2026',
      title: 'Prompting, Lesson Planning & Content Creation',
      duration: '2.5 Hours (16:00 - 18:30 CAT)',
      description: 'The art of prompting, AI for lesson planning, schemes of work, teaching materials, and digital content/presentation tools.',
      topics: [
        'The Art of Prompting: Role, task, context, requirements & output format',
        'AI for Lesson Planning: Objectives, plans, activities & learning outcomes',
        'AI for Schemes of Work: Sequencing topics & curriculum-support plans',
        'AI for Teaching Materials: Worksheets, notes, summaries & stories',
        'Digital Content and Presentation Tools: Visual resources & slides'
      ],
      trainer: 'YARA Pedagogy & STEM Lead',
      resources: [
        { name: 'Lesson Planning Prompt Templates.doc', type: 'doc', url: '#' }
      ]
    },
    {
      id: 'day-3',
      day: 3,
      date: 'Wednesday, 2 September 2026',
      title: 'AI & Digital Assessment',
      duration: '2.5 Hours (16:00 - 18:30 CAT)',
      description: 'Digital assessment workflows, question creation, tests/exams, rubrics, feedback, assessment automation, and quality control.',
      topics: [
        'Introduction to Digital Assessment: Quizzes, forms & digital workflows',
        'AI-Assisted Question Creation: Multiple-choice, short-answer & discussion questions',
        'AI for Tests and Examinations: Assessment papers, answer keys & marking guides',
        'Rubrics, Feedback and Marking Support: Feedback comments & rubrics',
        'Assessment Automation & Quality Control: Ensuring accuracy & curriculum alignment'
      ],
      trainer: 'YARA EdTech & Assessment Specialist',
      resources: [
        { name: 'Digital Assessment & Rubrics Matrix.pdf', type: 'pdf', url: '#' }
      ]
    },
    {
      id: 'day-4',
      day: 4,
      date: 'Thursday, 3 September 2026',
      title: 'Automation, Productivity & Education Administration',
      duration: '2.5 Hours (16:00 - 18:30 CAT)',
      description: 'Automating repetitive educator tasks, school administration, communication, research, digital collaboration, and human oversight.',
      topics: [
        'Automating Repetitive Educator Tasks: Identifying simplifiable workflows',
        'AI for School Administration: Reports, letters, notices & meeting minutes',
        'AI for Communication: Parent, learner & stakeholder professional notices',
        'AI for Research & Information: Summarising documents & data management',
        'Human Oversight: Critical guidelines for high-stakes learner decisions'
      ],
      trainer: 'YARA Executive Education Secretariat',
      resources: [
        { name: 'Educator Administration Templates.pdf', type: 'pdf', url: '#' }
      ]
    },
    {
      id: 'day-5',
      day: 5,
      date: 'Friday, 4 September 2026',
      title: 'Practical Application, Responsible AI & Personal Toolkit',
      duration: '3.0 Hours (15:30 - 18:30 CAT)',
      description: 'Responsible AI in education, designing educator workflows, final practical project, peer review, personal toolkit, and physical certification path.',
      topics: [
        'Responsible AI in Education: Privacy, learner data & academic integrity',
        'Designing an AI-Enhanced Educator Workflow: Combining tools into daily habits',
        'Final Practical Project & Peer Review: Creating real classroom materials',
        'Personal AI & Digital Toolkit: Building your reusable prompt repository',
        'Certification Pathway: Eligibility for the one-day physical practical session'
      ],
      trainer: 'YARA Board of Education & Lead Instructors',
      resources: [
        { name: 'Responsible AI Policy for Schools.pdf', type: 'pdf', url: '#' },
        { name: 'Personal AI Toolkit Starter Kit.pdf', type: 'pdf', url: '#' }
      ]
    }
  ]
};
