import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const CURRICULUM_SESSIONS = [
  { id: 'S1', title: 'Session 1: Fundamentals of Electricity & Circuits', level: 'Junior', topic: 'Circuit Laws & Breadboarding' },
  { id: 'S2', title: 'Session 2: Introduction to Microcontrollers (Arduino)', level: 'Junior', topic: 'Digital Input/Output & Sensors' },
  { id: 'S3', title: 'Session 3: C++ & Block-Based Programming', level: 'Secondary', topic: 'Loops, Conditional Logic & Functions' },
  { id: 'S4', title: 'Session 4: Motor Controllers & Actuators', level: 'Secondary', topic: 'H-Bridge, PWM & Servo Control' },
  { id: 'S5', title: 'Session 5: Line Following & Obstacle Avoidance', level: 'Secondary', topic: 'IR Sensors & Ultrasonic Distance' },
  { id: 'S6', title: 'Session 6: MicroPython for Embedded Systems', level: 'Tertiary', topic: 'ESP32 & Wireless Telemetry' },
  { id: 'S7', title: 'Session 7: Autonomous Maze Solving Algorithms', level: 'Tertiary', topic: 'Flood Fill & Pathfinding' },
  { id: 'S8', title: 'Session 8: Underwater Drone Systems (ROV)', level: 'Tertiary', topic: 'Waterproof Thrusters & Hydrodynamics' },
];

export default function CurriculumScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Robotics & STEM Roadmap</Text>
      <Text style={styles.subtitle}>Full 2025—2026 Mastery Sessions • Accessible Offline</Text>

      {CURRICULUM_SESSIONS.map((session) => (
        <TouchableOpacity key={session.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.badge}>{session.level}</Text>
            <Text style={styles.sessionId}>{session.id}</Text>
          </View>
          <Text style={styles.cardTitle}>{session.title}</Text>
          <Text style={styles.cardTopic}>Focus: {session.topic}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 20, marginTop: 4 },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justify: 'space-between', justifyContent: 'space-between', marginBottom: 8 },
  badge: { backgroundColor: '#312e81', color: '#a5b4fc', fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sessionId: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  cardTopic: { color: '#cbd5e1', fontSize: 12 },
});
