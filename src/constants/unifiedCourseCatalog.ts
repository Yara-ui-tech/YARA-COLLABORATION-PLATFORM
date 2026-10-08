import { UnifiedCourse } from '../types/unifiedCourseTypes';

export const UNIFIED_CANONICAL_COURSES: UnifiedCourse[] = [
  // ==========================================================================
  // TRACK 1: YARA ROBOTICS ACADEMY
  // ==========================================================================
  {
    id: 'yara-rob-level1',
    code: 'YARA-ROB-BEG',
    title: 'Robotics Foundations & Embedded Systems (Tier 1 • Beginner)',
    slug: 'robotics-foundations-beginner',
    version: '1.0',
    track: 'robotics_academy',
    category: 'robotics_beginner',
    level: 'Beginner',
    tierNumber: 1,
    shortSummary: 'Master electrical circuits, Ohm’s law, breadboarding, microcontrollers, and actuator kinematics from first principles.',
    description: 'A comprehensive beginner robotics engineering curriculum. Build working automated robots from first principles, master solderless breadboarding, C++ microcontroller firmware, and bench troubleshooting before defending an African community problem-solving capstone.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    instructorName: 'Simbarashe Manongwa',
    instructorTitle: 'Executive Director & Founder, YARA',
    estimatedDurationHours: 24,
    totalModulesCount: 6,
    hardwareRequired: ['Arduino Uno / Nano Starter Kit', 'Half-size Breadboard', 'Digital Multimeter', 'HC-SR04 Ultrasonic Sensor', '2x DC Motors & L298N Driver', '9V / 7.4V Battery Pack'],
    learningOutcomes: [
      'Understand electrical circuit theory, voltage, current, and Ohm’s Law calculations',
      'Wire and test clean solderless breadboard circuits with pull-down resistors',
      'Flash bare-metal firmware to ATmega328P and ESP32 microcontrollers',
      'Interface analog and digital sensors with debounced logic',
      'Build an autonomous mobile rover with obstacle avoidance'
    ],
    prerequisites: ['Age 10+ or adult beginner', 'Basic curiosity to build physical hardware'],
    accessRule: 'membership_required',
    membershipRequired: true,
    certificationEnabled: true,
    certificationTitle: 'YARA Certificate of Technical Competence in Beginner Robotics',
    certificationFeeUsd: 0,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 342,
    rating: 4.95,
    modules: [
      {
        id: 'rob1-m1',
        courseId: 'yara-rob-level1',
        moduleNumber: 1,
        order: 1,
        title: 'Anatomy of a Robot & Electrical Safety',
        coherentSkillArea: 'Systems Engineering & Bench Safety',
        description: 'Understand the core anatomy of any robot: sensors (inputs), compute (logic), and actuators (outputs).',
        durationMinutes: 45,
        theoryOverview: 'Every robot operates as a cyber-physical system. It perceives the real world via sensor transducers, processes inputs with embedded algorithmic logic, and acts upon its physical environment through actuators. Electrical safety is foundational: never short power rails, always verify ground continuity, and calculate current limits before energizing circuits.',
        theoryKeyConcepts: ['Closed-Loop Robotics vs Open-Loop Timers', 'Current, Voltage & Resistance Definitions', 'Bench Static & Short Circuit Protection'],
        videoUrl: 'https://www.youtube.com/watch?v=0hYg4q6MvdE',
        videoTitle: 'Core Anatomy of Modern Robots (5 mins)',
        videoDurationSeconds: 320,
        resources: [
          {
            id: 'res-rob1-m1-1',
            title: 'Robotics Systems Architecture Handout (PDF)',
            type: 'pdf',
            fileUrl: '/resources/robotics-architecture.pdf',
            description: '1-Page printable block diagram template'
          }
        ],
        guidedLab: {
          id: 'lab-rob1-m1',
          title: 'Lab 1: Consumer Device Reverse-Engineering & Block Diagramming',
          objective: 'Identify and diagram input sensors, logic processors, and output actuators in a real-world electronic device.',
          equipment: ['Multimeter', 'Sample electronic device or starter breadboard', 'Engineering Notebook'],
          safetyRules: ['Ensure power is disconnected before inspection', 'Wear safety glasses'],
          simulationUrl: 'https://wokwi.com',
          instructions: '1. Choose an automated mechanism (e.g. microwave turntable, automatic dispenser, or disk drive). 2. Map power source, sensing triggers, microchip controller, and motor/actuator output. 3. Document continuous feedback loop in notebook.',
          expectedResult: 'A verified 4-block systems diagram depicting closed-loop sensing and physical actuation.',
          troubleshootingTips: ['If device has no active sensing feedback, it is a timer, not a robot!']
        },
        assignment: {
          id: 'asg-rob1-m1',
          title: 'Practical Assignment 1: Systems Architecture for African Borehole Automation',
          instructions: 'Draw a formal system block diagram for an automated solar borehole pump with water level sensing and dry-run safety shutoff. Submit PDF or diagram image.',
          rubric: [
            { criteria: 'Power distribution and ground clarity', points: 30 },
            { criteria: 'Sensor input transducer identification', points: 35 },
            { criteria: 'Actuator output isolation (relay/MOSFET)', points: 35 }
          ],
          maxPoints: 100,
          submissionRequirements: ['Systems block diagram image or PDF', '150-word engineering justification']
        },
        quizQuestions: [
          {
            id: 'q-rob1-m1-1',
            question: 'What distinguishes a true robot from a basic automated timer?',
            options: [
              'A robot must have a color touchscreen',
              'A robot dynamically perceives its environment via sensors and alters its physical actions',
              'A robot always uses AC mains voltage',
              'A robot is made entirely of metal'
            ],
            correctIndex: 1,
            explanation: 'Robots are defined by closed-loop feedback: sensing the environment and dynamically deciding outputs.'
          }
        ],
        troubleshootingGuide: 'When diagnosing a non-responsive system, always isolate Power first. Measure voltage with a DMM across VCC and GND before checking microcontroller code.',
        mentorSupportTopic: 'Systems block diagramming and power budget calculations'
      },
      {
        id: 'rob1-m2',
        courseId: 'yara-rob-level1',
        moduleNumber: 2,
        order: 2,
        title: 'Ohm’s Law, Multimeters & Breadboard Prototyping',
        coherentSkillArea: 'Circuit Fundamentals & Breadboarding',
        description: 'Calculate voltage, current, and resistance using Ohm’s law, and build clean solderless breadboard circuits.',
        durationMinutes: 60,
        theoryOverview: 'Ohm’s Law (V = I * R) is the fundamental equation of electrical engineering. Connecting an LED directly across 5V causes catastrophic overcurrent; a series current-limiting resistor is mandatory. Breadboards enable solderless prototyping through interconnected terminal strips and continuous power distribution rails.',
        theoryKeyConcepts: ['Ohm’s Law Formula (V = I * R)', 'LED Forward Voltage Drop & Current Limits', 'Breadboard Internal Contact Architecture'],
        videoUrl: 'https://www.youtube.com/watch?v=8jB8hEDLk5A',
        videoTitle: 'Ohm’s Law & Bench Electrical Safety (6 mins)',
        videoDurationSeconds: 380,
        resources: [
          {
            id: 'res-rob1-m2-1',
            title: 'Resistor Color Code Quick Reference Card',
            type: 'schematic',
            fileUrl: '/resources/resistor-chart.png'
          }
        ],
        guidedLab: {
          id: 'lab-rob1-m2',
          title: 'Lab 2: Resistor Validation & LED Current Limiting',
          objective: 'Measure 5 resistors with a multimeter, wire an LED circuit, and verify current consumption matches Ohm’s Law calculation.',
          equipment: ['Half-size Breadboard', 'Multimeter', 'Red LED', '330Ω, 1kΩ, 10kΩ resistors', '5V Power Supply'],
          safetyRules: ['Do not short power rails', 'Confirm resistor value before powering LED'],
          simulationUrl: 'https://www.falstad.com/circuit/',
          instructions: '1. Calculate required resistor for Red LED at 15mA from 5V source: (5V - 2.0V) / 0.015A = 200Ω. Choose standard 220Ω or 330Ω. 2. Measure actual resistance with DMM in Ω mode. 3. Wire circuit on breadboard and verify LED illumination.',
          expectedResult: 'LED illuminates cleanly with approximately 9–14mA forward current draw without overheating.',
          troubleshootingTips: ['If LED does not light, invert polarity: long leg is positive anode, flat edge is cathode.']
        },
        assignment: {
          id: 'asg-rob1-m2',
          title: 'Practical Assignment 2: Resistor Calculation & Bench Photo',
          instructions: 'Submit your mathematical calculation for a 5V LED circuit with a 10mA target current, plus a clear photograph of your breadboarded circuit validated with a multimeter.',
          rubric: [
            { criteria: 'Mathematical Ohm’s Law derivation', points: 40 },
            { criteria: 'Clean breadboard wiring (Red=VCC, Black=GND)', points: 30 },
            { criteria: 'Multimeter measurement evidence', points: 30 }
          ],
          maxPoints: 100,
          submissionRequirements: ['Clear photo of breadboard circuit', 'Calculation working notes']
        },
        quizQuestions: [
          {
            id: 'q-rob1-m2-1',
            question: 'If a 5V supply powers an LED with forward voltage 2.0V, what series resistor is required for 15mA current?',
            options: ['20Ω', '200Ω', '2,000Ω', '200kΩ'],
            correctIndex: 1,
            explanation: 'R = (V_supply - V_led) / I = (5 - 2) / 0.015 = 3 / 0.015 = 200 Ohms.'
          }
        ],
        troubleshootingGuide: 'Multimeter reading 0L or Erratic: Ensure probes are securely seated in COM and V/Ω ports. Never measure resistance while power is actively turned on.',
        mentorSupportTopic: 'LED current calculation and multimeter operation'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'yara-rob-level2',
    code: 'YARA-ROB-INT',
    title: 'Autonomous Systems, PID Control & Chassis Mechanics (Tier 2 • Intermediate)',
    slug: 'autonomous-systems-intermediate',
    version: '1.0',
    track: 'robotics_academy',
    category: 'robotics_intermediate',
    level: 'Intermediate',
    tierNumber: 2,
    shortSummary: 'Master closed-loop PID control algorithms, magnetic wheel encoders, state machines, and precision rover navigation.',
    description: 'An engineering-grade intermediate robotics course. Master differential drive kinematics, rotary encoder tick counting, Proportional-Integral-Derivative (PID) motor control loops, non-blocking finite state machines, and I2C/SPI sensor fusion.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    instructorName: 'Simbarashe Manongwa',
    instructorTitle: 'Executive Director & Founder, YARA',
    estimatedDurationHours: 36,
    totalModulesCount: 6,
    hardwareRequired: ['ESP32 NodeMCU', '2x DC Motors with Magnetic Quadrature Encoders', 'L298N or TB6612FNG Driver', 'MPU6050 6-DOF IMU', '7.4V 2S LiPo Battery', 'Logic Level Shifter'],
    learningOutcomes: [
      'Implement PID control loops to regulate motor RPM under dynamic mechanical load',
      'Decode quadrature encoder pulses using hardware interrupts',
      'Structure clean firmware using non-blocking Finite State Machines (FSM)',
      'Perform sensor fusion using I2C digital IMU accelerometer and gyroscope data',
      'Design differential drive kinematics for accurate point-to-point navigation'
    ],
    prerequisites: ['Completion of Tier 1 or equivalent embedded C++ experience'],
    accessRule: 'membership_required',
    membershipRequired: true,
    certificationEnabled: true,
    certificationTitle: 'YARA Certificate of Technical Competence in Autonomous Systems',
    certificationFeeUsd: 0,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 198,
    rating: 4.92,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'yara-rob-level3',
    code: 'YARA-ROB-ADV',
    title: 'ROS 2, Edge Computer Vision & Aquatic ROVs (Tier 3 • Advanced)',
    slug: 'ros2-computer-vision-advanced',
    version: '1.0',
    track: 'robotics_academy',
    category: 'robotics_advanced',
    level: 'Advanced',
    tierNumber: 3,
    shortSummary: 'Master Robot Operating System (ROS 2), edge OpenCV object detection, LiDAR SLAM, and underwater drone buoyancy design.',
    description: 'Elite advanced robotics specialization preparing engineers for industrial autonomous rovers, underwater inspection ROVs, and national championship arenas. Covers embedded Linux, ROS 2 pub/sub nodes, OpenCV computer vision, 2D LiDAR SLAM mapping, and underwater pressure seals.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80',
    instructorName: 'Simbarashe Manongwa',
    instructorTitle: 'Executive Director & Founder, YARA',
    estimatedDurationHours: 48,
    totalModulesCount: 8,
    hardwareRequired: ['Raspberry Pi 4 / 5 (4GB+)', 'RPLiDAR A1M8 360° Scanner', 'Wide-Angle Camera Module', '6-DOF Robotic Arm Kit or Underwater Thrusters', 'LiFePO4 Power System'],
    learningOutcomes: [
      'Write ROS 2 Humble C++ & Python publisher/subscriber nodes and services',
      'Stream camera frames and execute real-time OpenCV color mask & shape tracking',
      'Generate 2D occupancy grid maps using Cartographer LiDAR SLAM',
      'Calculate underwater ROV center of buoyancy vs center of gravity stability',
      'Implement fail-safe watchdog timers and industrial emergency stop protocols'
    ],
    prerequisites: ['Completion of Tier 2 or solid Linux & C++ background'],
    accessRule: 'membership_required',
    membershipRequired: true,
    certificationEnabled: true,
    certificationTitle: 'YARA Advanced Robotics & Autonomous Systems Engineering Master Certificate',
    certificationFeeUsd: 0,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 114,
    rating: 4.98,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ==========================================================================
  // TRACK 2: TECHNOLOGY & PROGRAMMING
  // ==========================================================================
  {
    id: 'yara-tech-python',
    code: 'YARA-TECH-PY101',
    title: 'Python for Robotics, Automation & Edge Compute',
    slug: 'python-for-robotics',
    version: '1.0',
    track: 'technology',
    category: 'python',
    level: 'Beginner',
    shortSummary: 'Learn Python from scratch through practical hardware control, pyserial scripts, data logging, and algorithmic thinking.',
    description: 'A purpose-built Python programming course designed for African innovators. Move beyond dry syntax into real-world utility: parse sensor telemetry, communicate with microcontrollers over USB serial, plot real-time sensor curves, and build automation bots.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    instructorName: 'YARA Engineering Faculty',
    instructorTitle: 'Lead Software Educator',
    estimatedDurationHours: 16,
    totalModulesCount: 5,
    hardwareRequired: ['Computer running Windows, Mac, or Linux', 'Optional Arduino or micro:bit for serial labs'],
    learningOutcomes: [
      'Write and debug Python 3 scripts with functions, dictionaries, and modules',
      'Read and parse live serial telemetry streams from microcontrollers',
      'Process CSV sensor logs and plot graphical performance charts with matplotlib',
      'Build an automated computer vision color-tracking script'
    ],
    prerequisites: ['Basic computer literacy'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA Certified Python Developer for Robotics',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 489,
    rating: 4.88,
    modules: [
      {
        id: 'py-m1',
        courseId: 'yara-tech-python',
        moduleNumber: 1,
        order: 1,
        title: 'Python Setup, Syntax & Algorithmic Logic',
        coherentSkillArea: 'Python Fundamentals & Script Execution',
        description: 'Install Python, configure VS Code, and master variables, conditionals, and loops.',
        durationMinutes: 40,
        theoryOverview: 'Python is an interpreted, high-level language revered for readability and vast scientific libraries. For robotics, Python serves as the supreme glue language: binding high-level computer vision, cloud telemetry, and serial command pipelines.',
        theoryKeyConcepts: ['Interpreted Execution Model', 'Dynamic Typing & Data Structures', 'Algorithmic Flow: Loops and Branches'],
        videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        videoTitle: 'Python in Robotics: Fast Start (7 mins)',
        videoDurationSeconds: 420,
        resources: [
          {
            id: 'res-py-m1-1',
            title: 'Python 3 Quick Syntax Cheat Sheet (PDF)',
            type: 'pdf',
            fileUrl: '/resources/python-cheatsheet.pdf'
          }
        ],
        guidedLab: {
          id: 'lab-py-m1',
          title: 'Lab 1: Autonomous Decision Engine Script',
          objective: 'Write a Python program that simulates a robot rover scanning sensor distances and deciding navigation moves.',
          equipment: ['Python 3.10+ installed', 'Code editor (VS Code / Thonny)'],
          safetyRules: ['Use virtual environments for dependency management'],
          instructions: '1. Create rover_sim.py. 2. Define a function calculate_move(front_dist, left_dist, right_dist). 3. If front_dist < 20cm, choose direction with greatest clearance. 4. Run through 10 test vectors.',
          expectedResult: 'Python script correctly outputs navigation decision for all sensor scenarios without errors.',
          troubleshootingTips: ['IndentationError: Remember Python enforces consistent 4-space indentation!']
        },
        assignment: {
          id: 'asg-py-m1',
          title: 'Assignment 1: Telemetry Parser Script',
          instructions: 'Write a Python script that accepts a raw sensor string e.g. "TEMP:28.4;HUM:65;VOLT:7.2" and parses it into a clean Python dictionary with float conversions.',
          rubric: [
            { criteria: 'Correct string splitting & parsing logic', points: 40 },
            { criteria: 'Error handling for malformed data', points: 30 },
            { criteria: 'Clean PEP8 code style', points: 30 }
          ],
          maxPoints: 100,
          submissionRequirements: ['Clean .py script or GitHub gist link']
        },
        quizQuestions: [
          {
            id: 'q-py-m1-1',
            question: 'Which Python data structure stores key-value pairs ideal for sensor telemetry?',
            options: ['List', 'Tuple', 'Dictionary', 'Set'],
            correctIndex: 2,
            explanation: 'Dictionaries store key-value mappings e.g. {"temperature": 28.4, "battery": 7.4}.'
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'yara-tech-scratch',
    code: 'YARA-TECH-SCRATCH',
    title: 'Scratch Block Coding for Junior Robotics & Game Physics',
    slug: 'scratch-block-coding-robotics',
    version: '1.0',
    track: 'technology',
    category: 'scratch',
    level: 'Beginner',
    shortSummary: 'Visual drag-and-drop block coding for young innovators (ages 8–14) to control robot sprites and learn algorithmic logic.',
    description: 'An interactive, visual learning pathway using MIT Scratch. Young African learners create animated robots, navigate virtual mazes, program obstacle avoidance logic, and master sequencing, loops, variables, and event-driven triggers.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80',
    instructorName: 'YARA STEM Mentors',
    instructorTitle: 'Junior Robotics Specialist',
    estimatedDurationHours: 10,
    totalModulesCount: 4,
    hardwareRequired: ['Any browser on computer or tablet'],
    learningOutcomes: [
      'Understand sequencing, conditionals, and loops visually',
      'Program sprite collision physics and maze navigation',
      'Create interactive multi-level robotics games',
      'Share and remix Scratch projects in the YARA community'
    ],
    prerequisites: ['None. Perfect for complete beginners!'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA Junior Scratch Coding Certificate',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 612,
    rating: 4.96,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'yara-tech-javascript',
    code: 'YARA-TECH-JS101',
    title: 'JavaScript & Web Dashboards for IoT Robotics',
    slug: 'javascript-web-robotics',
    version: '1.0',
    track: 'technology',
    category: 'javascript',
    level: 'Intermediate',
    shortSummary: 'Build browser-based telemetry dashboards, WebSockets motor controls, and responsive robotics interfaces with HTML, CSS & JavaScript.',
    description: 'Learn modern JavaScript and web technologies to monitor and control physical robots over Wi-Fi. Build interactive gauges, live battery monitors, and virtual joystick controllers that run smoothly on smartphones and laptops.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?auto=format&fit=crop&w=800&q=80',
    instructorName: 'YARA Engineering Faculty',
    instructorTitle: 'Web Systems & Telemetry Lead',
    estimatedDurationHours: 20,
    totalModulesCount: 5,
    hardwareRequired: ['Web browser and code editor'],
    learningOutcomes: [
      'Master DOM manipulation, event listeners, and asynchronous fetch APIs',
      'Establish WebSocket connections to ESP32 microcontrollers',
      'Render live canvas gauges for sensor telemetry',
      'Build a mobile-friendly virtual joystick touch controller'
    ],
    prerequisites: ['Basic HTML knowledge or completed introductory programming'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA Web Telemetry & IoT Dashboard Developer Certificate',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: false,
    enrolledCount: 231,
    rating: 4.85,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'yara-tech-iot',
    code: 'YARA-TECH-IOT',
    title: 'IoT Telemetry, MQTT & Cloud Microcontrollers (ESP32)',
    slug: 'iot-telemetry-esp32-cloud',
    version: '1.0',
    track: 'technology',
    category: 'iot',
    level: 'Intermediate',
    shortSummary: 'Connect physical robots and environmental sensors to cloud dashboards using ESP32 Wi-Fi and lightweight MQTT protocols.',
    description: 'Bridge physical hardware with the global cloud. Program ESP32 microcontrollers to establish secure Wi-Fi connections, publish sensor telemetry over lightweight MQTT topics, subscribe to remote actuation commands, and handle intermittent rural network dropouts.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80',
    instructorName: 'YARA Engineering Faculty',
    instructorTitle: 'IoT Telemetry Specialist',
    estimatedDurationHours: 18,
    totalModulesCount: 5,
    hardwareRequired: ['ESP32 NodeMCU board', 'DHT11/22 or BME280 sensor', 'Breadboard and USB cable'],
    learningOutcomes: [
      'Configure ESP32 Wi-Fi station mode with automatic reconnect logic',
      'Publish telemetry packets to MQTT brokers (HiveMQ / Mosquitto)',
      'Design bidirectional remote control architectures with fail-safe timeouts',
      'Store offline telemetry in onboard flash memory during power or network outages'
    ],
    prerequisites: ['Basic microcontroller and C++ or MicroPython understanding'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA Certified IoT Systems Engineer',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 174,
    rating: 4.9,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ==========================================================================
  // TRACK 3: STEM EDUCATION & PEDAGOGY
  // ==========================================================================
  {
    id: 'ai-for-educators',
    code: 'YARA-STEM-AI-EDU',
    title: 'AI for Educators & Robotics Patrons Pedagogy Masterclass',
    slug: 'ai-for-educators-masterclass',
    version: '1.0',
    track: 'stem',
    category: 'stem_education',
    level: 'Intermediate',
    shortSummary: 'Empower STEM teachers and robotics patrons with practical AI lesson planning, rubric automation, lab coaching, and championship prep.',
    description: 'The national benchmark certification for African primary and secondary school educators. Master prompt engineering for ZIMSEC and Cambridge STEM lesson plans, generate cognitive rubric assessments, provision low-cost school robotics labs, and mentor championship robotics teams.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    instructorName: 'Simbarashe Manongwa & T. Chiambiro',
    instructorTitle: 'Executive Director & Regional President, YARA',
    estimatedDurationHours: 16,
    totalModulesCount: 5,
    hardwareRequired: ['Computer or tablet with internet access'],
    learningOutcomes: [
      'Write structured prompts that generate differentiated 45-minute STEM lesson plans aligned with national curricula',
      'Automate tiered student assessments with Bloom’s taxonomy diagnostic rubrics',
      'Establish a low-cost, high-safety school robotics lab with salvage parts and standard kits',
      'Coach balanced student teams (2 Boys + 2 Girls) for national robotics championships',
      'Conduct 5 Whys root cause problem analysis to inspire community capstones'
    ],
    prerequisites: ['Primary / Secondary teacher, school administrator, or STEM patron designation'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA National Accredited Masterclass Certificate in AI & Robotics Pedagogy',
    certificationFeeUsd: 10,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 520,
    rating: 4.97,
    modules: [
      {
        id: 'aiedu-m1',
        courseId: 'ai-for-educators',
        moduleNumber: 1,
        order: 1,
        title: 'Cognitive Prompt Engineering & Lesson Plan Automation',
        coherentSkillArea: 'AI-Assisted Lesson Planning',
        description: 'Learn the 5-point prompt architecture to generate structured schemes of work and active learning activities.',
        durationMinutes: 45,
        theoryOverview: 'Generic AI prompts generate superficial, disjointed classroom plans. Professional educators use Role-Context-Constraint-Output prompting. Specifying grade level, student prior knowledge, local cultural contexts, and concrete formative assessment milestones transforms generative AI into an elite teaching assistant.',
        theoryKeyConcepts: ['5-Point Prompt Framework (Role, Task, Context, Constraints, Format)', 'Differentiation for Mixed-Ability Classrooms', 'Curriculum Mapping (ZIMSEC, Cambridge, IB)'],
        videoUrl: 'https://www.youtube.com/watch?v=0hYg4q6MvdE',
        videoTitle: 'Prompt Engineering for African Educators (6 mins)',
        videoDurationSeconds: 360,
        resources: [
          {
            id: 'res-aiedu-m1-1',
            title: 'Educator Prompt Handbook & Master Templates (PDF)',
            type: 'pdf',
            fileUrl: '/resources/educator-prompt-handbook.pdf'
          }
        ],
        guidedLab: {
          id: 'lab-aiedu-m1',
          title: 'Lab 1: Drafting a Differentiated 45-Minute Robotics Lesson',
          objective: 'Synthesize a complete 45-minute lesson plan on Ohm’s Law and Circuit Safety with 3 levels of student scaffolding.',
          equipment: ['Computer with browser'],
          safetyRules: ['Verify AI outputs for technical and factual correctness'],
          instructions: '1. Select a STEM topic. 2. Apply the YARA Prompt Template. 3. Include starter activity, hands-on breadboard phase, plenary reflection, and homework challenge. 4. Verify safety warnings.',
          expectedResult: 'A fully formatted lesson plan with clear timing, safety rules, and rubric criteria.',
          troubleshootingTips: ['If AI outputs too much generic text, enforce strict time limit constraints (e.g. max 45 mins).']
        },
        assignment: {
          id: 'asg-aiedu-m1',
          title: 'Assignment 1: Submit Your Automated Scheme of Work',
          instructions: 'Submit a 1-week scheme of work for an introductory STEM module created with prompt engineering and tailored to your school context.',
          rubric: [
            { criteria: 'Pedagogical structure and lesson sequence', points: 40 },
            { criteria: 'Formative assessment integration', points: 30 },
            { criteria: 'Local context relevance & practical lab safety', points: 30 }
          ],
          maxPoints: 100,
          submissionRequirements: ['Document upload or PDF of lesson plan']
        },
        quizQuestions: [
          {
            id: 'q-aiedu-m1-1',
            question: 'What is the most critical component when engineering prompts for lesson plan synthesis?',
            options: [
              'Using very long sentences',
              'Explicitly defining Role, Context, Pedagogical Constraints, and Expected Output Format',
              'Asking the AI to write jokes',
              'Using only capital letters'
            ],
            correctIndex: 1,
            explanation: 'Defining role, context, pedagogical constraints, and structured output format guarantees high-rigor, classroom-ready materials.'
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'patron-coaching',
    code: 'YARA-STEM-PATRON',
    title: 'School Robotics Club Formation & Championship Coaching',
    slug: 'school-robotics-club-patron-coaching',
    version: '1.0',
    track: 'stem',
    category: 'stem_education',
    level: 'Beginner',
    shortSummary: 'Step-by-step roadmap for teachers and school heads to launch a thriving YARA school robotics club, manage hardware kits, and win championships.',
    description: 'Everything required to establish an accredited YARA Robotics Club within your school. Learn club constitution drafting, low-cost kit procurement, gender-balanced team recruitment (2 Boys + 2 Girls), arena rules interpretation, and pitch defense coaching.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    instructorName: 'T. Chiambiro',
    instructorTitle: 'Regional President, YARA',
    estimatedDurationHours: 12,
    totalModulesCount: 4,
    hardwareRequired: ['Standard school classroom and starter kit'],
    learningOutcomes: [
      'Draft a formal school club constitution and secure administrative authorization',
      'Recruit gender-balanced championship teams adhering to the 2 Boys + 2 Girls national rule',
      'Manage tool and component inventories with strict student accountability protocols',
      'Coach students in the 90-second innovation pitch defense before corporate judges'
    ],
    prerequisites: ['Teacher, school administrator, or STEM coach'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA Certified Robotics Club Patron & Coach',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: false,
    enrolledCount: 142,
    rating: 4.93,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ==========================================================================
  // TRACK 4: SPECIALIZED & INDUSTRIAL PROGRAMMES
  // ==========================================================================
  {
    id: 'yara-industrial-plc',
    code: 'YARA-IND-PLC',
    title: 'Industrial Automation, PLC Programming & SCADA Telemetry',
    slug: 'industrial-automation-plc-scada',
    version: '1.0',
    track: 'specialized',
    category: 'industrial_automation',
    level: 'Advanced',
    shortSummary: 'Master Programmable Logic Controllers (PLCs), Ladder Logic programming, industrial 24V sensors, and SCADA supervision.',
    description: 'Step into industrial manufacturing, mining automation, and agricultural processing plants. Learn IEC 61131-3 Ladder Logic programming, 24V DC industrial optocoupled sensor interfacing, solenoid valves, variable frequency drives (VFDs), and SCADA monitoring screens.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    instructorName: 'YARA Industrial Faculty',
    instructorTitle: 'Automation & Controls Engineer',
    estimatedDurationHours: 30,
    totalModulesCount: 6,
    hardwareRequired: ['Computer running OpenPLC / Factory I/O simulator'],
    learningOutcomes: [
      'Program PLCs using standard Ladder Diagram (LD) and Structured Text (ST)',
      'Wire industrial 24V PNP/NPN proximity sensors and safety emergency relays',
      'Configure Modbus TCP/RTU communication between PLCs and SCADA displays',
      'Implement fail-safe industrial interlocks for hazardous machinery'
    ],
    prerequisites: ['Basic electrical and logic gates familiarity'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA Certified Industrial Automation & PLC Specialist',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: true,
    enrolledCount: 88,
    rating: 4.91,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'yara-cad-pcb',
    code: 'YARA-ENG-CAD',
    title: 'CAD 3D Modeling & KiCad PCB Hardware Design',
    slug: 'cad-3d-modeling-kicad-pcb',
    version: '1.0',
    track: 'specialized',
    category: 'cad',
    level: 'Intermediate',
    shortSummary: 'Design custom 3D-printable robot chassis with CAD and engineer professional two-layer PCBs using open-source KiCad EDA.',
    description: 'Transform breadboard prototypes into rugged, manufactured hardware. Master parametric 3D modeling for robot brackets, wheels, and enclosures, then capture circuit schematics and route custom printed circuit boards (PCBs) ready for commercial fabrication.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    instructorName: 'YARA Engineering Faculty',
    instructorTitle: 'Hardware Prototyping Lead',
    estimatedDurationHours: 22,
    totalModulesCount: 5,
    hardwareRequired: ['Computer running Fusion 360 / FreeCAD and KiCad 8.0'],
    learningOutcomes: [
      'Create parametric 3D CAD models and export clean STL files for 3D printing',
      'Design mechanical mounting tolerances for motors, bearings, and batteries',
      'Capture schematics and assign accurate footprints in KiCad EDA',
      'Route two-layer PCB traces with ground planes and export standard Gerber fabrication packages'
    ],
    prerequisites: ['Basic electronics and circuit comprehension'],
    accessRule: 'free',
    membershipRequired: false,
    certificationEnabled: true,
    certificationTitle: 'YARA Hardware Prototyping & PCB Design Certificate',
    certificationFeeUsd: 5,
    isPublished: true,
    isDraft: false,
    isFeatured: false,
    enrolledCount: 165,
    rating: 4.94,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
