'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronLeft,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { DayPlan, PlanExercise, CompletedSet, WorkoutSessionLog } from '@/types';
import { getTodayDateString } from '@/lib/storage';

interface SessionPlayerProps {
  dayPlan: DayPlan;
  onClose: () => void;
  onFinishSession: (log: WorkoutSessionLog) => void;
}

export const SessionPlayer: React.FC<SessionPlayerProps> = ({
  dayPlan,
  onClose,
  onFinishSession,
}) => {
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(1);
  const [weightKg, setWeightKg] = useState<number>(20);
  const [repsDone, setRepsDone] = useState<number>(10);
  
  // Track all sets logged for all exercises in this session
  // exerciseIndex -> CompletedSet[]
  const [exerciseLogs, setExerciseLogs] = useState<Record<number, CompletedSet[]>>({});

  // Rest Timer State
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(60);
  const [totalRestForCurrent, setTotalRestForCurrent] = useState(60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Session timer (seconds elapsed)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise: PlanExercise =
    dayPlan.exercises[currentExIndex] || dayPlan.exercises[0];

  // Tick total session timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Tick rest countdown timer
  useEffect(() => {
    if (!isResting || isTimerPaused || isFinished) return;
    if (restSecondsRemaining <= 0) {
      setIsResting(false);
      return;
    }
    const timer = setInterval(() => {
      setRestSecondsRemaining((r) => {
        if (r <= 1) {
          setIsResting(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isResting, isTimerPaused, restSecondsRemaining, isFinished]);

  // Start rest timer after a set is logged
  const triggerRest = (seconds: number) => {
    setTotalRestForCurrent(seconds);
    setRestSecondsRemaining(seconds);
    setIsResting(true);
    setIsTimerPaused(false);
  };

  const handleLogSet = () => {
    const newSet: CompletedSet = {
      setIndex: currentSetIndex,
      reps: repsDone,
      weight: weightKg,
      completedAt: new Date().toISOString(),
    };

    const currentSets = exerciseLogs[currentExIndex] || [];
    const updatedSets = [...currentSets, newSet];
    setExerciseLogs((prev) => ({
      ...prev,
      [currentExIndex]: updatedSets,
    }));

    // If more sets remaining for this exercise
    if (currentSetIndex < currentExercise.targetSets) {
      setCurrentSetIndex((s) => s + 1);
      triggerRest(currentExercise.restSec || 60);
    } else {
      // Completed all sets for this exercise
      if (currentExIndex < dayPlan.exercises.length - 1) {
        // Next exercise
        setCurrentExIndex((prev) => prev + 1);
        setCurrentSetIndex(1);
        triggerRest(currentExercise.restSec || 90);
      } else {
        // Finished all exercises!
        setIsFinished(true);
      }
    }
  };

  const handleFinalize = () => {
    // Compile workout session log
    const formattedExercises = dayPlan.exercises.map((ex, idx) => ({
      name: ex.name,
      targetSets: ex.targetSets,
      sets: exerciseLogs[idx] || [],
    }));

    const sessionLog: WorkoutSessionLog = {
      id: `wlog_${Date.now()}`,
      date: getTodayDateString(),
      dayTitle: dayPlan.workoutTitle,
      durationSec: elapsedSeconds,
      exercises: formattedExercises,
      completedAt: new Date().toISOString(),
    };

    onFinishSession(sessionLog);
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Total completed sets across all exercises
  const totalCompletedSets = Object.values(exerciseLogs).reduce(
    (acc, arr) => acc + arr.length,
    0
  );
  const totalTargetSets = dayPlan.exercises.reduce(
    (acc, ex) => acc + ex.targetSets,
    0
  );

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F3F0EA] flex flex-col justify-between p-5 max-w-[480px] mx-auto">
        <div className="pt-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#1F4D3A]/10 border border-[#1F4D3A]/20 mx-auto flex items-center justify-center text-[#1F4D3A]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">
            เสร็จสิ้นการฝึกซ้อม
          </h1>
          <p className="text-xs text-[#6F6A62]">
            {dayPlan.workoutTitle} — กล้ามเนื้อได้รับการกระตุ้นครบถ้วนตามแผน
          </p>
        </div>

        {/* Quiet Summary Card */}
        <div className="p-5 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-4 my-auto">
          <div className="flex items-center justify-between border-b border-[#E4DDD2] pb-3">
            <span className="text-xs text-[#6F6A62]">ระยะเวลาฝึกรวม</span>
            <span className="text-xl font-bold tabular-numbers text-[#1C1B19]">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#E4DDD2] pb-3">
            <span className="text-xs text-[#6F6A62]">จำนวนเซ็ตที่บันทึกสำเร็จ</span>
            <span className="text-xl font-bold tabular-numbers text-[#1F4D3A]">
              {totalCompletedSets} / {totalTargetSets} เซ็ต
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6F6A62]">ท่าฝึกที่เสร็จสิ้น</span>
            <span className="text-sm font-semibold text-[#1C1B19]">
              {dayPlan.exercises.length} ท่า
            </span>
          </div>
        </div>

        <div className="pb-6">
          <button
            onClick={handleFinalize}
            className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm hover:bg-[#1C1B19]/90 active:scale-[0.99] transition-transform duration-200"
          >
            บันทึกผลการฝึกและกลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F0EA] flex flex-col justify-between max-w-[480px] mx-auto overflow-hidden">
      {/* Top Bar */}
      <div className="px-5 py-4 bg-[#FBF9F5] border-b border-[#E4DDD2] flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#A6844A] uppercase tracking-wider block">
            {dayPlan.workoutTitle}
          </span>
          <div className="text-xs text-[#6F6A62] flex items-center space-x-2 mt-0.5">
            <span>ท่าที่ {currentExIndex + 1} จาก {dayPlan.exercises.length}</span>
            <span>•</span>
            <span className="tabular-numbers text-[#1C1B19] font-medium">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#F3F0EA] text-[#6F6A62] hover:text-[#1C1B19]"
          title="ออกจากการฝึก"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Exercise Area */}
      <div className="flex-1 px-5 py-4 overflow-y-auto space-y-4">
        {/* Exercise Card */}
        <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#A6844A]/10 text-[#A6844A]">
              {currentExercise.category}
            </span>
            <span className="text-xs font-semibold tabular-numbers text-[#1C1B19]">
              เซ็ตที่ {currentSetIndex} จาก {currentExercise.targetSets}
            </span>
          </div>

          <h2 className="text-lg font-bold text-[#1C1B19] tracking-tight mt-1">
            {currentExercise.name}
          </h2>

          <div className="flex items-center space-x-3 text-xs text-[#6F6A62] mt-1.5">
            <span>เป้าหมาย: <strong className="text-[#1C1B19]">{currentExercise.targetReps}</strong></span>
            <span>•</span>
            <span>พักระหว่างเซ็ต: <strong className="text-[#1C1B19]">{currentExercise.restSec} วิ</strong></span>
          </div>

          {/* Progress dots for sets */}
          <div className="flex items-center space-x-1.5 mt-4 pt-3 border-t border-[#E4DDD2]">
            {Array.from({ length: currentExercise.targetSets }).map((_, i) => {
              const isLogged = (exerciseLogs[currentExIndex]?.length || 0) > i;
              const isCurrent = i + 1 === currentSetIndex;
              return (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    isLogged
                      ? 'bg-[#1F4D3A]'
                      : isCurrent
                      ? 'bg-[#A6844A]'
                      : 'bg-[#E4DDD2]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Steppers: Weight & Reps */}
        <div className="space-y-3">
          {/* Weight Stepper */}
          <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6F6A62]">น้ำหนักฝึก (Weight)</span>
              <span className="text-xs text-[#6F6A62]">หน่วย: กิโลกรัม</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => Math.max(0, w - 2.5))}
                  className="w-10 h-10 rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-center text-[#1C1B19] active:bg-[#E4DDD2]"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-baseline space-x-1">
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-center text-3xl font-bold tabular-numbers text-[#1C1B19] bg-transparent border-b border-[#A6844A] focus:outline-none"
                />
                <span className="text-xs font-semibold text-[#6F6A62]">kg</span>
              </div>

              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => w + 2.5)}
                  className="w-10 h-10 rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-center text-[#1C1B19] active:bg-[#E4DDD2]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick weight adjustment chips */}
            <div className="flex items-center justify-center space-x-2 mt-3 pt-2 border-t border-[#E4DDD2]">
              {[0, 10, 20, 40, 60].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeightKg(w)}
                  className="px-2.5 py-1 rounded-[8px] bg-[#F3F0EA] text-[11px] tabular-numbers font-medium text-[#6F6A62] hover:text-[#1C1B19]"
                >
                  {w === 0 ? 'Bodyweight' : `${w}kg`}
                </button>
              ))}
            </div>
          </div>

          {/* Reps Stepper */}
          <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6F6A62]">จำนวนครั้งที่ทำได้ (Reps)</span>
              <span className="text-xs text-[#6F6A62]">เป้าหมาย: {currentExercise.targetReps}</span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRepsDone((r) => Math.max(1, r - 1))}
                className="w-10 h-10 rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-center text-[#1C1B19] active:bg-[#E4DDD2]"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline space-x-1">
                <input
                  type="number"
                  value={repsDone}
                  onChange={(e) => setRepsDone(Math.max(1, Number(e.target.value)))}
                  className="w-20 text-center text-3xl font-bold tabular-numbers text-[#1C1B19] bg-transparent border-b border-[#A6844A] focus:outline-none"
                />
                <span className="text-xs font-semibold text-[#6F6A62]">ครั้ง</span>
              </div>

              <button
                type="button"
                onClick={() => setRepsDone((r) => r + 1)}
                className="w-10 h-10 rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-center text-[#1C1B19] active:bg-[#E4DDD2]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Rest Countdown Bar (if resting) */}
        {isResting && (
          <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#A6844A] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-[#A6844A]" />
                <span className="text-xs font-semibold text-[#1C1B19]">พักระหว่างเซ็ต</span>
              </div>
              <span className="text-2xl font-bold tabular-numbers text-[#A6844A]">
                {restSecondsRemaining}s
              </span>
            </div>

            {/* Brass Tape Line Progress */}
            <div className="w-full h-1.5 bg-[#E4DDD2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A6844A] transition-all duration-300 ease-linear"
                style={{
                  width: `${(restSecondsRemaining / totalRestForCurrent) * 100}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="text-[#6F6A62] hover:text-[#1C1B19] flex items-center space-x-1"
              >
                {isTimerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isTimerPaused ? 'จับเวลาต่อ' : 'หยุดชั่วคราว'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setRestSecondsRemaining((r) => r + 30)}
                  className="px-2 py-0.5 rounded bg-[#F3F0EA] text-[#6F6A62] tabular-numbers text-[11px]"
                >
                  +30s
                </button>
                <button
                  type="button"
                  onClick={() => setIsResting(false)}
                  className="text-xs font-medium text-[#A6844A] hover:underline"
                >
                  ข้ามเวลาพัก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Log Button */}
      <div className="p-5 bg-[#FBF9F5] border-t border-[#E4DDD2] space-y-2">
        <button
          onClick={handleLogSet}
          className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200"
        >
          <Check className="w-4 h-4" />
          <span>บันทึกเซ็ตที่ {currentSetIndex} ({weightKg} kg x {repsDone} ครั้ง)</span>
        </button>

        {/* Previous / Next exercise controls */}
        <div className="flex justify-between items-center text-xs text-[#6F6A62] pt-1">
          <button
            type="button"
            disabled={currentExIndex === 0}
            onClick={() => {
              setCurrentExIndex((i) => Math.max(0, i - 1));
              setCurrentSetIndex(1);
            }}
            className="flex items-center space-x-1 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>ท่าก่อนหน้า</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFinished(true)}
            className="text-[11px] underline text-[#6F6A62] hover:text-[#1C1B19]"
          >
            เสร็จสิ้นการฝึกก่อนกำหนด
          </button>

          <button
            type="button"
            disabled={currentExIndex >= dayPlan.exercises.length - 1}
            onClick={() => {
              setCurrentExIndex((i) => Math.min(dayPlan.exercises.length - 1, i + 1));
              setCurrentSetIndex(1);
            }}
            className="flex items-center space-x-1 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>ท่าถัดไป</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
