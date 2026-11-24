'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Ruler,
  Play,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Droplets,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  Sunrise,
  Sun,
  Sunset,
  Coffee,
} from 'lucide-react';
import {
  UserProfile,
  DayPlan,
  FoodItem,
  MeasurementRecord,
  WorkoutSessionLog,
  MealCategoryKey,
} from '@/types';
import {
  getTodayDateString,
  getWaterGlasses,
  saveWaterGlasses,
} from '@/lib/storage';

interface TodayTabProps {
  profile: UserProfile;
  plan: DayPlan[];
  foodLogs: FoodItem[];
  measurements: MeasurementRecord[];
  workoutLogs: WorkoutSessionLog[];
  onStartSession: (dayPlan: DayPlan) => void;
  onOpenFoodSheet: (category?: MealCategoryKey) => void;
  onOpenMeasureFlow: () => void;
  onNavigateTab: (tab: 'today' | 'plan' | 'food' | 'measure') => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  profile,
  plan,
  foodLogs,
  measurements,
  workoutLogs,
  onStartSession,
  onOpenFoodSheet,
  onOpenMeasureFlow,
  onNavigateTab,
}) => {
  const todayStr = getTodayDateString();
  const d = new Date();

  // Water tracking state
  const [waterCount, setWaterCount] = useState<number>(() => getWaterGlasses());

  const handleUpdateWater = (delta: number) => {
    const updated = Math.max(0, Math.min(16, waterCount + delta));
    setWaterCount(updated);
    saveWaterGlasses(updated);
  };

  // Thai Date formatting
  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];
  const dayName = thaiDays[d.getDay()];
  const dateFormatted = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;

  // Find today's plan
  const jsDay = d.getDay();
  const dayPlanIndex = jsDay === 0 ? 6 : jsDay - 1;
  const todayPlan = plan[dayPlanIndex] || plan[0];

  // Check if today has a logged workout
  const todayWorkoutDone = workoutLogs.some((w) => w.date === todayStr);

  // Calories eaten today
  const todayFoods = foodLogs.filter((f) => f.date === todayStr);
  const eatenCalories = todayFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const targetCalories = profile.calorieTarget || 2000;
  const remainingCalories = targetCalories - eatenCalories;
  const isOver = eatenCalories > targetCalories;

  // Breakdown by meal category
  const mealCategories: { key: MealCategoryKey; label: string; icon: React.ReactNode; budget: number }[] = [
    { key: 'เช้า', label: 'เช้า', icon: <Sunrise className="w-3.5 h-3.5 text-[#A6844A]" />, budget: Math.round(targetCalories * 0.25) },
    { key: 'กลางวัน', label: 'กลางวัน', icon: <Sun className="w-3.5 h-3.5 text-[#C4623A]" />, budget: Math.round(targetCalories * 0.35) },
    { key: 'เย็น', label: 'เย็น', icon: <Sunset className="w-3.5 h-3.5 text-[#1F4D3A]" />, budget: Math.round(targetCalories * 0.30) },
    { key: 'ของว่าง', label: 'ว่าง', icon: <Coffee className="w-3.5 h-3.5 text-[#6F6A62]" />, budget: Math.round(targetCalories * 0.10) },
  ];

  // Latest measurements
  const latestMeasure = measurements[0];
  const prevMeasure = measurements[1];

  let waistChangeText = '';
  if (latestMeasure?.values.waist && prevMeasure?.values.waist) {
    const diff = Math.round((latestMeasure.values.waist - prevMeasure.values.waist) * 10) / 10;
    if (diff > 0) waistChangeText = `+${diff} cm`;
    else if (diff < 0) waistChangeText = `${diff} cm`;
    else waistChangeText = 'เท่าเดิม';
  }

  let weightChangeText = '';
  if (latestMeasure?.values.weight && prevMeasure?.values.weight) {
    const diff = Math.round((latestMeasure.values.weight - prevMeasure.values.weight) * 10) / 10;
    if (diff > 0) weightChangeText = `+${diff} kg`;
    else if (diff < 0) weightChangeText = `${diff} kg`;
    else weightChangeText = 'เท่าเดิม';
  }

  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      {/* Date Header & Today's Focus */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">วัน{dayName}</h1>
            <span className="text-sm font-semibold text-[#6F6A62] tabular-numbers">{dateFormatted}</span>
          </div>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            {todayPlan?.isRest ? 'วันพักผ่อนและฟื้นฟูกล้ามเนื้อ' : `วันนี้: ${todayPlan?.workoutTitle}`}
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] font-bold">
          สัปดาห์ที่ 1
        </span>
      </div>

      {/* Calorie Card with 8px linear track and 4 Meal Category Quick Snap */}
      <section className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A6844A]"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
              สมดุลพลังงานวันนี้
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#6F6A62]">
            เป้าหมาย {targetCalories.toLocaleString()} kcal
          </span>
        </div>

        {/* Tabular numbers row */}
        <div className="grid grid-cols-3 gap-2 py-1 items-baseline">
          <div>
            <div className="text-[11px] text-[#6F6A62]">ได้รับแล้ว</div>
            <div className="text-2xl font-bold tabular-numbers text-[#1C1B19] mt-0.5">
              {eatenCalories.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#6F6A62]">kcal</span>
          </div>

          <div>
            <div className="text-[11px] text-[#6F6A62]">เป้าหมาย</div>
            <div className="text-2xl font-semibold tabular-numbers text-[#6F6A62] mt-0.5">
              {targetCalories.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#6F6A62]">kcal</span>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-[#6F6A62]">
              {isOver ? 'เกินเป้าหมาย' : 'คงเหลือ'}
            </div>
            <div
              className={`text-2xl font-bold tabular-numbers mt-0.5 ${
                isOver ? 'text-[#9C3B2E]' : 'text-[#2E6B4F]'
              }`}
            >
              {Math.abs(remainingCalories).toLocaleString()}
            </div>
            <span className="text-[10px] text-[#6F6A62]">kcal</span>
          </div>
        </div>

        {/* 8px linear track (clay fill, turns over-color if above target) */}
        <div className="pt-1">
          <div className="w-full h-2 bg-[#E4DDD2] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isOver ? 'bg-[#9C3B2E]' : 'bg-[#C4623A]'
              }`}
              style={{ width: `${Math.min(100, (eatenCalories / targetCalories) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] mt-1.5 text-[#6F6A62]">
            <span>
              {isOver
                ? `เกินเป้าหมาย ${Math.abs(remainingCalories).toLocaleString()} kcal`
                : `คงเหลืออีก ${remainingCalories.toLocaleString()} kcal`}
            </span>
            <span className="tabular-numbers font-medium">
              {Math.round((eatenCalories / targetCalories) * 100)}%
            </span>
          </div>
        </div>

        {/* 4 MEAL CATEGORY QUICK SNAP BUTTONS */}
        <div className="border-t border-[#E4DDD2] pt-3">
          <span className="text-[10px] font-semibold text-[#6F6A62] block mb-2">
            ถ่ายรูปเช็คแคลอรี่แยกตามมื้อ:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {mealCategories.map((cat) => {
              const catFoods = todayFoods.filter((f) => f.mealType === cat.key);
              const catKcal = catFoods.reduce((acc, f) => acc + (f.calories || 0), 0);

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => onOpenFoodSheet(cat.key)}
                  className="p-2 rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2] hover:border-[#A6844A] active:scale-[0.98] transition-all text-center flex flex-col items-center justify-between"
                >
                  <div className="flex items-center space-x-1 mb-1">
                    {cat.icon}
                    <span className="text-[10px] font-bold text-[#1C1B19]">{cat.label}</span>
                  </div>
                  <div className="text-xs font-bold tabular-numbers text-[#C4623A]">
                    {catKcal > 0 ? `${catKcal}` : '0'}
                  </div>
                  <span className="text-[9px] text-[#6F6A62] tabular-numbers">
                    /{cat.budget}k
                  </span>
                  <div className="mt-1 px-1.5 py-0.5 rounded-full bg-[#1C1B19] text-[#FBF9F5] text-[9px] flex items-center space-x-0.5">
                    <Camera className="w-2.5 h-2.5 text-[#A6844A]" />
                    <span>เช็ค</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Session Card (Today's Training) */}
      <section className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
              {todayPlan?.isRest ? 'การพักฟื้นกล้ามเนื้อ' : 'โปรแกรมการฝึกวันนี้'}
            </span>
          </div>
          <span className="text-xs font-bold text-[#A6844A]">
            {todayPlan?.dayNameThai}
          </span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#1C1B19] tracking-tight">
            {todayPlan?.workoutTitle}
          </h2>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            {todayPlan?.description}
          </p>
        </div>

        {!todayPlan?.isRest ? (
          <div>
            {/* Exercises preview cards */}
            <div className="space-y-1.5 mb-4 border-t border-[#E4DDD2] pt-3">
              {todayPlan?.exercises.slice(0, 4).map((ex, idx) => (
                <div key={ex.id || idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-4 text-[11px] tabular-numbers font-bold text-[#6F6A62]">
                      {idx + 1}.
                    </span>
                    <span className="text-[#1C1B19] truncate font-semibold">
                      {ex.name.split('(')[0]}
                    </span>
                  </div>
                  <span className="text-[#6F6A62] tabular-numbers shrink-0 text-[11px] font-medium">
                    {ex.targetSets} เซ็ต x {ex.targetReps}
                  </span>
                </div>
              ))}
              {todayPlan?.exercises.length > 4 && (
                <div className="text-[11px] text-[#A6844A] pt-0.5 font-medium">
                  + อีก {todayPlan.exercises.length - 4} ท่าฝึกในวงจร
                </div>
              )}
            </div>

            {/* Start Button */}
            {todayWorkoutDone ? (
              <div className="w-full h-[52px] rounded-[12px] bg-[#1F4D3A]/10 border border-[#1F4D3A]/30 text-[#1F4D3A] font-semibold text-sm flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F4D3A]" />
                <span>บันทึกการฝึกซ้อมวันนี้เรียบร้อยแล้ว</span>
              </div>
            ) : (
              <button
                onClick={() => onStartSession(todayPlan)}
                className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current text-[#A6844A]" />
                <span>เริ่มฝึกซ้อม ({todayPlan?.exercises.length} ท่า)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="border-t border-[#E4DDD2] pt-3">
            <p className="text-xs text-[#6F6A62] mb-3">
              วันนี้เป็นวันพักผ่อนเพื่อให้เส้นใยกล้ามเนื้อซ่อมแซมและสะสมไกลโคเจน
            </p>
            <button
              onClick={() => onNavigateTab('plan')}
              className="w-full h-[50px] rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] text-[#1C1B19] font-semibold text-xs flex items-center justify-center space-x-1.5 active:bg-[#E4DDD2]"
            >
              <span>ดูตารางฝึกทั้งเดือน (4 สัปดาห์)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A6844A]" />
            </button>
          </div>
        )}
      </section>

      {/* Hydration Widget (ดื่มน้ำสะอาด) */}
      <section className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-[12px] bg-[#F3F0EA] text-[#1F4D3A] border border-[#E4DDD2]">
            <Droplets className="w-5 h-5 text-[#2E6B4F]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1C1B19]">ดื่มน้ำสะอาดวันนี้</div>
            <div className="text-[11px] text-[#6F6A62]">
              ดื่มแล้ว <span className="font-bold tabular-numbers text-[#1C1B19]">{waterCount}</span> / 8 แก้ว (~{(waterCount * 250).toLocaleString()} ml)
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => handleUpdateWater(-1)}
            disabled={waterCount <= 0}
            className="w-8 h-8 rounded-[8px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-center text-[#1C1B19] disabled:opacity-30 active:bg-[#E4DDD2]"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleUpdateWater(1)}
            className="w-8 h-8 rounded-[8px] bg-[#1C1B19] text-[#FBF9F5] flex items-center justify-center active:scale-[0.95]"
          >
            <Plus className="w-3.5 h-3.5 text-[#A6844A]" />
          </button>
        </div>
      </section>

      {/* Last measurement summary */}
      <section className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
            สัดส่วนล่าสุด (เทปวัดรอบตัว)
          </span>
          {latestMeasure && (
            <span className="text-[11px] text-[#6F6A62] tabular-numbers font-medium">
              {latestMeasure.date}
            </span>
          )}
        </div>

        {latestMeasure ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F3F0EA] rounded-[12px] border border-[#E4DDD2]">
              <div className="text-[11px] text-[#6F6A62]">รอบเอว (Waist)</div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold tabular-numbers text-[#1C1B19]">
                  {latestMeasure.values.waist ?? '-'}
                </span>
                <span className="text-xs text-[#6F6A62]">cm</span>
              </div>
              {waistChangeText && (
                <div className="text-[10px] text-[#6F6A62] mt-0.5">
                  เทียบก่อนหน้า: <span className="tabular-numbers font-semibold text-[#1C1B19]">{waistChangeText}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#F3F0EA] rounded-[12px] border border-[#E4DDD2]">
              <div className="text-[11px] text-[#6F6A62]">น้ำหนักตัว (Weight)</div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold tabular-numbers text-[#1C1B19]">
                  {latestMeasure.values.weight ?? '-'}
                </span>
                <span className="text-xs text-[#6F6A62]">kg</span>
              </div>
              {weightChangeText && (
                <div className="text-[10px] text-[#6F6A62] mt-0.5">
                  เทียบก่อนหน้า: <span className="tabular-numbers font-semibold text-[#1C1B19]">{weightChangeText}</span>
                </div>
              )}
            </div>

            {latestMeasure.navyBodyFat && (
              <div className="col-span-2 p-2.5 bg-[#F3F0EA] rounded-[10px] border border-[#E4DDD2] flex items-center justify-between text-xs">
                <span className="text-[#6F6A62]">ค่าประมาณไขมัน (Navy Formula):</span>
                <span className="font-bold tabular-numbers text-[#A6844A]">
                  {latestMeasure.navyBodyFat}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[#6F6A62] py-2">
            บันทึกรอบเอวและจุดสำคัญเพื่อติดตามพัฒนาการสรีระ
          </div>
        )}
      </section>

      {/* Two quiet actions: Photo food & Measure */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => onOpenFoodSheet()}
          className="h-[52px] rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] font-semibold text-xs flex items-center justify-center space-x-2 active:bg-[#E4DDD2]/40 transition-colors duration-200 shadow-sm"
        >
          <Camera className="w-4 h-4 text-[#C4623A]" />
          <span>บันทึกอาหาร</span>
        </button>

        <button
          onClick={onOpenMeasureFlow}
          className="h-[52px] rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] font-semibold text-xs flex items-center justify-center space-x-2 active:bg-[#E4DDD2]/40 transition-colors duration-200 shadow-sm"
        >
          <Ruler className="w-4 h-4 text-[#A6844A]" />
          <span>วัดสัดส่วน</span>
        </button>
      </div>
    </div>
  );
};
