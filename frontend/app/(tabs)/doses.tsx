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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
      today.sort((a, b) => 
        new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
      );
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
        return { color: '#10B981', icon: 'checkmark-circle', label: 'Alındı' };
      case 'missed':
        return { color: '#EF4444', icon: 'close-circle', label: 'Kaçırıldı' };
      case 'scheduled':
        return { color: '#F59E0B', icon: 'time', label: 'Bekliyor' };
      default:
        return { color: '#94A3B8', icon: 'help-circle', label: 'Bilinmiyor' };
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
        <View style={styles.header}>
          <Text style={styles.title}>Bugünkü Dozlar</Text>
          <Text style={styles.subtitle}>{format(new Date(), 'd MMMM EEEE', { locale: tr })}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {todaysDoses.length > 0 ? (
            todaysDoses.map((dose) => {
              const statusInfo = getDoseStatusInfo(dose.status);
              const isPast = new Date(dose.scheduled_time) < new Date();
              
              return (
                <BlurView key={dose.id} intensity={15} tint="light" style={styles.doseCard}>
                  <View style={styles.doseHeader}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {format(parseISO(dose.scheduled_time), 'HH:mm')}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                        <Ionicons name={statusInfo.icon} size={12} color="#FFFFFF" />
                        <Text style={styles.statusText}>{statusInfo.label}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.doseBody}>
                    <View style={styles.drugIconContainer}>
                      <Ionicons name="medical" size={32} color="#6366F1" />
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
                        style={[styles.actionButton, styles.takeButton]}
                        onPress={() => handleMarkTaken(dose.id)}
                      >
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Aldım</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.skipButton]}>
                        <Ionicons name="close" size={20} color="#64748B" />
                        <Text style={[styles.actionButtonText, { color: '#64748B' }]}>
                          Atla
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </BlurView>
              );
            })
          ) : (
            <BlurView intensity={15} tint="light" style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={64} color="#6366F1" />
              <Text style={styles.emptyTitle}>Bugün doz yok</Text>
              <Text style={styles.emptyText}>
                Bugün için planlanmış bir doz bulunmuyor
              </Text>
            </BlurView>
          )}

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
    textTransform: 'capitalize',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  doseCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  doseHeader: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  doseBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  drugIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drugInfo: {
    flex: 1,
  },
  drugName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  takeButton: {
    backgroundColor: '#10B981',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyCard: {
    padding: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
