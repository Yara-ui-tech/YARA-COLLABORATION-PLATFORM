import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  MessageSquare, Send, Star, Loader2, CheckCircle2, User, Clock, 
  Users, Heart, Award, Sparkles, ShieldCheck, ThumbsUp, Building2,
  Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Feedback() {
  const { user, profile } = useAuth();
  const [activeType, setActiveType] = useState<'feedback' | 'mentor_review' | 'testimonial'>('feedback');
  
  // Feedback / Testimonial / Mentor Review State
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('General Platform');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [mentorCustomName, setMentorCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Guest submission fields (for non-authenticated visitors)
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [guestRole, setGuestRole] = useState('Learner');

  // Loaded Data
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        // 1. Fetch Platform Feedback
        const { data: fbData } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (fbData) setFeedbacks(fbData);

        // 2. Fetch Approved Testimonials
        const { data: testData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (testData && testData.length > 0) {
          setTestimonials(testData);
        } else {
          setTestimonials([
            {
              id: 't-1',
              author_name: 'Farai M.',
              author_role: 'Robotics Innovator (Tier 4)',
              rating: 5,
              category: 'Platform Experience',
              content: 'YARA has completely transformed my approach to microcontroller coding and hardware prototyping!'
            },
            {
              id: 't-2',
              author_name: 'Chipo K.',
              author_role: 'STEM Educator & Patron',
              rating: 5,
              category: 'Educator Tools',
              content: 'The AI lesson plan generator and bootcamp modules saved me dozens of hours every week.'
            },
            {
              id: 't-3',
              author_name: 'Tinashe Z.',
              author_role: 'Mashwest Chapter Lead',
              rating: 5,
              category: 'Robotics Competitions',
              content: 'Our team built our first obstacle-avoiding bot using the Level 1 course and placed in provincial qualifiers!'
            }
          ]);
        }

        // 3. Fetch Mentors List for Mentor Reviews
        const { data: mentorData } = await supabase
          .from('profiles')
          .select('id, display_name, role, chapter_position, avatar_url')
          .or('role.eq.mentor,role.eq.teacher,role.eq.admin')
          .limit(30);

        if (mentorData && mentorData.length > 0) {
          setMentorsList(mentorData);
          setSelectedMentorId(mentorData[0].id);
        }
      } catch (err) {
        console.error('Error fetching feedback/testimonials:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();

    let channel: any = null;
    try {
      const topic = `feedback_center_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      channel = supabase
        .channel(topic)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
          fetchData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
          fetchData();
        })
        .subscribe();
    } catch {}

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch {}
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const authorName = user 
      ? (profile?.display_name || user.email?.split('@')[0] || 'YARA Member') 
      : (guestName.trim() || 'Community Innovator');
    
    const authorRole = user
      ? ((profile as any)?.chapter_position || (profile?.role === 'teacher' ? 'STEM Educator' : profile?.role === 'mentor' ? 'YARA Mentor' : 'Robotics Innovator'))
      : (guestRole || 'Community Guest');

    setLoading(true);
    try {
      if (activeType === 'feedback') {
        // Insert Platform Feedback
        const feedbackPayload: any = {
          user_id: user?.id || null,
          user_name: authorName,
          content: !user && guestContact.trim() ? `[Contact: ${guestContact.trim()}] ${content.trim()}` : content.trim(),
          rating
        };

        const { error } = await supabase.from('feedback').insert(feedbackPayload);
        if (error) {
          console.warn('Feedback insert warning:', error);
        }

        setFeedbacks(prev => [{
          id: Date.now(),
          user_name: authorName,
          content: content.trim(),
          rating,
          created_at: new Date().toISOString()
        }, ...prev]);

      } else if (activeType === 'mentor_review') {
        // Mentor Review
        const targetMentor = mentorsList.find(m => m.id === selectedMentorId);
        const mentorName = targetMentor ? targetMentor.display_name : (mentorCustomName.trim() || 'Assigned Mentor');

        // Insert into mentor_reviews if possible
        try {
          await supabase.from('mentor_reviews').insert({
            mentor_id: selectedMentorId || null,
            mentor_name: mentorName,
            learner_id: user?.id || null,
            learner_name: authorName,
            rating,
            review_text: content.trim(),
            category,
            is_approved: true,
            created_at: new Date().toISOString()
          });
        } catch (mErr) {
          console.warn('mentor_reviews table fallback:', mErr);
        }

        // Also log into feedback table so admins & faculty can see it immediately
        await supabase.from('feedback').insert({
          user_id: user?.id || null,
          user_name: authorName,
          content: `[Mentor Review: ${mentorName}] ${content.trim()}`,
          rating
        });

        setFeedbacks(prev => [{
          id: Date.now(),
          user_name: authorName,
          content: `[Mentor Review: ${mentorName}] ${content.trim()}`,
          rating,
          created_at: new Date().toISOString()
        }, ...prev]);

      } else {
        // Testimonial
        const { error } = await supabase.from('testimonials').insert({
          user_id: user?.id || null,
          author_name: authorName,
          author_role: authorRole,
          category,
          content: content.trim(),
          rating,
          is_approved: false, // Requires admin approval to show publicly on the home showcase
          is_featured: false
        });
        if (error) throw error;
      }

      setSubmitted(true);
      setContent('');
      setGuestContact('');
      setMentorCustomName('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 px-4 sm:px-6">
      {/* Page Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Learner, Educator &amp; Community Voice</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Community Feedback &amp; Mentor Reviews
        </h1>
        <p className="text-slate-600 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
          Your feedback shapes YARA’s robotics hardware kits, LMS courses, mentor sessions, and continental competitions. Everyone—students, teachers, patrons, and guests—is welcome to submit.
        </p>
      </header>

      {/* Switcher Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveType('feedback')}
          className={cn(
            "px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer",
            activeType === 'feedback' 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Platform Feedback</span>
        </button>

        <button
          onClick={() => setActiveType('mentor_review')}
          className={cn(
            "px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer",
            activeType === 'mentor_review' 
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Review a Mentor / Educator</span>
        </button>

        <button
          onClick={() => setActiveType('testimonial')}
          className={cn(
            "px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer",
            activeType === 'testimonial' 
              ? "bg-pink-600 text-white shadow-md shadow-pink-600/20" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Heart className="w-4 h-4 text-pink-200" />
          <span>Share a Story / Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-xl text-center sticky top-8"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                  {activeType === 'testimonial' 
                    ? 'Your testimonial has been submitted. Our administrators will review and showcase it publicly.' 
                    : activeType === 'mentor_review'
                    ? 'Your mentor review has been logged in real-time. Thank you for helping our mentors improve!'
                    : 'Your feedback has been received and synchronized with the YARA engineering & executive secretariat.'}
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition-all text-xs cursor-pointer shadow-md"
                >
                  Submit Another Entry
                </button>
              </motion.div>
            ) : (
              <motion.section 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] p-7 border border-slate-200/80 shadow-sm sticky top-8 space-y-5"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {activeType === 'feedback' 
                      ? 'Submit Platform Feedback' 
                      : activeType === 'mentor_review'
                      ? 'Review a Mentor'
                      : 'Share Your Story'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeType === 'feedback' 
                      ? 'Tell us what features you want or report an issue.' 
                      : activeType === 'mentor_review'
                      ? 'Rate your session with a YARA mentor or patron.'
                      : 'How has YARA impacted your school or learning?'}
                  </p>
                </div>

                {/* Logged in indicator or Guest form */}
                {user ? (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {profile?.display_name?.[0] || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-indigo-950 truncate">
                        Posting as: {profile?.display_name || user.email}
                      </p>
                      <p className="text-[10px] text-indigo-600 truncate">
                        {(profile as any)?.chapter_position || profile?.role || 'Member'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-700">Guest Submitter Details</p>
                    <div>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your Full Name *"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        placeholder="Email / Phone (Optional)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-indigo-600"
                      />
                      <select
                        value={guestRole}
                        onChange={(e) => setGuestRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-indigo-600"
                      >
                        <option value="Learner">Learner</option>
                        <option value="STEM Teacher">STEM Teacher</option>
                        <option value="Parent">Parent</option>
                        <option value="School Head">School Head</option>
                        <option value="Sponsor/Partner">Sponsor/Partner</option>
                        <option value="Visitor">Visitor</option>
                      </select>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating Stars */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest block">
                      Rating ({rating} of 5 Stars)
                    </label>
                    <div className="flex space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={cn(
                            "p-2 rounded-xl transition-all cursor-pointer",
                            rating >= star ? "text-amber-400 bg-amber-50" : "text-slate-300 bg-slate-50 hover:bg-slate-100"
                          )}
                        >
                          <Star className={cn("w-5 h-5", rating >= star && "fill-amber-400")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mentor Selector if in mentor_review mode */}
                  {activeType === 'mentor_review' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest block">
                        Select Mentor
                      </label>
                      {mentorsList.length > 0 ? (
                        <select
                          value={selectedMentorId}
                          onChange={(e) => setSelectedMentorId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-emerald-600"
                        >
                          {mentorsList.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.display_name} ({m.chapter_position || m.role})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={mentorCustomName}
                          onChange={(e) => setMentorCustomName(e.target.value)}
                          placeholder="Name of Mentor or Instructor *"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-emerald-600"
                        />
                      )}
                    </div>
                  )}

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest block">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-indigo-600 text-slate-800"
                    >
                      {activeType === 'mentor_review' ? (
                        <>
                          <option value="Hardware Capstone Review">Hardware Capstone Review</option>
                          <option value="Coding & Firmware Debugging">Coding &amp; Firmware Debugging</option>
                          <option value="Bootcamp Mentorship">Bootcamp Mentorship</option>
                          <option value="Career & Robotics Guidance">Career &amp; Robotics Guidance</option>
                        </>
                      ) : activeType === 'testimonial' ? (
                        <>
                          <option value="Student Journey">Student Journey &amp; Growth</option>
                          <option value="Robotics Competitions">Robotics Competitions</option>
                          <option value="Teacher & Patron Experience">Teacher &amp; Patron Experience</option>
                          <option value="Rural Chapter Impact">Rural Chapter Impact</option>
                        </>
                      ) : (
                        <>
                          <option value="General Platform">General Platform</option>
                          <option value="LMS & Courses">LMS &amp; Courses</option>
                          <option value="Simulator & IDE">Simulator &amp; IDE</option>
                          <option value="Events & Bootcamps">Events &amp; Bootcamps</option>
                          <option value="Hardware Kits">Hardware Kits &amp; Store</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest block">
                      Your Message *
                    </label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={
                        activeType === 'mentor_review'
                          ? 'How did your mentor assist your project or coding questions? What did they do well?'
                          : activeType === 'feedback'
                          ? 'Share your suggestions, recommendations, or bugs encountered...'
                          : 'Tell the community how YARA helped your school or robotics skills...'
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus:outline-indigo-600 font-medium min-h-[120px] text-xs leading-relaxed text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !content.trim() || (!user && !guestName.trim())}
                    className={cn(
                      "w-full text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer",
                      activeType === 'mentor_review'
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                        : activeType === 'testimonial'
                        ? "bg-pink-600 hover:bg-pink-500 shadow-pink-600/20"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>
                          {activeType === 'mentor_review' 
                            ? 'Submit Mentor Review' 
                            : activeType === 'testimonial'
                            ? 'Post Testimonial'
                            : 'Send Feedback'}
                        </span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Display List Column */}
        <div className="lg:col-span-2 space-y-6">
          {activeType === 'testimonial' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Community Stories &amp; Testimonials</h3>
                  <p className="text-xs text-slate-500">Inspiring experiences from schools and innovators across Africa.</p>
                </div>
                <span className="text-xs bg-pink-50 text-pink-700 font-bold px-3 py-1 rounded-full border border-pink-200">
                  {testimonials.length} Stories
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-pink-600 uppercase bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                          {t.category || 'Testimonial'}
                        </span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-800 text-xs italic font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        "{t.content}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{t.author_name}</p>
                        <p className="text-[10px] text-slate-400">{t.author_role}</p>
                      </div>
                      <Heart className="w-4 h-4 text-pink-400 fill-pink-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {activeType === 'mentor_review' ? 'Real-Time Mentor Reviews' : 'Recent Platform Feedback'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeType === 'mentor_review' 
                      ? 'Live learner reviews synchronized with mentors and admin portals.'
                      : 'Community feedback helping improve YARA daily.'}
                  </p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
                  {feedbacks.length} Entries
                </span>
              </div>

              {fetching ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading submissions...</span>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                  No submissions yet. Be the first to share your thoughts!
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-100">
                          {fb.user_name?.[0] || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{fb.user_name || 'Innovator'}</span>
                          <span className="text-[10px] text-slate-400">
                            {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed font-medium bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      {fb.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
