'use client';

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  Dumbbell,
  Clock,
  RotateCcw,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
  Info,
  Play,
} from 'lucide-react';
import { DayPlan, PlanExercise, UserProfile, MonthCycleWeek } from '@/types';
import { generateMonthPlan } from '@/lib/constants';

interface PlanTabProps {
  profile: UserProfile;
  plan: DayPlan[];
  onUpdatePlan: (updatedPlan: DayPlan[]) => void;
  onStartSession: (dayPlan: DayPlan) => void;
}

export const PlanTab: React.FC<PlanTabProps> = ({
  profile,
  plan,
  onUpdatePlan,
  onStartSession,
}) => {
  // Current view: 'month' (ภาพรวมทั้งเดือน) or 'day' (เจาะลึกตารางฝึกประจำวัน)
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1; // Default to today's dayIndex
  });

  const [swappingExercise, setSwappingExercise] = useState<{
    dayIndex: number;
    exerciseIndex: number;
    currentEx: PlanExercise;
  } | null>(null);

  // Generate 4-week monthly mesocycle
  const monthWeeks: MonthCycleWeek[] = generateMonthPlan(profile.days, profile.goal);
  const currentWeek = monthWeeks.find((w) => w.weekNumber === selectedWeekNum) || monthWeeks[0];

  // Active day in the current week
  const activeDay = plan[selectedDayIndex] || plan[0];

  // Workout days in month
  const totalWorkoutDaysInMonth = profile.days * 4;

  const handleSwapExercise = (newExerciseName: string) => {
    if (!swappingExercise) return;
    const { dayIndex, exerciseIndex, currentEx } = swappingExercise;

    const newPlan = [...plan];
    const targetDay = { ...newPlan[dayIndex] };
    const newExercises = [...targetDay.exercises];

    const currentName = currentEx.name;
    const updatedAlternatives = currentEx.alternatives
      .filter((alt) => alt !== newExerciseName)
      .concat(currentName);

    newExercises[exerciseIndex] = {
      ...currentEx,
      name: newExerciseName,
      alternatives: updatedAlternatives,
    };

    targetDay.exercises = newExercises;
    newPlan[dayIndex] = targetDay;

    onUpdatePlan(newPlan);
    setSwappingExercise(null);
  };

  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      {/* Title & View Switcher */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">แผนการฝึก</h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#A6844A]/10 text-[#A6844A]">
            {profile.days} วัน / สัปดาห์
          </span>
        </div>
        <p className="text-xs text-[#6F6A62]">
          ภาพรวมรอบ 1 เดือน (4 สัปดาห์) และเจาะลึกท่าฝึกประจำวัน
        </p>

        {/* View Switcher Pills */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FBF9F5] border border-[#E4DDD2] rounded-[12px] mt-3">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              viewMode === 'month'
                ? 'bg-[#1C1B19] text-[#FBF9F5] shadow-sm'
                : 'text-[#6F6A62] hover:text-[#1C1B19]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>ภาพรวมทั้งเดือน (4 สัปดาห์)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              viewMode === 'day'
                ? 'bg-[#1C1B19] text-[#FBF9F5] shadow-sm'
                : 'text-[#6F6A62] hover:text-[#1C1B19]'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>เจาะลึกวันนี้ / ท่าฝึก</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTH OVERVIEW (หมวดแพลนทั้งเดือน) */}
      {viewMode === 'month' && (
        <div className="space-y-4">
          {/* Monthly Cycle Summary Card */}
          <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
                รอบการฝึกประจำเดือน (Monthly Mesocycle)
              </span>
              <span className="text-xs font-bold tabular-numbers text-[#A6844A]">
                {totalWorkoutDaysInMonth} วันฝึก / เดือน
              </span>
            </div>

            <p className="text-xs text-[#6F6A62] leading-relaxed">
              โครงสร้างรอบ 4 สัปดาห์ถูกออกแบบให้มีการก้าวหน้าอย่างเป็นระบบ (Periodization):
              เริ่มต้นด้วยการวางรากฐานฟอร์ม เพิ่มปริมาตร พีคขีดจำกัด และฟื้นฟูสภาพเพื่อไม่ให้กล้ามเนื้อทำงานหนักเกินไป
            </p>

            {/* 4-Week Progress Indicator */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {monthWeeks.map((w) => {
                const isSelected = selectedWeekNum === w.weekNumber;
                return (
                  <button
                    key={w.weekNumber}
                    type="button"
                    onClick={() => setSelectedWeekNum(w.weekNumber)}
                    className={`p-2.5 rounded-[12px] text-center border transition-all ${
                      isSelected
                        ? 'border-[#A6844A] bg-[#1C1B19] text-[#FBF9F5] shadow-sm'
                        : 'border-[#E4DDD2] bg-[#F3F0EA] text-[#6F6A62] hover:text-[#1C1B19]'
                    }`}
                  >
                    <span className="text-[10px] block font-medium opacity-80">สัปดาห์</span>
                    <span className="text-sm font-bold tabular-numbers block">{w.weekNumber}</span>
                    <span className="text-[9px] block mt-0.5 truncate">{w.badge.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Week Card */}
          <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#A6844A]/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#A6844A]/10 text-[#A6844A]">
                {currentWeek.badge}
              </span>
              <span className="text-xs text-[#6F6A62]">สัปดาห์ที่ {currentWeek.weekNumber} จาก 4</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1C1B19]">{currentWeek.title}</h3>
              <p className="text-xs text-[#6F6A62] mt-0.5">{currentWeek.subtitle}</p>
            </div>

            {/* 7-Day Matrix for this week */}
            <div className="border-t border-[#E4DDD2] pt-3 space-y-2">
              <span className="text-[11px] font-semibold text-[#6F6A62] block">
                ตารางฝึกในสัปดาห์นี้ (แตะเพื่อเจาะลึก):
              </span>

              <div className="grid grid-cols-1 gap-2">
                {plan.map((d, dIdx) => (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => {
                      setSelectedDayIndex(dIdx);
                      setViewMode('day'); // Jump directly to deep-dive!
                    }}
                    className={`p-3 rounded-[12px] border text-left transition-all flex items-center justify-between ${
                      d.isRest
                        ? 'bg-[#F3F0EA]/70 border-[#E4DDD2] text-[#6F6A62]'
                        : 'bg-[#F3F0EA] border-[#E4DDD2] hover:border-[#A6844A] text-[#1C1B19]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 text-xs font-bold tabular-numbers">{d.dayShortThai}</span>
                      <div>
                        <div className="text-xs font-semibold">{d.workoutTitle}</div>
                        <div className="text-[10px] text-[#6F6A62]">
                          {d.isRest ? 'พักฟื้นกล้ามเนื้อ' : `${d.exercises.length} ท่าฝึก • ${d.focusMuscle || 'ทั่วร่าง'}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-[#A6844A]">
                      {!d.isRest && <span className="text-[11px] font-medium">ดูเจาะลึก</span>}
                      <ChevronRight className="w-4 h-4 text-[#6F6A62]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY DEEP-DIVE (เจาะลึกว่าวันนี้เล่นอะไรบ้าง) */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Mon-Sun Day Selector Strip */}
          <div className="grid grid-cols-7 gap-1.5 p-1 bg-[#FBF9F5] border border-[#E4DDD2] rounded-[16px]">
            {plan.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`py-2 rounded-[12px] flex flex-col items-center justify-center transition-colors duration-200 ${
                    isSelected
                      ? 'bg-[#1C1B19] text-[#FBF9F5]'
                      : 'hover:bg-[#F3F0EA] text-[#6F6A62]'
                  }`}
                >
                  <span className="text-[11px] font-semibold">{day.dayShortThai}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      day.isRest
                        ? isSelected
                          ? 'bg-[#E4DDD2]/40'
                          : 'bg-transparent'
                        : isSelected
                        ? 'bg-[#A6844A]'
                        : 'bg-[#1F4D3A]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Deep-Dive Card */}
          <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#A6844A] tracking-wider uppercase">
                  {activeDay.dayNameThai}
                </span>
                <h2 className="text-xl font-bold text-[#1C1B19] tracking-tight mt-0.5">
                  {activeDay.workoutTitle}
                </h2>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  activeDay.isRest
                    ? 'bg-[#E4DDD2] text-[#6F6A62]'
                    : 'bg-[#1F4D3A]/10 text-[#1F4D3A]'
                }`}
              >
                {activeDay.isRest ? 'วันพักผ่อน' : 'วันฝึกซ้อม'}
              </span>
            </div>

            <p className="text-xs text-[#6F6A62]">{activeDay.description}</p>

            {/* Quick Metrics */}
            {!activeDay.isRest && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#F3F0EA] rounded-[12px] border border-[#E4DDD2] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#6F6A62] block">จำนวนท่า</span>
                  <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
                    {activeDay.exercises.length} ท่า
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6A62] block">ระยะเวลาประมาณ</span>
                  <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
                    ~{activeDay.durationMin || 45} นาที
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6A62] block">เป้าหมายเซ็ต</span>
                  <span className="text-sm font-bold tabular-numbers text-[#A6844A]">
                    {profile.goal === 'lose' ? '3x10-12' : profile.goal === 'build' ? '4x6-10' : '3x8-12'}
                  </span>
                </div>
              </div>
            )}

            {/* Rest Day view */}
            {activeDay.isRest ? (
              <div className="p-4 rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] text-xs text-[#6F6A62] space-y-2">
                <p className="font-semibold text-[#1C1B19]">คำแนะนำสำหรับการพักฟื้นในวันนี้:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>ดื่มน้ำสะอาดให้เพียงพอ 2–3 ลิตร</li>
                  <li>ยืดเหยียดเบาๆ หรือเดินผ่อนคลาย 20–30 นาที</li>
                  <li>รับประทานโปรตีนให้ครบตามเป้าหมายเพื่อซ่อมแซมกล้ามเนื้อ</li>
                  <li>เข้านอนตรงเวลาเพื่อฮอร์โมนการฟื้นฟูที่สมบูรณ์</li>
                </ul>
              </div>
            ) : (
              /* Exercise List with Cues and Swap Action */
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6F6A62]">
                  <span>รายการท่าฝึกอย่างละเอียด ({activeDay.exercises.length} ท่า)</span>
                  <span className="text-[11px] text-[#A6844A]">แตะปุ่มสลับเพื่อเปลี่ยนท่า</span>
                </div>

                <div className="space-y-2.5">
                  {activeDay.exercises.map((ex, exIdx) => (
                    <div
                      key={ex.id || exIdx}
                      className="p-3.5 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[14px] space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <span className="text-xs font-bold tabular-numbers text-[#6F6A62] mt-0.5">
                            {exIdx + 1}.
                          </span>
                          <div>
                            <span className="text-xs font-bold text-[#1C1B19] block">
                              {ex.name}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FBF9F5] text-[#A6844A] border border-[#E4DDD2] inline-block mt-1">
                              {ex.category}
                            </span>
                          </div>
                        </div>

                        {ex.alternatives && ex.alternatives.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setSwappingExercise({
                                dayIndex: selectedDayIndex,
                                exerciseIndex: exIdx,
                                currentEx: ex,
                              })
                            }
                            title="สลับท่าฝึก"
                            className="p-2 rounded-[8px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#6F6A62] hover:text-[#1C1B19] active:bg-[#E4DDD2]"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-[#A6844A]" />
                          </button>
                        )}
                      </div>

                      {/* Sets, Reps, Rest */}
                      <div className="flex items-center space-x-3 text-[11px] text-[#6F6A62] bg-[#FBF9F5] p-2 rounded-[8px] border border-[#E4DDD2]">
                        <span className="tabular-numbers font-medium text-[#1C1B19]">
                          {ex.targetSets} เซ็ต x {ex.targetReps}
                        </span>
                        <span>•</span>
                        <span className="tabular-numbers text-[#A6844A] font-medium">
                          พัก {ex.restSec} วินาที
                        </span>
                      </div>

                      {/* Technique Cue */}
                      {ex.cue && (
                        <div className="text-[11px] text-[#6F6A62] flex items-start space-x-1.5 pt-0.5">
                          <Info className="w-3.5 h-3.5 text-[#A6844A] shrink-0 mt-0.5" />
                          <span>{ex.cue}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Big Start Workout Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onStartSession(activeDay)}
                    className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200 shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current text-[#A6844A]" />
                    <span>เริ่มฝึกซ้อมวันนี้ ({activeDay.workoutTitle})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Swap Exercise Modal Sheet */}
      {swappingExercise && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 forma-transition">
          <div className="w-full max-w-[480px] bg-[#FBF9F5] rounded-t-[24px] border-t border-x border-[#E4DDD2] px-5 py-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD2]">
              <div>
                <h3 className="text-base font-bold text-[#1C1B19]">เลือกท่าฝึกทดแทน</h3>
                <p className="text-xs text-[#6F6A62]">
                  ท่าปัจจุบัน: {swappingExercise.currentEx.name}
                </p>
              </div>
              <button
                onClick={() => setSwappingExercise(null)}
                className="text-xs px-2.5 py-1 rounded-[8px] bg-[#F3F0EA] text-[#6F6A62]"
              >
                ยกเลิก
              </button>
            </div>

            <div className="space-y-2 py-4">
              <div className="text-xs font-semibold text-[#6F6A62] mb-1">
                ท่าฝึกที่ทำงานกับกลุ่มกล้ามเนื้อเดียวกัน:
              </div>
              {swappingExercise.currentEx.alternatives.map((altName, i) => (
                <button
                  key={i}
                  onClick={() => handleSwapExercise(altName)}
                  className="w-full p-3.5 rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] text-left text-xs font-bold text-[#1C1B19] hover:border-[#A6844A] active:bg-[#E4DDD2]/40 transition-colors flex items-center justify-between"
                >
                  <span>{altName}</span>
                  <Check className="w-4 h-4 text-[#A6844A]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
