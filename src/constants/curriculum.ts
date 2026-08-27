import { 
  SessionStudyResource, 
  SessionQuestion, 
  SessionAssignment, 
  SessionProject, 
  FinalExamQuestion,
  CourseLevel,
  CurriculumSession
} from '../types/curriculum';

export type { CurriculumSession };

export const COURSE_LEVELS: CourseLevel[] = [
  {
    id: 'course_level_1',
    levelNumber: 1,
    title: 'Level 1: Absolute Beginner Robotics & Electronics',
    description: 'Designed for complete novices with zero coding or electronics background. Master breadboards, LEDs, sensors, motors, and Arduino simulation from scratch.',
    targetAudience: 'Absolute Beginners, High School Students & New Enthusiasts',
    badge: 'Beginner Robotics Pioneer',
    sessionsCount: 12
  },
  {
    id: 'course_level_2',
    levelNumber: 2,
    title: 'Level 2: Intermediate Autonomous Wheeled Robots & Sensor Fusion',
    description: 'Build 2-wheel and 4-wheel differential rovers, tune PID line trackers, implement ultrasonic state-machine obstacle avoidance, and design custom 2-layer PCBs.',
    targetAudience: 'Innovators with Level 1 or Basic C++ Knowledge',
    badge: 'Autonomous Systems Builder',
    sessionsCount: 10
  },
  {
    id: 'course_level_3',
    levelNumber: 3,
    title: 'Level 3: Advanced IoT Robotics, Telemetry & Edge AI',
    description: 'Connect ESP32 microcontrollers to cloud MQTT brokers, transmit real-time telemetry over WebSockets, integrate camera vision, and deploy edge ML classifiers.',
    targetAudience: 'Advanced Students & Hardware Innovators',
    badge: 'Industrial IoT & AI Master',
    sessionsCount: 8
  }
];


