'use client';

import React, { useState, useRef } from 'react';
import { Camera, Plus, Trash2, AlertCircle } from 'lucide-react';
import { FoodItem, UserProfile } from '@/types';
import { FoodSheet } from './FoodSheet';
import { getTodayDateString } from '@/lib/storage';

interface FoodTabProps {
  profile: UserProfile;
  foodLogs: FoodItem[];
  onSaveFood: (item: FoodItem) => void;
  onDeleteFood: (id: string) => void;
  isSheetOpen: boolean;
  onOpenSheet: () => void;
  onCloseSheet: () => void;
}

export const FoodTab: React.FC<FoodTabProps> = ({
  profile,
  foodLogs,
  onSaveFood,
  onDeleteFood,
  isSheetOpen,
  onOpenSheet,
  onCloseSheet,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const todayStr = getTodayDateString();
  const todayFoods = foodLogs.filter((f) => f.date === todayStr);

  const totalCalories = todayFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const totalProtein = todayFoods.reduce((acc, f) => acc + (f.protein || 0), 0);
  const totalCarbs = todayFoods.reduce((acc, f) => acc + (f.carbs || 0), 0);
  const totalFat = todayFoods.reduce((acc, f) => acc + (f.fat || 0), 0);

  const target = profile.calorieTarget || 2000;
  const isOver = totalCalories > target;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      onOpenSheet();
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualOpen = () => {
    setSelectedImageFile(null);
    onOpenSheet();
  };

  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">บันทึกอาหาร</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C4623A]/10 text-[#C4623A] font-semibold">
            ค่าประมาณ
          </span>
        </div>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          บันทึกด้วยภาพถ่ายหรือพิมพ์ระบุ เพื่อประเมินพลังงานและสารอาหาร
        </p>
      </div>

      {/* Daily Summary Card */}
      <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1B19]">
            สรุปพลังงานวันนี้
          </span>
          <span className="text-xs tabular-numbers text-[#6F6A62]">
            เป้าหมาย {target.toLocaleString()} kcal
          </span>
        </div>

        <div className="flex items-baseline justify-between py-1 border-b border-[#E4DDD2] pb-3">
          <div>
            <span className="text-3xl font-bold tabular-numbers text-[#C4623A]">
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-xs text-[#6F6A62] ml-1.5">kcal ที่ได้รับ</span>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-semibold tabular-numbers ${
                isOver ? 'text-[#9C3B2E]' : 'text-[#2E6B4F]'
              }`}
            >
              {isOver
                ? `เกิน ${Math.abs(target - totalCalories).toLocaleString()} kcal`
                : `คงเหลือ ${(target - totalCalories).toLocaleString()} kcal`}
            </span>
          </div>
        </div>

        {/* Macros summary */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3">
          <div>
            <span className="text-[10px] text-[#6F6A62] block">โปรตีนรวม</span>
            <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
              {totalProtein}g
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#6F6A62] block">คาร์โบไฮเดรต</span>
            <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
              {totalCarbs}g
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#6F6A62] block">ไขมันรวม</span>
            <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
              {totalFat}g
            </span>
          </div>
        </div>
      </div>

      {/* Two Action Buttons: Camera / Upload & Manual */}
      <div className="grid grid-cols-2 gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-xs flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200"
        >
          <Camera className="w-4 h-4 text-[#C4623A]" />
          <span>ถ่ายภาพอาหาร</span>
        </button>

        <button
          onClick={handleManualOpen}
          className="h-[52px] rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] font-medium text-xs flex items-center justify-center space-x-2 active:bg-[#E4DDD2]/40 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 text-[#A6844A]" />
          <span>พิมพ์ระบุเอง</span>
        </button>
      </div>

      {/* Today's Meals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1C1B19]">รายการอาหารวันนี้ ({todayFoods.length})</span>
          <span className="text-[11px] text-[#6F6A62]">แสดงแคลอรี่เป็น ค่าประมาณ</span>
        </div>

        {todayFoods.length === 0 ? (
          <div className="p-8 text-center rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] space-y-1.5">
            <p className="text-xs text-[#1C1B19] font-medium">ยังไม่มีรายการอาหารสำหรับวันนี้</p>
            <p className="text-[11px] text-[#6F6A62]">
              ถ่ายภาพจานอาหารเพื่อประมาณการพลังงาน หรือกดพิมพ์ระบุเอง
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayFoods.map((food) => (
              <div
                key={food.id}
                className="p-3.5 bg-[#FBF9F5] border border-[#E4DDD2] rounded-[14px] flex items-center justify-between shadow-sm"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F3F0EA] text-[#6F6A62]">
                      {food.mealType}
                    </span>
                    <span className="text-xs font-bold text-[#1C1B19] truncate">{food.name}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-[#6F6A62] mt-1.5">
                    <span className="tabular-numbers">จาน x{food.portion}</span>
                    <span>•</span>
                    <span className="tabular-numbers">P: {food.protein}g</span>
                    <span className="tabular-numbers">C: {food.carbs}g</span>
                    <span className="tabular-numbers">F: {food.fat}g</span>
                  </div>

                  {food.isUnsure && (
                    <div className="text-[10px] text-[#9C3B2E] flex items-center space-x-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>ควรตรวจชื่อ</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-base font-bold tabular-numbers text-[#C4623A]">
                      {food.calories}
                    </span>
                    <span className="text-[10px] text-[#6F6A62] block">kcal</span>
                  </div>

                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="p-1.5 rounded-lg text-[#6F6A62] hover:text-[#9C3B2E]"
                    title="ลบรายการ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Food Sheet Modal */}
      <FoodSheet
        isOpen={isSheetOpen}
        onClose={onCloseSheet}
        onSaveFood={onSaveFood}
        initialImageFile={selectedImageFile}
      />
    </div>
  );
};
