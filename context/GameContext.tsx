import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, UserProfile, DailyLog, RankState, Tier, Division, Sex, Quest, ActivityLog, DayStatus, QuestFrequency, RankHistoryEntry, Insight, CustomQuest, MasteryState, Badge, SplitState, Ping, MatchResult, GroupState, FocusType, WeeklyPlan, PersonalRecords, TimelineEvent } from '../types';
import { saveGameState, loadGameState, clearGameState } from '../services/storage';
import { TIERS_ORDER, DIVISIONS_ORDER, MOCK_LOGS_COUNT, SCORING, QUEST_TEMPLATES, BADGES_LIST, MASTERY_XP, THEMES, COACH_TEMPLATES } from '../constants';
import { generateBackupData, downloadFile } from '../utils/backup';

interface GameContextType extends GameState {
  setProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addLog: (log: DailyLog) => void;
  resetData: () => void;
  toggleDemoData: () => void;
  getDayStatus: (date: string) => DayStatus;
  addQuote: (quote: string) => void;
  userQuotes: string[];
  
  readiness: 'Low' | 'Fair' | 'Ready';
  consistencyScore: number;
  insights: Insight[];
  isPromotionMode: boolean;
  pings: Ping[];
  dismissPing: (id: string) => void;
  
  buyTheme: (themeId: string) => void;
  setFocus: (focus: FocusType) => void;
  markRecapShown: (date: string) => void;
  
  recapDate: string | null; 
  closeRecap: () => void;
  
  // New features
  personalRecords: PersonalRecords;
  timelineEvents: TimelineEvent[];
  useGraceDay: (date: string) => boolean;
  setWeeklyPlan: (promise: string) => void;
  startNewSplit: () => void;
  splitCeremony: SplitState | null; // If present, show modal
  closeSplitCeremony: () => void;

  // Backup
  exportSave: () => void;
  restoreSave: (newState: GameState) => void;
}

const defaultMastery: MasteryState = { calories: 0, sleep: 0, steps: 0, weight: 0, reflection: 0 };
const defaultSplit: SplitState = { 
  id: 'split-1', name: 'Season of Discipline', 
  startDate: new Date().toISOString(), 
  endDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString(), 
  history: [] 
};

const defaultState: GameState = {
  profile: null,
  logs: {},
  rank: {
    tier: Tier.IRON,
    division: Division.IV,
    lp: 0,
    totalLp: 0,
    streak: 0,
    lastUpdated: new Date().toISOString(),
    history: []
  },
  quests: [],
  activity: [],
  hasOnboarded: false,
  mastery: defaultMastery,
  badges: BADGES_LIST,
  split: defaultSplit,
  group: null,
  weeklyPlan: null,
  grace: { count: 0, weekId: '' }
};

const GameContext = createContext<GameContextType & { userQuotes: string[], addQuote: (q: string) => void } | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};

// --- Helpers ---

const getTodayString = () => new Date().toISOString().split('T')[0];
const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const getWeekStart = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};
const getCurrentWeekId = () => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    const yearStart = new Date(d.getFullYear(),0,1);
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return `${d.getFullYear()}-W${weekNo}`;
};

const calculateBMR = (w: number, h: number, a: number, sex: Sex): number => {
  const base = 10 * w + 6.25 * h - 5 * a;
  return sex === Sex.MALE ? base + 5 : base - 161;
};

