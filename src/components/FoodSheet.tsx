'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Camera, AlertCircle, Sparkles } from 'lucide-react';
import { FoodItem } from '@/types';
import { analyzeFood } from '@/lib/constants';
import { getTodayDateString } from '@/lib/storage';

interface FoodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFood: (item: FoodItem) => void;
  initialImageFile?: File | null;
}

export const FoodSheet: React.FC<FoodSheetProps> = ({
  isOpen,
  onClose,
  onSaveFood,
  initialImageFile,
}) => {
  const [dishName, setDishName] = useState('');
  const [mealType, setMealType] = useState<'เช้า' | 'กลางวัน' | 'เย็น' | 'ของว่าง'>('กลางวัน');
  const [baseCalories, setBaseCalories] = useState(380);
  const [baseProtein, setBaseProtein] = useState(28);
  const [baseCarbs, setBaseCarbs] = useState(45);
  const [baseFat, setBaseFat] = useState(8);
  const [portion, setPortion] = useState<0.5 | 1.0 | 1.5>(1.0);
  const [isUnsure, setIsUnsure] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Auto-analyze when image is provided or modal opens with initialImageFile
  useEffect(() => {
    if (isOpen) {
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
            setMealType(result.mealType);
            setIsUnsure(result.isUnsure);
          })
          .finally(() => setIsAnalyzing(false));
      } else {
        // Manual entry default
        setDishName('ข้าวกะเพราอกไก่');
        setBaseCalories(420);
        setBaseProtein(35);
        setBaseCarbs(50);
        setBaseFat(7);
        setPortion(1.0);
        setIsUnsure(false);
        setImagePreview(null);
      }
    }
  }, [isOpen, initialImageFile]);

  if (!isOpen) return null;

  // Portion scaled numbers
  const currentKcal = Math.round(baseCalories * portion);
  const currentProtein = Math.round(baseProtein * portion);
  const currentCarbs = Math.round(baseCarbs * portion);
  const currentFat = Math.round(baseFat * portion);

  const handleSave = () => {
    const newItem: FoodItem = {
      id: `food_${Date.now()}`,
      name: dishName.trim() || 'มื้ออาหาร',
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 forma-transition">
      <div
        className="w-full max-w-[480px] bg-[#FBF9F5] rounded-t-[20px] border-t border-x border-[#E4DDD2] max-h-[92vh] overflow-y-auto px-5 py-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD2]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C4623A]/10 text-[#C4623A]">
              ค่าประมาณ
            </span>
            <span className="text-xs text-[#6F6A62]">บันทึกมื้ออาหาร</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F0EA] flex items-center justify-center text-[#6F6A62] hover:text-[#1C1B19]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAnalyzing ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#A6844A] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-[#6F6A62]">กำลังวิเคราะห์รูปภาพและประมาณการสารอาหาร...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Image Thumbnail if available */}
            {imagePreview && (
              <div className="relative w-full h-36 rounded-[14px] overflow-hidden border border-[#E4DDD2] bg-[#F3F0EA]">
                <img
                  src={imagePreview}
                  alt="ภาพอาหาร"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Dish Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#6F6A62]">ชื่ออาหาร / เมนู</label>
                {isUnsure && (
                  <span className="text-[11px] font-medium text-[#9C3B2E] flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>ควรตรวจชื่อ</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="ระบุชื่ออาหาร"
                className="w-full h-[48px] px-3.5 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[12px] text-sm font-medium text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
              />
            </div>

            {/* Meal Type Selector */}
            <div>
              <label className="text-xs font-medium text-[#6F6A62] block mb-1">ช่วงเวลาของมื้อ</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['เช้า', 'กลางวัน', 'เย็น', 'ของว่าง'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealType(m)}
                    className={`py-2 rounded-[10px] text-xs font-medium transition-colors border ${
                      mealType === m
                        ? 'border-[#A6844A] bg-[#F3F0EA] text-[#1C1B19]'
                        : 'border-[#E4DDD2] bg-[#FBF9F5] text-[#6F6A62]'
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
                <label className="text-xs font-medium text-[#6F6A62]">ขนาดส่วน (Portion)</label>
                <span className="text-[11px] text-[#A6844A] tabular-numbers font-medium">
                  คูณสเกล x{portion}
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
                        ? 'border-[#C4623A] bg-[#C4623A]/10 text-[#C4623A] font-bold'
                        : 'border-[#E4DDD2] bg-[#F3F0EA] text-[#6F6A62]'
                    }`}
                  >
                    <span className="text-xs tabular-numbers font-medium">
                      {p === 0.5 ? '0.5 (ครึ่งจาน)' : p === 1.0 ? '1.0 (ปกติ)' : '1.5 (จานใหญ่/พิเศษ)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calories & Macros Display */}
            <div className="p-4 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[16px] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E4DDD2] pb-2.5">
                <div>
                  <span className="text-xs text-[#6F6A62]">พลังงานประมาณการ</span>
                  <span className="text-[10px] text-[#A6844A] block">คำนวณตามสัดส่วนจาน</span>
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
                <div className="p-2 rounded-[10px] bg-[#FBF9F5] border border-[#E4DDD2]">
                  <span className="text-[10px] text-[#6F6A62] block">โปรตีน</span>
                  <span className="text-base font-bold tabular-numbers text-[#1C1B19]">
                    {currentProtein}g
                  </span>
                </div>

                <div className="p-2 rounded-[10px] bg-[#FBF9F5] border border-[#E4DDD2]">
                  <span className="text-[10px] text-[#6F6A62] block">คาร์บ</span>
                  <span className="text-base font-bold tabular-numbers text-[#1C1B19]">
                    {currentCarbs}g
                  </span>
                </div>

                <div className="p-2 rounded-[10px] bg-[#FBF9F5] border border-[#E4DDD2]">
                  <span className="text-[10px] text-[#6F6A62] block">ไขมัน</span>
                  <span className="text-base font-bold tabular-numbers text-[#1C1B19]">
                    {currentFat}g
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Calories Quick Adjuster */}
            <div className="flex items-center justify-between text-xs text-[#6F6A62] px-1">
              <span>ปรับแคลอรี่พื้นฐาน:</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setBaseCalories((c) => Math.max(50, c - 50))}
                  className="px-2 py-1 rounded bg-[#F3F0EA] border border-[#E4DDD2] text-[#1C1B19]"
                >
                  -50
                </button>
                <span className="tabular-numbers font-medium text-[#1C1B19]">{baseCalories}</span>
                <button
                  type="button"
                  onClick={() => setBaseCalories((c) => c + 50)}
                  className="px-2 py-1 rounded bg-[#F3F0EA] border border-[#E4DDD2] text-[#1C1B19]"
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
            className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm hover:bg-[#1C1B19]/90 active:scale-[0.99] transition-transform duration-200"
          >
            บันทึกรายการอาหาร
          </button>
        </div>
      </div>
    </div>
  );
};
