import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  ExternalLink, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Loader2, 
  Sparkles, 
  Eye, 
  Lightbulb, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainstormingQuestion, BrainstormingCategory } from '../../types/brainstorming';
import { INITIAL_BRAINSTORMING_QUESTIONS } from '../../constants/brainstormingData';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export default function BrainstormingAdminTab() {
  const [questions, setQuestions] = useState<BrainstormingQuestion[]>(INITIAL_BRAINSTORMING_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [form, setForm] = useState<Omit<BrainstormingQuestion, 'id'>>({
    title: '',
    category: 'circuit_fault',
    difficulty: 'beginner',
    image_url: '',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    hint: '',
    critical_thinking_principle: '',
    explanation: '',
    points: 100
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('brainstorming_quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(INITIAL_BRAINSTORMING_QUESTIONS);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions(INITIAL_BRAINSTORMING_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: 'circuit_fault',
      difficulty: 'beginner',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      question: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      hint: '',
      critical_thinking_principle: '',
      explanation: '',
      points: 100
    });
    setShowModal(true);
  };

  const handleOpenEdit = (q: BrainstormingQuestion) => {
    setEditingId(q.id);
    setForm({
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      image_url: q.image_url,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      hint: q.hint,
      critical_thinking_principle: q.critical_thinking_principle,
      explanation: q.explanation,
      points: q.points || 100
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('brainstorming_quizzes')
          .update({
            ...form,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        setQuestions(prev => prev.map(q => q.id === editingId ? { ...form, id: editingId } : q));
        setMessage({ type: 'success', text: 'Visual Quiz Question updated successfully.' });
      } else {
        const newId = 'bq_' + Date.now().toString(36);
        const newRecord = { ...form, id: newId };
        const { error } = await supabase
          .from('brainstorming_quizzes')
          .insert(newRecord);

        if (error) {
          // Fallback locally
          setQuestions(prev => [newRecord, ...prev]);
        } else {
          setQuestions(prev => [newRecord, ...prev]);
        }
        setMessage({ type: 'success', text: 'New Brainstorming Image Quiz added!' });
      }

      setShowModal(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving question:', err);
      // Update local state anyway
      if (editingId) {
        setQuestions(prev => prev.map(q => q.id === editingId ? { ...form, id: editingId } : q));
      } else {
        const newRecord = { ...form, id: 'bq_' + Date.now().toString(36) };
        setQuestions(prev => [newRecord, ...prev]);
      }
      setShowModal(false);
      setMessage({ type: 'success', text: 'Question updated in local state.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image quiz challenge?')) return;
    try {
      await supabase.from('brainstorming_quizzes').delete().eq('id', id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setMessage({ type: 'success', text: 'Question removed.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <Brain className="w-6 h-6 text-indigo-600" />
            <span>Brainstorming & Critical Thinking Image Quizzes</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Create visual diagnostics, circuit fault challenges, and algorithm puzzles with diagrams.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center space-x-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Visual Quiz Question</span>
        </button>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center space-x-2 text-sm font-bold",
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid of Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((q, idx) => (
          <div 
            key={q.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-md shadow-slate-100/80 overflow-hidden flex flex-col group"
          >
            <div className="relative h-44 bg-slate-900 overflow-hidden">
              <img
                src={q.image_url}
                alt={q.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-400 font-bold text-[10px] rounded-lg uppercase tracking-wider">
                  {q.category.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white font-bold text-[10px] rounded-lg">
                  {q.points} Pts
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-bold text-sm drop-shadow-md truncate">{q.title}</p>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-slate-700 text-xs font-medium line-clamp-2 leading-relaxed">
                {q.question}
              </p>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                <p className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Correct Answer</p>
                <p className="font-bold text-emerald-600 truncate">
                  {String.fromCharCode(65 + q.correctIndex)}: {q.options[q.correctIndex]}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {q.difficulty} level
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-3xl w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {editingId ? 'Edit Visual Quiz Question' : 'Add Brainstorming Image Challenge'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Specify the diagram, prompt scenario, critical thinking principle, and options.
              </p>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 font-bold text-sm text-slate-900"
                      placeholder="e.g. Blown Resistor Fault"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as BrainstormingCategory })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 font-bold text-sm text-slate-900"
                    >
                      <option value="circuit_fault">Circuit Diagnostics</option>
                      <option value="robot_navigation">Rover Kinematics</option>
                      <option value="code_tracing">Embedded Logic</option>
                      <option value="mechanical_logic">Power & Dynamics</option>
                      <option value="schematic_analysis">Schematics & EMF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Difficulty & Points</label>
                    <div className="flex gap-2">
                      <select
                        value={form.difficulty}
                        onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                        className="w-1/2 bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-3 focus:outline-none focus:border-indigo-600 font-bold text-xs"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <input
                        type="number"
                        value={form.points}
                        onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                        className="w-1/2 bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-3 font-bold text-xs"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Diagram / Visual Image URL</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      required
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 font-medium text-xs"
                      placeholder="https://images.unsplash.com/..."
                    />
                    {form.image_url && (
                      <a 
                        href={form.image_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 text-slate-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Question Scenario</label>
                  <textarea
                    required
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-600 font-medium text-xs min-h-[70px]"
                    placeholder="Describe the circuit diagram or diagnostic problem..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Multiple Choice Options (Select Radio for Correct)</label>
                  {form.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={form.correctIndex === oIdx}
                        onChange={() => setForm({ ...form, correctIndex: oIdx })}
                        className="w-5 h-5 text-emerald-600"
                      />
                      <span className="w-6 font-bold text-xs text-slate-400">{String.fromCharCode(65 + oIdx)}</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...form.options];
                          updated[oIdx] = e.target.value;
                          setForm({ ...form, options: updated });
                        }}
                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 px-4 text-xs font-medium focus:border-indigo-600"
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Diagnostic Hint</label>
                    <input
                      type="text"
                      value={form.hint}
                      onChange={(e) => setForm({ ...form, hint: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium"
                      placeholder="Hint shown on request..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Critical Thinking Principle</label>
                    <input
                      type="text"
                      value={form.critical_thinking_principle}
                      onChange={(e) => setForm({ ...form, critical_thinking_principle: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium"
                      placeholder="e.g. Ohm's Law & Safe Operating Area"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Detailed Solution & Scientific Reasoning</label>
                  <textarea
                    required
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium min-h-[70px]"
                    placeholder="Step-by-step physical and engineering explanation shown after answering..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{editingId ? 'Save Changes' : 'Create Visual Challenge'}</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
