import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { medicationAPI, doseAPI } from '../../services/api';
import { useAppStore, DoseLog } from '../../store/appStore';
import { format, isToday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [todaysDoses, setTodaysDoses] = useState<DoseLog[]>([]);
  const [upcomingDoses, setUpcomingDoses] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { medications, setMedications } = useAppStore();

  const loadData = async () => {
    try {
      setLoading(true);
      const [meds, doses] = await Promise.all([
        medicationAPI.getAll(true),
        doseAPI.getAll(),
      ]);
      
      setMedications(meds);
      
      const today = doses.filter((dose) => {
        const doseDate = parseISO(dose.scheduled_time);
        return isToday(doseDate);
      });
      
      today.sort((a, b) => 
        new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
      );
      
      const now = new Date();
      const upcoming = today.filter(d => new Date(d.scheduled_time) > now && d.status === 'scheduled');
      
      setTodaysDoses(today);
      setUpcomingDoses(upcoming);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMarkTaken = async (doseId: string) => {
    try {
      await doseAPI.markTaken(doseId);
      await loadData();
    } catch (error) {
      console.error('Doz işaretlenirken hata:', error);
    }
  };

  const getDoseStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#10B981';
      case 'missed': return '#EF4444';
      case 'scheduled': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  const getDoseStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return 'checkmark-circle';
      case 'missed': return 'close-circle';
      case 'scheduled': return 'time';
      default: return 'help-circle';
    }
  };

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
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Merhaba! 👋</Text>
              <Text style={styles.date}>{format(new Date(), 'EEEE, d MMMM', { locale: tr })}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards - Glassmorphism */}
          <View style={styles.statsContainer}>
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="medical" size={28} color="#6366F1" />
              </View>
              <Text style={styles.statNumber}>{medications.length}</Text>
              <Text style={styles.statLabel}>Aktif İlaç</Text>
            </BlurView>

            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>
                {todaysDoses.filter((d) => d.status === 'taken').length}
              </Text>
              <Text style={styles.statLabel}>Alındı</Text>
            </BlurView>

            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={28} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>{upcomingDoses.length}</Text>
              <Text style={styles.statLabel}>Bekliyor</Text>
            </BlurView>
          </View>

          {/* Upcoming Doses Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sıradaki Dozlar</Text>
            {upcomingDoses.length > 0 ? (
              upcomingDoses.slice(0, 3).map((dose) => (
                <BlurView key={dose.id} intensity={15} tint="light" style={styles.doseCard}>
                  <View style={styles.doseLeft}>
                    <View style={styles.doseTimeContainer}>
                      <Text style={styles.doseTimeText}>
                        {format(parseISO(dose.scheduled_time), 'HH:mm')}
                      </Text>
                    </View>
                    <View style={styles.doseInfo}>
                      <Text style={styles.doseDrug}>{dose.drug_name}</Text>
                      <Text style={styles.doseDosage}>{dose.dosage}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.takeButton}
                    onPress={() => handleMarkTaken(dose.id)}
                  >
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </BlurView>
              ))
            ) : (
              <BlurView intensity={10} tint="light" style={styles.emptyCard}>
                <Ionicons name="happy-outline" size={48} color="#6366F1" />
                <Text style={styles.emptyText}>Harika! Hepsi tamam! 🎉</Text>
              </BlurView>
            )}
          </View>

          {/* Today's History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugünkü Geçmiş</Text>
            {todaysDoses.length > 0 ? (
              todaysDoses.map((dose) => (
                <BlurView key={dose.id} intensity={10} tint="light" style={styles.historyCard}>
                  <View style={styles.historyLeft}>
                    <View style={[
                      styles.statusIcon,
                      { backgroundColor: getDoseStatusColor(dose.status) + '20' }
                    ]}>
                      <Ionicons
                        name={getDoseStatusIcon(dose.status)}
                        size={24}
                        color={getDoseStatusColor(dose.status)}
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDrug}>{dose.drug_name}</Text>
                      <Text style={styles.historyDosage}>{dose.dosage}</Text>
                    </View>
                  </View>
                  <Text style={styles.historyTime}>
                    {format(parseISO(dose.scheduled_time), 'HH:mm')}
                  </Text>
                </BlurView>
              ))
            ) : (
              <BlurView intensity={10} tint="light" style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>Bugün hiç doz yok</Text>
              </BlurView>
            )}
          </View>

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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  doseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  doseTimeContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseTimeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  doseInfo: {
    flex: 1,
  },
  doseDrug: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  doseDosage: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  takeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyDrug: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  historyDosage: {
    fontSize: 13,
    color: '#64748B',
  },
  historyTime: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '600',
  },
});
