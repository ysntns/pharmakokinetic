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
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { drugAPI } from '../../services/api';
import { Drug } from '../../store/appStore';
import { LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function DrugDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrug();
  }, [id]);

  const loadDrug = async () => {
    try {
      const data = await drugAPI.getById(id as string);
      setDrug(data);
    } catch (error) {
      console.error('İlaç yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Farmakokinetik eğri verileri oluştur
  const generatePKCurve = () => {
    if (!drug?.pharmacokinetics) return [];
    
    const pk = drug.pharmacokinetics;
    const tmax = pk.peak_concentration_time || 2;
    const halfLife = pk.half_life || 6;
    const cmax = 100; // Maksimum konsantrasyon yüzdesi
    
    const data = [];
    for (let t = 0; t <= 24; t += 0.5) {
      let concentration;
      if (t <= tmax) {
        // Emilim fazı (yükseliş)
        concentration = cmax * (t / tmax);
      } else {
        // Eliminasyon fazı (düşüş)
        const k = 0.693 / halfLife; // Eliminasyon sabiti
        concentration = cmax * Math.exp(-k * (t - tmax));
      }
      data.push({ value: Math.max(concentration, 0), label: t % 4 === 0 ? `${t}s` : '' });
    }
    return data;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!drug) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>İlaç bulunamadı</Text>
      </View>
    );
  }

  const pkData = generatePKCurve();
  const pk = drug.pharmacokinetics;

  return (
    <>
      <Stack.Screen 
        options={{
          title: drug.name,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#0F172A', fontWeight: 'bold' },
          headerTintColor: '#0EA5E9',
          headerShown: true,
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* İlaç Başlık */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={32} color="#0EA5E9" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.drugName}>{drug.name}</Text>
            <Text style={styles.activeIngredient}>{drug.active_ingredient}</Text>
            {drug.category && (
              <Text style={styles.category}>{drug.category}</Text>
            )}
          </View>
        </View>

        {drug.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Açıklama</Text>
            <Text style={styles.description}>{drug.description}</Text>
          </View>
        )}

        {/* Farmakokinetik Grafik */}
        {pk && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="analytics" size={20} color="#0EA5E9" /> Plazma Konsantrasyon-Zaman Eğrisi
            </Text>
            <Text style={styles.chartSubtitle}>
              İlacın vücuttaki davranışını gösteren grafik
            </Text>
            
            <View style={styles.chartContainer}>
              <LineChart
                data={pkData}
                width={width - 80}
                height={220}
                color="#0EA5E9"
                thickness={3}
                startFillColor="#E0F2FE"
                endFillColor="#FFFFFF"
                startOpacity={0.9}
                endOpacity={0.2}
                initialSpacing={0}
                spacing={10}
                yAxisColor="#E2E8F0"
                xAxisColor="#E2E8F0"
                yAxisTextStyle={{ color: '#64748B', fontSize: 12 }}
                xAxisLabelTextStyle={{ color: '#64748B', fontSize: 11 }}
                hideDataPoints
                areaChart
                curved
                noOfSections={4}
                yAxisLabelWidth={30}
              />
            </View>

            {/* Farmakokinetik Parametreler */}
            <View style={styles.pkParams}>
              <View style={styles.pkRow}>
                <View style={styles.pkItem}>
                  <Ionicons name="arrow-up-circle" size={24} color="#10B981" />
                  <Text style={styles.pkLabel}>Tmax (Pik Zamanı)</Text>
                  <Text style={styles.pkValue}>{pk.peak_concentration_time}h</Text>
                </View>
                <View style={styles.pkItem}>
                  <Ionicons name="time" size={24} color="#F59E0B" />
                  <Text style={styles.pkLabel}>Yarı Ömür</Text>
                  <Text style={styles.pkValue}>{pk.half_life}h</Text>
                </View>
              </View>
              
              <View style={styles.pkRow}>
                {pk.bioavailability && (
                  <View style={styles.pkItem}>
                    <Ionicons name="pulse" size={24} color="#0EA5E9" />
                    <Text style={styles.pkLabel}>Biyoyararlanım</Text>
                    <Text style={styles.pkValue}>{pk.bioavailability}%</Text>
                  </View>
                )}
                {pk.protein_binding && (
                  <View style={styles.pkItem}>
                    <Ionicons name="git-network" size={24} color="#8B5CF6" />
                    <Text style={styles.pkLabel}>Protein Bağlanma</Text>
                    <Text style={styles.pkValue}>{pk.protein_binding}%</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Farmakokinetik Açıklamalar */}
        {pk && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="school" size={20} color="#0EA5E9" /> Farmakokinetik Bilgiler
            </Text>
            
            {pk.absorption_time && (
              <View style={styles.infoRow}>
                <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Emilim Süresi</Text>
                  <Text style={styles.infoValue}>{pk.absorption_time} saat</Text>
                  <Text style={styles.infoDesc}>İlacın mideye alındıktan sonra kana geçme süresi</Text>
                </View>
              </View>
            )}

            {pk.peak_concentration_time && (
              <View style={styles.infoRow}>
                <Ionicons name="trending-up" size={20} color="#0EA5E9" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Pik Konsantrasyon (Tmax)</Text>
                  <Text style={styles.infoValue}>{pk.peak_concentration_time} saat</Text>
                  <Text style={styles.infoDesc}>İlacın kanda en yüksek seviyeye ulaştığı zaman</Text>
                </View>
              </View>
            )}

            {pk.half_life && (
              <View style={styles.infoRow}>
                <Ionicons name="hourglass" size={20} color="#F59E0B" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Yarı Ömür</Text>
                  <Text style={styles.infoValue}>{pk.half_life} saat</Text>
                  <Text style={styles.infoDesc}>İlacın vücuttaki miktarının yarıya inmesi için geçen süre</Text>
                </View>
              </View>
            )}

            {pk.metabolism_pathway && (
              <View style={styles.infoRow}>
                <Ionicons name="flask" size={20} color="#8B5CF6" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Metabolizma</Text>
                  <Text style={styles.infoValue}>{pk.metabolism_pathway}</Text>
                  <Text style={styles.infoDesc}>İlacın vücutta işlenme yolu</Text>
                </View>
              </View>
            )}

            {pk.excretion_route && (
              <View style={styles.infoRow}>
                <Ionicons name="exit" size={20} color="#EF4444" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Atılım Yolu</Text>
                  <Text style={styles.infoValue}>{pk.excretion_route}</Text>
                  <Text style={styles.infoDesc}>İlacın vücuttan atılma şekli</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Uyarılar ve Yan Etkiler */}
        {drug.warnings && drug.warnings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="warning" size={20} color="#F59E0B" /> Önemli Uyarılar
            </Text>
            {drug.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {drug.side_effects && drug.side_effects.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="medkit" size={20} color="#EF4444" /> Yan Etkiler
            </Text>
            <View style={styles.listContainer}>
              {drug.side_effects.map((effect, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{effect}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {drug.interactions && drug.interactions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="swap-horizontal" size={20} color="#8B5CF6" /> İlaç Etkileşimleri
            </Text>
            <Text style={styles.interactionWarning}>
              Bu ilaçlarla birlikte kullanırken dikkatli olun:
            </Text>
            <View style={styles.listContainer}>
              {drug.interactions.map((interaction, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{interaction}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  drugName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  activeIngredient: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  chartContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  pkParams: {
    marginTop: 20,
  },
  pkRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  pkItem: {
    alignItems: 'center',
    flex: 1,
  },
  pkLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  pkValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#0EA5E9',
    fontWeight: '700',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0EA5E9',
    marginTop: 7,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  interactionWarning: {
    fontSize: 13,
    color: '#8B5CF6',
    marginBottom: 8,
    fontWeight: '600',
  },
});
