import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { progressAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await progressAPI.getStats(30);
      setStats(data);
    } catch (error) {
      console.error('İlerleme yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#6366F1', '#8B5CF6', '#D946EF']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6', '#D946EF']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>İlerleme</Text>
          <Text style={styles.subtitle}>Son 30 gün</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Adherence Card */}
          <BlurView intensity={20} tint="light" style={styles.adherenceCard}>
            <Text style={styles.adherenceTitle}>Uyum Oranı</Text>
            <View style={styles.adherenceCircle}>
              <Text style={styles.adherenceNumber}>
                {stats?.stats?.adherence_rate.toFixed(0) || 0}%
              </Text>
            </View>
            <Text style={styles.adherenceSubtitle}>
              {stats?.stats?.doses_taken || 0} / {stats?.stats?.total_doses_scheduled || 0} doz alındı
            </Text>
          </BlurView>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <BlurView intensity={15} tint="light" style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>{stats?.stats?.doses_taken || 0}</Text>
              <Text style={styles.statLabel}>Alınan</Text>
            </BlurView>

            <BlurView intensity={15} tint="light" style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </View>
              <Text style={styles.statNumber}>{stats?.stats?.doses_missed || 0}</Text>
              <Text style={styles.statLabel}>Kaçırılan</Text>
            </BlurView>

            <BlurView intensity={15} tint="light" style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="flame" size={32} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>{stats?.stats?.current_streak || 0}</Text>
              <Text style={styles.statLabel}>Seri</Text>
            </BlurView>

            <BlurView intensity={15} tint="light" style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#6366F120' }]}>
                <Ionicons name="medical" size={32} color="#6366F1" />
              </View>
              <Text style={styles.statNumber}>
                {stats?.stats?.total_active_medications || 0}
              </Text>
              <Text style={styles.statLabel}>Aktif İlaç</Text>
            </BlurView>
          </View>

          {/* Daily Adherence */}
          <BlurView intensity={15} tint="light" style={styles.dailyCard}>
            <Text style={styles.sectionTitle}>Günlük Takip</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dailyScroll}>
              {stats?.daily_adherence?.slice(-14).map((day: any, index: number) => {
                const rate = day.rate || 0;
                const color = rate === 100 ? '#10B981' : rate >= 50 ? '#F59E0B' : '#EF4444';
                const height = Math.max((rate / 100) * 120, 20);
                
                return (
                  <View key={index} style={styles.dayColumn}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.dayLabel}>
                      {new Date(day.date).getDate()}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </BlurView>

          {/* Tips */}
          <BlurView intensity={10} tint="light" style={styles.tipsCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={28} color="#F59E0B" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İpucu</Text>
              <Text style={styles.tipText}>
                İlaçlarınızı düzenli almak için hatırlatıcıları açmayı unutmayın!
              </Text>
            </View>
          </BlurView>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  adherenceCard: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  adherenceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 20,
  },
  adherenceCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 12,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  adherenceNumber: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  adherenceSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  dailyCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  dailyScroll: {
    marginHorizontal: -8,
  },
  dayColumn: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 12,
  },
  dayLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  tipsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 16,
    overflow: 'hidden',
  },
  tipIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});
