import { YARALmsSession, YARACourseLevel, YARAKitItem } from '../types/yaraLms';
import { YARA_LEARNING_LEVELS, YARA_ROBOTICS_STARTER_KIT } from './yaraLmsData';
import { ALL_YARA_SESSIONS } from './yaraLmsSessionsComplete';
import { YARA_SESSIONS_LEVELS_4_TO_8 } from './yaraLmsLevels4to8';
import { YARA_SESSIONS_LEVELS_6_TO_8 } from './yaraLmsLevels6to8';

// Merge all sessions into a single authoritative catalog
export const COMPLETE_YARA_SESSIONS: YARALmsSession[] = [
  ...ALL_YARA_SESSIONS,
  ...YARA_SESSIONS_LEVELS_4_TO_8,
  ...YARA_SESSIONS_LEVELS_6_TO_8
];

export { YARA_LEARNING_LEVELS, YARA_ROBOTICS_STARTER_KIT };

// Additional Hardware Kit Options for Store / Inquiries
export const YARA_HARDWARE_KITS: YARAKitItem[] = [
  YARA_ROBOTICS_STARTER_KIT,
  {
    id: 'yara_electronics_lab_kit',
    title: 'YARA Level 1 Electronics Pioneer Kit',
    subtitle: 'Everything needed for breadboarding, multimeter diagnostics & sensor basics',
    priceUsd: 15,
    description: 'Specially assembled for Level 0 and Level 1 beginners. Includes full breadboard, digital multimeter with probes, 50x resistors, 15x LEDs, 4x transistors, diodes, capacitors, push buttons, buzzer, and LDR light sensors.',
    imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
    includedComponents: [
      'Digital Multimeter with Test Leads',
      '830-Point Solderless Breadboard',
      '50x Resistors Assortment',
      '15x LEDs (Red, Green, Yellow, Blue)',
      '4x NPN Transistors (2N2222/BC547)',
      '4x 1N4007 Diodes',
      '1x 5V Active Buzzer',
      '2x LDR Photoresistors',
      '4x Tactile Push Buttons',
      '30x Breadboard Jumper Wires',
      '9V Battery with Snap Connector'
    ],
    suitableLevels: [0, 1],
    inStock: true,
    contactInquiryPhone: '0717468236'
  },
  {
    id: 'yara_iot_ai_expansion_pack',
    title: 'YARA IoT, Telemetry & Edge AI Expansion Pack',
    subtitle: 'ESP32 Dual-Core, OLED Display, Wi-Fi Telemetry & Sensor Suite',
    priceUsd: 20,
    description: 'Designed for Level 6 and Level 7 explorers. Includes high-speed ESP32 DevKit, 0.96" I2C OLED display, DHT22 high-accuracy climate sensor, and jumper wiring.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    includedComponents: [
      'ESP32 Dual-Core 240MHz Wi-Fi + Bluetooth DevKit Board',
      '0.96" I2C 128x64 Blue/Yellow OLED Display',
      'DHT22 High-Precision Temperature & Humidity Sensor',
      'Micro-USB High-Speed Telemetry Cable',
      'Female-to-Female Jumper Wires'
    ],
    suitableLevels: [6, 7, 8],
    inStock: true,
    contactInquiryPhone: '0717468236'
  }
];

export function getSessionById(sessionId: string): YARALmsSession | undefined {
  return COMPLETE_YARA_SESSIONS.find(s => s.id === sessionId);
}

export function getSessionsByLevel(levelNumber: number): YARALmsSession[] {
  return COMPLETE_YARA_SESSIONS.filter(s => s.levelNumber === levelNumber);
}

export function getLevelDetails(levelNumber: number): YARACourseLevel | undefined {
  return YARA_LEARNING_LEVELS.find(l => l.levelNumber === levelNumber);
}
