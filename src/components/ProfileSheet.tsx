'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { UserProfile, GoalType, SexType, ActivityLevel, TrainingDays } from '@/types';
import { calculateCalorieTarget, generateWeeklyPlan } from '@/lib/constants';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile, shouldRegeneratePlan: boolean) => void;
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [goal, setGoal] = useState<GoalType>(profile.goal);
  const [sex, setSex] = useState<SexType>(profile.sex);
  const [age, setAge] = useState<number>(profile.age);
  const [height, setHeight] = useState<number>(profile.height);
  const [weight, setWeight] = useState<number>(profile.weight);
  const [days, setDays] = useState<TrainingDays>(profile.days);
  const [activity, setActivity] = useState<ActivityLevel>(profile.activity);

  useEffect(() => {
    if (isOpen) {
      setGoal(profile.goal);
      setSex(profile.sex);
      setAge(profile.age);
      setHeight(profile.height);
      setWeight(profile.weight);
      setDays(profile.days);
      setActivity(profile.activity);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Live calorie calculation based on Mifflin-St Jeor
  const currentTarget = calculateCalorieTarget(sex, weight, height, age, activity, goal);

  const handleSave = () => {
    const isPlanStructureChanged = days !== profile.days || goal !== profile.goal;
    const updated: UserProfile = {
      ...profile,
      goal,
      sex,
      age: Math.max(12, Number(age) || 25),
      height: Math.max(100, Number(height) || 170),
      weight: Math.max(30, Number(weight) || 65),
      days,
      activity,
      calorieTarget: currentTarget,
      updatedAt: new Date().toISOString(),
    };
    onSaveProfile(updated, isPlanStructureChanged);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 forma-transition">
      <div
        className="w-full max-w-[480px] bg-[#FBF9F5] rounded-t-[20px] border-t border-x border-[#E4DDD2] max-h-[90vh] overflow-y-auto px-5 py-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD2]">
          <div>
            <h2 className="text-base font-semibold text-[#1C1B19]">ตั้งค่าสรีระและเป้าหมาย</h2>
            <p className="text-xs text-[#6F6A62]">คำนวณเป้าหมายแคลอรี่และปรับแผนตามสรีระจริง</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F0EA] flex items-center justify-center text-[#6F6A62] hover:text-[#1C1B19]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          {/* Goal Selector */}
          <div>
            <label className="text-xs font-medium text-[#6F6A62] uppercase tracking-wider block mb-1.5">
              เป้าหมายหลัก
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lose', label: 'ลดไขมัน', desc: '-400 kcal' },
                { id: 'build', label: 'เพิ่มกล้าม', desc: '+250 kcal' },
                { id: 'maintain', label: 'รักษาสมดุล', desc: '0 kcal' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id as GoalType)}
                  className={`p-3 rounded-[12px] border text-left transition-colors duration-200 ${
                    goal === g.id
                      ? 'border-[#A6844A] bg-[#F3F0EA] text-[#1C1B19]'
                      : 'border-[#E4DDD2] bg-[#FBF9F5] text-[#6F6A62]'
                  }`}
                >
                  <div className="text-xs font-semibold">{g.label}</div>
                  <div className="text-[10px] tabular-numbers opacity-80 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Training Days */}
          <div>
            <label className="text-xs font-medium text-[#6F6A62] uppercase tracking-wider block mb-1.5">
              จำนวนวันฝึกต่อสัปดาห์
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 3, label: '3 วัน', preview: 'Full Body' },
                { days: 4, label: '4 วัน', preview: 'Upper / Lower' },
                { days: 5, label: '5 วัน', preview: 'PPL + UL' },
              ].map((d) => (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => setDays(d.days as TrainingDays)}
                  className={`p-3 rounded-[12px] border text-left transition-colors duration-200 ${
                    days === d.days
                      ? 'border-[#A6844A] bg-[#F3F0EA] text-[#1C1B19]'
                      : 'border-[#E4DDD2] bg-[#FBF9F5] text-[#6F6A62]'
                  }`}
                >
                  <div className="text-xs font-semibold tabular-numbers">{d.label}</div>
                  <div className="text-[10px] text-[#6F6A62] mt-0.5">{d.preview}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sex, Age, Height, Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6F6A62] block mb-1">เพศกำเนิด</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F3F0EA] rounded-[10px] border border-[#E4DDD2]">
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`py-1.5 text-xs rounded-[8px] font-medium transition-colors ${
                    sex === 'male' ? 'bg-[#FBF9F5] text-[#1C1B19] shadow-sm' : 'text-[#6F6A62]'
                  }`}
                >
                  ชาย
                </button>
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`py-1.5 text-xs rounded-[8px] font-medium transition-colors ${
                    sex === 'female' ? 'bg-[#FBF9F5] text-[#1C1B19] shadow-sm' : 'text-[#6F6A62]'
                  }`}
                >
                  หญิง
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#6F6A62] block mb-1">อายุ (ปี)</label>
              <input
                type="number"
                min={15}
                max={99}
                value={age || ''}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full h-[40px] px-3 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[10px] text-sm tabular-numbers text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6F6A62] block mb-1">ส่วนสูง (cm)</label>
              <input
                type="number"
                step="0.5"
                min={100}
                max={250}
                value={height || ''}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-[40px] px-3 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[10px] text-sm tabular-numbers text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6F6A62] block mb-1">น้ำหนัก (kg)</label>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                value={weight || ''}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-[40px] px-3 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[10px] text-sm tabular-numbers text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
              />
            </div>
          </div>

          {/* Activity Factor */}
          <div>
            <label className="text-xs font-medium text-[#6F6A62] uppercase tracking-wider block mb-1.5">
              ระดับกิจกรรมในชีวิตประจำวัน
            </label>
            <div className="space-y-1.5">
              {[
                { factor: 1.2, label: 'นั่งทำงานเป็นส่วนใหญ่ (x1.2)' },
                { factor: 1.375, label: 'ออกกำลังกายเบา 1–3 วัน/สัปดาห์ (x1.375)' },
                { factor: 1.55, label: 'ออกกำลังกายปานกลาง 3–5 วัน/สัปดาห์ (x1.55)' },
              ].map((act) => (
                <button
                  key={act.factor}
                  type="button"
                  onClick={() => setActivity(act.factor as ActivityLevel)}
                  className={`w-full p-2.5 rounded-[10px] border text-left text-xs flex items-center justify-between transition-colors ${
                    activity === act.factor
                      ? 'border-[#A6844A] bg-[#F3F0EA] text-[#1C1B19] font-medium'
                      : 'border-[#E4DDD2] bg-[#FBF9F5] text-[#6F6A62]'
                  }`}
                >
                  <span>{act.label}</span>
                  {activity === act.factor && <Check className="w-3.5 h-3.5 text-[#A6844A]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Live Calorie Preview Card */}
          <div className="p-3.5 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[12px] flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#6F6A62]">เป้าหมายแคลอรี่ใหม่ (Mifflin-St Jeor)</div>
              <div className="text-xs text-[#1C1B19] mt-0.5">
                {goal === 'lose' ? 'หักลบ 400 kcal เพื่อดึงพลังงานสะสม' : goal === 'build' ? 'เพิ่ม 250 kcal เพื่อสร้างกล้ามเนื้อ' : 'สมดุลรักษาระดับพลังงาน'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tabular-numbers text-[#C4623A]">{currentTarget}</span>
              <span className="text-[10px] text-[#6F6A62] block">kcal / วัน</span>
            </div>
          </div>
        </div>

        <div className="pt-2 pb-6 border-t border-[#E4DDD2]">
          <button
            onClick={handleSave}
            className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm hover:bg-[#1C1B19]/90 active:scale-[0.99] transition-transform duration-200"
          >
            บันทึกการปรับปรุง
          </button>
          <p className="text-[10px] text-center text-[#6F6A62] mt-2">
            บันทึกประวัติการออกกำลังกายและมื้ออาหารเดิมจะยังคงอยู่ครบถ้วน
          </p>
        </div>
      </div>
    </div>
  );
};
