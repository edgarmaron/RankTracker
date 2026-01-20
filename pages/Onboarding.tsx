import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Sex, UserProfile } from '../types';

export const Onboarding: React.FC = () => {
  const { setProfile } = useGame();
  const [data, setData] = useState<Partial<UserProfile>>({
    sex: Sex.MALE,
    startWeight: 0,
    currentWeight: 0,
    targetWeight: 0,
    height: 0,
    age: 0,
    name: '',
    targetSteps: 8000,
    calorieTarget: 2000,
    sleepTargetHours: 8
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setData({ ...data, [e.target.name]: val });
  };

  const handleFinish = () => {
    if (!data.name || !data.currentWeight || !data.targetWeight || !data.height || !data.age || !data.targetDate || !data.calorieTarget) {
      alert("Please fill all fields, Summoner.");
      return;
    }

    const profile: UserProfile = {
      name: data.name,
      sex: data.sex as Sex,
      age: Number(data.age),
      height: Number(data.height),
      startWeight: Number(data.currentWeight),
      currentWeight: Number(data.currentWeight),
      targetWeight: Number(data.targetWeight),
      targetDate: data.targetDate as string,
      targetSteps: Number(data.targetSteps),
      calorieTarget: Number(data.calorieTarget),
      sleepTargetHours: Number(data.sleepTargetHours || 8),
      createdAt: new Date().toISOString(),
      bmr: 0, // Will be calc'd in context
      coins: 0,
      showFaithQuotes: true,
      showFaithQuests: true,
      promotionModeEnabled: true,
      seasonTheme: 'Discipline',
      customQuests: [],
      soundEnabled: true,
      resetRankOnSplit: false,
      currentFocus: 'Balanced',
      currentThemeId: 'default',
      unlockedThemeIds: ['default'],
      autoTint: true,
      tintOverride: 'Auto'
    };
    
    setProfile(profile);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <div className="max-w-xl w-full bg-slate-900 border border-amber-600/30 shadow-[0_0_50px_rgba(245,158,11,0.1)] p-8 relative overflow-hidden">
        {/* Deco borders */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 uppercase tracking-widest">
            Welcome Summoner
          </h1>
          <p className="text-slate-400 mt-2">Initialize your physical profile to begin the ranked climb.</p>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Summoner Name</label>
                <input type="text" name="name" className="w-full bg-slate-950 border border-slate-700 text-amber-100 p-3 focus:border-amber-500 outline-none" placeholder="Enter name" onChange={handleChange} />
             </div>
             
             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Current Weight (kg)</label>
                <input type="number" name="currentWeight" className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>
             
             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Target Weight (kg)</label>
                <input type="number" name="targetWeight" className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>

             <div className="col-span-2">
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Target Date</label>
                <input type="date" name="targetDate" className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>

             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Height (cm)</label>
                <input type="number" name="height" className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>

             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Age</label>
                <input type="number" name="age" className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>

             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Sex</label>
                <select name="sex" className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange}>
                  <option value={Sex.MALE}>Male</option>
                  <option value={Sex.FEMALE}>Female</option>
                </select>
             </div>

             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Daily Step Goal</label>
                <input type="number" name="targetSteps" defaultValue={8000} className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>

             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Calorie Limit (kcal)</label>
                <input type="number" name="calorieTarget" defaultValue={2000} className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>

             <div>
                <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Sleep Target (Hours)</label>
                <input type="number" name="sleepTargetHours" defaultValue={8} step="0.5" className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 focus:border-amber-500 outline-none" onChange={handleChange} />
             </div>
          </div>

          <button 
            onClick={handleFinish}
            className="w-full py-4 mt-6 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold uppercase tracking-widest transition-all border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            Enter the Arena
          </button>
        </div>
      </div>
    </div>
  );
};