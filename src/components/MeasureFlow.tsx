'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Check, ChevronLeft, Minus, Plus } from 'lucide-react';
import { MeasurementSiteKey, MeasurementRecord, UserProfile } from '@/types';
import { MEASUREMENT_PROTOCOLS, calculateNavyBodyFat } from '@/lib/constants';
import { getTodayDateString } from '@/lib/storage';

interface MeasureFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: MeasurementRecord) => void;
  profile: UserProfile;
  latestRecord?: MeasurementRecord;
}

export const MeasureFlow: React.FC<MeasureFlowProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  profile,
  latestRecord,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [values, setValues] = useState<Partial<Record<MeasurementSiteKey, number>>>(() => {
    return {
      height: latestRecord?.values.height || profile.height || 170,
      weight: latestRecord?.values.weight || profile.weight || 65,
    };
  });

  const currentProtocol = MEASUREMENT_PROTOCOLS[currentStepIndex];
  const isLastStep = currentStepIndex === MEASUREMENT_PROTOCOLS.length - 1;

  if (!isOpen) return null;

  const currentSiteVal = values[currentProtocol.key] || '';

  const handleNext = () => {
    if (isLastStep) {
      finalize();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    // Leave undefined or keep previous if any
    if (isLastStep) {
      finalize();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const finalize = () => {
    // Calculate Navy Body Fat if prerequisites met
    const navyBf = calculateNavyBodyFat(
      profile.sex,
      values.height,
      values.neck,
      values.waist,
      values.hip
    );

    const record: MeasurementRecord = {
      id: `mrec_${Date.now()}`,
      date: getTodayDateString(),
      timestamp: new Date().toISOString(),
      values: { ...values },
      navyBodyFat: navyBf !== null ? navyBf : undefined,
    };

    onSaveRecord(record);
    onClose();
  };

  const setNumeric = (val: number) => {
    setValues((prev) => ({
      ...prev,
      [currentProtocol.key]: Math.max(0, Math.round(val * 10) / 10),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 forma-transition">
      <div
        className="w-full max-w-[480px] bg-[#FBF9F5] rounded-t-[20px] border-t border-x border-[#E4DDD2] max-h-[92vh] overflow-y-auto px-5 py-5 shadow-lg flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD2]">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#A6844A]/10 text-[#A6844A]">
                เทปวัดสัดส่วน
              </span>
              <span className="text-xs tabular-numbers text-[#6F6A62]">
                จุดที่ {currentStepIndex + 1} จาก {MEASUREMENT_PROTOCOLS.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F3F0EA] flex items-center justify-center text-[#6F6A62] hover:text-[#1C1B19]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Brass tape step line */}
          <div className="w-full h-1 bg-[#E4DDD2] rounded-full overflow-hidden my-3">
            <div
              className="h-full bg-[#A6844A] transition-all duration-200 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / MEASUREMENT_PROTOCOLS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Protocol Step Content */}
        <div className="py-6 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-[#A6844A] tracking-wider uppercase">
              เกณฑ์จุดวัดตามมาตรฐาน
            </span>
            <h2 className="text-2xl font-bold text-[#1C1B19] tracking-tight">
              {currentProtocol.nameThai}
            </h2>
            <div className="p-3 bg-[#F3F0EA] border border-[#E4DDD2] rounded-[12px] text-xs text-[#6F6A62] text-left mt-2 leading-relaxed">
              <strong className="text-[#1C1B19] block mb-0.5">ตำแหน่งการวัด:</strong>
              {currentProtocol.protocol}
            </div>
          </div>

          {/* Brass Ruler Visual / Stepper */}
          <div className="p-5 rounded-[16px] bg-[#FBF9F5] border border-[#A6844A]/40 shadow-sm relative overflow-hidden">
            {/* Subtle brass tape tick marks at top */}
            <div className="absolute top-0 left-0 right-0 h-2.5 brass-tape-ticks border-b border-[#E4DDD2]" />

            <div className="pt-3 text-center">
              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setNumeric(Number(currentSiteVal || 50) - 0.5)}
                  className="w-11 h-11 rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-center text-[#1C1B19] active:bg-[#E4DDD2]"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-baseline justify-center space-x-1.5">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="—"
                    value={currentSiteVal}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [currentProtocol.key]: e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    className="w-32 text-center text-4xl font-bold tabular-numbers text-[#1C1B19] bg-transparent border-b-2 border-[#A6844A] focus:outline-none"
                  />
                  <span className="text-sm font-semibold text-[#6F6A62]">
                    {currentProtocol.unit}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setNumeric(Number(currentSiteVal || 50) + 0.5)}
                  className="w-11 h-11 rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] flex items-center justify-center text-[#1C1B19] active:bg-[#E4DDD2]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {latestRecord?.values[currentProtocol.key] && (
                <p className="text-[11px] text-[#6F6A62] mt-3">
                  ค่าบันทึกล่าสุด:{' '}
                  <span className="tabular-numbers font-medium text-[#1C1B19]">
                    {latestRecord.values[currentProtocol.key]} {currentProtocol.unit}
                  </span>
                </p>
              )}
            </div>

            {/* Subtle brass tape tick marks at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2.5 brass-tape-ticks border-t border-[#E4DDD2]" />
          </div>
        </div>

        {/* Controls */}
        <div className="pt-2 pb-6 border-t border-[#E4DDD2] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="h-[52px] rounded-[12px] bg-[#F3F0EA] border border-[#E4DDD2] text-[#6F6A62] font-medium text-xs hover:text-[#1C1B19]"
            >
              ข้ามจุดนี้
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-xs flex items-center justify-center space-x-1.5 active:scale-[0.99] transition-transform duration-200"
            >
              <span>{isLastStep ? 'บันทึกข้อมูล' : 'ถัดไป'}</span>
              {isLastStep ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStepIndex((p) => p - 1)}
              className="w-full text-center text-[11px] text-[#6F6A62] pt-1"
            >
              ย้อนกลับไปจุดก่อนหน้า
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
