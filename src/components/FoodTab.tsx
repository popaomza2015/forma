'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  AlertCircle,
  Sun,
  Sunrise,
  Sunset,
  Coffee,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { FoodItem, UserProfile, MealCategoryKey, QuickMealPreset } from '@/types';
import { FoodSheet } from './FoodSheet';
import { getTodayDateString } from '@/lib/storage';
import { QUICK_MEAL_PRESETS } from '@/lib/constants';

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
  const [activeCategory, setActiveCategory] = useState<MealCategoryKey>('กลางวัน');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<QuickMealPreset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getTodayDateString();
  const todayFoods = foodLogs.filter((f) => f.date === todayStr);

  const totalCalories = todayFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const totalProtein = todayFoods.reduce((acc, f) => acc + (f.protein || 0), 0);
  const totalCarbs = todayFoods.reduce((acc, f) => acc + (f.carbs || 0), 0);
  const totalFat = todayFoods.reduce((acc, f) => acc + (f.fat || 0), 0);

  const target = profile.calorieTarget || 2000;
  const isOver = totalCalories > target;

  // Category configurations with budget allocations
  const mealCategories: {
    key: MealCategoryKey;
    label: string;
    sublabel: string;
    ratio: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'เช้า',
      label: 'มื้อเช้า',
      sublabel: 'พลังงานเริ่มต้นวัน',
      ratio: 0.25,
      icon: <Sunrise className="w-4 h-4 text-[#A6844A]" />,
    },
    {
      key: 'กลางวัน',
      label: 'มื้อกลางวัน',
      sublabel: 'มื้อหลักฟื้นฟูกล้ามเนื้อ',
      ratio: 0.35,
      icon: <Sun className="w-4 h-4 text-[#C4623A]" />,
    },
    {
      key: 'เย็น',
      label: 'มื้อเย็น',
      sublabel: 'โปรตีนเน้นๆ แป้งปานกลาง',
      ratio: 0.30,
      icon: <Sunset className="w-4 h-4 text-[#1F4D3A]" />,
    },
    {
      key: 'ของว่าง',
      label: 'ของว่าง & เครื่องดื่ม',
      sublabel: 'ก่อน/หลังซ้อม หรือระหว่างวัน',
      ratio: 0.10,
      icon: <Coffee className="w-4 h-4 text-[#6F6A62]" />,
    },
  ];

  // Trigger camera for a specific category
  const handleSnapForCategory = (cat: MealCategoryKey) => {
    setActiveCategory(cat);
    setSelectedPreset(null);
    setSelectedImageFile(null);
    fileInputRef.current?.click();
  };

  const handleManualForCategory = (cat: MealCategoryKey) => {
    setActiveCategory(cat);
    setSelectedImageFile(null);
    setSelectedPreset(null);
    onOpenSheet();
  };

  const handlePresetSelect = (cat: MealCategoryKey, preset: QuickMealPreset) => {
    setActiveCategory(cat);
    setSelectedImageFile(null);
    setSelectedPreset(preset);
    onOpenSheet();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      onOpenSheet();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      {/* Hidden file input for camera/photo picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Screen Title */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">จานอาหาร & แคลอรี่</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C4623A]/10 text-[#C4623A] font-semibold">
            ค่าประมาณ
          </span>
        </div>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          ถ่ายรูปเช็คแคลอรี่แยกตามมื้อ หรือเลือกเมนูยอดนิยมเพื่อประมาณการอัตโนมัติ
        </p>
      </div>

      {/* Daily Calorie Summary Card */}
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

        {/* 8px linear progress track */}
        <div className="w-full h-2 bg-[#E4DDD2] rounded-full overflow-hidden mt-3 mb-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOver ? 'bg-[#9C3B2E]' : 'bg-[#C4623A]'
            }`}
            style={{ width: `${Math.min(100, (totalCalories / target) * 100)}%` }}
          />
        </div>

        {/* Macros summary */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2">
          <div className="p-2 rounded-[10px] bg-[#F3F0EA]">
            <span className="text-[10px] text-[#6F6A62] block">โปรตีนรวม</span>
            <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
              {totalProtein}g
            </span>
          </div>
          <div className="p-2 rounded-[10px] bg-[#F3F0EA]">
            <span className="text-[10px] text-[#6F6A62] block">คาร์โบไฮเดรต</span>
            <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
              {totalCarbs}g
            </span>
          </div>
          <div className="p-2 rounded-[10px] bg-[#F3F0EA]">
            <span className="text-[10px] text-[#6F6A62] block">ไขมันรวม</span>
            <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
              {totalFat}g
            </span>
          </div>
        </div>
      </div>

      {/* 4 MEAL CATEGORIES SECTION ("ให้มีหมวดหมู่ที่สามารถถ่ายรูปเช็คแคลได้") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1C1B19]">หมวดหมู่อาหารประจำวัน (ถ่ายรูปแยกตามมื้อ)</span>
          <span className="text-[11px] text-[#6F6A62]">แตะเพื่อสแกนหรือบันทึก</span>
        </div>

        {mealCategories.map((cat) => {
          const catBudget = Math.round(target * cat.ratio);
          const catItems = todayFoods.filter((f) => f.mealType === cat.key);
          const catConsumed = catItems.reduce((acc, f) => acc + (f.calories || 0), 0);
          const catPresets = QUICK_MEAL_PRESETS[cat.key] || [];

          return (
            <div
              key={cat.key}
              className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-3"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2]">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1B19]">{cat.label}</h3>
                    <p className="text-[11px] text-[#6F6A62]">{cat.sublabel}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold tabular-numbers text-[#C4623A]">
                    {catConsumed}
                  </span>
                  <span className="text-xs text-[#6F6A62] tabular-numbers font-medium">
                    {' '}/ {catBudget} kcal
                  </span>
                </div>
              </div>

              {/* Action Buttons for this Category */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSnapForCategory(cat.key)}
                  className="h-[46px] rounded-[10px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-xs flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-[#A6844A]" />
                  <span>ถ่ายรูปเช็คแคล</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleManualForCategory(cat.key)}
                  className="h-[46px] rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2] text-[#1C1B19] font-medium text-xs flex items-center justify-center space-x-1.5 active:bg-[#E4DDD2]/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6F6A62]" />
                  <span>พิมพ์ระบุเอง</span>
                </button>
              </div>

              {/* Quick Preset Chips */}
              <div className="pt-1">
                <span className="text-[10px] text-[#6F6A62] block mb-1.5 font-medium">
                  เมนูตัวอย่างยอดนิยมสำหรับ{cat.label} (แตะเพื่อใช้ทันที):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {catPresets.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handlePresetSelect(cat.key, preset)}
                      className="px-2.5 py-1.5 rounded-[8px] bg-[#F3F0EA] border border-[#E4DDD2] text-[11px] text-[#1C1B19] hover:border-[#A6844A] active:bg-[#E4DDD2] transition-colors flex items-center space-x-1.5"
                    >
                      <span>+ {preset.name.split(' ')[0]}</span>
                      <span className="tabular-numbers text-[#C4623A] font-medium text-[10px]">
                        {preset.calories} kcal
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logged Items for this Category */}
              {catItems.length > 0 && (
                <div className="border-t border-[#E4DDD2] pt-2 space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#6F6A62] uppercase tracking-wider block">
                    รายการที่บันทึกแล้วในมื้อนี้ ({catItems.length})
                  </span>
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-[10px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2 truncate">
                        <div className="font-semibold text-[#1C1B19] truncate">{item.name}</div>
                        <div className="text-[10px] text-[#6F6A62] tabular-numbers mt-0.5">
                          จาน x{item.portion} • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-bold tabular-numbers text-[#C4623A] text-sm">
                          {item.calories} <span className="text-[10px] text-[#6F6A62]">kcal</span>
                        </span>
                        <button
                          onClick={() => onDeleteFood(item.id)}
                          className="p-1 text-[#6F6A62] hover:text-[#9C3B2E]"
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
          );
        })}
      </div>

      {/* Food Sheet Modal */}
      <FoodSheet
        isOpen={isSheetOpen}
        onClose={onCloseSheet}
        onSaveFood={onSaveFood}
        initialImageFile={selectedImageFile}
        defaultMealType={activeCategory}
        initialPreset={selectedPreset}
      />
    </div>
  );
};
