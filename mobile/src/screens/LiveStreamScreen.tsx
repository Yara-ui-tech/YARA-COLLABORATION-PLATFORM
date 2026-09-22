import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function LiveStreamScreen() {
  const isOnline = useOnlineStatus();
  const [showInternetModal, setShowInternetModal] = useState(false);

  const handleStartStream = () => {
    if (!isOnline) {
      setShowInternetModal(true);
      return;
    }
    alert('Connecting to YARA Mobile Live Streaming Server...');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.badge}>🔴 YARA LIVE MOBILE HUB</Text>
        <Text style={styles.title}>Live Workshops & Broadcasts</Text>
        <Text style={styles.sub}>
          Join live stream masterclasses with African mentors and robotics engineers.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardBadge}>UPCOMING BROADCAST</Text>
        <Text style={styles.cardTitle}>YARA AI & Robotics National Masterclass 2026</Text>
        <Text style={styles.cardDesc}>
          Live interactive stream covering Autonomous Navigation, ROS2 nodes, and hardware sensor integration.
        </Text>
        <TouchableOpacity style={styles.streamBtn} onPress={handleStartStream}>
          <Text style={styles.streamBtnText}>▶ Join / Go Live Stream</Text>
        </TouchableOpacity>
      </View>

      {/* Internet Guard Modal */}
      <Modal transparent visible={showInternetModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>🌐</Text>
            <Text style={styles.modalTitle}>Internet Connection Required</Text>
            <Text style={styles.modalSub}>
              Live video streaming & broadcaster studio require an active online connection. Please connect to Wi-Fi or mobile data and try again.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowInternetModal(false)}
            >
              <Text style={styles.modalCloseText}>Got it, I'll connect online</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16 },
  header: { marginBottom: 20 },
  badge: { color: '#ef4444', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  sub: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardBadge: { color: '#38bdf8', fontSize: 10, fontWeight: '800', marginBottom: 6 },
  cardTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardDesc: { color: '#cbd5e1', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  streamBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  streamBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  modalIcon: { fontSize: 40, marginBottom: 12 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  modalSub: { color: '#cbd5e1', fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 20 },
  modalCloseBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
});
