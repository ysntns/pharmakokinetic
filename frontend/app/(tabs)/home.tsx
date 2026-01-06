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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { medicationAPI, doseAPI } from '../../services/api';
import { useAppStore, DoseLog } from '../../store/appStore';
import { format, isToday, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Medilog</Text>
            <Text style={styles.greeting}>Merhaba! 👋</Text>
            <Text style={styles.date}>{format(new Date(), 'd MMMM EEEE', { locale: tr })}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="medical" size={24} color="#0EA5E9" />
            <Text style={styles.statNumber}>{medications.length}</Text>
            <Text style={styles.statLabel}>Aktif İlaç</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.statNumber}>
              {todaysDoses.filter((d) => d.status === 'taken').length}
            </Text>
            <Text style={styles.statLabel}>Alındı</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{upcomingDoses.length}</Text>
            <Text style={styles.statLabel}>Bekliyor</Text>
          </View>
        </View>

        {/* Upcoming Doses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sıradaki Dozlar</Text>
            {upcomingDoses.length > 0 && (
              <Text style={styles.sectionBadge}>{upcomingDoses.length}</Text>
            )}
          </View>
          
          {upcomingDoses.length > 0 ? (
            upcomingDoses.slice(0, 3).map((dose) => (
              <View key={dose.id} style={styles.doseCard}>
                <View style={styles.doseLeft}>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeText}>
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
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color="#10B981" />
              <Text style={styles.emptyTitle}>Hepsi tamam!</Text>
              <Text style={styles.emptyText}>Bugün için tüm dozlarınız alındı</Text>
            </View>
          )}
        </View>

        {/* Today's History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bugünkü Geçmiş</Text>
          {todaysDoses.length > 0 ? (
            todaysDoses.map((dose) => (
              <View key={dose.id} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getDoseStatusColor(dose.status) }
                  ]} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDrug}>{dose.drug_name}</Text>
                    <Text style={styles.historyDosage}>{dose.dosage}</Text>
                  </View>
                </View>
                <Text style={styles.historyTime}>
                  {format(parseISO(dose.scheduled_time), 'HH:mm')}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Bugün hiç doz yok</Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
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
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sectionBadge: {
    backgroundColor: '#0EA5E9',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  doseCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  timeBox: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  doseInfo: {
    flex: 1,
  },
  doseDrug: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  doseDosage: {
    fontSize: 14,
    color: '#64748B',
  },
  takeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  historyInfo: {
    flex: 1,
  },
  historyDrug: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
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
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
