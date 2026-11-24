'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Wifi, Battery, Signal } from 'lucide-react';
import { UserProfile } from '@/types';

interface HeaderProps {
  profile: UserProfile | null;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onOpenProfile }) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#F3F0EA]/98 backdrop-blur-sm border-b border-[#E4DDD2]">
      {/* Native Mobile Status Bar Simulation */}
      <div className="px-5 pt-2 pb-1 flex items-center justify-between text-[#1C1B19] select-none">
        <span className="text-[11px] font-bold tabular-numbers tracking-tight">{timeStr}</span>
        <div className="flex items-center space-x-1.5 opacity-80">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5 text-[#1C1B19]" />
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-wider text-[#1C1B19] uppercase">FORMA</span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#A6844A]"></span>
            </div>
            <span className="text-[10px] text-[#6F6A62] font-medium tracking-tight">
              สมุดบันทึกสรีระและสมดุล
            </span>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          aria-label="ตั้งค่าโปรไฟล์"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[10px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] shadow-sm hover:border-[#A6844A] active:scale-[0.97] transition-all duration-200"
        >
          <span className="text-xs font-semibold text-[#1C1B19]">
            {profile?.goal === 'lose' ? 'ลดไขมัน' : profile?.goal === 'build' ? 'เพิ่มกล้าม' : 'รักษาสมดุล'}
          </span>
          <Sliders className="w-3.5 h-3.5 text-[#A6844A]" />
        </button>
      </div>
    </header>
  );
};
