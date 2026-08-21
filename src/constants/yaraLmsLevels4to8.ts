import { YARALmsSession } from '../types/yaraLms';

export const YARA_SESSIONS_LEVELS_4_TO_8: YARALmsSession[] = [
  // ==========================================
  // LEVEL 4: ROBOT BUILDER (S16 to S19)
  // ==========================================
  {
    id: 'S16',
    levelNumber: 4,
    order: 17,
    title: 'Robot Anatomy & Subsystem Integration',
    subtitle: 'Chassis, Kinematics, Power Buses, Drive Trains & Control Systems',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 60,
    prerequisites: ['S15'],
    learningObjective: 'Analyze the physical and electrical anatomy of mobile robots and formulate the equation: Mechanical + Electrical + Software = Robot.',
    whyLearnThis: 'Successful robots require seamless balance between mechanical balance, clean electrical power, and robust firmware.',
    whatYouWillBuild: 'A complete functional block diagram decomposing your mobile robot into 5 interdependent subsystems.',
    whatYouWillSubmit: 'System decomposition specification and subsystem integration checklist.',
    innovatorContribution: 'Instills multi-disciplinary systems engineering required for complex machine design.',
    video_url: 'https://www.youtube.com/watch?v=0hKq_gO8jEU',
    video_duration_seconds: 720,
    reading_markdown: `# Mobile Robot Anatomy & Systems Integration

$$\textbf{Mechanical (Body)} + \textbf{Electrical (Power \& Senses)} + \textbf{Software (Mind)} = \textbf{Autonomous Robot}$$

### The 5 Subsystems of a Mobile Robot
1. **Locomotion & Mechanical Chassis:** Differential drive, caster wheels, motor mounts, structural rigidity.
2. **Actuation & Drive Electronics:** DC gearmotors, encoders, H-Bridge motor drivers.
3. **Sensing Subsystem:** Ultrasonic obstacle detectors, infrared line sensors, wheel odometry.
4. **Power Subsystem:** Battery chemistry, boost/buck voltage regulators, master power switch, common grounding bus.
5. **Processing Subsystem:** Microcontroller executing real-time control loops and sensor fusion.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: '2WD Acrylic Robot Chassis Kit with Caster Wheel & Motors', quantity: 1, purpose: 'Mechanical base', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s16_1',
        question: 'What is differential drive steering on a 2-wheel mobile robot?',
        options: [
          'Steering accomplished by varying the relative speeds and directions of the left and right drive wheels independently',
          'Using a car rack-and-pinion steering wheel only',
          'Using four separate steering servos on each wheel',
          'Driving with only one wheel powered'
        ],
        correctIndex: 0,
        explanation: 'Differential drive robots steer by driving wheels at different speeds or in opposite directions for zero-radius turning.'
      }
    ],
    assignment: {
      id: 'a_s16',
      title: 'Mobile Robot Subsystem Architecture Diagram',
      description: 'Create a block diagram detailing power rails, data buses, motor signals, and sensor lines for a 2WD autonomous rover.',
      instructions: ['Label voltages (e.g. 5V, 7.4V/9V).', 'Indicate signal directions (In/Out).'],
      deliverables: ['Architecture Block Diagram PDF/Image']
    },
    miniProject: {
      id: 'p_s16',
      title: 'Chassis Balance & Motor Mount CAD/Sketch',
      description: 'Design the physical layout of your robot components to ensure the center of gravity rests between the drive wheels and caster.',
      objectives: ['Center of gravity calculation.', 'Accessibility of battery and programming ports.'],
      simulationPlatform: 'Tinkercad / Paper CAD'
    },
    resources: [
      { title: 'Differential Mobile Robot Kinematics Guide', url: 'https://en.wikipedia.org/wiki/Differential_wheeled_robot', type: 'doc' }
    ]
  },
  {
    id: 'S17',
    levelNumber: 4,
    order: 18,
    title: 'Mechanical Robot Design & Kinematics',
    subtitle: 'Chassis Geometry, Wheel Selection, Center of Gravity & Sensor Mounting',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 60,
    prerequisites: ['S16'],
    learningObjective: 'Calculate robot center of gravity (CoG), wheel traction, gear reduction torque, and optimal sensor mounting heights.',
    whyLearnThis: 'A robot with poor weight distribution slips, tips over on inclines, or fails to steer accurately.',
    whatYouWillBuild: 'A mechanical CAD layout of your custom robot platform with sensor mount brackets.',
    whatYouWillSubmit: 'Dimensioned 2D/3D mechanical drawings and center of gravity calculations.',
    innovatorContribution: 'Ensures mechanical stability and durability under real-world track conditions.',
    video_url: 'https://www.youtube.com/watch?v=PW8r_e9x8pE',
    video_duration_seconds: 780,
    reading_markdown: `# Mechanical Design & Center of Gravity

### 1. Center of Gravity (CoG) Rules
- Keep the CoG **low** and centered **forward of the rear axle** on 2WD + caster robots.
- A high CoG causes tipping under rapid deceleration or sharp turns.

### 2. Sensor Placement Physics
- **Line Tracking IR Sensors:** Mount $5\text{mm} - 10\text{mm}$ above the surface for optimal optical contrast.
- **Ultrasonic Sensors:** Mount $5\text{cm} - 10\text{cm}$ high to avoid picking up ground bounce echoes while detecting low obstacles.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Chassis plate + Screws + Standoffs + Wheels', quantity: 1, purpose: 'Mechanical assembly', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s17_1',
        question: 'Why should infrared line-tracking sensors be mounted within 5mm to 10mm from the ground?',
        options: [
          'Because the infrared emitter and phototransistor focal range requires close proximity to detect surface reflectivity contrast accurately',
          'To keep them warm',
          'So they do not hit the ceiling',
          'To reduce battery power consumption'
        ],
        correctIndex: 0,
        explanation: 'Infrared reflective sensors have a short focal distance. Too high and ambient light drowns the signal; too low and they scratch the floor.'
      }
    ],
    assignment: {
      id: 'a_s17',
      title: 'Robot Mechanical Chassis Design Specification',
      description: 'Create a dimensioned design sketch for a 2WD or 4WD rover chassis with component locations and mounting hole measurements.',
      instructions: ['Include wheelbase and track width dimensions.', 'Specify sensor positions.'],
      deliverables: ['Dimensioned mechanical drawing and specification sheet']
    },
    miniProject: {
      id: 'p_s17',
      title: 'Tinkercad 3D Chassis & Sensor Bracket Model',
      description: 'Model a 3D ultrasonic sensor bracket or custom bumper mount in Tinkercad ready for laser cutting or 3D printing.',
      objectives: ['Accurate screw hole tolerances.', 'Rigid structural support.'],
      simulationPlatform: 'Tinkercad 3D'
    },
    resources: [
      { title: 'Tinkercad 3D Modeling Platform', url: 'https://www.tinkercad.com/3d-design', type: 'tool' }
    ]
  },
  {
    id: 'S18',
    levelNumber: 4,
    order: 19,
    title: 'Robot Electrical Design, Power Management & Wiring',
    subtitle: 'Battery Sizing, Voltage Regulators, Common Grounding & Motor Noise Decoupling',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 65,
    prerequisites: ['S17'],
    learningObjective: 'Design a dual-rail power distribution system separating motor noise from microcontroller logic with voltage regulation and fuses.',
    whyLearnThis: 'Motor electrical noise causes random microcontroller resets when power supplies are poorly regulated.',
    whatYouWillBuild: 'A complete, clean wiring harness and power distribution board schematic.',
    whatYouWillSubmit: 'Electrical schematic showing battery, regulators, motor driver, microcontroller, and sensors with wire gauges and color codes.',
    innovatorContribution: 'Guarantees reliable, glitch-free electrical performance under heavy motor stall currents.',
    video_url: 'https://www.youtube.com/watch?v=bF3OyQ3HwfU',
    video_duration_seconds: 780,
    reading_markdown: `# Robot Electrical Power & Noise Decoupling

### 1. Dual-Rail Power Distribution
$$\\textbf{Battery (7.4V - 9V)} \\begin{cases} \\xrightarrow{\\quad\\text{Direct (High Current)}\\quad} \\text{Motor Driver (L298N)} \\to \\text{Motors} \\\\ \\xrightarrow{\\quad\\text{Regulated 5V Step-Down}\\quad} \\text{Microcontroller (Arduino/ESP32)} \\to \\text{Sensors} \\end{cases}$$

### 2. Common Ground Rule
All grounds ($GND$) MUST be connected at a single star point to prevent ground loops and erratic signal references.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Battery Holder + Power Switch + Jumper Harness', quantity: 1, purpose: 'Power wiring', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s18_1',
        question: 'Why does an Arduino sometimes reset when motors start spinning if powered from the same weak battery without proper regulation?',
        options: [
          'Motor startup inrush current causes a momentary voltage drop (brownout) below the microcontroller minimum operating voltage',
          'The code gets erased by magnetism',
          'The wheels spin backwards',
          'The USB cable vibrates loose'
        ],
        correctIndex: 0,
        explanation: 'Motors draw high inrush stall currents on startup. A dedicated motor battery or strong bulk decoupling capacitor prevents microcontroller brownouts.'
      }
    ],
    assignment: {
      id: 'a_s18',
      title: 'Complete Robot Wiring Diagram & Power Budget Calculation',
      description: 'Calculate total maximum current draw (Arduino + Sensors + 2 Motors stall current) and draw the complete wiring harness diagram.',
      instructions: ['Tabulate individual current draws in mA.', 'Calculate battery life in hours for a 2000mAh pack.'],
      deliverables: ['Power budget spreadsheet and wiring schematic']
    },
    miniProject: {
      id: 'p_s18',
      title: 'Power Distribution & Switch Harness Construction',
      description: 'Assemble the physical power switch, battery clip, and terminal block harness with color-coded wiring.',
      objectives: ['Red for +VCC, Black for GND.', 'Secure strain-relief connections.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'Battery University: Li-Ion & NiMH Power Fundamentals', url: 'https://batteryuniversity.com/', type: 'doc' }
    ]
  },
  {
    id: 'S19',
    levelNumber: 4,
    order: 20,
    title: 'Robot Bill of Materials (BOM) & Cost Optimization',
    subtitle: 'Component Selection, Unit Costing, Sourcing & Budget Management',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 50,
    prerequisites: ['S18'],
    learningObjective: 'Formulate a comprehensive Bill of Materials (BOM) including component names, part numbers, quantities, purposes, unit prices, and total project budgets.',
    whyLearnThis: 'Every commercial robotics engineer must design for manufacturing and economic viability within strict budgetary constraints.',
    whatYouWillBuild: 'A professional Bill of Materials spreadsheet for your autonomous rover prototype.',
    whatYouWillSubmit: 'Completed BOM document with cost breakdown and local component sourcing links.',
    innovatorContribution: 'Develops commercial acumen, budgeting discipline, and procurement planning.',
    video_url: 'https://www.youtube.com/watch?v=d8_xXNcGYgo',
    video_duration_seconds: 600,
    reading_markdown: `# Bill of Materials (BOM) Engineering

### Required Columns in a Robotics BOM:
1. **Item #:** Sequential line number.
2. **Component Name & Model:** e.g., \`HC-SR04 Ultrasonic Sensor\`.
3. **Quantity:** e.g., \`1\`.
4. **Subsystem / Purpose:** e.g., \`Front Obstacle Detection\`.
5. **Supplier / Sourcing:** e.g., \`YARA Robotics Store (0717468236)\`.
6. **Unit Cost ($):** e.g., \`$2.50\`.
7. **Total Cost ($):** \`Qty * Unit Cost\`.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s19_1',
        question: 'What is a Bill of Materials (BOM) in engineering?',
        options: [
          'A comprehensive inventory list of all raw materials, components, quantities, and costs required to build a product',
          'A list of software bugs',
          'An invoice sent to customers only after delivery',
          'A mathematical formula for motor speed'
        ],
        correctIndex: 0,
        explanation: 'A BOM details every hardware item, part number, quantity, purpose, and cost needed for fabrication.'
      }
    ],
    assignment: {
      id: 'a_s19',
      title: 'Complete Autonomous Rover BOM & Cost Optimization Plan',
      description: 'Create an itemized BOM for a 2WD autonomous rover with subtotal costs per subsystem (Mechanical, Electronics, Power, Controller).',
      instructions: ['Identify 2 opportunities to reduce cost without compromising reliability.'],
      deliverables: ['Formatted BOM spreadsheet / PDF']
    },
    miniProject: {
      id: 'p_s19',
      title: 'Component Kit Sourcing & Verification Audit',
      description: 'Audit physical components against your BOM, checking quantities, pin integrity, and correct specifications.',
      objectives: ['Match physical parts with BOM entries.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'YARA Official Component Kit Catalog & Pricing', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  },

  // ==============================================================
  // LEVEL 5: ROBOT ENGINEER (S20, P02, S21, S22, S23, P03)
  // ==============================================================
  {
    id: 'S20',
    levelNumber: 5,
    order: 21,
    title: 'Robot Build Preparation & Pre-Assembly Verification',
    subtitle: 'Bench Testing Motors, Sensor Calibration, Fasteners & Assembly Workflow',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 55,
    prerequisites: ['S19'],
    learningObjective: 'Execute pre-assembly hardware verification: test individual motors under load, calibrate sensors, and prepare toolkits for mechanical assembly.',
    whyLearnThis: 'Finding a defective motor or broken sensor BEFORE fastening it deep inside a chassis saves hours of frustrating disassembly.',
    whatYouWillBuild: 'A tested and verified kit of sub-assemblies ready for chassis integration.',
    whatYouWillSubmit: 'Pre-assembly inspection checklist signed off for each component.',
    innovatorContribution: 'Establishes aerospace-grade pre-flight inspection quality assurance.',
    video_url: 'https://www.youtube.com/watch?v=FCMxA3m_Imc',
    video_duration_seconds: 660,
    reading_markdown: `# Pre-Assembly Quality Checklist

### 7 Steps Before Chassis Assembly:
1. **Motor Bench Test:** Connect 4.5V directly to each motor; confirm both spin smoothly at comparable RPM.
2. **Ultrasonic Range Check:** Verify distance readings over Serial from 5cm to 150cm.
3. **IR Line Sensor Potentiometer Tuning:** Adjust threshold potentiometers so LEDs toggle cleanly over black tape vs white paper.
4. **Screws & Standoffs Check:** Organize M3 screws, nuts, spacers, and acrylic panels.
5. **Wheel Alignment:** Check that tires sit flush on motor D-shafts without wobbling.
6. **Battery Health:** Verify battery pack outputs $\ge 6.0\text{V}$ under load.
7. **Firmware Baseline:** Upload a simple motor-test sketch to Arduino before mounting.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Complete 2WD Robot Kit Subassemblies', quantity: 1, purpose: 'Pre-build inspection', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s20_1',
        question: 'Why should you test both TT gearmotors on a bench power source before bolting them into the chassis?',
        options: [
          'To verify that both motors spin freely without mechanical binding or gearbox defects before final assembly',
          'To heat up the plastic',
          'To discharge the batteries',
          'To increase motor torque'
        ],
        correctIndex: 0,
        explanation: 'Testing individual motors on the bench identifies binding gears or bad solder tabs before they are mounted in hard-to-reach locations.'
      }
    ],
    assignment: {
      id: 'a_s20',
      title: 'Pre-Assembly Quality Assurance Checklist',
      description: 'Document the testing of each subsystem with recorded voltage, sensor readings, and motor current draw values.',
      instructions: ['Record motor no-load current.', 'Calibrate IR sensor trigger thresholds.'],
      deliverables: ['Signed pre-assembly inspection report']
    },
    miniProject: {
      id: 'p_s20',
      title: 'Pre-Assembly Test Rig Harness',
      description: 'Construct a temporary bench wiring rig to test the Arduino, Motor Driver, and HC-SR04 simultaneously.',
      objectives: ['Verify communication before mechanical mounting.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'YARA Workshop Assembly Manual', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  },
  {
    id: 'P02',
    levelNumber: 5,
    order: 22,
    title: 'Physical Laboratory: Assemble & Power Your First Robot',
    subtitle: 'Chassis Construction, Motor Mounting, Wiring Harness & First Motion Test',
    type: 'physical_lab',
    part: 'Robotics & Hardware',
    durationMinutes: 120,
    prerequisites: ['S20'],
    learningObjective: 'Physically assemble the complete 2WD autonomous rover chassis, mount motors, wire the motor driver and controller, and execute a verified motion test.',
    whyLearnThis: 'This milestone marks your transition from circuit experimenter to physical robot builder!',
    whatYouWillBuild: 'A complete, fully assembled physical 2-wheel drive autonomous mobile robot.',
    whatYouWillSubmit: 'Short video demonstrating your robot executing programmed forward, reverse, and pivot maneuvers on the floor.',
    innovatorContribution: 'Delivers a functional, real-world electromechanical robotics hardware platform.',
    video_url: 'https://www.youtube.com/watch?v=wXb0r1WkX0M',
    video_duration_seconds: 900,
    reading_markdown: `# Physical Robot Assembly Protocol (P02)

### 9 Assembly Steps:
1. Peel protective film from acrylic chassis.
2. Fasten TT gearmotors using long M3 screws and acrylic brackets.
3. Install front omni-directional caster wheel using brass standoffs.
4. Mount rubber drive wheels onto motor D-shafts.
5. Mount Arduino Uno and L298N motor driver using screws or standoffs.
6. Install battery box beneath or atop chassis maintaining balanced CoG.
7. Wire motor leads to L298N OUT1/OUT2 and OUT3/OUT4.
8. Connect Arduino control pins (IN1-IN4, ENA, ENB) and common ground.
9. Connect battery power and upload \`BasicMotionTest.ino\`.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Full 2WD Robot Hardware Kit', quantity: 1, purpose: 'Physical assembly', inStarterKit: true },
      { name: 'Screwdriver & Toolkit', quantity: 1, purpose: 'Assembly tools', inStarterKit: true }
    ],
    quizPassingScore: 75,
    quizQuestions: [
      {
        id: 'q_p02_1',
        question: 'When you upload your first forward-motion sketch, one wheel spins forward while the other spins backward. What is the fastest physical fix?',
        options: [
          'Swap the two motor wire leads on the terminal block of the reversed motor',
          'Throw away the robot',
          'Recharge the battery',
          'Replace the microcontroller'
        ],
        correctIndex: 0,
        explanation: 'DC motor rotation direction depends on polarity. Swapping the positive and negative wire leads on that motor driver terminal immediately reverses its direction.'
      }
    ],
    assignment: {
      id: 'a_p02',
      title: 'P02 Assembly & Motion Verification Report',
      description: 'Submit photos of your completed robot assembly from top, side, and bottom views, along with wiring check confirmation.',
      instructions: ['Highlight clean wire routing.', 'Confirm secure mechanical fasteners.'],
      deliverables: ['Assembly photo log and video link of motion test']
    },
    miniProject: {
      id: 'p_p02',
      title: 'Figure-8 Autonomous Motion Routine',
      description: 'Program your assembled robot to execute a precise Figure-8 pattern on the floor, timing movements accurately.',
      objectives: ['Synchronized dual-motor calibration.', 'Consistent turn repeatability.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'YARA Robot Assembly Step-by-Step Video Guide', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'video' }
    ]
  },
  {
    id: 'S21',
    levelNumber: 5,
    order: 23,
    title: 'Robot Programming: Obstacle Avoidance & Reactive Navigation',
    subtitle: 'Ultrasonic Scanning, Servo Panning, State-Machine Steering & Deadlock Recovery',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 70,
    prerequisites: ['P02'],
    learningObjective: 'Program an autonomous obstacle avoidance algorithm using servo-panned ultrasonic distance scanning and reactive decision trees.',
    whyLearnThis: 'Autonomous vacuum cleaners, industrial warehouse AGVs, and planetary rovers all rely on reactive obstacle avoidance algorithms.',
    whatYouWillBuild: 'An autonomous rover that explores rooms, detects obstacles, scans left/right for the clearest path, and navigates without collisions.',
    whatYouWillSubmit: 'Obstacle avoidance C++ source code and video demonstration of continuous room navigation.',
    innovatorContribution: 'Empowers robots to autonomously navigate unstructured environments safely.',
    video_url: 'https://www.youtube.com/watch?v=Fhy834eF24M',
    video_duration_seconds: 840,
    reading_markdown: `# Obstacle Avoidance & Navigation Intelligence

### Scanning Navigation Algorithm
1. **Drive Forward:** Measure front distance $D_{front}$ continuously.
2. **If $D_{front} < 25\text{cm}$:**
   - Stop motors immediately.
   - Reverse for 300ms.
   - Pan Ultrasonic Servo to Left ($150^\circ$), measure $D_{left}$.
   - Pan Ultrasonic Servo to Right ($30^\circ$), measure $D_{right}$.
   - Return Servo to Center ($90^\circ$).
   - **Decision:**
     - If $D_{left} > D_{right}$: Spin Turn Left.
     - Else if $D_{right} > D_{left}$: Spin Turn Right.
     - Else (both blocked): Execute $180^\circ$ U-Turn.
   - Resume Drive Forward.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Assembled Robot + HC-SR04 + SG90 Servo', quantity: 1, purpose: 'Autonomous navigation', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s21_1',
        question: 'Why should the robot reverse slightly before scanning left and right for a clear path?',
        options: [
          'To create clearance space so the robot does not scrape the obstacle when turning in place',
          'To cool the motors down',
          'To measure the obstacle weight',
          'To recharge the battery'
        ],
        correctIndex: 0,
        explanation: 'Reversing gives the robot turning radius clearance, preventing wheels or chassis corners from catching on the detected object during pivot.'
      }
    ],
    assignment: {
      id: 'a_s21',
      title: 'Obstacle Avoidance Firmware Architecture Document',
      description: 'Document your scanning algorithm with pseudocode, threshold parameters, and corner trap escape logic.',
      instructions: ['Detail dead-end trap recovery logic.', 'Include speed modulation based on proximity.'],
      deliverables: ['Firmware architecture document and code']
    },
    miniProject: {
      id: 'p_s21',
      title: 'Autonomous Room Explorer Challenge',
      description: 'Demonstrate your robot continuously navigating a complex obstacle maze for 2 full minutes without physical contact or human intervention.',
      objectives: ['Zero collisions.', 'Smooth recovery from corners.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'Reactive Navigation & Bug Algorithms in Robotics', url: 'https://en.wikipedia.org/wiki/Bug_algorithm', type: 'doc' }
    ]
  },
  {
    id: 'S22',
    levelNumber: 5,
    order: 24,
    title: 'Autonomous Line-Following Robots & Sensor Tuning',
    subtitle: 'Dual & Triple IR Reflectance Sensors, Threshold Calibration & PID Steering Logic',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 70,
    prerequisites: ['S21'],
    learningObjective: 'Implement high-speed autonomous line tracking on black tape tracks using optical reflectance calibration and proportional steering.',
    whyLearnThis: 'Automated Guided Vehicles (AGVs) in Amazon fulfillment centers and automotive assembly lines transport millions of tons using optical line following.',
    whatYouWillBuild: 'An autonomous high-speed line tracking robot that follows sharp curves, intersections, and loops.',
    whatYouWillSubmit: 'Line tracking firmware code and video of robot completing a timed competition-grade track lap.',
    innovatorContribution: 'Directly prepares learners for national and international robotics competition challenges.',
    video_url: 'https://www.youtube.com/watch?v=kM9ASKAni_s',
    video_duration_seconds: 840,
    reading_markdown: `# Autonomous Line Tracking & Proportional Steering

### 1. Dual-Sensor Truth Table
| Left IR Sensor | Right IR Sensor | Robot Action | Left Motor | Right Motor |
| :--- | :--- | :--- | :--- | :--- |
| WHITE (0) | WHITE (0) | Drive Forward | Speed $V$ | Speed $V$ |
| BLACK (1) | WHITE (0) | Turn Left | Speed $0$ / Reverse | Speed $V$ |
| WHITE (0) | BLACK (1) | Turn Right | Speed $V$ | Speed $0$ / Reverse |
| BLACK (1) | BLACK (1) | Intersection / Stop | Speed $0$ | Speed $0$ |

### 2. Proportional (P) Error Control
$$\text{Error} = \text{Sensor}_{left} - \text{Sensor}_{right} \quad \Longrightarrow \quad \text{TurnAdjustment} = K_p \times \text{Error}$$
Adjusting motor speeds smoothly proportionally to error eliminates jerky zig-zag oscillation.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Assembled Robot + 2x TCRT5000 IR Sensor Modules + Electrical Tape Track', quantity: 1, purpose: 'Line following', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s22_1',
        question: 'If a 2-sensor line-following robot veers off to the right of a black line, which sensor will detect black first, and what should the robot do?',
        options: [
          'The Left sensor detects black; the robot should turn LEFT to re-center over the line',
          'The Right sensor detects black; turn right',
          'Both sensors detect white; stop immediately',
          'Reverse at full speed'
        ],
        correctIndex: 0,
        explanation: 'When the robot drifts right, the black line appears under the left sensor, triggering a corrective left turn.'
      }
    ],
    assignment: {
      id: 'a_s22',
      title: 'Line Follower Tuning & Differential Calibration Log',
      description: 'Document your motor base speed ($V_{base}$) and proportional gain ($K_p$) tuning iterations across 5 test runs on sharp and gentle curves.',
      instructions: ['Tabulate track completion times vs tuning values.', 'Note how sensor spacing affects track retention.'],
      deliverables: ['Tuning log worksheet and final C++ firmware']
    },
    miniProject: {
      id: 'p_s22',
      title: 'Precision Track Lap Challenge',
      description: 'Build a figure-8 or looped black electrical tape track on the floor. Program your robot to complete 3 consecutive laps without derailment.',
      objectives: ['Smooth line tracking.', 'Fast lap time without oscillations.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'PID Control for Autonomous Mobile Line Followers', url: 'https://en.wikipedia.org/wiki/PID_controller', type: 'doc' }
    ]
  },
  {
    id: 'S23',
    levelNumber: 5,
    order: 25,
    title: 'Systematic Robot Debugging, Diagnostics & Fault Finding',
    subtitle: 'Observe → Isolate → Test → Identify → Fix → Retest Methodology',
    type: 'online',
    part: 'Robotics & Hardware',
    durationMinutes: 60,
    prerequisites: ['S22'],
    learningObjective: 'Apply a structured 6-step engineering diagnostic protocol to isolate and resolve mechanical, electrical, firmware, and sensor faults.',
    whyLearnThis: 'Novices randomly change code and wires when something fails. Master engineers apply rigorous systematic fault isolation.',
    whatYouWillBuild: 'A diagnostic fault matrix and troubleshooting flow diagram.',
    whatYouWillSubmit: 'Documented resolution of 5 injected hardware/software fault scenarios.',
    innovatorContribution: 'Builds critical problem-solving resilience and professional troubleshooting mastery.',
    video_url: 'https://www.youtube.com/watch?v=PW8r_e9x8pE',
    video_duration_seconds: 720,
    reading_markdown: `# Systematic Robotics Debugging Protocol

### The 6-Step Universal Troubleshooting Cycle
$$\textbf{Observe} \longrightarrow \textbf{Isolate} \longrightarrow \textbf{Test} \longrightarrow \textbf{Identify Root Cause} \longrightarrow \textbf{Fix} \longrightarrow \textbf{Retest \& Verify}$$

### 7 Most Common Robotics Faults & Solutions:
1. **Robot Won't Power On:** Check master switch continuity, verify battery voltage ($\ge 6.0\text{V}$), check for blown fuses or reversed polarity.
2. **Motors Buzz But Don't Spin:** Low battery voltage; insufficient PWM duty cycle ($< 120$); motor shaft mechanically jammed or binding against chassis.
3. **Robot Veers Left When Commanded Straight:** TT gearmotors have slight mechanical variance; calibrate PWM trims in firmware (\`analogWrite(ENA, speed + 15)\`).
4. **Ultrasonic Sensor Reads 0cm or 1100cm Constantly:** Loose Trigger/Echo jumpers; missing $5\text{V}$ power; sensor facing an acoustically soft/angled target.
5. **Microcontroller Resets During Heavy Turns:** Motor inrush current brownout; insert $100\text{µF}$ decoupling capacitor across power rails and verify common ground.
6. **IR Line Sensors Unresponsive:** Sensor mounted too high ($> 15\text{mm}$); threshold trimmer potentiometer improperly tuned for ambient room lighting.
7. **Code Compiles But Robot Does Nothing:** Check pin number declarations in firmware against physical jumper connections.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Assembled Robot + Digital Multimeter', quantity: 1, purpose: 'Diagnostics', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s23_1',
        question: 'When troubleshooting a robot that intermittently reboots during sharp motor turns, what is the most likely root cause?',
        options: [
          'Motor stall inrush current causes battery voltage to sag below the microcontroller brownout threshold',
          'The code contains a syntax error',
          'The room is too bright',
          'The wheels have too much traction'
        ],
        correctIndex: 0,
        explanation: 'Rapid motor acceleration draws peak current, dropping battery voltage momentarily unless decoupled or powered from separate rails.'
      }
    ],
    assignment: {
      id: 'a_s23',
      title: 'Robotics Troubleshooting Matrix & Flowchart',
      description: 'Create a comprehensive troubleshooting decision tree for the 7 common robotics failure modes.',
      instructions: ['Structure as a logical IF/THEN diagnostic flowchart.', 'Include multimeter test points for each branch.'],
      deliverables: ['Troubleshooting decision tree PDF/Image']
    },
    miniProject: {
      id: 'p_s23',
      title: 'Fault Isolation Simulation Exercise',
      description: 'Diagnose and fix 3 deliberate hardware faults in a peer’s robot or simulated testbed using the 6-step protocol.',
      objectives: ['Documented observation and test logs.', 'Verified repair proof.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'NASA Systems Engineering Debugging Handbook', url: 'https://www.nasa.gov/', type: 'doc' }
    ]
  },
  {
    id: 'P03',
    levelNumber: 5,
    order: 26,
    title: 'Physical Laboratory: Robot Testing & Debugging Assessment',
    subtitle: 'Hands-on Controlled Fault Isolation, Track Calibration & Speed Tuning',
    type: 'physical_lab',
    part: 'Robotics & Hardware',
    durationMinutes: 90,
    prerequisites: ['S23'],
    learningObjective: 'Diagnose and repair controlled hardware and firmware faults introduced by instructors, then pass a multi-obstacle navigation course.',
    whyLearnThis: 'This physical lab assessment certifies your autonomy as an independent Robot Engineer.',
    whatYouWillBuild: 'A tuned, fault-tolerant, battle-tested autonomous mobile robot platform.',
    whatYouWillSubmit: 'Lab completion log, diagnostic record, and video passing the final evaluation track.',
    innovatorContribution: 'Demonstrates real-world engineering competence and diagnostic independence.',
    video_url: 'https://www.youtube.com/watch?v=0yD3uBshJB0',
    video_duration_seconds: 600,
    reading_markdown: `# Robot Testing & Debugging Lab Assessment (P03)

### Assessment Protocol:
1. **The Diagnostic Challenge:** An instructor introduces 2 unknown faults (e.g. reversed motor polarity, disconnected ground, miscalibrated sensor threshold, or software deadlock).
2. **The Timer Starts:** You have 30 minutes to identify, document, and fix both faults using a multimeter and serial diagnostics.
3. **The Course Run:** Complete 2 full laps of the combined obstacle-avoidance and line-following arena without assistance.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Assembled Robot + Multimeter + Track Arena', quantity: 1, purpose: 'Practical assessment', inStarterKit: true }
    ],
    quizPassingScore: 75,
    quizQuestions: [
      {
        id: 'q_p03_1',
        question: 'What is the first step when a robot unexpectedly stops moving during a field trial?',
        options: [
          'Observe indicators: check power LEDs, measure battery voltage, and monitor serial output to isolate whether it is power, firmware, or mechanical',
          'Shake the robot vigorously',
          'Delete all code on the computer',
          'Disconnect the wheels'
        ],
        correctIndex: 0,
        explanation: 'Systematic observation of power indicators and telemetry immediately isolates whether the issue is electrical, computational, or mechanical.'
      }
    ],
    assignment: {
      id: 'a_p03',
      title: 'P03 Lab Assessment Diagnostic Log',
      description: 'Submit your step-by-step diagnostic log identifying the injected faults, multimeter measurements, and permanent fixes applied.',
      instructions: ['Include before-and-after sensor/voltage readings.', 'Provide instructor sign-off.'],
      deliverables: ['Lab Assessment Sheet PDF and course run video']
    },
    miniProject: {
      id: 'p_p03',
      title: 'Arena Course Qualification Run',
      description: 'Record an unbroken video demonstrating your robot navigating the official qualification track combining a black line with sudden obstacle blocks.',
      objectives: ['Seamless switch between line following and obstacle evasion.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'YARA Arena Competition Regulations 2026', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  }
];
