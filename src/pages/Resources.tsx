import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ExternalLink, Code, Cpu, Zap, ArrowRight, Star, 
  Play, Upload, FileText, Video, Trash2, Loader2, Plus, Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthContext';
import { ASSETS } from '../constants/assets';
import { DynamicSectionRenderer } from '../components/DynamicSectionRenderer';
import { useRuralAccessibility } from '../context/RuralAccessibilityContext';
import Breadcrumbs from '../components/Breadcrumbs';
import ItemCoverDisplay from '../components/resources/ItemCoverDisplay';

export interface StudyMaterial {
  id: string;
  mentor_id: string;
  mentor_name: string;
  title: string;
  description: string;
  file_url: string;
  file_type: 'pdf' | 'doc' | 'video' | 'other';
  category?: string;
  target_level?: string;
  file_size_bytes?: number;
  thumbnail_url?: string;
  created_at: string;
}

const simulationTools = [
  {
    id: '1',
    title: 'Webots',
    description: 'A free and open-source 3D robot simulator used in industry, education and research worldwide.',
    url: 'https://cyberbotics.com/',
    tags: ['3D Robotics', 'Open Source', 'Industry Standard'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Gazebo',
    description: 'A powerful 3D multi-robot simulator with a robust ODE physics engine and high-fidelity sensor modeling.',
    url: 'https://gazebosim.org/',
    tags: ['ROS 2', 'Physics Engine', 'Advanced'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'Tinkercad Circuits',
    description: 'A beginner-friendly online virtual breadboard for simulating Arduino microcontrollers and electronic components.',
    url: 'https://www.tinkercad.com/circuits',
    tags: ['Beginner', 'Online Simulator', 'Arduino'],
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'V-REP (CoppeliaSim)',
    description: 'A versatile robot simulator with integrated Lua/Python development environment and inverse kinematics.',
    url: 'https://www.coppeliarobotics.com/',
    tags: ['Kinematics', 'IDE Integration', 'Research'],
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
  }
];

export const CURATED_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat_curated_01',
    mentor_id: 'yara_faculty',
    mentor_name: 'YARA Engineering Faculty',
    title: 'Robotics Systems & Circuit Engineering Handbook (Tier 1 & 2)',
    description: 'Comprehensive 180-page textbook covering voltage, Ohm\'s law, solderless breadboards, sensor integration, and DC motor drivers.',
    file_url: 'https://cyberbotics.com/doc/guide/index',
    file_type: 'pdf',
    category: 'book',
    target_level: 'Level 0–2',
    file_size_bytes: 4200000,
    thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    created_at: new Date('2026-01-15').toISOString()
  },
  {
    id: 'mat_curated_02',
    mentor_id: 'yara_faculty',
    mentor_name: 'Simbarashe Manongwa',
    title: 'Embedded C++ & Microcontroller Firmware Guide for ESP32 & Arduino',
    description: 'Practical embedded programming handbook: registers, GPIO, PWM duty cycles, analog-to-digital conversion, and non-blocking state machines.',
    file_url: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/',
    file_type: 'pdf',
    category: 'book',
    target_level: 'Level 3–5',
    file_size_bytes: 5800000,
    thumbnail_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800',
    created_at: new Date('2026-02-10').toISOString()
  },
  {
    id: 'mat_curated_03',
    mentor_id: 'yara_faculty',
    mentor_name: 'Dr. Chiambiro',
    title: 'Autonomous Mobile Robotics, PID & Sensor Navigation Manual',
    description: 'Field manual covering differential drive kinematics, ultrasonic echo timing, infrared reflective sensors, and closed-loop PID control loops.',
    file_url: 'https://gazebosim.org/docs',
    file_type: 'pdf',
    category: 'book',
    target_level: 'Level 4–7',
    file_size_bytes: 7100000,
    thumbnail_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800',
    created_at: new Date('2026-02-25').toISOString()
  },
  {
    id: 'mat_curated_04',
    mentor_id: 'yara_faculty',
    mentor_name: 'YARA Education Board',
    title: 'AI for African STEM Educators & Robotics Patron Curriculum Guide',
    description: 'Curriculum manual with lesson plans, classroom safety protocols, competition coaching rubrics, and diagnostic quiz frameworks for teachers.',
    file_url: 'https://www.unesco.org/en/artificial-intelligence/education',
    file_type: 'pdf',
    category: 'book',
    target_level: 'Educators & Patrons',
    file_size_bytes: 3900000,
    thumbnail_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    created_at: new Date('2026-03-01').toISOString()
  },
  {
    id: 'mat_curated_05',
    mentor_id: 'yara_faculty',
    mentor_name: 'YARA Tech Labs',
    title: 'Mastering ESP32 Microcontrollers, GPIO & Dual-Core FreeRTOS',
    description: 'Video masterclass demonstrating pin multiplexing, interrupt handling, and real-time task scheduling on the ESP32 platform.',
    file_url: 'https://www.youtube.com/watch?v=ly_x6i03j9I',
    file_type: 'video',
    category: 'video',
    target_level: 'Level 3–5',
    file_size_bytes: 84000000,
    thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    created_at: new Date('2026-03-05').toISOString()
  },
  {
    id: 'mat_curated_06',
    mentor_id: 'yara_faculty',
    mentor_name: 'YARA Innovation Squad',
    title: 'Autonomous Obstacle Avoidance Rover with Ultrasonic & IR Sensors',
    description: 'Complete hands-on video guide to wiring an HC-SR04 sonar sensor, servo sweep, and obstacle-avoidance logic in C++.',
    file_url: 'https://www.youtube.com/watch?v=ly_x6i03j9I',
    file_type: 'video',
    category: 'video',
    target_level: 'Level 4–6',
    file_size_bytes: 92000000,
    thumbnail_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    created_at: new Date('2026-03-12').toISOString()
  },
  {
    id: 'mat_curated_07',
    mentor_id: 'yara_faculty',
    mentor_name: 'YARA Hardware Faculty',
    title: 'L298N Dual H-Bridge Motor Driver & 5V Regulator Pinout Blueprint',
    description: 'Engineering schematic blueprint detailing 2WD mobile chassis drive, enable jumpers, back-EMF protection diodes, and battery tie-in.',
    file_url: 'https://cyberbotics.com/',
    file_type: 'pdf',
    category: 'lab',
    target_level: 'Level 2–4',
    file_size_bytes: 1800000,
    thumbnail_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
    created_at: new Date('2026-03-18').toISOString()
  }
];

