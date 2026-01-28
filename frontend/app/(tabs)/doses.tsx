import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doseAPI } from '../../services/api';
import { DoseLog } from '../../store/appStore';
import { format, parseISO, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function DosesScreen() {
  const [todaysDoses, setTodaysDoses] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDoses = async () => {
    try {
      setLoading(true);
      const doses = await doseAPI.getAll();
      const today = doses.filter((dose) => isToday(parseISO(dose.scheduled_time)));
      today.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
      setTodaysDoses(today);
    } catch (error) {
      console.error('Dozlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoses();
  }, []);

  const handleMarkTaken = async (doseId: string) => {
    try {
      await doseAPI.markTaken(doseId);
      await loadDoses();
    } catch (error) {
      console.error('Doz işaretlenirken hata:', error);
    }
  };

  const getDoseStatusInfo = (status: string) => {
    switch (status) {
      case 'taken':
        return { color: '#10B981', icon: 'checkmark-circle', label: 'Alındı', bgColor: '#D1FAE5' };
      case 'missed':
        return { color: '#EF4444', icon: 'close-circle', label: 'Kaçırıldı', bgColor: '#FEE2E2' };
      case 'scheduled':
        return { color: '#F59E0B', icon: 'time', label: 'Bekliyor', bgColor: '#FEF3C7' };
      default:
        return { color: '#94A3B8', icon: 'help-circle', label: 'Bilinmiyor', bgColor: '#F1F5F9' };
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
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Medilog</Text>
          <Text style={styles.title}>Bugünkü Dozlar</Text>
          <Text style={styles.subtitle}>{format(new Date(), 'd MMMM EEEE', { locale: tr })}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {todaysDoses.length > 0 ? (
          todaysDoses.map((dose) => {
            const statusInfo = getDoseStatusInfo(dose.status);
            
            return (
              <View key={dose.id} style={styles.doseCard}>
                <View style={styles.doseHeader}>
                  <Text style={styles.timeText}>
                    {format(parseISO(dose.scheduled_time), 'HH:mm')}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                    <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.doseBody}>
                  <View style={styles.drugIcon}>
                    <Ionicons name="medical" size={28} color="#0EA5E9" />
                  </View>
                  <View style={styles.drugInfo}>
                    <Text style={styles.drugName}>{dose.drug_name}</Text>
                    <Text style={styles.dosage}>{dose.dosage}</Text>
                    {dose.notes && (
                      <Text style={styles.notes}>{dose.notes}</Text>
                    )}
                  </View>
                </View>

                {dose.status === 'scheduled' && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.takeButton}
                      onPress={() => handleMarkTaken(dose.id)}
                    >
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      <Text style={styles.takeButtonText}>Aldım</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.skipButton}>
                      <Ionicons name="close" size={20} color="#64748B" />
                      <Text style={styles.skipButtonText}>Atla</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Bugün doz yok</Text>
            <Text style={styles.emptyText}>
              Bugün için planlanmış bir doz bulunmuyor
            </Text>
          </View>
        )}
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
    textTransform: 'capitalize',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  doseCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  doseBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  drugIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drugInfo: {
    flex: 1,
  },
  drugName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 15,
    color: '#64748B',
  },
  notes: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  takeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 8,
  },
  takeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
