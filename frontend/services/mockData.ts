// Mock data for prototype/demo
import { Drug, MedicationSchedule, DoseLog, ProgressStats, User } from '../store/appStore';

export const MOCK_USER: User = {
  id: '1',
  email: 'demo@medilog.com',
  full_name: 'Demo Kullanıcı',
};

export const MOCK_DRUGS: Drug[] = [
  {
    id: '1',
    name: 'Coraspin 100mg',
    active_ingredient: 'Asetilsalisilik Asit',
    description: 'Antiplatelet ilaç, kalp ve damar hastalıklarında kullanılır',
    dosage_forms: ['tablet'],
    standard_dosages: ['100mg'],
    pharmacokinetics: {
      absorption_time: 0.5,
      peak_concentration_time: 1.5,
      half_life: 3.5,
      bioavailability: 70,
      protein_binding: 99,
      volume_distribution: 0.15,
      clearance_rate: 650,
      metabolism_pathway: 'Karaciğer',
      excretion_route: 'Böbrek',
    },
    interactions: ['Warfarin', 'NSAID'],
    contraindications: ['Mide ülseri', 'Kanama bozukluğu'],
    side_effects: ['Mide bulantısı', 'Kanama riski'],
    warnings: ['Aç karnına alınmamalı'],
    category: 'Kardiyovasküler',
  },
  {
    id: '2',
    name: 'Plavix 75mg',
    active_ingredient: 'Klopidogrel',
    description: 'Kan pıhtılaşmasını önleyen ilaç',
    dosage_forms: ['tablet'],
    standard_dosages: ['75mg'],
    pharmacokinetics: {
      absorption_time: 1,
      peak_concentration_time: 2,
      half_life: 7,
      bioavailability: 50,
      protein_binding: 98,
      volume_distribution: 2.5,
      clearance_rate: 450,
      metabolism_pathway: 'Karaciğer CYP2C19',
      excretion_route: 'Böbrek ve safra',
    },
    interactions: ['Aspirin', 'Warfarin'],
    contraindications: ['Aktif kanama', 'Ciddi karaciğer hasarı'],
    side_effects: ['Kanama', 'Morarma'],
    warnings: ['Ameliyat öncesi doktorunuza bildirin'],
    category: 'Kardiyovasküler',
  },
  {
    id: '3',
    name: 'Concor 5mg',
    active_ingredient: 'Bisoprolol',
    description: 'Beta bloker, yüksek tansiyon ve kalp hastalıklarında kullanılır',
    dosage_forms: ['tablet'],
    standard_dosages: ['5mg', '10mg'],
    pharmacokinetics: {
      absorption_time: 2,
      peak_concentration_time: 3,
      half_life: 11,
      bioavailability: 90,
      protein_binding: 30,
      volume_distribution: 3.5,
      clearance_rate: 300,
      metabolism_pathway: 'Karaciğer',
      excretion_route: 'Böbrek',
    },
    interactions: ['Verapamil', 'Diltiazem'],
    contraindications: ['Kalp yetmezliği', 'Bradikardi'],
    side_effects: ['Yorgunluk', 'Baş dönmesi'],
    warnings: ['Birden bırakılmamalı'],
    category: 'Kardiyovasküler',
  },
];

export const MOCK_MEDICATIONS: MedicationSchedule[] = [
  {
    id: '1',
    drug_id: '1',
    drug_name: 'Coraspin 100mg',
    dosage: '100mg',
    dosage_form: 'tablet',
    frequency: 'daily',
    times_per_day: 1,
    specific_times: ['09:00'],
    start_date: new Date().toISOString(),
    with_food: true,
    special_instructions: 'Kahvaltıdan sonra alın',
    reminder_enabled: true,
    active: true,
  },
  {
    id: '2',
    drug_id: '2',
    drug_name: 'Plavix 75mg',
    dosage: '75mg',
    dosage_form: 'tablet',
    frequency: 'daily',
    times_per_day: 1,
    specific_times: ['20:00'],
    start_date: new Date().toISOString(),
    with_food: false,
    special_instructions: '',
    reminder_enabled: true,
    active: true,
  },
  {
    id: '3',
    drug_id: '3',
    drug_name: 'Concor 5mg',
    dosage: '5mg',
    dosage_form: 'tablet',
    frequency: 'twice_daily',
    times_per_day: 2,
    specific_times: ['08:00', '20:00'],
    start_date: new Date().toISOString(),
    with_food: false,
    special_instructions: '',
    reminder_enabled: true,
    active: true,
  },
];

// Generate doses for today
const generateTodayDoses = (): DoseLog[] => {
  const doses: DoseLog[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  MOCK_MEDICATIONS.forEach((med) => {
    med.specific_times.forEach((time, index) => {
      const [hour, minute] = time.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hour, minute);

      const now = new Date();
      let status: 'scheduled' | 'taken' | 'missed' | 'skipped' = 'scheduled';
      let actualTime: string | undefined;

      // Simulate some taken doses
      if (scheduledTime < now) {
        if (Math.random() > 0.2) {
          status = 'taken';
          actualTime = new Date(scheduledTime.getTime() + Math.random() * 30 * 60000).toISOString();
        } else {
          status = 'missed';
        }
      }

      doses.push({
        id: `${med.id}-${index}`,
        medication_id: med.id,
        drug_name: med.drug_name,
        dosage: med.dosage,
        scheduled_time: scheduledTime.toISOString(),
        actual_time: actualTime,
        status,
        notes: '',
        side_effects_reported: [],
      });
    });
  });

  return doses.sort((a, b) =>
    new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  );
};

export const MOCK_DOSES = generateTodayDoses();

export const MOCK_PROGRESS: ProgressStats = {
  total_doses_scheduled: 90,
  doses_taken: 78,
  doses_missed: 8,
  doses_skipped: 4,
  adherence_rate: 86.67,
  current_streak: 5,
  longest_streak: 12,
  total_active_medications: 3,
};
