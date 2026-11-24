'use client';

import React from 'react';
import { User, Sliders } from 'lucide-react';
import { UserProfile } from '@/types';

interface HeaderProps {
  profile: UserProfile | null;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onOpenProfile }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F3F0EA]/95 backdrop-blur-none border-b border-[#E4DDD2] px-5 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-lg tracking-wider text-[#1C1B19] uppercase">FORMA</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A6844A]"></span>
          </div>
          <span className="text-[11px] text-[#6F6A62] tracking-tight">สมุดบันทึกสรีระและสมดุล</span>
        </div>
      </div>

      <button
        onClick={onOpenProfile}
        aria-label="ตั้งค่าโปรไฟล์"
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[10px] bg-[#FBF9F5] border border-[#E4DDD2] text-[#1C1B19] active:bg-[#E4DDD2]/40 transition-colors duration-200"
      >
        <span className="text-xs font-medium text-[#6F6A62]">
          {profile?.goal === 'lose' ? 'ลดไขมัน' : profile?.goal === 'build' ? 'เพิ่มกล้าม' : 'รักษาสมดุล'}
        </span>
        <Sliders className="w-3.5 h-3.5 text-[#A6844A]" />
      </button>
    </header>
  );
};
