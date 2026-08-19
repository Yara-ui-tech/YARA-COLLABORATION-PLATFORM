import { BrainstormingQuestion } from '../types/brainstorming';

export const INITIAL_BRAINSTORMING_QUESTIONS: BrainstormingQuestion[] = [
  {
    id: 'bq_01',
    title: 'The Blown LED Diagnosis',
    category: 'circuit_fault',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    question: 'Look at this direct circuit scenario: A student connects a 5V power supply directly to a standard 2.0V red LED without any resistor. The LED flashes once with bright white-yellow light and goes permanently dark. What was the critical error?',
    options: [
      'Current was unrestricted (I = V/R where R≈0), burning the semiconductor PN junction',
      'The 5V DC voltage was too low to excite electrons in the LED',
      'The LED polarity was backwards and caused reverse breakdown',
      'The wires had too much internal resistance causing heat buildup'
    ],
    correctIndex: 0,
    hint: 'Think of Ohm’s Law: I = V / R. When resistance is close to 0 ohms, current reaches dangerous levels.',
    critical_thinking_principle: 'Current Limiting & Safe Operating Area (SOA)',
    explanation: 'LEDs have almost zero internal resistance once forward biased past threshold. Without a series resistor (e.g. 220Ω), current surges far beyond the 20mA maximum limit, instantly destroying the crystal PN junction due to thermal shock.',
    points: 100
  },
  {
    id: 'bq_02',
    title: 'Autonomous Rover Obstacle Dilemma',
    category: 'robot_navigation',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    question: 'A two-wheel differential drive robot equipped with a single forward-facing Ultrasonic sensor detects an obstacle at 12cm directly ahead. Which motor command sequence will execute an immediate clean 90-degree pivot turn to the RIGHT?',
    options: [
      'Left Motor: FORWARD (PWM 180), Right Motor: REVERSE (PWM 180)',
      'Left Motor: STOP (PWM 0), Right Motor: FORWARD (PWM 180)',
      'Left Motor: FORWARD (PWM 180), Right Motor: FORWARD (PWM 180)',
      'Left Motor: REVERSE (PWM 180), Right Motor: REVERSE (PWM 180)'
    ],
    correctIndex: 0,
    hint: 'To spin in place without moving forward into the wall, wheels on opposite sides must rotate in opposite directions.',
    critical_thinking_principle: 'Differential Kinematics & Angular Velocity',
    explanation: 'To pivot in place clockwise (right), the left wheel must push forward while the right wheel pulls in reverse. This creates a pure rotational torque around the robot’s center of mass with zero linear displacement.',
    points: 100
  },
  {
    id: 'bq_03',
    title: 'Floating Pin Logic Glitch',
    category: 'circuit_fault',
    difficulty: 'intermediate',
    image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
    question: 'A student connects a push button between digital Pin 2 and 5V. When the button is NOT pressed, digitalRead(2) randomly flips between HIGH (1) and LOW (0) every few milliseconds. What is causing this phantom trigger?',
    options: [
      'The input pin is floating without a pull-down or pull-up resistor, picking up electromagnetic ambient noise',
      'The microcontroller clock frequency is too slow for the button',
      'The digital pin is defective and has a blown internal gate',
      'The power rail voltage is too high for the switch'
    ],
    correctIndex: 0,
    hint: 'When a digital wire is not connected to either HIGH (5V) or LOW (GND), what voltage is it at?',
    critical_thinking_principle: 'Deterministic Digital States & Pull-Up/Down Resistors',
    explanation: 'A high-impedance digital input pin acting as an antenna catches stray electrostatic charge when left open-circuit (floating). Adding a 10kΩ pull-down resistor to GND (or enabling internal INPUT_PULLUP) forces a clean deterministic state.',
    points: 120
  },
  {
    id: 'bq_04',
    title: 'Motor Driver Back-EMF Spike Protection',
    category: 'schematic_analysis',
    difficulty: 'intermediate',
    image_url: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=800&q=80',
    question: 'When an inductive DC motor or relay coil is suddenly turned OFF, why do engineers always place a flyback diode (freewheeling diode) in reverse parallel across the motor terminals?',
    options: [
      'To safely dissipate the massive reverse high-voltage Back-EMF inductive kick (V = L * di/dt) that would fry the transistor',
      'To increase motor RPM during reverse acceleration',
      'To convert alternating current into direct current for the Arduino',
      'To measure the temperature of the copper coils'
    ],
    correctIndex: 0,
    hint: 'Inductors resist sudden changes in current. What happens when you abruptly cut current to an energized coil?',
    critical_thinking_principle: 'Lenz’s Law & Inductive Kick Suppression',
    explanation: 'According to Faraday & Lenz’s Law, collapsing magnetic fields in motor windings produce high-voltage spikes (often 50V–200V). The flyback diode provides a safe closed loop for inductive energy decay, protecting delicate driver MOSFETs.',
    points: 150
  },
  {
    id: 'bq_05',
    title: 'Optical Line Follower Inversion Mystery',
    category: 'code_tracing',
    difficulty: 'beginner',
    image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    question: 'An infrared reflectance sensor (TCRT5000) emits IR light onto a surface. Over white poster board, the sensor output voltage is LOW (0.4V). Over black electrical tape, the output is HIGH (4.8V). Why is the voltage higher over the black surface?',
    options: [
      'Black absorbs IR light, so the phototransistor remains OFF, pulling the signal line HIGH via the pull-up resistor',
      'Black surfaces actively emit electromagnetic radiation into the receiver',
      'White tape creates a short circuit across the infrared LED',
      'The sensor only works when dark objects touch the plastic casing'
    ],
    correctIndex: 0,
    hint: 'Think about reflection vs absorption of light wavelengths.',
    critical_thinking_principle: 'Optoelectronic Reflection & Phototransistor Conduction',
    explanation: 'White surfaces bounce IR light back into the phototransistor base, turning it ON and pulling the signal to GND. Black tape absorbs IR rays; no light bounces back, keeping the phototransistor in cutoff (OFF) and the signal output at Vcc (HIGH).',
    points: 100
  },
  {
    id: 'bq_06',
    title: 'Dual Battery Isolation in Heavy Robots',
    category: 'mechanical_logic',
    difficulty: 'advanced',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    question: 'A competition combat robot has high-torque motor stalls that cause the onboard microcontroller to randomly reboot (Brownout Reset). What is the optimal hardware fix?',
    options: [
      'Separate logic and motor power rails with independent voltage regulation and share a common GND reference',
      'Increase the clock speed of the Arduino microcontroller',
      'Replace all copper wires with aluminum foil leads',
      'Remove the ground wire connecting the motor driver to the battery'
    ],
    correctIndex: 0,
    hint: 'When high-current motors stall, battery terminal voltage drops momentarily below 4.5V (voltage sag).',
    critical_thinking_principle: 'Voltage Sag Mitigation & Ground Plane Integrity',
    explanation: 'Heavy inrush current from DC motor stalls causes battery internal resistance voltage drop (V_sag = I_stall * R_int). Isolating logic power via dedicated buck regulator/separate pack with a unified common ground eliminates brownouts.',
    points: 150
  }
];
