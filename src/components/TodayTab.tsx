'use client';

import React from 'react';
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
} from 'lucide-react';
import { UserProfile, DayPlan, FoodItem, MeasurementRecord, WorkoutSessionLog } from '@/types';
import { getTodayDateString } from '@/lib/storage';

interface TodayTabProps {
  profile: UserProfile;
  plan: DayPlan[];
  foodLogs: FoodItem[];
  measurements: MeasurementRecord[];
  workoutLogs: WorkoutSessionLog[];
  onStartSession: (dayPlan: DayPlan) => void;
  onOpenFoodSheet: () => void;
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

  // Thai Date formatting
  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];
  const dayName = thaiDays[d.getDay()];
  const dateFormatted = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;

  // Find today's plan: JavaScript getDay() 0 is Sunday, 1 is Monday ... 6 is Saturday
  // In our DayPlan array: index 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
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
  const progressRatio = Math.min(1.4, Math.max(0, eatenCalories / targetCalories));

  // Latest measurements
  const latestMeasure = measurements[0];
  const prevMeasure = measurements[1];

  let waistChangeText = '';
  if (latestMeasure?.values.waist && prevMeasure?.values.waist) {
    const diff = latestMeasure.values.waist - prevMeasure.values.waist;
    if (diff > 0) waistChangeText = `+${diff.toFixed(1)} cm`;
    else if (diff < 0) waistChangeText = `${diff.toFixed(1)} cm`;
    else waistChangeText = 'เท่าเดิม';
  }

  let weightChangeText = '';
  if (latestMeasure?.values.weight && prevMeasure?.values.weight) {
    const diff = latestMeasure.values.weight - prevMeasure.values.weight;
    if (diff > 0) weightChangeText = `+${diff.toFixed(1)} kg`;
    else if (diff < 0) weightChangeText = `${diff.toFixed(1)} kg`;
    else weightChangeText = 'เท่าเดิม';
  }

  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      {/* Date & Subtitle */}
      <div>
        <div className="flex items-baseline space-x-2">
          <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">วัน{dayName}</h1>
          <span className="text-sm font-medium text-[#6F6A62] tabular-numbers">{dateFormatted}</span>
        </div>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          {todayPlan?.isRest ? 'วันนี้เป็นวันพักฟื้นกล้ามเนื้อ' : `วันนี้: ${todayPlan?.workoutTitle}`}
        </p>
      </div>

      {/* Calorie Card with 8px linear track */}
      <section className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A6844A]"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
              สมดุลพลังงานประจำวัน
            </span>
          </div>
          <span className="text-[11px] text-[#6F6A62]">
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
        <div className="mt-4 mb-2">
          <div className="w-full h-2 bg-[#E4DDD2] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isOver ? 'bg-[#9C3B2E]' : 'bg-[#C4623A]'
              }`}
              style={{ width: `${Math.min(100, (eatenCalories / targetCalories) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] mt-2 text-[#6F6A62]">
            <span>
              {isOver
                ? `เกินเป้าหมาย ${Math.abs(remainingCalories).toLocaleString()} kcal`
                : `คงเหลืออีก ${remainingCalories.toLocaleString()} kcal`}
            </span>
            <span className="tabular-numbers">
              {Math.round((eatenCalories / targetCalories) * 100)}%
            </span>
          </div>
        </div>
      </section>

      {/* Session Card */}
      <section className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
              {todayPlan?.isRest ? 'แผนการพักฟื้น' : 'โปรแกรมการฝึกวันนี้'}
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#A6844A]">
            {todayPlan?.dayNameThai}
          </span>
        </div>

        <h2 className="text-lg font-bold text-[#1C1B19] tracking-tight">
          {todayPlan?.workoutTitle}
        </h2>
        <p className="text-xs text-[#6F6A62] mt-0.5 mb-3.5">
          {todayPlan?.description}
        </p>

        {!todayPlan?.isRest ? (
          <div>
            {/* Exercises preview */}
            <div className="space-y-1.5 mb-4 border-t border-[#E4DDD2] pt-3">
              {todayPlan?.exercises.slice(0, 4).map((ex, idx) => (
                <div key={ex.id || idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-4 text-[11px] tabular-numbers text-[#6F6A62]">{idx + 1}.</span>
                    <span className="text-[#1C1B19] truncate font-medium">{ex.name.split('(')[0]}</span>
                  </div>
                  <span className="text-[#6F6A62] tabular-numbers shrink-0 text-[11px]">
                    {ex.targetSets} เซ็ต x {ex.targetReps}
                  </span>
                </div>
              ))}
              {todayPlan?.exercises.length > 4 && (
                <div className="text-[11px] text-[#6F6A62] pt-1">
                  + อีก {todayPlan.exercises.length - 4} ท่าฝึก
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
                className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>เริ่มฝึกซ้อม ({todayPlan?.exercises.length} ท่า)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="border-t border-[#E4DDD2] pt-3">
            <p className="text-xs text-[#6F6A62] mb-3">
              การพักผ่อนและการนอนหลับอย่างเพียงพอคือหัวใจสำคัญของการสร้างกล้ามเนื้อและการฟื้นฟูระบบประสาท
            </p>
            <button
              onClick={() => onNavigateTab('plan')}
              className="w-full h-[52px] rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] text-[#1C1B19] font-medium text-xs flex items-center justify-center space-x-1.5"
            >
              <span>ดูตารางฝึกทั้งสัปดาห์</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6F6A62]" />
            </button>
          </div>
        )}
      </section>

      {/* Last measurement summary */}
      <section className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
            สัดส่วนล่าสุด (เทปวัดรอบตัว)
          </span>
          {latestMeasure && (
            <span className="text-[11px] text-[#6F6A62] tabular-numbers">
              {latestMeasure.date}
            </span>
          )}
        </div>

        {latestMeasure ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
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
                  เทียบครั้งก่อน: <span className="tabular-numbers font-medium">{waistChangeText}</span>
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
                  เทียบครั้งก่อน: <span className="tabular-numbers font-medium">{weightChangeText}</span>
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
            ยังไม่มีบันทึกสัดส่วนแรก ใช้เวลา 2 นาทีเพื่อบันทึกรอบเอวและจุดสำคัญ
          </div>
        )}
      </section>

      {/* Two quiet actions: Photo food & Measure */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={onOpenFoodSheet}
          className="h-[52px] rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] font-medium text-xs flex items-center justify-center space-x-2 active:bg-[#E4DDD2]/40 transition-colors duration-200"
        >
          <Camera className="w-4 h-4 text-[#C4623A]" />
          <span>บันทึกอาหาร</span>
        </button>

        <button
          onClick={onOpenMeasureFlow}
          className="h-[52px] rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] font-medium text-xs flex items-center justify-center space-x-2 active:bg-[#E4DDD2]/40 transition-colors duration-200"
        >
          <Ruler className="w-4 h-4 text-[#A6844A]" />
          <span>วัดสัดส่วน</span>
        </button>
      </div>
    </div>
  );
};
