import React, { useState } from 'react';
import { Rocket, CheckCircle2, AlertCircle, Upload, Link as LinkIcon, Video, FileText, Send, X, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { FinalProjectSubmission } from '../../types/curriculum';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

interface FinalProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSubmission?: FinalProjectSubmission | null;
  onSubmissionSuccess: (submission: FinalProjectSubmission) => void;
}

export default function FinalProjectModal({ 
  isOpen, 
  onClose, 
  existingSubmission, 
  onSubmissionSuccess 
}: FinalProjectModalProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: existingSubmission?.title || '',
    problem_statement: existingSubmission?.problem_statement || '',
    simulation_url: existingSubmission?.simulation_url || '',
    repo_url: existingSubmission?.repo_url || '',
    video_url: existingSubmission?.video_url || '',
    documentation: existingSubmission?.documentation || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    if (!formData.title || !formData.problem_statement) {
      setError('Please fill in project title and problem statement.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        user_id: profile.id,
        title: formData.title,
        problem_statement: formData.problem_statement,
        simulation_url: formData.simulation_url,
        repo_url: formData.repo_url,
        video_url: formData.video_url,
        documentation: formData.documentation,
        status: 'submitted' as const
      };

      let result;
      if (existingSubmission?.id) {
        const { data, error: updateErr } = await supabase
          .from('final_project_submissions')
          .update(payload)
          .eq('id', existingSubmission.id)
          .select()
          .single();
        if (updateErr) throw updateErr;
        result = data;
      } else {
        const { data, error: insertErr } = await supabase
          .from('final_project_submissions')
          .insert(payload)
          .select()
          .single();
        if (insertErr) throw insertErr;
        result = data;
      }

      onSubmissionSuccess(result || payload);
      onClose();
    } catch (err: any) {
      console.error('Error submitting project:', err);
      setError(err.message || 'Failed to submit final project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Final Capstone Robot Project</h3>
              <p className="text-xs text-slate-400">Submit your complete robotics build or simulation for certification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Status Banner if already submitted */}
        {existingSubmission && (
          <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Status: <strong className="uppercase font-bold">{existingSubmission.status.replace('_', ' ')}</strong></span>
            </div>
            {existingSubmission.grade !== undefined && (
              <span className="font-bold bg-indigo-200 px-2 py-0.5 rounded text-indigo-950">
                Grade: {existingSubmission.grade}%
              </span>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Project / Robot Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., AgroBot Autonomous Soil & Crop Rover"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Problem Statement & Community Need <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.problem_statement}
              onChange={e => setFormData({ ...formData, problem_statement: e.target.value })}
              placeholder="Describe the real-world community challenge (agriculture, logistics, sanitation, healthcare) and how your robot solves it."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1 flex items-center space-x-1">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulation URL (Wokwi / Tinkercad)</span>
              </label>
              <input
                type="url"
                value={formData.simulation_url}
                onChange={e => setFormData({ ...formData, simulation_url: e.target.value })}
                placeholder="https://wokwi.com/projects/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>GitHub Repository URL</span>
              </label>
              <input
                type="url"
                value={formData.repo_url}
                onChange={e => setFormData({ ...formData, repo_url: e.target.value })}
                placeholder="https://github.com/username/robot-repo"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1 flex items-center space-x-1">
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span>Video Demonstration Link (YouTube / Loom / Drive)</span>
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={e => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Technical Documentation & Schematic Notes
            </label>
            <textarea
              rows={3}
              value={formData.documentation}
              onChange={e => setFormData({ ...formData, documentation: e.target.value })}
              placeholder="List pinouts, component BOM, sensor calibration parameters, and state machine transitions."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Capstone Project'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
