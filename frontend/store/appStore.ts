import { create } from 'zustand';

export interface Drug {
  id: string;
  name: string;
  active_ingredient: string;
  description?: string;
  dosage_forms: string[];
  standard_dosages: string[];
  pharmacokinetics?: any;
  interactions: string[];
  contraindications: string[];
  side_effects: string[];
  warnings: string[];
  category?: string;
}

export interface MedicationSchedule {
  id: string;
  drug_id: string;
  drug_name: string;
  dosage: string;
  dosage_form: string;
  frequency: string;
  times_per_day: number;
  specific_times: string[];
  start_date: string;
  end_date?: string;
  with_food: boolean;
  special_instructions?: string;
  reminder_enabled: boolean;
  active: boolean;
}

export interface DoseLog {
  id: string;
  medication_id: string;
  drug_name: string;
  dosage: string;
  scheduled_time: string;
  actual_time?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  side_effects_reported: string[];
}

export interface ProgressStats {
  total_doses_scheduled: number;
  doses_taken: number;
  doses_missed: number;
  doses_skipped: number;
  adherence_rate: number;
  current_streak: number;
  longest_streak: number;
  total_active_medications: number;
}

interface AppStore {
  drugs: Drug[];
  medications: MedicationSchedule[];
  todaysDoses: DoseLog[];
  progressStats: ProgressStats | null;
  setDrugs: (drugs: Drug[]) => void;
  setMedications: (medications: MedicationSchedule[]) => void;
  setTodaysDoses: (doses: DoseLog[]) => void;
  setProgressStats: (stats: ProgressStats) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  drugs: [],
  medications: [],
  todaysDoses: [],
  progressStats: null,
  setDrugs: (drugs) => set({ drugs }),
  setMedications: (medications) => set({ medications }),
  setTodaysDoses: (doses) => set({ todaysDoses: doses }),
  setProgressStats: (stats) => set({ progressStats: stats }),
}));
