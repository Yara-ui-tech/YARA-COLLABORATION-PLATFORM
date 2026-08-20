import { YARALmsSession } from '../types/yaraLms';
import { YARA_LMS_SESSIONS } from './yaraLmsData';

export const ALL_YARA_SESSIONS: YARALmsSession[] = [
  ...YARA_LMS_SESSIONS,

  // ==========================================
  // LEVEL 2: BLOCK PROGRAMMER (S05, S06, S07)
  // ==========================================
  {
    id: 'S05',
    levelNumber: 2,
    order: 6,
    title: 'Block Programming 1: Logic, Algorithms & Sequences',
    subtitle: 'Sequences, Events, Inputs & Digital Outputs in Visual Blocks',
    type: 'online',
    part: 'Block Programming',
    durationMinutes: 50,
    prerequisites: ['P01'],
    learningObjective: 'Construct linear algorithms, event listeners, and digital output timing sequences using visual block environments (Scratch/Blockly/MakeCode).',
    whyLearnThis: 'Algorithm design begins with clear chronological sequences before worrying about syntax punctuation.',
    whatYouWillBuild: 'A simulated Digital Traffic Light system with Red, Yellow, and Green pedestrian and vehicular timing intervals.',
    whatYouWillSubmit: 'Block program project link/file and algorithmic sequence flowchart.',
    innovatorContribution: 'Builds foundational computational thinking and deterministic system modeling.',
    video_url: 'https://www.youtube.com/watch?v=FCMxA3m_Imc',
    video_duration_seconds: 600,
    reading_markdown: `# Block Programming: Algorithms & Sequences

### 1. What is an Algorithm?
An **algorithm** is an unambiguous, step-by-step sequence of instructions designed to solve a specific problem or perform an action.

### 2. The Anatomy of a Sequence
- **Start Event:** e.g., \`when green flag clicked\` or \`on start\`.
- **Sequential Execution:** Actions execute top-to-bottom in exact order.
- **Timing Delays:** \`wait (N) seconds\` halts execution on that thread to allow real-world state transitions.

### 3. Digital Outputs in Blocks
- High / ON = 1
- Low / OFF = 0`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s05_1',
        question: 'What happens if you omit the "wait" block between turning an LED ON and turning it OFF in a loop?',
        options: ['The LED flashes too fast for the human eye to see (looks dim or constant)', 'The computer crashes', 'The LED explodes', 'The code reverses direction'],
        correctIndex: 0,
        explanation: 'Computers execute millions of instructions per second; without wait intervals, the transition occurs in microseconds.'
      },
      {
        id: 'q_s05_2',
        question: 'In visual block programming, what block is used to trigger code when an event occurs?',
        options: ['An Event Hat block (e.g., "when [event] happens")', 'A Variable block', 'A Comment block', 'An Arithmetic operator'],
        correctIndex: 0,
        explanation: 'Event hat blocks listen for system signals (key press, pin change, timer) and invoke attached script threads.'
      }
    ],
    assignment: {
      id: 'a_s05',
      title: 'Pedestrian Traffic Light Sequence Algorithm',
      description: 'Design a visual flowchart and block script for an intersection traffic light with a pedestrian crosswalk button.',
      instructions: ['Vehicle Green (10s) -> Yellow (3s) -> Red (10s).', 'Pedestrian Walk LED illuminates ONLY when Vehicle is Red.'],
      deliverables: ['Flowchart diagram and Scratch/Blockly project link']
    },
    miniProject: {
      id: 'p_s05',
      title: 'Digital Traffic Light Simulator',
      description: 'Build an animated, working 3-color traffic light in Scratch/MakeCode with sound beeps for accessibility.',
      objectives: ['Deterministic sequence.', 'Visual timing cues.'],
      simulationPlatform: 'Scratch'
    },
    resources: [
      { title: 'Scratch Visual Programming Platform', url: 'https://scratch.mit.edu/', type: 'simulator' }
    ]
  },
  {
    id: 'S06',
    levelNumber: 2,
    order: 7,
    title: 'Block Programming 2: Conditions, Loops & Variables',
    subtitle: 'IF/ELSE Branches, While/Repeat Loops & Dynamic State Variables',
    type: 'online',
    part: 'Block Programming',
    durationMinutes: 55,
    prerequisites: ['S05'],
    learningObjective: 'Implement conditional branching (IF/THEN/ELSE), loop structures, and state variables to build reactive logic.',
    whyLearnThis: 'Robots must make decisions dynamically when conditions change rather than blindly running static timers.',
    whatYouWillBuild: 'An Automatic Security Light with variable ambient light thresholds and motion counters.',
    whatYouWillSubmit: 'Interactive block project simulating dusk-to-dawn security monitoring with intrusion counters.',
    innovatorContribution: 'Teaches conditional decision-making essential for adaptive robotics control.',
    video_url: 'https://www.youtube.com/watch?v=kM9ASKAni_s',
    video_duration_seconds: 660,
    reading_markdown: `# Conditions, Loops & Variables

### 1. Variables as Memory
A **variable** is a named storage container in memory holding a value that can change during execution (e.g. \`lightLevel\`, \`motionDetectedCount\`).

### 2. Conditional Branching
- \`if <condition> then\`: Executes enclosed blocks only if condition evaluates to TRUE.
- \`if <condition> then ... else ...\`: Provides alternative execution path when condition is FALSE.

### 3. Loop Types
- **Infinite Loop (\`forever\`):** Continuously samples sensor inputs and evaluates logic.
- **Counted Loop (\`repeat N times\`):** Executes a fixed number of iterations.
- **Conditional Loop (\`repeat until <condition>\`):** Loops until a specific threshold is reached.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s06_1',
        question: 'Which logic block allows a robot to execute Action A if a sensor is triggered, or Action B if it is not?',
        options: ['if <condition> then [Action A] else [Action B]', 'repeat (10)', 'set variable to 0', 'wait (1) secs'],
        correctIndex: 0,
        explanation: 'The if-else construct enables binary decision branching based on live sensor boolean states.'
      }
    ],
    assignment: {
      id: 'a_s06',
      title: 'Automated Night Light Logic Specification',
      description: 'Write the pseudocode and build the block program for a security light that turns ON only when ambient light < 300 AND motion is detected.',
      instructions: ['Define variables for lightLevel and motionState.', 'Use compound boolean logic (AND).'],
      deliverables: ['Project screenshot and logic summary']
    },
    miniProject: {
      id: 'p_s06',
      title: 'Automatic Security Light Prototype',
      description: 'Build a simulated home security light with a night-mode trigger and intruder counter in Scratch or MakeCode.',
      objectives: ['Dynamic variable updates.', 'Condition-based light actuation.'],
      simulationPlatform: 'MakeCode'
    },
    resources: [
      { title: 'MakeCode Micro:bit / Arduino Blocks', url: 'https://makecode.microbit.org/', type: 'simulator' }
    ]
  },
  {
    id: 'S07',
    levelNumber: 2,
    order: 8,
    title: 'Block Programming 3: Sensor Inputs & Robot Behavior Logic',
    subtitle: 'Simulating Autonomous Vehicles, Proximity Sensing & Motor Control in Blocks',
    type: 'online',
    part: 'Block Programming',
    durationMinutes: 60,
    prerequisites: ['S06'],
    learningObjective: 'Program the complete decision architecture of a virtual mobile robot including obstacle detection and evasive steering.',
    whyLearnThis: 'Testing autonomous mobile robot algorithms in simulation prevents physical hardware crashes and accelerates debugging.',
    whatYouWillBuild: 'A Virtual Obstacle-Avoidance Robot navigating a maze using simulated distance sensors.',
    whatYouWillSubmit: 'Completed virtual robot simulator project with obstacle collision logs.',
    innovatorContribution: 'Connects visual computational thinking directly with autonomous mobile robotics navigation.',
    video_url: 'https://www.youtube.com/watch?v=Fhy834eF24M',
    video_duration_seconds: 720,
    reading_markdown: `# Virtual Obstacle-Avoidance Robot Logic

### Autonomous Navigation State Machine
1. **Drive Forward:** Left Motor = FORWARD, Right Motor = FORWARD.
2. **Scan Distance:** Read ultrasonic sensor distance $D$.
3. **Evaluate:**
   - If $D > 25\text{ cm}$: Continue Forward.
   - If $D \le 25\text{ cm}$:
     - Stop motors ($0.2\text{ s}$).
     - Reverse briefly ($0.5\text{ s}$).
     - Pivot Turn: Left Motor = REVERSE, Right Motor = FORWARD ($0.6\text{ s}$).
     - Resume Forward.`,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s07_1',
        question: 'To make a 2-wheeled differential drive robot turn sharply to the RIGHT in place, what should the motor states be?',
        options: [
          'Left Motor = Forward, Right Motor = Reverse',
          'Both Motors = Forward',
          'Both Motors = Reverse',
          'Left Motor = Reverse, Right Motor = Forward'
        ],
        correctIndex: 0,
        explanation: 'Spinning the left wheel forward and right wheel in reverse creates a zero-radius right pivot turn.'
      }
    ],
    assignment: {
      id: 'a_s07',
      title: 'Obstacle Navigation Flowchart & State Machine',
      description: 'Draw a complete state machine diagram showing Forward, Detect, Reverse, Turn, and Re-scan states.',
      instructions: ['Specify sensor thresholds in centimeters.', 'Include timeout fallback if trapped in a corner.'],
      deliverables: ['State machine diagram PDF/Image']
    },
    miniProject: {
      id: 'p_s07',
      title: 'Virtual Obstacle-Avoidance Rover Simulation',
      description: 'Create a 2D simulated rover in Scratch or Wokwi block mode that navigates through random obstacles without colliding.',
      objectives: ['Continuous obstacle sensing.', 'Smooth pivot maneuvers.'],
      simulationPlatform: 'Scratch'
    },
    resources: [
      { title: 'Wokwi Arduino Block & C++ Simulator', url: 'https://wokwi.com/', type: 'simulator' }
    ]
  },

  // ==============================================================
  // LEVEL 3: EMBEDDED PROGRAMMER (S08 to S15)
  // ==============================================================
  {
    id: 'S08',
    levelNumber: 3,
    order: 9,
    title: 'Introduction to Arduino & ESP32 Microcontrollers',
    subtitle: 'Microcontrollers, GPIO, Digital I/O, ADC, PWM & Serial Communication',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 65,
    prerequisites: ['S07'],
    learningObjective: 'Understand microcontroller architectures, pin mappings (GPIO), Analog-to-Digital conversion (ADC), and serial baud rates.',
    whyLearnThis: 'Microcontrollers are the physical computing engines behind modern robotics, automotive ECUs, and industrial automation.',
    whatYouWillBuild: 'A multi-pin testbench verifying Digital Write, Digital Read, and Serial telemetry printouts.',
    whatYouWillSubmit: 'Annotated pinout diagram and working Serial Monitor communication script.',
    innovatorContribution: 'Establishes professional C++ embedded development fundamentals.',
    video_url: 'https://www.youtube.com/watch?v=nL34zDTPkcs',
    video_duration_seconds: 900,
    reading_markdown: `# Arduino & ESP32 Embedded Architecture

### 1. Arduino Uno vs. ESP32
- **Arduino Uno (ATmega328P):** 8-bit, 16MHz clock, 5V logic, 14 Digital GPIOs, 6 Analog Inputs (10-bit ADC: 0-1023).
- **ESP32 (Tensilica Xtensa Dual-Core):** 32-bit, 240MHz, 3.3V logic, Wi-Fi & Bluetooth, 12-bit ADC (0-4095), capacitive touch, hardware PWM.

### 2. GPIO Pin Modes
- \`pinMode(pin, OUTPUT);\`: Low impedance driver (can source/sink up to 20mA).
- \`pinMode(pin, INPUT);\`: High impedance listener.
- \`pinMode(pin, INPUT_PULLUP);\`: Internal pull-up resistor connected to $V_{CC}$ (prevents floating pins on pushbuttons).`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Arduino Uno R3 or ESP32 DevKit Board', quantity: 1, purpose: 'Microcontroller brain', inStarterKit: true },
      { name: 'USB-A to USB-B / Micro-USB Programming Cable', quantity: 1, purpose: 'Code upload & Serial Monitor', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s08_1',
        question: 'What is the voltage logic level of an Arduino Uno vs an ESP32?',
        options: ['Arduino Uno is 5V; ESP32 is 3.3V', 'Both are 12V', 'Arduino Uno is 3.3V; ESP32 is 5V', 'Both are 1.8V'],
        correctIndex: 0,
        explanation: 'Arduino Uno uses 5V TTL logic; ESP32 uses 3.3V logic and can be damaged if exposed directly to 5V inputs without a level shifter.'
      },
      {
        id: 'q_s08_2',
        question: 'Why should you enable INPUT_PULLUP when connecting a pushbutton between a digital pin and Ground?',
        options: [
          'It holds the pin at HIGH when not pressed, preventing erratic floating electrical states',
          'It doubles the processor speed',
          'It makes the button glow',
          'It disables the USB connection'
        ],
        correctIndex: 0,
        explanation: 'Floating pins pick up ambient electromagnetic noise. Pull-up resistors tie the pin reliably to HIGH until grounded by the button.'
      }
    ],
    assignment: {
      id: 'a_s08',
      title: 'Microcontroller Architecture & Pin Mapping Audit',
      description: 'Create a reference sheet comparing Uno and ESP32 with pin capabilities (PWM, Analog ADC, I2C, SPI, UART).',
      instructions: ['Identify which pins support hardware PWM.', 'Detail the voltage ratings for each.'],
      deliverables: ['Comparative engineering reference sheet']
    },
    miniProject: {
      id: 'p_s08',
      title: 'Serial Telemetry Command Terminal',
      description: 'Write an Arduino firmware sketch that echoes user commands over Serial Monitor and controls onboard LED states.',
      objectives: ['Serial.begin(9600) initialization.', 'Parsing char input commands (e.g., "1" for ON, "0" for OFF).'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'Arduino Official Language Reference', url: 'https://www.arduino.cc/reference/en/', type: 'doc' },
      { title: 'Wokwi Online Arduino Simulator', url: 'https://wokwi.com/arduino', type: 'simulator' }
    ]
  },
  {
    id: 'S09',
    levelNumber: 3,
    order: 10,
    title: 'Your First Microcontroller Circuit: Interactive Inputs & Outputs',
    subtitle: 'LEDs, Pushbuttons, Debounce Logic, Buzzers & Sound Synthesis',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 60,
    prerequisites: ['S08'],
    learningObjective: 'Wire and program interactive circuits combining pushbuttons with software debounce, multi-LED patterns, and buzzer sound generation.',
    whyLearnThis: 'Mechanical switches bounce electrically for 5-20 milliseconds. Learning software debouncing is crucial for reliable user interface controls.',
    whatYouWillBuild: 'An interactive multi-mode station with tactile button controls, status LEDs, and tone buzzer feedback.',
    whatYouWillSubmit: 'Debounced C++ source code and Wokwi simulation link.',
    innovatorContribution: 'Teaches professional input conditioning and user feedback engineering.',
    video_url: 'https://www.youtube.com/watch?v=d8_xXNcGYgo',
    video_duration_seconds: 780,
    reading_markdown: `# Button Debouncing & Microcontroller Sound

### 1. The Switch Bouncing Problem
When mechanical metal contacts close, they physically bounce rapidly before settling. To a 16MHz microcontroller, this looks like 10 to 50 rapid button presses.

### 2. Software Debouncing Pattern
\`\`\`cpp
const int BUTTON_PIN = 2;
const int LED_PIN = 13;
int buttonState = HIGH;
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50; // 50ms

void loop() {
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) {
        // Button confirmed pressed!
      }
    }
  }
  lastButtonState = reading;
}
\`\`\``,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Push Buttons (6mm Tactile)', quantity: 2, purpose: 'User inputs', inStarterKit: true },
      { name: 'Piezo Buzzer (Passive)', quantity: 1, purpose: 'Tone synthesis', inStarterKit: true },
      { name: 'LEDs & 220Ω Resistors', quantity: 3, purpose: 'Visual indicators', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s09_1',
        question: 'What is the purpose of the tone(pin, frequency, duration) function in Arduino?',
        options: ['Generates a square wave of specified frequency (Hz) to play audible sound on a passive buzzer', 'Measures temperature', 'Controls motor speed', 'Reboots the microcontroller'],
        correctIndex: 0,
        explanation: 'tone() drives a passive piezo buzzer with a hardware PWM square wave at a designated frequency (Hz).'
      }
    ],
    assignment: {
      id: 'a_s09',
      title: 'Interactive Mode-Selector Firmware',
      description: 'Write an Arduino sketch with a single button that toggles between 3 LED animation modes with audio pitch confirmation.',
      instructions: ['Implement software debounce.', 'Cycle modes: 1=Blink, 2=Chase, 3=Breath PWM.'],
      deliverables: ['Formatted C++ code and simulation link']
    },
    miniProject: {
      id: 'p_s09',
      title: 'Tactile Musical Keyboard Rig',
      description: 'Build a 3-button piano station playing distinct musical frequencies (C4, E4, G4) on a buzzer with visual LED feedback.',
      objectives: ['Clean debounce handling.', 'Accurate frequency generation.'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'Arduino tone() and Pitches Header Reference', url: 'https://www.arduino.cc/en/Tutorial/BuiltInExamples/toneMelody', type: 'doc' }
    ]
  },
  {
    id: 'S10',
    levelNumber: 3,
    order: 11,
    title: 'Sensors Interfacing with Arduino & ESP32',
    subtitle: 'Ultrasonic Distance, LDR Light, DHT11 Temperature & IR Reflectance',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 70,
    prerequisites: ['S09'],
    learningObjective: 'Interface, sample, filter, and calibrate multiple sensor types using analogRead(), pulseIn(), and 1-wire digital protocols.',
    whyLearnThis: 'Raw sensor readings contain electrical noise. Learning software filtering (moving averages) creates stable robotics control loops.',
    whatYouWillBuild: 'A multi-sensor environmental telemetry station (Ultrasonic + Temperature/Humidity + Light).',
    whatYouWillSubmit: 'Sensor calibration data curve and multi-sensor reading C++ firmware.',
    innovatorContribution: 'Equips innovators to extract precise physical measurements in variable environments.',
    video_url: 'https://www.youtube.com/watch?v=ZebTZZgY2d8',
    video_duration_seconds: 840,
    reading_markdown: `# Multi-Sensor Interfacing & Digital Filtering

### 1. Reading the HC-SR04 Ultrasonic in C++
\`\`\`cpp
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

float getDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return -1; // Out of range
  return (duration * 0.0343) / 2.0;
}
\`\`\`

### 2. Moving Average Filter
$$\bar{X}_k = \frac{1}{N}\sum_{i=0}^{N-1} X_{k-i}$$
Averaging the last 5-10 readings eliminates transient spikes from mechanical vibration.`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'HC-SR04 Ultrasonic Sensor', quantity: 1, purpose: 'Distance ranging', inStarterKit: true },
      { name: 'LDR Photoresistor + 10kΩ Resistor', quantity: 1, purpose: 'Light sensing divider', inStarterKit: true },
      { name: 'DHT11 Temperature & Humidity Sensor', quantity: 1, purpose: 'Climate telemetry', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s10_1',
        question: 'Why is adding a timeout parameter (e.g. 30000 µs) to pulseIn() critical in robotics code?',
        options: [
          'It prevents the robot from freezing indefinitely if no echo return pulse is received',
          'It increases the sensor range to 50 meters',
          'It converts centimeters to inches',
          'It powers off the ultrasonic transmitter'
        ],
        correctIndex: 0,
        explanation: 'By default, pulseIn() blocks execution for 1 full second if no pulse arrives. Setting a timeout keeps your control loop fast and responsive.'
      }
    ],
    assignment: {
      id: 'a_s10',
      title: 'Sensor Calibration Curve & Noise Filter Implementation',
      description: 'Calibrate an analog LDR sensor across 5 lighting conditions and implement a 5-point moving average filter in C++.',
      instructions: ['Tabulate raw ADC readings vs lux.', 'Plot the transfer function curve.'],
      deliverables: ['Calibration report and C++ filtering algorithm']
    },
    miniProject: {
      id: 'p_s10',
      title: 'Smart Environmental & Proximity Monitor',
      description: 'Build a multi-sensor station that reads temperature, light, and distance, logging values neatly to the Serial Monitor.',
      objectives: ['Concurrent sensor reading without blocking delays.'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'DHT11 / DHT22 Arduino Library Guide', url: 'https://github.com/adafruit/DHT-sensor-library', type: 'github' }
    ]
  },
  {
    id: 'S11',
    levelNumber: 3,
    order: 12,
    title: 'Motors & Actuators: DC Motor Drivers, PWM & Servos',
    subtitle: 'H-Bridge Drivers (L298N/L9110S), PWM Speed Control & Servo Kinematics',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 70,
    prerequisites: ['S10'],
    learningObjective: 'Drive DC motors bidirectionally with speed control via PWM using H-Bridge drivers and control precision Servo positioning.',
    whyLearnThis: 'Motors draw high current and generate inductive noise. Connecting them through dedicated motor drivers with separate power supplies is mandatory.',
    whatYouWillBuild: 'A dual-motor steering and servo panning mechanism with external battery power regulation.',
    whatYouWillSubmit: 'H-Bridge truth table wiring verification and PWM speed profiling code.',
    innovatorContribution: 'Directly unlocks robot propulsion, steering, and articulated mechanical manipulation.',
    video_url: 'https://www.youtube.com/watch?v=5b_m0jFzCps',
    video_duration_seconds: 900,
    reading_markdown: `# H-Bridge Motor Control & PWM

### 1. How an H-Bridge Works
An **H-Bridge** uses 4 electronic switches (transistors/MOSFETs) to reverse the polarity of voltage across a DC motor without rewiring:
- **Forward:** Q1 and Q4 ON (Current flows Left $\to$ Right).
- **Reverse:** Q3 and Q2 ON (Current flows Right $\to$ Left).
- **Brake:** Q2 and Q4 ON (Shorts motor terminals, creating dynamic regenerative braking).

### 2. Pulse Width Modulation (PWM)
By pulsing a digital pin between 0V and 5V at high frequency (490Hz on Arduino pins 3, 5, 6, 9, 10, 11), the effective average voltage is controlled:
$$\text{Duty Cycle} = \frac{T_{on}}{T_{period}} \times 100\% \quad \Longrightarrow \quad \text{analogWrite(pin, 0 to 255)}$$`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'L298N or L9110S Dual H-Bridge Motor Driver Module', quantity: 1, purpose: 'High-current motor driver', inStarterKit: true },
      { name: 'TT Geared DC Motors with Wheels', quantity: 2, purpose: 'Propulsion', inStarterKit: true },
      { name: 'SG90 9g Micro Servo Motor', quantity: 1, purpose: 'Angular panning', inStarterKit: true },
      { name: '4x AA Battery Pack', quantity: 1, purpose: 'Dedicated motor power supply', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s11_1',
        question: 'Why must the Ground (GND) of the motor battery pack be connected to the Arduino GND?',
        options: [
          'To establish a common electrical voltage reference so control signals are recognized properly',
          'To charge the Arduino from the motor battery',
          'To double the motor speed',
          'To prevent the Arduino from running'
        ],
        correctIndex: 0,
        explanation: 'All voltage measurements are relative. Without a common ground, PWM logic signals from the microcontroller cannot be interpreted by the motor driver.'
      }
    ],
    assignment: {
      id: 'a_s11',
      title: 'H-Bridge Truth Table & Power Isolation Diagram',
      description: 'Create an electrical schematic showing how to power an Arduino from USB while powering 2 motors from a separate 6V battery with a common ground.',
      instructions: ['Fill in the H-Bridge logic truth table for IN1, IN2, IN3, IN4.', 'Highlight separate power and ground paths.'],
      deliverables: ['Schematic diagram and truth table document']
    },
    miniProject: {
      id: 'p_s11',
      title: 'Servo-Scanned Ultrasonic Radar Mechanism',
      description: 'Mount an ultrasonic sensor onto an SG90 servo motor. Program it to sweep from 0° to 180°, logging distance at every 15° increment.',
      objectives: ['Servo.h integration.', 'Coordinated sweep-and-sample timing.'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'L298N Dual H-Bridge Motor Driver Datasheet & Guide', url: 'https://www.handsontec.com/dataspecs/L298N%20Motor%20Driver.pdf', type: 'datasheet' }
    ]
  },
  {
    id: 'S12',
    levelNumber: 3,
    order: 13,
    title: 'Programming Logic, Algorithms & Pseudocode',
    subtitle: 'Flowcharts, State Machines, Functions & Architectural Planning',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 55,
    prerequisites: ['S11'],
    learningObjective: 'Design deterministic finite state machines (FSM) and modular functions in pseudocode before writing low-level code.',
    whyLearnThis: 'Complex robotics firmware crashes when built as a single messy loop. Finite state machines provide rock-solid architectural stability.',
    whatYouWillBuild: 'A complete state machine architecture for an autonomous agricultural rover.',
    whatYouWillSubmit: 'Detailed state transition diagram and modular pseudocode blueprint.',
    innovatorContribution: 'Instills software engineering architectural planning used by professional robotics companies.',
    video_url: 'https://www.youtube.com/watch?v=PW8r_e9x8pE',
    video_duration_seconds: 660,
    reading_markdown: `# Finite State Machines (FSM) in Robotics

### State Machine Definition
A **Finite State Machine** is an architectural model where a robot is in exactly one named state at any time, transitioning to other states based on input conditions.

\`\`\`cpp
enum RobotState {
  STATE_FORWARD,
  STATE_OBSTACLE_DETECTED,
  STATE_REVERSE,
  STATE_TURN_LEFT,
  STATE_EMERGENCY_STOP
};

RobotState currentState = STATE_FORWARD;
\`\`\``,
    hasPhysicalComponents: false,
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s12_1',
        question: 'Why are Finite State Machines (FSM) preferred over deeply nested if-else statements in robotics firmware?',
        options: [
          'They provide clear, predictable state transitions, preventing unexpected deadlocks and making debugging straightforward',
          'They make the robot drive 10x faster',
          'They eliminate the need for microcontrollers',
          'They allow the robot to run without power'
        ],
        correctIndex: 0,
        explanation: 'FSMs clearly decouple robot states, inputs, and transitions, making complex behaviors clean and testable.'
      }
    ],
    assignment: {
      id: 'a_s12',
      title: 'Autonomous Rover State Transition Diagram',
      description: 'Design an FSM diagram with at least 5 distinct states for a line-tracking rover with obstacle pause and battery warning.',
      instructions: ['Identify entry conditions, state actions, and exit triggers.', 'Include fallback for when track is lost.'],
      deliverables: ['State transition diagram and annotated pseudocode']
    },
    miniProject: {
      id: 'p_s12',
      title: 'Simulated State Machine Firmware Engine',
      description: 'Write an Arduino sketch implementing a clean switch(state) state machine logging state transitions over Serial.',
      objectives: ['Enum state declaration.', 'Non-blocking state evaluation.'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'Finite State Machine Design Patterns for Embedded Systems', url: 'https://en.wikipedia.org/wiki/Finite-state_machine', type: 'doc' }
    ]
  },
  {
    id: 'S13',
    levelNumber: 3,
    order: 14,
    title: 'Arduino C++ Programming Mastery',
    subtitle: 'setup(), loop(), Variables, Scope, Operators, Functions & Serial Debugging',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 65,
    prerequisites: ['S12'],
    learningObjective: 'Write clean, modular, and maintainable C++ code adhering to embedded best practices.',
    whyLearnThis: 'Mastering variable scoping, pointer basics, and modular functions prevents stack overflows and elusive memory bugs.',
    whatYouWillBuild: 'A modular firmware library organizing sensors, actuators, and telemetry into clean functions.',
    whatYouWillSubmit: 'Multi-file or well-factored C++ firmware source repository.',
    innovatorContribution: 'Prepares learners for industrial embedded firmware engineering.',
    video_url: 'https://www.youtube.com/watch?v=zJ-LqeX_fLU',
    video_duration_seconds: 780,
    reading_markdown: `# Modular C++ for Embedded Robotics

### Writing Clean Functions
\`\`\`cpp
void setMotorSpeeds(int leftSpeed, int rightSpeed) {
  leftSpeed = constrain(leftSpeed, -255, 255);
  rightSpeed = constrain(rightSpeed, -255, 255);
  
  // Left Motor
  if (leftSpeed >= 0) {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, leftSpeed);
  } else {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    analogWrite(ENA, -leftSpeed);
  }
}
\`\`\``,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Arduino Uno / ESP32 + Component Kit', quantity: 1, purpose: 'Embedded testing', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s13_1',
        question: 'What is the purpose of the constrain(value, min, max) function in Arduino C++?',
        options: ['Ensures a value stays strictly within a designated minimum and maximum bound', 'Deletes the variable', 'Converts integers to strings', 'Prints to the Serial Monitor'],
        correctIndex: 0,
        explanation: 'constrain() clips values that exceed limits, preventing illegal PWM duty cycles or array bounds overflows.'
      }
    ],
    assignment: {
      id: 'a_s13',
      title: 'Modular Actuator Driver Code Refactoring',
      description: 'Refactor messy motor control code into 4 clean functions: driveForward(), driveReverse(), spinTurn(), and emergencyStop().',
      instructions: ['Implement speed ramp-up parameters.', 'Add parameter validation bounds.'],
      deliverables: ['Formatted C++ sketch with comprehensive documentation comments']
    },
    miniProject: {
      id: 'p_s13',
      title: 'Sensor-Controlled Smart Speed Governor',
      description: 'Write a program that automatically modulates DC motor speed inversely proportional to distance from an obstacle.',
      objectives: ['Map ultrasonic distance (10-100cm) to PWM speed (0-255).'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'Arduino Style & Formatting Best Practices', url: 'https://docs.arduino.cc/', type: 'doc' }
    ]
  },
  {
    id: 'S14',
    levelNumber: 3,
    order: 15,
    title: 'Non-Blocking Timing, millis() & Modular Libraries',
    subtitle: 'Replacing delay() with millis(), Cooperative Multitasking & Header Libraries',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 65,
    prerequisites: ['S13'],
    learningObjective: 'Eliminate blocking delay() calls using millis() timers to execute concurrent sensor reading, motor driving, and telemetry.',
    whyLearnThis: 'delay(1000) completely freezes the microcontroller for 1 second. During that time, the robot cannot read bumper sensors, stop for obstacles, or process incoming commands.',
    whatYouWillBuild: 'A cooperative multitasking controller running 3 concurrent periodic tasks at different frequencies.',
    whatYouWillSubmit: 'Non-blocking firmware performing simultaneous ultrasonic ranging, LED beacon flashing, and serial telemetry.',
    innovatorContribution: 'Unlocks true real-time responsive robotics computing without costly RTOS complexity.',
    video_url: 'https://www.youtube.com/watch?v=BYOu8rV_k_k',
    video_duration_seconds: 720,
    reading_markdown: `# Non-Blocking Timing with millis()

### The Golden Rule: Never Use \`delay()\` in Real-Time Robotics
\`\`\`cpp
unsigned long previousMillisSensor = 0;
const long sensorInterval = 50; // Read sensor every 50ms (20Hz)

unsigned long previousMillisBlink = 0;
const long blinkInterval = 500; // Blink LED every 500ms (1Hz)

void loop() {
  unsigned long currentMillis = millis();

  // Task 1: Sensor Ranging (20Hz)
  if (currentMillis - previousMillisSensor >= sensorInterval) {
    previousMillisSensor = currentMillis;
    readUltrasonicSensor();
  }

  // Task 2: Status Indicator (1Hz)
  if (currentMillis - previousMillisBlink >= blinkInterval) {
    previousMillisBlink = currentMillis;
    toggleStatusLed();
  }
}
\`\`\``,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'Arduino / ESP32 + LEDs + Sensors', quantity: 1, purpose: 'Concurrent execution testing', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s14_1',
        question: 'Why should the variable holding millis() timestamps always be declared as "unsigned long"?',
        options: [
          'Because millis() counts milliseconds and will overflow a standard integer after ~32 seconds, but unsigned long runs for ~49.7 days',
          'Because signed integers are illegal in Arduino',
          'Because it reduces memory by half',
          'Because it enables floating point math'
        ],
        correctIndex: 0,
        explanation: 'unsigned long supports numbers up to 4,294,967,295, preventing rollover bugs for nearly 50 days of continuous runtime.'
      }
    ],
    assignment: {
      id: 'a_s14',
      title: 'Multitasking Traffic & Radar Controller',
      description: 'Write a non-blocking program that sweeps a servo motor at 20Hz, flashes a beacon at 2Hz, and streams telemetry at 5Hz simultaneously.',
      instructions: ['Zero use of delay().', 'Demonstrate responsive serial command reception.'],
      deliverables: ['Source code and simulation execution proof']
    },
    miniProject: {
      id: 'p_s14',
      title: 'Smart Traffic Controller with Emergency Override',
      description: 'Build an interactive intersection simulator running concurrent non-blocking vehicle lights while instantly responding to emergency vehicle button presses.',
      objectives: ['Sub-10ms emergency button response latency.'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'Blink Without Delay Tutorial', url: 'https://docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay', type: 'doc' }
    ]
  },
  {
    id: 'S15',
    levelNumber: 3,
    order: 16,
    title: 'Sensor-Driven Systems: Mini Smart Greenhouse Prototype',
    subtitle: 'Integrating Climate Sensors, Threshold Logic & Actuator Feedback Loops',
    type: 'online',
    part: 'Embedded Systems',
    durationMinutes: 75,
    prerequisites: ['S14'],
    learningObjective: 'Synthesize climate sensors (DHT11 temp/humidity + LDR light), threshold hysteresis logic, and automated actuators (cooling fan/relay, irrigation pump indicator, alarm).',
    whyLearnThis: 'This capstone for Level 3 demonstrates mastery of closed-loop automation—the core principle of agricultural robotics.',
    whatYouWillBuild: 'A complete Mini Smart Greenhouse prototype with automatic climate regulation.',
    whatYouWillSubmit: 'Firmware source code, breadboard circuit schematic, and automated testing log.',
    innovatorContribution: 'Directly applies robotics principles to agricultural automation and food security.',
    video_url: 'https://www.youtube.com/watch?v=0hKq_gO8jEU',
    video_duration_seconds: 840,
    reading_markdown: `# Closed-Loop Automation & Hysteresis

### Why Hysteresis Matters
Without **hysteresis**, if a fan turns ON at $30.0^\circ\text{C}$ and OFF at $29.99^\circ\text{C}$, small sensor fluctuations cause the relay to chatter on and off hundreds of times per minute, burning out the contacts.

### Implementing Hysteresis:
- Turn ON Fan when $\text{Temperature} \ge 30.0^\circ\text{C}$.
- Turn OFF Fan ONLY when $\text{Temperature} \le 27.0^\circ\text{C}$ (Deadband of $3^\circ\text{C}$).`,
    hasPhysicalComponents: true,
    componentsRequired: [
      { name: 'DHT11 Sensor + LDR + 5V Relay + DC Fan/Motor + Buzzer + LEDs', quantity: 1, purpose: 'Complete Smart Greenhouse rig', inStarterKit: true }
    ],
    quizPassingScore: 70,
    quizQuestions: [
      {
        id: 'q_s15_1',
        question: 'What is the primary benefit of adding hysteresis (deadband) to automated temperature control?',
        options: [
          'It prevents rapid oscillating chatter of actuators around the target threshold',
          'It makes the temperature sensor more expensive',
          'It cools down the greenhouse faster',
          'It eliminates the need for power supplies'
        ],
        correctIndex: 0,
        explanation: 'Hysteresis creates separate turn-on and turn-off thresholds to prevent relay chatter caused by noise.'
      }
    ],
    assignment: {
      id: 'a_s15',
      title: 'Smart Agriculture Closed-Loop Control Specification',
      description: 'Design the full control algorithm for an automated nursery managing soil moisture, temperature, and grow lights.',
      instructions: ['Define threshold values with hysteresis bands.', 'Include sensor fault detection.'],
      deliverables: ['System specification worksheet and C++ code']
    },
    miniProject: {
      id: 'p_s15',
      title: 'Mini Smart Greenhouse Prototype Station',
      description: 'Build a working automated climate station that actuates a fan when hot, triggers grow lights when dark, and sounds an alert when dry.',
      objectives: ['Concurrent non-blocking loop.', 'Relay/transistor actuator driving.'],
      simulationPlatform: 'Wokwi'
    },
    resources: [
      { title: 'Precision Agriculture Automation Guide', url: 'https://www.fao.org/', type: 'doc' }
    ]
  }
];
