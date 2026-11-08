import { ShopProduct } from '../types/shop';

export const OFFICIAL_SHOP_PRODUCTS: ShopProduct[] = [
  // 1. STARTER & EXPANSION KITS
  {
    id: 'yara-starter-kit-2026',
    title: 'YARA Robotics & Innovation Starter Kit',
    subtitle: 'The flagship complete physical toolkit for beginners to advanced engineers',
    category: 'kits',
    categoryLabel: 'Complete Kit',
    priceUsd: 35,
    description: 'The all-in-one authoritative kit required for hands-on learning across YARA Academy and competitive robotics. Contains genuine microcontrollers, chassis, motors, sensors, breadboards, multimeter, and hardware components.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    badge: 'Best Seller',
    suitableLevels: 'Levels 0 to 8',
    inStock: true,
    includedComponents: [
      'Arduino Uno R3 / ESP32 Dual-Core DevKit Microcontroller',
      '2WD Laser-Cut Acrylic Robot Chassis Platform with Standoffs',
      '2x High-Torque 3V–6V TT Geared DC Motors with Rubber Wheels',
      '1x L298N Dual H-Bridge Motor Driver Controller',
      '1x HC-SR04 Ultrasonic Distance Sensor + SG90 Servo Motor',
      '2x TCRT5000 Infrared Line-Tracking Proximity Modules',
      '1x Digital Multimeter with Heavy-Duty Test Probes',
      '1x 830-Point Solderless Breadboard with Power Rails',
      '65x Multicolored Assorted Jumper Wires',
      '50x Resistors, 15x LEDs, 4x Transistors, Buzzer, LDRs, 4xAA Battery Holder'
    ],
    specifications: [
      'Microcontroller: ESP32 / ATmega328P',
      'Chassis Material: High-impact acrylic',
      'Power Supply: 4x AA Batteries (included battery holder)',
      'Compatible OS: Windows, macOS, Linux, ChromeOS'
    ]
  },
  {
    id: 'yara-electronics-lab-kit',
    title: 'YARA Level 1 Electronics Pioneer Kit',
    subtitle: 'Essential laboratory toolkit for breadboarding, circuit testing & sensor basics',
    category: 'kits',
    categoryLabel: 'Complete Kit',
    priceUsd: 15,
    description: 'Designed specifically for schools, teachers, and beginners learning basic electronics, Ohm’s law, multimeter testing, and analog circuit design.',
    imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
    badge: 'Popular for Schools',
    suitableLevels: 'Levels 0 & 1',
    inStock: true,
    includedComponents: [
      'Digital Multimeter with Test Leads & Continuity Buzzer',
      '830-Point Solderless Breadboard with Double Power Rails',
      '50x Assorted Metal Film Resistors (100Ω to 1MΩ)',
      '15x Ultra-Bright 5mm LEDs (Red, Green, Yellow, Blue)',
      '4x NPN Transistors (2N2222 / BC547)',
      '4x 1N4007 Rectifier Diodes',
      '1x 5V Active Sound Buzzer',
      '2x LDR Optical Light Sensors',
      '4x Tactile Momentary Push Buttons',
      '30x Male-to-Male Jumper Wires',
      '9V Battery with Snap Connector Clip'
    ],
    specifications: [
      'Operating Voltage: 3.3V – 9V DC',
      'Diagnostics: Complete digital multimeter included',
      'Breadboard Capacity: 830 tie points'
    ]
  },
  {
    id: 'yara-iot-ai-expansion-pack',
    title: 'YARA IoT, Telemetry & Edge AI Expansion Pack',
    subtitle: 'ESP32 Dual-Core, OLED telemetry screen, high-precision climate & cloud telemetry',
    category: 'kits',
    categoryLabel: 'Expansion Pack',
    priceUsd: 20,
    description: 'Upgrades any standard robotics chassis into a cloud-connected smart robot with live Wi-Fi telemetry dashboards, graphics rendering, and environmental data logging.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    badge: 'Advanced IoT',
    suitableLevels: 'Levels 6 & 7',
    inStock: true,
    includedComponents: [
      'ESP32 Dual-Core 240MHz Wi-Fi + Bluetooth BLE DevKit Board',
      '0.96" I2C 128x64 Blue/Yellow OLED Display Module',
      'DHT22 High-Precision Digital Temperature & Humidity Sensor',
      'High-Speed Shielded Micro-USB Programming Cable',
      'Female-to-Female & Male-to-Female Jumper Wire Pack'
    ],
    specifications: [
      'Wireless: 802.11 b/g/n Wi-Fi + BLE 4.2',
      'Clock Speed: 240 MHz Dual Core',
      'Display: 0.96 inch SSD1306 OLED via I2C',
      'Sensor Accuracy: ±0.5°C temp, ±2% RH'
    ]
  },
  {
    id: 'yara-micromouse-chassis-kit',
    title: 'Autonomous Maze Micromouse Chassis Kit',
    subtitle: 'Precision 2WD chassis engineered for autonomous maze solving and line following derby',
    category: 'kits',
    categoryLabel: 'Chassis Kit',
    priceUsd: 25,
    description: 'Lightweight, balanced acrylic mobile robot chassis featuring high-speed gear motors, rubber grip tires, omni-directional steel ball caster, and mounting brackets for up to 3 ultrasonic sensors.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    badge: 'Championship Grade',
    suitableLevels: 'Levels 4 & 5',
    inStock: true,
    includedComponents: [
      'Dual-Layer CNC Cut Acrylic Robot Platform',
      '2x High-Torque 1:48 Ratio TT DC Gear Motors',
      '2x 65mm High-Traction Rubber Grip Wheels',
      '1x 360-Degree Steel Ball Caster Wheel',
      '3x Ultrasonic Sensor Mounting Acrylic Brackets',
      'Complete Screws, Spacers & Standoffs Fastener Kit',
      'Battery Holder with Switch'
    ]
  },

  // 2. MICROCONTROLLERS & DEVELOPMENT BOARDS
  {
    id: 'esp32-devkit-v1',
    title: 'ESP32-WROOM-32 Dual-Core 38-Pin DevKit',
    subtitle: 'Industry-standard 240MHz IoT microcontroller with integrated Wi-Fi and Bluetooth',
    category: 'microcontrollers',
    categoryLabel: 'Microcontroller',
    priceUsd: 8,
    description: 'The premier microcontroller for modern robotics, IoT telemetry, WebSockets motor control, and MicroPython / C++ embedded development.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    badge: 'Top Pick',
    inStock: true,
    specifications: [
      'CPU: Xtensa dual-core 32-bit LX6 microprocessor, up to 240 MHz',
      'Memory: 520 KB SRAM, 4 MB Flash',
      'Connectivity: Wi-Fi 802.11 b/g/n, Bluetooth v4.2 BR/EDR and BLE',
      'GPIO: 38 pins with ADC, DAC, I2C, SPI, UART, PWM'
    ]
  },
  {
    id: 'arduino-uno-r3-board',
    title: 'Arduino Uno R3 Compatible Microcontroller Board',
    subtitle: 'The timeless learning microcontroller board with ATmega328P processor',
    category: 'microcontrollers',
    categoryLabel: 'Microcontroller',
    priceUsd: 7,
    description: 'Ideal for beginners and electronics students. Easily connects to the free Arduino IDE, Wokwi simulator, and Scratch block programming tools. High-speed USB cable included.',
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Microcontroller: ATmega328P',
      'Operating Voltage: 5V',
      'Digital I/O: 14 pins (6 provide PWM output)',
      'Analog Inputs: 6 pins',
      'Clock Speed: 16 MHz'
    ]
  },
  {
    id: 'raspberry-pi-pico',
    title: 'Raspberry Pi Pico (RP2040 Dual-Core)',
    subtitle: 'High-performance, low-cost microcontroller board built on Raspberry Pi silicon',
    category: 'microcontrollers',
    categoryLabel: 'Microcontroller',
    priceUsd: 6,
    description: 'Designed by Raspberry Pi, featuring dual-core Arm Cortex M0+, 2MB flash, flexible clocking up to 133MHz, and programmable I/O (PIO) state machines.',
    imageUrl: 'https://images.unsplash.com/photo-1608157711253-4f8f4540543d?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Processor: Dual-core Arm Cortex-M0+ @ 133MHz',
      'SRAM: 264KB on-chip SRAM',
      'Flash: 2MB on-board QSPI Flash',
      'PIO: 8 programmable I/O state machines'
    ]
  },

  // 3. SENSORS & ACTUATORS
  {
    id: 'sensor-ultrasonic-hcsr04',
    title: 'HC-SR04 Ultrasonic Distance Sensor Module',
    subtitle: 'Non-contact distance measurement module for obstacle avoidance & navigation',
    category: 'sensors',
    categoryLabel: 'Sensor',
    priceUsd: 3,
    description: 'Provides 2cm to 400cm non-contact distance measuring with high accuracy and stable readings. Includes ultrasonic transmitter, receiver and control circuit.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Working Voltage: 5V DC',
      'Range: 2cm – 400cm',
      'Measuring Angle: 15 degrees',
      'Trigger Input: 10µs TTL pulse'
    ]
  },
  {
    id: 'sensor-line-tcrt5000',
    title: 'TCRT5000 Dual Infrared Line-Tracking Module',
    subtitle: 'High-sensitivity optical reflection sensor for robot line tracking and edge detection',
    category: 'sensors',
    categoryLabel: 'Sensor',
    priceUsd: 4,
    description: 'Equipped with TCRT5000 IR reflective sensor and LM393 comparator. Features onboard sensitivity adjustment potentiometer and clean digital output.',
    imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Operating Voltage: 3.3V – 5V DC',
      'Detection Distance: 1mm – 25mm',
      'Output Type: Clean digital switching signal (0 and 1)'
    ]
  },
  {
    id: 'servo-sg90-9g',
    title: 'SG90 9g Precision Micro Servo Motor',
    subtitle: 'Lightweight micro servo for robotic grippers, steering mechanisms & ultrasonic scanners',
    category: 'sensors',
    categoryLabel: 'Actuator',
    priceUsd: 3.5,
    description: 'Compact, high-torque micro servo motor capable of 180-degree rotation. Includes full set of control horns, arms, and mounting screws.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Operating Voltage: 4.8V – 6V DC',
      'Stall Torque: 1.8 kg/cm (4.8V)',
      'Rotation: 180 degrees',
      'Weight: 9 grams'
    ]
  },
  {
    id: 'oled-display-096-i2c',
    title: '0.96" I2C Blue/Yellow 128x64 OLED Display Module',
    subtitle: 'Crisp graphics and text display with ultra-low power consumption and 4-pin I2C',
    category: 'sensors',
    categoryLabel: 'Display',
    priceUsd: 4.5,
    description: 'High-contrast OLED display module compatible with Arduino, ESP32, and Raspberry Pi. Requires only 2 data pins (SDA, SCL) to display sensor telemetry and robot status.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Resolution: 128 x 64 pixels',
      'Interface: I2C (Address 0x3C)',
      'Supply Voltage: 3.3V – 5V DC',
      'Driver IC: SSD1306'
    ]
  },

  // 4. MOTORS, DRIVERS & POWER
  {
    id: 'motor-driver-l298n',
    title: 'L298N Dual H-Bridge DC & Stepper Motor Driver',
    subtitle: 'High-power motor controller module with heat sink and 5V onboard regulator',
    category: 'motors',
    categoryLabel: 'Driver',
    priceUsd: 4,
    description: 'Drives up to two DC motors independently with direction and PWM speed control, or one 4-wire two-phase stepper motor. Built-in heavy aluminum heat sink.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Driver Chip: L298N Dual H-Bridge',
      'Motor Drive Voltage: 5V – 35V DC',
      'Peak Current: 2A per bridge',
      'Logic Voltage: 5V'
    ]
  },
  {
    id: 'tt-gear-motor-wheels-pair',
    title: 'TT Geared DC Motors with Rubber Wheels (Pair)',
    subtitle: 'Dual 3V–6V high-torque gear motors with matching 65mm rubber grip robot tires',
    category: 'motors',
    categoryLabel: 'Motor & Wheel',
    priceUsd: 5,
    description: 'Standard drive units for autonomous mobile robots. Geared down for high torque and smooth controllable speed on classroom floors, mazes, and competition arenas.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Gear Ratio: 1:48',
      'Operating Voltage: 3V – 6V DC',
      'Wheel Diameter: 65mm, Width: 27mm',
      'Tire Material: Flexible high-traction rubber'
    ]
  },

  // 5. COMPONENTS & BENCH TOOLS
  {
    id: 'digital-multimeter-pro',
    title: 'Digital Multimeter with Test Probes & Continuity Buzzer',
    subtitle: 'Essential diagnostic tool for voltage, current, resistance & circuit continuity',
    category: 'components',
    categoryLabel: 'Lab Tool',
    priceUsd: 8,
    description: 'Accurate handheld digital multimeter essential for bench electronics, troubleshooting short circuits, battery level testing, and sensor calibration.',
    imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Measurement: AC/DC Voltage, DC Current, Resistance',
      'Features: Diode test, Transistor hFE test, Audible continuity buzzer',
      'Includes: High-grade red/black test probes and 9V battery'
    ]
  },
  {
    id: 'breadboard-830-points',
    title: 'Full-Size 830-Point Solderless Breadboard',
    subtitle: 'Premium prototyping breadboard with colored positive & negative power distribution rails',
    category: 'components',
    categoryLabel: 'Prototyping',
    priceUsd: 3.5,
    description: 'High-durability solderless breadboard with nickel-plated spring clips and standard 2.54mm (0.1") pin spacing. Self-adhesive backing for secure mounting.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Tie Points: 630 terminal points + 200 distribution points',
      'Pitch: Standard 2.54mm (0.1")',
      'Mounting: Heavy-duty peel-and-stick adhesive foam backing'
    ]
  },
  {
    id: 'jumper-wires-65-pack',
    title: '65-Piece Assorted Flexible Jumper Wire Bundle',
    subtitle: 'Multicolored solderless breadboard interconnect wires with molded connector pins',
    category: 'components',
    categoryLabel: 'Wiring',
    priceUsd: 3,
    description: 'High-flexibility multi-strand copper wire set in assorted lengths (10cm, 15cm, 20cm, 25cm). Eliminates clutter and loose connections on robotics workbenches.',
    imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Quantity: 65 wires per bundle',
      'Lengths: 4 different standard wire lengths',
      'Colors: Black, Red, Blue, Green, Yellow, White, Orange'
    ]
  },
  {
    id: 'electronics-assortment-pack',
    title: 'Complete Electronics Components Assortment Pack',
    subtitle: '50x resistors, 20x LEDs, 4x transistors, diodes, capacitors, buttons & buzzer',
    category: 'components',
    categoryLabel: 'Component Pack',
    priceUsd: 4.5,
    description: 'The standard replenishment pack for school clubs and student inventors. Contains all basic passive and active discrete components for 10+ lab experiments.',
    imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    specifications: [
      'Resistors: 50x (100Ω, 220Ω, 330Ω, 1kΩ, 4.7kΩ, 10kΩ, 100kΩ)',
      'LEDs: 20x 5mm (Red, Green, Yellow, Blue)',
      'Transistors: 4x NPN (2N2222 / BC547)',
      'Diodes: 4x 1N4007',
      'Audible: 1x 5V Active Buzzer, 4x Push buttons, 2x Photoresistors'
    ]
  }
];

