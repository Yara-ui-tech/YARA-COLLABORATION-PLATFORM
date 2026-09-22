import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function ProfileScreen() {
  const isOnline = useOnlineStatus();
  const [showCertModal, setShowCertModal] = useState(false);

  const handleDownloadCertificate = () => {
    if (!isOnline) {
      setShowCertModal(true);
      return;
    }
    alert('Exporting official verified certificate PDF...');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>Y</Text>
        </View>
        <Text style={styles.name}>YARA Innovator</Text>
        <Text style={styles.role}>Robotics Competitor & Student</Text>
      </View>

      {/* Investment Dues Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>INVESTMENT ACCOUNT</Text>
        <Text style={styles.amount}>$0.00 / $15.00</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '0%' }]} />
        </View>
        <Text style={styles.cardSub}>Target Dues: $15.00 • 0% Complete</Text>
      </View>

      {/* Verified Certificate Section */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>OFFICIAL CERTIFICATIONS</Text>
        <Text style={styles.certTitle}>Robotics & Industrial Automation Certificate 2026</Text>
        <Text style={styles.certSub}>ID: YARA-2026-CERT-8842</Text>

        <TouchableOpacity style={styles.certBtn} onPress={handleDownloadCertificate}>
          <Text style={styles.certBtnText}>📜 Export / Verify PDF Certificate</Text>
        </TouchableOpacity>
      </View>

      {/* Internet Required Modal */}
      <Modal transparent visible={showCertModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>🌐</Text>
            <Text style={styles.modalTitle}>Internet Required for Certificates</Text>
            <Text style={styles.modalSub}>
              Generating official PDF certificates, partner logo rendering, and cryptographic verification require an active internet connection. Please connect to Wi-Fi or data and try again.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowCertModal(false)}>
              <Text style={styles.modalBtnText}>Got it, I'll connect online</Text>
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
  profileHeader: { alignItems: 'center', marginVertical: 20 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
  name: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  role: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLabel: { color: '#818cf8', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  amount: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  progressBarBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#4f46e5', borderRadius: 3 },
  cardSub: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  certTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  certSub: { color: '#64748b', fontSize: 11, marginBottom: 16 },
  certBtn: { backgroundColor: '#4f46e5', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  certBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', padding: 24, borderRadius: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b' },
  modalIcon: { fontSize: 40, marginBottom: 12 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  modalSub: { color: '#cbd5e1', fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 20 },
  modalBtn: { backgroundColor: '#4f46e5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' },
  modalBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
});
