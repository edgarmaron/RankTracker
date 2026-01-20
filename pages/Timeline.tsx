import React from 'react';
import { useGame } from '../context/GameContext';
import { Clock, Medal, Flag, Award, Zap } from 'lucide-react';
import { TimelineEvent } from '../types';

export const Timeline: React.FC = () => {
  const { timelineEvents } = useGame();

  const renderIcon = (type: string) => {
    switch (type) {
        case 'rank': return <Award size={20} className="text-amber-500" />;
        case 'milestone': return <Medal size={20} className="text-emerald-500" />;
        case 'split': return <Flag size={20} className="text-blue-500" />;
        case 'record': return <Zap size={20} className="text-purple-500" />;
        default: return <Clock size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="text-amber-500" />
        <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-widest">Journey Timeline</h2>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-8">
          {timelineEvents.length === 0 ? (
              <p className="ml-8 text-slate-500 italic">Your journey begins now. Log consistent days to write history.</p>
          ) : (
              timelineEvents.map((event) => (
                  <div key={event.id} className="ml-8 relative">
                      <div className="absolute -left-[41px] bg-slate-950 p-1 border border-slate-700 rounded-full">
                          {renderIcon(event.type)}
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded hover:border-slate-600 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                              <h4 className="text-slate-200 font-bold text-sm uppercase">{event.title}</h4>
                              <span className="text-xs text-slate-500 font-mono">{event.date}</span>
                          </div>
                          <p className="text-sm text-slate-400">{event.description}</p>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};