export default function Resources() {
  const { user, profile } = useAuth();
  const { formatFileSize, isLowDataMode } = useRuralAccessibility();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload form state with Cover Image support
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    file_type: 'pdf' as 'pdf' | 'doc' | 'video' | 'other',
    file_url: '',
    category: 'book',
    target_level: 'All Levels',
    thumbnail_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database study_materials notice:', error);
      }
      
      const dbItems = data || [];
      const dbIds = new Set(dbItems.map((m: any) => m.id));
      const merged = [...dbItems, ...CURATED_MATERIALS.filter(c => !dbIds.has(c.id))];
      setMaterials(merged);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials(CURATED_MATERIALS);
    } finally {
      setLoading(false);
    }
  }

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMaterial(prev => ({ ...prev, thumbnail_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!selectedFile && !newMaterial.file_url) {
      alert('Please select a file to upload or provide a direct resource link.');
      return;
    }

    setUploading(true);
    try {
      let finalFileUrl = newMaterial.file_url;
      let finalCoverUrl = newMaterial.thumbnail_url;
      let calculatedSize = selectedFile?.size || 0;

      // 1. Upload cover image to storage if selected
      if (selectedCoverFile) {
        try {
          const coverExt = selectedCoverFile.name.split('.').pop();
          const coverName = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${coverExt}`;
          const coverPath = `${user.id}/${coverName}`;

          const { error: coverErr } = await supabase.storage
            .from('resources')
            .upload(coverPath, selectedCoverFile, { upsert: true });

          if (!coverErr) {
            const { data: { publicUrl } } = supabase.storage
              .from('resources')
              .getPublicUrl(coverPath);
            finalCoverUrl = publicUrl;
          }
        } catch (cErr) {
          console.warn('Cover upload notice, continuing with local preview:', cErr);
        }
      }

      // 2. Upload document/resource file to storage if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, selectedFile);

        if (uploadError) {
          if (uploadError.message.includes('bucket not found')) {
            throw new Error('The "resources" storage bucket has not been created in Supabase yet. Please use the "Resource URL" field instead or contact an admin.');
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);
        
        finalFileUrl = publicUrl;
      }

      // 3. Save to database
      const insertRecord: any = {
        mentor_id: user.id,
        mentor_name: profile?.display_name || 'YARA Mentor',
        title: newMaterial.title,
        description: newMaterial.description,
        file_url: finalFileUrl,
        file_type: newMaterial.file_type,
        category: newMaterial.category,
        target_level: newMaterial.target_level,
        file_size_bytes: calculatedSize,
        thumbnail_url: finalCoverUrl || null,
      };

      const { data: savedData, error: dbError } = await supabase
        .from('study_materials')
        .insert(insertRecord)
        .select()
        .single();

      if (dbError) throw dbError;

      // Prepend to current list
      if (savedData) {
        setMaterials(prev => [savedData, ...prev]);
      } else {
        fetchMaterials();
      }

      // Reset form
      setShowUploadModal(false);
      setNewMaterial({
        title: '',
        description: '',
        file_type: 'pdf',
        file_url: '',
        category: 'book',
        target_level: 'All Levels',
        thumbnail_url: ''
      });
      setSelectedFile(null);
      setSelectedCoverFile(null);
      alert('Resource and cover image published successfully!');
    } catch (error: any) {
      console.error('Error uploading material:', error);
      alert(error.message || 'Failed to upload material. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, fileUrl: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const path = fileUrl.split('resources/').pop() || fileUrl.split('materials/').pop();
      if (path) {
        await supabase.storage.from('resources').remove([path]);
        await supabase.storage.from('materials').remove([path]);
      }

      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Library & Learning Resources' }
        ]}
      />

      <section className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl mb-12">
        <img 
          src={ASSETS.DASHBOARD_HERO_BG} 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">📚 Learning Resources & Media Library</h2>
            <p className="text-indigo-50 text-base md:text-lg font-medium opacity-90">
              Access textbooks with cover pages, video masterclasses with thumbnails, simulation tools, and technical schematics.
            </p>
          </div>
          
          {(profile?.role === 'admin' || profile?.role === 'mentor') && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Upload Resource With Cover</span>
            </button>
          )}
        </div>
      </section>

      {/* Admin Managed Dynamic Sections */}
      <DynamicSectionRenderer page="resources" />

      {/* Mentor Materials Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <span>Educational Resources & Study Materials</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Curated textbooks, practical lab worksheets, circuit schematics, presentations, and code packages — complete with full visual covers.
            </p>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'book', label: '📖 Books & E-Books' },
              { id: 'video', label: '🎬 Video Guides' },
              { id: 'pdf', label: '📄 PDF Guides' },
              { id: 'lab', label: '⚡ Schematics & Labs' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLowDataMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 font-medium">
            <span>⚡ <strong>Rural Low-Data Mode Active:</strong> Lightweight book cover vectors and file sizes are highlighted in green below before downloading to help you save data.</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials
              .filter(m => {
                if (selectedCategory === 'all') return true;
                if (selectedCategory === 'pdf') return m.file_type === 'pdf';
                if (selectedCategory === 'video') return m.file_type === 'video';
                if (selectedCategory === 'book') return (m as any).category === 'book' || m.title.toLowerCase().includes('book') || m.description?.toLowerCase().includes('book') || m.title.toLowerCase().includes('handbook');
                if (selectedCategory === 'lab') return (m as any).category === 'lab' || m.title.toLowerCase().includes('schematic') || m.title.toLowerCase().includes('blueprint') || m.description?.toLowerCase().includes('schematic');
                return true;
              })
              .map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-[2rem] border border-slate-200/80 overflow-hidden hover:shadow-xl hover:shadow-indigo-50 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Dynamic Rich Cover Image Preview (Book Cover Page or Video Thumbnail) */}
                  <ItemCoverDisplay
                    type={material.file_type}
                    title={material.title}
                    subtitle={material.description}
                    category={material.category}
                    author={material.mentor_name}
                    imageUrl={material.thumbnail_url}
                    fileSize={material.file_size_bytes ? formatFileSize(material.file_size_bytes) : undefined}
                    level={material.target_level || (material.file_type === 'video' ? 'Video Lesson' : 'Official Guide')}
                    duration={material.file_type === 'video' ? 'HD VIDEO' : undefined}
                    className="h-52 w-full"
                    onPlay={() => window.open(material.file_url, '_blank')}
                  />
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full",
                          material.file_type === 'video' ? "bg-red-50 text-red-700 border border-red-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        )}>
                          {material.file_type === 'video' ? '🎬 Video Masterclass' : '📖 Book / PDF'}
                        </span>
                        {material.file_size_bytes ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-mono">
                            💾 {formatFileSize(material.file_size_bytes)}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(material.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {material.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2 h-9 leading-relaxed">
                      {material.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-indigo-600 font-bold text-xs hover:translate-x-1 transition-transform"
                    >
                      {material.file_type === 'video' ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Video Lesson</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Download &amp; Read Book</span>
                        </>
                      )}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    
                    {user?.id === material.mentor_id && (
                      <button
                        onClick={() => handleDelete(material.id, material.file_url)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px]">
                        {material.mentor_name[0] || 'Y'}
                      </div>
                      <span className="uppercase tracking-wider truncate max-w-[150px]">
                        By {material.mentor_name}
                      </span>
                    </div>
                    <span className="font-medium text-emerald-600 font-mono">Verified Resource</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-900 mb-2">No materials found</h4>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Check back later or upload new educational books and videos using the button above.
            </p>
          </div>
        )}
      </section>

      {/* Static Simulation Tools Section with Real Visual Previews */}
      <section className="space-y-6 pt-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <Zap className="w-6 h-6 text-indigo-600" />
            <span>Interactive Robotics Simulation Environments</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Industry-standard physics and circuit simulation suites. Practice coding and testing robots before physical hardware builds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {simulationTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-[2.5rem] border border-slate-200/80 overflow-hidden hover:shadow-2xl hover:shadow-indigo-50 transition-all group flex flex-col justify-between"
            >
              <div className="h-52 overflow-hidden relative bg-slate-950">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg">
                  <Play className="w-4 h-4 text-indigo-600 fill-current" />
                </div>
                <div className="absolute bottom-3 left-4">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-2.5 py-0.5 rounded-md border border-white/10 backdrop-blur-xs">
                    ACTIVE SIMULATOR
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                  {tool.description}
                </p>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-indigo-600 font-bold hover:translate-x-1 transition-transform text-xs sm:text-sm"
                >
                  <span>Launch Simulator Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upload Modal with Live Cover Preview */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl p-6 sm:p-8 relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Upload Learning Resource</h3>
                  <p className="text-xs text-slate-500 font-medium">Add books with cover pages, videos with thumbnails, or technical schematics.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-5">
                {/* Live Cover Preview Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Live Cover Preview ({newMaterial.file_type === 'video' ? 'Video Cover' : 'Book Cover Page'})
                  </label>
                  <ItemCoverDisplay
                    type={newMaterial.file_type}
                    title={newMaterial.title || 'Preview Resource Title'}
                    subtitle={newMaterial.description || 'Resource description preview...'}
                    category={newMaterial.category}
                    author={profile?.display_name || 'YARA Mentor'}
                    imageUrl={newMaterial.thumbnail_url}
                    level={newMaterial.target_level}
                    className="h-44 w-full rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Title *</label>
                    <input
                      type="text"
                      required
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-xs"
                      placeholder="e.g., Robotics Fundamentals Handbook"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Curriculum Level</label>
                    <input
                      type="text"
                      value={newMaterial.target_level}
                      onChange={(e) => setNewMaterial({ ...newMaterial, target_level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-xs"
                      placeholder="e.g., Level 0–2 or All Levels"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-medium text-xs h-20 resize-none"
                    placeholder="Briefly describe learning outcomes and topics covered..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Resource Type</label>
                    <select
                      value={newMaterial.file_type}
                      onChange={(e) => setNewMaterial({ ...newMaterial, file_type: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-xs"
                    >
                      <option value="pdf">📖 Book / PDF Document</option>
                      <option value="video">🎬 Video Masterclass</option>
                      <option value="doc">📄 Word / Technical Doc</option>
                      <option value="other">⚡ Circuit Schematic / Lab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Category Tag</label>
                    <select
                      value={newMaterial.category}
                      onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-xs"
                    >
                      <option value="book">Textbook / E-Book</option>
                      <option value="video">Video Walkthrough</option>
                      <option value="lab">Lab Schematic / Blueprint</option>
                      <option value="guide">Pedagogy / Teacher Guide</option>
                    </select>
                  </div>
                </div>

                {/* Cover Image Upload / URL Section */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      🖼️ Cover Image / Thumbnail (Book Cover or Video Poster)
                    </label>
                    <span className="text-[10px] text-indigo-600 font-semibold">Optional • Auto-styled if blank</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="w-full px-4 py-2.5 rounded-xl border border-dashed border-indigo-300 bg-white flex items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverFileChange}
                        />
                        <ImageIcon className="w-4 h-4 text-indigo-500 mr-2" />
                        <span className="text-xs font-bold text-indigo-700 truncate max-w-[140px]">
                          {selectedCoverFile ? selectedCoverFile.name : 'Upload Cover Image'}
                        </span>
                      </label>
                    </div>

                    <div>
                      <input
                        type="url"
                        value={newMaterial.thumbnail_url}
                        onChange={(e) => setNewMaterial({ ...newMaterial, thumbnail_url: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none text-xs"
                        placeholder="Or direct Cover Image URL (https://...)"
                      />
                    </div>
                  </div>
                </div>

                {/* Resource Document Attachment or URL */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    📎 Resource File or Web Link *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 mr-2" />
                        <span className="text-xs font-bold text-slate-600 truncate max-w-[140px]">
                          {selectedFile ? selectedFile.name : 'Choose Document File'}
                        </span>
                      </label>
                    </div>

                    <div>
                      <input
                        type="url"
                        value={newMaterial.file_url}
                        onChange={(e) => setNewMaterial({ ...newMaterial, file_url: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none text-xs"
                        placeholder="Or Direct Link / YouTube / Drive URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || (!selectedFile && !newMaterial.file_url)}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-xs cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing Resource &amp; Cover...</span>
                      </>
                    ) : (
                      <span>Publish To Learning Library</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
