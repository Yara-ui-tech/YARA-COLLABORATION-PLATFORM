import { YARALmsSession } from '../types/yaraLms';

export const YARA_SESSIONS_LEVELS_6_TO_8: YARALmsSession[] = [
  // ==========================================
  // LEVEL 6: IoT / AI EXPLORER (S24 to S27)
  // ==========================================
  {
    id: 'S24',
    levelNumber: 6,
    order: 27,
    title: 'Introduction to IoT & Cloud Telemetry for Robotics',
    subtitle: 'ESP32 Wi-Fi/Bluetooth, MQTT, WebSockets, HTTP REST & Cloud Dashboards',
    type: 'online',
    part: 'IoT & AI',
    durationMinutes: 65,
    prerequisites: ['P03'],
    learningObjective: 'Connect an ESP32 to local Wi-Fi, publish telemetry data using MQTT and WebSockets, and visualize data on real-time dashboards.',
    whyLearnThis: 'Modern autonomous systems (drones, smart farm rovers, factory AMRs) stream telemetry to cloud mission control hubs for fleet monitoring.',
    whatYouWillBuild: 'A wireless telemetry link streaming live battery voltage, distance, and temperature data to a cloud dashboard.',
    whatYouWillSubmit: 'ESP32 Wi-Fi C++ firmware and live dashboard telemetry link/screenshot.',
    innovatorContribution: 'Expands isolated robots into connected, cloud-managed IoT edge devices.',
    video_url: 'https://www.youtube.com/watch?v=kM9ASKAni_s',
    video_duration_seconds: 780,
    reading_markdown: `# Internet of Things (IoT) in Robotics

### 1. The IoT Robotics Architecture
$$\\textbf{Robot Sensors \\& ESP32} \\xrightarrow{\\quad\\text{Wi-Fi / MQTT / WebSocket}\\quad} \\textbf{Cloud Broker / Server} \\xrightarrow{\\quad\\text{JSON}\\quad} \\textbf{Web / Mobile Dashboard}$$

### 2. MQTT (Message Queuing Telemetry Transport)
- Extremely lightweight, publish/subscribe protocol designed for low-bandwidth, high-latency wireless networks.
- **Topic Hierarchy:** e.g., \`yara/robot_01/telemetry/distance\`, \`yara/robot_01/commands/move\`.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'ESP32 Dual-Core DevKit + Wi-Fi Connection', quantity: 1, purpose: 'IoT telemetry', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s24_1',
        question: 'Why is MQTT preferred over standard HTTP POST requests for high-frequency robotics telemetry?',
        options: [
          'MQTT has minimal protocol overhead (2-byte headers), persistent connections, and publish-subscribe architecture',
          'MQTT is only available in Python',
          'HTTP is faster than the speed of light',
          'MQTT requires no internet connection'
        ],
        correctIndex: 0,
        explanation: 'MQTT was built specifically for IoT. Its lightweight pub/sub model minimizes bandwidth, latency, and power consumption.'
      }
    ],
    assignment: {
      id: 'a_s24',
      title: 'IoT Robotics Telemetry Architecture Spec',
      description: 'Design a topic hierarchy and JSON telemetry payload schema for an agricultural soil-mapping rover.',
      instructions: ['Define payload fields: timestamp, lat/lon, moisture, temp, batteryPercent.', 'Calculate bandwidth consumption per hour.'],
      deliverables: ['Telemetry schema specification PDF']
    },
    miniProject: {
      id: 'p_s24',
      title: 'ESP32 Wireless Telemetry Streamer',
      description: 'Program an ESP32 to connect to Wi-Fi and stream sensor data every 2 seconds to a cloud dashboard (Blynk, Adafruit IO, or custom dashboard).',
      objectives: ['Reliable Wi-Fi auto-reconnect logic.', 'JSON payload formatting.'],
      simulationPlatform: 'Wokwi ESP32'
    },
    resources: [
      { title: 'Adafruit IO Cloud IoT Dashboard', url: 'https://io.adafruit.com/', type: 'tool' },
      { title: 'PubSubClient MQTT Library for ESP32', url: 'https://github.com/knolleary/pubsubclient', type: 'github' }
    ]
  },
  {
    id: 'S25',
    levelNumber: 6,
    order: 28,
    title: 'Build a Complete IoT Smart Monitoring Station',
    subtitle: 'Bi-Directional Cloud Control, Remote Actuation & Mobile Web Interface',
    type: 'online',
    part: 'IoT & AI',
    durationMinutes: 70,
    prerequisites: ['S24'],
    learningObjective: 'Implement bidirectional IoT control: stream real-time telemetry from hardware and receive remote steering/actuator commands from a web app.',
    whyLearnThis: 'Allows farmers, doctors, or factory operators to supervise and steer robotic systems remotely from anywhere on the planet.',
    whatYouWillBuild: 'A complete bidirectional IoT station with live graphs and remote toggle buttons.',
    whatYouWillSubmit: 'Source code and video showing phone-controlled hardware actuation over the internet.',
    innovatorContribution: 'Creates deployable tele-operated remote robotics solutions.',
    video_url: 'https://www.youtube.com/watch?v=FCMxA3m_Imc',
    video_duration_seconds: 840,
    reading_markdown: `# Bi-Directional IoT Robotics

### Implementing Remote Command Handling
\`\`\`cpp
void mqttCallback(char* topic, byte* message, unsigned int length) {
  String messageTemp;
  for (int i = 0; i < length; i++) {
    messageTemp += (char)message[i];
  }
  
  if (String(topic) == "yara/robot_01/cmd/steer") {
    if (messageTemp == "FORWARD") driveForward();
    else if (messageTemp == "STOP") emergencyStop();
  }
}
\`\`\``,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'ESP32 + Sensors + Motor Driver / LEDs', quantity: 1, purpose: 'Bidirectional IoT node', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s25_1',
        question: 'What fail-safe mechanism must every remotely-operated IoT robot include in firmware?',
        options: [
          'A communication timeout heartbeat watchdog that automatically halts all motors if network connection is lost for >1 second',
          'A louder buzzer',
          'A feature that accelerates to maximum speed',
          'A password printed on the chassis'
        ],
        correctIndex: 0,
        explanation: 'If a Wi-Fi or cellular link drops while driving, a communication watchdog halts the robot to prevent runaway collisions.'
      }
    ],
    assignment: {
      id: 'a_s25',
      title: 'Fail-Safe Bi-Directional IoT Protocol Design',
      description: 'Write the C++ state handler and timeout watchdog for an IoT tele-operated vehicle.',
      instructions: ['Implement 1500ms watchdog timer.', 'Include remote telemetry acknowledge packets.'],
      deliverables: ['Firmware source code and protocol flow diagram']
    },
    miniProject: {
      id: 'p_s25',
      title: 'Web-Controlled Tele-Operated Rover Rig',
      description: 'Control your robot’s motors and read live sensor telemetry from a smartphone browser over Wi-Fi.',
      objectives: ['Sub-100ms response time.', 'Instant stop on browser disconnect.'],
      simulationPlatform: 'Wokwi ESP32 / Physical Bench'
    },
    resources: [
      { title: 'ESP32 Asynchronous WebServer Guide', url: 'https://github.com/me-no-dev/ESPAsyncWebServer', type: 'github' }
    ]
  },
  {
    id: 'S26',
    levelNumber: 6,
    order: 29,
    title: 'Introduction to AI, Machine Learning & Computer Vision in Robotics',
    subtitle: 'Deterministic Logic vs Neural Networks, Edge AI & Object Classification',
    type: 'online',
    part: 'IoT & AI',
    durationMinutes: 65,
    prerequisites: ['S25'],
    learningObjective: 'Understand how Machine Learning and Computer Vision differ from rule-based algorithms and explore edge AI inference in robotics.',
    whyLearnThis: 'Robots operating in complex outdoor settings (identifying ripe crops, spotting diseased leaves, recognizing people) require AI perception beyond simple proximity sensors.',
    whatYouWillBuild: 'An image classification machine learning model trained to recognize robotics components or crop types.',
    whatYouWillSubmit: 'Trained model weights/link and confusion matrix evaluation.',
    innovatorContribution: 'Equips innovators with modern artificial intelligence vision capabilities.',
    video_url: 'https://www.youtube.com/watch?v=Fhy834eF24M',
    video_duration_seconds: 780,
    reading_markdown: `# Artificial Intelligence in Robotics

### 1. Traditional Programming vs. Machine Learning
- **Traditional Programming:** $\text{Data} + \textbf{Handcrafted Rules} \longrightarrow \text{Answers}$ (e.g. \`if (dist < 20) stop();\`).
- **Machine Learning:** $\text{Data} + \textbf{Answers} \longrightarrow \textbf{Learned Rules / Model Weights}$.

### 2. Edge AI on Microcontrollers (TinyML)
- Running lightweight quantized neural network models (TensorFlow Lite for Microcontrollers) directly on microcontrollers like ESP32-S3 or Raspberry Pi for real-time inference without cloud latency.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s26_1',
        question: 'What is Edge AI in robotics?',
        options: [
          'Running artificial intelligence neural network models locally on the robot hardware without needing continuous internet access to cloud servers',
          'Only placing the robot near the edge of a table',
          'Using the oldest computer available',
          'Connecting 100 batteries together'
        ],
        correctIndex: 0,
        explanation: 'Edge AI executes neural network inference directly on the embedded device for zero-latency, private, and offline operation.'
      }
    ],
    assignment: {
      id: 'a_s26',
      title: 'Robotics AI Perception Pipeline Proposal',
      description: 'Formulate an AI vision use case for an African agricultural or waste management challenge.',
      instructions: ['Define training dataset collection strategy (at least 200 images per class).', 'Detail inference latency requirements.'],
      deliverables: ['AI Perception Specification Report']
    },
    miniProject: {
      id: 'p_s26',
      title: 'Teachable Machine Visual Classifier',
      description: 'Train a Google Teachable Machine visual model to classify 3 robotics components (LED, Resistor, Motor) and test with your webcam.',
      objectives: ['Dataset curation.', 'Model testing with novel background lighting.'],
      simulationPlatform: 'Google Teachable Machine'
    },
    resources: [
      { title: 'Google Teachable Machine Vision Tool', url: 'https://teachablemachine.withgoogle.com/', type: 'tool' },
      { title: 'Edge Impulse TinyML Platform', url: 'https://www.edgeimpulse.com/', type: 'tool' }
    ]
  },
  {
    id: 'S27',
    levelNumber: 6,
    order: 30,
    title: 'Computer Vision for Beginners: Color & Object Tracking',
    subtitle: 'Color Spaces (RGB vs HSV), Thresholding, Contours & Visual Servoing',
    type: 'online',
    part: 'IoT & AI',
    durationMinutes: 70,
    prerequisites: ['S26'],
    learningObjective: 'Implement HSV color thresholding, contour extraction, and visual servoing to steer a robot toward a detected target.',
    whyLearnThis: 'Visual servoing enables robots to track colored balls, harvest fruit, or follow visual landmarks.',
    whatYouWillBuild: 'A vision-based color tracking pipeline that outputs horizontal error offsets to steer a camera or robot.',
    whatYouWillSubmit: 'Python/OpenCV or browser vision script and video of real-time target tracking.',
    innovatorContribution: 'Enables camera-guided closed-loop mechanical steering.',
    video_url: 'https://www.youtube.com/watch?v=PW8r_e9x8pE',
    video_duration_seconds: 840,
    reading_markdown: `# Computer Vision & Color Tracking

### Why HSV Color Space Beats RGB for Vision:
- **RGB:** Hue and Brightness are mixed together. Shadows drastically change RGB values.
- **HSV (Hue, Saturation, Value):** Hue isolates the pure color wavelength ($0^\circ - 360^\circ$), making tracking resilient to indoor shadow variations.

### Visual Servoing Algorithm:
$$\text{Centroid Error } X_{err} = X_{target} - X_{image\_center}$$
$$\text{Steering Adjustment } = K_p \times X_{err}$$`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s27_1',
        question: 'Why is the HSV (Hue, Saturation, Value) color space preferred over RGB for color tracking in computer vision?',
        options: [
          'Because the Hue channel isolates the pure color independent of lighting and shadow variations',
          'Because RGB cannot produce red',
          'Because HSV runs 1000x faster',
          'Because HSV is only in black and white'
        ],
        correctIndex: 0,
        explanation: 'HSV decouples color wavelength (Hue) from lighting intensity (Value), making object tracking robust against changing ambient light.'
      }
    ],
    assignment: {
      id: 'a_s27',
      title: 'Vision-Based Visual Servoing Control Document',
      description: 'Document the mathematical transformation from 2D camera pixel coordinates $(X_p, Y_p)$ to motor differential steering commands.',
      instructions: ['Define camera resolution (e.g. 640x480).', 'Write proportional visual tracking pseudocode.'],
      deliverables: ['Mathematical specification and Python/OpenCV or block code']
    },
    miniProject: {
      id: 'p_s27',
      title: 'Webcam-Guided Color Tracker Station',
      description: 'Build a browser or Python OpenCV script that locks onto a colored object (e.g. orange ball) and draws a bounding box with real-time centroid tracking.',
      objectives: ['Stable HSV thresholding.', 'Real-time 30FPS tracking.'],
      simulationPlatform: 'Browser / OpenCV'
    },
    resources: [
      { title: 'OpenCV Computer Vision Tutorial Guide', url: 'https://opencv.org/', type: 'doc' }
    ]
  },

  // ==========================================
  // LEVEL 7: PROBLEM SOLVER (S28 to S31)
  // ==========================================
  {
    id: 'S28',
    levelNumber: 7,
    order: 31,
    title: 'Research Skills for Young Innovators',
    subtitle: 'Research Questions, Observation, Stakeholder Interviews, Primary vs Secondary Data & Referencing',
    type: 'online',
    part: 'Research & Design',
    durationMinutes: 65,
    prerequisites: ['S27'],
    learningObjective: 'Formulate rigorous research questions, conduct stakeholder field interviews, evaluate reliable sources, and reference literature without plagiarism.',
    whyLearnThis: 'Brilliant engineering applied to the wrong problem is useless. Rigorous research ensures you build what your community truly needs.',
    whatYouWillBuild: 'A field research study investigating a pressing challenge in your local community.',
    whatYouWillSubmit: 'Field research dossier including 3 stakeholder interview transcripts and synthesis summary.',
    innovatorContribution: 'Transforms technical builders into evidence-based researchers and community leaders.',
    video_url: 'https://www.youtube.com/watch?v=BYOu8rV_k_k',
    video_duration_seconds: 780,
    reading_markdown: `# Research Methodology for Hardware Innovators

### 1. Primary vs. Secondary Research
- **Primary Research:** Direct observations, physical measurements, stakeholder interviews, user surveys in the field.
- **Secondary Research:** Peer-reviewed academic journals, government reports, market data, technical datasheets.

### 2. Crafting a Strong Research Question
- *Weak:* "Are robots cool?"
- *Strong:* "How can a low-cost autonomous solar-powered rover reduce post-harvest grain losses for smallholder farmers in Mashonaland Central by at least 25%?"`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s28_1',
        question: 'Which of the following is an example of primary engineering research?',
        options: [
          'Conducting in-person interviews and soil moisture measurements with local farmers in your district',
          'Reading a random blog post online',
          'Copying a paragraph from Wikipedia without citation',
          'Guessing what users might need'
        ],
        correctIndex: 0,
        explanation: 'Primary research involves direct, firsthand empirical data collection from real users and operational environments.'
      }
    ],
    assignment: {
      id: 'a_s28',
      title: 'Community Field Research Plan & Interview Protocol',
      description: 'Formulate an actionable research question regarding a local community problem and write a 10-question interview guide for target users.',
      instructions: ['Identify target demographic.', 'Include open-ended non-leading questions.'],
      deliverables: ['Research Protocol and 3 completed interview logs']
    },
    miniProject: {
      id: 'p_s28',
      title: 'Stakeholder Insight Synthesis Deck',
      description: 'Analyze interview recordings and identify 3 recurring pain points and unmet user needs.',
      objectives: ['Data clustering.', 'Evidence-backed conclusions.'],
      simulationPlatform: 'Research Dossier'
    },
    resources: [
      { title: 'MIT OpenCourseWare: Engineering Research Methods', url: 'https://ocw.mit.edu/', type: 'doc' }
    ]
  },
  {
    id: 'S29',
    levelNumber: 7,
    order: 32,
    title: 'Problem Discovery & 5 Whys Root Cause Analysis',
    subtitle: 'Observation, Root Cause Decomposition, 5 Whys & How Might We (HMW) Statements',
    type: 'online',
    part: 'Research & Design',
    durationMinutes: 60,
    prerequisites: ['S28'],
    learningObjective: 'Apply the 5 Whys technique to dig past superficial symptoms and formulate crisp "How Might We" problem statements.',
    whyLearnThis: 'Solving symptoms produces temporary fixes. Uncovering the root cause allows your robot to create systemic long-term impact.',
    whatYouWillBuild: 'A complete 5 Whys root cause tree and formulated HMW innovation challenge statements.',
    whatYouWillSubmit: '5 Whys root cause diagram and research-backed Problem Statement document.',
    innovatorContribution: 'Guarantees the engineering effort is aimed at the highest-leverage root cause.',
    video_url: 'https://www.youtube.com/watch?v=PW8r_e9x8pE',
    video_duration_seconds: 720,
    reading_markdown: `# Root Cause Analysis & The 5 Whys

### The 5 Whys Protocol Example
- **Symptom:** Smallholder farmers lose $40\%$ of tomato crops during storage.
- *Why 1:* Temperature and humidity inside storage sheds exceed safe thresholds.
- *Why 2:* Ventilation flaps are left closed because farmers are away in the fields.
- *Why 3:* There is no automatic monitoring or actuator system to regulate airflow.
- *Why 4:* Grid electricity is unavailable and commercial imported controllers cost $>\$500$.
- *Why 5 (Root Cause):* Lack of locally-manufactured, solar-powered, affordable autonomous climate regulators.
- **HMW Statement:** *"How might we build an off-grid, low-cost solar-powered automated climate regulator using locally sourced components for under $\$30$?"*`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s29_1',
        question: 'What is the core objective of the "5 Whys" root cause analysis method?',
        options: [
          'To move past superficial surface symptoms to discover the fundamental systemic cause of a problem',
          'To interrogate the user aggressively',
          'To make the project 5 times longer',
          'To count to 5'
        ],
        correctIndex: 0,
        explanation: 'The 5 Whys peels away layers of symptoms to reveal the core technical or economic root cause.'
      }
    ],
    assignment: {
      id: 'a_s29',
      title: '5 Whys Root Cause Tree & HMW Framing Document',
      description: 'Execute the 5 Whys analysis on your selected capstone community challenge and derive 3 distinct HMW innovation vectors.',
      instructions: ['Show all 5 causal links with supporting field evidence.'],
      deliverables: ['Root cause diagram and HMW challenge statements']
    },
    miniProject: {
      id: 'p_s29',
      title: 'Validated Problem Statement Formulation',
      description: 'Write a definitive 1-page Problem Statement detailing the problem, who is affected, the quantified economic/social cost, and root causes.',
      objectives: ['Quantified impact metrics.', 'Clear target audience.'],
      simulationPlatform: 'Portfolio Document'
    },
    resources: [
      { title: 'Toyota Production System: 5 Whys Methodology', url: 'https://www.toyota-global.com/', type: 'doc' }
    ]
  },
  {
    id: 'S30',
    levelNumber: 7,
    order: 33,
    title: 'The Design Thinking Process for Robotics',
    subtitle: 'EMPATHIZE → DEFINE → IDEATE → PROTOTYPE → TEST',
    type: 'online',
    part: 'Research & Design',
    durationMinutes: 70,
    prerequisites: ['S29'],
    learningObjective: 'Master and apply the 5-stage human-centered Design Thinking methodology to robotics innovation.',
    whyLearnThis: 'World-class innovators (Stanford d.school, IDEO, Apple, YARA) use Design Thinking to ensure technical inventions delight and serve users.',
    whatYouWillBuild: 'A complete Design Thinking workbook with user personas, empathy maps, ideation brainstorms, and testing matrices.',
    whatYouWillSubmit: 'Completed 5-stage Design Thinking portfolio dossier.',
    innovatorContribution: 'Fuses human empathy with technical engineering excellence.',
    video_url: 'https://www.youtube.com/watch?v=0yD3uBshJB0',
    video_duration_seconds: 840,
    reading_markdown: `# Human-Centered Design Thinking in Robotics

$$\textbf{EMPATHIZE} \longrightarrow \textbf{DEFINE} \longrightarrow \textbf{IDEATE} \longrightarrow \textbf{PROTOTYPE} \longrightarrow \textbf{TEST}$$

### The 5 Stages:
1. **Empathize:** Immerse with target users to understand their lived experience, emotional pain points, and physical constraints.
2. **Define:** Synthesize insights into a human-centered problem statement.
3. **Ideate:** Brainstorm 50+ divergent ideas without judgment; then filter using Feasibility, Viability, and Desirability criteria.
4. **Prototype:** Build rapid, low-cost physical and simulated models to test specific assumptions.
5. **Test:** Put prototypes in users' hands, observe failures, collect feedback, and iterate.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s30_1',
        question: 'Why should you build rapid low-fidelity prototypes early in the Design Thinking process before manufacturing final hardware?',
        options: [
          'To test core user assumptions quickly and cheaply, failing fast and iterating before investing large amounts of time and money',
          'Because cardboard is heavier than metal',
          'To avoid doing programming permanently',
          'Because prototypes are never tested by users'
        ],
        correctIndex: 0,
        explanation: 'Rapid prototyping uncovers flaws in concepts early when changes cost minutes rather than months.'
      }
    ],
    assignment: {
      id: 'a_s30',
      title: 'Complete 5-Stage Design Thinking Workbook',
      description: 'Fill out the Empathy Map, 50-Idea Brainstorm matrix, and Prototype Testing Plan for your capstone innovation.',
      instructions: ['Document at least 3 divergent concepts.', 'Select the winning concept with trade-off matrix.'],
      deliverables: ['Design Thinking Dossier PDF']
    },
    miniProject: {
      id: 'p_s30',
      title: 'Low-Fidelity Cardboard & Simulation Prototype Test',
      description: 'Build a physical cardboard/mockup scale prototype of your robot enclosure and conduct a 10-minute user feedback session.',
      objectives: ['User usability testing.', 'Documented feedback log.'],
      simulationPlatform: 'Physical Bench / Cardboard Mockup'
    },
    resources: [
      { title: 'Stanford d.school Design Thinking Bootleg Guide', url: 'https://dschool.stanford.edu/resources/design-thinking-bootleg', type: 'doc' }
    ]
  },
  {
    id: 'S31',
    levelNumber: 7,
    order: 34,
    title: 'The Engineering Design Process (EDP)',
    subtitle: 'Requirements Definition, Trade-Off Matrices, Design, Simulation, Iteration & Documentation',
    type: 'online',
    part: 'Research & Design',
    durationMinutes: 70,
    prerequisites: ['S30'],
    learningObjective: 'Apply the formal Engineering Design Process: translate user needs into quantitative engineering specifications, execute trade-off analyses, and establish test protocols.',
    whyLearnThis: 'This formal engineering blueprint ensures your Capstone project is structured, measurable, and defensible.',
    whatYouWillBuild: 'A complete Engineering Requirements Document (ERD) with measurable performance metrics.',
    whatYouWillSubmit: 'Engineering Design Specification Document with verification protocols.',
    innovatorContribution: 'Bridges creative design thinking with rigorous technical engineering standards.',
    video_url: 'https://www.youtube.com/watch?v=wHkWz6Pgmso',
    video_duration_seconds: 780,
    reading_markdown: `# The Engineering Design Process (EDP)

### The 8 Steps of the EDP:
1. **Identify Problem & Objectives**
2. **Conduct Background Research**
3. **Define Quantitative Requirements:** e.g., \`Battery runtime > 4 hours\`, \`Weight < 3.5kg\`, \`Unit cost < $45\`.
4. **Generate Multiple Solutions & Trade-Off Analysis**
5. **Develop Detailed Engineering Design (CAD + Schematics + Firmware Architecture)**
6. **Build Functional Prototype**
7. **Test Against Quantitative Requirements**
8. **Iterate, Refine & Formally Document**`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s31_1',
        question: 'What is a "Quantitative Engineering Requirement"?',
        options: [
          'A precise, measurable technical specification with exact units and target numerical thresholds (e.g. "Robot must navigate at ≥ 0.5 m/s for ≥ 2 hours on a 12V 4Ah battery")',
          'A vague desire like "make it look nice"',
          'A list of component names with no numbers',
          'A motivational slogan'
        ],
        correctIndex: 0,
        explanation: 'Quantitative requirements specify measurable metrics and pass/fail thresholds against which prototypes can be objectively verified.'
      }
    ],
    assignment: {
      id: 'a_s31',
      title: 'Engineering Requirements Document (ERD) & Trade-Off Matrix',
      description: 'Write the complete ERD for your Capstone project listing at least 8 quantitative specifications across Mechanical, Electrical, Firmware, and Performance domains.',
      instructions: ['Include acceptance test criteria for each requirement.'],
      deliverables: ['Engineering Requirements Document PDF']
    },
    miniProject: {
      id: 'p_s31',
      title: 'Full Engineering Plan Synthesis',
      description: 'Combine research, 5 Whys, Design Thinking, and ERD into your complete Capstone Engineering Project Blueprint.',
      objectives: ['Aligned milestones and testing deadlines.'],
      simulationPlatform: 'Engineering Portfolio'
    },
    resources: [
      { title: 'NASA Engineering Design Process Handbook', url: 'https://www.nasa.gov/audience/foreducators/plantgrowth/reference/Eng_Design_5-12.html', type: 'doc' }
    ]
  },

  // ==============================================================
  // LEVEL 8: YOUNG INNOVATOR (S32 to S36, P04, P05)
  // ==============================================================
  {
    id: 'S32',
    levelNumber: 8,
    order: 35,
    title: 'Innovation, Entrepreneurship & Social Impact in Africa',
    subtitle: 'Value Propositions, Business Models, Unit Economics, IP Basics & Scaling',
    type: 'online',
    part: 'Innovation & Capstone',
    durationMinutes: 60,
    prerequisites: ['S31'],
    learningObjective: 'Evaluate unit economics, value propositions, intellectual property fundamentals, and business models to scale hardware innovations sustainably in African markets.',
    whyLearnThis: 'Inventions that sit in a laboratory help no one. Sustainable enterprise and local manufacturing scale your impact to thousands of people.',
    whatYouWillBuild: 'A Lean Hardware Canvas and unit economics financial breakdown for your robotics innovation.',
    whatYouWillSubmit: 'Business model canvas and 3-year social impact projection.',
    innovatorContribution: 'Transforms hardware builders into venture-ready technology entrepreneurs.',
    video_url: 'https://www.youtube.com/watch?v=0hKq_gO8jEU',
    video_duration_seconds: 720,
    reading_markdown: `# Hardware Entrepreneurship & Unit Economics

### 1. Cost of Goods Sold (COGS) vs. Retail Price
$$\text{COGS} = \text{BOM Cost} + \text{Assembly Labor} + \text{Packaging \& Shipping}$$
$$\text{Target Gross Margin} = \frac{\text{Retail Price} - \text{COGS}}{\text{Retail Price}} \times 100\% \quad (\text{Target: } 40\% - 60\%)$$

### 2. The Lean Hardware Canvas
- **Unique Value Proposition:** What quantifiable benefit does your robot deliver?
- **Customer Segments:** Who pays for it? (e.g. Cooperative farmer unions, NGOs, schools).
- **Cost Structure:** Tooling, components, certification, customer support.
- **Revenue Streams:** Direct hardware sale, hardware-as-a-service (RaaS), maintenance contracts.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s32_1',
        question: 'If your robot BOM costs $30 and assembly/packaging costs $10 (total COGS = $40), what retail price yields a 50% gross profit margin?',
        options: ['$80', '$50', '$40', '$120'],
        correctIndex: 0,
        explanation: 'Gross Margin = (Price - COGS) / Price = (80 - 40) / 80 = 40 / 80 = 50%.'
      }
    ],
    assignment: {
      id: 'a_s32',
      title: 'Lean Hardware Business Canvas & Unit Economics',
      description: 'Fill out the 9-block Lean Business Model Canvas for your Capstone and calculate break-even unit sales.',
      instructions: ['Detail customer acquisition channel in Zimbabwe / Africa.', 'Estimate social impact metrics.'],
      deliverables: ['Business Model Canvas PDF']
    },
    miniProject: {
      id: 'p_s32',
      title: 'Social Impact Projection Study',
      description: 'Model the quantifiable economic benefit delivered to 100 rural users adopting your robotics solution over a 12-month period.',
      objectives: ['Return on Investment (ROI) calculation for users.'],
      simulationPlatform: 'Portfolio Study'
    },
    resources: [
      { title: 'Strategyzer: The Business Model Canvas Guide', url: 'https://www.strategyzer.com/canvas/business-model-canvas', type: 'doc' }
    ]
  },
  {
    id: 'S33',
    levelNumber: 8,
    order: 36,
    title: 'Prototype Development, Integration & Stress Testing',
    subtitle: 'Build → Test → Collect Feedback → Improve Iteration Loops',
    type: 'online',
    part: 'Innovation & Capstone',
    durationMinutes: 75,
    prerequisites: ['S32'],
    learningObjective: 'Execute the final hardware-software integration of your Capstone prototype and conduct rigorous stress testing under realistic environmental conditions.',
    whyLearnThis: 'This is the active building sprint where your research, circuits, mechanics, and code unite into a working physical innovation.',
    whatYouWillBuild: 'Your functional, integrated Capstone prototype solving your defined problem.',
    whatYouWillSubmit: 'Prototype integration diary with 3 documented iteration cycles and stress-test data logs.',
    innovatorContribution: 'Brings your novel robotics solution into physical reality.',
    video_url: 'https://www.youtube.com/watch?v=PW8r_e9x8pE',
    video_duration_seconds: 840,
    reading_markdown: `# Prototype Integration & Stress Testing

### The 4-Step Iteration Loop:
$$\textbf{Build Prototype} \longrightarrow \textbf{Field Test Under Stress} \longrightarrow \textbf{Record Failures \& Feedback} \longrightarrow \textbf{Improve Design}$$

### Essential Stress Tests:
1. **Continuous Runtime Test:** Run system continuously for $2\times$ expected operating duration.
2. **Thermal Test:** Monitor motor driver and regulator temperatures under continuous load ($< 65^\circ\text{C}$).
3. **Vibration & Drop Resistance:** Ensure no connectors dislodge during movement over rough terrain.
4. **Boundary Condition Test:** Test sensor edge cases (direct sunlight, dark rooms, low battery voltage).`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Capstone Specific Hardware Components + Toolkit', quantity: 1, purpose: 'Capstone construction', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s33_1',
        question: 'Why is continuous stress testing under realistic field conditions essential before project showcase?',
        options: [
          'Because bench prototypes often fail when exposed to real-world vibrations, temperature swings, and prolonged battery discharge',
          'To break the robot on purpose',
          'To waste time',
          'To make the code look longer'
        ],
        correctIndex: 0,
        explanation: 'Real-world environments test thermal limits, mechanical vibration, and battery discharge curves that bench tests miss.'
      }
    ],
    assignment: {
      id: 'a_s33',
      title: 'Prototype Build Diary & Iteration Change Log',
      description: 'Document the 3 most significant design changes made between your initial prototype and your final Capstone version.',
      instructions: ['Include before/after photos and root cause explanation for each change.'],
      deliverables: ['Prototype Build Diary PDF with photos']
    },
    miniProject: {
      id: 'p_s33',
      title: 'Prototype Verification Demonstration',
      description: 'Record an uninterrupted 3-minute video showing your physical Capstone prototype performing its core automated task end-to-end.',
      objectives: ['Demonstrate sensor sensing, computation, and mechanical action.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'YARA Hardware Prototyping Standards', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  },
  {
    id: 'S34',
    levelNumber: 8,
    order: 37,
    title: 'Comprehensive 21-Point Technical Documentation',
    subtitle: 'Structuring Industry-Grade Engineering Reports, Schematics & Source Repositories',
    type: 'online',
    part: 'Innovation & Capstone',
    durationMinutes: 75,
    prerequisites: ['S33'],
    learningObjective: 'Author a professional 21-point engineering report documenting every facet of your Capstone innovation to international IEEE/ABET academic and industry standards.',
    whyLearnThis: 'Without documentation, engineering cannot be replicated, manufactured, patent-protected, or evaluated for prestigious competitions and grants.',
    whatYouWillBuild: 'The complete 21-point Technical Documentation Report for your Capstone project.',
    whatYouWillSubmit: 'Full 21-point technical report (PDF), electrical schematic, source code repo, and BOM.',
    innovatorContribution: 'Produces publishable engineering documentation of global standard.',
    video_url: 'https://www.youtube.com/watch?v=FCMxA3m_Imc',
    video_duration_seconds: 780,
    reading_markdown: `# The 21-Point Technical Documentation Standard

### Required 21 Sections:
1. **Project Title & Author Information**
2. **Executive Summary & Problem Statement**
3. **Background Research & Literature Review**
4. **Engineering Objectives & Quantitative Specs**
5. **Target Users & Beneficiaries**
6. **Proposed Solution Overview**
7. **System Architecture Block Diagram**
8. **Circuit Schematic & Power Distribution**
9. **Bill of Materials (BOM) & Cost Breakdown**
10. **Software Architecture & Source Code**
11. **Mechanical Design & CAD Drawings**
12. **Fabrication & Build Process Steps**
13. **Testing Procedure & Experimental Setup**
14. **Quantitative Results & Performance Data**
15. **Technical Challenges Encountered & Resolutions**
16. **Design Iterations & Continuous Improvements**
17. **Economic Feasibility & Cost Optimization**
18. **Social & Environmental Impact Statement**
19. **Future Work, Commercialization & Scaling**
20. **Academic References & Datasheet Citations**
21. **High-Resolution Photo Gallery & Video Links**`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s34_1',
        question: 'Why must technical documentation include a dedicated "Challenges & Improvements" section?',
        options: [
          'Because honest documentation of failure modes, design iterations, and future enhancements proves scientific rigor and engineering depth',
          'To make the student look bad',
          'Because only failed projects write reports',
          'To fill empty pages'
        ],
        correctIndex: 0,
        explanation: 'Engineers are judged on how they identify, diagnose, and systematically overcome challenges through iterative improvement.'
      }
    ],
    assignment: {
      id: 'a_s34',
      title: 'Full 21-Point Capstone Technical Report Submission',
      description: 'Compile and format all 21 mandatory sections into a polished PDF engineering report.',
      instructions: ['Adhere strictly to all 21 headings.', 'Embed clear schematics, diagrams, and formulas.'],
      deliverables: ['Final 21-Point Technical Report PDF']
    },
    miniProject: {
      id: 'p_s34',
      title: 'Open-Source Project Repository Curation',
      description: 'Assemble your firmware, schematics, 3D CAD files, and documentation into a structured GitHub repository or PDF portfolio.',
      objectives: ['Clean README.md with setup instructions.'],
      simulationPlatform: 'GitHub / PDF Portfolio'
    },
    resources: [
      { title: 'IEEE Technical Report Writing Template', url: 'https://www.ieee.org/', type: 'doc' }
    ]
  },
  {
    id: 'S35',
    levelNumber: 8,
    order: 38,
    title: 'How to Present an Engineering Project with Authority',
    subtitle: 'The 10-Point Technical Presentation Structure & Defense Technique',
    type: 'online',
    part: 'Innovation & Capstone',
    durationMinutes: 60,
    prerequisites: ['S34'],
    learningObjective: 'Structure, design, and deliver a commanding 10-point technical slide deck defending your innovation to judges, engineers, and investors.',
    whyLearnThis: 'The ability to communicate technical complexity clearly is the defining differentiator of visionary engineering leaders.',
    whatYouWillBuild: 'A high-impact 10-slide technical presentation deck.',
    whatYouWillSubmit: 'Slide deck (PDF/Slides) and recorded presentation rehearsal.',
    innovatorContribution: 'Builds executive communication and project defense mastery.',
    video_url: 'https://www.youtube.com/watch?v=kM9ASKAni_s',
    video_duration_seconds: 720,
    reading_markdown: `# The 10-Point Engineering Presentation Structure

### The 10 Compulsory Slides:
1. **Title & Vision Statement:** Hook the audience in 10 seconds.
2. **The Problem & Quantified Human Impact:** Why this matters now.
3. **Field Research & Root Cause (5 Whys):** The evidence behind your approach.
4. **Our Solution:** High-level overview and unique innovation.
5. **System Architecture & Hardware Design:** Schematics and mechanics.
6. **Firmware & Algorithmic Intelligence:** State machines and control loops.
7. **Live Prototype Demonstration:** Video of physical prototype operating.
8. **Experimental Results & Testing Data:** Measured performance vs specs.
9. **Social Impact, Unit Economics & Sourcing:** Costing and scalability.
10. **Conclusion & Future Roadmap:** What comes next.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s35_1',
        question: 'When presenting a technical robotics project to judges, what should you emphasize in the results section?',
        options: [
          'Concrete quantitative data (e.g. "Achieved 94.2% obstacle avoidance accuracy across 50 trials with 4.5 hour battery life")',
          'Only vague claims like "it works very well"',
          'Stories about why coding is hard',
          'Apologies for not finishing'
        ],
        correctIndex: 0,
        explanation: 'Engineers and judges value objective numerical metrics showing verified performance against original specifications.'
      }
    ],
    assignment: {
      id: 'a_s35',
      title: '10-Slide Capstone Technical Deck Design',
      description: 'Create a professional 10-slide presentation deck adhering strictly to the 10-point engineering structure.',
      instructions: ['Use high-contrast visuals and clean data graphs.', 'Minimize dense blocks of text.'],
      deliverables: ['10-Slide Presentation Deck PDF']
    },
    miniProject: {
      id: 'p_s35',
      title: 'Recorded Presentation Defense',
      description: 'Record yourself presenting your 10-slide deck in under 8 minutes, maintaining strong vocal projection and clarity.',
      objectives: ['Crisp timing.', 'Confident technical explanation.'],
      simulationPlatform: 'Video Rehearsal'
    },
    resources: [
      { title: 'YARA Presentation & Defense Guidelines', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  },
  {
    id: 'S36',
    levelNumber: 8,
    order: 39,
    title: 'The 90-Second High-Impact Innovation Pitch',
    subtitle: 'Hook, Problem, Solution, Demo, Impact & The Call to Action',
    type: 'online',
    part: 'Innovation & Capstone',
    durationMinutes: 55,
    prerequisites: ['S35'],
    learningObjective: 'Script, memorize, and deliver a compelling, high-energy 90-second innovation elevator pitch.',
    whyLearnThis: 'In Silicon Valley, international robotics expos, and grant competitions, you often have 90 seconds to capture an investor’s or judge’s full attention.',
    whatYouWillBuild: 'A memorable 90-second video elevator pitch showcasing your problem, prototype, and vision.',
    whatYouWillSubmit: '90-second recorded pitch video link and word-for-word pitch script.',
    innovatorContribution: 'Unlocks storytelling and investor pitch communication prowess.',
    video_url: 'https://www.youtube.com/watch?v=Fhy834eF24M',
    video_duration_seconds: 660,
    reading_markdown: `# The 90-Second Innovation Pitch Formula

### Timing Breakdown:
- **0:00 - 0:15 (The Hook):** Start with an arresting statistic or personal story.
- **0:15 - 0:35 (The Problem):** Clarify who suffers and what it costs ($/lives).
- **0:35 - 0:55 (The Solution & Secret Sauce):** Introduce your robot and explain why it's $10\times$ more accessible.
- **0:55 - 1:15 (Traction & Demo):** Show 5 seconds of the robot working and highlight test data.
- **1:15 - 1:30 (Vision & Call to Action):** State your ambition and ask for partnership/support.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s36_1',
        question: 'What is the most effective way to begin a 90-second innovation pitch?',
        options: [
          'With a gripping, high-stakes hook or surprising statistic that immediately frames the urgency of the problem',
          'By reading your resume',
          'By apologizing for being nervous',
          'By listing every component in your circuit'
        ],
        correctIndex: 0,
        explanation: 'A powerful hook grabs the listener within the first 10 seconds and creates emotional resonance for the technical solution.'
      }
    ],
    assignment: {
      id: 'a_s36',
      title: '90-Second Pitch Script Formulation',
      description: 'Write your word-for-word 90-second pitch script (approx. 200-240 words) following the 5-stage formula.',
      instructions: ['Time yourself with a stopwatch.', 'Eliminate unnecessary filler words.'],
      deliverables: ['Formatted Pitch Script document']
    },
    miniProject: {
      id: 'p_s36',
      title: '90-Second Official Pitch Video',
      description: 'Record your official 90-second video pitch holding or demonstrating your physical prototype.',
      objectives: ['Strict adherence to $\le 90$ seconds.', 'Clear audio and dynamic visual engagement.'],
      simulationPlatform: 'Video Upload'
    },
    resources: [
      { title: 'Y-Combinator Elevator Pitch Guide', url: 'https://www.ycombinator.com/library', type: 'doc' }
    ]
  },
  {
    id: 'P04',
    levelNumber: 8,
    order: 40,
    title: 'YARA Innovation Capstone: Compulsory Real-World Project',
    subtitle: 'Identify → Research → Design → Build → Program → Test → Improve → Document → Present',
    type: 'capstone',
    part: 'Innovation & Capstone',
    durationMinutes: 180,
    prerequisites: ['S00', 'S01', 'S02', 'S03', 'S04', 'P01', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'P02', 'S21', 'S22', 'S23', 'P03', 'S24', 'S25', 'S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32', 'S33', 'S34', 'S35', 'S36'],
    learningObjective: 'Execute and submit a comprehensive, original Capstone project addressing Agriculture, Water, Healthcare, Energy, Environment, Accessibility, or Education.',
    whyLearnThis: 'This is the supreme graduation requirement of the YARA Robotics & Innovation Foundation Programme. It proves your transformation into a true Young Innovator.',
    whatYouWillBuild: 'A complete real-world robotics prototype with full documentation, research, schematics, and video pitch.',
    whatYouWillSubmit: 'The complete Capstone Project Submission Package (21-Point Report, Prototype Video, Pitch Video, Schematics, BOM, and Source Code).',
    innovatorContribution: 'Solves an authentic African societal problem with innovative robotics technology.',
    video_url: 'https://www.youtube.com/watch?v=0yD3uBshJB0',
    video_duration_seconds: 900,
    reading_markdown: `# YARA Innovation Capstone Project (P04)

### The 11 Thematic Areas for African Impact:
1. **🌾 Agriculture & Food Security:** Smart harvesting, solar-powered weeding rovers, automated grain storage regulators, drone crop telemetry.
2. **💧 Clean Water & Sanitation:** Autonomous water purification rovers, leak detection bots, borehole telemetry monitors.
3. **⚡ Clean Energy & Power:** Solar panel cleaning robots, smart microgrid load balancers, energy storage monitors.
4. **🏥 Healthcare & Medical Delivery:** Telemedicine triage carts, medicine transport robots, smart vaccine chillers.
5. **🌱 Environment & Climate Resilience:** Anti-poaching wildlife acoustic monitors, reforestation seed-planting bots, plastic sorting automation.
6. **♿ Accessibility & Assistive Tech:** Smart ultrasonic white canes, gesture-to-speech sign language gloves, robotic mobility aids.
7. **📚 Education & STEM Access:** Affordable open-source educational robotics kits and laboratory trainers.
8. **🛡️ Public Safety & Disaster Response:** Firefighting reconnaissance rovers, flood early-warning sensor arrays.
9. **🚚 Transport & Logistics:** Last-mile cargo delivery rovers, warehouse AGVs for African logistics hubs.
10. **🏘️ Community Development:** Smart streetlighting grids, municipal waste compaction robots.
11. **🚀 Youth Empowerment & Digital Inclusion:** Micro-manufacturing desktop CNC and 3D printing automation platforms.

### Review & Certification Gate:
Your submission is evaluated by YARA instructors across 12 distinct criteria (10 points each = 120 points total). Passing score is $\ge 75\%$.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Full Robotics Starter Kit + Custom Sensors/Actuators', quantity: 1, purpose: 'Complete Capstone prototype', inStarterKit: true }
    ],
    quizPassingScore: 75,
    quizQuestions: [
      {
        id: 'q_p04_1',
        question: 'What is the minimum score required across the 12 Capstone rubric dimensions to pass the YARA Innovation Capstone?',
        options: ['75% (90 out of 120 points)', '50%', '30%', '99%'],
        correctIndex: 0,
        explanation: 'A minimum score of 75% across all 12 rigorous evaluation dimensions is required for Capstone approval.'
      }
    ],
    assignment: {
      id: 'a_p04',
      title: 'Official Capstone Submission Package',
      description: 'Upload your completed 21-point technical report, BOM, schematic, source repository, and links to prototype and pitch videos.',
      instructions: ['Ensure all URLs are publicly accessible.', 'Verify video audio quality.'],
      deliverables: ['Comprehensive Capstone Submission Package']
    },
    miniProject: {
      id: 'p_p04',
      title: 'Full Physical Capstone Prototype System',
      description: 'Deliver the functional physical prototype in operational condition ready for showcase demonstration.',
      objectives: ['End-to-end autonomous functionality.'],
      simulationPlatform: 'Physical Bench'
    },
    resources: [
      { title: 'YARA Capstone Rubric & Submission Guidelines', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  },
  {
    id: 'P05',
    levelNumber: 8,
    order: 41,
    title: 'YARA Robotics & Innovation Showcase & Defense',
    subtitle: 'Live Project Demonstration, Instructor Defense & Graduation Accreditation',
    type: 'showcase',
    part: 'Innovation & Capstone',
    durationMinutes: 120,
    prerequisites: ['P04'],
    learningObjective: 'Present and defend your Capstone project in front of YARA faculty, industry mentors, and peers, answering probing technical questions.',
    whyLearnThis: 'This live showcase celebrates your journey and cements your graduation as an accredited YARA Robotics & Innovation Graduate!',
    whatYouWillBuild: 'A live, working exhibition demonstration of your robotics innovation.',
    whatYouWillSubmit: 'Showcase recording and instructor evaluation rubric score sheet.',
    innovatorContribution: 'Official induction into the Young Africans Robotics Association alumni network.',
    video_url: 'https://www.youtube.com/watch?v=0hKq_gO8jEU',
    video_duration_seconds: 600,
    reading_markdown: `# The YARA Robotics & Innovation Showcase (P05)

### Graduation Ceremony & Defense Checklist:
1. **Live Demonstration:** 5-minute uninterrupted demonstration of your robot prototype operating under live conditions.
2. **Technical Defense:** 5 minutes of Q&A with YARA engineering faculty covering circuit choices, algorithmic efficiency, and scaling.
3. **Faculty Scorecard Sign-Off:** Review committee enters final rubric grades.
4. **Certificate Release:** Upon faculty approval AND active YARA membership verification, your official cryptographically verified Certificate is issued!`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Operational Capstone Prototype + Presentation Deck', quantity: 1, purpose: 'Showcase defense', inStarterKit: true }
    ],
    quizPassingScore: 75,
    quizQuestions: [
      {
        id: 'q_p05_1',
        question: 'What happens immediately once your Capstone project is approved and your YARA membership subscription is active and verified by an admin?',
        options: [
          'Your official YARA Robotics & Innovation Graduate Certificate is unlocked with a unique verification ID and made available for high-res download, print, and public verification',
          'Your account is deleted',
          'You start over from Level 0',
          'Nothing happens'
        ],
        correctIndex: 0,
        explanation: 'Once all 8 completion requirements are met and membership is confirmed, your official certificate is instantly unlocked with a public verification URL.'
      }
    ],
    assignment: {
      id: 'a_p05',
      title: 'Showcase Defense Reflection & Alumni Profile',
      description: 'Write a 1-page personal reflection on your journey from Curious Beginner to Young Innovator, summarizing key technical skills acquired.',
      instructions: ['Highlight your proudest breakthrough.', 'Outline your next steps for project commercialization.'],
      deliverables: ['Showcase Reflection & Alumni Profile PDF']
    },
    miniProject: {
      id: 'p_p05',
      title: 'Final Graduation Exhibition Demonstration',
      description: 'Deliver your live project exhibition before the YARA evaluation panel.',
      objectives: ['Flawless live execution.', 'Confident defense.'],
      simulationPlatform: 'Live Showcase / Video Defense'
    },
    resources: [
      { title: 'YARA Alumni Network & Innovation Grant Portal', url: 'https://inforyaraorg.wixsite.com/my-site-2', type: 'doc' }
    ]
  }
];
