import { Tier, Division, QuestFrequency, Badge, Theme } from './types';

export const TIERS_ORDER = [
  Tier.IRON,
  Tier.BRONZE,
  Tier.SILVER,
  Tier.GOLD,
  Tier.PLATINUM,
  Tier.EMERALD,
  Tier.DIAMOND,
  Tier.MASTER,
  Tier.GRANDMASTER,
  Tier.CHALLENGER
];

export const DIVISIONS_ORDER = [Division.IV, Division.III, Division.II, Division.I];

export const TIER_COLORS: Record<Tier, { text: string; border: string; bg: string; glow: string }> = {
  [Tier.IRON]: { text: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-900', glow: 'shadow-zinc-500/20' },
  [Tier.BRONZE]: { text: 'text-orange-700', border: 'border-orange-800', bg: 'bg-orange-950', glow: 'shadow-orange-700/20' },
  [Tier.SILVER]: { text: 'text-slate-300', border: 'border-slate-400', bg: 'bg-slate-800', glow: 'shadow-slate-400/20' },
  [Tier.GOLD]: { text: 'text-amber-400', border: 'border-amber-500', bg: 'bg-yellow-950', glow: 'shadow-amber-500/40' },
  [Tier.PLATINUM]: { text: 'text-teal-300', border: 'border-teal-400', bg: 'bg-teal-950', glow: 'shadow-teal-400/30' },
  [Tier.EMERALD]: { text: 'text-emerald-400', border: 'border-emerald-500', bg: 'bg-emerald-950', glow: 'shadow-emerald-500/40' },
  [Tier.DIAMOND]: { text: 'text-cyan-300', border: 'border-cyan-400', bg: 'bg-cyan-950', glow: 'shadow-cyan-400/40' },
  [Tier.MASTER]: { text: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-950', glow: 'shadow-purple-500/50' },
  [Tier.GRANDMASTER]: { text: 'text-red-400', border: 'border-red-500', bg: 'bg-red-950', glow: 'shadow-red-500/50' },
  [Tier.CHALLENGER]: { text: 'text-blue-300', border: 'border-yellow-300', bg: 'bg-blue-950', glow: 'shadow-blue-400/60' },
};

export const THEMES: Record<string, Theme> = {
  'default': {
    id: 'default', name: 'Dark Gold', cost: 0,
    colors: { bgPrimary: '#020617', bgSecondary: '#0f172a', border: '#334155', accent: '#d97706', textAccent: '#fbbf24' }
  },
  'silver': {
    id: 'silver', name: 'Silver Frost', cost: 50,
    colors: { bgPrimary: '#0f172a', bgSecondary: '#1e293b', border: '#475569', accent: '#3b82f6', textAccent: '#60a5fa' }
  },
  'emerald': {
    id: 'emerald', name: 'Emerald Night', cost: 75,
    colors: { bgPrimary: '#022c22', bgSecondary: '#064e3b', border: '#065f46', accent: '#10b981', textAccent: '#34d399' }
  },
  'crimson': {
    id: 'crimson', name: 'Crimson Dawn', cost: 100,
    colors: { bgPrimary: '#450a0a', bgSecondary: '#7f1d1d', border: '#991b1b', accent: '#ef4444', textAccent: '#f87171' }
  }
};

export const MASTERY_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];
export const MASTERY_XP = {
  LOG_CALS: 10, UNDER_TARGET: 5, LOG_SLEEP: 8, HIT_SLEEP: 5, LOG_STEPS: 5, HIT_STEPS: 5, LOG_WEIGHT: 6, WEIGHT_OK: 6, REFLECTION: 6
};

export const BADGES_LIST: Badge[] = [
  { id: 'consistency', name: 'Consistency', description: 'Log calories 7 days in a row', icon: '🔥', progress: 0, target: 7 },
  { id: 'early_riser', name: 'Early Riser', description: 'First log before 9:00 AM (5 days)', icon: '🌅', progress: 0, target: 5 },
  { id: 'comeback', name: 'Comeback', description: '3 Green days after 2 Red days', icon: '🛡️', progress: 0, target: 1 },
  { id: 'steady_hands', name: 'Steady Hands', description: 'No red days for 14 days', icon: '⚖️', progress: 0, target: 14 },
  { id: 'sleeper', name: 'Sleeper', description: 'Hit sleep target 7 nights', icon: '🌙', progress: 0, target: 7 },
  { id: 'weight_track', name: 'On Track', description: '10 days with weight on trend', icon: '📉', progress: 0, target: 10 },
  { id: 'pathfinder', name: 'Pathfinder', description: 'Hit step target 10 days', icon: '👣', progress: 0, target: 10 },
  { id: 'scribe', name: 'Scribe', description: 'Write 10 daily reflections', icon: '📜', progress: 0, target: 10 },
  { id: 'collector', name: 'Collector', description: 'Complete 25 quests', icon: '💎', progress: 0, target: 25 },
  { id: 'iron_will', name: 'Iron Will', description: 'Reach Bronze Tier', icon: '🥉', progress: 0, target: 1 },
  { id: 'climber', name: 'Climber', description: 'Promote 5 times', icon: '🚀', progress: 0, target: 5 },
  { id: 'finisher', name: 'Season Finisher', description: 'Reach 1000 Total LP', icon: '🏁', progress: 0, target: 1000 },
];

export const LOADING_TIPS = [
  "Consistency beats intensity every time.",
  "You don't have to be perfect, just persistent.",
  "Sleep is when your body rebuilds itself.",
  "Logging food builds awareness, not guilt.",
  "A bad day is just data. Learn and reset.",
  "Small steps daily lead to massive distances yearly.",
  "Hydration improves cognitive function and energy.",
  "Protein helps preserve muscle during weight loss.",
  "Walking is the most underrated fat burner.",
  "Discipline is choosing what you want most over what you want now."
];

export const COACH_TEMPLATES = {
  PERFECT: [
      "Excellent execution today; maintain this momentum.",
      "Precision discipline. You are on the path.",
      "Flawless logging and limits. Keep focused."
  ],
  GOOD_DIET: [
      "Nutrition on point. Keep the discipline.",
      "Good control on intake. Stay the course.",
      "Fueling managed well today."
  ],
  WEIGHT_SLIP: [
      "Scale shifted, but habits determine the long game.",
      "Weight drifted. Stay consistent with intake tomorrow.",
      "Fluctuation is normal. Focus on the plan."
  ],
  SLEEP_LOW: [
      "Rest is recovery. Prioritize sleep tonight.",
      "Low energy detected. Aim for an earlier bedtime.",
      "Sleep debt accumulates. Recover your rhythm."
  ],
  MISSING_LOGS: [
      "Data is power. Complete your logs to clear the fog.",
      "Consistency requires tracking. Log your meals.",
      "Do not let the day slip without a record."
  ],
  STREAK_RISK: [
      "Streak at risk. One good day turns the tide.",
      "Hold the line. Do not break the chain.",
      "Consistency is being tested. respond with discipline."
  ]
};

export const FAITH_QUOTES = [
  { text: "Whatever you do, do it all for the glory of God.", ref: "1 Corinthians 10:31" },
  { text: "Let us not grow weary in doing good.", ref: "Galatians 6:9" },
  { text: "The Lord is my strength and my shield.", ref: "Psalm 28:7" },
  { text: "Run with endurance the race set before you.", ref: "Hebrews 12:1" },
  { text: "Commit your work to the Lord.", ref: "Proverbs 16:3" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Be strong and courageous.", ref: "Joshua 1:9" },
  { text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", ref: "2 Timothy 1:7" },
];

export const WHY_TEMPLATES = [
  "Your discipline today shapes your freedom tomorrow.",
  "Small choices done daily build strong lives.",
  "Steward your body with purpose.",
  "Consistency beats intensity.",
  "You are building a vessel for your mission.",
  "Comfort is the enemy of progress.",
  "Today's pain is tomorrow's power."
];

export const QUOTES = [
  "Hesitation is the seed of defeat.",
  "Precision is the difference between a butcher and a surgeon.",
  "Force is meaningless without skill.",
  "The heart is the strongest muscle.",
  "Pain is temporary. Victory is forever.",
  "Improvement is a journey, not a destination.",
  "True warriors are born in the blood of their failures.",
  "Balance in all things.",
  "Action is the only path to success.",
  "The climb is long, but the view is worth it."
];

export const SCORING = {
  WEIGHT_TOLERANCE_KG: 0.4,
  SLEEP_FORGIVENESS_KG: 0.2, 
  LP_WIN_PERFECT: 12,        
  LP_WIN_GOOD: 4,            
  LP_WIN_OK: 2,              
  LP_LOSS_BAD: -5,           
  LP_LOSS_SEVERE: -8,        
  LP_LOSS_CRITICAL: -10,     
  LP_STREAK_BONUS_BASE: 10,  
  LP_STREAK_BONUS_INC: 2,    
  LP_STREAK_CAP: 10,
  MISSING_WEIGHT_PENALTY_CAP: 2,
  PROMOTION_MULTIPLIER: 2, 
  FOCUS_CHANGE_COST: 5,
  GRACE_COST: 10,
  GRACE_LIMIT_WEEKLY: 1,
};

export interface QuestTemplate {
  typeId: string;
  title: string;
  description: string;
  rewardLp: number;
  rewardCoins: number;
  target: number;
  isFaith?: boolean;
  focus?: string;
}

export const QUEST_TEMPLATES: Record<QuestFrequency, QuestTemplate[]> = {
  daily: [
    { typeId: 'log_calories', title: 'Log Calories', description: 'Track your intake today', rewardLp: 8, rewardCoins: 1, target: 1, focus: 'Cut Calories' },
    { typeId: 'stay_under_cals', title: 'Calorie Control', description: 'Stay under calorie target today', rewardLp: 6, rewardCoins: 0, target: 1, focus: 'Cut Calories' },
    { typeId: 'log_weight', title: 'Weigh In', description: 'Log your weight today', rewardLp: 4, rewardCoins: 0, target: 1 },
    { typeId: 'steps_80', title: 'On the Move', description: 'Hit 80% of step target', rewardLp: 3, rewardCoins: 0, target: 1, focus: 'Move More' },
    { typeId: 'log_sleep', title: 'Rest & Recover', description: 'Log your sleep hours', rewardLp: 4, rewardCoins: 1, target: 1, focus: 'Improve Sleep' },
    { typeId: 'sleep_target', title: 'Well Rested', description: 'Sleep at least target hours', rewardLp: 4, rewardCoins: 0, target: 1, focus: 'Improve Sleep' },
    { typeId: 'faith_prayer', title: 'Morning Prayer', description: 'Start the day with prayer', rewardLp: 0, rewardCoins: 5, target: 1, isFaith: true },
    { typeId: 'faith_read', title: 'Daily Reading', description: 'Read one chapter or verse', rewardLp: 0, rewardCoins: 5, target: 1, isFaith: true },
  ],
  weekly: [
    { typeId: 'weekly_log_6', title: 'Consistency is Key', description: 'Log calories 6 days this week', rewardLp: 20, rewardCoins: 5, target: 6, focus: 'Consistency' },
    { typeId: 'weekly_under_4', title: 'Diet Discipline', description: 'Under calorie target 4 days', rewardLp: 16, rewardCoins: 3, target: 4, focus: 'Cut Calories' },
    { typeId: 'weekly_steps_4', title: 'Pathfinder', description: 'Hit step target 4 days', rewardLp: 10, rewardCoins: 2, target: 4, focus: 'Move More' },
    { typeId: 'weekly_weight_3', title: 'Data Collector', description: 'Log weight 3 days', rewardLp: 10, rewardCoins: 1, target: 3 },
    { typeId: 'weekly_sleep_log_5', title: 'Sleep Tracking', description: 'Log sleep 5 days this week', rewardLp: 12, rewardCoins: 2, target: 5, focus: 'Improve Sleep' },
  ],
  season: [
    { typeId: 'season_log_30', title: 'Dedicated', description: 'Log calories 30 days', rewardLp: 50, rewardCoins: 20, target: 30, focus: 'Consistency' },
    { typeId: 'season_loss_3', title: 'Transformation', description: 'Lose 3% of start weight', rewardLp: 40, rewardCoins: 15, target: 1 },
    { typeId: 'season_steps_150k', title: 'Marathoner', description: 'Walk 150k steps total', rewardLp: 25, rewardCoins: 10, target: 150000, focus: 'Move More' },
    { typeId: 'season_under_20', title: 'Disciplined', description: 'Under target 20 days', rewardLp: 35, rewardCoins: 10, target: 20, focus: 'Cut Calories' },
    { typeId: 'season_green_10', title: 'Perfect Streak', description: '10 Perfect (Green) days', rewardLp: 30, rewardCoins: 10, target: 10 },
  ]
};

export const MOCK_LOGS_COUNT = 14;