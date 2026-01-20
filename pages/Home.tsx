import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { QUOTES, FAITH_QUOTES, WHY_TEMPLATES } from '../constants';
import { Footprints, Flame, Activity, TrendingUp, Trophy, ArrowRight, Plus, Coins, Zap, Moon, Book, Sun, Anchor, Swords, ScrollText, UserCheck, Target } from 'lucide-react';
import { DayStatus } from '../types';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

const QuickActionCard = ({ title, subtitle, icon, onClick, colorClass }: { title: string, subtitle: string, icon: React.ReactNode, onClick: () => void, colorClass?: string }) => (
  <button 
    onClick={onClick}
    className={`bg-slate-900 hover:bg-slate-800 border border-slate-700 p-4 text-left transition-all group relative overflow-hidden ${colorClass || ''}`}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
  >
    <div className="flex justify-between items-start mb-2 text-slate-400 group-hover:text-amber-400 transition-colors">
       {icon}
       <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
    </div>
    <p className="font-bold text-slate-200 text-sm uppercase tracking-wide">{title}</p>
    <p className="text-[10px] text-slate-500 uppercase mt-1">{subtitle}</p>
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
  </button>
);

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { profile, logs, rank, activity, getDayStatus, userQuotes, addQuote, readiness, isPromotionMode, weeklyPlan, setWeeklyPlan } = useGame();
  const [showQuoteInput, setShowQuoteInput] = useState(false);
  const [newQuote, setNewQuote] = useState("");
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [tempPromise, setTempPromise] = useState("");
  
  // Date Logic
  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs[today] || {};
  const dayOfMonth = new Date().getDate();

  // Momentum
  const getMomentum = () => {
    const dates = Object.keys(logs).sort().reverse().slice(0, 7);
    if (dates.length < 2) return { weight: 'Stable', steps: 'Stable', sleep: 'Stable' };
    
    const latest = logs[dates[0]];
    const oldest = logs[dates[dates.length - 1]];
    
    const weightTrend = (latest.weight || 0) < (oldest.weight || 0) ? 'Down' : (latest.weight || 0) > (oldest.weight || 0) ? 'Up' : 'Stable';
    const avgSteps7 = dates.reduce((acc, d) => acc + (logs[d].steps || 0), 0) / dates.length;
    const stepsTrend = (todayLog.steps || 0) > avgSteps7 ? 'Up' : 'Stable';
    const avgSleep7 = dates.reduce((acc, d) => acc + (logs[d].sleepHours || 0), 0) / dates.length;
    const sleepTrend = (todayLog.sleepHours || 0) > avgSleep7 ? 'Up' : 'Stable';

    return { weight: weightTrend, steps: stepsTrend, sleep: sleepTrend };
  };

  const momentum = getMomentum();
  
  // Content Rotation
  const allQuotes = [...QUOTES, ...userQuotes];
  const quote = allQuotes[dayOfMonth % allQuotes.length];
  const faithQuote = FAITH_QUOTES[dayOfMonth % FAITH_QUOTES.length];
  const whyTemplate = WHY_TEMPLATES[dayOfMonth % WHY_TEMPLATES.length];

  // Logic for Next Best Action
  const getNextAction = () => {
      if (!todayLog.calories) return { label: 'Log Calories', type: 'calories' };
      if (!todayLog.weight) return { label: 'Log Weight', type: 'weight' };
      if (!todayLog.sleepHours) return { label: 'Log Sleep', type: 'sleep' };
      return { label: 'View Quests', type: 'quests', link: 'quests' };
  };
  const nextAction = getNextAction();

  // Helper components
  const StatusDot = ({ status }: { status?: DayStatus }) => {
     let color = 'bg-slate-600';
     if (status === 'green') color = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
     if (status === 'yellow') color = 'bg-yellow-500';
     if (status === 'red') color = 'bg-red-500';
     return <div className={`w-2 h-2 rounded-full ${color}`} />;
  };

  const getSleepStatusColor = () => {
      if (!todayLog.sleepHours) return 'text-slate-500';
      if (todayLog.sleepHours >= (profile?.sleepTargetHours || 8)) return 'text-emerald-400';
      if (todayLog.sleepHours >= (profile?.sleepTargetHours || 8) - 1) return 'text-yellow-400';
      return 'text-red-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 0) Promotion Banner */}
      {isPromotionMode && (
          <div className="bg-gradient-to-r from-red-900/40 via-red-600/20 to-red-900/40 border-y border-red-500 p-3 text-center animate-pulse">
              <span className="text-red-100 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <Swords size={18} /> Promotion Series Imminent - High Stakes Active <Swords size={18} />
              </span>
          </div>
      )}

      {/* A) Top Row: Readiness & Faith/Coach */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Readiness Card */}
          <div className="bg-slate-900 border border-slate-700 p-6 relative overflow-hidden group">
              <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Daily Readiness</h4>
              <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold uppercase ${readiness === 'Ready' ? 'text-emerald-400' : readiness === 'Fair' ? 'text-amber-400' : 'text-red-400'}`}>
                      {readiness}
                  </span>
                  <div className="flex-1 pb-2 flex gap-1">
                      <div className={`h-1 flex-1 rounded-full ${readiness === 'Low' || readiness === 'Fair' || readiness === 'Ready' ? 'bg-current opacity-100' : 'bg-slate-800'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${readiness === 'Fair' || readiness === 'Ready' ? 'bg-current opacity-100' : 'bg-slate-800'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${readiness === 'Ready' ? 'bg-current opacity-100' : 'bg-slate-800'}`}></div>
                  </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Based on yesterday's sleep, fuel, and activity.</p>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sun size={48} />
              </div>
          </div>

          {/* Coach / Faith Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-900/30 p-6 flex items-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-600/50" />
               <div className="z-10 w-full">
                   <div className="flex justify-between items-start">
                       <h4 className="text-amber-600 text-xs font-bold uppercase mb-2 flex items-center gap-2"><UserCheck size={14}/> Coach's Eye</h4>
                       {weeklyPlan && <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">Week Focus: {weeklyPlan.focus}</span>}
                   </div>
                   {todayLog.coachLine ? (
                       <p className="text-slate-200 font-medium text-lg italic leading-relaxed">"{todayLog.coachLine}"</p>
                   ) : (
                       <p className="text-slate-500 font-medium text-lg italic leading-relaxed">"Awaiting today's data to analyze performance."</p>
                   )}
                   {profile?.showFaithQuotes && (
                       <p className="text-amber-500/60 text-xs mt-3 font-bold tracking-wide border-t border-slate-800 pt-2 flex items-center gap-2"><Book size={10}/> {faithQuote.text}</p>
                   )}
               </div>
          </div>
      </div>
      
      {/* Weekly Plan Card (If not set, prompt) */}
      {!weeklyPlan ? (
          <button onClick={() => setIsPlanModalOpen(true)} className="w-full bg-slate-900 border border-dashed border-slate-700 p-4 text-center hover:bg-slate-800 transition-colors">
              <p className="text-amber-500 font-bold uppercase text-sm flex items-center justify-center gap-2"><Target size={16}/> Set Weekly Plan</p>
          </button>
      ) : (
          <div className="bg-slate-900 border border-slate-700 p-4 flex items-center justify-between">
              <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold">Weekly Promise</h4>
                  <p className="text-slate-200 italic">"{weeklyPlan.promise}"</p>
              </div>
              <button onClick={() => setIsPlanModalOpen(true)} className="text-xs text-slate-500 hover:text-white underline">Edit</button>
          </div>
      )}

      {/* B) Today's Mission Row */}
      <div className="bg-slate-900 border border-slate-700 p-4 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          
          {/* Cals */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="p-3 bg-slate-950 rounded border border-slate-800 text-orange-500"><Flame size={20} /></div>
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Calories</p>
                <div className="flex items-center gap-2">
                   <span className={`text-xl font-bold font-mono ${todayLog.calories && todayLog.calories > profile!.calorieTarget ? 'text-red-400' : 'text-slate-200'}`}>
                     {todayLog.calories || '--'}
                   </span>
                   <span className="text-xs text-slate-500">/ {profile?.calorieTarget}</span>
                   {todayLog.calories && <StatusDot status={todayLog.calories <= profile!.calorieTarget ? 'green' : 'red'} />}
                </div>
             </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="p-3 bg-slate-950 rounded border border-slate-800 text-emerald-500"><Footprints size={20} /></div>
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Steps</p>
                <div className="flex items-center gap-2">
                   <span className="text-xl font-bold font-mono text-slate-200">{todayLog.steps || '--'}</span>
                   <span className="text-xs text-slate-500">/ {profile?.targetSteps}</span>
                </div>
             </div>
          </div>

          {/* Sleep */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="p-3 bg-slate-950 rounded border border-slate-800 text-purple-500"><Moon size={20} /></div>
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Sleep</p>
                <div className="flex items-center gap-2">
                   <span className={`text-xl font-bold font-mono ${getSleepStatusColor()}`}>
                       {todayLog.sleepHours || '--'}
                   </span>
                   <span className="text-xs text-slate-500">/ {profile?.sleepTargetHours}h</span>
                </div>
             </div>
          </div>

          {/* Rank */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="p-3 bg-slate-950 rounded border border-slate-800 text-blue-500"><Trophy size={20} /></div>
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Rank Progress</p>
                <div className="flex items-center gap-2">
                   <span className="text-xl font-bold font-mono text-slate-200">{rank.lp} LP</span>
                   <span className="text-xs text-slate-500">/ 100</span>
                </div>
             </div>
          </div>
          
          {/* Next Best Action Button */}
          <button 
             onClick={() => {
                 if (nextAction.link) onNavigate(nextAction.link);
                 else {
                    document.querySelector('button[aria-label="Global Add"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                 }
             }}
             className="hidden md:flex bg-amber-600 hover:bg-amber-500 text-slate-900 px-4 h-10 items-center justify-center rounded border border-amber-400 shadow-lg shadow-amber-900/40 font-bold uppercase text-xs"
          >
             {nextAction.label}
          </button>
      </div>

      {/* C) 7 Day Momentum */}
      <div className="bg-slate-900/80 border border-slate-700 p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center border-r border-slate-800 last:border-0">
             <p className="text-xs text-slate-500 uppercase mb-2">Weight Trend (7d)</p>
             <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${momentum.weight === 'Down' ? 'text-green-400' : momentum.weight === 'Up' ? 'text-red-400' : 'text-slate-400'}`}>
                {momentum.weight} {momentum.weight === 'Down' ? <TrendingUp className="rotate-180" /> : <Activity />}
             </div>
          </div>
          <div className="text-center border-r border-slate-800 last:border-0">
             <p className="text-xs text-slate-500 uppercase mb-2">Step Activity</p>
             <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${momentum.steps === 'Up' ? 'text-green-400' : 'text-slate-400'}`}>
                {momentum.steps} <Zap size={20} fill="currentColor" />
             </div>
          </div>
          <div className="text-center border-r border-slate-800 last:border-0">
             <p className="text-xs text-slate-500 uppercase mb-2">Sleep Rhythm</p>
             <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${momentum.sleep === 'Up' ? 'text-green-400' : 'text-slate-400'}`}>
                {momentum.sleep} <Moon size={20} />
             </div>
          </div>
          <div className="text-center">
             <p className="text-xs text-slate-500 uppercase mb-2">Win Streak</p>
             <div className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-2">
                {rank.streak} <span className="text-sm text-slate-500 uppercase">Days</span>
             </div>
          </div>
      </div>

      {/* D) Quick Actions - Fixed */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <QuickActionCard 
            title="Daily Match" 
            subtitle="Active Quests" 
            icon={<Zap size={20} />} 
            onClick={() => onNavigate('quests')} 
            colorClass="border-l-4 border-l-amber-500"
         />
         <QuickActionCard 
            title="View Quests" 
            subtitle="Weekly & Season" 
            icon={<ScrollText size={20} />} 
            onClick={() => onNavigate('quests')} 
         />
         <QuickActionCard 
            title="Rank Progress" 
            subtitle="Ladder Status" 
            icon={<Trophy size={20} />} 
            onClick={() => onNavigate('rank')} 
         />
         <QuickActionCard 
            title="View Stats" 
            subtitle="Performance" 
            icon={<Activity size={20} />} 
            onClick={() => onNavigate('stats')} 
         />
      </div>
      
      {/* Weekly Plan Modal */}
      {isPlanModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-600 p-6 w-full max-w-md">
                  <h3 className="text-amber-500 font-bold uppercase mb-4">Set Weekly Plan</h3>
                  <p className="text-slate-400 text-sm mb-4">Focus your energy for the week ahead.</p>
                  
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-700 p-3 text-slate-200 outline-none focus:border-amber-500 mb-4 h-24"
                    placeholder="I promise to..."
                    value={tempPromise}
                    onChange={(e) => setTempPromise(e.target.value)}
                  />
                  
                  <div className="flex gap-2">
                      <button onClick={() => setIsPlanModalOpen(false)} className="flex-1 py-2 text-slate-400 text-xs font-bold uppercase border border-slate-700 hover:bg-slate-800">Cancel</button>
                      <button onClick={() => { if(tempPromise) { setWeeklyPlan(tempPromise); setIsPlanModalOpen(false); } }} className="flex-1 py-2 bg-amber-600 text-slate-900 text-xs font-bold uppercase hover:bg-amber-500">Commit</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};