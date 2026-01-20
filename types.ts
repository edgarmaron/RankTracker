export enum Sex {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum Tier {
  IRON = 'Iron',
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  EMERALD = 'Emerald',
  DIAMOND = 'Diamond',
  MASTER = 'Master',
  GRANDMASTER = 'Grandmaster',
  CHALLENGER = 'Challenger'
}

export enum Division {
  IV = 'IV',
  III = 'III',
  II = 'II',
  I = 'I',
  NONE = '' // For Master+
}

export type LifeEventTag = 'None' | 'Travel' | 'Sick' | 'Stress' | 'Celebration' | 'Work';
export type MatchResult = 'Victory' | 'Defeat' | 'Draw';
export type FocusType = 'Balanced' | 'Cut Calories' | 'Improve Sleep' | 'Move More' | 'Consistency';

export interface CustomQuest {
  id: string;
  title: string;
  targetType: 'calories' | 'steps' | 'weight' | 'sleep' | 'reflection';
  targetValue: number;
  rewardLp: number;
  rewardCoins: number;
}

export interface MasteryState {
  calories: number; // XP
  sleep: number;
  steps: number;
  weight: number;
  reflection: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface Theme {
  id: string;
  name: string;
  cost: number;
  colors: {
    bgPrimary: string;
    bgSecondary: string;
    border: string;
    accent: string;
    textAccent: string;
  };
}

export interface SplitState {
  id: string;
  name: string; // e.g., "Season of Discipline"
  startDate: string;
  endDate: string;
  history: SplitHistoryEntry[];
}

export interface SplitHistoryEntry {
  name: string;
  startDate: string;
  endDate: string;
  finalLp: number;
  finalRank: string;
  badgesEarned: number;
}

export interface GroupMember {
  id: string;
  name: string;
  caloriesLogged: number;
  steps: number;
  sleepLogged: number;
  contributionPoints: number;
}

export interface GroupState {
  name: string;
  members: GroupMember[];
}

export interface WeeklyPlan {
  weekId: string; // YYYY-WW
  focus: FocusType;
  promise: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  sex: Sex;
  age: number;
  height: number; // cm
  startWeight: number; // kg
  currentWeight: number; // kg
  targetWeight: number; // kg
  targetDate: string; // ISO Date
  targetSteps: number;
  calorieTarget: number;
  sleepTargetHours: number;
  createdAt: string; // ISO Date
  bmr: number;
  coins: number;
  
  // Settings / Feature Flags
  showFaithQuotes: boolean;
  showFaithQuests: boolean;
  promotionModeEnabled: boolean;
  seasonTheme: string;
  soundEnabled: boolean;
  resetRankOnSplit: boolean;
  autoTint: boolean;
  tintOverride: 'Auto' | 'Morning' | 'Evening';
  
  // Customization
  currentFocus: FocusType;
  currentThemeId: string;
  unlockedThemeIds: string[];
  
  customQuests: CustomQuest[];
}

export interface DailyLog {
  date: string; // ISO YYYY-MM-DD
  weight?: number;
  calories?: number;
  steps?: number;
  sleepHours?: number;
  sleepQuality?: number; // 1-5
  notes?: string;
  
  // New Fields
  reflection?: string;
  firstCalorieTime?: string; // HH:MM
  lastCalorieTime?: string; // HH:MM
  lifeEventTag?: LifeEventTag;
  
  // Computed for history
  matchResult?: MatchResult;
  lpChange?: number;
  recapShown?: boolean;
  
  // New features
  graceUsed?: boolean;
  coachLine?: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  timestamp: number;
  type: 'log' | 'rank_up' | 'rank_down' | 'quest_complete' | 'insight' | 'promotion' | 'badge_unlock' | 'record_broken' | 'grace_used';
  message: string;
  value?: string; 
}

export interface RankHistoryEntry {
  date: string;
  lpChange: number;
  reason: string;
  timestamp: number;
}

export interface RankState {
  tier: Tier;
  division: Division;
  lp: number;
  totalLp: number;
  streak: number;
  lastUpdated: string;
  history: RankHistoryEntry[];
}

export type QuestFrequency = 'daily' | 'weekly' | 'season';

export interface Quest {
  id: string;
  title: string;
  description: string;
  frequency: QuestFrequency;
  rewardLp: number;
  rewardCoins: number;
  completedAt?: string; // ISO Date if completed
  progress: number;
  target: number;
  typeId: string; 
  expiresAt: string; // ISO Date
  isCustom?: boolean;
  isFaith?: boolean;
}

export interface PersonalRecords {
  longestStreak: number;
  highestDailyLp: number;
  highestWeeklyLp: number;
  lowestWeight: number;
  mostSteps: number;
  bestSleep: number;
  mostQuests: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'rank' | 'record' | 'split';
}

export interface GameState {
  profile: UserProfile | null;
  logs: Record<string, DailyLog>;
  rank: RankState;
  quests: Quest[];
  activity: ActivityLog[];
  hasOnboarded: boolean;
  
  // New States
  mastery: MasteryState;
  badges: Badge[];
  split: SplitState;
  group: GroupState | null;
  
  weeklyPlan: WeeklyPlan | null;
  grace: {
      count: number; // used this week
      weekId: string;
  };
}

export type DayStatus = 'green' | 'yellow' | 'red' | 'gray';

export interface Insight {
  type: 'strength' | 'weakness' | 'neutral';
  text: string;
}

export interface Ping {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'success';
}