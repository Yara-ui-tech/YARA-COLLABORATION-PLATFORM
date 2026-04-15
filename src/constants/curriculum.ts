export interface CurriculumSession {
  id: string;
  type: 'online' | 'physical';
  topic: string;
  outcome: string;
  description?: string;
  part: 'Electronics' | 'Programming' | 'Innovation + Build';
}

export const CURRICULUM: CurriculumSession[] = [
  {
    id: 'S01',
    type: 'online',
    part: 'Electronics',
    topic: "Electronics 1: Ohm's Law, Voltage, Current, Resistance, Power",
    outcome: "Calculate resistors and current for any LED or sensor circuit",
    description: "The Four Quantities (V, I, R, P) and Ohm's Law foundation. Series vs Parallel circuits and Voltage Dividers."
  },
  {
    id: 'S02',
    type: 'online',
    part: 'Electronics',
    topic: "Electronics 2: Components, Sensors, Actuators — Complete Reference",
    outcome: "Identify every component by sight. Know sensor outputs and wiring.",
    description: "Passive and active components, driver ICs, and comprehensive sensor/actuator reference."
  },
  {
    id: 'S03',
    type: 'online',
    part: 'Electronics',
    topic: "Electronics 3: Schematics, Multimeter, Safety Test, Robot Intro",
    outcome: "Read schematics. Pass 100% safety test. Design robot concept.",
    description: "Reading schematics, using a multimeter, and the 5 non-negotiable safety rules."
  },
  {
    id: 'S04',
    type: 'online',
    part: 'Programming',
    topic: "Programming 1: Logic, 7 Constructs, Pseudocode",
    outcome: "Write pseudocode for any sensor-driven system — without Arduino yet",
    description: "Universal programming constructs and high-level robot logic using pseudocode."
  },
  {
    id: 'S05',
    type: 'online',
    part: 'Programming',
    topic: "Programming 2: Arduino Structure, I/O, Serial — Tinkercad",
    outcome: "Wire and code LED + button + sensor circuits in Tinkercad simulation",
    description: "Arduino program structure, digital/analog I/O, and serial communication."
  },
  {
    id: 'S06',
    type: 'online',
    part: 'Programming',
    topic: "Programming 3: Functions, millis(), Libraries — Traffic Light build",
    outcome: "Build traffic light in Tinkercad using functions only. No delay().",
    description: "Reusable code blocks and non-blocking timing using millis()."
  },
  {
    id: 'S07',
    type: 'online',
    part: 'Programming',
    topic: "Programming 4: Sensor-Driven Code — Greenhouse + Alarm systems",
    outcome: "Write complete programmes for real sensor systems. All functions.",
    description: "Bringing electronics and programming together for greenhouse and alarm prototypes."
  },
  {
    id: 'S08',
    type: 'online',
    part: 'Programming',
    topic: "Programming 5: Robot Logic — Obstacle Avoidance + Line Following",
    outcome: "Write the code for your robot. Simulate in Wokwi before build day.",
    description: "Finalizing the primary code for your physical robot build."
  },
  {
    id: 'S09',
    type: 'online',
    part: 'Innovation + Build',
    topic: "Innovation 1: Problem Framing, HMW, 5 Whys, Robot Purpose",
    outcome: "Choose the real problem your robot will solve. Write HMW statement.",
    description: "8-step innovation process and connecting technology to community needs."
  },
  {
    id: 'S10',
    type: 'online',
    part: 'Innovation + Build',
    topic: "Innovation 2: Sector Analysis, Robot Design Plan, Component List",
    outcome: "Finalise robot design: sensors, actuators, power, chassis.",
    description: "Creating the bill of materials and step-by-step build sequence."
  },
  {
    id: 'S11',
    type: 'online',
    part: 'Innovation + Build',
    topic: "Innovation 3: Pitch Prep, Teach-Back, Physical Day Briefing",
    outcome: "90-sec pitch memorised. Robot design finalised. Ready to build.",
    description: "The 5-part YARA presentation framework and final preparations."
  },
  {
    id: 'P01',
    type: 'physical',
    part: 'Electronics',
    topic: "Electronics Lab Day — Wire Everything from Schematics",
    outcome: "Pass electronics assessment. Calibrate sensors. Wire actuators.",
    description: "Hands-on lab day focusing on real hardware wiring and measurement."
  },
  {
    id: 'P02',
    type: 'physical',
    part: 'Innovation + Build',
    topic: "Robot Build Day — Build, Code, Debug Your First Robot",
    outcome: "Every learner completes and demonstrates their robot.",
    description: "Intensive build day where the robot vision becomes a reality."
  },
  {
    id: 'P03',
    type: 'physical',
    part: 'Innovation + Build',
    topic: "Showcase + Certification — Live Demo + Pitch + Certificate",
    outcome: "Robot demonstrated live to audience. Certificate awarded.",
    description: "Final presentation to the community and certification ceremony."
  }
];