const getExpectedWeight = (dateStr: string, profile: UserProfile): number => {
  const start = new Date(profile.createdAt).getTime();
  const end = new Date(profile.targetDate).getTime();
  const current = new Date(dateStr).getTime();
  if (current <= start) return profile.startWeight;
  if (current >= end) return profile.targetWeight;
  const totalDuration = end - start;
  const elapsed = current - start;
  const progress = elapsed / totalDuration;
  return profile.startWeight + (profile.targetWeight - profile.startWeight) * progress;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [userQuotes, setUserQuotes] = useState<string[]>([]);
  
  // Derived / Temp State
  const [readiness, setReadiness] = useState<'Low' | 'Fair' | 'Ready'>('Fair');
  const [consistencyScore, setConsistencyScore] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isPromotionMode, setIsPromotionMode] = useState(false);
  const [pings, setPings] = useState<Ping[]>([]);
  const [recapDate, setRecapDate] = useState<string | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords>({ longestStreak: 0, highestDailyLp: 0, highestWeeklyLp: 0, lowestWeight: 0, mostSteps: 0, bestSleep: 0, mostQuests: 0 });
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [splitCeremony, setSplitCeremony] = useState<SplitState | null>(null);

  useEffect(() => {
    const loaded = loadGameState();
    if (loaded) {
      if (loaded.profile) {
          if (!loaded.profile.autoTint) loaded.profile.autoTint = true;
          if (!loaded.profile.tintOverride) loaded.profile.tintOverride = 'Auto';
          if (!loaded.profile.currentFocus) loaded.profile.currentFocus = 'Balanced';
          if (!loaded.profile.currentThemeId) loaded.profile.currentThemeId = 'default';
          if (!loaded.profile.unlockedThemeIds) loaded.profile.unlockedThemeIds = ['default'];
          if (typeof loaded.profile.coins === 'undefined') loaded.profile.coins = 0;
          if (!loaded.profile.customQuests) loaded.profile.customQuests = [];
      }
      if (!loaded.mastery) loaded.mastery = defaultMastery;
      if (!loaded.badges) loaded.badges = BADGES_LIST;
      if (!loaded.split) loaded.split = defaultSplit;
      if (!loaded.grace) loaded.grace = { count: 0, weekId: getCurrentWeekId() };
      
      const mergedBadges = BADGES_LIST.map(b => {
          const existing = loaded.badges.find((eb: Badge) => eb.id === b.id);
          return existing ? { ...b, ...existing, name: b.name, description: b.description } : b;
      });
      loaded.badges = mergedBadges;

      setState(prev => ({ ...prev, ...loaded }));
      const savedQuotes = localStorage.getItem('summoner_user_quotes');
      if (savedQuotes) setUserQuotes(JSON.parse(savedQuotes));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      saveGameState(state);
      localStorage.setItem('summoner_user_quotes', JSON.stringify(userQuotes));
      
      if (state.profile) {
          calculateStats();
          // Ensure quests exist on every load/update
          const newQuests = generateQuests(state.quests, state.profile);
          const { quests: processed } = checkQuestProgress(newQuests, state.logs, state.profile);
          if (JSON.stringify(processed) !== JSON.stringify(state.quests)) {
              setState(prev => ({ ...prev, quests: processed }));
          }
          
          computePersonalRecords(state.logs, state.activity);
          buildTimeline(state);
      }
      generatePings();
      
      // Check weekly reset for Grace
      const currentWeek = getCurrentWeekId();
      if (state.grace.weekId !== currentWeek) {
          setState(prev => ({ ...prev, grace: { count: 0, weekId: currentWeek }, weeklyPlan: null }));
      }
    }
  }, [state.logs, state.profile, loading, userQuotes, state.activity]); 

  // --- Core Calculations ---

  const calculateStats = () => {
      const logs = Object.values(state.logs) as DailyLog[];
      if (!state.profile || logs.length === 0) return;

      const yesterday = getYesterdayString();
      const yLog = state.logs[yesterday];
      let rScore = 0;
      if (yLog) {
          if ((yLog.sleepHours || 0) >= state.profile.sleepTargetHours) rScore++;
          if (yLog.calories && yLog.calories <= state.profile.calorieTarget) rScore++;
          if ((yLog.steps || 0) >= state.profile.targetSteps) rScore++;
      }
      setReadiness(rScore <= 1 ? 'Low' : rScore === 2 ? 'Fair' : 'Ready');

      const last30 = logs.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 30);
      const totalDays = last30.length || 1;
      const calorieHits = last30.filter(l => l.calories && l.calories <= state.profile!.calorieTarget).length;
      const sleepHits = last30.filter(l => (l.sleepHours || 0) >= state.profile!.sleepTargetHours).length;
      const weightLogs = last30.filter(l => l.weight).length;
      
      const cScore = Math.round(((calorieHits * 0.4) + (weightLogs * 0.3) + (sleepHits * 0.3)) / totalDays * 100);
      setConsistencyScore(cScore);

      setIsPromotionMode(state.profile.promotionModeEnabled && state.rank.lp >= 90);

      const newInsights: Insight[] = [];
      if (cScore > 80) newInsights.push({ type: 'strength', text: 'Excellent consistency rating.' });
      if (cScore < 40) newInsights.push({ type: 'weakness', text: 'Consistency is dropping.' });
      const lowSleepDays = last30.filter(l => (l.sleepHours || 0) < 6);
      if (lowSleepDays.length > 5) newInsights.push({ type: 'weakness', text: 'Sleep deprivation detected.' });
      setInsights(newInsights);
  };
  
  const generateCoachLine = (log: DailyLog, profile: UserProfile): string => {
     if (!log.calories && !log.weight && !log.sleepHours) return "The day is fresh. Make your first move.";
     
     const calOk = log.calories ? log.calories <= profile.calorieTarget : false;
     const sleepOk = log.sleepHours ? log.sleepHours >= profile.sleepTargetHours : false;
     
     if (log.calories && calOk && sleepOk) return COACH_TEMPLATES.PERFECT[Math.floor(Math.random() * COACH_TEMPLATES.PERFECT.length)];
     if (log.calories && calOk) return COACH_TEMPLATES.GOOD_DIET[Math.floor(Math.random() * COACH_TEMPLATES.GOOD_DIET.length)];
     if (log.sleepHours && !sleepOk) return COACH_TEMPLATES.SLEEP_LOW[Math.floor(Math.random() * COACH_TEMPLATES.SLEEP_LOW.length)];
     if (log.calories && !calOk) return "Target missed. Recover with a clean slate tomorrow.";
     
     return "Keep pushing. Every log counts.";
  };

  const computePersonalRecords = (logs: Record<string, DailyLog>, activity: ActivityLog[]) => {
      const logArray = Object.values(logs).sort((a,b) => a.date.localeCompare(b.date));
      if (logArray.length === 0) return;

      let longestStreak = 0;
      let currentStreak = 0;
      let highestDailyLp = 0;
      let lowestWeight = 1000;
      let mostSteps = 0;
      let bestSleep = 0;
      
      logArray.forEach(l => {
          if (l.matchResult === 'Victory') currentStreak++;
          else currentStreak = 0;
          if (currentStreak > longestStreak) longestStreak = currentStreak;
          
          if ((l.lpChange || 0) > highestDailyLp) highestDailyLp = l.lpChange || 0;
          if (l.weight && l.weight < lowestWeight) lowestWeight = l.weight;
          if ((l.steps || 0) > mostSteps) mostSteps = l.steps || 0;
          if ((l.sleepHours || 0) > bestSleep) bestSleep = l.sleepHours || 0;
      });
      if (lowestWeight === 1000) lowestWeight = 0;
      
      setPersonalRecords({ longestStreak, highestDailyLp, highestWeeklyLp: 0, lowestWeight, mostSteps, bestSleep, mostQuests: 0 });
  };
  
  const buildTimeline = (currentState: GameState) => {
      const events: TimelineEvent[] = [];
      
      // Rank Changes
      currentState.activity.filter(a => a.type === 'rank_up' || a.type === 'rank_down').forEach(a => {
          events.push({ id: a.id, date: a.date, title: a.type === 'rank_up' ? 'Promotion' : 'Demotion', description: a.value || '', icon: 'ranking', type: 'rank' });
      });
      
      // Badge Unlocks
      currentState.badges.filter(b => b.unlockedAt).forEach(b => {
          events.push({ id: b.id, date: b.unlockedAt!.split('T')[0], title: 'Badge Earned', description: b.name, icon: 'medal', type: 'milestone' });
      });
      
      // Split History
      currentState.split.history.forEach((h, i) => {
          events.push({ id: `split-${i}`, date: h.endDate.split('T')[0], title: 'Split Ended', description: h.name, icon: 'flag', type: 'split' });
      });
      
      setTimelineEvents(events.sort((a,b) => b.date.localeCompare(a.date)));
  };

  const generatePings = () => {
      const newPings: Ping[] = [];
      const today = getTodayString();
      const log = state.logs[today];
      const hour = new Date().getHours();

      if (hour >= 18 && (!log || !log.calories)) {
          newPings.push({ id: 'missing_cals', message: 'Calories not logged yet today.', type: 'warning' });
      }
      if (state.rank.lp >= 90) {
          newPings.push({ id: 'promo_near', message: 'One win away from promotion.', type: 'info' });
      }
      if (state.rank.streak > 3 && (!log || !log.calories)) {
          newPings.push({ id: 'streak_risk', message: 'Streak at risk today.', type: 'warning' });
      }
      setPings(newPings);
  };

  const dismissPing = (id: string) => {
      setPings(prev => prev.filter(p => p.id !== id));
  };

  // --- Game Engine ---

  const generateQuests = (currentQuests: Quest[], profile: UserProfile): Quest[] => {
    const today = getTodayString();
    const weekStart = getWeekStart(today);
    const newQuests = [...currentQuests];
    const focus = profile.currentFocus;

    const addQuest = (template: any, freq: QuestFrequency, expiry: string, isFaith = false) => {
        if (isFaith && !profile.showFaithQuests) return;
        
        let rewardMultiplier = (focus !== 'Balanced' && template.focus === focus) ? 1.5 : 1;

        const exists = newQuests.find(q => q.typeId === template.typeId && q.expiresAt === expiry);
        if (!exists) {
            newQuests.push({
                id: `${freq}-${template.typeId}-${expiry}`,
                title: template.title,
                description: template.description,
                frequency: freq,
                rewardLp: Math.floor(template.rewardLp * rewardMultiplier),
                rewardCoins: template.rewardCoins,
                progress: 0,
                target: template.target,
                typeId: template.typeId,
                expiresAt: expiry,
                isFaith
            });
        }
    };

    QUEST_TEMPLATES.daily.forEach(t => addQuest(t, 'daily', today, t.isFaith));
    const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    QUEST_TEMPLATES.weekly.forEach(t => addQuest(t, 'weekly', weekEnd));
    const seasonEnd = profile.targetDate;
    QUEST_TEMPLATES.season.forEach(t => addQuest(t, 'season', seasonEnd));

    profile.customQuests.forEach(cq => {
        const customId = `custom-${cq.id}-${today}`;
        const exists = newQuests.find(q => q.id === customId);
        if (!exists) {
            newQuests.push({
                id: customId,
                title: cq.title,
                description: `Custom goal: ${cq.targetValue} ${cq.targetType}`,
                frequency: 'daily',
                rewardLp: cq.rewardLp,
                rewardCoins: cq.rewardCoins,
                progress: 0,
                target: cq.targetValue,
                typeId: `custom_${cq.targetType}`,
                expiresAt: today,
                isCustom: true
            });
        }
    });

    return newQuests;
  };

  const checkQuestProgress = (currentQuests: Quest[], logs: Record<string, DailyLog>, profile: UserProfile): { quests: Quest[], completed: Quest[] } => {
    const today = getTodayString();
    const weekStart = getWeekStart(today);
    const completed: Quest[] = [];

    const updatedQuests = currentQuests.map(q => {
        if (q.completedAt) return q; 

        let progress = 0;
        
        if (q.isCustom && q.frequency === 'daily') {
             const type = q.typeId.replace('custom_', '');
             const log = logs[today];
             if (log) {
                 if (type === 'calories' && log.calories) progress = log.calories; 
                 if (type === 'steps' && (log.steps || 0) >= q.target) progress = q.target;
                 if (type === 'calories' && log.calories && log.calories <= q.target) progress = q.target; 
                 if (type === 'sleep' && (log.sleepHours || 0) >= q.target) progress = q.target;
                 if (type === 'reflection' && log.reflection) progress = q.target;
             }
        }
        else if (q.frequency === 'daily') {
          if (q.typeId === 'log_calories' && logs[today]?.calories) progress = 1;
          else if (q.typeId === 'stay_under_cals' && logs[today]?.calories && logs[today]!.calories! <= profile.calorieTarget) progress = 1;
          else if (q.typeId === 'log_weight' && logs[today]?.weight) progress = 1;
          else if (q.typeId === 'steps_80' && (logs[today]?.steps || 0) >= profile.targetSteps * 0.8) progress = 1;
          else if (q.typeId === 'log_sleep' && logs[today]?.sleepHours !== undefined) progress = 1;
          else if (q.typeId === 'sleep_target' && (logs[today]?.sleepHours || 0) >= profile.sleepTargetHours) progress = 1;
        }
        else {
            const relevantLogs = Object.values(logs).filter(l => {
                if (q.frequency === 'weekly') return l.date >= weekStart;
                return true; 
            });

            if (q.typeId === 'weekly_log_6' || q.typeId === 'season_log_30') progress = relevantLogs.filter(l => l.calories).length;
            else if (q.typeId === 'weekly_under_4' || q.typeId === 'season_under_20') progress = relevantLogs.filter(l => l.calories && l.calories <= profile.calorieTarget).length;
            else if (q.typeId === 'weekly_steps_4') progress = relevantLogs.filter(l => (l.steps || 0) >= profile.targetSteps).length;
            else if (q.typeId === 'weekly_weight_3') progress = relevantLogs.filter(l => l.weight).length;
            else if (q.typeId === 'season_steps_150k') progress = relevantLogs.reduce((acc, l) => acc + (l.steps || 0), 0);
            else if (q.typeId === 'season_loss_3') {
                const currentW = logs[today]?.weight || profile.currentWeight;
                const percentLost = (profile.startWeight - currentW) / profile.startWeight;
                if (percentLost >= 0.03) progress = 1;
            }
            else if (q.typeId === 'weekly_sleep_log_5' || q.typeId === 'season_sleep_log_40') progress = relevantLogs.filter(l => l.sleepHours !== undefined).length;
            else if (q.typeId === 'weekly_sleep_target_4' || q.typeId === 'season_sleep_target_20') progress = relevantLogs.filter(l => (l.sleepHours || 0) >= profile.sleepTargetHours).length;
        }

        if (progress >= q.target) {
            const completedQuest = { ...q, progress: q.target, completedAt: new Date().toISOString() };
            completed.push(completedQuest);
            return completedQuest;
        }
        
        return { ...q, progress };
    });

    return { quests: updatedQuests, completed };
  };

  const getDayStatus = (date: string): DayStatus => {
    const log = state.logs[date];
    const profile = state.profile;
    if (!log || !profile) return 'gray';
    if (log.calories === undefined && log.weight === undefined) return 'gray';

    const expectedWeight = getExpectedWeight(date, profile);
    const isLossGoal = profile.targetWeight < profile.startWeight;
    const calorieOk = log.calories !== undefined && (log.calories! <= profile.calorieTarget);
    const sleepOk = log.sleepHours !== undefined && (log.sleepHours! >= profile.sleepTargetHours);
    
    let weightOk = false;
    const tolerance = SCORING.WEIGHT_TOLERANCE_KG + (sleepOk ? SCORING.SLEEP_FORGIVENESS_KG : 0);

    if (log.weight !== undefined) {
        if (isLossGoal) weightOk = log.weight! <= expectedWeight + tolerance;
        else weightOk = log.weight! >= expectedWeight - tolerance;
    }

    if (calorieOk && weightOk) return log.sleepHours === undefined ? 'yellow' : 'green';
    if (!calorieOk && weightOk) return 'yellow';
    if (calorieOk && !weightOk) return 'yellow';
    return 'red';
  };

  const checkAchievements = (log: DailyLog, profile: UserProfile, logs: Record<string, DailyLog>) => {
      let newBadges = [...state.badges];
      let unlocked: string[] = [];
      const dates = Object.keys(logs).sort();

      newBadges = newBadges.map(badge => {
          if (badge.unlockedAt) return badge;
          let progress = 0;
          
          if (badge.id === 'consistency') {
             let streak = 0;
             for (let i = dates.length - 1; i >= 0; i--) {
                 if (logs[dates[i]].calories) streak++;
                 else break;
             }
             progress = streak;
          }
          else if (badge.id === 'early_riser') {
              progress = Object.values(logs).filter(l => l.firstCalorieTime && parseInt(l.firstCalorieTime.split(':')[0]) < 9).length;
          }
          
          if (progress >= badge.target) {
              unlocked.push(badge.name);
              return { ...badge, progress, unlockedAt: new Date().toISOString() };
          }
          return { ...badge, progress };
      });
      
      return { badges: newBadges, unlocked };
  };

  const updateMastery = (log: DailyLog, profile: UserProfile) => {
      const m = { ...state.mastery };
      const xp = MASTERY_XP;
      
      if (log.calories) {
          m.calories += xp.LOG_CALS;
          if (log.calories <= profile.calorieTarget) m.calories += xp.UNDER_TARGET;
      }
      if (log.sleepHours) {
          m.sleep += xp.LOG_SLEEP;
          if (log.sleepHours >= profile.sleepTargetHours) m.sleep += xp.HIT_SLEEP;
      }
      if (log.steps) {
          m.steps += xp.LOG_STEPS;
          if (log.steps >= profile.targetSteps) m.steps += xp.HIT_STEPS;
      }
      if (log.weight) {
          m.weight += xp.LOG_WEIGHT;
      }
      if (log.reflection) {
          m.reflection += xp.REFLECTION;
      }
      return m;
  };

  const addLog = (log: DailyLog) => {
    if (!state.profile) return;
    const existingLog = state.logs[log.date];
    const newLog = { ...existingLog, ...log };
    
    if (log.calories && !existingLog?.calories && !newLog.firstCalorieTime) {
        const now = new Date();
        newLog.firstCalorieTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    
    // Coach line generation
    if (!newLog.coachLine && log.date === getTodayString()) {
        newLog.coachLine = generateCoachLine(newLog, state.profile);
    }
    
    const newLogs = { ...state.logs, [log.date]: newLog };

    const d = new Date(log.date);
    d.setDate(d.getDate() - 1);
    const prevDate = d.toISOString().split('T')[0];
    const prevLog = state.logs[prevDate];

    // Helper logic directly inline for context access
    const calorieOk = newLog.calories !== undefined && (newLog.calories! <= state.profile.calorieTarget);
    const expectedWeight = getExpectedWeight(log.date, state.profile);
    const tolerance = SCORING.WEIGHT_TOLERANCE_KG;
    let weightOk = true;
    if (newLog.weight) {
         if (state.profile.targetWeight < state.profile.startWeight) weightOk = newLog.weight <= expectedWeight + tolerance;
         else weightOk = newLog.weight >= expectedWeight - tolerance;
    }
    
    let result: MatchResult = 'Draw';
    let delta = 0;
    if (calorieOk && weightOk) { result = 'Victory'; delta = SCORING.LP_WIN_PERFECT; }
    else if (!calorieOk && !weightOk) { result = 'Defeat'; delta = SCORING.LP_LOSS_SEVERE; }
    else { result = 'Draw'; delta = SCORING.LP_WIN_OK; }
    
    if (!newLog.calories) result = 'Defeat';
    if (newLog.graceUsed) { result = 'Draw'; delta = 0; } // Grace override

    if (isPromotionMode && state.profile.promotionModeEnabled) delta *= SCORING.PROMOTION_MULTIPLIER;
    
    newLog.matchResult = result;
    newLog.lpChange = delta;

    let newRank = { ...state.rank };
    if (!newRank.history) newRank.history = [];
    let newActivity = [...state.activity];
    
    if (log.calories || log.weight) {
        newRank.lp += delta;
        newRank.totalLp += delta;
        newRank.history.unshift({
            date: log.date, lpChange: delta, reason: result, timestamp: Date.now()
        });
    }

    const newMastery = updateMastery(newLog, state.profile);
    const { badges: newBadges, unlocked } = checkAchievements(newLog, state.profile, newLogs);
    
    unlocked.forEach(name => {
        newActivity.unshift({
            id: `badge-${Date.now()}`, date: log.date, timestamp: Date.now(),
            type: 'badge_unlock', message: 'Badge Unlocked', value: name
        });
    });

    if (log.calories && !newLog.recapShown) {
        setRecapDate(log.date);
    }

    const questsWithNew = generateQuests(state.quests, state.profile);
    const { quests: processedQuests } = checkQuestProgress(questsWithNew, newLogs, state.profile);
    
    setState(prev => ({
        ...prev,
        logs: newLogs,
        rank: newRank,
        mastery: newMastery,
        badges: newBadges,
        activity: newActivity,
        quests: processedQuests
    }));
  };
  
  const useGraceDay = (date: string) => {
      if (!state.profile || state.profile.coins < SCORING.GRACE_COST) return false;
      if (state.grace.count >= SCORING.GRACE_LIMIT_WEEKLY) return false;
      
      const log = state.logs[date];
      if (!log || log.graceUsed) return false;
      
      const newLog = { ...log, graceUsed: true, lpChange: 0, matchResult: 'Draw' as MatchResult };
      const newLogs = { ...state.logs, [date]: newLog };
      
      setState(prev => ({
          ...prev,
          logs: newLogs,
          profile: { ...prev.profile!, coins: prev.profile!.coins - SCORING.GRACE_COST },
          grace: { ...prev.grace, count: prev.grace.count + 1 },
          activity: [{ id: `grace-${Date.now()}`, date, timestamp: Date.now(), type: 'grace_used', message: 'Grace Day Used' }, ...prev.activity]
      }));
      return true;
  };
  
  const setWeeklyPlan = (promise: string) => {
      if (!state.profile) return;
      const weekId = getCurrentWeekId();
      setState(prev => ({
          ...prev,
          weeklyPlan: { weekId, focus: prev.profile!.currentFocus, promise, createdAt: new Date().toISOString() }
      }));
  };
  
  const startNewSplit = () => {
      // Stub for split ceremony trigger
      const newSplit: SplitState = {
          id: `split-${Date.now()}`,
          name: 'Season of Strength',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString(),
          history: []
      };
      setState(prev => ({
          ...prev,
          split: newSplit,
          // archive old split in history
      }));
      closeSplitCeremony();
  };
  
  const closeSplitCeremony = () => setSplitCeremony(null);

  const markRecapShown = (date: string) => {
      setState(prev => ({
          ...prev,
          logs: { ...prev.logs, [date]: { ...prev.logs[date], recapShown: true } }
      }));
  };
  
  const closeRecap = () => {
      if (recapDate) markRecapShown(recapDate);
      setRecapDate(null);
  }

  const setProfile = (profileInput: UserProfile) => {
     const fullProfile = { 
        ...profileInput, 
        currentFocus: 'Balanced' as FocusType,
        currentThemeId: 'default',
        unlockedThemeIds: ['default'],
        soundEnabled: true,
        resetRankOnSplit: false,
        coins: 0,
        customQuests: [],
        autoTint: true,
        tintOverride: 'Auto' as const
     };
     const quests = generateQuests([], fullProfile);
     setState(prev => ({ ...prev, profile: fullProfile, hasOnboarded: true, quests }));
  };
  
  const updateProfile = (p: Partial<UserProfile>) => {
      setState(prev => prev.profile ? ({ ...prev, profile: { ...prev.profile, ...p } }) : prev);
  };
  
  const buyTheme = (id: string) => {
      const theme = THEMES[id];
      if (!theme || !state.profile) return;
      if (state.profile.coins >= theme.cost) {
          setState(prev => ({
              ...prev,
              profile: {
                  ...prev.profile!,
                  coins: prev.profile!.coins - theme.cost,
                  unlockedThemeIds: [...prev.profile!.unlockedThemeIds, id],
                  currentThemeId: id
              }
          }));
      }
  };
  
  const setFocus = (focus: FocusType) => {
      if(!state.profile) return;
      if (focus === state.profile.currentFocus) return;
      setState(prev => ({ ...prev, profile: { ...prev.profile!, currentFocus: focus } }));
  }

  const exportSave = () => {
    const backup = generateBackupData(state);
    downloadFile(backup);
  };

  const restoreSave = (newState: GameState) => {
    setState(newState);
    saveGameState(newState);
  };

  const toggleDemoData = () => {};
  const resetData = () => { clearGameState(); window.location.reload(); };
  const addQuote = (q: string) => setUserQuotes(prev => [...prev, q]);

  return (
    <GameContext.Provider value={{ 
        ...state, setProfile, updateProfile, addLog, resetData, toggleDemoData, getDayStatus, addQuote, userQuotes,
        readiness, consistencyScore, insights, isPromotionMode, pings, dismissPing,
        buyTheme, setFocus, markRecapShown, recapDate, closeRecap,
        personalRecords, timelineEvents, useGraceDay, setWeeklyPlan, startNewSplit, splitCeremony, closeSplitCeremony,
        exportSave, restoreSave
    }}>
      {children}
    </GameContext.Provider>
  );
};