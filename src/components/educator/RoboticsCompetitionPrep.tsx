import React, { useState } from 'react';
import { 
  Trophy, Wrench, Code, CheckSquare, Dumbbell, BookOpen, 
  AlertTriangle, Shield, Download, ExternalLink, ChevronDown, 
  ChevronUp, Check, Cpu, Zap, Radio
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface GuideItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'design' | 'programming' | 'checklist' | 'exercises' | 'rules' | 'troubleshooting';
  content: string[];
  tips?: string[];
  downloadable?: string;
}

const PREP_ITEMS: GuideItem[] = [
  {
    id: 'des_01',
    category: 'design',
    title: 'Differential Drive Rover & Chassis Architecture',
    subtitle: 'Optimal center-of-gravity, wheel diameter, and caster ball stabilization',
    content: [
      'Weight Distribution: Ensure 60% of total robot mass sits directly over the drive axle for maximum tire traction and predictable turning inertia.',
      'Wheel Diameter Sizing: 65mm rubber wheels provide the best balance between top linear speed and high low-end torque for maze cornering.',
      'Front Caster Selection: Replace standard plastic ball casters with low-friction metal ball transfers or polished PTFE skids to prevent arena surface snagging.',
      'Chassis Material: Use 3mm laser-cut acrylic or 3D-printed PETG (minimum 4 perimeters, 35% infill) to withstand arena perimeter wall collisions.'
    ],
    tips: [
      'Keep your sensor bracket mounted at 15mm-20mm above the track surface for optimal IR reflection contrast.',
      'Mount your battery pack as low as possible on the chassis floor to lower the roll center.'
    ]
  },
  {
    id: 'des_02',
    category: 'design',
    title: 'Underwater Drone (ROV) Buoyancy & Waterproofing',
    subtitle: 'Neutral buoyancy calculation, ballast trimming, and watertight O-ring seals',
    content: [
      'Neutral Buoyancy Calculation: Mass of the ROV must equal the mass of water displaced: FB = ρ · V · g. Target 20g positive buoyancy for fail-safe surface recovery.',
      'Watertight Enclosure (WTE): 3-inch acrylic cylinder with anodized aluminum end caps. Always grease silicone O-rings with pure silicone grease—never petroleum jelly.',
      'Cable Penetrators: Pot all tether wires with Marine Epoxy (e.g. West System / Loctite Marine) after scuffing cable jackets with 120-grit sandpaper.',
      'Thruster Configuration: 3-thruster minimum (2 horizontal differential drive, 1 vertical heave). Brushless motors run wet in clean freshwater; flush with distilled water after chlorinated tank testing.'
    ],
    tips: [
      'Perform a 20-minute vacuum leak test with a manual hand pump to 15 inHg before submerging any live electronics.',
      'Use lead scuba weights mounted on Velcro strips for easy trimming and balance calibration.'
    ]
  },
  {
    id: 'prog_01',
    category: 'programming',
    title: 'PID Autonomous Wall Following & Line Tracking',
    subtitle: 'Proportional, Integral, and Derivative control loops in MicroPython & C++',
    content: [
      'Error Calculation: Error = Target_Distance_mm - Current_Sensor_Reading_mm. Normalize sensor analog readings between -100 and +100.',
      'Proportional (Kp): Directly scales turning response. Start with Kp = 1.2, Ki = 0.0, Kd = 0.0 until the robot tracks lines without losing the path.',
      'Derivative (Kd): Dampens rapid oscillations and overshoots around sharp 90-degree maze turns. Slowly increment Kd by 0.1 until wobbling disappears.',
      'Integral (Ki): Eliminates steady-state drift caused by motor bias or unbalanced battery drain. Keep Ki very small (0.001) with anti-windup clamping to prevent cumulative saturation.'
    ],
    tips: [
      'Avoid blocking delays (`delay()` or `time.sleep()`). Run your control loop at a fixed 50Hz (20ms delta time) using timestamp diffs.',
      'Filter raw ultrasonic sensor readings with a 3-sample median filter to eliminate false echo reflections.'
    ]
  },
  {
    id: 'prog_02',
    category: 'programming',
    title: 'Non-Blocking State Machine for Maze Navigation',
    subtitle: 'Structuring robot behavior into clean finite-state machines (FSM)',
    content: [
      'State Definition: Enum states: `STATE_LINE_TRACK`, `STATE_OBSTACLE_AVOID`, `STATE_MAZE_JUNCTION`, `STATE_REVERSE_BACKUP`, `STATE_GOAL_STOP`.',
      'Telemetry Logging: Stream current state and battery voltage over serial/Bluetooth at 10Hz to quickly diagnose run failures during practice runs.',
      'Timeout Guards: Every turn or maneuver must have a hard timeout (e.g., 2000ms max). If an expected line is not found, transition safely to `STATE_SEARCH_RECOVER`.'
    ],
    tips: [
      'Implement an emergency software kill switch triggered by a long button press on the chassis.'
    ]
  },
  {
    id: 'chk_01',
    category: 'checklist',
    title: 'Official Pre-Arena Inspection Checklist',
    subtitle: 'Crucial verification steps before presenting robot to Chief Judges',
    content: [
      'Battery Chemistry & Voltage Check: 2S/3S LiPo battery balanced at 4.15V-4.20V per cell. Inspect for swelling or damaged balance leads.',
      'Main Power Isolation Switch: Dedicated physical mechanical toggle switch that cuts 100% of power to all motors and electronics.',
      'Dimensional Envelopes: Robot fits entirely within 250mm x 250mm x 250mm starting box without any parts protruding.',
      'Weight Limits: Total weight does not exceed the official 1,500g threshold for the land category.',
      'Wire Management: Zero loose dangling wires that could snag arena maze walls or foul wheel tires.',
      'Roster Parity Check: Team verified with mandatory 2 boys + 2 girls roster on official entry manifest.'
    ],
    tips: [
      'Print 3 copies of this checklist: one for the team bench, one for the test track, and one for the judge inspection table.'
    ]
  },
  {
    id: 'ex_01',
    category: 'exercises',
    title: '6-Week Championship Practice Drills',
    subtitle: 'Structured weekly milestones for school robotics club training sessions',
    content: [
      'Week 1: Straight-Line Calibration. Run robot across 3-meter straight path; measure drift; calibrate individual motor PWM trim.',
      'Week 2: 90-Degree Precision Turns. Test stationary pivot turns; adjust pulse count or gyro threshold until 90° turn error is < 2°.',
      'Week 3: Blind T-Junction Arbitration. Practice right-hand wall following rule through 5 distinct unknown labyrinth configurations.',
      'Week 4: Obstacle Detection & Re-Route. Place sudden static obstacle in lane; robot must halt within 80mm, back up 40mm, and initiate bypass maneuver.',
      'Week 5: Endurance & Battery Stress Run. Complete 10 continuous laps without brownouts or motor driver overheating.',
      'Week 6: Innovation Pitch Mock Defense. Team members present 90-second community problem statement and answer 3 rapid judge questions.'
    ],
    tips: [
      'Record lap times with a digital stopwatch and keep a physical logbook in the club room.'
    ]
  },
  {
    id: 'rule_01',
    category: 'rules',
    title: 'YARA 2026 Arena Rules & Scoring Formula',
    subtitle: 'Official point weighting breakdown across all 3 championship challenges',
    content: [
      'Challenge 1: Autonomous Maze Solving (35% Weight) - Score = 100 - (Run_Time_Sec / 2) - (Wall_Hits * 5) + (Checkpoints_Passed * 10).',
      'Challenge 2: Underwater Drone Missions (35% Weight) - Score = (Buoyancy_Balance_Pts) + (Gate_Passes * 15) + (Target_Recovery * 25) - (Tether_Snags * 10).',
      'Challenge 3: Innovation Pitch Defense (30% Weight) - Evaluated on: Problem Relevance (10 pts), Hardware Engineering Rigor (10 pts), Social Impact in African Communities (10 pts).'
    ],
    tips: [
      'In the event of a tie, the team with the cleanest autonomous run (zero human manual restarts) wins.'
    ]
  },
  {
    id: 'trouble_01',
    category: 'troubleshooting',
    title: 'Field Troubleshooting & Hardware Roadblocks',
    subtitle: 'Common bugs encountered in competition arenas and verified quick fixes',
    content: [
      'Symptom: Microcontroller resets or reboots when motors turn on.\nFix: Motor stall current is causing a power brownout. Separate motor power from 5V logic power or add a 470µF electrolytic capacitor across the VCC/GND rail.',
      'Symptom: Robot loses the line under bright arena lights.\nFix: Ambient overhead stadium lighting is saturating optical phototransistors. Shield IR sensors with 3D-printed black hoods or calibrate baseline ambient thresholds on power-up.',
      'Symptom: Motor driver (L298N / TB6612FNG) runs burning hot.\nFix: Motor current draw exceeds thermal limits. Switch to high-efficiency MOSFET H-bridges or reduce maximum PWM duty cycle to 85%.',
      'Symptom: I2C sensor bus hangs or freezes indefinitely.\nFix: Missing 4.7kΩ pull-up resistors on SDA/SCL lines, or motor EMI noise coupling into unshielded signal wires. Add twisted-pair shielding.'
    ],
    tips: [
      'Always keep a dedicated multimeter and spare motor driver ICs in your team toolbox.'
    ]
  }
];

