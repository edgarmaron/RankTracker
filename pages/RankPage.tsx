import React from 'react';
import { useGame } from '../context/GameContext';
import { RankEmblem } from '../components/RankEmblem';
import { TIER_COLORS, SCORING, TIERS_ORDER, DIVISIONS_ORDER } from '../constants';
import { Shield, TrendingUp, History, Lock, Check, Swords, Star, AlertTriangle, Crosshair, Calendar, Zap, Flame } from 'lucide-react';
import { Tier, Division, DailyLog } from '../types';

interface RankPageProps {
  onNavigate: (tab: string) => void;
}

export const RankPage: React.FC<RankPageProps> = ({ onNavigate }) => {
  const { rank, insights, isPromotionMode, logs, split, profile } = useGame();
  
  const colors = TIER_COLORS[rank.tier];

  const flattenRanks = () => {
      const list: { tier: Tier, div: Division, name: string }[] = [];
      TIERS_ORDER.forEach(t => {
          if (t === Tier.MASTER || t === Tier.GRANDMASTER || t === Tier.CHALLENGER) {
              list.push({ tier: t, div: Division.NONE, name: t });
          } else {
              [Division.IV, Division.III, Division.II, Division.I].forEach(d => {
                  list.push({ tier: t, div: d, name: `${t} ${d}` });
              });
          }
      });
      return list;
  };

  const ladder = flattenRanks();
  const currentIndex = ladder.findIndex(l => l.tier === rank.tier && l.div === rank.division);
  const nextMilestones = ladder.slice(currentIndex + 1, currentIndex + 4);
  const prevMilestones = ladder.slice(Math.max(0, currentIndex - 2), currentIndex);
  
  // Stats
  const logArray = (Object.values(logs) as DailyLog[]).sort((a,b) => b.date.localeCompare(a.date));
  const recentLogs = logArray.slice(0, 14);
  const weeklyLogs = logArray.slice(0, 7);
  
  const lpGainedWeek = weeklyLogs.reduce((acc, l) => acc + (l.lpChange || 0), 0);
  const estDays = (100 - rank.lp) / (Math.max(1, lpGainedWeek / 7));
  const greenStreak = rank.streak;
  
  // Analysis
  const performAnalysis = () => {
      if (logArray.length < 5) return null;
      
      const negativeLogs = recentLogs.filter(l => (l.lpChange || 0) < 0);
      const missedCals = negativeLogs.filter(l => !l.calories).length;
      const overCals = negativeLogs.filter(l => l.calories && l.calories > (profile?.calorieTarget || 2000)).length;
      
      let leak = "None";
      if (missedCals > overCals) leak = "Missing Logs";
      else if (overCals > 0) leak = "Over Calorie Target";
      else if (negativeLogs.length > 0) leak = "Weight Fluctuations";

      const bestHabit = "Logging"; // Simplified logic for MVP

      return { leak, bestHabit, suggestion: leak === "Missing Logs" ? "Focus on logging every meal." : "Try to stay under calorie limits." };
  };
  
  const analysis = performAnalysis();

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 pt-4 animate-in fade-in zoom-in duration-500">
      
      {/* Left Column: Current Status */}
      <div className="flex-1 flex flex-col items-center space-y-6">
        
        {/* Banner */}
        {isPromotionMode && (
             <div className="w-full bg-red-900/50 border border-red-500 p-2 text-center">
                 <p className="text-red-200 text-xs font-bold uppercase tracking-widest animate-pulse">Promotion Series Active (x2 LP)</p>
             </div>
        )}

        {/* Header */}
        <div className="text-center">
            <div className="relative group mb-4 inline-block">
                <div className={`absolute inset-0 ${colors.bg} blur-3xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity`} />
                <RankEmblem tier={rank.tier} division={rank.division} size="lg" className="z-10" />
            </div>
            <h2 className={`text-4xl font-bold uppercase tracking-widest ${colors.text} drop-shadow-md`}>{rank.tier} {rank.division}</h2>
            <p className="text-slate-400 font-medium tracking-wide">League of Fitness</p>
        </div>

        {/* Snapshot Row */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-slate-900 border border-slate-700 p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Current LP</p>
                <p className="text-xl font-bold text-slate-200">{rank.lp} <span className="text-xs text-slate-500">/ 100</span></p>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Weekly Gain</p>
                <p className={`text-xl font-bold ${lpGainedWeek >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{lpGainedWeek > 0 ? '+' : ''}{lpGainedWeek}</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Active Streak</p>
                <p className="text-xl font-bold text-amber-500 flex justify-center items-center gap-1"><Flame size={16} /> {greenStreak}</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Target In</p>
                <p className="text-xl font-bold text-blue-400">~{Math.ceil(estDays) || '--'}d</p>
            </div>
        </div>

        {/* LP Bar */}
        <div className="w-full max-w-md relative">
            <div className="h-4 bg-slate-900 border border-slate-700 skew-x-[-15deg] overflow-hidden relative">
                <div className={`h-full ${colors.bg} transition-all duration-1000 border-r ${colors.border}`} style={{ width: `${rank.lp}%` }} />
            </div>
        </div>

        {/* Performance Analysis */}
        <div className="w-full bg-slate-900/80 border border-slate-700 p-6 relative overflow-hidden">
             <h3 className="text-amber-500 font-bold uppercase text-xs mb-4 flex items-center gap-2">
                <Star size={14} /> Performance Analysis (14d)
             </h3>
             {analysis ? (
                 <div className="space-y-4 text-sm">
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-400">Main Leak</span>
                         <span className="text-red-400 font-bold">{analysis.leak}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-400">Best Habit</span>
                         <span className="text-emerald-400 font-bold">{analysis.bestHabit}</span>
                     </div>
                     <div className="bg-slate-950 p-3 border-l-2 border-amber-500 text-slate-300 italic">
                         "{analysis.suggestion}"
                     </div>
                 </div>
             ) : (
                 <p className="text-slate-500 text-sm italic">Log at least 5 days to unlock insights.</p>
             )}
        </div>
      </div>

      {/* Right Column: Ladder & Rules */}
      <div className="flex-1 space-y-6">
         
         {/* Next Milestone */}
         <div className="bg-slate-900 border border-slate-700 p-4 flex items-center justify-between">
             <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Next Milestone</p>
                 <p className="text-lg text-slate-200 font-bold">{nextMilestones[0]?.name || 'Champion'}</p>
             </div>
             <button onClick={() => onNavigate('history')} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase text-slate-300 border border-slate-600">
                 View History
             </button>
         </div>

         {/* Rules */}
         <div className="bg-slate-900 border border-slate-700 p-6">
             <h3 className="text-slate-300 font-bold uppercase text-xs mb-4 flex items-center gap-2"><Crosshair size={14}/> Ranked Rules</h3>
             <div className="space-y-3 text-xs text-slate-400">
                 <div className="flex justify-between">
                     <span>Win (Green Day)</span>
                     <span className="text-emerald-400 font-mono">+{SCORING.LP_WIN_PERFECT} LP</span>
                 </div>
                 <div className="flex justify-between">
                     <span>Draw (Yellow Day)</span>
                     <span className="text-yellow-500 font-mono">+{SCORING.LP_WIN_OK} LP</span>
                 </div>
                 <div className="flex justify-between">
                     <span>Loss (Red Day)</span>
                     <span className="text-red-500 font-mono">{SCORING.LP_LOSS_SEVERE} LP</span>
                 </div>
                 <div className="mt-2 pt-2 border-t border-slate-800">
                     <p className="mb-1">• Sleep & Steps affect Quest rewards, not base LP.</p>
                     <p>• Promotion Series doubles all gains & losses.</p>
                 </div>
             </div>
         </div>

         {/* Season Stats */}
         <div className="bg-slate-900 border border-slate-700 p-6">
             <h3 className="text-slate-300 font-bold uppercase text-xs mb-4 flex items-center gap-2"><Calendar size={14}/> Season Stats</h3>
             <p className="text-amber-500 font-bold text-sm mb-2">{split.name}</p>
             <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-400">
                 <span>Promotions:</span> <span className="text-slate-200 text-right">0</span>
                 <span>Red Days:</span> <span className="text-red-400 text-right">{logArray.filter(l => l.matchResult === 'Defeat').length}</span>
                 <span>Best Streak:</span> <span className="text-emerald-400 text-right">{rank.streak}</span>
             </div>
         </div>

         {/* Recent Matches */}
         <div className="bg-slate-900/80 border border-slate-700 p-6">
            <h3 className="text-slate-400 font-bold uppercase text-xs mb-4 flex items-center gap-2">
               <History size={14} /> Recent Matches
            </h3>
            <div className="space-y-2">
                 {recentLogs.slice(0, 5).map((log, i) => (
                     <div key={i} className="flex justify-between items-center text-xs p-2 hover:bg-slate-800 transition-colors cursor-default">
                         <span className="text-slate-500 font-mono">{log.date}</span>
                         <span className={`font-bold uppercase ${log.matchResult === 'Victory' ? 'text-emerald-500' : log.matchResult === 'Defeat' ? 'text-red-500' : 'text-yellow-500'}`}>
                             {log.matchResult || 'Draw'}
                         </span>
                         <span className={`font-mono ${(log.lpChange || 0) >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                             {log.lpChange && log.lpChange > 0 ? '+' : ''}{log.lpChange || 0} LP
                         </span>
                     </div>
                 ))}
                 {recentLogs.length === 0 && <p className="text-slate-600 text-xs">No matches played.</p>}
            </div>
         </div>

      </div>
    </div>
  );
};