import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ChevronLeft, ChevronRight, BookOpen, Plane, AlertCircle, PartyPopper, Briefcase, Info } from 'lucide-react';
import { DailyLog, DayStatus, LifeEventTag } from '../types';

export const Calendar: React.FC = () => {
  const { logs, getDayStatus, addLog } = useGame();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  
  // Reflection State
  const [reflectionText, setReflectionText] = useState("");
  const [activeTag, setActiveTag] = useState<LifeEventTag>('None');

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month); 

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const openDay = (dateStr: string) => {
      setSelectedDay(dateStr);
      const log = logs[dateStr];
      setReflectionText(log?.reflection || "");
      setActiveTag(log?.lifeEventTag || 'None');
  };

  const saveDayDetails = () => {
      if (selectedDay) {
          addLog({ 
              date: selectedDay, 
              reflection: reflectionText,
              lifeEventTag: activeTag 
          });
          setSelectedDay(null);
      }
  };

  const renderTagIcon = (tag?: LifeEventTag) => {
      switch(tag) {
          case 'Travel': return <Plane size={10} className="text-blue-400" />;
          case 'Sick': return <AlertCircle size={10} className="text-red-400" />;
          case 'Celebration': return <PartyPopper size={10} className="text-purple-400" />;
          case 'Stress': return <AlertCircle size={10} className="text-orange-400" />;
          case 'Work': return <Briefcase size={10} className="text-slate-400" />;
          default: return null;
      }
  };

  const cells = [];
  for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`pad-${i}`} className="bg-slate-950/50 border border-slate-900 h-16 sm:h-20"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logs[dateStr];
      const status = getDayStatus(dateStr);
      
      let bgClass = 'bg-slate-900';
      let borderClass = 'border-slate-800';
      
      if (status === 'green') { bgClass = 'bg-emerald-950/30'; borderClass = 'border-emerald-600/50'; }
      else if (status === 'yellow') { bgClass = 'bg-yellow-950/30'; borderClass = 'border-yellow-600/50'; }
      else if (status === 'red') { bgClass = 'bg-red-950/30'; borderClass = 'border-red-600/50'; }

      cells.push(
          <div key={d} onClick={() => openDay(dateStr)} className={`${bgClass} border ${borderClass} h-16 sm:h-20 p-1 relative group transition-colors hover:bg-slate-800 cursor-pointer flex flex-col justify-between`}>
              <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold ${status === 'gray' ? 'text-slate-600' : 'text-slate-300'}`}>{d}</span>
                  {log?.lifeEventTag && log.lifeEventTag !== 'None' && (
                      <div className="bg-slate-950 p-0.5 rounded-full border border-slate-700">{renderTagIcon(log.lifeEventTag)}</div>
                  )}
              </div>
              
              {log && (
                  <div className="flex gap-1 flex-wrap content-end">
                      {log.weight && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Weight Logged"></div>}
                      {log.calories && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Calories Logged"></div>}
                      {log.sleepHours && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Sleep Logged"></div>}
                  </div>
              )}
              
              {log?.reflection && (
                  <div className="absolute top-1 right-1 text-slate-600">
                      <BookOpen size={8} />
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="space-y-2 h-full flex flex-col relative animate-in fade-in duration-300">
       <div className="flex justify-between items-center bg-slate-900 p-2 border border-slate-700">
         <button onClick={prevMonth} className="text-slate-400 hover:text-white p-1"><ChevronLeft size={16}/></button>
         <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm">{monthNames[month]} {year}</h3>
         <div className="flex gap-2">
             <button onClick={() => setShowLegend(!showLegend)} className={`p-1 ${showLegend ? 'text-amber-400' : 'text-slate-400'} hover:text-white`}><Info size={16}/></button>
             <button onClick={nextMonth} className="text-slate-400 hover:text-white p-1"><ChevronRight size={16}/></button>
         </div>
       </div>

       {showLegend && (
           <div className="bg-slate-900/90 border border-slate-700 p-2 text-[10px] grid grid-cols-3 gap-2 text-slate-400">
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"/> Victory</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"/> Draw</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"/> Defeat</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"/> Cal Log</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"/> Wt Log</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full"/> Slp Log</div>
           </div>
       )}

       <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-700 shadow-xl">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="bg-slate-950 p-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {day}
              </div>
          ))}
          {cells}
       </div>

       {selectedDay && (
           <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-slate-900 border border-amber-600/50 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                   <h3 className="text-slate-200 font-bold uppercase mb-4 text-center border-b border-slate-800 pb-2">{selectedDay} Details</h3>
                   
                   <div className="mb-4">
                       <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Life Event Tag</label>
                       <div className="flex gap-2 flex-wrap">
                           {['None', 'Travel', 'Sick', 'Stress', 'Celebration', 'Work'].map(tag => (
                               <button 
                                key={tag} 
                                onClick={() => setActiveTag(tag as LifeEventTag)}
                                className={`px-2 py-1 text-xs border rounded ${activeTag === tag ? 'bg-amber-600 text-slate-900 border-amber-600' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                               >
                                   {tag}
                               </button>
                           ))}
                       </div>
                   </div>

                   <div className="mb-6">
                       <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Daily Reflection</label>
                       <textarea 
                           className="w-full bg-slate-950 border border-slate-700 p-3 text-slate-300 text-sm h-24 focus:border-amber-500 outline-none"
                           placeholder="What went well? What challenged you?"
                           value={reflectionText}
                           onChange={(e) => setReflectionText(e.target.value)}
                       />
                   </div>

                   <div className="flex gap-4">
                       <button onClick={() => setSelectedDay(null)} className="flex-1 py-2 bg-slate-800 text-slate-400 text-xs font-bold uppercase hover:bg-slate-700">Close</button>
                       <button onClick={saveDayDetails} className="flex-1 py-2 bg-amber-600 text-slate-900 text-xs font-bold uppercase hover:bg-amber-500">Save Journal</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};