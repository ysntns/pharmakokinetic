// Mock API for offline prototype/demo mode
import { Drug, MedicationSchedule, DoseLog, User } from '../store/appStore';
import { MOCK_USER, MOCK_DRUGS, MOCK_MEDICATIONS, MOCK_DOSES, MOCK_PROGRESS } from './mockData';

// Simulate API delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth API
export const mockAuthAPI = {
  register: async (email: string, full_name: string, password: string) => {
    await delay();
    return {
      access_token: 'mock-token-' + Date.now(),
      user: { ...MOCK_USER, email, full_name },
    };
  },

  login: async (email: string, password: string) => {
    await delay();
    return {
      access_token: 'mock-token-' + Date.now(),
      user: MOCK_USER,
    };
  },

  getMe: async () => {
    await delay();
    return MOCK_USER;
  },

  saveToken: async (token: string) => {
    await delay();
    // In mock mode, we don't actually save anything
  },

  getToken: async () => {
    await delay();
    return 'mock-token';
  },

  removeToken: async () => {
    await delay();
  },
};

// Mock Drug API
export const mockDrugAPI = {
  getAll: async (search?: string, category?: string): Promise<Drug[]> => {
    await delay();
    let drugs = [...MOCK_DRUGS];

    if (search) {
      const searchLower = search.toLowerCase();
      drugs = drugs.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.active_ingredient.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      drugs = drugs.filter(d => d.category === category);
    }

    return drugs;
  },

  getById: async (id: string): Promise<Drug> => {
    await delay();
    const drug = MOCK_DRUGS.find(d => d.id === id);
    if (!drug) throw new Error('Drug not found');
    return drug;
  },

  create: async (drug: Partial<Drug>): Promise<Drug> => {
    await delay();
    const newDrug: Drug = {
      id: Date.now().toString(),
      name: drug.name || '',
      active_ingredient: drug.active_ingredient || '',
      description: drug.description,
      dosage_forms: drug.dosage_forms || [],
      standard_dosages: drug.standard_dosages || [],
      pharmacokinetics: drug.pharmacokinetics,
      interactions: drug.interactions || [],
      contraindications: drug.contraindications || [],
      side_effects: drug.side_effects || [],
      warnings: drug.warnings || [],
      category: drug.category,
    };
    MOCK_DRUGS.push(newDrug);
    return newDrug;
  },

  update: async (id: string, drug: Partial<Drug>): Promise<Drug> => {
    await delay();
    const index = MOCK_DRUGS.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Drug not found');
    MOCK_DRUGS[index] = { ...MOCK_DRUGS[index], ...drug };
    return MOCK_DRUGS[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    const index = MOCK_DRUGS.findIndex(d => d.id === id);
    if (index > -1) {
      MOCK_DRUGS.splice(index, 1);
    }
  },
};

// Mock Medication API
export const mockMedicationAPI = {
  getAll: async (activeOnly: boolean = true): Promise<MedicationSchedule[]> => {
    await delay();
    if (activeOnly) {
      return MOCK_MEDICATIONS.filter(m => m.active);
    }
    return [...MOCK_MEDICATIONS];
  },

  getById: async (id: string): Promise<MedicationSchedule> => {
    await delay();
    const med = MOCK_MEDICATIONS.find(m => m.id === id);
    if (!med) throw new Error('Medication not found');
    return med;
  },

  create: async (medication: any): Promise<MedicationSchedule> => {
    await delay();
    const newMed: MedicationSchedule = {
      id: Date.now().toString(),
      ...medication,
    };
    MOCK_MEDICATIONS.push(newMed);
    return newMed;
  },

  update: async (id: string, medication: Partial<MedicationSchedule>): Promise<MedicationSchedule> => {
    await delay();
    const index = MOCK_MEDICATIONS.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Medication not found');
    MOCK_MEDICATIONS[index] = { ...MOCK_MEDICATIONS[index], ...medication };
    return MOCK_MEDICATIONS[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay();
    const index = MOCK_MEDICATIONS.findIndex(m => m.id === id);
    if (index > -1) {
      MOCK_MEDICATIONS.splice(index, 1);
    }
  },
};

// Mock Dose API
export const mockDoseAPI = {
  getAll: async (filters?: any): Promise<DoseLog[]> => {
    await delay();
    return [...MOCK_DOSES];
  },

  getById: async (id: string): Promise<DoseLog> => {
    await delay();
    const dose = MOCK_DOSES.find(d => d.id === id);
    if (!dose) throw new Error('Dose not found');
    return dose;
  },

  create: async (dose: Partial<DoseLog>): Promise<DoseLog> => {
    await delay();
    const newDose: DoseLog = {
      id: Date.now().toString(),
      medication_id: dose.medication_id || '',
      drug_name: dose.drug_name || '',
      dosage: dose.dosage || '',
      scheduled_time: dose.scheduled_time || new Date().toISOString(),
      status: dose.status || 'scheduled',
      notes: dose.notes,
      side_effects_reported: dose.side_effects_reported || [],
    };
    MOCK_DOSES.push(newDose);
    return newDose;
  },

  update: async (id: string, dose: Partial<DoseLog>): Promise<DoseLog> => {
    await delay();
    const index = MOCK_DOSES.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Dose not found');
    MOCK_DOSES[index] = { ...MOCK_DOSES[index], ...dose };
    return MOCK_DOSES[index];
  },

  markTaken: async (id: string, notes?: string): Promise<DoseLog> => {
    await delay();
    const index = MOCK_DOSES.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Dose not found');
    MOCK_DOSES[index] = {
      ...MOCK_DOSES[index],
      status: 'taken',
      actual_time: new Date().toISOString(),
      notes: notes || MOCK_DOSES[index].notes,
    };
    return MOCK_DOSES[index];
  },
};

// Mock Progress API
export const mockProgressAPI = {
  getStats: async (days: number = 30) => {
    await delay();
    return {
      ...MOCK_PROGRESS,
      period_start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      stats: MOCK_PROGRESS,
      daily_adherence: [],
    };
  },
};

// Mock OCR API
export const mockOcrAPI = {
  analyzeDrugImage: async (imageUri: string) => {
    await delay(1500); // Longer delay to simulate AI processing

    // Simulate occasional failures for realism
    if (Math.random() > 0.8) {
      return {
        success: false,
        message: 'İlaç kutusu net görünmüyor. Lütfen daha iyi ışıkta tekrar çekin.',
      };
    }

    return {
      success: true,
      data: {
        name: 'Demo İlaç 500mg',
        active_ingredient: 'Demo Etken Madde',
        description: 'AI tarafından tespit edilen örnek ilaç',
        dosage_forms: ['tablet'],
        standard_dosages: ['500mg'],
        category: 'Diğer',
      },
    };
  },
};
