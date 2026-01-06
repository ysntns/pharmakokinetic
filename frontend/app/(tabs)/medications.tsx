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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { medicationAPI, drugAPI } from '../../services/api';
import { useAppStore } from '../../store/appStore';

export default function MedicationsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { medications, setMedications, drugs, setDrugs } = useAppStore();

  const loadData = async () => {
    try {
      setLoading(true);
      const [meds, drugsData] = await Promise.all([
        medicationAPI.getAll(true),
        drugAPI.getAll(),
      ]);
      setMedications(meds);
      setDrugs(drugsData);
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

  const filteredMedications = medications.filter(med =>
    med.drug_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Text style={styles.title}>İlaçlarım</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <BlurView intensity={20} tint="light" style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="İlaç ara..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BlurView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredMedications.length > 0 ? (
            filteredMedications.map((med) => (
              <BlurView key={med.id} intensity={15} tint="light" style={styles.medCard}>
                <View style={styles.medHeader}>
                  <View style={styles.medIconContainer}>
                    <Ionicons name="medical" size={28} color="#6366F1" />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.drug_name}</Text>
                    <Text style={styles.medDosage}>{med.dosage} • {med.dosage_form}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.medDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={18} color="#6366F1" />
                    <Text style={styles.detailText}>
                      {med.specific_times.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="repeat-outline" size={18} color="#6366F1" />
                    <Text style={styles.detailText}>{med.times_per_day}x günlük</Text>
                  </View>
                  {med.with_food && (
                    <View style={styles.detailItem}>
                      <Ionicons name="restaurant-outline" size={18} color="#F59E0B" />
                      <Text style={styles.detailText}>Yemekle birlikte</Text>
                    </View>
                  )}
                </View>

                {med.special_instructions && (
                  <View style={styles.instructionsBox}>
                    <Text style={styles.instructionsText}>
                      {med.special_instructions}
                    </Text>
                  </View>
                )}
              </BlurView>
            ))
          ) : (
            <BlurView intensity={15} tint="light" style={styles.emptyCard}>
              <Ionicons name="medical-outline" size={64} color="#6366F1" />
              <Text style={styles.emptyTitle}>Henüz ilaç yok</Text>
              <Text style={styles.emptyText}>
                İlk ilacınızı eklemek için + butonuna dokunun
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  medCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  medDosage: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  instructionsBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  instructionsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
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
