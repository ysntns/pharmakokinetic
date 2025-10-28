import axios from 'axios';
import { Drug, MedicationSchedule, DoseLog, ProgressStats } from '../store/appStore';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
const API_BASE = `${API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Drug API
export const drugAPI = {
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

// Medication API
export const medicationAPI = {
  getAll: async (activeOnly: boolean = true): Promise<MedicationSchedule[]> => {
    const response = await api.get('/medications', {
      params: { active_only: activeOnly },
    });
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

// Dose Log API
export const doseAPI = {
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

// Progress API
export const progressAPI = {
  getStats: async (days: number = 30): Promise<any> => {
    const response = await api.get('/progress', { params: { days } });
    return response.data;
  },
};

export default api;
