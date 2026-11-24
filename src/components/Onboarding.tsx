'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { UserProfile, GoalType, SexType, ActivityLevel, TrainingDays } from '@/types';
import { calculateCalorieTarget, generateWeeklyPlan } from '@/lib/constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Goal
  const [goal, setGoal] = useState<GoalType>('lose');

  // Step 2: Body
  const [sex, setSex] = useState<SexType>('male');
  const [age, setAge] = useState<number>(28);
  const [height, setHeight] = useState<number>(172);
  const [weight, setWeight] = useState<number>(68);

  // Step 3: Training Days & Activity
  const [days, setDays] = useState<TrainingDays>(3);
  const [activity, setActivity] = useState<ActivityLevel>(1.375);

  const calculatedCalories = calculateCalorieTarget(sex, weight, height, age, activity, goal);

  const handleFinish = () => {
    const newProfile: UserProfile = {
      isOnboarded: true,
      goal,
      sex,
      age,
      height,
      weight,
      days,
      activity,
      calorieTarget: calculatedCalories,
      updatedAt: new Date().toISOString(),
    };
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#F3F0EA] flex flex-col justify-between px-5 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-xl tracking-wider text-[#1C1B19]">FORMA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A6844A]"></span>
          </div>
          <div className="text-xs tabular-numbers font-medium text-[#6F6A62]">
            ขั้นตอน {step} จาก 3
          </div>
        </div>

        {/* Brass tape progress indicator */}
        <div className="w-full h-1 bg-[#E4DDD2] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[#A6844A] transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">เป้าหมายหลักของคุณ</h1>
              <p className="text-xs text-[#6F6A62] mt-1">
                FORMA จะจัดสมดุลพลังงานและจำนวนเซ็ตการฝึกให้เหมาะกับทิศทางที่คุณต้องการ
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  id: 'lose',
                  title: 'ลดไขมัน (Lose Fat)',
                  detail: '3 เซ็ต x 10–12 ครั้ง, พัก 60 วิ',
                  calInfo: 'ปรับสมดุลพลังงาน -400 kcal จากค่าใช้จ่ายปกติ',
                },
                {
                  id: 'build',
                  title: 'เพิ่มกล้ามเนื้อ (Build Muscle)',
                  detail: '4 เซ็ต x 6–10 ครั้ง, พัก 120 วิ',
                  calInfo: 'เสริมพลังงาน +250 kcal เพื่อการสร้างใยกล้ามเนื้อ',
                },
                {
                  id: 'maintain',
                  title: 'รักษาสมดุลร่างกาย (Maintain)',
                  detail: '3 เซ็ต x 8–12 ครั้ง, พัก 90 วิ',
                  calInfo: 'รักษาสภาพความแข็งแรงและระบบเผาผลาญให้เสถียร',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id as GoalType)}
                  className={`w-full p-4 rounded-[16px] text-left border transition-all duration-200 ${
                    goal === item.id
                      ? 'bg-[#FBF9F5] border-[#A6844A] shadow-sm'
                      : 'bg-[#FBF9F5]/70 border-[#E4DDD2] text-[#6F6A62]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#1C1B19]">{item.title}</span>
                    {goal === item.id && <Check className="w-4 h-4 text-[#A6844A]" />}
                  </div>
                  <p className="text-xs text-[#1C1B19]/80 mt-1">{item.detail}</p>
                  <p className="text-[11px] text-[#6F6A62] mt-0.5">{item.calInfo}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">ข้อมูลสรีระพื้นฐาน</h1>
              <p className="text-xs text-[#6F6A62] mt-1">
                ใช้คำนวณอัตราเผาผลาญพื้นฐานตามสมการ Mifflin-St Jeor อย่างแม่นยำ
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Sex */}
              <div>
                <label className="text-xs font-medium text-[#6F6A62] block mb-1">เพศทางสรีรวิทยา</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#FBF9F5] border border-[#E4DDD2] rounded-[12px]">
                  <button
                    type="button"
                    onClick={() => setSex('male')}
                    className={`h-[42px] rounded-[10px] text-sm font-medium transition-all ${
                      sex === 'male' ? 'bg-[#F3F0EA] text-[#1C1B19] font-semibold' : 'text-[#6F6A62]'
                    }`}
                  >
                    ชาย
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex('female')}
                    className={`h-[42px] rounded-[10px] text-sm font-medium transition-all ${
                      sex === 'female' ? 'bg-[#F3F0EA] text-[#1C1B19] font-semibold' : 'text-[#6F6A62]'
                    }`}
                  >
                    หญิง
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="text-xs font-medium text-[#6F6A62] block mb-1">อายุ (ปี)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={15}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-[52px] px-4 rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-lg font-medium tabular-numbers text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6F6A62]">ปี</span>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="text-xs font-medium text-[#6F6A62] block mb-1">ส่วนสูง (เซนติเมตร)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min={100}
                    max={250}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full h-[52px] px-4 rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-lg font-medium tabular-numbers text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6F6A62]">cm</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs font-medium text-[#6F6A62] block mb-1">น้ำหนักตัว (กิโลกรัม)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={250}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-[52px] px-4 rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-lg font-medium tabular-numbers text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6F6A62]">kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">วันฝึกซ้อมต่อสัปดาห์</h1>
              <p className="text-xs text-[#6F6A62] mt-1">
                สร้างโปรแกรมการฝึกทั้ง 7 วันตามกฎโครงสร้าง พร้อมตัวอย่างแผน
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  days: 3,
                  title: '3 วัน / สัปดาห์',
                  preview: 'Full Body A / B / C (สลับวันพักเพื่อฟื้นฟูเต็มที่)',
                },
                {
                  days: 4,
                  title: '4 วัน / สัปดาห์',
                  preview: 'Upper / Lower (บน A, ล่าง A, บน B, ล่าง B)',
                },
                {
                  days: 5,
                  title: '5 วัน / สัปดาห์',
                  preview: 'Push / Pull / Legs แล้วเสริม Upper / Lower',
                },
              ].map((d) => (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => setDays(d.days as TrainingDays)}
                  className={`w-full p-4 rounded-[16px] text-left border transition-all duration-200 ${
                    days === d.days
                      ? 'bg-[#FBF9F5] border-[#A6844A] shadow-sm'
                      : 'bg-[#FBF9F5]/70 border-[#E4DDD2] text-[#6F6A62]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#1C1B19] tabular-numbers">{d.title}</span>
                    {days === d.days && <Check className="w-4 h-4 text-[#A6844A]" />}
                  </div>
                  <p className="text-xs text-[#1C1B19]/80 mt-1.5 font-medium">{d.preview}</p>
                </button>
              ))}
            </div>

            {/* Target preview summary */}
            <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#6F6A62]">เป้าหมายพลังงานประจำวัน</div>
                  <div className="text-xs text-[#1C1B19] font-medium mt-0.5">
                    Mifflin-St Jeor ({goal === 'lose' ? '-400 kcal' : goal === 'build' ? '+250 kcal' : 'สมดุล'})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold tabular-numbers text-[#C4623A]">{calculatedCalories}</span>
                  <span className="text-[10px] text-[#6F6A62] block">kcal / วัน</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="pt-4 pb-2">
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => (s + 1) as 2 | 3)}
            className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200"
          >
            <span>ดำเนินการต่อ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleFinish}
              className="w-full h-[52px] rounded-[12px] bg-[#1F4D3A] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200"
            >
              <span>เริ่มต้นสัปดาห์ (สร้างแผนการฝึก)</span>
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2 text-xs text-[#6F6A62] text-center"
            >
              ย้อนกลับไปแก้ไขข้อมูล
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
