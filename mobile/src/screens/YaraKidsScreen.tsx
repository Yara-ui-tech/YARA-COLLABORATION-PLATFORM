import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';

export default function YaraKidsScreen() {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'flashcard' | 'challenge'>('video');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchKidsContent = async () => {
      try {
        const { data } = await supabase
          .from('yara_kids_content')
          .select('*')
          .eq('category', activeTab);
        
        if (data && data.length > 0) {
          setItems(data);
        } else {
          // Starter fallback items
          if (activeTab === 'video') {
            setItems([
              { id: 'v1', title: 'Fun with Electricity & Magic Circuits', description: 'Learn how electrons flow through conductors in this animated video!', age_group: 'Ages 4-8' },
              { id: 'v2', title: 'Meet Botty the Robot Explorer', description: 'Join Botty as he navigates obstacles using ultrasonic eyes.', age_group: 'Ages 3-7' }
            ]);
          } else if (activeTab === 'audio') {
            setItems([
              { id: 'a1', title: 'The Circuit Song (STEM Sing-along)', description: 'Sing along to learn positive and negative poles!', age_group: 'Ages 3-8' }
            ]);
          } else if (activeTab === 'flashcard') {
            setItems([
              { id: 'f1', title: 'Resistors & Colors Flashcard', description: 'Match color bands to resistance values.', age_group: 'Ages 5-8' }
            ]);
          } else {
            setItems([
              { id: 'c1', title: 'Challenge: Connect the Battery!', description: 'Help Botty reach the charging dock.', age_group: 'Ages 4-8' }
            ]);
          }
        }
      } catch (e) {
        console.warn('Kids fetch error:', e);
      }
    };

    fetchKidsContent();
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ YARA Kids Hub</Text>
        <Text style={styles.subtitle}>Early Childhood STEM & Robotics (Ages 3-8)</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { key: 'video', label: '🎬 Videos' },
          { key: 'audio', label: '🎵 Songs' },
          { key: 'flashcard', label: '🖼️ Flashcards' },
          { key: 'challenge', label: '🚀 Challenges' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.ageBadge}>{item.age_group || 'Ages 3-8'}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 16, backgroundColor: '#1e1b4b' },
  title: { color: '#fef08a', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#c7d2fe', fontSize: 12, marginTop: 2 },
  tabRow: { flexDirection: 'row', padding: 12, backgroundColor: '#1e293b' },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#4f46e5' },
  tabText: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  tabTextActive: { color: '#ffffff' },
  listContainer: { flex: 1 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ageBadge: { color: '#f59e0b', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  cardDesc: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
});
