import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ReferenceLine } from 'recharts';
import { DailyLog, DayStatus } from '../types';
import { Brain, Flame } from 'lucide-react';

export const Statistics: React.FC = () => {
  const { logs, profile, getDayStatus, consistencyScore, insights } = useGame();
  const [filterRed, setFilterRed] = useState(false);
  const [filterLowSleep, setFilterLowSleep] = useState(false);

  // Prep Data
  const data = (Object.values(logs) as DailyLog[])
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => {
        const prevDate = new Date(log.date);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        const prevLog = logs[prevDateStr];
        const weightDelta = (log.weight && prevLog?.weight) ? log.weight - prevLog.weight : 0;

        return {
            ...log,
            targetWeight: profile?.targetWeight,
            calorieTarget: profile?.calorieTarget,
            sleepTarget: profile?.sleepTargetHours || 8,
            status: getDayStatus(log.date),
            weightDelta
        };
    });

  const last30 = data.slice(-30);
  
  // Daily Numbers Calc
  const avgCals = last30.reduce((acc, d) => acc + (d.calories || 0), 0) / (last30.filter(d => d.calories).length || 1);
  const avgSteps = last30.reduce((acc, d) => acc + (d.steps || 0), 0) / (last30.filter(d => d.steps).length || 1);
  const avgSleep = last30.reduce((acc, d) => acc + (d.sleepHours || 0), 0) / (last30.filter(d => d.sleepHours).length || 1);
  const percentUnder = Math.round((last30.filter(d => d.calories && d.calories <= (profile?.calorieTarget || 2000)).length / (last30.filter(d => d.calories).length || 1)) * 100);

  // Filtered Table Data
  let tableData = [...data].reverse().slice(0, 14);
  if (filterRed) {
      tableData = tableData.filter(d => d.status === 'red');
  }
  if (filterLowSleep) {
      tableData = tableData.filter(d => d.sleepHours && d.sleepHours < (profile?.sleepTargetHours || 8));
  }

  // Heatmap generation (Last 28 days for 4 weeks grid)
  const renderHeatmap = () => {
      const heatmapDays = [];
      const today = new Date();
      for (let i = 27; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const status = getDayStatus(dateStr);
          let bg = 'bg-slate-900';
          if (status === 'green') bg = 'bg-emerald-500';
          if (status === 'yellow') bg = 'bg-yellow-500';
          if (status === 'red') bg = 'bg-red-500';
          
          heatmapDays.push(
              <div key={dateStr} className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${bg} border border-slate-800/50`} title={`${dateStr}: ${status}`} />
          );
      }
      return heatmapDays;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Row: Consistency & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-700 p-6 flex flex-col items-center justify-center">
              <h4 className="text-slate-500 text-xs font-bold uppercase mb-4">Consistency Score</h4>
              <div className="relative flex items-center justify-center w-32 h-32">
                 <svg className="w-full h-full transform -rotate-90">
                     <circle cx="64" cy="64" r="56" fill="none" stroke="#1e293b" strokeWidth="8" />
                     <circle 
                        cx="64" cy="64" r="56" fill="none" stroke={consistencyScore >= 80 ? '#10b981' : consistencyScore >= 50 ? '#f59e0b' : '#ef4444'} 
                        strokeWidth="8" 
                        strokeDasharray={351} 
                        strokeDashoffset={351 - (351 * consistencyScore) / 100}
                        className="transition-all duration-1000"
                     />
                 </svg>
                 <span className="absolute text-3xl font-bold text-slate-200">{consistencyScore}</span>
              </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-700 p-6">
              <h4 className="text-slate-500 text-xs font-bold uppercase mb-4 flex items-center gap-2"><Brain size={14} /> Automated Insights</h4>
              <div className="space-y-3">
                  {insights.length === 0 ? (
                      <p className="text-slate-600 text-sm">Not enough data to generate patterns yet.</p>
                  ) : (
                      insights.map((insight, i) => (
                          <div key={i} className={`p-3 border-l-4 ${insight.type === 'strength' ? 'border-emerald-500 bg-emerald-950/20' : insight.type === 'weakness' ? 'border-red-500 bg-red-950/20' : 'border-slate-500 bg-slate-900'} text-sm text-slate-300`}>
                              {insight.text}
                          </div>
                      ))
                  )}
              </div>
              <div className="mt-6">
                  <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">30 Day Heatmap</h4>
                  <div className="flex gap-1 flex-wrap">
                      {renderHeatmap()}
                  </div>
              </div>
          </div>
      </div>

      {/* Daily Numbers Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         <div className="bg-slate-900 border border-slate-700 p-4">
             <p className="text-xs text-slate-500 uppercase">Avg Calories</p>
             <p className="text-2xl font-bold text-orange-400">{Math.round(avgCals)}</p>
         </div>
         <div className="bg-slate-900 border border-slate-700 p-4">
             <p className="text-xs text-slate-500 uppercase">Avg Steps</p>
             <p className="text-2xl font-bold text-emerald-400">{Math.round(avgSteps)}</p>
         </div>
         <div className="bg-slate-900 border border-slate-700 p-4">
             <p className="text-xs text-slate-500 uppercase">Avg Sleep</p>
             <p className="text-2xl font-bold text-purple-400">{avgSleep.toFixed(1)}h</p>
         </div>
         <div className="bg-slate-900 border border-slate-700 p-4">
             <p className="text-xs text-slate-500 uppercase">Diet Adherence</p>
             <p className="text-2xl font-bold text-blue-400">{percentUnder}%</p>
         </div>
         <div className="bg-slate-900 border border-slate-700 p-4">
             <p className="text-xs text-slate-500 uppercase">Logs Total</p>
             <p className="text-2xl font-bold text-slate-200">{data.length}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calorie Chart */}
          <div className="bg-slate-900/80 border border-slate-700 p-6 shadow-lg">
            <h3 className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">Calorie Intake vs Target</h3>
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tickFormatter={(val) => val.slice(8)} tick={{fontSize: 10}} />
                <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#f1f5f9' }} />
                <ReferenceLine y={profile?.calorieTarget} stroke="red" strokeDasharray="3 3" />
                <Bar dataKey="calories" fill="#f97316" radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="bg-slate-900/80 border border-slate-700 p-6 shadow-lg">
            <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">Weight Trend</h3>
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" tickFormatter={(val) => val.slice(5)} tick={{fontSize: 10}} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="weight" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={2} />
                <Area type="monotone" dataKey="targetWeight" stroke="#94a3b8" strokeDasharray="5 5" fill="none" strokeWidth={1} />
                </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Chart */}
          <div className="bg-slate-900/80 border border-slate-700 p-6 shadow-lg md:col-span-2">
            <h3 className="text-purple-500 text-xs font-bold uppercase tracking-widest mb-6">Sleep Duration vs Target</h3>
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30}>
                <defs>
                    <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tickFormatter={(val) => val.slice(8)} tick={{fontSize: 10}} />
                <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#f1f5f9' }} />
                <ReferenceLine y={profile?.sleepTargetHours || 8} stroke="#d8b4fe" strokeDasharray="3 3" label="Target" />
                <Area type="step" dataKey="sleepHours" stroke="#a855f7" fill="url(#colorSleep)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>
      </div>

      {/* Scoreboard */}
      <div className="bg-slate-900/80 border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest">Scoreboard (Last 14 Logs)</h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => { setFilterRed(!filterRed); setFilterLowSleep(false); }}
                    className={`text-xs px-2 py-1 border ${filterRed ? 'bg-red-900/50 border-red-500 text-red-200' : 'border-slate-700 text-slate-500'} uppercase font-bold`}
                >
                    {filterRed ? 'Showing Red Days' : 'Filter Red Days'}
                </button>
                <button 
                    onClick={() => { setFilterLowSleep(!filterLowSleep); setFilterRed(false); }}
                    className={`text-xs px-2 py-1 border ${filterLowSleep ? 'bg-purple-900/50 border-purple-500 text-purple-200' : 'border-slate-700 text-slate-500'} uppercase font-bold`}
                >
                    {filterLowSleep ? 'Showing Low Sleep' : 'Filter Low Sleep'}
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950">
                    <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Calories</th>
                        <th className="px-4 py-2">Weight Δ</th>
                        <th className="px-4 py-2">Steps</th>
                        <th className="px-4 py-2">Sleep</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {tableData.length === 0 ? (
                        <tr><td colSpan={6} className="p-4 text-center text-slate-600">No data available</td></tr>
                    ) : (
                        tableData.map((row) => (
                            <tr key={row.date} className="hover:bg-slate-800/50">
                                <td className="px-4 py-2 text-slate-300 font-mono">{row.date}</td>
                                <td className="px-4 py-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        row.status === 'green' ? 'bg-emerald-900 text-emerald-400' :
                                        row.status === 'yellow' ? 'bg-yellow-900 text-yellow-400' :
                                        row.status === 'red' ? 'bg-red-900 text-red-400' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-slate-400">
                                    {row.calories ? (
                                        <div className="flex gap-2 items-center">
                                            <span className={row.calories > (profile?.calorieTarget || 0) ? 'text-red-400' : 'text-green-400'}>
                                                {row.calories}
                                            </span>
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-4 py-2 text-slate-400">
                                    {row.weight ? (
                                        <span className={row.weightDelta > 0 ? 'text-red-400' : row.weightDelta < 0 ? 'text-green-400' : 'text-slate-400'}>
                                           {row.weight} ({row.weightDelta > 0 ? '+' : ''}{row.weightDelta.toFixed(1)})
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="px-4 py-2 text-slate-400">{row.steps || '-'}</td>
                                <td className="px-4 py-2 text-slate-400">
                                    {row.sleepHours ? (
                                        <span className={row.sleepHours >= (profile?.sleepTargetHours || 8) ? 'text-emerald-400' : 'text-purple-400'}>
                                            {row.sleepHours}h
                                        </span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};