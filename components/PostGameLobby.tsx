import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Trophy, AlertTriangle, Minus, Shield } from 'lucide-react';
import { LOADING_TIPS, SCORING } from '../constants';

export const PostGameLobby: React.FC = () => {
  const { logs, recapDate, closeRecap, rank, profile, useGraceDay } = useGame();
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
  }, [recapDate]);

  if (!recapDate) return null;

  const log = logs[recapDate];
  if (!log) return null;

  const result = log.matchResult || 'Draw';
  const color = result === 'Victory' ? 'text-emerald-500' : result === 'Defeat' ? 'text-red-500' : 'text-yellow-500';
  const borderColor = result === 'Victory' ? 'border-emerald-500' : result === 'Defeat' ? 'border-red-500' : 'border-yellow-500';

  const handleGrace = () => {
      const used = useGraceDay(recapDate);
      if (used) {
          // Recap updates automatically due to context change re-render
      } else {
          alert("Cannot use Grace Day (Insufficient coins or weekly limit reached)");
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4">
      <div className={`w-full max-w-lg bg-slate-900 border-2 ${borderColor} shadow-2xl relative animate-in zoom-in-95 duration-300`}>
          <div className="p-8 text-center">
              <h2 className={`text-5xl font-black uppercase tracking-widest mb-2 ${color} drop-shadow-lg`}>{result}</h2>
              <div className="flex justify-center items-center gap-2 mb-4">
                  <span className="text-slate-400 uppercase text-xs tracking-[0.2em]">{log.date}</span>
              </div>
              
              {log.coachLine && (
                  <div className="mb-6 p-4 bg-slate-950 border-y border-slate-800">
                      <p className="text-slate-300 italic">"{log.coachLine}"</p>
                  </div>
              )}

              <div className="flex justify-center items-center gap-8 mb-8">
                  <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-bold">LP Change</p>
                      <p className={`text-3xl font-mono font-bold ${log.lpChange && log.lpChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {log.lpChange && log.lpChange > 0 ? '+' : ''}{log.lpChange}
                      </p>
                  </div>
                  <div className="w-px h-12 bg-slate-800" />
                  <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Rank</p>
                      <p className="text-xl font-bold text-amber-500">{rank.tier} {rank.division}</p>
                  </div>
              </div>

              <div className="space-y-2 mb-8 text-sm">
                  {log.calories && <div className="flex justify-between px-8 py-2 bg-slate-800/50 rounded"><span className="text-slate-400">Calories</span> <span className="text-slate-200">{log.calories}</span></div>}
                  {log.steps && <div className="flex justify-between px-8 py-2 bg-slate-800/50 rounded"><span className="text-slate-400">Steps</span> <span className="text-slate-200">{log.steps}</span></div>}
              </div>

              {result === 'Defeat' && !log.graceUsed && (
                  <button 
                    onClick={handleGrace}
                    className="w-full py-3 mb-4 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-500/50 text-blue-200 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                      <Shield size={16} /> Use Grace Day (10 Coins)
                  </button>
              )}
              {log.graceUsed && (
                  <div className="mb-4 text-blue-400 font-bold uppercase text-xs">Grace Day Applied</div>
              )}

              <button 
                onClick={closeRecap}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold uppercase tracking-widest transition-all"
              >
                  Continue
              </button>
          </div>
          
          <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
              <p className="text-xs text-slate-500 italic">"{tip}"</p>
          </div>
      </div>
    </div>
  );
};