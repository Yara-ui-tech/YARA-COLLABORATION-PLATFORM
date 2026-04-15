export interface CurriculumSession {
  id: string;
  type: 'online' | 'physical';
  topic: string;
  outcome: string;
  description: string;
  part: 'Electronics' | 'Programming' | 'Innovation + Build';
  details?: {
    theory?: string[];
    activities?: string[];
    checkpoints?: string[];
    safetyRules?: string[];
    formulas?: string[];
  };
}

export const CURRICULUM: CurriculumSession[] = [
  {
    id: 'S01',
    type: 'online',
    part: 'Electronics',
    topic: "Electronics 1: Electricity, Ohm's Law, Components Foundation",
    outcome: "Calculate resistors and current for any LED or sensor circuit",
    description: "The Four Quantities (V, I, R, P) and Ohm's Law foundation. Series vs Parallel circuits and Voltage Dividers.",
    details: {
      theory: [
        "Voltage (V): The 'push' driving electrons (5V, 9V, 12V).",
        "Current (I): Electrons per second. Arduino max: 40mA.",
        "Resistance (R): Opposition to current. Wires = zero resistance.",
        "Power (P): Energy consumed per second. P = V × I."
      ],
      formulas: [
        "V = I × R",
        "P = V × I",
        "R = (Vsupply – Vforward) ÷ Itarget (LED Resistor)"
      ],
      activities: [
        "Ohm's Law Drill: 12 practical problems with full working.",
        "LED calculation exercise for 5V supply."
      ]
    }
  },
  {
    id: 'S02',
    type: 'online',
    part: 'Electronics',
    topic: "Electronics 2: Components, Sensors, Actuators — Complete Reference",
    outcome: "Identify every component by sight. Know sensor outputs and wiring.",
    description: "Passive and active components, driver ICs, and comprehensive sensor/actuator reference.",
    details: {
      theory: [
        "Passive Components: Resistors, Capacitors (104/Electrolytic), LEDs, Diodes.",
        "Active Components: Transistors (BC547), MOSFETs (IRLZ44N), L298N Driver.",
        "Sensors: HC-SR04 (Distance), DHT22 (Temp/Humid), PIR, Soil Moisture.",
        "Actuators: DC Motors, Servos (SG90/MG996R), Relays, Buzzers."
      ],
      activities: [
        "Component identification quiz from 10 photos.",
        "Draw wiring diagrams for HC-SR04 and PIR sensor.",
        "Design L298N wiring for 2 DC motors."
      ]
    }
  },
  {
    id: 'S03',
    type: 'online',
    part: 'Electronics',
    topic: "Electronics 3: Schematics, Multimeter, Safety Test, Robot Intro",
    outcome: "Read schematics. Pass 100% safety test. Design robot concept.",
    description: "Reading schematics, using a multimeter, and the 5 non-negotiable safety rules.",
    details: {
      safetyRules: [
        "NEVER work on mains voltage (230V AC).",
        "ALWAYS disconnect power before rewiring.",
        "ALWAYS use a flyback diode across inductive loads (motors/relays).",
        "NEVER exceed the current rating of any pin (40mA).",
        "DOUBLE-CHECK polarity before applying power."
      ],
      theory: [
        "Schematic Symbols identification.",
        "Multimeter usage: DC Voltage, Continuity, Resistance, Diode Check."
      ],
      activities: [
        "Robot Concept Design Workshop: Problem framing and component selection.",
        "100% Safety Test Completion."
      ]
    }
  },
  {
    id: 'S04',
    type: 'online',
    part: 'Programming',
    topic: "Programming 1: Logic, 7 Constructs, Pseudocode",
    outcome: "Write pseudocode for any sensor-driven system — without Arduino yet",
    description: "Universal programming constructs and high-level robot logic using pseudocode.",
    details: {
      theory: [
        "The 7 Constructs: Sequence, Variable, Condition (If), For Loop, While Loop, Function, Array.",
        "Pseudocode logic vs syntax."
      ],
      activities: [
        "Write pseudocode for Obstacle Avoidance Robot.",
        "Write pseudocode for Line Follower Robot.",
        "Write pseudocode for MY OWN robot design."
      ]
    }
  },
  {
    id: 'S05',
    type: 'online',
    part: 'Programming',
    topic: "Programming 2: Arduino Structure, I/O, Serial — Tinkercad",
    outcome: "Wire and code LED + button + sensor circuits in Tinkercad simulation",
    description: "Arduino program structure, digital/analog I/O, and serial communication.",
    details: {
      theory: [
        "Program Structure: Includes, Constants, Globals, Setup(), Loop().",
        "I/O functions: pinMode(), digitalRead/Write(), analogRead/Write().",
        "Serial monitoring for debugging."
      ],
      activities: [
        "Tinkercad Circuits 1-4: Blinking LEDs to Motor Preview.",
        "Wire L298N in simulation and write basic functions."
      ]
    }
  },
  {
    id: 'S06',
    type: 'online',
    part: 'Programming',
    topic: "Programming 3: Functions, millis(), Libraries — Traffic Light build",
    outcome: "Build traffic light in Tinkercad using functions only. No delay().",
    description: "Reusable code blocks and non-blocking timing using millis().",
    details: {
      theory: [
        "Function parameters and return values.",
        "The danger of delay() in real-time robot systems.",
        "millis() non-blocking logic structure."
      ],
      activities: [
        "Tinkercad Traffic Light Project: 5 functions + millis() timing.",
        "Challenge: Blinking active light while handling button press."
      ]
    }
  },
  {
    id: 'S07',
    type: 'online',
    part: 'Programming',
    topic: "Programming 4: Sensor-Driven Code — Greenhouse + Alarm systems",
    outcome: "Write complete programmes for real sensor systems. All functions.",
    description: "Bringing electronics and programming together for greenhouse and alarm prototypes.",
    details: {
      theory: [
        "Scaling and mapping analog values.",
        "Multi-sensor logic integration.",
        "Library installation/usage in Wokwi."
      ],
      activities: [
        "Wokwi Task 1: Smart Greenhouse (DHT22 + Moisture + Relay + LCD).",
        "Wokwi Task 2: Smart Alarm System (PIR + Gas + Buzzer).",
        "Combine millis() with Task 1 for dual-tasking."
      ]
    }
  },
  {
    id: 'S08',
    type: 'online',
    part: 'Programming',
    topic: "Programming 5: Robot Logic — Obstacle Avoidance + Line Following",
    outcome: "Write the code for your robot. Simulate in Wokwi before build day.",
    description: "Finalizing the primary code for your physical robot build.",
    details: {
      theory: [
        "Obstacle Avoidance Logic (Sense-Think-Act).",
        "Line Following Logic using IR sensors.",
        "Wokwi simulator configuration for robotics."
      ],
      activities: [
        "Complete simulation of Obstacle Avoidance with L298N.",
        "Write and simulate YOUR robot code and fix errors."
      ]
    }
  },
  {
    id: 'S09',
    type: 'online',
    part: 'Innovation + Build',
    topic: "Innovation 1: Problem Framing, HMW, 5 Whys, Robot Purpose",
    outcome: "Choose the real problem your robot will solve. Write HMW statement.",
    description: "8-step innovation process and connecting technology to community needs.",
    details: {
      theory: [
        "The 8-Step Innovation Process (Observe -> Iterate).",
        "Problem framing using the '5 Whys'.",
        "Writing 'How Might We' (HMW) statements."
      ],
      activities: [
        "30-minute Community Observation Walk (20 observations).",
        "Robot Purpose Statement development."
      ]
    }
  },
  {
    id: 'S10',
    type: 'online',
    part: 'Innovation + Build',
    topic: "Innovation 2: Sector Analysis, Robot Design Plan, Component List",
    outcome: "Finalise robot design: sensors, actuators, power, chassis.",
    description: "Creating the bill of materials and step-by-step build sequence.",
    details: {
      theory: [
        "Sector Analysis: Agriculture, Healthcare, Energy, Security.",
        "Design Review principles.",
        "Bill of Materials planning."
      ],
      activities: [
        "Final Design Plan completion.",
        "Step-by-step build sequence documentation."
      ]
    }
  },
  {
    id: 'S11',
    type: 'online',
    part: 'Innovation + Build',
    topic: "Innovation 3: Pitch Prep, Teach-Back, Physical Day Briefing",
    outcome: "90-sec pitch memorised. Robot design finalised. Ready to build.",
    description: "The 5-part YARA presentation framework and final preparations.",
    details: {
      theory: [
        "The 5-Part Pitch Framework (Problem, Solution, How it Works, Demo, Vision).",
        "The Teach-Back concept.",
        "Physical Day 1 & Day 2 logisitics briefing."
      ],
      activities: [
        "Recorded 90-second Pitch practice.",
        "Final peer design review."
      ]
    }
  },
  {
    id: 'P01',
    type: 'physical',
    part: 'Electronics',
    topic: "Electronics Lab Day — Wire Everything from Schematics",
    outcome: "Pass electronics assessment. Calibrate sensors. Wire actuators.",
    description: "Hands-on lab day focusing on real hardware wiring and measurement.",
    details: {
      activities: [
        "Resistor Workshop & Identification.",
        "Sensor Calibration in real-world environment.",
        "Multimeter Lab: DC measurement on test circuits.",
        "Electronics Practical Assessment."
      ]
    }
  },
  {
    id: 'P02',
    type: 'physical',
    part: 'Innovation + Build',
    topic: "Robot Build Day — Build, Code, Debug Your First Robot",
    outcome: "Every learner completes and demonstrates their robot.",
    description: "Intensive build day where the robot vision becomes a reality.",
    details: {
      activities: [
        "Mechanical Assembly of robot chassis.",
        "Component-by-component wiring and testing.",
        "Code uploading and threshold tuning.",
        "Logic demonstration for sign-off."
      ]
    }
  },
  {
    id: 'P03',
    type: 'physical',
    part: 'Innovation + Build',
    topic: "Showcase + Certification — Live Demo + Pitch + Certificate",
    outcome: "Robot demonstrated live to audience. Certificate awarded.",
    description: "Final presentation to the community and certification ceremony.",
    details: {
      activities: [
        "Final Pitch & Demo to guest judges.",
        "Teach-Back session to visitors.",
        "Awarding of YARA Robotics & Innovation Certificate."
      ]
    }
  }
];
