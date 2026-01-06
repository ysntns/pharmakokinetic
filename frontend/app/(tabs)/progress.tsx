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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Medilog</Text>
          <Text style={styles.title}>İlerleme</Text>
          <Text style={styles.subtitle}>Son 30 gün</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Adherence Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Genel Uyum Oranı</Text>
          <View style={styles.adherenceCircle}>
            <Text style={styles.adherenceNumber}>
              {stats?.stats?.adherence_rate.toFixed(0) || 0}%
            </Text>
          </View>
          <Text style={styles.adherenceSubtitle}>
            {stats?.stats?.doses_taken || 0} / {stats?.stats?.total_doses_scheduled || 0} doz alındı
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
            <Text style={styles.statNumber}>{stats?.stats?.doses_taken || 0}</Text>
            <Text style={styles.statLabel}>Alınan</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={28} color="#EF4444" />
            <Text style={styles.statNumber}>{stats?.stats?.doses_missed || 0}</Text>
            <Text style={styles.statLabel}>Kaçırılan</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="flame" size={28} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats?.stats?.current_streak || 0}</Text>
            <Text style={styles.statLabel}>Seri</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="medical" size={28} color="#0EA5E9" />
            <Text style={styles.statNumber}>
              {stats?.stats?.total_active_medications || 0}
            </Text>
            <Text style={styles.statLabel}>Aktif İlaç</Text>
          </View>
        </View>

        {/* Daily Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Son 14 Gün</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            {stats?.daily_adherence?.slice(-14).map((day: any, index: number) => {
              const rate = day.rate || 0;
              const color = rate === 100 ? '#10B981' : rate >= 50 ? '#F59E0B' : '#EF4444';
              const height = Math.max((rate / 100) * 100, 10);
              
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
        </View>

        {/* Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>İpucu</Text>
            <Text style={styles.tipText}>
              İlaçlarınızı düzenli almak için hatırlatıcıları açmayı unutmayın!
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 20,
  },
  adherenceCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E0F2FE',
    borderWidth: 10,
    borderColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  adherenceNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  adherenceSubtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartScroll: {
    marginHorizontal: -8,
  },
  dayColumn: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  dayLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    color: '#0F172A',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});
