import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { supabase } from '../lib/supabase';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function HomeScreen({ navigation }: any) {
  const isOnline = useOnlineStatus();
  const [posts, setPosts] = useState<any[]>([]);
  const [trendingPopup, setTrendingPopup] = useState<any | null>(null);
  const [stats, setStats] = useState({ projects: 12, innovators: 85, ideas: 34 });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data } = await supabase
          .from('organization_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (data && data.length > 0) {
          setPosts(data);
          setTrendingPopup(data[0]);
        } else {
          // Starter fallback posts
          const fallback = [
            {
              id: '1',
              title: 'YARA Educational Robotics Competition 2026 Officially Launched!',
              category: 'Announcements',
              content: 'Theme: Engineering Opportunity: Robotics & Innovation for Underserved Youth. Open to high schools, universities & youth clubs across Africa.',
              author_name: 'Directorate'
            }
          ];
          setPosts(fallback);
          setTrendingPopup(fallback[0]);
        }
      } catch (e) {
        console.warn('Mobile home fetch note:', e);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Offline Status Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚡ Offline Mode Active — Cached curriculum & kids content are accessible offline.
          </Text>
        </View>
      )}

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroBadge}>⚡ YARIA MOBILE PLATFORM</Text>
        <Text style={styles.heroTitle}>Build the Future of African Tech</Text>
        <Text style={styles.heroSub}>
          Connect with innovators, master robotics & industrial automation, and share project ideas on the go.
        </Text>
        <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('Curriculum')}>
          <Text style={styles.heroButtonText}>Explore Roadmap →</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.projects}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.innovators}</Text>
          <Text style={styles.statLabel}>Innovators</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.ideas}</Text>
          <Text style={styles.statLabel}>Ideas</Text>
        </View>
      </View>

      {/* Official YARA Announcements Feed */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📢 Official YARA Announcements</Text>
      </View>

      {posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <Text style={styles.postCategory}>{post.category || 'Press'}</Text>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
          <Text style={styles.postAuthor}>By {post.author_name || 'Admin'} • Official</Text>
        </View>
      ))}

      {/* Trending News Modal */}
      {trendingPopup && (
        <Modal transparent animationType="fade" visible={!!trendingPopup}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.popupBadge}>🔥 TRENDING NEWS ALERT</Text>
              <Text style={styles.popupTitle}>{trendingPopup.title}</Text>
              <Text style={styles.popupText}>{trendingPopup.content}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setTrendingPopup(null)}
              >
                <Text style={styles.modalCloseText}>Got it / Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 40 },
  offlineBanner: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  offlineText: { color: '#0f172a', fontWeight: 'bold', fontSize: 12 },
  heroCard: {
    backgroundColor: '#4f46e5',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  heroBadge: { color: '#fef08a', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  heroTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  heroSub: { color: '#e0e7ff', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  heroButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 13 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: { color: '#38bdf8', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600', marginTop: 4 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  postCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  postCategory: { color: '#818cf8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  postTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginVertical: 6 },
  postContent: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  postAuthor: { color: '#64748b', fontSize: 10, marginTop: 10, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  popupBadge: { color: '#f59e0b', fontSize: 11, fontWeight: '900', marginBottom: 8 },
  popupTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  popupText: { color: '#cbd5e1', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  modalCloseBtn: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
});
