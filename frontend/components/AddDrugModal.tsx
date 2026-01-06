import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';
import { drugAPI, ocrAPI } from '../services/api';

interface AddDrugModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDrugModal({ visible, onClose, onSuccess }: AddDrugModalProps) {
  const [method, setMethod] = useState<'manual' | 'barcode' | 'photo' | null>(null);
  const [scanning, setScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Form fields
  const [drugName, setDrugName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [description, setDescription] = useState('');
  const [dosages, setDosages] = useState('');
  
  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanning(false);
    Alert.alert(
      'Barkod Okundu',
      `Barkod: ${data}\n\nİlaç bilgileri yükleniyor...`,
      [{ text: 'Tamam' }]
    );
    // Burada API'den ilaç bilgisi çekilebilir
    // Şimdilik manuel forma geç
    setMethod('manual');
  };

  const analyzeImage = async (imageUri: string) => {
    try {
      setAnalyzing(true);
      const result = await ocrAPI.analyzeDrugImage(imageUri);

      if (result.success && result.data) {
        // Fill form with extracted data
        setDrugName(result.data.name || '');
        setActiveIngredient(result.data.active_ingredient || '');
        setDescription(result.data.description || '');
        setDosages(result.data.standard_dosages?.join(', ') || '');

        Alert.alert(
          'Analiz Tamamlandı',
          'İlaç bilgileri başarıyla çıkarıldı. Lütfen kontrol edip kaydedin.',
          [{ text: 'Tamam' }]
        );
        setMethod('manual');
      } else {
        Alert.alert(
          'Analiz Başarısız',
          result.message || 'İlaç kutusu analiz edilemedi. Manuel olarak girebilirsiniz.',
          [{ text: 'Manuel Gir', onPress: () => setMethod('manual') }]
        );
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      Alert.alert(
        'Hata',
        'İlaç kutusu analiz edilirken bir hata oluştu. Manuel olarak girebilirsiniz.',
        [{ text: 'Manuel Gir', onPress: () => setMethod('manual') }]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePhotoSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için izin vermelisiniz');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await analyzeImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera kullanmak için izin vermelisiniz');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await analyzeImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!drugName.trim() || !activeIngredient.trim()) {
      Alert.alert('Hata', 'İlaç adı ve etken madde zorunludur');
      return;
    }

    try {
      await drugAPI.create({
        name: drugName,
        active_ingredient: activeIngredient,
        description: description || undefined,
        dosage_forms: ['tablet'],
        standard_dosages: dosages.split(',').map(d => d.trim()).filter(Boolean),
        interactions: [],
        contraindications: [],
        side_effects: [],
        warnings: [],
      });

      Alert.alert('Başarılı', 'İlaç eklendi');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Hata', 'İlaç eklenirken hata oluştu');
    }
  };

  const resetForm = () => {
    setMethod(null);
    setDrugName('');
    setActiveIngredient('');
    setDescription('');
    setDosages('');
    setScanning(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title}>İlaç Ekle</Text>
          <View style={{ width: 28 }} />
        </View>

        {!method && !scanning && (
          <ScrollView style={styles.content}>
            <Text style={styles.subtitle}>Nasıl eklemek istersiniz?</Text>

            <TouchableOpacity style={styles.methodCard} onPress={() => setMethod('manual')}>
              <View style={[styles.methodIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="create" size={32} color="#0EA5E9" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Manuel Giriş</Text>
                <Text style={styles.methodDesc}>İlaç bilgilerini kendiniz yazın</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodCard}
              onPress={async () => {
                const granted = await requestCameraPermission();
                if (granted) {
                  setScanning(true);
                } else {
                  Alert.alert('İzin Gerekli', 'Kamera kullanmak için izin vermelisiniz');
                }
              }}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="barcode" size={32} color="#F59E0B" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Barkod Tara</Text>
                <Text style={styles.methodDesc}>İlaç kutusundaki barkodu okutun</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodCard} onPress={handleTakePhoto}>
              <View style={[styles.methodIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="camera" size={32} color="#10B981" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Fotoğraf Çek</Text>
                <Text style={styles.methodDesc}>İlaç kutusunun fotoğrafını çekin</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodCard} onPress={handlePhotoSelect}>
              <View style={[styles.methodIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="image" size={32} color="#8B5CF6" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Galeriden Seç</Text>
                <Text style={styles.methodDesc}>Mevcut fotoğraftan ilaç tanıyın</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {scanning && (
          <View style={styles.scannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={handleBarcodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.scannerOverlay}>
              <Text style={styles.scannerText}>Barkodu kameranın önüne tutun</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setScanning(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {method === 'manual' && (
          <ScrollView style={styles.content}>
            <Text style={styles.formLabel}>İlaç Adı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Coraspin 100 mg"
              value={drugName}
              onChangeText={setDrugName}
            />

            <Text style={styles.formLabel}>Etken Madde *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Asetilsalisilik Asit"
              value={activeIngredient}
              onChangeText={setActiveIngredient}
            />

            <Text style={styles.formLabel}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="İlacın ne için kullanıldığını yazın"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.formLabel}>Dozajlar (virgülle ayırın)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 100mg, 300mg"
              value={dosages}
              onChangeText={setDosages}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
