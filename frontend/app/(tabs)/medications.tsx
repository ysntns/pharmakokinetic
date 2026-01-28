import React, { useEffect, useState, useMemo } from 'react';
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
import { router } from 'expo-router';
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

  const filteredDrugs = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return drugs.filter(drug =>
      drug.name.toLowerCase().includes(lowerQuery) ||
      drug.active_ingredient.toLowerCase().includes(lowerQuery)
    );
  }, [drugs, searchQuery]);

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
          <Text style={styles.title}>İlaç Veritabanı</Text>
          <Text style={styles.subtitle}>Farmakokinetik bilgilerle</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="İlaç ara..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          {filteredDrugs.length} Türk İlacı
        </Text>
        
        {filteredDrugs.length > 0 ? (
          filteredDrugs.map((drug) => (
            <TouchableOpacity
              key={drug.id}
              style={styles.drugCard}
              onPress={() => router.push(`/drug-details/${drug.id}`)}
            >
              <View style={styles.drugHeader}>
                <View style={styles.drugIcon}>
                  <Ionicons name="medical" size={24} color="#0EA5E9" />
                </View>
                <View style={styles.drugInfo}>
                  <Text style={styles.drugName}>{drug.name}</Text>
                  <Text style={styles.activeIngredient}>{drug.active_ingredient}</Text>
                  {drug.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{drug.category}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </View>

              {drug.pharmacokinetics && (
                <View style={styles.pkPreview}>
                  <View style={styles.pkItem}>
                    <Ionicons name="pulse" size={16} color="#10B981" />
                    <Text style={styles.pkText}>
                      Tmax: {drug.pharmacokinetics.peak_concentration_time}h
                    </Text>
                  </View>
                  <View style={styles.pkItem}>
                    <Ionicons name="time" size={16} color="#F59E0B" />
                    <Text style={styles.pkText}>
                      t½: {drug.pharmacokinetics.half_life}h
                    </Text>
                  </View>
                  {drug.pharmacokinetics.bioavailability && (
                    <View style={styles.pkItem}>
                      <Ionicons name="trending-up" size={16} color="#0EA5E9" />
                      <Text style={styles.pkText}>
                        F: {drug.pharmacokinetics.bioavailability}%
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>İlaç bulunamadı</Text>
            <Text style={styles.emptyText}>
              Farklı bir arama terimi deneyin
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  drugCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  drugIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drugInfo: {
    flex: 1,
  },
  drugName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  activeIngredient: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  pkPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pkText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
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
