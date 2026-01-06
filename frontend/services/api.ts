import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Drug, MedicationSchedule, DoseLog, ProgressStats, User } from '../store/appStore';
import {
  mockAuthAPI,
  mockDrugAPI,
  mockMedicationAPI,
  mockDoseAPI,
  mockProgressAPI,
  mockOcrAPI,
} from './mockApi';

// Use mock API for demo mode (set to false when backend is available)
const USE_MOCK_API = true; // Set to true for APK demo without backend

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
const API_BASE = `${API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token && !USE_MOCK_API) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Real Auth API implementation
const realAuthAPI = {
  register: async (email: string, full_name: string, password: string): Promise<{ access_token: string; user: User }> => {
    const response = await api.post('/auth/register', { email, full_name, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  saveToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem('auth_token', token);
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('auth_token');
  },

  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
  },
};

// Real OCR API
const realOcrAPI = {
  analyzeDrugImage: async (imageUri: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', { uri: imageUri, name: filename, type } as any);

    const response = await api.post('/analyze-drug-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Real Drug API
const realDrugAPI = {
  getAll: async (search?: string, category?: string): Promise<Drug[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const response = await api.get('/drugs', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Drug> => {
    const response = await api.get(`/drugs/${id}`);
    return response.data;
  },

  create: async (drug: Partial<Drug>): Promise<Drug> => {
    const response = await api.post('/drugs', drug);
    return response.data;
  },

  update: async (id: string, drug: Partial<Drug>): Promise<Drug> => {
    const response = await api.put(`/drugs/${id}`, drug);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/drugs/${id}`);
  },
};

// Real Medication API
const realMedicationAPI = {
  getAll: async (activeOnly: boolean = true): Promise<MedicationSchedule[]> => {
    const response = await api.get('/medications', { params: { active_only: activeOnly } });
    return response.data;
  },

  getById: async (id: string): Promise<MedicationSchedule> => {
    const response = await api.get(`/medications/${id}`);
    return response.data;
  },

  create: async (medication: any): Promise<MedicationSchedule> => {
    const response = await api.post('/medications', medication);
    return response.data;
  },

  update: async (id: string, medication: Partial<MedicationSchedule>): Promise<MedicationSchedule> => {
    const response = await api.put(`/medications/${id}`, medication);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/medications/${id}`);
  },
};

// Real Dose API
const realDoseAPI = {
  getAll: async (filters?: {
    medication_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<DoseLog[]> => {
    const response = await api.get('/doses', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<DoseLog> => {
    const response = await api.get(`/doses/${id}`);
    return response.data;
  },

  create: async (dose: Partial<DoseLog>): Promise<DoseLog> => {
    const response = await api.post('/doses', dose);
    return response.data;
  },

  update: async (id: string, dose: Partial<DoseLog>): Promise<DoseLog> => {
    const response = await api.put(`/doses/${id}`, dose);
    return response.data;
  },

  markTaken: async (id: string, notes?: string): Promise<DoseLog> => {
    const response = await api.post(`/doses/${id}/take`, null, {
      params: notes ? { notes } : {},
    });
    return response.data;
  },
};

// Real Progress API
const realProgressAPI = {
  getStats: async (days: number = 30): Promise<any> => {
    const response = await api.get('/progress', { params: { days } });
    return response.data;
  },
};

// Export either mock or real APIs based on USE_MOCK_API flag
export const authAPI = USE_MOCK_API ? mockAuthAPI : realAuthAPI;
export const ocrAPI = USE_MOCK_API ? mockOcrAPI : realOcrAPI;
export const drugAPI = USE_MOCK_API ? mockDrugAPI : realDrugAPI;
export const medicationAPI = USE_MOCK_API ? mockMedicationAPI : realMedicationAPI;
export const doseAPI = USE_MOCK_API ? mockDoseAPI : realDoseAPI;
export const progressAPI = USE_MOCK_API ? mockProgressAPI : realProgressAPI;

export default api;
