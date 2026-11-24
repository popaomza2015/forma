'use client';

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  DayPlan,
  WorkoutSessionLog,
  FoodItem,
  MeasurementRecord,
  MealCategoryKey,
} from '@/types';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredPlan,
  saveStoredPlan,
  getStoredWorkoutLogs,
  saveWorkoutLog,
  getStoredFoodLogs,
  saveFoodItem,
  deleteFoodItem,
  getStoredMeasurements,
  saveMeasurementRecord,
  seedSampleDataIfNeeded,
} from '@/lib/storage';
import { generateWeeklyPlan, calculateCalorieTarget } from '@/lib/constants';

import { Header } from '@/components/Header';
import { Navigation, TabType } from '@/components/Navigation';
import { Onboarding } from '@/components/Onboarding';
import { ProfileSheet } from '@/components/ProfileSheet';
import { TodayTab } from '@/components/TodayTab';
import { PlanTab } from '@/components/PlanTab';
import { FoodTab } from '@/components/FoodTab';
import { MeasureTab } from '@/components/MeasureTab';
import { SessionPlayer } from '@/components/SessionPlayer';

export default function Home() {
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodItem[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);

  // Navigation & Modal states
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSessionDay, setActiveSessionDay] = useState<DayPlan | null>(null);
  const [isFoodSheetOpen, setIsFoodSheetOpen] = useState(false);
  const [foodSheetDefaultCategory, setFoodSheetDefaultCategory] = useState<MealCategoryKey>('กลางวัน');
  const [isMeasureFlowOpen, setIsMeasureFlowOpen] = useState(false);

  // Initialize and load from localStorage
  useEffect(() => {
    let p = getStoredProfile();

    if (p) {
      // Seed data if empty so center of screens is immediately active
      seedSampleDataIfNeeded(p);

      setProfile(p);
      let plan = getStoredPlan();
      if (!plan || plan.length === 0) {
        plan = generateWeeklyPlan(p.days, p.goal);
        saveStoredPlan(plan);
      }
      setWeeklyPlan(plan);
      setWorkoutLogs(getStoredWorkoutLogs());
      setFoodLogs(getStoredFoodLogs());
      setMeasurements(getStoredMeasurements());
    }

    setIsClientLoaded(true);
  }, []);

  // Complete onboarding
  const handleCompleteOnboarding = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);

    // Generate weekly plan by rule
    const newPlan = generateWeeklyPlan(newProfile.days, newProfile.goal);
    setWeeklyPlan(newPlan);
    saveStoredPlan(newPlan);

    // Seed baseline measurements and starter meals so pages are never empty!
    seedSampleDataIfNeeded(newProfile);
    setMeasurements(getStoredMeasurements());
    setFoodLogs(getStoredFoodLogs());
  };

  // Profile save & update
  const handleSaveProfile = (updatedProfile: UserProfile, shouldRegeneratePlan: boolean) => {
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);

    if (shouldRegeneratePlan) {
      const newPlan = generateWeeklyPlan(updatedProfile.days, updatedProfile.goal);
      setWeeklyPlan(newPlan);
      saveStoredPlan(newPlan);
    }
  };

  // Plan updates (e.g. exercise swapping)
  const handleUpdatePlan = (updatedPlan: DayPlan[]) => {
    setWeeklyPlan(updatedPlan);
    saveStoredPlan(updatedPlan);
  };

  // Food handlers
  const handleSaveFood = (item: FoodItem) => {
    saveFoodItem(item);
    setFoodLogs(getStoredFoodLogs());
  };

  const handleDeleteFood = (id: string) => {
    deleteFoodItem(id);
    setFoodLogs(getStoredFoodLogs());
  };

  const handleOpenFoodSheet = (category?: MealCategoryKey) => {
    if (category) {
      setFoodSheetDefaultCategory(category);
    }
    setIsFoodSheetOpen(true);
  };

  // Measurement handlers
  const handleSaveMeasurement = (record: MeasurementRecord) => {
    saveMeasurementRecord(record);
    setMeasurements(getStoredMeasurements());
  };

  // Workout Session handlers
  const handleStartSession = (dayPlan: DayPlan) => {
    setActiveSessionDay(dayPlan);
  };

  const handleFinishSession = (log: WorkoutSessionLog) => {
    saveWorkoutLog(log);
    setWorkoutLogs(getStoredWorkoutLogs());
    setActiveSessionDay(null);
  };

  // Show a quiet loading shell before client storage hydration
  if (!isClientLoaded) {
    return (
      <div className="min-h-screen bg-[#F3F0EA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-2xl tracking-wider text-[#1C1B19]">FORMA</span>
            <span className="w-2 h-2 rounded-full bg-[#A6844A]"></span>
          </div>
          <span className="text-xs text-[#6F6A62]">กำลังโหลดสมุดบันทึกสรีระ...</span>
        </div>
      </div>
    );
  }

  // If user has not onboarded yet, show 3-step onboarding
  if (!profile || !profile.isOnboarded) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-[#F3F0EA] flex flex-col justify-between relative">
      {/* Native-like Header with profile trigger */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Tab View */}
      <main className="flex-1">
        {activeTab === 'today' && (
          <TodayTab
            profile={profile}
            plan={weeklyPlan}
            foodLogs={foodLogs}
            measurements={measurements}
            workoutLogs={workoutLogs}
            onStartSession={handleStartSession}
            onOpenFoodSheet={handleOpenFoodSheet}
            onOpenMeasureFlow={() => setIsMeasureFlowOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'plan' && (
          <PlanTab
            profile={profile}
            plan={weeklyPlan}
            onUpdatePlan={handleUpdatePlan}
            onStartSession={handleStartSession}
          />
        )}

        {activeTab === 'food' && (
          <FoodTab
            profile={profile}
            foodLogs={foodLogs}
            onSaveFood={handleSaveFood}
            onDeleteFood={handleDeleteFood}
            isSheetOpen={isFoodSheetOpen}
            onOpenSheet={() => setIsFoodSheetOpen(true)}
            onCloseSheet={() => setIsFoodSheetOpen(false)}
          />
        )}

        {activeTab === 'measure' && (
          <MeasureTab
            profile={profile}
            measurements={measurements}
            onSaveRecord={handleSaveMeasurement}
            isFlowOpen={isMeasureFlowOpen}
            onOpenFlow={() => setIsMeasureFlowOpen(true)}
            onCloseFlow={() => setIsMeasureFlowOpen(false)}
          />
        )}
      </main>

      {/* Bottom 4-tab bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Profile Sheet (from Header) */}
      <ProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Active Workout Session Player */}
      {activeSessionDay && (
        <SessionPlayer
          dayPlan={activeSessionDay}
          onClose={() => setActiveSessionDay(null)}
          onFinishSession={handleFinishSession}
        />
      )}
    </div>
  );
}
