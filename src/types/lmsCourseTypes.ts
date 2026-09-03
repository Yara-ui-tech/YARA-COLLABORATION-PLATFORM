// ============================================================================
// YARA LMS – Programming Course Types
// ============================================================================

export type CourseCategory =
  | 'python'
  | 'javascript'
  | 'scratch'
  | 'web_development'
  | 'data_science'
  | 'robotics_programming'
  | 'electronics';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type CourseModuleType = 'video' | 'reading' | 'quiz' | 'project';

export interface CourseQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: CourseModuleType;
  order: number;
  durationMinutes: number;
  videoUrl?: string;
  readingContent?: string;
  quizQuestions?: CourseQuizQuestion[];
  projectInstructions?: string;
}

export interface ProgrammingCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  coverImageUrl?: string;
  estimatedHours: number;
  instructorName: string;
  instructorTitle?: string;
  tags: string[];
  modules: CourseModule[];
  prerequisites?: string[];
  learningOutcomes: string[];
  certificationEnabled: boolean;
  certificationTitle?: string; // e.g. "Python Fundamentals Certificate"
  isPublished: boolean;
  enrolledCount: number;
  rating?: number; // 0-5
  createdAt: string;
  updatedAt: string;
  // Admin metadata
  createdBy?: string;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  isCompleted: boolean;
  progressPercent: number;
  completedModuleIds: string[];
  quizScores: Record<string, number>; // moduleId → score
  lastAccessedAt: string;
}

export interface ProgrammingCertificate {
  id: string;
  userId: string;
  userEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  courseCategory: CourseCategory;
  certificateNumber: string; // e.g. YARA-PROG-2026-001234
  issueDate: string;
  grade: string; // e.g. "Distinction", "Merit", "Pass"
  score: number; // 0-100
  verifyUrl: string;
  isVerified: boolean;
}

export interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  coverImageUrl: string;
  estimatedHours: number;
  instructorName: string;
  instructorTitle: string;
  tags: string;
  learningOutcomes: string;
  prerequisites: string;
  certificationEnabled: boolean;
  certificationTitle: string;
  isPublished: boolean;
}

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  python: 'Python Programming',
  javascript: 'JavaScript / Web',
  scratch: 'Scratch / Block Coding',
  web_development: 'Web Development',
  data_science: 'Data Science & AI',
  robotics_programming: 'Robotics Programming',
  electronics: 'Electronics & Hardware',
};

