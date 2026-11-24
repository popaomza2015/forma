'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Camera, AlertCircle, Sparkles } from 'lucide-react';
import { FoodItem, MealCategoryKey, QuickMealPreset } from '@/types';
import { analyzeFood } from '@/lib/constants';
import { getTodayDateString } from '@/lib/storage';

interface FoodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFood: (item: FoodItem) => void;
  initialImageFile?: File | null;
  defaultMealType?: MealCategoryKey;
  initialPreset?: QuickMealPreset | null;
}

export const FoodSheet: React.FC<FoodSheetProps> = ({
  isOpen,
  onClose,
  onSaveFood,
  initialImageFile,
  defaultMealType = 'กลางวัน',
  initialPreset = null,
}) => {
  const [dishName, setDishName] = useState('');
  const [mealType, setMealType] = useState<MealCategoryKey>(defaultMealType);
  const [baseCalories, setBaseCalories] = useState(380);
  const [baseProtein, setBaseProtein] = useState(28);
  const [baseCarbs, setBaseCarbs] = useState(45);
  const [baseFat, setBaseFat] = useState(8);
  const [portion, setPortion] = useState<0.5 | 1.0 | 1.5>(1.0);
  const [isUnsure, setIsUnsure] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMealType(defaultMealType);

      if (initialImageFile) {
        const previewUrl = URL.createObjectURL(initialImageFile);
        setImagePreview(previewUrl);
        setIsAnalyzing(true);
        analyzeFood(initialImageFile)
          .then((result) => {
            setDishName(result.name);
            setBaseCalories(result.calories);
            setBaseProtein(result.protein);
            setBaseCarbs(result.carbs);
            setBaseFat(result.fat);
            // keep the clicked meal category or analyze result
            setMealType(defaultMealType || result.mealType);
            setIsUnsure(result.isUnsure);
          })
          .finally(() => setIsAnalyzing(false));
      } else if (initialPreset) {
        setDishName(initialPreset.name);
        setBaseCalories(initialPreset.calories);
        setBaseProtein(initialPreset.protein);
        setBaseCarbs(initialPreset.carbs);
        setBaseFat(initialPreset.fat);
        setMealType(initialPreset.mealType || defaultMealType);
        setPortion(1.0);
        setIsUnsure(false);
        setImagePreview(null);
        setIsAnalyzing(false);
      } else {
        // Manual entry default
        setDishName('');
        setBaseCalories(380);
        setBaseProtein(25);
        setBaseCarbs(45);
        setBaseFat(8);
        setPortion(1.0);
        setIsUnsure(false);
        setImagePreview(null);
        setIsAnalyzing(false);
      }
    }
  }, [isOpen, initialImageFile, defaultMealType, initialPreset]);

  if (!isOpen) return null;

  // Portion scaled numbers
  const currentKcal = Math.round(baseCalories * portion);
  const currentProtein = Math.round(baseProtein * portion);
  const currentCarbs = Math.round(baseCarbs * portion);
  const currentFat = Math.round(baseFat * portion);

  const handleSave = () => {
    const newItem: FoodItem = {
      id: `food_${Date.now()}`,
      name: dishName.trim() || `มื้อ${mealType}`,
      mealType,
      baseCalories,
      baseProtein,
      baseCarbs,
      baseFat,
      portion,
      calories: currentKcal,
      protein: currentProtein,
      carbs: currentCarbs,
      fat: currentFat,
      isUnsure,
      imageUrl: imagePreview || undefined,
      date: getTodayDateString(),
      timestamp: new Date().toISOString(),
    };
    onSaveFood(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 forma-transition">
      <div
        className="w-full max-w-[480px] bg-[#FBF9F5] rounded-t-[24px] border-t border-x border-[#E4DDD2] max-h-[92vh] overflow-y-auto px-5 py-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with pill handle */}
        <div className="w-12 h-1 bg-[#E4DDD2] rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD2]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#C4623A]/10 text-[#C4623A]">
              ค่าประมาณ
            </span>
            <span className="text-xs font-medium text-[#1C1B19]">
              {initialImageFile ? 'ผลวิเคราะห์จากภาพถ่าย' : 'บันทึกมื้ออาหาร'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F0EA] flex items-center justify-center text-[#6F6A62] hover:text-[#1C1B19] active:bg-[#E4DDD2]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAnalyzing ? (
          <div className="py-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#A6844A] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-medium text-[#1C1B19]">กำลังสแกนรูปภาพและคำนวณแคลอรี่...</p>
            <p className="text-xs text-[#6F6A62]">ตรวจประเมินชนิดอาหาร สัดส่วน และสารอาหารหลัก</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Image Thumbnail if available */}
            {imagePreview && (
              <div className="relative w-full h-40 rounded-[16px] overflow-hidden border border-[#E4DDD2] bg-[#F3F0EA]">
                <img
                  src={imagePreview}
                  alt="ภาพอาหาร"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#1C1B19]/70 backdrop-blur-sm text-white text-[10px] flex items-center space-x-1">
                  <Camera className="w-3 h-3 text-[#A6844A]" />
                  <span>ภาพถ่ายตรวจแคลอรี่</span>
                </div>
              </div>
            )}

            {/* Dish Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#6F6A62]">ชื่ออาหาร / เมนูที่รับประทาน</label>
                {isUnsure && (
                  <span className="text-[11px] font-semibold text-[#9C3B2E] flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>ควรตรวจชื่อ</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="เช่น ข้าวกะเพราอกไก่, สลัดปลาแซลมอน..."
                className="w-full h-[50px] px-4 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[12px] text-sm font-semibold text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
              />
            </div>

            {/* Meal Type Selector */}
            <div>
              <label className="text-xs font-semibold text-[#6F6A62] block mb-1.5">หมวดหมู่มื้ออาหาร</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['เช้า', 'กลางวัน', 'เย็น', 'ของว่าง'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealType(m)}
                    className={`py-2.5 rounded-[12px] text-xs font-semibold transition-all border ${
                      mealType === m
                        ? 'border-[#A6844A] bg-[#1C1B19] text-[#FBF9F5] shadow-sm'
                        : 'border-[#E4DDD2] bg-[#F3F0EA] text-[#6F6A62] hover:text-[#1C1B19]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Portion Chips: 0.5 / 1 / 1.5 that scale all numbers */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#6F6A62]">ขนาดส่วน (Portion)</label>
                <span className="text-xs text-[#A6844A] tabular-numbers font-semibold">
                  ปรับสเกลอัตโนมัติ x{portion}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([0.5, 1.0, 1.5] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPortion(p)}
                    className={`py-2.5 rounded-[12px] border text-center transition-all ${
                      portion === p
                        ? 'border-[#C4623A] bg-[#C4623A]/10 text-[#C4623A] font-bold shadow-sm'
                        : 'border-[#E4DDD2] bg-[#F3F0EA] text-[#6F6A62]'
                    }`}
                  >
                    <span className="text-xs tabular-numbers font-medium block">
                      {p === 0.5 ? '0.5' : p === 1.0 ? '1.0' : '1.5'}
                    </span>
                    <span className="text-[10px] text-[#6F6A62] block mt-0.5">
                      {p === 0.5 ? 'ครึ่งจาน' : p === 1.0 ? 'จานปกติ' : 'จานใหญ่พิเศษ'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calories & Macros Display */}
            <div className="p-4 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[16px] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E4DDD2] pb-2.5">
                <div>
                  <span className="text-xs font-semibold text-[#6F6A62]">พลังงานประมาณการ</span>
                  <span className="text-[11px] text-[#A6844A] font-medium block mt-0.5">
                    คำนวณตามสเกลจานจริง (ค่าประมาณ)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold tabular-numbers text-[#C4623A]">
                    {currentKcal}
                  </span>
                  <span className="text-xs text-[#6F6A62] ml-1">kcal</span>
                </div>
              </div>

              {/* Editable Macros grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2]">
                  <span className="text-[10px] font-medium text-[#6F6A62] block">โปรตีน (Protein)</span>
                  <span className="text-base font-bold tabular-numbers text-[#1C1B19]">
                    {currentProtein}g
                  </span>
                </div>

                <div className="p-2.5 rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2]">
                  <span className="text-[10px] font-medium text-[#6F6A62] block">คาร์บ (Carbs)</span>
                  <span className="text-base font-bold tabular-numbers text-[#1C1B19]">
                    {currentCarbs}g
                  </span>
                </div>

                <div className="p-2.5 rounded-[12px] bg-[#FBF9F5] border border-[#E4DDD2]">
                  <span className="text-[10px] font-medium text-[#6F6A62] block">ไขมัน (Fat)</span>
                  <span className="text-base font-bold tabular-numbers text-[#1C1B19]">
                    {currentFat}g
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Base Calories Adjuster */}
            <div className="flex items-center justify-between text-xs text-[#6F6A62] px-1">
              <span>ปรับแคลอรี่ฐานก่อนคูณสัดส่วน:</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setBaseCalories((c) => Math.max(50, c - 50))}
                  className="px-2.5 py-1 rounded-[8px] bg-[#F3F0EA] border border-[#E4DDD2] text-[#1C1B19] active:bg-[#E4DDD2]"
                >
                  -50
                </button>
                <span className="tabular-numbers font-bold text-[#1C1B19] min-w-12 text-center">
                  {baseCalories}
                </span>
                <button
                  type="button"
                  onClick={() => setBaseCalories((c) => c + 50)}
                  className="px-2.5 py-1 rounded-[8px] bg-[#F3F0EA] border border-[#E4DDD2] text-[#1C1B19] active:bg-[#E4DDD2]"
                >
                  +50
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2 pb-6 border-t border-[#E4DDD2]">
          <button
            onClick={handleSave}
            disabled={isAnalyzing}
            className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm hover:bg-[#1C1B19]/90 active:scale-[0.99] transition-transform duration-200 flex items-center justify-center space-x-2 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกมื้อ{mealType} ({currentKcal} kcal)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
