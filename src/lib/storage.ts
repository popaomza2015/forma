import {
  UserProfile,
  DayPlan,
  WorkoutSessionLog,
  FoodItem,
  MeasurementRecord,
} from '@/types';
import { generateWeeklyPlan, calculateCalorieTarget, calculateNavyBodyFat } from './constants';

const STORAGE_KEYS = {
  PROFILE: 'forma_user_profile',
  WEEKLY_PLAN: 'forma_weekly_plan',
  WORKOUT_LOGS: 'forma_workout_logs',
  FOOD_LOGS: 'forma_food_logs',
  MEASUREMENTS: 'forma_measurements',
  WATER: 'forma_water_logs',
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

export function getWaterGlasses(): number {
  if (typeof window === 'undefined') return 4;
  try {
    const today = getTodayDateString();
    const raw = localStorage.getItem(`${STORAGE_KEYS.WATER}_${today}`);
    return raw ? Number(raw) : 4;
  } catch {
    return 4;
  }
}

export function saveWaterGlasses(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    const today = getTodayDateString();
    localStorage.setItem(`${STORAGE_KEYS.WATER}_${today}`, String(Math.max(0, count)));
  } catch (err) {
    console.error('Failed to save water count', err);
  }
}

/**
 * Initialize sample initial measurement & food data if empty, so user immediately experiences Brass Tape design
 */
export function seedSampleDataIfNeeded(profile: UserProfile): void {
  if (typeof window === 'undefined') return;

  const existingMeasurements = getStoredMeasurements();
  if (existingMeasurements.length === 0) {
    const isMale = profile.sex === 'male';
    const initialWaist = isMale ? Math.round(profile.height * 0.48 * 10) / 10 : Math.round(profile.height * 0.43 * 10) / 10;
    const initialHip = isMale ? Math.round(initialWaist * 1.14 * 10) / 10 : Math.round(initialWaist * 1.32 * 10) / 10;
    const initialNeck = isMale ? 38.0 : 33.0;

    const bf1 = calculateNavyBodyFat(profile.sex, profile.height, initialNeck, initialWaist, initialHip);
    const bf2 = calculateNavyBodyFat(profile.sex, profile.height, initialNeck, initialWaist + 0.8, initialHip + 0.6);

    const initialRecords: MeasurementRecord[] = [
      {
        id: 'rec_baseline_today',
        date: getTodayDateString(),
        timestamp: new Date().toISOString(),
        values: {
          height: profile.height,
          weight: profile.weight,
          waist: initialWaist,
          hip: initialHip,
          neck: initialNeck,
          chest: isMale ? 96.5 : 88.0,
          arm: isMale ? 33.0 : 27.5,
          thigh: isMale ? 54.0 : 51.5,
        },
        navyBodyFat: bf1 ?? (isMale ? 17.5 : 23.5),
      },
      {
        id: 'rec_baseline_prev',
        date: getPastDateString(14),
        timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
        values: {
          height: profile.height,
          weight: Math.round((profile.weight + 0.8) * 10) / 10,
          waist: Math.round((initialWaist + 0.8) * 10) / 10,
          hip: Math.round((initialHip + 0.6) * 10) / 10,
          neck: initialNeck,
          chest: isMale ? 96.0 : 87.5,
          arm: isMale ? 32.5 : 27.0,
          thigh: isMale ? 54.5 : 52.0,
        },
        navyBodyFat: bf2 ?? (isMale ? 18.2 : 24.2),
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
        name: 'โจ๊กหมูสับใส่ไข่ลวกขิงซอย',
        mealType: 'เช้า',
        baseCalories: 320,
        baseProtein: 20,
        baseCarbs: 42,
        baseFat: 8,
        portion: 1.0,
        calories: 320,
        protein: 20,
        carbs: 42,
        fat: 8,
        isUnsure: false,
        date: today,
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'food_seed_2',
        name: 'ข้าวกะเพราอกไก่ไข่ดาวน้ำ',
        mealType: 'กลางวัน',
        baseCalories: 460,
        baseProtein: 38,
        baseCarbs: 52,
        baseFat: 9,
        portion: 1.0,
        calories: 460,
        protein: 38,
        carbs: 52,
        fat: 9,
        isUnsure: false,
        date: today,
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
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