export const COURSE_CATEGORY_COLORS: Record<CourseCategory, { bg: string; text: string; border: string }> = {
  python: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  javascript: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  scratch: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  web_development: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  data_science: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  robotics_programming: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  electronics: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const DIFFICULTY_LABELS: Record<CourseDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const DIFFICULTY_COLORS: Record<CourseDifficulty, string> = {
  beginner: 'text-emerald-600',
  intermediate: 'text-amber-600',
  advanced: 'text-red-600',
};

// Sample starter courses for demo / MVP
export const STARTER_PROGRAMMING_COURSES: ProgrammingCourse[] = [
  {
    id: 'yara-python-101',
    title: 'Python for Young Innovators',
    subtitle: 'Learn Python from scratch through hands-on robotics projects',
    description:
      'A comprehensive introduction to Python programming tailored for young STEM learners. You will write your first script, control robots with Python, and build real projects from Day 1.',
    category: 'python',
    difficulty: 'beginner',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    estimatedHours: 12,
    instructorName: 'YARA Faculty',
    instructorTitle: 'Lead Robotics Educator',
    tags: ['Python', 'Coding', 'Robotics', 'Beginner', 'STEM'],
    learningOutcomes: [
      'Write and run Python scripts confidently',
      'Understand variables, loops, and functions',
      'Control hardware with Python and MicroPython',
      'Build a mini automation project',
    ],
    prerequisites: [],
    certificationEnabled: true,
    certificationTitle: 'YARA Python Fundamentals Certificate',
    isPublished: true,
    enrolledCount: 0,
    rating: 4.8,
    modules: [
      {
        id: 'py101-m1',
        courseId: 'yara-python-101',
        title: 'Getting Started with Python',
        description: 'Install Python, run your first script, and explore the IDLE editor.',
        type: 'video',
        order: 1,
        durationMinutes: 25,
        videoUrl: '',
        quizQuestions: [
          {
            id: 'q1',
            question: 'What does `print("Hello")` do in Python?',
            options: ['Saves a file', 'Displays "Hello" on screen', 'Deletes "Hello"', 'Opens a browser'],
            correctIndex: 1,
            explanation: 'The print() function outputs text to the console.',
          },
        ],
      },
      {
        id: 'py101-m2',
        courseId: 'yara-python-101',
        title: 'Variables & Data Types',
        description: 'Learn about strings, integers, floats, and booleans in Python.',
        type: 'video',
        order: 2,
        durationMinutes: 30,
        videoUrl: '',
        quizQuestions: [],
      },
      {
        id: 'py101-m3',
        courseId: 'yara-python-101',
        title: 'Loops & Conditions',
        description: 'Master for loops, while loops, and if/else statements.',
        type: 'video',
        order: 3,
        durationMinutes: 35,
        videoUrl: '',
        quizQuestions: [],
      },
      {
        id: 'py101-m4',
        courseId: 'yara-python-101',
        title: 'Functions & Modules',
        description: 'Write reusable functions and import modules.',
        type: 'reading',
        order: 4,
        durationMinutes: 20,
        readingContent:
          'Functions let you package code for reuse. In Python, you define a function using the `def` keyword...',
        quizQuestions: [],
      },
      {
        id: 'py101-m5',
        courseId: 'yara-python-101',
        title: 'Mini Project: Python Light Controller',
        description: 'Use Python to blink an LED via serial communication.',
        type: 'project',
        order: 5,
        durationMinutes: 45,
        projectInstructions: 'Connect your Arduino and use pyserial to send on/off commands from Python...',
        quizQuestions: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'yara-scratch-101',
    title: 'Scratch Block Coding for Robotics',
    subtitle: 'Visual programming to control robots with drag-and-drop blocks',
    description:
      'Perfect for young learners (ages 8–14). Use MIT Scratch to program animations, games, and robot simulations without typing a single line of code.',
    category: 'scratch',
    difficulty: 'beginner',
    coverImageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80',
    estimatedHours: 6,
    instructorName: 'YARA Faculty',
    instructorTitle: 'STEM Education Specialist',
    tags: ['Scratch', 'Block Coding', 'Visual Programming', 'Kids', 'Beginner'],
    learningOutcomes: [
      'Create animations and interactive stories in Scratch',
      'Build a simple game with sprites and events',
      'Program a virtual robot simulation',
      'Share projects online',
    ],
    prerequisites: [],
    certificationEnabled: true,
    certificationTitle: 'YARA Scratch Block Coding Certificate',
    isPublished: true,
    enrolledCount: 0,
    modules: [
      {
        id: 'sc101-m1',
        courseId: 'yara-scratch-101',
        title: 'Introduction to Scratch',
        description: 'Explore the Scratch interface and create your first animation.',
        type: 'video',
        order: 1,
        durationMinutes: 20,
        videoUrl: '',
        quizQuestions: [],
      },
      {
        id: 'sc101-m2',
        courseId: 'yara-scratch-101',
        title: 'Events and Motion',
        description: 'Use event blocks to make sprites move.',
        type: 'video',
        order: 2,
        durationMinutes: 25,
        videoUrl: '',
        quizQuestions: [],
      },
      {
        id: 'sc101-m3',
        courseId: 'yara-scratch-101',
        title: 'Build a Simple Game',
        description: 'Create a catch-the-falling-objects game.',
        type: 'project',
        order: 3,
        durationMinutes: 40,
        projectInstructions: 'Build a complete game using loops, conditionals, and score tracking in Scratch.',
        quizQuestions: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'yara-js-101',
    title: 'JavaScript & Web Fundamentals',
    subtitle: 'Build interactive web pages and learn the language of the web',
    description:
      'From HTML/CSS basics to interactive JavaScript — this course teaches you how modern websites work and how to build your own.',
    category: 'javascript',
    difficulty: 'intermediate',
    coverImageUrl: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?auto=format&fit=crop&w=800&q=80',
    estimatedHours: 16,
    instructorName: 'YARA Faculty',
    instructorTitle: 'Full-Stack Developer & Educator',
    tags: ['JavaScript', 'HTML', 'CSS', 'Web', 'DOM'],
    learningOutcomes: [
      'Understand HTML structure and CSS styling',
      'Write interactive JavaScript for web pages',
      'Manipulate the DOM to update page content',
      'Build and deploy a personal portfolio page',
    ],
    prerequisites: ['Basic computer skills'],
    certificationEnabled: true,
    certificationTitle: 'YARA Web Development Fundamentals Certificate',
    isPublished: true,
    enrolledCount: 0,
    modules: [
      {
        id: 'js101-m1',
        courseId: 'yara-js-101',
        title: 'HTML & Page Structure',
        description: 'Learn HTML tags and build the skeleton of a webpage.',
        type: 'video',
        order: 1,
        durationMinutes: 30,
        videoUrl: '',
        quizQuestions: [],
      },
      {
        id: 'js101-m2',
        courseId: 'yara-js-101',
        title: 'CSS Styling & Layouts',
        description: 'Style your pages with CSS — colors, fonts, flexbox.',
        type: 'video',
        order: 2,
        durationMinutes: 35,
        videoUrl: '',
        quizQuestions: [],
      },
      {
        id: 'js101-m3',
        courseId: 'yara-js-101',
        title: 'JavaScript Basics',
        description: 'Variables, functions, and events in JavaScript.',
        type: 'video',
        order: 3,
        durationMinutes: 40,
        videoUrl: '',
        quizQuestions: [],
      },
      {
        id: 'js101-m4',
        courseId: 'yara-js-101',
        title: 'Final Project: Personal Portfolio',
        description: 'Build and publish your own portfolio website.',
        type: 'project',
        order: 4,
        durationMinutes: 60,
        projectInstructions: 'Create a multi-page portfolio with a bio, projects, and contact form.',
        quizQuestions: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
