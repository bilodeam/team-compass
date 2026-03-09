// All types for the Employee Dashboard

export interface Employee {
  id: string;
  name: string;
  role: string;
  team: string;
  avatarColor: string;
  startDate: string;
  currentLevel: string;
  targetLevel: string;
}

// Goal Tracker
export type GoalStatus = 'on-track' | 'at-risk' | 'done' | 'blocked';
export type GoalTimeframe = 'quarterly' | 'annual';

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number; // 0-100
  timeframe: GoalTimeframe;
  quarter?: string; // e.g. "Q1 2026"
  linkedOKR?: string;
  createdAt: string;
  updatedAt: string;
}

// 1-on-1 Recaps
export interface OneOnOne {
  id: string;
  employeeId: string;
  date: string;
  wentWell: string;
  concerns: string;
  managerNotes: string;
  followUps: string;
  pinned: boolean;
  createdAt: string;
}

// Achievements
export type ImpactLevel = 'low' | 'medium' | 'high' | 'exceptional';
export type AchievementTag = 'technical' | 'leadership' | 'collaboration' | 'delivery';

export interface Achievement {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  date: string;
  impact: ImpactLevel;
  tags: AchievementTag[];
  createdAt: string;
}

// Performance Notes
export type NoteCategory = 'concern' | 'positive' | 'neutral' | 'fyi';

export interface PerformanceNote {
  id: string;
  employeeId: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
}

// Career Growth
export interface CareerGrowth {
  id: string;
  employeeId: string;
  currentLevel: string;
  targetLevel: string;
  readinessScore: number; // 1-10
  eligibleBy: string;
  gaps: string;
  evidence: string[];
  updatedAt: string;
}

// Skill Matrix
export type SkillRating = 'developing' | 'proficient' | 'expert';

export interface Skill {
  id: string;
  employeeId: string;
  name: string;
  rating: SkillRating;
  quarter: string;
  updatedAt: string;
}

// Mood Check-ins
export interface MoodCheckin {
  id: string;
  employeeId: string;
  date: string;
  score: number; // 1-5
  notes: string;
  createdAt: string;
}

// Action Items
export type ActionOwner = 'manager' | 'employee';
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface ActionItem {
  id: string;
  employeeId: string;
  title: string;
  owner: ActionOwner;
  assignedTo?: string; // Specific person assigned to this action
  dueDate: string;
  status: ActionStatus;
  sourceOneOnOneId?: string;
  createdAt: string;
  completedAt?: string;
}

export type ModuleType = 'goals' | 'one-on-ones' | 'achievements' | 'performance-notes' | 'career-growth' | 'skill-matrix' | 'mood-checkins' | 'action-items';

export interface ModuleConfig {
  type: ModuleType;
  label: string;
  emoji: string;
  enabled: boolean;
  order: number;
}

// Team Goals (shared across all employees)
export interface TeamGoal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number; // 0-100
  timeframe: GoalTimeframe;
  quarter?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_MODULES: ModuleConfig[] = [
  { type: 'goals', label: 'Goal Tracker', emoji: '🎯', enabled: true, order: 0 },
  { type: 'action-items', label: 'Action Items', emoji: '✅', enabled: true, order: 1 },
  { type: 'one-on-ones', label: '1-on-1 Recaps', emoji: '📅', enabled: true, order: 2 },
  { type: 'performance-notes', label: 'Performance Notes', emoji: '📝', enabled: true, order: 3 },
  { type: 'career-growth', label: 'Career Growth', emoji: '📈', enabled: true, order: 4 },
  { type: 'skill-matrix', label: 'Skill Matrix', emoji: '🧩', enabled: true, order: 5 },
  { type: 'achievements', label: 'Achievements', emoji: '🏆', enabled: true, order: 6 },
  { type: 'mood-checkins', label: 'Mood & Sentiment', emoji: '💬', enabled: false, order: 7 },
];
