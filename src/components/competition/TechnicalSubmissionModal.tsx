import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, CheckCircle2, Waves, Compass, Lightbulb, Link as LinkIcon, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { YaraCompetitionRegistration, UnderwaterDroneDetails, AutonomousMazeDetails, InnovationPitchDetails } from '../../types/yaraCompetition';
import { updateRegistrationDetails } from '../../services/yaraCompetitionService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  team: YaraCompetitionRegistration;
  onSuccess: () => void;
}

export default function TechnicalSubmissionModal({ isOpen, onClose, team, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<'underwater' | 'maze' | 'pitch'>('underwater');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [underwater, setUnderwater] = useState<UnderwaterDroneDetails>(team.underwater_drone_info || {
    has_rov: true,
    will_build_own: true,
    robot_description: '',
    main_controller: 'ESP32 / Raspberry Pi Pico',
    sensors_used: 'Depth transducer, 1080p Subsea Camera, Temperature probe',
    communication_method: 'Cat6 Ethernet Tether',
    power_source: '12V 10Ah LiFePO4 Tethered Surface Supply',
    estimated_dimensions: '42cm x 30cm x 28cm (Weight: 3.8kg)'
  });

  const [maze, setMaze] = useState<AutonomousMazeDetails>(team.autonomous_maze_info || {
    robot_name: `${team.team_name} Pathfinder`,
    controller: 'Arduino Mega 2560 / RP2040',
    sensors: '3x HC-SR04 Ultrasonic Sensors + 2x Sharp IR Distance Sensors + Rotary Encoders',
    programming_language: 'C++ (Embedded Arduino Framework)',
    navigation_method: 'Wall-Following PID with Dynamic Dead-End Dead-Reckoning',
    robot_dimensions: '18cm x 16cm x 12cm'
  });

  const [pitch, setPitch] = useState<InnovationPitchDetails>(team.innovation_pitch_info || {
    project_title: 'Solar-Powered Low-Cost STEM IoT Soil Moisture Sensor & Telemetry',
    problem_addressed: 'Lack of practical sensor-based agriculture education and high crop loss for youth farming cooperatives in rural Zimbabwean wards.',
    target_beneficiaries: 'Smallholder youth farmers, secondary vocational agriculture students in Mashonaland and Manicaland.',
    proposed_solution: 'Locally fabricated soil probes linked to an ESP32 LoRa transmitter sending SMS alerts when crops need drip irrigation.',
    technology_used: 'ESP32, Capacitive Soil Sensors, LoRa Mesh, Solar Li-ion Charge Controller, Open-Source Dashboard',
    expected_social_impact: 'Reduces water waste by 40%, increases crop yield, and equips high school learners with hands-on IoT coding skills.',
    project_stage: 'Working Prototype',
    has_prototype: true,
    proposal_summary: 'Fully functional working bench prototype tested in school greenhouse.'
  });

  const [videoUrl, setVideoUrl] = useState(team.video_demo_url || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      await updateRegistrationDetails(team.id, {
        underwater_drone_info: underwater,
        autonomous_maze_info: maze,
        innovation_pitch_info: pitch,
        video_demo_url: videoUrl,
        updated_at: new Date().toISOString()
      });

      setSuccessMessage('Technical dossier successfully updated and submitted to the judging committee!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving technical submission:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Technical Specifications & Pitch Deck Submission</span>
              </div>
              <h2 className="text-xl font-black">{team.team_name}</h2>
              <p className="text-xs text-slate-400 font-mono">Reg ID: {team.registration_id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('underwater')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'underwater' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span>Underwater Drone Specs</span>
            </button>

            <button
              onClick={() => setActiveTab('maze')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'maze' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Maze Rover Specs</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'pitch' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Innovation Pitch Deck</span>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: UNDERWATER */}
            {activeTab === 'underwater' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start space-x-3">
                  <Waves className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">Underwater ROV Specifications</strong>
                    Describe the mechanical frame, ballast & buoyancy setup, thruster configuration, and tether communications.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Frame, Ballast & Thruster Description
                  </label>
                  <textarea
                    rows={3}
                    value={underwater.robot_description}
                    onChange={(e) => setUnderwater({ ...underwater, robot_description: e.target.value })}
                    placeholder="e.g. PVC tubular chassis with neutral ballast foam, 4x 12V brushless thrusters with ESCs..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Main Controller Board
                    </label>
                    <input
                      type="text"
                      value={underwater.main_controller}
                      onChange={(e) => setUnderwater({ ...underwater, main_controller: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Sensors & Optics
                    </label>
                    <input
                      type="text"
                      value={underwater.sensors_used}
                      onChange={(e) => setUnderwater({ ...underwater, sensors_used: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tether & Communication Protocol
                    </label>
                    <input
                      type="text"
                      value={underwater.communication_method}
                      onChange={(e) => setUnderwater({ ...underwater, communication_method: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Power Delivery & Battery Spec
                    </label>
                    <input
                      type="text"
                      value={underwater.power_source}
                      onChange={(e) => setUnderwater({ ...underwater, power_source: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MAZE ROVER */}
            {activeTab === 'maze' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
                  <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">Autonomous Maze Rover Technical Architecture</strong>
                    Outline how the microcontroller makes navigation decisions in the labyrinth without human assistance.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Robot Name
                    </label>
                    <input
                      type="text"
                      value={maze.robot_name}
                      onChange={(e) => setMaze({ ...maze, robot_name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Microcontroller / Compute Module
                    </label>
                    <input
                      type="text"
                      value={maze.controller}
                      onChange={(e) => setMaze({ ...maze, controller: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Sensors & Obstacle Detection
                    </label>
                    <input
                      type="text"
                      value={maze.sensors}
                      onChange={(e) => setMaze({ ...maze, sensors: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Firmware / Language
                    </label>
                    <input
                      type="text"
                      value={maze.programming_language}
                      onChange={(e) => setMaze({ ...maze, programming_language: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Autonomous Navigation & Dead-End Recovery Algorithm
                  </label>
                  <textarea
                    rows={3}
                    value={maze.navigation_method}
                    onChange={(e) => setMaze({ ...maze, navigation_method: e.target.value })}
                    placeholder="e.g. Left-hand wall follower with dynamic ultrasonic distance averaging and gyro correction..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: INNOVATION PITCH */}
            {activeTab === 'pitch' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">Technology for the Underserved Pitch Dossier</strong>
                    Theme: “How can we use robotics, AI, and innovation to create opportunities for young people with limited access to resources?”
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={pitch.project_title}
                    onChange={(e) => setPitch({ ...pitch, project_title: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Problem in Underserved Communities
                  </label>
                  <textarea
                    rows={2}
                    value={pitch.problem_addressed}
                    onChange={(e) => setPitch({ ...pitch, problem_addressed: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Proposed Robotics / AI Solution & Social Impact
                  </label>
                  <textarea
                    rows={2}
                    value={pitch.proposed_solution}
                    onChange={(e) => setPitch({ ...pitch, proposed_solution: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Current Prototype Stage
                    </label>
                    <select
                      value={pitch.project_stage}
                      onChange={(e) => setPitch({ ...pitch, project_stage: e.target.value as any })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Concept">Concept & Simulation</option>
                      <option value="Research">Research & Feasibility Study</option>
                      <option value="Working Prototype">Working Hardware Prototype</option>
                      <option value="Tested & Deployed">Tested & Field-Deployed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Video Demonstration URL (YouTube / Drive)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {saving ? 'Saving Specifications...' : 'Save Technical Submission'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
