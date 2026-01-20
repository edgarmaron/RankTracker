import React from 'react';
import { useGame } from '../context/GameContext';
import { DailyLog } from '../types';
import { History } from 'lucide-react';

export const MatchHistory: React.FC = () => {
  const { logs } = useGame();
  
  const history = (Object.values(logs) as DailyLog[]).sort((a, b) => b.date.localeCompare(a.date));

  const getResultColor = (result?: string) => {
      if (result === 'Victory') return 'border-l-4 border-l-emerald-500 bg-emerald-950/20';
      if (result === 'Defeat') return 'border-l-4 border-l-red-500 bg-red-950/20';
      return 'border-l-4 border-l-yellow-500 bg-yellow-950/20';
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-3">
          <History size={24} className="text-amber-500" /> Match History
      </h2>
      
      <div className="space-y-3">
          {history.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No matches recorded yet. Log your first day to begin.</p>
          ) : (
              history.map(log => (
                  <div key={log.date} className={`p-4 bg-slate-900 border border-slate-800 ${getResultColor(log.matchResult)} transition-all hover:brightness-110 cursor-pointer`}>
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded flex items-center justify-center font-bold text-lg uppercase bg-slate-950 border border-slate-700 ${log.matchResult === 'Victory' ? 'text-emerald-500' : log.matchResult === 'Defeat' ? 'text-red-500' : 'text-yellow-500'}`}>
                                  {log.matchResult === 'Victory' ? 'W' : log.matchResult === 'Defeat' ? 'L' : 'D'}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-200">{log.matchResult || 'Draw'}</p>
                                  <p className="text-xs text-slate-500 font-mono">{log.date}</p>
                              </div>
                          </div>
                          
                          <div className="flex gap-6 text-sm text-slate-400">
                              <div className="text-center">
                                  <span className="block font-bold text-slate-200">{log.calories || '-'}</span>
                                  <span className="text-[10px] uppercase">Cals</span>
                              </div>
                              <div className="text-center">
                                  <span className="block font-bold text-slate-200">{log.steps || '-'}</span>
                                  <span className="text-[10px] uppercase">Steps</span>
                              </div>
                              <div className="text-center">
                                  <span className="block font-bold text-slate-200">{log.sleepHours || '-'}h</span>
                                  <span className="text-[10px] uppercase">Sleep</span>
                              </div>
                              <div className="text-center">
                                  <span className={`block font-bold ${(log.lpChange || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {(log.lpChange || 0) > 0 ? '+' : ''}{log.lpChange || 0}
                                  </span>
                                  <span className="text-[10px] uppercase">LP</span>
                              </div>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};