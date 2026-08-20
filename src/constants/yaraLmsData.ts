import { YARACourseLevel, YARALmsSession, YARAKitItem } from '../types/yaraLms';

export const YARA_LEARNING_LEVELS: YARACourseLevel[] = [
  {
    levelNumber: 0,
    code: 'LVL-0',
    title: 'LEVEL 0 — Curious Beginner',
    tagline: 'Introduction to Robotics, Automation & Systems Thinking',
    description: 'Demystify robotics, understand mechanical, electrical, and computational components, and discover how robots transform Africa and the world.',
    badge: 'Curious Beginner Explorer',
    badgeIcon: '🟢',
    color: 'emerald',
    targetOutcome: 'Define a robot, differentiate robotics from automation, and identify 5 real-world robots in daily environments.',
    sessions: ['S00']
  },
  {
    levelNumber: 1,
    code: 'LVL-1',
    title: 'LEVEL 1 — Electronics Beginner',
    tagline: 'Circuits, Ohm’s Law, Electronic Components & Laboratory Safety',
    description: 'Master voltage, current, resistance, Ohm’s law, multi-component breadboards, sensors, actuators, and multimeter diagnostic procedures.',
    badge: 'Electronics Beginner Pioneer',
    badgeIcon: '⚡',
    color: 'amber',
    targetOutcome: 'Design, calculate, breadboard, and safely test circuits with LEDs, resistors, transistors, sensors, and actuators.',
    sessions: ['S01', 'S02', 'S03', 'S04', 'P01'],
    prerequisiteLevel: 0
  },
  {
    levelNumber: 2,
    code: 'LVL-2',
    title: 'LEVEL 2 — Block Programmer',
    tagline: 'Computational Thinking, Algorithmic Logic & Robot Simulation',
    description: 'Develop structured logic through visual block programming (Scratch/Blockly), covering sequences, variables, conditional branches, loops, and decision engines.',
    badge: 'Block Programmer Builder',
    badgeIcon: '🧩',
    color: 'indigo',
    targetOutcome: 'Program digital traffic lights, automatic lighting, and virtual obstacle-avoiding mobile robot algorithms.',
    sessions: ['S05', 'S06', 'S07'],
    prerequisiteLevel: 1
  },
  {
    levelNumber: 3,
    code: 'LVL-3',
    title: 'LEVEL 3 — Embedded Programmer',
    tagline: 'Arduino & ESP32 Microcontrollers, C++, GPIO & Sensor Interfacing',
    description: 'Transition to embedded C/C++ on Arduino and ESP32 platforms. Interface digital/analog sensors, PWM motor controls, and timing state machines.',
    badge: 'Embedded Systems Programmer',
    badgeIcon: '💻',
    color: 'blue',
    targetOutcome: 'Write firmware to read multiple sensors, drive DC/servo motors, control timing via millis(), and build smart automated systems.',
    sessions: ['S08', 'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15'],
    prerequisiteLevel: 2
  },
  {
    levelNumber: 4,
    code: 'LVL-4',
    title: 'LEVEL 4 — Robot Builder',
    tagline: 'Robot Anatomy, Mechanical Dynamics, Power Distribution & BOM Costing',
    description: 'Engineer mobile robot platforms from first principles. Master chassis mechanics, wheel physics, motor sizing, battery regulation, and Bill of Materials costing.',
    badge: 'Robot Architecture Builder',
    badgeIcon: '🤖',
    color: 'purple',
    targetOutcome: 'Produce a complete mechanical CAD sketch, electrical schematic, and budgeted Bill of Materials for an autonomous rover.',
    sessions: ['S16', 'S17', 'S18', 'S19'],
    prerequisiteLevel: 3
  },
  {
    levelNumber: 5,
    code: 'LVL-5',
    title: 'LEVEL 5 — Robot Engineer',
    tagline: 'Autonomous Mobile Robots, Line Following, Obstacle Navigation & Fault Isolation',
    description: 'Construct, program, and rigorously debug physical rovers. Implement state-machine obstacle avoidance, multi-sensor line tracking, and systematic debugging protocols.',
    badge: 'Autonomous Robot Engineer',
    badgeIcon: '🔧',
    color: 'cyan',
    targetOutcome: 'Build, wire, calibrate, and program an autonomous rover to navigate complex tracks and troubleshoot hardware/software bugs.',
    sessions: ['S20', 'P02', 'S21', 'S22', 'S23', 'P03'],
    prerequisiteLevel: 4
  },
  {
    levelNumber: 6,
    code: 'LVL-6',
    title: 'LEVEL 6 — IoT / AI Explorer',
    tagline: 'Connected Telemetry, Cloud Dashboards, Edge ML & Computer Vision',
    description: 'Supercharge hardware with IoT connectivity and AI perception. Broadcast sensor streams to cloud dashboards and implement beginner computer vision tracking.',
    badge: 'IoT & Edge AI Explorer',
    badgeIcon: '🌐',
    color: 'teal',
    targetOutcome: 'Connect an ESP32 to online telemetry streams and build a vision-assisted color/object tracking robotics pipeline.',
    sessions: ['S24', 'S25', 'S26', 'S27'],
    prerequisiteLevel: 5
  },
  {
    levelNumber: 7,
    code: 'LVL-7',
    title: 'LEVEL 7 — Problem Solver',
    tagline: 'Applied Research, 5 Whys Root Cause Analysis & Design Thinking',
    description: 'Formulate research questions, conduct stakeholder interviews, apply 5 Whys root cause analysis, and execute the complete 5-stage Design Thinking methodology.',
    badge: 'Design Thinking Problem Solver',
    badgeIcon: '🔬',
    color: 'rose',
    targetOutcome: 'Conduct field research, define a validated community problem statement, and synthesize an iterative engineering design specification.',
    sessions: ['S28', 'S29', 'S30', 'S31'],
    prerequisiteLevel: 6
  },
  {
    levelNumber: 8,
    code: 'LVL-8',
    title: 'LEVEL 8 — Young Innovator',
    tagline: 'Product Development, 21-Point Technical Documentation, Capstone & Showcase',
    description: 'Transform prototypes into deployable solutions. Build a comprehensive 21-point engineering report, deliver a 90-second innovation pitch, and defend your Capstone.',
    badge: 'YARA Robotics & Innovation Graduate',
    badgeIcon: '🚀',
    color: 'gold',
    targetOutcome: 'Submit, document, and defend an approved high-impact Capstone addressing Agriculture, Healthcare, Energy, Water, or Education.',
    sessions: ['S32', 'S33', 'S34', 'S35', 'S36', 'P04', 'P05'],
    prerequisiteLevel: 7
  }
];

