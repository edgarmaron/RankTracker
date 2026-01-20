import React from 'react';
import { useGame } from '../context/GameContext';
import { RankEmblem } from '../components/RankEmblem';
import { MASTERY_THRESHOLDS } from '../constants';
import { Shield, Coins, Flame, Moon, Footprints, Weight, User, Zap, Trophy, TrendingUp, Download } from 'lucide-react';

export const Profile: React.FC = () => {
  const { profile, rank, mastery, badges, personalRecords, exportSave } = useGame();
  
  const getLevel = (xp: number) => {
      let level = 0;
      for (let i = 0; i < MASTERY_THRESHOLDS.length; i++) {
          if (xp >= MASTERY_THRESHOLDS[i]) level = i + 1;
          else break;
      }
      return level;
  };

  const renderMasteryRing = (label: string, xp: number, icon: any) => {
      const level = getLevel(xp);
      const nextThreshold = MASTERY_THRESHOLDS[level] || MASTERY_THRESHOLDS[MASTERY_THRESHOLDS.length - 1];
      const prevThreshold = MASTERY_THRESHOLDS[level - 1] || 0;
      const progress = Math.min(100, ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
      
      return (
          <div className="flex flex-col items-center gap-2">
              <div className="relative w-20 h-20 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="40" cy="40" r="36" fill="none" stroke="#1e293b" strokeWidth="4" />
                     <circle 
                        cx="40" cy="40" r="36" fill="none" stroke="#f59e0b" 
                        strokeWidth="4" 
                        strokeDasharray={226} 
                        strokeDashoffset={226 - (226 * progress) / 100}
                     />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                       {icon}
                   </div>
                   <div className="absolute -bottom-1 bg-slate-900 px-2 border border-amber-500 rounded text-[10px] font-bold text-amber-500">
                       Lvl {level}
                   </div>
              </div>
              <span className="text-xs uppercase font-bold text-slate-500">{label}</span>
          </div>
      );
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
       {/* Header */}
       <div className="relative bg-slate-900 border border-slate-700 p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 to-transparent" />
           <div className="relative z-10">
               <div className="w-32 h-32 rounded-full bg-slate-950 border-4 border-amber-600 flex items-center justify-center">
                   <User size={48} className="text-amber-100" />
               </div>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-500 px-3 py-1 rounded text-xs font-bold text-amber-400 uppercase tracking-widest whitespace-nowrap">
                   {profile?.currentFocus}
               </div>
           </div>
           
           <div className="flex-1 text-center md:text-left z-10">
               <h1 className="text-3xl font-bold text-slate-100 tracking-widest uppercase mb-1">{profile?.name}</h1>
               <p className="text-slate-400 font-serif italic mb-4">"The Disciplined"</p>
               <div className="flex gap-6 justify-center md:justify-start">
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold">Rank</p>
                       <p className="text-amber-400 font-bold">{rank.tier} {rank.division}</p>
                   </div>
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold">Coins</p>
                       <p className="text-yellow-400 font-bold flex items-center gap-1"><Coins size={14}/> {profile?.coins}</p>
                   </div>
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold">Joined</p>
                       <p className="text-slate-300 font-bold">{profile?.createdAt.split('T')[0]}</p>
                   </div>
               </div>
           </div>
           
           <div className="absolute top-4 right-4 z-20">
              <button onClick={exportSave} className="text-slate-500 hover:text-amber-500 flex items-center gap-1 text-xs uppercase font-bold">
                  <Download size={12} /> Backup
              </button>
           </div>
       </div>
       
       {/* Personal Records */}
       <div className="bg-slate-900 border border-slate-700 p-6">
           <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 border-b border-slate-800 pb-2 flex items-center gap-2"><Trophy size={14}/> Personal Records</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-3 bg-slate-950 rounded border border-slate-800">
                   <p className="text-[10px] text-slate-500 uppercase mb-1">Longest Streak</p>
                   <p className="text-lg font-bold text-amber-500 flex items-center gap-1"><Flame size={14}/> {personalRecords.longestStreak} Days</p>
               </div>
               <div className="p-3 bg-slate-950 rounded border border-slate-800">
                   <p className="text-[10px] text-slate-500 uppercase mb-1">Lowest Weight</p>
                   <p className="text-lg font-bold text-blue-400 flex items-center gap-1"><Weight size={14}/> {personalRecords.lowestWeight} kg</p>
               </div>
               <div className="p-3 bg-slate-950 rounded border border-slate-800">
                   <p className="text-[10px] text-slate-500 uppercase mb-1">Max Daily LP</p>
                   <p className="text-lg font-bold text-emerald-400 flex items-center gap-1"><TrendingUp size={14}/> +{personalRecords.highestDailyLp}</p>
               </div>
               <div className="p-3 bg-slate-950 rounded border border-slate-800">
                   <p className="text-[10px] text-slate-500 uppercase mb-1">Best Sleep</p>
                   <p className="text-lg font-bold text-purple-400 flex items-center gap-1"><Moon size={14}/> {personalRecords.bestSleep} hrs</p>
               </div>
           </div>
       </div>

       {/* Mastery */}
       <div>
           <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 border-b border-slate-800 pb-2">Habit Mastery</h3>
           <div className="flex flex-wrap justify-around gap-6 bg-slate-900/50 p-6 border border-slate-800">
               {renderMasteryRing('Diet', mastery.calories, <Flame size={24} />)}
               {renderMasteryRing('Sleep', mastery.sleep, <Moon size={24} />)}
               {renderMasteryRing('Activity', mastery.steps, <Footprints size={24} />)}
               {renderMasteryRing('Body', mastery.weight, <Weight size={24} />)}
           </div>
       </div>

       {/* Badges */}
       <div>
           <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 border-b border-slate-800 pb-2">Honor Badges</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {badges.map(badge => {
                   const unlocked = !!badge.unlockedAt;
                   return (
                       <div key={badge.id} className={`p-4 border rounded flex flex-col items-center text-center gap-2 transition-all ${unlocked ? 'bg-slate-900 border-amber-900/50 opacity-100' : 'bg-slate-950 border-slate-800 opacity-50 grayscale'}`}>
                           <div className="text-2xl">{badge.icon}</div>
                           <div>
                               <p className={`text-xs font-bold uppercase ${unlocked ? 'text-amber-500' : 'text-slate-600'}`}>{badge.name}</p>
                               <p className="text-[10px] text-slate-500 leading-tight mt-1">{badge.description}</p>
                           </div>
                           {!unlocked && (
                               <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                   <div className="h-full bg-slate-600" style={{ width: `${Math.min(100, (badge.progress / badge.target) * 100)}%` }} />
                               </div>
                           )}
                       </div>
                   );
               })}
           </div>
       </div>
    </div>
  );
};