export const CURRICULUM: CurriculumSession[] = [
  {
    id: 'S01',
    type: 'online',
    part: 'Electronics',
    topic: "Electronics 1: Electricity, Ohm's Law, Components Foundation",
    outcome: "Calculate resistors and current for any LED or sensor circuit",
    description: "The Four Quantities (V, I, R, P) and Ohm's Law foundation. Series vs Parallel circuits and Voltage Dividers.",
    video_url: "https://www.youtube.com/watch?v=8jB7p9aM0aY",
    resources: [
      {
        title: "Interactive Ohm's Law & Circuit Simulator",
        url: "https://www.falstad.com/circuit/",
        type: "simulation",
        description: "Falstad interactive real-time visual current and resistor simulator"
      },
      {
        title: "Resistor Color Code & Calculation Cheat Sheet",
        url: "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-resistor-color-code",
        type: "doc",
        description: "Standard 4-band and 5-band color calculation reference"
      },
      {
        title: "Tinkercad Circuits: Ohm's Law Lab",
        url: "https://www.tinkercad.com/circuits",
        type: "simulation",
        description: "Interactive virtual breadboard with DC power supply and multimeter"
      }
    ],
    questions: [
      {
        id: 'q_s01_1',
        question: "If a circuit has a 9V battery and a total resistance of 300 Ohms, what is the current according to Ohm's Law?",
        options: ["30 mA (0.03 A)", "3 mA (0.003 A)", "300 mA (0.3 A)", "2700 mA (2.7 A)"],
        correctIndex: 0,
        explanation: "Using I = V / R: 9V ÷ 300Ω = 0.03A, which equals 30 milliamperes (mA)."
      },
      {
        id: 'q_s01_2',
        question: "You are connecting a standard Red LED (Forward Voltage = 2.0V, Target Current = 20mA) to a 5V Arduino pin. What resistor value is required?",
        options: ["150 Ohms", "250 Ohms", "330 Ohms", "1000 Ohms"],
        correctIndex: 0,
        explanation: "R = (Vsupply - Vforward) / Itarget = (5V - 2.0V) / 0.02A = 3.0V / 0.02A = 150 Ohms. (150Ω to 220Ω is ideal)."
      },
      {
        id: 'q_s01_3',
        question: "What happens to the total resistance when you connect two 100-Ohm resistors in parallel?",
        options: ["It becomes 50 Ohms", "It becomes 200 Ohms", "It stays 100 Ohms", "It drops to zero"],
        correctIndex: 0,
        explanation: "In parallel with two identical resistors: Rtotal = R / 2 = 100Ω / 2 = 50 Ohms."
      }
    ],
    assignments: [
      {
        id: 'a_s01',
        title: "Ohm's Law Calculation Drill & Circuit Schematic",
        description: "Calculate current, voltage drop, and power consumption for 3 specific robotics load cases.",
        instructions: [
          "Case 1: Red LED on 5V pin with 220Ω resistor (Find I).",
          "Case 2: 9V Battery powering an ultrasonic sensor drawing 15mA through a divider (Find R).",
          "Case 3: Calculate power dissipated by a 10Ω resistor carrying 0.5A."
        ],
        deliverables: ["Calculations with formulas", "Falstad or Tinkercad simulation screenshot/link"]
      }
    ],
    projects: [
      {
        id: 'p_s01',
        title: "Tinkercad Breadboard LED Safety Array",
        description: "Build a virtual breadboard circuit with 3 LEDs in parallel, each protected by an appropriately calculated current-limiting resistor, powered by a 5V virtual rail.",
        simulationPlatform: "Tinkercad Circuits",
        starterLink: "https://www.tinkercad.com/things",
        objectives: [
          "Connect power rails properly without short circuits.",
          "Demonstrate individual multimeter current measurements through each LED branch."
        ]
      }
    ],
    details: {
      theory: [
        "Voltage (V): The 'push' driving electrons (5V, 9V, 12V).",
        "Current (I): Electrons per second. Arduino max per pin: 40mA (20mA recommended).",
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
    video_url: "https://www.youtube.com/watch?v=kYJv_w7lK5U",
    resources: [
      {
        title: "HC-SR04 Ultrasonic Sensor Datasheet & Timing Diagram",
        url: "https://www.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf",
        type: "doc",
        description: "Official 10us trigger pulse and echo timing specification"
      },
      {
        title: "L298N Dual H-Bridge Motor Driver Guide",
        url: "https://www.handsontec.com/dataspecs/L298N%20Motor%20Driver.pdf",
        type: "doc",
        description: "Pinout, 5V regulator jumper rules, and PWM speed control"
      },
      {
        title: "Wokwi Interactive Sensor Sandbox",
        url: "https://wokwi.com/projects/new/arduino-uno",
        type: "simulation",
        description: "Simulate DHT22, Ultrasonic, PIR, and Servos in real-time"
      }
    ],
    questions: [
      {
        id: 'q_s02_1',
        question: "Why should you never power high-torque DC motors or servos directly from an Arduino 5V pin?",
        options: [
          "Motors draw inductive surge current that can burn the Arduino voltage regulator or cause brownouts",
          "Arduino pins output AC power instead of DC power",
          "Motors require a minimum of 230V AC to spin",
          "Arduino digital pins only output 0.1V"
        ],
        correctIndex: 0,
        explanation: "Inductive loads like motors draw high stall currents (500mA - 2A+) and generate flyback voltage spikes that can permanently destroy microcontroller pins."
      },
      {
        id: 'q_s02_2',
        question: "How does the HC-SR04 Ultrasonic Distance Sensor measure distance?",
        options: [
          "It emits a 40kHz sound pulse and measures the time taken for the echo to bounce back",
          "It measures the temperature of the air between the robot and the obstacle",
          "It uses infrared light reflected off the surface",
          "It detects magnetic fields from metal walls"
        ],
        correctIndex: 0,
        explanation: "HC-SR04 emits an ultrasonic pulse and measures echo flight duration: Distance = (Time × Speed of Sound) / 2."
      }
    ],
    assignments: [
      {
        id: 'a_s02',
        title: "Sensor & Actuator Interface Blueprint",
        description: "Draw the pin-to-pin wiring diagram connecting an Arduino Uno, HC-SR04 Ultrasonic Sensor, and an L298N Motor Driver with an external 7.4V battery pack.",
        instructions: [
          "Clearly label VCC, GND, Trigger, Echo, IN1-IN4, and ENA/ENB.",
          "Ensure common ground (GND) is tied between Arduino and motor battery."
        ],
        deliverables: ["Schematic drawing or Wokwi diagram screenshot", "Explanation of why common GND is essential"]
      }
    ],
    projects: [
      {
        id: 'p_s02',
        title: "Virtual Sensor Station with LCD Display",
        description: "In Wokwi, wire a DHT22 Temperature & Humidity sensor plus an HC-SR04 sensor to an Arduino Uno and display live readings on a 16x2 I2C LCD screen.",
        simulationPlatform: "Wokwi Simulator",
        starterLink: "https://wokwi.com/projects/new/arduino-uno",
        objectives: [
          "Read digital sensor data properly.",
          "Format and update LCD display without screen flickering."
        ]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=bF3OyQ3HwfU",
    resources: [
      {
        title: "Digital Multimeter Master Guide (Voltage, Current, Continuity)",
        url: "https://learn.sparkfun.com/tutorials/how-to-use-a-multimeter/all",
        type: "doc",
        description: "Step by step guide to measuring DC volts and testing continuity"
      },
      {
        title: "YARA 5 Non-Negotiable Hardware Safety Rules",
        url: "https://yaria.org/safety-guidelines",
        type: "doc",
        description: "Safety protocols for battery handling, polarity, and circuit wiring"
      }
    ],
    questions: [
      {
        id: 'q_s03_1',
        question: "When using a digital multimeter to test for a short circuit on an unpowered breadboard, which mode should you select?",
        options: ["Continuity Mode (Beep / Diode)", "200V AC Voltage Mode", "10A Current Mode", "Resistance 20M Mode"],
        correctIndex: 0,
        explanation: "Continuity mode immediately sounds an audible beep if there is a low-resistance short between two connection points."
      },
      {
        id: 'q_s03_2',
        question: "What is the purpose of a flyback diode placed across an inductive DC relay or motor coil?",
        options: [
          "To suppress voltage spikes generated by the collapsing magnetic field when power is disconnected",
          "To convert DC into AC electricity",
          "To increase the motor's top speed by 50%",
          "To glow in the dark as an indicator light"
        ],
        correctIndex: 0,
        explanation: "When an inductive coil is de-energized, its collapsing magnetic field generates a massive reverse voltage spike; the flyback diode safely dissipates this spike."
      }
    ],
    assignments: [
      {
        id: 'a_s03',
        title: "100% Safety Compliance Certification Checklist",
        description: "Review your physical bench safety checklist and document your power disconnect protocol.",
        instructions: [
          "List the 5 Non-Negotiable Safety Rules in your own words.",
          "Describe how you will verify circuit polarity before turning on battery switches."
        ],
        deliverables: ["Signed Safety Commitment Statement"]
      }
    ],
    projects: [
      {
        id: 'p_s03',
        title: "Robot Concept Architecture Plan",
        description: "Produce the block diagram for your capstone robot, showing Power Source, Brain (MCU), Input Sensors, Motor Drivers, and Output Actuators.",
        objectives: [
          "Identify all voltage domains (e.g. 5V logic vs 7.4V motor rail).",
          "Specify the total calculated maximum current consumption."
        ]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=zOjov-2OZ0E",
    resources: [
      {
        title: "The 7 Universal Programming Constructs for Robotics",
        url: "https://www.geeksforgeeks.org/basic-programming-constructs/",
        type: "doc",
        description: "Sequence, Variables, Selection, Loops, Functions, Arrays, State Machines"
      }
    ],
    questions: [
      {
        id: 'q_s04_1',
        question: "In robotics control logic, what is the primary difference between a condition (if/else) and a loop (while/for)?",
        options: [
          "A condition branches execution once based on a true/false state, while a loop repeats code while the state remains true",
          "Conditions only run on weekends while loops run continuously",
          "Loops cannot use boolean operators like AND / OR",
          "Conditions always cause hardware resets"
        ],
        correctIndex: 0,
        explanation: "An IF statement tests a condition once per cycle; a WHILE/FOR loop repeats execution of its enclosed block until the terminating condition is reached."
      }
    ],
    assignments: [
      {
        id: 'a_s04',
        title: "Autonomous Obstacle Avoidance Pseudocode Algorithm",
        description: "Write complete pseudocode for an autonomous robot equipped with left, center, and right distance sensors.",
        instructions: [
          "Define threshold distances (e.g. STOP_DISTANCE = 20cm).",
          "Handle cases: clear path ahead, wall ahead, corner trap (blocked on 3 sides)."
        ],
        deliverables: ["Clean, formatted pseudocode file or document"]
      }
    ],
    projects: [
      {
        id: 'p_s04',
        title: "Robot State Machine Flowchart",
        description: "Design a state transition diagram for an autonomous mobile robot containing states: IDLE, FORWARD, AVOID_LEFT, AVOID_RIGHT, REVERSE, and EMERGENCY_STOP.",
        objectives: [
          "Map all transition triggers based on sensor readings.",
          "Prevent infinite loops and deadlock states."
        ]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=fJWR73zpJko",
    resources: [
      {
        title: "Arduino Official Reference Guide",
        url: "https://www.arduino.cc/reference/en/",
        type: "doc",
        description: "Documentation for pinMode(), digitalWrite(), digitalRead(), and Serial"
      },
      {
        title: "Wokwi Arduino Uno Simulator Starter",
        url: "https://wokwi.com/projects/new/arduino-uno",
        type: "simulation",
        description: "Online browser-based C++ Arduino simulator with interactive components"
      }
    ],
    questions: [
      {
        id: 'q_s05_1',
        question: "Which Arduino function executes exactly once when the board boots or resets?",
        options: ["void setup()", "void loop()", "void start()", "void main()"],
        correctIndex: 0,
        explanation: "setup() is called once when the sketch starts to configure pin modes, initialize serial baud rates, and set starting states."
      },
      {
        id: 'q_s05_2',
        question: "What is the return range of the analogRead() function on an Arduino Uno (10-bit ADC)?",
        options: ["0 to 1023", "0 to 255", "0 to 5000", "0 to 100"],
        correctIndex: 0,
        explanation: "Arduino Uno has a 10-bit Analog-to-Digital Converter: 2^10 = 1024 discrete steps (0 to 1023 representing 0V to 5V)."
      }
    ],
    assignments: [
      {
        id: 'a_s05',
        title: "Pushbutton Debounce & Mode Selector Sketch",
        description: "Write an Arduino sketch that toggles through 3 LED blinking patterns each time a tactile pushbutton is pressed.",
        instructions: [
          "Use INPUT_PULLUP for the button pin to avoid floating inputs.",
          "Implement software debounce logic."
        ],
        deliverables: ["Wokwi project URL with working simulation"]
      }
    ],
    projects: [
      {
        id: 'p_s05',
        title: "Interactive Smart Nightlight Prototype",
        description: "Build a photoresistor (LDR) light-activated system that smoothly fades an LED up as ambient light drops below a threshold, transmitting lux telemetry over Serial.",
        simulationPlatform: "Wokwi / Tinkercad",
        objectives: [
          "Use analogRead() with an LDR voltage divider.",
          "Map the light value to a PWM output (0-255) using analogWrite()."
        ]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=BYOu8P6u_6A",
    resources: [
      {
        title: "Blink Without Delay: Mastering Non-Blocking Code",
        url: "https://docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay/",
        type: "doc",
        description: "Learn how to use millis() timestamps for asynchronous multitasking"
      }
    ],
    questions: [
      {
        id: 'q_s06_1',
        question: "Why is using delay(1000) problematic inside a high-speed obstacle avoidance robot loop?",
        options: [
          "delay() halts the microcontroller CPU entirely, preventing it from reading ultrasonic sensors or reacting to emergency collisions during that interval",
          "delay() overheats the microcontroller chips",
          "delay() drains 10x more battery power",
          "delay() reverses motor rotation direction"
        ],
        correctIndex: 0,
        explanation: "delay() is a blocking function. While frozen in delay(), the robot cannot check sensors, process serial data, or steer away from approaching obstacles."
      }
    ],
    assignments: [
      {
        id: 'a_s06',
        title: "Non-Blocking Multi-Rate Task Scheduler",
        description: "Write an Arduino program that blinks LED 1 every 200ms, blinks LED 2 every 1000ms, and continuously checks a push button with 0ms latency using millis().",
        instructions: [
          "Do not use a single delay() call anywhere in the code.",
          "Use unsigned long variables for previousMillis timestamps."
        ],
        deliverables: ["Working Wokwi code link"]
      }
    ],
    projects: [
      {
        id: 'p_s06',
        title: "Smart Pedestrian Crosswalk Traffic System",
        description: "Simulate a fully automated 4-way traffic light controller with an emergency pedestrian crossing button that triggers safe state transitions without blocking sensor scans.",
        simulationPlatform: "Wokwi Simulator",
        objectives: [
          "State machine architecture using enum states.",
          "Accurate millis() interval timers for Red, Yellow, Green cycles."
        ]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=0kXQy2qH1rA",
    resources: [
      {
        title: "DHT22 Temperature & Humidity Sensor Library Guide",
        url: "https://github.com/adafruit/DHT-sensor-library",
        type: "github",
        description: "Adafruit DHT sensor driver repository and code samples"
      }
    ],
    questions: [
      {
        id: 'q_s07_1',
        question: "When mapping an analog moisture sensor reading (0 to 1023) to a soil moisture percentage (0% to 100%), which Arduino function is most suitable?",
        options: ["map(val, 0, 1023, 0, 100)", "scale(val, 100)", "convert(val, 1023)", "round(val)"],
        correctIndex: 0,
        explanation: "map(value, fromLow, fromHigh, toLow, toHigh) re-maps numbers from one range to another efficiently."
      }
    ],
    assignments: [
      {
        id: 'a_s07',
        title: "Dual Sensor Threshold Trigger & Alarm Handler",
        description: "Program an Arduino to monitor temperature (DHT22) and gas/smoke. If temperature > 35°C OR smoke detected, activate a PWM buzzer and relay fan.",
        deliverables: ["Wokwi project URL and annotated C++ code"]
      }
    ],
    projects: [
      {
        id: 'p_s07',
        title: "Automated Smart Agriculture Greenhouse Simulator",
        description: "Simulate a climate-controlled greenhouse with automatic irrigation relay, ventilation servo, and live telemetry on an LCD screen.",
        simulationPlatform: "Wokwi",
        objectives: [
          "Integrate DHT22, potentiometer soil sensor, servo motor, and relay.",
          "Provide visual and audible alerts when metrics exceed thresholds."
        ]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=d_2Aea2a6c0",
    resources: [
      {
        title: "Differential Drive Kinematics & Motor Control Reference",
        url: "https://automaticaddison.com/differential-drive-robot-kinematics-equations/",
        type: "doc",
        description: "Forward, reverse, pivot turn, and smooth curve steering math"
      }
    ],
    questions: [
      {
        id: 'q_s08_1',
        question: "To make a 2-wheel differential drive robot execute a fast zero-radius left pivot turn on the spot, what should the motor states be?",
        options: [
          "Left Motor REVERSE, Right Motor FORWARD",
          "Left Motor FORWARD, Right Motor FORWARD",
          "Left Motor STOPPED, Right Motor STOPPED",
          "Left Motor FORWARD, Right Motor REVERSE"
        ],
        correctIndex: 0,
        explanation: "Spinning the left wheels in reverse while driving the right wheels forward rotates the robot counter-clockwise about its central axis."
      }
    ],
    assignments: [
      {
        id: 'a_s08',
        title: "Differential Motor Driver Helper Class",
        description: "Write reusable C++ functions: moveForward(speed), moveBackward(speed), turnLeft(speed), turnRight(speed), and stopRobot() for an L298N driver.",
        deliverables: ["Modular C++ header/implementation file"]
      }
    ],
    projects: [
      {
        id: 'p_s08',
        title: "Full Wokwi Obstacle Avoidance Robot Simulation",
        description: "Wire an Arduino Uno, Servo-mounted HC-SR04 ultrasonic radar, and dual DC motors. Code the robot to scan left and right when an obstacle is detected within 25cm and steer toward the clearer path.",
        simulationPlatform: "Wokwi",
        objectives: [
          "Servo sweep from 30° to 150°.",
          "Dynamic distance evaluation and steering decision matrix."
        ]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=SrhQ8U6_yQk",
    resources: [
      {
        title: "Stanford d.school Design Thinking Bootleg Guide",
        url: "https://dschool.stanford.edu/resources/design-thinking-bootleg",
        type: "doc",
        description: "Empathy interviews, problem definition, and How Might We statements"
      }
    ],
    questions: [
      {
        id: 'q_s09_1',
        question: "In the 5 Whys root cause analysis technique, what is the primary goal?",
        options: [
          "To drill past surface symptoms to uncover the underlying systemic cause of a problem",
          "To blame five different team members for an error",
          "To delay project development by five weeks",
          "To repeat the same question five times in a pitch"
        ],
        correctIndex: 0,
        explanation: "By asking 'Why?' five successive times, teams uncover the deep root cause rather than treating superficial symptoms."
      }
    ],
    assignments: [
      {
        id: 'a_s09',
        title: "Community Need Observation Report & HMW Statement",
        description: "Conduct 15 community observations in your local environment (agriculture, sanitation, energy, healthcare, or logistics) and formulate 1 definitive How Might We (HMW) statement.",
        deliverables: ["HMW Problem Brief Document"]
      }
    ],
    projects: [
      {
        id: 'p_s09',
        title: "Robot Problem-Solution Canvas",
        description: "Complete the 1-page YARIA Problem-Solution Canvas outlining Target User, Pain Point, Robotic Solution, Key Features, and Measurable Impact Metric.",
        objectives: ["Validate technological feasibility.", "Estimate social/economic impact."]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=J32V4Wn32d0",
    resources: [
      {
        title: "Robotics Bill of Materials (BOM) & Power Budget Spreadsheet Template",
        url: "https://yaria.org/templates/bom-power-budget",
        type: "doc",
        description: "Template for tracking components, voltages, mAh capacities, and total costs"
      }
    ],
    questions: [
      {
        id: 'q_s10_1',
        question: "If your robot draws an average of 400mA continuous current and you use a 2000mAh Lithium battery pack, what is the estimated operating runtime?",
        options: ["Approx. 5.0 hours (2000 / 400)", "Approx. 20 minutes", "Approx. 50 hours", "Approx. 1 hour"],
        correctIndex: 0,
        explanation: "Runtime = Battery Capacity (mAh) / Average Current Draw (mA) = 2000mAh / 400mA = 5.0 hours."
      }
    ],
    assignments: [
      {
        id: 'a_s10',
        title: "Complete Bill of Materials (BOM) & Power Budget",
        description: "List every component, supplier link, unit cost, operating voltage, and maximum current draw for your final robot project.",
        deliverables: ["Completed BOM spreadsheet / document"]
      }
    ],
    projects: [
      {
        id: 'p_s10',
        title: "Step-by-Step Mechanical & Electrical Build Blueprint",
        description: "Draft the comprehensive build sequence with assembly diagrams, pin assignment tables, and testing checkpoints for physical assembly day.",
        objectives: ["Prevent wiring conflicts.", "Establish clear milestone checkpoints."]
      }
    ],
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
    video_url: "https://www.youtube.com/watch?v=FqS7b_W9d-M",
    resources: [
      {
        title: "The 90-Second Tech Pitch Master Script Framework",
        url: "https://yaria.org/pitch-framework",
        type: "doc",
        description: "Hook -> Problem -> Robotic Solution -> Live Demo -> Vision & Next Steps"
      }
    ],
    questions: [
      {
        id: 'q_s11_1',
        question: "What are the 5 core elements of the YARA 90-Second Pitch Framework in order?",
        options: [
          "Hook/Problem, Solution, How it Works (Tech), Live Demo/Proof, Vision/Call-to-Action",
          "Greetings, Reading the Entire Code, Price of each screw, Apologies, Goodbye",
          "Company history, 40-slide PowerPoint, Financial balance sheet, Spec sheet, Q&A",
          "Silence for 60 seconds followed by a 30-second applause"
        ],
        correctIndex: 0,
        explanation: "A high-impact 90s pitch starts with the Problem hook, demonstrates the Solution, explains the engineering, shows real results, and invites collaboration."
      }
    ],
    assignments: [
      {
        id: 'a_s11',
        title: "90-Second Pitch Video Recording or Script Submission",
        description: "Record a 90-second pitch introducing yourself, your robot's purpose, the engineering architecture, and the community impact it solves.",
        deliverables: ["Video link (YouTube / Loom / Google Drive) or verbatim pitch script"]
      }
    ],
    projects: [
      {
        id: 'p_s11',
        title: "Final Pre-Build Readiness Signoff Package",
        description: "Compile code repositories, Wokwi simulation proofs, schematic diagrams, and pitch scripts into the unified capstone dossier.",
        objectives: ["Achieve 100% pre-build certification readiness."]
      }
    ],
    details: {
      theory: [
        "The 5-Part Pitch Framework (Problem, Solution, How it Works, Demo, Vision).",
        "The Teach-Back concept.",
        "Physical Day 1 & Day 2 logistics briefing."
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
    description: "Hands-on lab day focusing on real hardware wiring, breadboarding, and multimeter diagnostics.",
    video_url: "https://www.youtube.com/watch?v=6v70xQoA3tY",
    resources: [
      {
        title: "Benchtop Soldering & Wiring Safety Standards",
        url: "https://yaria.org/lab-safety",
        type: "doc",
        description: "Ventilation, heat dissipation, and wire stripping best practices"
      }
    ],
    questions: [
      {
        id: 'q_p01_1',
        question: "When powering your Arduino Uno and motor driver from a 2-cell 7.4V Li-ion pack, why must the ground (GND) lines be connected together?",
        options: [
          "To provide a common 0V voltage reference for control logic signals",
          "To make the battery charge faster",
          "It is not necessary and should be avoided",
          "To double the total battery capacity"
        ],
        correctIndex: 0,
        explanation: "Without a common ground, logic HIGH signals sent from the microcontroller have no reference return path, causing motor drivers to fail or behave erratically."
      }
    ],
    assignments: [
      {
        id: 'a_p01',
        title: "Physical Benchtop Voltage & Current Logbook",
        description: "Measure and record DC voltage at battery terminals, Arduino 5V regulator output, and motor driver power inputs under both idle and load conditions.",
        deliverables: ["Benchtop Measurement Log Sheet"]
      }
    ],
    projects: [
      {
        id: 'p_p01',
        title: "Live Sensor Calibration Station",
        description: "Perform real-world calibration on your ultrasonic distance sensor and infrared optical sensors across known measured distance markers (5cm, 10cm, 20cm, 50cm).",
        objectives: ["Construct calibration lookup table and accuracy error curve."]
      }
    ],
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
    description: "Intensive build day where the robot vision becomes a physical reality on wheels.",
    video_url: "https://www.youtube.com/watch?v=0hO1m_W7dE8",
    resources: [
      {
        title: "Hardware Assembly & Motor Driver Debugging Guide",
        url: "https://yaria.org/hardware-troubleshooting",
        type: "doc",
        description: "How to isolate motor polarity mismatches, dead zones, and loose breadboard jumpers"
      }
    ],
    questions: [
      {
        id: 'q_p02_1',
        question: "If one of the robot's DC motors spins backward while the other spins forward during a straight move command, what is the quickest fix?",
        options: [
          "Swap the two wire connections of that specific motor on the L298N terminal block",
          "Replace the entire Arduino board",
          "Charge the battery for 10 hours",
          "Cut all wires and start from scratch"
        ],
        correctIndex: 0,
        explanation: "DC motor direction is determined by DC polarity. Swapping the motor's two wire leads instantly inverts its rotation direction."
      }
    ],
    assignments: [
      {
        id: 'a_p02',
        title: "Hardware Assembly Milestone Inspection Checklist",
        description: "Verify mechanical chassis rigidity, wheel alignment, battery security, cable strain relief, and emergency cut-off switch operation.",
        deliverables: ["Signed Inspector Verification Checklist"]
      }
    ],
    projects: [
      {
        id: 'p_p02',
        title: "Physical Robot Obstacle Arena Course Run",
        description: "Deploy the complete physical robot in the physical arena maze to navigate through obstacles autonomously for 60 seconds without collisions.",
        objectives: ["Demonstrate autonomous collision-free mobility."]
      }
    ],
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
    description: "Final presentation to the community, technical judges, and certification ceremony.",
    video_url: "https://www.youtube.com/watch?v=Vq7a9_XzF9w",
    resources: [
      {
        title: "YARIA Official Judging Rubric & Assessment Criteria",
        url: "https://yaria.org/rubric",
        type: "doc",
        description: "Scoring dimensions: Engineering Rigor (30%), Innovation (25%), Demonstration (25%), Pitch (20%)"
      }
    ],
    questions: [
      {
        id: 'q_p03_1',
        question: "What is the hallmark of a world-class engineering showcase demo?",
        options: [
          "A live, repeatable demonstration showing how the hardware solves the intended real-world problem effectively",
          "Making excuses about missing batteries",
          "Refusing to turn on the robot during the presentation",
          "Claiming the robot works without showing it"
        ],
        correctIndex: 0,
        explanation: "Judges and community stakeholders look for clear, demonstrable engineering functionality paired with genuine problem solving."
      }
    ],
    assignments: [
      {
        id: 'a_p03',
        title: "Final Capstone Project Documentation Dossier",
        description: "Submit final GitHub repository URL, YouTube video demo link, wiring schematic, and written technical summary.",
        deliverables: ["Capstone Repository URL + Demonstration Video URL"]
      }
    ],
    projects: [
      {
        id: 'p_p03',
        title: "Live Showcase Pitch & Community Demo",
        description: "Deliver your 90-second pitch on stage, execute a live obstacle/task demonstration, and answer technical questions from the panel of judges.",
        objectives: ["Achieve official graduation and certification."]
      }
    ],
    details: {
      activities: [
        "Final Pitch & Demo to guest judges.",
        "Teach-Back session to visitors.",
        "Awarding of YARA Robotics & Innovation Certificate."
      ]
    }
  }
];

export const FINAL_EXAM_QUESTIONS: FinalExamQuestion[] = [
  {
    id: 'fe_01',
    category: 'Electronics',
    question: "Using Ohm's Law (V = I × R), what voltage is needed to drive a current of 25mA (0.025A) across a 400-Ohm resistance?",
    options: ["10 Volts", "1.6 Volts", "16 Volts", "100 Volts"],
    correctIndex: 0,
    explanation: "V = I × R = 0.025 A × 400 Ω = 10.0 Volts."
  },
  {
    id: 'fe_02',
    category: 'Electronics',
    question: "An Arduino digital I/O pin outputs 5.0V. You need to connect a Blue LED (Vforward = 3.0V) with a target current of 20mA (0.02A). What resistor is required?",
    options: ["100 Ohms", "220 Ohms", "330 Ohms", "1000 Ohms"],
    correctIndex: 0,
    explanation: "R = (5.0V - 3.0V) / 0.02A = 2.0V / 0.02A = 100 Ohms."
  },
  {
    id: 'fe_03',
    category: 'Electronics',
    question: "What is the total equivalent resistance of two 500-Ohm resistors wired in parallel?",
    options: ["250 Ohms", "1000 Ohms", "500 Ohms", "125 Ohms"],
    correctIndex: 0,
    explanation: "For parallel identical resistors: Rtotal = R / 2 = 500Ω / 2 = 250 Ohms."
  },
  {
    id: 'fe_04',
    category: 'Safety & Innovation',
    question: "Why is a flyback diode connected in reverse-bias across an inductive DC relay coil or motor?",
    options: [
      "To clamp and dissipate high-voltage inductive kickback spikes when the magnetic field collapses",
      "To convert 12V battery power into 5V for the microcontroller",
      "To light up when the motor is turning backward",
      "To increase the rotational speed of the motor by 2x"
    ],
    correctIndex: 0,
    explanation: "Inductors resist sudden changes in current and generate high voltage spikes upon turn-off. The flyback diode safely discharges this current."
  },
  {
    id: 'fe_05',
    category: 'Programming',
    question: "What is the fundamental difference between delay(2000) and using a millis() timestamp comparison in Arduino?",
    options: [
      "delay() stops all CPU instruction execution (blocking), while millis() enables non-blocking asynchronous timing",
      "delay() runs on battery power while millis() requires AC mains power",
      "millis() can only measure intervals shorter than 10 milliseconds",
      "There is no difference; they are exact synonyms"
    ],
    correctIndex: 0,
    explanation: "delay() locks the processor in a busy loop, preventing reading sensors or reacting to events. millis() allows checking time elapsed while continuing to run loop code."
  },
  {
    id: 'fe_06',
    category: 'Programming',
    question: "Which pinMode configuration enables the internal pull-up resistor on an Arduino input pin, eliminating the need for an external resistor with a push button to GND?",
    options: ["pinMode(pin, INPUT_PULLUP)", "pinMode(pin, INPUT)", "pinMode(pin, OUTPUT)", "pinMode(pin, HIGH)"],
    correctIndex: 0,
    explanation: "INPUT_PULLUP turns on the internal ~20kΩ pull-up resistor inside the ATmega chip, holding the pin at 5V until the button grounds it."
  },
  {
    id: 'fe_07',
    category: 'Robotics Architecture',
    question: "On an HC-SR04 Ultrasonic sensor, after sending a 10µs HIGH trigger pulse, what does the duration of the HIGH signal on the Echo pin represent?",
    options: [
      "The round-trip flight time of the ultrasonic sound wave from the sensor to the obstacle and back",
      "The ambient temperature of the room in Celsius",
      "The battery charge level remaining in the robot",
      "The electrical resistance of the obstacle"
    ],
    correctIndex: 0,
    explanation: "The Echo pin goes HIGH for the exact duration the sound pulse took to travel to the obstacle and reflect back to the receiver."
  },
  {
    id: 'fe_08',
    category: 'Robotics Architecture',
    question: "Why should high-current DC motors and servos NOT be powered directly from the 5V pin of an Arduino Uno board?",
    options: [
      "Motor stall currents easily exceed the onboard voltage regulator limit (~500mA), leading to brownouts, CPU resets, or thermal destruction",
      "Arduino 5V output produces alternating current (AC)",
      "DC motors only operate when supplied with 120V mains power",
      "The 5V pin is strictly an input pin and cannot output voltage"
    ],
    correctIndex: 0,
    explanation: "Motors draw high stall and surge currents that will cause the Arduino voltage regulator to drop voltage (causing reset loops) or burn out."
  },
  {
    id: 'fe_09',
    category: 'Electronics',
    question: "When using a digital multimeter to verify that there are no short circuits between the 5V power rail and GND before applying battery power, which setting is safest?",
    options: [
      "Continuity (Buzzer / Diode) mode with all power sources disconnected",
      "10A DC Current mode with full battery power connected",
      "750V AC Voltage mode",
      "Transistor hFE mode with battery connected"
    ],
    correctIndex: 0,
    explanation: "Always test continuity on unpowered circuits. A continuous beep indicates an unwanted 0-Ohm short between positive and negative rails."
  },
  {
    id: 'fe_10',
    category: 'Programming',
    question: "What will analogRead(A0) return on an Arduino Uno when the input voltage at pin A0 is 2.5V (half of the 5.0V reference)?",
    options: ["Approximately 511 to 512", "Approximately 255", "Approximately 1023", "Approximately 50"],
    correctIndex: 0,
    explanation: "The 10-bit ADC maps 0V to 0 and 5V to 1023. At 2.5V: 1023 × (2.5 / 5.0) ≈ 511.5."
  },
  {
    id: 'fe_11',
    category: 'Robotics Architecture',
    question: "To make a 2-wheel differential drive mobile robot spin in place clockwise (pivot right on its center), how should the motors be driven?",
    options: [
      "Left Motor Forward, Right Motor Backward (Reverse)",
      "Left Motor Backward, Right Motor Forward",
      "Both Motors Forward at equal speed",
      "Both Motors Stopped"
    ],
    correctIndex: 0,
    explanation: "Opposite motor directions generate equal and opposite wheel torques, causing a zero-turning-radius clockwise rotation about the robot's midpoint."
  },
  {
    id: 'fe_12',
    category: 'Safety & Innovation',
    question: "In the 5 Whys root cause methodology, what is the core objective?",
    options: [
      "To repeatedly probe beneath surface symptoms until the fundamental systemic failure cause is exposed",
      "To ask five different engineers why they failed",
      "To count the number of components in a circuit",
      "To test a robot five times before demoing"
    ],
    correctIndex: 0,
    explanation: "By asking 'Why?' at least 5 times in sequence, teams drill past superficial effects down to the true root cause."
  }
];


