import {
  UserProfile,
  DayPlan,
  WorkoutSessionLog,
  FoodItem,
  MeasurementRecord,
} from '@/types';
import { generateWeeklyPlan, calculateCalorieTarget } from './constants';

const STORAGE_KEYS = {
  PROFILE: 'forma_user_profile',
  WEEKLY_PLAN: 'forma_weekly_plan',
  WORKOUT_LOGS: 'forma_workout_logs',
  FOOD_LOGS: 'forma_food_logs',
  MEASUREMENTS: 'forma_measurements',
};

export function getStoredProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse user profile', err);
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

export function getStoredPlan(): DayPlan[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse weekly plan', err);
    return null;
  }
}

export function saveStoredPlan(plan: DayPlan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.error('Failed to save plan', err);
  }
}

export function getStoredWorkoutLogs(): WorkoutSessionLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse workout logs', err);
    return [];
  }
}

export function saveWorkoutLog(log: WorkoutSessionLog): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredWorkoutLogs();
    const updated = [log, ...existing];
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save workout log', err);
  }
}

export function getStoredFoodLogs(): FoodItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOOD_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse food logs', err);
    return [];
  }
}

export function saveFoodItem(item: FoodItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredFoodLogs();
    const updated = [item, ...existing];
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save food item', err);
  }
}

export function deleteFoodItem(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredFoodLogs();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete food item', err);
  }
}

export function getStoredMeasurements(): MeasurementRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse measurements', err);
    return [];
  }
}

export function saveMeasurementRecord(record: MeasurementRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredMeasurements();
    const updated = [record, ...existing];
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save measurement', err);
  }
}

/**
 * Initialize sample initial measurement & food data if empty, so user immediately experiences Brass Tape design
 */
export function seedSampleDataIfNeeded(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  
  const existingMeasurements = getStoredMeasurements();
  if (existingMeasurements.length === 0) {
    const initialRecords: MeasurementRecord[] = [
      {
        id: 'rec_init_2',
        date: getPastDateString(14),
        timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
        values: {
          height: profile.height,
          weight: profile.weight + 0.8,
          waist: profile.sex === 'male' ? 84.5 : 74.0,
          hip: profile.sex === 'male' ? 96.0 : 98.0,
          neck: profile.sex === 'male' ? 38.0 : 33.0,
          chest: 96.0,
          arm: 32.5,
          thigh: 54.0,
        },
        navyBodyFat: profile.sex === 'male' ? 18.2 : 24.6,
      },
      {
        id: 'rec_init_1',
        date: getPastDateString(2),
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        values: {
          height: profile.height,
          weight: profile.weight,
          waist: profile.sex === 'male' ? 83.5 : 73.0,
          hip: profile.sex === 'male' ? 95.5 : 97.2,
          neck: profile.sex === 'male' ? 38.0 : 33.0,
          chest: 96.5,
          arm: 32.8,
          thigh: 53.8,
        },
        navyBodyFat: profile.sex === 'male' ? 17.5 : 23.8,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(initialRecords));
  }

  const existingFood = getStoredFoodLogs();
  if (existingFood.length === 0) {
    const today = getTodayDateString();
    const sampleFoods: FoodItem[] = [
      {
        id: 'food_seed_1',
        name: 'โจ๊กข้าวกล้องหมูสับใส่ไข่',
        mealType: 'เช้า',
        baseCalories: 340,
        baseProtein: 22,
        baseCarbs: 45,
        baseFat: 8,
        portion: 1.0,
        calories: 340,
        protein: 22,
        carbs: 45,
        fat: 8,
        isUnsure: false,
        date: today,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'food_seed_2',
        name: 'ข้าวอกไก่ย่างน้ำพริกหนุ่มผักต้ม',
        mealType: 'กลางวัน',
        baseCalories: 430,
        baseProtein: 40,
        baseCarbs: 48,
        baseFat: 7,
        portion: 1.0,
        calories: 430,
        protein: 40,
        carbs: 48,
        fat: 7,
        isUnsure: false,
        date: today,
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(sampleFoods));
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateString(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
