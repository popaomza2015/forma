'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Check, Dumbbell, Clock, RotateCcw } from 'lucide-react';
import { DayPlan, PlanExercise, UserProfile } from '@/types';

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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [swappingExercise, setSwappingExercise] = useState<{
    dayIndex: number;
    exerciseIndex: number;
    currentEx: PlanExercise;
  } | null>(null);

  const activeDay = plan[selectedDayIndex] || plan[0];

  const handleSwapExercise = (newExerciseName: string) => {
    if (!swappingExercise) return;
    const { dayIndex, exerciseIndex, currentEx } = swappingExercise;

    const newPlan = [...plan];
    const targetDay = { ...newPlan[dayIndex] };
    const newExercises = [...targetDay.exercises];

    // Maintain current alternatives and swap name
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
      {/* Title */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">แผนฝึกซ้อม 7 วัน</h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#A6844A]/10 text-[#A6844A]">
            {profile.days} วัน / สัปดาห์
          </span>
        </div>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          เป้าหมาย:{' '}
          {profile.goal === 'lose'
            ? 'ลดไขมัน (3 เซ็ต x 10–12 ครั้ง, พัก 60 วิ)'
            : profile.goal === 'build'
            ? 'เพิ่มกล้ามเนื้อ (4 เซ็ต x 6–10 ครั้ง, พัก 120 วิ)'
            : 'รักษาสมดุล (3 เซ็ต x 8–12 ครั้ง, พัก 90 วิ)'}
        </p>
      </div>

      {/* Mon-Sun Strip */}
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

      {/* Selected Day Card */}
      <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-[#A6844A] tracking-wider uppercase">
            {activeDay.dayNameThai}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              activeDay.isRest
                ? 'bg-[#E4DDD2] text-[#6F6A62]'
                : 'bg-[#1F4D3A]/10 text-[#1F4D3A]'
            }`}
          >
            {activeDay.isRest ? 'วันพัก' : 'วันฝึก'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-[#1C1B19] tracking-tight">{activeDay.workoutTitle}</h2>
        <p className="text-xs text-[#6F6A62] mt-0.5 mb-4">{activeDay.description}</p>

        {activeDay.isRest ? (
          <div className="p-4 rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] text-xs text-[#6F6A62] space-y-2">
            <p className="font-medium text-[#1C1B19]">คำแนะนำสำหรับวันพักฟื้น:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>ดื่มน้ำสะอาดให้เพียงพอตลอดทั้งวัน</li>
              <li>ยืดเหยียดเบาๆ หรือเดินผ่อนคลาย 20–30 นาที</li>
              <li>รับประทานโปรตีนให้ครบตามเป้าหมายเพื่อซ่อมแซมกล้ามเนื้อ</li>
              <li>เข้านอนตรงเวลาเพื่อฮอร์โมนการฟื้นฟูที่สมบูรณ์</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-medium text-[#6F6A62] flex items-center justify-between">
              <span>รายการท่าฝึก ({activeDay.exercises.length} ท่า)</span>
              <span className="text-[11px] text-[#A6844A]">แตะที่ปุ่มสลับเพื่อเปลี่ยนท่า</span>
            </div>

            <div className="space-y-2">
              {activeDay.exercises.map((ex, exIdx) => (
                <div
                  key={ex.id || exIdx}
                  className="p-3 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[12px] flex items-center justify-between"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold tabular-numbers text-[#6F6A62]">
                        {exIdx + 1}.
                      </span>
                      <span className="text-xs font-semibold text-[#1C1B19]">
                        {ex.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-[#6F6A62] mt-1 ml-4">
                      <span className="tabular-numbers">
                        {ex.targetSets} เซ็ต x {ex.targetReps}
                      </span>
                      <span className="flex items-center space-x-1 tabular-numbers">
                        <Clock className="w-3 h-3 text-[#A6844A]" />
                        <span>พัก {ex.restSec} วินาที</span>
                      </span>
                    </div>
                  </div>

                  {ex.alternatives && ex.alternatives.length > 0 && (
                    <button
                      onClick={() =>
                        setSwappingExercise({
                          dayIndex: selectedDayIndex,
                          exerciseIndex: exIdx,
                          currentEx: ex,
                        })
                      }
                      title="เปลี่ยนท่าฝึก"
                      className="p-2 rounded-[8px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#6F6A62] hover:text-[#1C1B19] active:bg-[#E4DDD2]/40"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#A6844A]" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Start session for this day */}
            <div className="pt-2">
              <button
                onClick={() => onStartSession(activeDay)}
                className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200"
              >
                <Dumbbell className="w-4 h-4" />
                <span>เริ่มฝึกซ้อมวันนี้ ({activeDay.workoutTitle})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Swap Exercise Modal Sheet */}
      {swappingExercise && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 forma-transition">
          <div className="w-full max-w-[480px] bg-[#FBF9F5] rounded-t-[20px] border-t border-x border-[#E4DDD2] px-5 py-5 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD2]">
              <div>
                <h3 className="text-base font-bold text-[#1C1B19]">เปลี่ยนท่าฝึกทดแทน</h3>
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
              <div className="text-xs font-medium text-[#6F6A62] mb-1">
                เลือกท่าฝึกที่ทำงานกับกล้ามเนื้อกลุ่มเดียวกัน:
              </div>
              {swappingExercise.currentEx.alternatives.map((altName, i) => (
                <button
                  key={i}
                  onClick={() => handleSwapExercise(altName)}
                  className="w-full p-3.5 rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] text-left text-xs font-semibold text-[#1C1B19] hover:border-[#A6844A] active:bg-[#E4DDD2]/40 transition-colors flex items-center justify-between"
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
