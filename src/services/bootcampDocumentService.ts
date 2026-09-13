import { supabase } from '../lib/supabase';

export interface BootcampDocument {
  id: string;
  title: string;
  subtitle?: string;
  category: 'handbook' | 'guide' | 'worksheet' | 'prompt_library' | 'admin_doc' | 'other';
  author: string;
  institution: string;
  version: string;
  publicationDate: string;
  accessLevel: 'approved_educators_only' | 'all_registered';
  allowDownload: boolean; // Strictly false by default for protected docs
  description: string;
  modules: {
    id: string;
    number: number | string;
    title: string;
    summary?: string;
    sections: {
      heading: string;
      content: string | string[];
      callout?: string;
      keyTakeaway?: string;
      examplePrompt?: string;
      tableData?: { headers: string[]; rows: string[][] };
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'yara_bootcamp_documents_v1';

// Default Official YARA AI for Educators Handbook (80 Pages Parsed & Structured)
export const OFFICIAL_AI_HANDBOOK: BootcampDocument = {
  id: 'doc_yara_ai_educators_handbook_2026',
  title: 'AI FOR EDUCATORS',
  subtitle: 'A Practical Guide to Using Artificial Intelligence in Teaching, Learning & School Administration',
  category: 'handbook',
  author: 'Young Africans Robotics Association (YARA)',
  institution: 'Chinhoyi University of Technology (CUT)',
  version: 'First Edition, 2026',
  publicationDate: '2026',
  accessLevel: 'approved_educators_only',
  allowDownload: false, // DRM Protected: No downloading allowed
  description: 'Official 80-page training handbook for teachers, school heads, education officers, and trainers across Africa.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  modules: [
    {
      id: 'm1',
      number: 1,
      title: 'Understanding Artificial Intelligence',
      summary: 'A plain-language foundation explaining what AI is, how LLMs work, and distinguishing search engines from generative AI.',
      sections: [
        {
          heading: 'What Is Artificial Intelligence?',
          content: 'Artificial Intelligence (AI) is a general term for computer systems that can perform tasks which normally require human thinking — such as recognising patterns, understanding language, answering questions, or generating text and images. AI is not one single programme. It is a broad field, and the tools built from it range from the spelling checker in your word processor to the chatbot that can write you a full lesson plan.'
        },
        {
          heading: 'What Is Generative AI & Large Language Models (LLMs)?',
          content: 'Generative AI creates new content — text, images, audio, video or computer code — rather than simply sorting or retrieving existing information. An LLM learns statistical patterns of language from vast text collections. When prompted, it predicts word-by-word what a likely response looks like.'
        },
        {
          heading: 'What AI Is Genuinely Good At vs Struggles With',
          content: 'AI excels at drafting, rephrasing, and generating practice variations. It struggles with knowing recent highly specific local facts with 100% certainty, understanding individual learner histories, or replacing human pedagogical judgment.',
          tableData: {
            headers: ['AI Tends To Be Strong At', 'AI Tends To Struggle With'],
            rows: [
              ['Drafting text quickly in requested styles', 'Knowing local specific facts with certainty'],
              ['Rephrasing, summarising & simplifying', 'Understanding an individual learner\'s needs/history'],
              ['Generating practice questions & variations', 'Judging what is culturally or contextually appropriate'],
              ['Explaining concepts in multiple ways', 'Admitting uncertainty (sounds confident even when wrong)'],
              ['Speeding up repetitive writing tasks', 'Original lived pedagogical judgement in your classroom']
            ]
          },
          keyTakeaway: 'AI is a powerful pattern-recognition tool, not a thinking human being. Understanding this single idea will shape how confidently and safely you use every tool in this handbook.'
        }
      ]
    },
    {
      id: 'm2',
      number: 2,
      title: 'AI in Education',
      summary: 'Broad overview of practical applications across lesson preparation, classroom activities, assessment, administration, and communication.',
      sections: [
        {
          heading: 'Where AI Fits in an Educator\'s Work',
          content: [
            'Lesson Preparation: Draft objectives, structure lessons, suggest starter & plenary ideas.',
            'Classroom Activities: Group work ideas, role-plays, discussion questions tailored for African classrooms.',
            'Assessment: Draft quiz questions, marking guides, and rubrics for teacher review.',
            'Administration & Communication: Minutes, agendas, notices, and parent letters in professional tone.',
            'Differentiation: Quickly generate remedial (support) and extension versions of worksheets.'
          ]
        },
        {
          heading: 'AI Across a Typical School Day',
          content: 'Use the table below as a quick reference for where AI can support your daily routine.',
          tableData: {
            headers: ['Time / Moment', 'Where AI Can Help'],
            rows: [
              ['Before school — planning', 'Drafting lesson outlines, generating warm-up questions'],
              ['During lessons', 'No role — this is entirely the teacher\'s professional space'],
              ['Break duty, pastoral conversations', 'No role — human judgement and relationship only'],
              ['Marking period', 'Drafting marking guides; final marks remain the teacher\'s decision'],
              ['After school — admin', 'Drafting parent letters, meeting agendas or report summaries'],
              ['Weekend preparation', 'Generating differentiated versions of activities for next week']
            ]
          },
          keyTakeaway: 'AI can support almost every area of an educator\'s work in some way, but its role is always to assist — never to make the final professional decision.'
        }
      ]
    },
    {
      id: 'm3',
      number: 3,
      title: 'Prompt Engineering for Educators',
      summary: 'The single most valuable skill: using the five-part formula (Role, Task, Context, Requirements, Format) to get high-quality results.',
      sections: [
        {
          heading: 'The Five-Part Prompt Formula',
          content: [
            '1. ROLE — Who should the AI act as? (e.g. "You are an experienced Grade 6 Mathematics teacher in Zimbabwe.")',
            '2. TASK — What exactly do you want it to produce? (e.g. "Create a 40-minute lesson plan.")',
            '3. CONTEXT — Who is it for, and what is the situation? (e.g. "For learners aged 11–12, on the topic of fractions.")',
            '4. REQUIREMENTS — What must be included? (e.g. "Include objectives, activities, assessment, and homework.")',
            '5. FORMAT — How should it be presented? (e.g. "Present as a structured table with timings.")'
          ],
          examplePrompt: 'You are an experienced Grade 6 Mathematics teacher in Zimbabwe. Create a 40-minute lesson on fractions for learners aged 11–12. Include: learning objective, introduction, pair activity, assessment questions, and homework.',
          keyTakeaway: 'A specific, well-structured prompt is the difference between a generic, unusable AI response and a genuinely time-saving one.'
        }
      ]
    },
    {
      id: 'm4',
      number: 4,
      title: 'AI for Lesson Planning & Schemes of Work',
      summary: 'Turn blank pages into complete first-draft lesson plans and 12-week schemes of work in minutes.',
      sections: [
        {
          heading: 'Drafting Full Lesson Plans & Schemes of Work',
          content: 'Lesson planning is one of the most time-consuming tasks. Using AI for the initial draft frees up time to adapt materials to your specific learners and local syllabus requirements.',
          examplePrompt: 'You are a Head of Department for O-Level Geography in Zimbabwe. Create a 12-week scheme of work for Form 2 Geography, covering soil erosion, climate, and water resources. Show week number, topic, learning objectives, and suggested resources in a table.',
          keyTakeaway: 'AI can produce a strong first draft of a lesson plan or scheme of work in minutes, but final decisions about pacing, suitability, and classroom realities must always remain with you, the educator.'
        }
      ]
    },
    {
      id: 'm5',
      number: 5,
      title: 'AI for Teaching Materials',
      summary: 'Generating worksheets, revision notes, flashcards, comprehension exercises, case studies, and educational stories.',
      sections: [
        {
          heading: 'Creating Coherent Material Sets',
          content: 'AI can produce worksheets with graduated difficulty, concise revision notes, vocabulary flashcards, and Zimbabwean-contextualised reading passages.',
          examplePrompt: 'Write a 250-word comprehension passage suitable for Grade 5 learners about a young girl helping her grandmother at a rural market in Zimbabwe. Include 6 comprehension questions ranging from literal to inferential.',
          keyTakeaway: 'AI is an excellent first-draft generator for teaching materials, but the educator\'s review for accuracy, relevance, and age-appropriateness is what turns a draft into something ready for the classroom.'
        }
      ]
    },
    {
      id: 'm6',
      number: 6,
      title: 'AI for Assessment & Feedback',
      summary: 'Drafting quizzes, examination papers, marking guides, rubrics, and constructive report comments.',
      sections: [
        {
          heading: 'Building Balanced Assessments',
          content: 'Generate multiple-choice, short-answer, and structured questions along with step-by-step marking rubrics. Always double-check calculated math answers and answer keys.',
          callout: 'IMPORTANT — ALWAYS VERIFY BEFORE USE: AI-generated assessment items can contain factual errors or incorrect calculations. Never distribute assessment papers directly without checking every question and answer yourself.',
          keyTakeaway: 'AI can save significant time drafting assessments, but the educator remains fully responsible for accuracy and fairness.'
        }
      ]
    },
    {
      id: 'm7',
      number: 7,
      title: 'AI for Differentiated Learning',
      summary: 'Creating supportive (remedial), on-level, and extension versions of an activity from a single core prompt.',
      sections: [
        {
          heading: 'Three-Tier Differentiation in Practice',
          content: 'Meet every learner where they are without designing three separate lessons from scratch. Request a simplified version with visual scaffolding for struggling learners, and an open-ended analytical extension for advanced learners.',
          examplePrompt: 'Here is a Grade 5 worksheet on multiplication: [paste worksheet]. Create a simplified version for struggling learners using smaller numbers and visual bars, and an extension task for advanced learners involving real-world multi-step problems.',
          keyTakeaway: 'AI turns differentiation from a time-consuming redesign task into a quick follow-up request.'
        }
      ]
    },
    {
      id: 'm8',
      number: 8,
      title: 'AI for School Administration & Leadership',
      summary: 'Drafting agendas, meeting minutes, parent letters, notices, termly reports, and Ministry inspection checklists.',
      sections: [
        {
          heading: 'Administrative Writing Made Fast',
          content: 'School leaders spend hours writing routine documents. AI drafts meeting agendas, structured minutes, and parent communications in minutes.',
          callout: 'CONFIDENTIALITY WARNING: Never upload confidential staff disciplinary notes or student records into public AI tools. Anonymise all personal data before prompting.',
          keyTakeaway: 'AI turns routine administrative writing into a five-minute draft-and-edit exercise — but confidentiality rules apply at every step.'
        }
      ]
    },
    {
      id: 'm9',
      number: 9,
      title: 'AI for Teacher Productivity',
      summary: 'Smarter tools, less repetitive work, and more energy for direct human teaching.',
      sections: [
        {
          heading: 'Before AI vs With AI Productivity Matrix',
          content: 'See how AI saves time across typical teaching tasks:',
          tableData: {
            headers: ['Task', 'Before AI (Typical Time)', 'With AI (Typical Time)'],
            rows: [
              ['Drafting a lesson plan', '45–60 minutes', '10–15 minutes (plus review)'],
              ['Writing a 10-question quiz', '30 minutes', '5–10 minutes'],
              ['Drafting meeting minutes from notes', '40 minutes', '10 minutes'],
              ['Writing 20 learner feedback comments', '60+ minutes', '20–30 minutes'],
              ['Creating differentiated worksheets', '50 minutes', '15 minutes'],
              ['Drafting a parent letter', '20 minutes', '5 minutes']
            ]
          },
          keyTakeaway: 'AI\'s greatest gift to educators is removing the blank page, so your energy goes toward review, judgement, and genuine teaching.'
        }
      ]
    },
    {
      id: 'm10',
      number: 10,
      title: 'Responsible & Ethical Use of AI',
      summary: 'Understanding AI limitations (hallucination, bias, copyright) and maintaining human judgement at the center.',
      sections: [
        {
          heading: 'The Golden Rule',
          content: 'Every AI-generated educational content must pass through educator review before reaching learners.',
          callout: 'THE GOLDEN RULE: All AI-generated educational content must be reviewed by a qualified educator before being used with learners. AI augments educators. AI does not replace educators.',
          keyTakeaway: 'AI is a powerful assistant, not an infallible authority. Responsible use means treating every AI output as an unverified draft.'
        }
      ]
    },
    {
      id: 'm11',
      number: 11,
      title: 'AI and Learner Privacy',
      summary: 'Non-negotiable rules for protecting learner data and anonymising prompts.',
      sections: [
        {
          heading: 'Do Not Upload List',
          content: [
            '• Learner passwords or login credentials of any kind.',
            '• Sensitive personal information (health, family circumstances, disability).',
            '• Confidential school records, disciplinary files, or named examination marks.'
          ],
          keyTakeaway: 'Protecting learner privacy is a core professional responsibility. Anonymise first, ask questions when unsure, and never upload confidential records.'
        }
      ]
    },
    {
      id: 'm12',
      number: 12,
      title: 'Verifying AI Output',
      summary: 'The 7-point verification checklist to ensure factual accuracy and alignment.',
      sections: [
        {
          heading: 'The Seven-Point Verification Checklist',
          content: [
            '1. Is the information factual?',
            '2. Can I verify it from a reliable textbook or syllabus?',
            '3. Is the information current?',
            '4. Is it age-appropriate for my learners?',
            '5. Does it align with the local curriculum?',
            '6. Does it contain bias or missing African context?',
            '7. Does it require modification or correction before use?'
          ],
          keyTakeaway: 'Verification is the professional judgement step that turns a quick AI draft into something genuinely trustworthy.'
        }
      ]
    },
    {
      id: 'm13',
      number: 13,
      title: 'Practical AI Workshop',
      summary: '7 hands-on exercises covering lesson plans, quizzes, worksheets, differentiation, rubrics, parent letters, and lesson refinement.',
      sections: [
        {
          heading: 'Workshop Overview',
          content: 'Hands-on practical exercises designed for individual practice or staff development workshops. Includes reflection prompts for evaluating generated drafts.'
        }
      ]
    },
    {
      id: 'm14',
      number: 14,
      title: 'AI Toolkit for Educators',
      summary: 'Categorised reference of AI assistants, writing tools, presentation creators, research tools, and lesson planning platforms.',
      sections: [
        {
          heading: 'Recommended Tool Categories',
          content: 'Overview of ChatGPT, Claude, Gemini, Grammarly, Gamma, Canva Magic Design, NotebookLM, Perplexity, Copilot, MagicSchool AI, and Diffit.'
        }
      ]
    },
    {
      id: 'm15',
      number: 15,
      title: 'AI Tools by Subject Area',
      summary: 'Subject-specific starting points for STEM, Languages, Humanities, ICT/Robotics, and Practical Arts.',
      sections: [
        {
          heading: 'Subject-Specific Applications',
          content: 'Guidance tailored for Mathematics, Science, English & Languages, History & Geography, and STEM/Robotics clubs.'
        }
      ]
    },
    {
      id: 'm16',
      number: 16,
      title: 'Case Studies from African Classrooms',
      summary: '4 realistic stories illustrating successful and risky AI usage across different school environments.',
      sections: [
        {
          heading: 'Real Classroom Scenarios',
          content: 'Case Study 1: Rural Day School Batching. Case Study 2: Overreliant New Teacher. Case Study 3: Cautious School Head. Case Study 4: Privacy Near-Miss.'
        }
      ]
    },
    {
      id: 'm_ref',
      number: 'Ref',
      title: 'Glossary, FAQ & Educator Prompt Library',
      summary: 'Over 50 ready-to-use prompt templates, glossary terms, prompt worksheets, and the final capstone challenge.',
      sections: [
        {
          heading: 'Prompt Library Starters',
          content: [
            '• "You are an experienced [subject] teacher for [grade] in Zimbabwe..."',
            '• "Create a [length]-minute lesson on [topic] including objectives, pair activity, assessment, and homework..."',
            '• "Simplify this activity for learners who need extra support: [paste]..."',
            '• "Write 10 multiple-choice questions on [topic] with answer key..."',
            '• "Draft a formal, respectful letter to parents regarding [event]..."'
          ]
        }
      ]
    }
  ]
};

// Retrieve all bootcamp documents (local storage + memory fallback)
export function getBootcampDocuments(): BootcampDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([OFFICIAL_AI_HANDBOOK]));
      return [OFFICIAL_AI_HANDBOOK];
    }
    const docs = JSON.parse(raw) as BootcampDocument[];
    // Ensure official handbook is always present
    if (!docs.some(d => d.id === OFFICIAL_AI_HANDBOOK.id)) {
      docs.unshift(OFFICIAL_AI_HANDBOOK);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    }
    return docs;
  } catch (err) {
    console.warn('Error reading bootcamp documents:', err);
    return [OFFICIAL_AI_HANDBOOK];
  }
}

// Add a new document (Admin function)
export function addBootcampDocument(newDoc: Omit<BootcampDocument, 'id' | 'createdAt' | 'updatedAt'>): BootcampDocument {
  const docs = getBootcampDocuments();
  const doc: BootcampDocument = {
    ...newDoc,
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  docs.unshift(doc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));

  // Broadcast custom event so UI updates instantly across tabs
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yara_bootcamp_docs_updated'));
  }
  return doc;
}

// Update existing document (Admin function)
export function updateBootcampDocument(id: string, updates: Partial<BootcampDocument>): BootcampDocument | null {
  const docs = getBootcampDocuments();
  const index = docs.findIndex(d => d.id === id);
  if (index === -1) return null;

  docs[index] = {
    ...docs[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yara_bootcamp_docs_updated'));
  }
  return docs[index];
}

// Delete document (Admin function - protected: cannot delete official core handbook)
export function deleteBootcampDocument(id: string): boolean {
  if (id === OFFICIAL_AI_HANDBOOK.id) {
    throw new Error('The primary official YARA AI for Educators handbook cannot be deleted.');
  }
  let docs = getBootcampDocuments();
  docs = docs.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yara_bootcamp_docs_updated'));
  }
  return true;
}