export default function RoboticsCompetitionPrep() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('des_01');

  const categories = [
    { id: 'all', label: 'All Resources', icon: BookOpen },
    { id: 'design', label: 'Robot Design Guides', icon: Wrench },
    { id: 'programming', label: 'Programming & PID', icon: Code },
    { id: 'checklist', label: 'Build Checklists', icon: CheckSquare },
    { id: 'exercises', label: 'Practice Exercises', icon: Dumbbell },
    { id: 'rules', label: 'Competition Rules', icon: Trophy },
    { id: 'troubleshooting', label: 'Troubleshooting Field Guide', icon: AlertTriangle }
  ];

  const filteredItems = activeCategory === 'all'
    ? PREP_ITEMS
    : PREP_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white border border-blue-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Patron &amp; Coach Toolset</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Robotics Competition Preparation Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Comprehensive technical guides, PID code algorithms, inspection checklists, and arena practice drills to prepare your school teams for the YARA 2026 National Championship.
          </p>
        </div>

        <div className="shrink-0 flex flex-wrap gap-2">
          <a
            href="/assets/academy-robot-build.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download All Guides (PDF)</span>
          </a>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Guides Accordion List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 overflow-hidden transition-all shadow-md"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-5 text-left flex items-start justify-between gap-4 transition-colors hover:bg-slate-800/40"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>

                <div className="p-1 rounded-lg text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-150">
                  <div className="pt-3 space-y-2.5 text-xs text-slate-300">
                    {item.content.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="whitespace-pre-line">{point}</span>
                      </div>
                    ))}
                  </div>

                  {item.tips && item.tips.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Patron Engineering Pro-Tip</span>
                      </div>
                      {item.tips.map((t, idx) => (
                        <p key={idx} className="text-[11px] text-amber-100/90 leading-relaxed pl-5">
                          • {t}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
