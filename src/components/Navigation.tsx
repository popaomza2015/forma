'use client';

import React from 'react';
import { Calendar, Dumbbell, Utensils, Ruler } from 'lucide-react';

export type TabType = 'today' | 'plan' | 'food' | 'measure';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'วันนี้', icon: <Calendar className="w-5 h-5" /> },
    { id: 'plan', label: 'แผน', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'food', label: 'จาน', icon: <Utensils className="w-5 h-5" /> },
    { id: 'measure', label: 'สัด', icon: <Ruler className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F5] border-t border-[#E4DDD2] shadow-sm">
      <div className="max-w-[480px] mx-auto w-full">
        <div className="h-[56px] flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center relative py-1 transition-colors duration-200 ${
                  isActive ? 'text-[#1C1B19]' : 'text-[#6F6A62] hover:text-[#1C1B19]'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#A6844A] rounded-full" />
                )}
                <div className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'scale-100'}`}>
                  {tab.icon}
                </div>
                <span className={`text-[11px] mt-0.5 font-medium tracking-tight ${isActive ? 'text-[#1C1B19] font-bold' : 'text-[#6F6A62]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
