'use client';

import React, { useState } from 'react';
import {
  Ruler,
  Plus,
  AlertCircle,
  HelpCircle,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  MeasurementRecord,
  UserProfile,
  MeasurementSiteKey,
} from '@/types';
import {
  MEASUREMENT_PROTOCOLS,
  ASIAN_REFERENCE,
  calculateNavyBodyFat,
} from '@/lib/constants';
import { MeasureFlow } from './MeasureFlow';

interface MeasureTabProps {
  profile: UserProfile;
  measurements: MeasurementRecord[];
  onSaveRecord: (record: MeasurementRecord) => void;
  isFlowOpen: boolean;
  onOpenFlow: () => void;
  onCloseFlow: () => void;
}

export const MeasureTab: React.FC<MeasureTabProps> = ({
  profile,
  measurements = [],
  onSaveRecord,
  isFlowOpen,
  onOpenFlow,
  onCloseFlow,
}) => {
  // Selected site for the single-site line trend history (avoiding multi-series dashboard clutter)
  const [selectedHistorySite, setSelectedHistorySite] = useState<MeasurementSiteKey>('waist');

  const latest = measurements?.[0];
  const previous = measurements?.[1];

  const latestValues = latest?.values || {};
  const prevValues = previous?.values || {};

  // Waist & Waist-to-Hip Reference evaluation (IDF/WHO Asian guidelines: reference only, never diagnosis)
  const waistVal = latestValues?.waist;
  const hipVal = latestValues?.hip;
  const waistMaxRef =
    profile?.sex === 'male' ? ASIAN_REFERENCE.waist.maleMax : ASIAN_REFERENCE.waist.femaleMax;
  const whrMaxRef =
    profile?.sex === 'male'
      ? ASIAN_REFERENCE.waistToHip.maleMax
      : ASIAN_REFERENCE.waistToHip.femaleMax;

  const currentWhr = waistVal && hipVal ? Math.round((waistVal / hipVal) * 100) / 100 : null;

  // Navy Body Fat % estimate (if neck, waist, height, and hip for women are present)
  const navyBf =
    latest?.navyBodyFat ??
    calculateNavyBodyFat(
      profile?.sex || 'male',
      latestValues?.height || profile?.height,
      latestValues?.neck,
      latestValues?.waist,
      latestValues?.hip
    );

  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight">เทปวัดสรีระ</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#A6844A]/10 text-[#A6844A] font-semibold">
            Brass Tape Protocol
          </span>
        </div>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          บันทึกจุดวัดตามมาตรฐานสรีระ แสดงตัวเลขตารางคมชัดและเกณฑ์อ้างอิง
        </p>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onOpenFlow}
        className="w-full h-[52px] rounded-[12px] bg-[#1C1B19] text-[#FBF9F5] font-semibold text-sm flex items-center justify-center space-x-2 active:scale-[0.99] transition-transform duration-200 shadow-sm"
      >
        <Ruler className="w-4 h-4 text-[#A6844A]" />
        <span>บันทึกสัดส่วนใหม่ (เทปวัดรอบตัว)</span>
      </button>

      {/* Navy Body Fat Card (shown only if prerequisites present) */}
      {navyBf !== null && navyBf !== undefined && (
        <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#A6844A] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#A6844A]/10 text-[#A6844A]">
              ค่าประมาณจากการวัดรอบ
            </span>
            <span className="text-xs text-[#6F6A62]">U.S. Navy Method</span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-xs text-[#6F6A62]">ประมาณการเปอร์เซ็นต์ไขมัน</div>
              <div className="text-xs text-[#6F6A62]/80 mt-0.5">
                ประเมินจากรอบคอ เอว ส่วนสูง {profile?.sex === 'female' ? 'และสะโพก' : ''}
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold tabular-numbers text-[#1C1B19]">
                {navyBf}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reference Guideline Box (เกณฑ์อ้างอิง, never diagnosis) */}
      <div className="p-4 rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] shadow-sm space-y-3">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#1C1B19]">
          <span className="w-2 h-2 rounded-full bg-[#A6844A]"></span>
          <span>เกณฑ์อ้างอิงสุขภาพรอบเอวและสะโพก (เอเชีย)</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#F3F0EA] rounded-[12px] border border-[#E4DDD2]">
            <div className="text-[10px] text-[#6F6A62]">รอบเอวอ้างอิง ({profile?.sex === 'male' ? 'ชาย' : 'หญิง'})</div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-lg font-bold tabular-numbers text-[#1C1B19]">
                {waistVal ?? '—'}
              </span>
              <span className="text-[11px] text-[#6F6A62]">/ {waistMaxRef} cm</span>
            </div>
            <p className="text-[10px] text-[#6F6A62] mt-1">
              {waistVal !== undefined && waistVal !== null
                ? waistVal <= waistMaxRef
                  ? 'อยู่ในเกณฑ์อ้างอิง'
                  : `เกินเกณฑ์ ${Math.round((waistVal - waistMaxRef) * 10) / 10} cm`
                : 'รอข้อมูลการวัด'}
            </p>
          </div>

          <div className="p-3 bg-[#F3F0EA] rounded-[12px] border border-[#E4DDD2]">
            <div className="text-[10px] text-[#6F6A62]">สัดส่วนเอวต่อสะโพก (WHR)</div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-lg font-bold tabular-numbers text-[#1C1B19]">
                {currentWhr ?? '—'}
              </span>
              <span className="text-[11px] text-[#6F6A62]">/ {whrMaxRef}</span>
            </div>
            <p className="text-[10px] text-[#6F6A62] mt-1">
              {currentWhr
                ? currentWhr <= whrMaxRef
                  ? 'อยู่ในเกณฑ์อ้างอิง'
                  : 'สูงกว่าเกณฑ์อ้างอิง'
                : 'รอข้อมูลสะโพก'}
            </p>
          </div>
        </div>

        <div className="text-[10px] text-[#6F6A62] flex items-start space-x-1 pt-0.5">
          <AlertCircle className="w-3 h-3 text-[#A6844A] shrink-0 mt-0.5" />
          <span>
            หมายเหตุ: ข้อมูลนี้เป็น <strong>เกณฑ์อ้างอิงทางสถิติ</strong> เท่านั้น
            ไม่ใช่การวินิจฉัยทางการแพทย์
          </span>
        </div>
      </div>

      {/* Tape-like Rows: Current Measurements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1C1B19]">สัดส่วนปัจจุบัน (เปรียบเทียบล่าสุด)</span>
          {latest && (
            <span className="text-[11px] tabular-numbers text-[#6F6A62]">
              บันทึกเมื่อ: {latest.date}
            </span>
          )}
        </div>

        <div className="rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] overflow-hidden divide-y divide-[#E4DDD2] shadow-sm">
          {MEASUREMENT_PROTOCOLS.map((site) => {
            const currentVal = latestValues?.[site.key];
            const prevVal = prevValues?.[site.key];

            let diffText = '—';
            let diffColor = 'text-[#6F6A62]';

            if (currentVal !== undefined && currentVal !== null && prevVal !== undefined && prevVal !== null) {
              const diff = Math.round((currentVal - prevVal) * 10) / 10;
              if (diff > 0) {
                diffText = `+${diff} ${site.unit}`;
                diffColor = 'text-[#C4623A]';
              } else if (diff < 0) {
                diffText = `${diff} ${site.unit}`;
                diffColor = 'text-[#1F4D3A]';
              } else {
                diffText = 'เท่าเดิม';
                diffColor = 'text-[#6F6A62]';
              }
            }

            return (
              <div
                key={site.key}
                className="p-3.5 flex items-center justify-between hover:bg-[#F3F0EA]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-[#1C1B19]">{site.nameThai}</span>
                    <span className="text-[10px] text-[#6F6A62]">({site.unit})</span>
                  </div>
                  <div className="text-[10px] text-[#6F6A62] mt-0.5 line-clamp-1 max-w-[210px]">
                    {site.protocol.split(' ')[0]}...
                  </div>
                </div>

                <div className="flex items-baseline space-x-3 text-right">
                  <div>
                    <span className="text-lg font-bold tabular-numbers text-[#1C1B19]">
                      {currentVal !== undefined && currentVal !== null ? currentVal : '—'}
                    </span>
                  </div>

                  <div className="w-16 text-right">
                    <span className={`text-[11px] tabular-numbers font-medium ${diffColor}`}>
                      {diffText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History: Date list + single-site line (not multi-series clutter) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1C1B19]">ประวัติพัฒนาการเดี่ยว</span>
          <select
            value={selectedHistorySite}
            onChange={(e) => setSelectedHistorySite(e.target.value as MeasurementSiteKey)}
            className="text-xs px-2.5 py-1 rounded-[8px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] focus:outline-none focus:border-[#A6844A]"
          >
            {MEASUREMENT_PROTOCOLS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.nameThai} ({p.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Date List for selected site */}
        <div className="rounded-[16px] bg-[#FBF9F5] border border-[#E4DDD2] divide-y divide-[#E4DDD2] shadow-sm">
          {!measurements || measurements.length === 0 ? (
            <div className="p-5 text-center text-xs text-[#6F6A62]">
              ยังไม่มีประวัติการวัดสัดส่วน
            </div>
          ) : (
            measurements.map((rec, index) => {
              const recValues = rec?.values || {};
              const val = recValues?.[selectedHistorySite];
              const nextOlderRec = measurements[index + 1];
              const olderVal = nextOlderRec?.values?.[selectedHistorySite];
              let change = '';
              if (val !== undefined && val !== null && olderVal !== undefined && olderVal !== null) {
                const diff = Math.round((val - olderVal) * 10) / 10;
                if (diff > 0) change = `+${diff}`;
                else if (diff < 0) change = `${diff}`;
                else change = '0';
              }

              return (
                <div key={rec.id || index} className="p-3 px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-[#A6844A]" />
                    <span className="tabular-numbers text-[#6F6A62]">{rec.date}</span>
                  </div>

                  <div className="flex items-baseline space-x-3">
                    <span className="text-sm font-bold tabular-numbers text-[#1C1B19]">
                      {val !== undefined && val !== null ? `${val} cm` : '—'}
                    </span>
                    {change && (
                      <span className="text-[11px] tabular-numbers font-medium text-[#6F6A62]">
                        ({change})
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Measurement Flow Modal */}
      <MeasureFlow
        isOpen={isFlowOpen}
        onClose={onCloseFlow}
        onSaveRecord={onSaveRecord}
        profile={profile}
        latestRecord={latest}
      />
    </div>
  );
};
