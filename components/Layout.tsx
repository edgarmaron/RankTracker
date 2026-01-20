import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { RankEmblem } from './RankEmblem';
import { Home, BarChart2, Calendar, Award, User, Target, ScrollText, Plus, X, Flame, Footprints, Activity, Moon, History, Zap, Settings, Volume2, VolumeX, Clock, Sunrise, Sunset, Download, Upload, AlertTriangle } from 'lucide-react';
import { DailyLog } from '../types';
import { THEMES } from '../constants';
import { parseBackupFile } from '../utils/backup';
import { BackupFile } from '../schemas/backupSchema';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showSettings: boolean;
  onSettingsToggle: () => void;
}

const NavItem = ({ icon: Icon, label, id, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`group relative flex items-center w-full p-3 mb-1 transition-all duration-300
      ${active 
        ? 'bg-gradient-to-r from-[var(--theme-accent)]/20 to-transparent border-l-4 border-[var(--theme-accent)] text-[var(--theme-text-accent)]' 
        : 'text-slate-400 hover:text-[var(--theme-text-accent)] hover:bg-[var(--theme-bg-secondary)]/50 border-l-4 border-transparent'
      }`}
  >
    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-[var(--theme-accent)]' : 'text-slate-500 group-hover:text-[var(--theme-text-accent)]'}`} />
    <span className="font-medium tracking-wide text-sm uppercase">{label}</span>
    {active && <div className="absolute inset-0 bg-[var(--theme-accent)]/5 blur-sm" />}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, showSettings, onSettingsToggle }) => {
  const { profile, rank, addLog, updateProfile, resetData, exportSave, restoreSave, pings, dismissPing, buyTheme } = useGame();
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logType, setLogType] = useState<'calories' | 'weight' | 'steps' | 'sleep' | null>(null);
  const [value, setValue] = useState('');
  
  // Backup State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restorePreview, setRestorePreview] = useState<BackupFile | null>(null);
  
  // Time of Day Tint
  const [isEvening, setIsEvening] = useState(false);
  useEffect(() => {
      const hour = new Date().getHours();
      const evening = hour >= 18 || hour < 5;
      setIsEvening(evening);
  }, []);

  const currentTheme = THEMES[profile?.currentThemeId || 'default'] || THEMES['default'];
  const tintMode = profile?.tintOverride === 'Auto' ? (isEvening ? 'Evening' : 'Morning') : profile?.tintOverride;
  
  const tintStyle = tintMode === 'Evening' 
    ? `background-blend-mode: multiply; background-color: rgba(15, 23, 42, 0.4);` 
    : `background-blend-mode: overlay; background-color: rgba(255, 247, 237, 0.05);`;

  const themeStyles = `
    :root {
      --theme-bg-primary: ${currentTheme.colors.bgPrimary};
      --theme-bg-secondary: ${currentTheme.colors.bgSecondary};
      --theme-border: ${currentTheme.colors.border};
      --theme-accent: ${currentTheme.colors.accent};
      --theme-text-accent: ${currentTheme.colors.textAccent};
    }
    body { background-color: var(--theme-bg-primary); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--theme-border); }
    .tint-overlay { ${profile?.autoTint ? tintStyle : ''} }
  `;

  const handleSubmit = () => {
    if (!value || !logType) return;
    const num = parseFloat(value);
    const date = new Date().toISOString().split('T')[0];
    const log: DailyLog = { date };
    if (logType === 'calories') log.calories = num;
    if (logType === 'weight') log.weight = num;
    if (logType === 'steps') log.steps = num;
    if (logType === 'sleep') log.sleepHours = num;
    
    addLog(log);
    setValue('');
    setLogType(null);
    setIsLogOpen(false);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const backup = await parseBackupFile(file);
      setRestorePreview(backup);
    } catch(err: any) {
      alert("Invalid backup file: " + err.message);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const confirmRestore = () => {
     if(restorePreview) {
       restoreSave(restorePreview.data);
       setRestorePreview(null);
       onSettingsToggle();
       onTabChange('home');
       alert("Progress restored.");
     }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--theme-bg-primary)] overflow-hidden text-slate-200 selection:bg-[var(--theme-accent)]/30 transition-colors duration-500">
      <style>{themeStyles}</style>
      
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--theme-bg-secondary)] border-r border-[var(--theme-border)] flex flex-col z-20 shadow-xl hidden md:flex transition-colors duration-500">
        <div className="h-16 flex items-center px-6 border-b border-[var(--theme-border)]/50">
          <Target className="w-6 h-6 text-[var(--theme-accent)] mr-2" />
          <h1 className="text-lg font-bold tracking-wider text-slate-100">Summoner's Shape</h1>
        </div>

        <nav className="flex-1 py-6">
          <NavItem icon={Home} label="Overview" id="home" active={activeTab === 'home'} onClick={onTabChange} />
          <NavItem icon={History} label="Match History" id="history" active={activeTab === 'history'} onClick={onTabChange} />
          <NavItem icon={Award} label="Ranked" id="rank" active={activeTab === 'rank'} onClick={onTabChange} />
          <NavItem icon={Clock} label="Timeline" id="timeline" active={activeTab === 'timeline'} onClick={onTabChange} />
          <NavItem icon={User} label="Profile" id="profile" active={activeTab === 'profile'} onClick={onTabChange} />
          <NavItem icon={ScrollText} label="Quests" id="quests" active={activeTab === 'quests'} onClick={onTabChange} />
          <NavItem icon={BarChart2} label="Statistics" id="stats" active={activeTab === 'stats'} onClick={onTabChange} />
          <NavItem icon={Calendar} label="Calendar" id="calendar" active={activeTab === 'calendar'} onClick={onTabChange} />
        </nav>

        <div className="p-4 border-t border-[var(--theme-border)]">
           <div className="bg-[var(--theme-bg-primary)]/50 border border-[var(--theme-border)] p-3 rounded flex items-center gap-3">
              <RankEmblem tier={rank.tier} size="sm" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Current Rank</p>
                <p className="text-[var(--theme-text-accent)] font-bold text-sm">{rank.tier} {rank.division}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] tint-overlay">
        
        {/* Pings Overlay */}
        <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {pings.map(ping => (
                <div key={ping.id} className="pointer-events-auto bg-slate-900/90 backdrop-blur border-l-4 border-amber-500 p-4 shadow-xl animate-in slide-in-from-right w-64 flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-amber-500 uppercase mb-1">System Notification</p>
                        <p className="text-sm text-slate-200">{ping.message}</p>
                    </div>
                    <button onClick={() => dismissPing(ping.id)} className="text-slate-500 hover:text-white"><X size={14}/></button>
                </div>
            ))}
        </div>

        {/* Header */}
        <header className="h-16 bg-[var(--theme-bg-secondary)]/80 backdrop-blur border-b border-[var(--theme-accent)]/20 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-500">
          <h2 className="text-xl font-bold text-slate-100 tracking-widest uppercase">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
             <button onClick={onSettingsToggle} className="text-slate-500 hover:text-[var(--theme-accent)]"><Settings size={20}/></button>
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-[var(--theme-text-accent)]">{profile?.name}</p>
               <p className="text-xs text-slate-400">Level {rank.totalLp > 0 ? Math.floor(rank.totalLp / 100) : 1}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[var(--theme-accent)] flex items-center justify-center">
               <User className="w-5 h-5 text-[var(--theme-text-accent)]" />
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative pb-24 md:pb-8">
           {children}
        </div>
        
        {/* FAB */}
        <button 
            onClick={() => setIsLogOpen(true)}
            aria-label="Global Add" 
            className="fixed bottom-20 md:bottom-8 right-6 md:right-10 w-14 h-14 bg-[var(--theme-accent)] hover:brightness-110 text-slate-900 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] border-2 border-white/20 flex items-center justify-center transition-transform hover:scale-105 z-50 md:z-40"
        >
            <Plus size={32} strokeWidth={3} />
        </button>

        {/* Log Modal */}
        {isLogOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-accent)] w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
                    <button onClick={() => { setIsLogOpen(false); setLogType(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X size={20}/></button>
                    
                    <div className="p-6">
                        <h3 className="text-[var(--theme-accent)] font-bold uppercase tracking-widest mb-6 text-center text-lg">Quick Log</h3>
                        
                        {!logType ? (
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setLogType('calories')} className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 transition-all group">
                                    <div className="p-2 bg-slate-900 rounded-full text-amber-500 group-hover:scale-110 transition-transform"><Flame size={20} /></div>
                                    <span className="font-bold text-slate-200 uppercase">Calories</span>
                                </button>
                                {/* ... Other buttons ... */}
                                <button onClick={() => setLogType('steps')} className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 transition-all group">
                                    <div className="p-2 bg-slate-900 rounded-full text-emerald-500 group-hover:scale-110 transition-transform"><Footprints size={20} /></div>
                                    <span className="font-bold text-slate-200 uppercase">Steps</span>
                                </button>
                                <button onClick={() => setLogType('weight')} className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all group">
                                    <div className="p-2 bg-slate-900 rounded-full text-blue-500 group-hover:scale-110 transition-transform"><Activity size={20} /></div>
                                    <span className="font-bold text-slate-200 uppercase">Weight</span>
                                </button>
                                <button onClick={() => setLogType('sleep')} className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 transition-all group">
                                    <div className="p-2 bg-slate-900 rounded-full text-purple-500 group-hover:scale-110 transition-transform"><Moon size={20} /></div>
                                    <span className="font-bold text-slate-200 uppercase">Sleep</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input type="number" autoFocus value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-[var(--theme-bg-primary)] border border-slate-700 text-white p-3 mt-1 focus:border-[var(--theme-accent)] outline-none text-xl font-mono" placeholder="0" />
                                <div className="flex gap-2 mt-6">
                                    <button onClick={handleSubmit} className="flex-1 py-3 bg-[var(--theme-accent)] text-slate-900 font-bold uppercase text-sm hover:brightness-110 transition-colors">Confirm</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Restore Preview Modal */}
        {restorePreview && (
          <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-red-500 p-6 w-full max-w-md shadow-2xl">
               <h3 className="text-red-500 font-bold uppercase mb-4 flex items-center gap-2"><AlertTriangle /> Confirm Restore</h3>
               <div className="space-y-2 mb-6 text-sm text-slate-300">
                  <p>This will <span className="text-red-400 font-bold">overwrite</span> all your current progress.</p>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <p><span className="text-slate-500">Summoner:</span> {restorePreview.data.profile?.name}</p>
                      <p><span className="text-slate-500">Rank:</span> {restorePreview.data.rank?.tier} {restorePreview.data.rank?.division}</p>
                      <p><span className="text-slate-500">Logs:</span> {Object.keys(restorePreview.data.logs).length}</p>
                      <p><span className="text-slate-500">Exported:</span> {new Date(restorePreview.exportedAt).toLocaleDateString()}</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setRestorePreview(null)} className="flex-1 py-2 border border-slate-600 text-slate-400 hover:bg-slate-800 uppercase font-bold text-xs">Cancel</button>
                  <button onClick={confirmRestore} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white uppercase font-bold text-xs">Restore Data</button>
               </div>
            </div>
          </div>
        )}

        {/* Settings / Store Modal */}
        {showSettings && !restorePreview && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[var(--theme-bg-secondary)] border border-slate-600 shadow-2xl p-6 max-w-lg w-full animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
                      <h4 className="text-[var(--theme-accent)] font-bold uppercase tracking-widest">Settings & Store</h4>
                      <button onClick={onSettingsToggle}><X className="text-slate-400 hover:text-white" /></button>
                  </div>
                  
                  <div className="space-y-6">
                      {/* Audio */}
                      <div className="flex justify-between items-center">
                          <span className="text-slate-300">Sound FX</span>
                          <button onClick={() => updateProfile({ soundEnabled: !profile?.soundEnabled })} className="text-slate-400 hover:text-white">
                              {profile?.soundEnabled ? <Volume2 /> : <VolumeX />}
                          </button>
                      </div>

                      {/* Tint */}
                      <div className="flex justify-between items-center">
                          <span className="text-slate-300">Auto Day/Night Tint</span>
                          <button onClick={() => updateProfile({ autoTint: !profile?.autoTint })} className={`w-10 h-5 rounded-full relative transition-colors ${profile?.autoTint ? 'bg-amber-600' : 'bg-slate-700'}`}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${profile?.autoTint ? 'left-6' : 'left-1'}`} />
                          </button>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-slate-300">Tint Mode</span>
                          <div className="flex gap-2 text-xs">
                              {['Auto', 'Morning', 'Evening'].map((m: any) => (
                                  <button 
                                    key={m} 
                                    onClick={() => updateProfile({ tintOverride: m })}
                                    className={`px-2 py-1 border rounded ${profile?.tintOverride === m ? 'border-amber-500 text-amber-500' : 'border-slate-700 text-slate-500'}`}
                                  >
                                      {m}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Backup Section */}
                      <div className="border-t border-slate-800 pt-4">
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Data Backup</h5>
                          <div className="flex gap-3">
                              <button onClick={() => { exportSave(); alert('Backup saved.'); }} className="flex-1 bg-slate-800 border border-slate-700 hover:border-amber-500 p-3 flex items-center justify-center gap-2 text-sm text-slate-300">
                                  <Download size={16} /> Download
                              </button>
                              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-slate-800 border border-slate-700 hover:border-blue-500 p-3 flex items-center justify-center gap-2 text-sm text-slate-300">
                                  <Upload size={16} /> Restore
                              </button>
                              <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept=".json" 
                                  onChange={handleFileChange}
                              />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 text-center">Restore replaces your current data. Save a backup first.</p>
                      </div>

                      {/* Theme Store */}
                      <div className="border-t border-slate-800 pt-4">
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Theme Skins (Coins: {profile?.coins})</h5>
                          <div className="grid grid-cols-2 gap-3">
                              {Object.values(THEMES).map(t => {
                                  const unlocked = profile?.unlockedThemeIds.includes(t.id);
                                  const active = profile?.currentThemeId === t.id;
                                  return (
                                      <button 
                                        key={t.id}
                                        onClick={() => unlocked ? updateProfile({ currentThemeId: t.id }) : buyTheme(t.id)}
                                        className={`p-3 border text-left relative overflow-hidden group ${active ? 'border-[var(--theme-accent)] bg-slate-800' : 'border-slate-700 bg-slate-900'}`}
                                      >
                                          <div className="flex justify-between items-center z-10 relative">
                                              <span className={`font-bold text-sm ${active ? 'text-[var(--theme-accent)]' : 'text-slate-300'}`}>{t.name}</span>
                                              {!unlocked && <span className="text-xs text-yellow-500 font-bold">{t.cost} G</span>}
                                              {unlocked && active && <span className="text-xs text-[var(--theme-accent)]">Equipped</span>}
                                          </div>
                                          <div className="absolute inset-0 opacity-20" style={{ backgroundColor: t.colors.bgPrimary }} />
                                      </button>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Dev */}
                      <div className="pt-4 border-t border-slate-800">
                          <button onClick={resetData} className="text-xs text-red-500 hover:text-red-400">Reset Data</button>
                      </div>
                  </div>
              </div>
          </div>
        )}
      </main>
    </div>
  );
};