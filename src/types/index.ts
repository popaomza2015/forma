export type GoalType = 'lose' | 'build' | 'maintain';
export type SexType = 'male' | 'female';
export type ActivityLevel = 1.2 | 1.375 | 1.55;
export type TrainingDays = 3 | 4 | 5;

export interface UserProfile {
  isOnboarded: boolean;
  goal: GoalType;
  sex: SexType;
  age: number;
  height: number; // cm
  weight: number; // kg
  days: TrainingDays;
  activity: ActivityLevel;
  calorieTarget: number;
  updatedAt: string;
}

export interface ExerciseDef {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full';
  alternatives: string[]; // names of alternative exercises
}

export interface PlanExercise {
  id: string;
  name: string;
  category: string;
  targetSets: number;
  targetReps: string;
  restSec: number;
  alternatives: string[];
}

export interface DayPlan {
  dayIndex: number; // 0 = Mon, 1 = Tue, ..., 6 = Sun
  dayNameThai: string;
  dayShortThai: string;
  isRest: boolean;
  workoutTitle: string;
  description: string;
  exercises: PlanExercise[];
}

export interface CompletedSet {
  setIndex: number;
  reps: number;
  weight: number;
  completedAt: string;
}

export interface WorkoutSessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayTitle: string;
  durationSec: number;
  exercises: {
    name: string;
    targetSets: number;
    sets: CompletedSet[];
  }[];
  notes?: string;
  completedAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  mealType: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ของว่าง';
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  portion: number; // 0.5, 1.0, 1.5
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isUnsure: boolean;
  imageUrl?: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
}

export type MeasurementSiteKey =
  | 'neck'
  | 'chest'
  | 'waist'
  | 'hip'
  | 'arm'
  | 'thigh'
  | 'height'
  | 'weight';

export interface SiteProtocol {
  key: MeasurementSiteKey;
  nameThai: string;
  unit: 'cm' | 'kg';
  protocol: string;
  requiredForNavy?: boolean;
}

export interface MeasurementRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  values: Partial<Record<MeasurementSiteKey, number>>;
  navyBodyFat?: number;
}