export const YARA_LMS_SESSIONS: YARALmsSession[] = [
  // LEVEL 0
  {
    id: 'S00',
    levelNumber: 0,
    order: 0,
    title: 'What Is Robotics & Autonomous Systems?',
    subtitle: 'Mechanical Systems, Electronics, Software, Sensors & Actuators',
    type: 'online',
    part: 'Foundations',
    durationMinutes: 45,
    prerequisites: [],
    learningObjective: 'Define what constitutes a robot, distinguish robotics from automation, and analyze how mechanical, electrical, and software domains integrate.',
    whyLearnThis: 'Every advanced automated system in manufacturing, agriculture, aerospace, and medical technology relies on the fundamental robot triad: Sense → Compute → Actuate.',
    whatYouWillBuild: 'A comparative matrix and breakdown of 5 real-world robotic systems in modern environments.',
    whatYouWillSubmit: 'A 5-robot environmental audit with categorized mechanical, sensing, computational, and actuator components.',
    innovatorContribution: 'Builds foundational terminology and systems thinking necessary for all subsequent design and hardware decisions.',
    video_url: 'https://www.youtube.com/watch?v=0yD3uBshJB0',
    video_duration_seconds: 720,
    reading_markdown: `# What Is Robotics?

A **robot** is an autonomous or semi-autonomous electromechanical machine programmed to sense its environment, process information, and perform physical actions in the real world.

### The Anatomy of Every Robot
1. **Mechanical Structure (Body):** Chassis, linkages, joints, wheels, and structural frames that provide physical stability.
2. **Electronics & Power (Nervous System):** Batteries, voltage regulators, power distribution buses, and wiring.
3. **Sensors (Eyes & Senses):** Devices that measure physical quantities (light, distance, temperature, acceleration) and convert them into electrical signals.
4. **Controller / Microcontroller (Brain):** The processing unit (e.g., Arduino, ESP32, Raspberry Pi) that executes algorithmic instructions.
5. **Actuators (Muscles):** Motors, servos, solenoids, and linear actuators that convert electrical energy into mechanical movement.
6. **Software (Mind):** The code that orchestrates logic, decision trees, and feedback control loops.

### Robotics vs. Automation
- **Fixed Automation:** A washing machine repeats a timer cycle regardless of load cleanliness.
- **Robotic System:** An autonomous vacuum or solar-tracking agricultural rover actively reads sensors, maps its surroundings, avoids obstacles, and adapts its trajectory in real time.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s00_1',
        question: 'Which of the following best defines a true robotic system compared to simple automation?',
        options: [
          'It senses environment data, computes decisions, and executes physical actions adaptively',
          'It has flashing LEDs and metal parts',
          'It operates only when plugged into a 220V wall outlet',
          'It cannot run without human joystick control at all times'
        ],
        correctIndex: 0,
        explanation: 'A robot is defined by the Sense → Compute → Actuate loop, adapting its physical actions based on real-time sensory input.'
      },
      {
        id: 'q_s00_2',
        question: 'In robotics anatomy, what component acts as the "muscles" converting electrical signals into physical movement?',
        options: ['Actuators (DC motors, Servos, Steppers)', 'Sensors (Ultrasonic, LDR)', 'Resistors', 'Capacitors'],
        correctIndex: 0,
        explanation: 'Actuators are the physical transducers that convert electrical power into mechanical torque and displacement.'
      },
      {
        id: 'q_s00_3',
        question: 'Which element represents the "brain" that computes algorithmic decisions on a robot?',
        options: ['Microcontroller / Processor (e.g. Arduino, ESP32)', 'Chassis frame', 'Lithium Polymer battery', 'Jumper wire'],
        correctIndex: 0,
        explanation: 'The microcontroller runs firmware logic, sampling sensor inputs and controlling actuator outputs.'
      }
    ],
    assignment: {
      id: 'a_s00',
      title: '5-Robots Field Audit & Systems Breakdown',
      description: 'Observe your surrounding school, home, farm, or industrial environment. Identify 5 robotic or automated systems and analyze their 4 subsystems.',
      instructions: [
        'Select 5 distinct machines (e.g., drone, automatic gate, solar tracker, smart incubator, robotic vacuum, factory sorter).',
        'Identify the Sensor(s), Controller, Actuator(s), and Power source for each.',
        'Explain what real-world problem each robot solves.'
      ],
      deliverables: ['Formatted PDF report or structured submission text with 5 full breakdowns']
    },
    miniProject: {
      id: 'p_s00',
      title: 'Real-World Robotics Case Study',
      description: 'Select an African challenge (such as crop irrigation, vaccine transport, or mine safety) and write a 1-page concept specification for how a robotic system addresses it.',
      objectives: ['Define the problem context.', 'List the proposed sensor inputs and actuator outputs.', 'Draft a high-level block diagram.'],
      starterLink: 'https://www.yaria.org/robotics-foundations'
    },
    resources: [
      {
        title: 'IEEE Robotics & Automation Guide',
        url: 'https://robots.ieee.org/',
        type: 'doc',
        description: 'Comprehensive global catalog of robotic platforms, kinematics, and applications'
      },
      {
        title: 'YARA Robotics Anatomy Reference Sheet',
        url: 'https://inforyaraorg.wixsite.com/my-site-2',
        type: 'doc',
        description: 'Official YARA guide on mechanical, electrical, and firmware subsystem integration'
      }
    ]
  },

  // LEVEL 1: S01
  {
    id: 'S01',
    levelNumber: 1,
    order: 1,
    title: 'Electricity, Voltage, Current, Resistance & Ohm’s Law',
    subtitle: 'The Four Fundamental Quantities (V, I, R, P) and Current-Limiting Calculations',
    type: 'online',
    part: 'Electronics',
    durationMinutes: 60,
    prerequisites: ['S00'],
    learningObjective: 'Calculate voltage drop, current draw, resistance, and power dissipation using Ohm’s Law and Joule’s Law for any robotics circuit.',
    whyLearnThis: 'Microcontrollers operate on strict electrical limits (typically 3.3V or 5V with 20-40mA max per pin). Calculating resistor values prevents destroyed components and blown chip pins.',
    whatYouWillBuild: 'A multi-LED breadboard circuit with precisely calculated current-limiting resistors and voltage divider branches.',
    whatYouWillSubmit: 'Mathematical calculations for 3 robotics load cases and simulation/breadboard verification photos.',
    innovatorContribution: 'Enables safe, calculated hardware design without guess-and-burn component failures.',
    video_url: 'https://www.youtube.com/watch?v=8jB7p9aM0aY',
    video_duration_seconds: 900,
    reading_markdown: `# Electronics Foundation: Ohm’s Law & Power

### 1. The Four Quantities
- **Voltage (V)** in Volts ($V$): Electrical potential difference driving electrons.
- **Current (I)** in Amperes ($A$ or $mA$): Rate of electrical charge flow ($1 A = 1000 mA$).
- **Resistance (R)** in Ohms ($\Omega$): Opposition to the flow of electric current.
- **Power (P)** in Watts ($W$): Rate of electrical energy consumed ($P = V \times I$).

### 2. Ohm's Law
$$V = I \times R \quad \Longleftrightarrow \quad I = \frac{V}{R} \quad \Longleftrightarrow \quad R = \frac{V}{I}$$

### 3. LED Resistor Calculation
To protect an LED from burning out:
$$R_{limit} = \frac{V_{supply} - V_{forward}}{I_{target}}$$
*Example:* 5V supply, Red LED ($V_f = 2.0V$, $I_t = 20mA = 0.02A$):
$$R = \frac{5.0 - 2.0}{0.02} = \frac{3.0}{0.02} = 150\,\Omega \quad (\text{Use } 150\,\Omega \text{ to } 220\,\Omega)$$`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Red / Green / Yellow LEDs', quantity: 3, purpose: 'Visual light emitters', inStarterKit: true },
      { name: 'Resistors (150Ω, 220Ω, 330Ω, 1kΩ, 10kΩ)', quantity: 10, purpose: 'Current limiting and pull-down', inStarterKit: true },
      { name: 'Half-Size Breadboard', quantity: 1, purpose: 'Solderless prototyping base', inStarterKit: true },
      { name: 'Male-to-Male Jumper Wires', quantity: 10, purpose: 'Circuit routing', inStarterKit: true },
      { name: '9V Battery or 5V USB Breadboard Power Module', quantity: 1, purpose: 'DC Power Source', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s01_1',
        question: 'If a 9V battery powers a circuit with a total resistance of 300 Ohms, what is the current in milliamperes (mA)?',
        options: ['30 mA', '3 mA', '300 mA', '90 mA'],
        correctIndex: 0,
        explanation: 'I = V / R = 9V / 300Ω = 0.03A = 30 mA.'
      },
      {
        id: 'q_s01_2',
        question: 'You are connecting a Blue LED (Forward Voltage = 3.2V, Target Current = 15mA) to a 5V Arduino pin. What resistor is required?',
        options: ['120 Ohms', '330 Ohms', '1000 Ohms', '10 Ohms'],
        correctIndex: 0,
        explanation: 'R = (5V - 3.2V) / 0.015A = 1.8V / 0.015A = 120 Ohms.'
      },
      {
        id: 'q_s01_3',
        question: 'What is the power dissipated by a 220-Ohm resistor carrying 20mA (0.02A) of current?',
        options: ['0.088 Watts (88 mW)', '4.4 Watts', '0.0044 Watts', '2.2 Watts'],
        correctIndex: 0,
        explanation: 'P = I² × R = (0.02)² × 220 = 0.0004 × 220 = 0.088 W (88 mW).'
      }
    ],
    assignment: {
      id: 'a_s01',
      title: 'Ohm’s Law Calculation Drill & Circuit Schematic',
      description: 'Solve 3 realistic electronics load cases and construct the equivalent circuit in Tinkercad or physical breadboard.',
      instructions: [
        'Calculate resistor required for 3 different color LEDs on 5V and 9V rails.',
        'Calculate power rating requirements to ensure 1/4W resistors will not overheat.',
        'Draw a schematic illustrating series vs parallel LED arrangements.'
      ],
      deliverables: ['Mathematical worksheet with calculations', 'Tinkercad circuit URL or laboratory photo']
    },
    miniProject: {
      id: 'p_s01',
      title: 'Working Breadboard LED Safety Array',
      description: 'Assemble a working 3-LED parallel circuit with independent current limiting resistors on breadboard.',
      objectives: ['Correct power rail polarity.', 'Individual resistor placement for each branch.', 'Measure voltage drops across each LED.'],
      simulationPlatform: 'Tinkercad'
    },
    resources: [
      { title: 'Falstad Interactive Circuit Simulator', url: 'https://www.falstad.com/circuit/', type: 'simulation' },
      { title: 'DigiKey Resistor Color Code Calculator', url: 'https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-resistor-color-code', type: 'tool' },
      { title: 'Tinkercad Circuits Online Breadboard', url: 'https://www.tinkercad.com/circuits', type: 'simulator' }
    ]
  },

  // S02
  {
    id: 'S02',
    levelNumber: 1,
    order: 2,
    title: 'Electronic Components: Capacitors, Diodes, Transistors & Relays',
    subtitle: 'Passive vs Active Components, Switching Principles & Protection',
    type: 'online',
    part: 'Electronics',
    durationMinutes: 60,
    prerequisites: ['S01'],
    learningObjective: 'Identify and apply capacitors, diodes, NPN bipolar transistors, potentiometers, buzzers, and electromagnetic relays.',
    whyLearnThis: 'Microcontroller pins can only supply small currents (≤20mA). To drive powerful motors, solenoids, or high-power lights, robots use transistors and relays as electronic switches.',
    whatYouWillBuild: 'A transistor-based switching circuit driving a high-current load (buzzer or DC motor) from a weak control signal.',
    whatYouWillSubmit: 'Transistor gain calculations and a multi-component circuit breadboard demonstration.',
    innovatorContribution: 'Provides the hardware interface skills needed to control heavy robotics actuators from low-voltage microcontrollers.',
    video_url: 'https://www.youtube.com/watch?v=7ukDKVHnac4',
    video_duration_seconds: 840,
    reading_markdown: `# Electronic Components & Solid-State Switching

### 1. Passive vs. Active Components
- **Passive:** Resistors, capacitors, inductors (do not amplify or inject power).
- **Active:** Transistors, diodes, operational amplifiers, integrated circuits (control electron flow).

### 2. Diodes & Flyback Protection
- Diodes allow current to flow in **one direction only** (Anode $\to$ Cathode).
- **Flyback Diode:** When inductive loads (motors, relays) are switched off, collapsing magnetic fields generate hundreds of volts of reverse electromotive force (EMF). A parallel reverse-biased diode safely dissipates this spike, protecting your microcontroller.

### 3. NPN Bipolar Junction Transistors (e.g. 2N2222 / BC547)
- **Base (B):** Small control current trigger.
- **Collector (C):** Connected to the higher-power load.
- **Emitter (E):** Connected to ground.
- In saturation mode, the transistor acts as an **electronic closed switch**.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'NPN Transistors (2N2222 or BC547)', quantity: 2, purpose: 'Electronic switching', inStarterKit: true },
      { name: '1N4007 Diodes', quantity: 2, purpose: 'Flyback protection', inStarterKit: true },
      { name: 'Electrolytic Capacitors (10µF, 100µF)', quantity: 3, purpose: 'Power filtering & decoupling', inStarterKit: true },
      { name: 'Active & Passive 5V Buzzers', quantity: 2, purpose: 'Audio feedback', inStarterKit: true },
      { name: '10kΩ Rotary Potentiometer', quantity: 1, purpose: 'Variable voltage division', inStarterKit: true },
      { name: '5V Single-Channel Relay Module', quantity: 1, purpose: 'Isolated high-voltage switching', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s02_1',
        question: 'What is the primary function of a flyback diode placed across a DC motor or relay coil?',
        options: [
          'To protect the switching transistor from high-voltage inductive kickback spikes',
          'To make the motor spin faster',
          'To step down the battery voltage to 3.3V',
          'To invert the direction of rotation'
        ],
        correctIndex: 0,
        explanation: 'Inductive loads produce high reverse voltage spikes when turned off. Flyback diodes clamp and dissipate this spike safely.'
      },
      {
        id: 'q_s02_2',
        question: 'When using an NPN transistor (like 2N2222) as a switch, where is the base resistor placed?',
        options: [
          'Between the microcontroller output pin and the Transistor Base pin',
          'Between the Collector and positive power',
          'Between the Emitter and Ground',
          'In parallel with the battery'
        ],
        correctIndex: 0,
        explanation: 'The base resistor limits current entering the transistor base, keeping it within safe microcontroller pin ratings.'
      }
    ],
    assignment: {
      id: 'a_s02',
      title: 'Transistor Switch Circuit Analysis',
      description: 'Design a circuit schematic where a 3.3V logic signal safely switches on a 12V 200mA cooling fan using a 2N2222 transistor.',
      instructions: ['Calculate Base resistor value for saturation ($h_{FE} = 100$).', 'Add flyback diode and decoupling capacitor.', 'Explain the circuit operation.'],
      deliverables: ['Circuit diagram and calculation steps']
    },
    miniProject: {
      id: 'p_s02',
      title: 'Multi-Component Breadboard Alarm Circuit',
      description: 'Build a hardware circuit utilizing a push button, NPN transistor, buzzer, LED, and potentiometer volume/sensitivity control.',
      objectives: ['Verify transistor switching.', 'Observe potentiometer voltage divider behavior.'],
      simulationPlatform: 'Tinkercad'
    },
    resources: [
      { title: 'All About Circuits: BJT Transistor Basics', url: 'https://www.allaboutcircuits.com/', type: 'doc' }
    ]
  },

  // S03
  {
    id: 'S03',
    levelNumber: 1,
    order: 3,
    title: 'Sensors & Actuators: The Sense-Compute-Actuate Loop',
    subtitle: 'Ultrasonic, Infrared, Light (LDR), Temperature, Servo & DC Motors',
    type: 'online',
    part: 'Electronics',
    durationMinutes: 60,
    prerequisites: ['S02'],
    learningObjective: 'Differentiate digital vs analog sensors, connect ultrasonic and IR distance sensors, and control servo and DC motors.',
    whyLearnThis: 'Without sensors, a robot is blind. Without actuators, a robot is paralyzed. Master the fundamental input-to-output pipeline.',
    whatYouWillBuild: 'A sensor-controlled output system (e.g. ambient light-activated motor or proximity alarm).',
    whatYouWillSubmit: 'Sensor calibration data table and sensor-to-actuator control logic diagram.',
    innovatorContribution: 'Connects environmental perception directly with physical mechanical actuation.',
    video_url: 'https://www.youtube.com/watch?v=wXb0r1WkX0M',
    video_duration_seconds: 780,
    reading_markdown: `# Sensors & Actuators in Robotics

### 1. The Core Paradigm
$$\textbf{Sensors (Input)} \longrightarrow \textbf{Controller (Logic)} \longrightarrow \textbf{Actuators (Output)}$$

### 2. Sensor Classifications
- **Digital Sensors:** Output discrete binary states (HIGH = 5V / LOW = 0V), e.g., push buttons, digital infrared proximity switches, limit switches.
- **Analog Sensors:** Output continuous voltage proportional to a physical measurement, e.g., Photoresistor (LDR), Potentiometer, Thermistor, Analog Distance Sensor.
- **Time-of-Flight / Pulse Sensors:** HC-SR04 Ultrasonic Distance Sensor sends a 40kHz ultrasound pulse and measures echo roundtrip time:
  $$\text{Distance (cm)} = \frac{\text{Echo Time (µs)} \times 0.0343}{2}$$

### 3. Actuator Types
- **DC Motors:** Continuous high-speed rotation, speed controlled via Pulse Width Modulation (PWM).
- **Servo Motors (SG90):** Geared motor with internal potentiometer feedback for precise angular positioning ($0^\circ \text{ to } 180^\circ$) via $50\text{Hz}$ PWM pulses.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'HC-SR04 Ultrasonic Distance Sensor', quantity: 1, purpose: 'Distance measurement (2cm - 400cm)', inStarterKit: true },
      { name: 'TCRT5000 / IR Line Tracking Sensor Modules', quantity: 2, purpose: 'Surface reflectivity & line detection', inStarterKit: true },
      { name: 'Photoresistor (LDR Light Sensor)', quantity: 2, purpose: 'Ambient light sensing', inStarterKit: true },
      { name: 'SG90 9g Micro Servo Motor', quantity: 1, purpose: 'Precision angular steering / positioning', inStarterKit: true },
      { name: 'TT Geared DC Motors (3V-6V)', quantity: 2, purpose: 'Wheel propulsion', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s03_1',
        question: 'If an HC-SR04 ultrasonic sensor measures an echo return time of 1000 microseconds (µs), approximately how far is the obstacle?',
        options: ['17.15 cm', '34.3 cm', '1.71 cm', '68.6 cm'],
        correctIndex: 0,
        explanation: 'Distance = (1000 µs × 0.0343 cm/µs) / 2 = 34.3 / 2 = 17.15 cm.'
      },
      {
        id: 'q_s03_2',
        question: 'Why does an SG90 servo motor differ from a standard DC motor?',
        options: [
          'It has internal closed-loop feedback for precise angle positioning between 0° and 180°',
          'It requires 220V AC power',
          'It only rotates in reverse',
          'It cannot hold position under load'
        ],
        correctIndex: 0,
        explanation: 'Servos use internal closed-loop potentiometer feedback to position and hold a specific angle based on pulse duration.'
      }
    ],
    assignment: {
      id: 'a_s03',
      title: 'Sensor Selection & Architecture Spec',
      description: 'Create a sensor specification document for an autonomous agricultural weeding robot operating in sunlight.',
      instructions: ['Compare LDR, IR, and Ultrasonic sensors for outdoor obstacle detection.', 'Select appropriate actuator for steering and propulsion.', 'Draw a block diagram of the Sense-Compute-Actuate pipeline.'],
      deliverables: ['System specification worksheet']
    },
    miniProject: {
      id: 'p_s03',
      title: 'Sensor-Controlled Output Breadboard Prototype',
      description: 'Build a circuit where an LDR voltage divider or IR proximity sensor controls a servo position or buzzer alarm.',
      objectives: ['Calibrate sensor voltage range.', 'Demonstrate responsive actuator motion based on stimulus.'],
      simulationPlatform: 'Tinkercad'
    },
    resources: [
      { title: 'HC-SR04 Ultrasonic Sensor Datasheet & Timing Diagram', url: 'https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf', type: 'datasheet' }
    ]
  },

  // S04
  {
    id: 'S04',
    levelNumber: 1,
    order: 4,
    title: 'Schematics, Multimeter Diagnostics & Electrical Safety',
    subtitle: 'Reading Circuit Diagrams, Continuity, Polarity & Short-Circuit Prevention',
    type: 'online',
    part: 'Electronics',
    durationMinutes: 60,
    prerequisites: ['S03'],
    learningObjective: 'Read standard electrical schematics, use a digital multimeter to measure voltage, current, and continuity, and practice laboratory safety.',
    whyLearnThis: '90% of hardware bugs in robotics are caused by bad solder joints, reversed polarity, short circuits, or ground loops. Mastering multimeter diagnostics makes you an efficient debugger.',
    whatYouWillBuild: 'A complete schematic diagram of your electronics subsystem and execute a full diagnostic check.',
    whatYouWillSubmit: 'Multimeter measurement log across 5 test points with continuity and voltage verification.',
    innovatorContribution: 'Eliminates guesswork and builds professional electrical engineering diagnostic discipline.',
    video_url: 'https://www.youtube.com/watch?v=bF3OyQ3HwfU',
    video_duration_seconds: 720,
    reading_markdown: `# Electrical Schematics & Multimeter Mastery

### 1. Key Schematic Symbols
- **GND (Ground):** Common 0V reference.
- **VCC / 5V / 3.3V:** Positive power supply rail.
- **Resistor:** Zigzag line or rectangle ($\Omega$).
- **Capacitor:** Two parallel plates (one curved if polarized electrolytic).
- **Diode / LED:** Triangle pointing towards a line with arrows for light emission.
- **Switch:** Gap with a movable lever.

### 2. The 3 Crucial Multimeter Modes
1. **DC Voltage Mode ($V_{DC}$):** Measured in **parallel** across a component with circuit powered.
2. **Continuity / Resistance Mode ($\Omega$ / Beeper):** Tested with circuit **power completely disconnected** to find broken wires and short circuits.
3. **Current Mode ($mA$ / $A$):** Measured in **series** (breaking the circuit path so current flows through the meter).`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Digital Multimeter with Test Probes', quantity: 1, purpose: 'Voltage, Current, Resistance & Continuity testing', inStarterKit: true },
      { name: 'Standard Circuit Board / Breadboard Test Rig', quantity: 1, purpose: 'Diagnostic testing', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s04_1',
        question: 'When testing for short circuits using a multimeter in Continuity mode, what should you do with the circuit power first?',
        options: ['Disconnect all power sources completely', 'Turn power to maximum', 'Leave power connected and measure fast', 'Short the battery terminals together'],
        correctIndex: 0,
        explanation: 'Testing resistance or continuity on an energized circuit damages the multimeter and gives false readings.'
      },
      {
        id: 'q_s04_2',
        question: 'How must a multimeter be connected to measure the current flowing through an LED branch?',
        options: ['In series (breaking the circuit loop)', 'In parallel across the LED', 'Connected between positive and ground rails', 'Connected across the battery terminals'],
        correctIndex: 0,
        explanation: 'Current measures the flow through a path, so the meter must be inserted in series within that path.'
      }
    ],
    assignment: {
      id: 'a_s04',
      title: 'Schematic Translation & Diagnostic Procedure Plan',
      description: 'Convert a breadboard wiring diagram into a professional schematic symbol diagram and write a 5-step pre-power safety checklist.',
      instructions: ['Identify GND, VCC, resistors, switches, sensors, and actuators.', 'Include step-by-step continuity checks before inserting batteries.'],
      deliverables: ['Schematic PDF/image and safety checklist']
    },
    miniProject: {
      id: 'p_s04',
      title: 'Hardware Circuit Fault-Finding Exercise',
      description: 'Inject a deliberate open-circuit or high-resistance fault in a test circuit and locate it using a multimeter.',
      objectives: ['Confirm continuity.', 'Measure voltage drops across individual series elements.'],
      simulationPlatform: 'Falstad / Physical Bench'
    },
    resources: [
      { title: 'SparkFun Multimeter Tutorial Guide', url: 'https://learn.sparkfun.com/tutorials/how-to-use-a-multimeter', type: 'doc' }
    ]
  },

  // P01: Practical Lab
  {
    id: 'P01',
    levelNumber: 1,
    order: 5,
    title: 'Electronics Laboratory Practical Assessment',
    subtitle: 'Hands-on Circuit Construction, Calibration, Multimeter Verification & Fault Diagnosis',
    type: 'physical_lab',
    part: 'Electronics',
    durationMinutes: 90,
    prerequisites: ['S01', 'S02', 'S03', 'S04'],
    learningObjective: 'Construct, test, measure, and calibrate a multi-sensor electronic circuit from schematic diagrams on a physical breadboard.',
    whyLearnThis: 'This physical lab confirms you have mastered real-world electronics before moving on to microcontroller programming.',
    whatYouWillBuild: 'A physical multi-stage electronics breadboard incorporating LDR sensing, transistor switching, ultrasonic measurement, and buzzer/servo output.',
    whatYouWillSubmit: 'Lab assessment worksheet with measured voltages, photos/videos of the working circuit, and instructor verification.',
    innovatorContribution: 'Bridges theoretical electronics calculations with hands-on bench craftsmanship.',
    video_url: 'https://www.youtube.com/watch?v=wHkWz6Pgmso',
    video_duration_seconds: 600,
    reading_markdown: `# Electronics Laboratory Assessment (P01)

### Practical Lab Checklist
1. **Schematic Verification:** Review the provided circuit schematic.
2. **Component Inspection:** Test resistor values with multimeter before insertion.
3. **Breadboard Assembly:** Wire power rails, decouple with a 100µF capacitor.
4. **Pre-Power Continuity Test:** Ensure NO short circuit exists between $V_{CC}$ and $GND$ ($R > 10\text{k}\Omega$).
5. **Powered Voltage Verification:** Measure $V_{CC}$ rail under load ($5.0V \pm 0.2V$).
6. **Sensor Calibration:** Record sensor output voltages in low and high ambient conditions.
7. **Actuator Triggering:** Validate transistor / relay activation.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Full Electronics Beginner Component Kit', quantity: 1, purpose: 'Complete physical lab assembly', inStarterKit: true },
      { name: 'Digital Multimeter', quantity: 1, purpose: 'Bench measurements', inStarterKit: true }
    ],
    quizPassingScore: 75,
    quizQuestions: [
      {
        id: 'q_p01_1',
        question: 'During your pre-power check, the multimeter continuity test beeps continuously between VCC and GND. What must you do?',
        options: [
          'Do NOT connect power; inspect breadboard for a direct short circuit immediately',
          'Connect the battery anyway to see if it fixes itself',
          'Increase the battery voltage',
          'Replace the multimeter battery'
        ],
        correctIndex: 0,
        explanation: 'A short circuit between VCC and GND will destroy power supplies and components. It must be resolved before power is applied.'
      }
    ],
    assignment: {
      id: 'a_p01',
      title: 'P01 Laboratory Measurement Log & Report',
      description: 'Record experimental measurements for 5 test points in your circuit and document any troubleshooting steps.',
      instructions: ['Measure supply voltage under load.', 'Record LDR voltage in dark vs light conditions.', 'Submit clear photo showing multimeter connected.'],
      deliverables: ['Laboratory Report Sheet PDF with verification signature/photo']
    },
    miniProject: {
      id: 'p_p01',
      title: 'Physical Multi-Sensor Alarm Rig',
      description: 'Deliver a physical hardware demonstration of an operational light-and-proximity alarm station.',
      objectives: ['Clean breadboard wiring with color-coded jumpers (Red=Power, Black=GND).', 'Proper flyback and decoupling protection.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'YARA Lab Safety & Assessment Standard Guidelines', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  }
];

export const YARA_ROBOTICS_STARTER_KIT: YARAKitItem = {
  id: 'yara_starter_kit_2026',
  title: 'YARA Robotics & Innovation Starter Kit',
  subtitle: 'The Complete Official Hardware Toolkit for Levels 0 through 8',
  priceUsd: 35,
  description: 'Contains all authentic microcontrollers, sensors, actuators, motor drivers, chassis components, breadboards, jumper wires, and multimeters required to complete all YARA Robotics Academy hands-on sessions and Capstone prototyping.',
  imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
  includedComponents: [
    '1x Arduino Uno R3 / ESP32 Dual-Core Microcontroller Development Board',
    '1x Full-Size 830-Point Solderless Breadboard with Power Rails',
    '65x Male-to-Male, Male-to-Female & Female-to-Female Multicolored Jumper Wires',
    '1x High-Accuracy HC-SR04 Ultrasonic Distance Sensor',
    '2x TCRT5000 Infrared Line-Tracking Proximity Sensor Modules',
    '1x SG90 9g Precision Micro Servo Motor with Control Horns',
    '2x High-Torque 3V-6V TT Geared DC Motors with Rubber Wheels',
    '1x L298N / L9110S Dual H-Bridge Motor Driver Controller Module',
    '1x 2WD Laser-Cut Acrylic Robot Chassis Kit with Caster Wheel & Standoffs',
    '1x Digital Multimeter with Heavy-Duty Test Probes',
    '20x Assorted Precision Metal-Film Resistors (150Ω, 220Ω, 330Ω, 1kΩ, 10kΩ)',
    '10x Ultra-Bright 5mm LEDs (Red, Green, Yellow, Blue, White)',
    '2x NPN Switching Transistors (2N2222 / BC547) + 2x 1N4007 Diodes',
    '1x 5V Active Buzzer + 1x 10kΩ Rotary Precision Potentiometer',
    '1x DHT11 Temperature & Humidity Sensor + 2x LDR Photoresistors',
    '1x 5V Single-Channel Optical Isolated Relay Module',
    '1x 4x AA Battery Holder with DC Barrel Jack & Power Switch',
    '1x High-Speed USB Programming Cable'
  ],
  suitableLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  inStock: true,
  contactInquiryPhone: '0717468236'
};
