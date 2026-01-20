import React from 'react';
import { useGame } from '../context/GameContext';
import { ScrollText, CheckCircle, Lock, Coins, Shield } from 'lucide-react';
import { Quest } from '../types';

export const Quests: React.FC = () => {
  const { quests } = useGame();

  const renderQuestCard = (q: Quest) => {
    const isComplete = !!q.completedAt;
    const progressPercent = Math.min(100, (q.progress / q.target) * 100);

    return (
      <div key={q.id} className={`border p-4 relative overflow-hidden group transition-all ${isComplete ? 'bg-slate-900/50 border-emerald-900/50 opacity-75' : 'bg-slate-900 border-slate-700 hover:border-amber-500/50'}`}>
        {isComplete && <div className="absolute inset-0 bg-emerald-500/5" />}
        
        <div className="flex justify-between items-start relative z-10">
           <div>
              <h4 className={`font-bold text-sm uppercase tracking-wide ${isComplete ? 'text-emerald-400' : 'text-slate-200'}`}>{q.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{q.description}</p>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><Shield size={10} /> +{q.rewardLp} LP</span>
              {q.rewardCoins > 0 && (
                  <span className="text-xs font-bold text-yellow-500 flex items-center gap-1"><Coins size={10} /> +{q.rewardCoins}</span>
              )}
           </div>
        </div>

        <div className="mt-4 relative z-10">
           <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Progress</span>
              <span className={isComplete ? 'text-emerald-500' : 'text-slate-300'}>{Math.round(q.progress * 10) / 10} / {q.target}</span>
           </div>
           <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-amber-600'}`} 
                style={{ width: `${progressPercent}%` }}
              />
           </div>
        </div>
        
        {isComplete && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-500/20 rotate-12">
                <CheckCircle size={64} />
            </div>
        )}
      </div>
    );
  };

  const dailyQuests = quests.filter(q => q.frequency === 'daily');
  const weeklyQuests = quests.filter(q => q.frequency === 'weekly');
  const seasonQuests = quests.filter(q => q.frequency === 'season');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex items-center gap-3 mb-6">
          <ScrollText className="text-amber-500" />
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Active Quests</h2>
       </div>

       <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-2">Daily Missions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {dailyQuests.length > 0 ? dailyQuests.map(renderQuestCard) : <div className="text-slate-500 text-sm">No daily quests available.</div>}
          </div>
       </div>

       <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-2">Weekly Objectives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {weeklyQuests.length > 0 ? weeklyQuests.map(renderQuestCard) : <div className="text-slate-500 text-sm">No weekly quests available.</div>}
          </div>
       </div>

       <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">Season Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {seasonQuests.length > 0 ? seasonQuests.map(renderQuestCard) : <div className="text-slate-500 text-sm">No season quests available.</div>}
          </div>
       </div>
    </div>
  );
};