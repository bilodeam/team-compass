import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import {
  Employee, Goal, OneOnOne, Achievement, PerformanceNote,
  CareerGrowth, Skill, MoodCheckin, ActionItem, ModuleConfig, DEFAULT_MODULES, TeamGoal
} from '@/types/employee';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function now() {
  return new Date().toISOString();
}

// ─── Map snake_case DB rows to camelCase app types ───────────────────────────
function mapEmployee(r: any): Employee {
  return { id: r.id, name: r.name, role: r.role, avatarColor: r.avatar_color, startDate: r.start_date, currentLevel: r.current_level, targetLevel: r.target_level };
}
function mapGoal(r: any): Goal {
  return { id: r.id, employeeId: r.employee_id, title: r.title, description: r.description, status: r.status, progress: r.progress, timeframe: r.timeframe, quarter: r.quarter, linkedOKR: r.linked_okr, createdAt: r.created_at, updatedAt: r.updated_at };
}
function mapTeamGoal(r: any): TeamGoal {
  return { id: r.id, title: r.title, description: r.description, status: r.status, progress: r.progress, timeframe: r.timeframe, quarter: r.quarter, createdAt: r.created_at, updatedAt: r.updated_at };
}
function mapOneOnOne(r: any): OneOnOne {
  return { id: r.id, employeeId: r.employee_id, date: r.date, agendaItems: r.agenda_items || [], wentWell: r.went_well, concerns: r.concerns, managerNotes: r.manager_notes, followUps: r.follow_ups, pinned: r.pinned, createdAt: r.created_at };
}
function mapAchievement(r: any): Achievement {
  return { id: r.id, employeeId: r.employee_id, title: r.title, description: r.description, date: r.date, impact: r.impact, tags: r.tags, createdAt: r.created_at };
}
function mapPerformanceNote(r: any): PerformanceNote {
  return { id: r.id, employeeId: r.employee_id, content: r.content, category: r.category, createdAt: r.created_at };
}
function mapCareerGrowth(r: any): CareerGrowth {
  return { id: r.id, employeeId: r.employee_id, currentLevel: r.current_level, targetLevel: r.target_level, readinessScore: r.readiness_score, eligibleBy: r.eligible_by, gaps: r.gaps, evidence: r.evidence, updatedAt: r.updated_at };
}
function mapSkill(r: any): Skill {
  return { id: r.id, employeeId: r.employee_id, name: r.name, rating: r.rating, quarter: r.quarter, updatedAt: r.updated_at };
}
function mapMoodCheckin(r: any): MoodCheckin {
  return { id: r.id, employeeId: r.employee_id, date: r.date, score: r.score, notes: r.notes, createdAt: r.created_at };
}
function mapActionItem(r: any): ActionItem {
  return { id: r.id, employeeId: r.employee_id, title: r.title, owner: r.owner, assignedTo: r.assigned_to, dueDate: r.due_date, status: r.status, sourceOneOnOneId: r.source_one_on_one_id, createdAt: r.created_at, completedAt: r.completed_at };
}
function mapModuleConfig(r: any): ModuleConfig {
  return { type: r.type, label: r.label, emoji: r.emoji, enabled: r.enabled, order: r.order };
}

interface StoreState {
  employees: Employee[];
  goals: Goal[];
  oneOnOnes: OneOnOne[];
  achievements: Achievement[];
  performanceNotes: PerformanceNote[];
  careerGrowth: CareerGrowth[];
  skills: Skill[];
  moodCheckins: MoodCheckin[];
  actionItems: ActionItem[];
  moduleConfigs: Record<string, ModuleConfig[]>;
  selectedEmployeeId: string | null;
  teamGoals: TeamGoal[];
  isLoading: boolean;

  setSelectedEmployee: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addTeamGoal: (goal: Omit<TeamGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTeamGoal: (id: string, updates: Partial<TeamGoal>) => Promise<void>;
  deleteTeamGoal: (id: string) => Promise<void>;

  addOneOnOne: (entry: Omit<OneOnOne, 'id' | 'createdAt'>) => Promise<void>;
  updateOneOnOne: (id: string, updates: Partial<OneOnOne>) => Promise<void>;
  deleteOneOnOne: (id: string) => Promise<void>;

  addAchievement: (entry: Omit<Achievement, 'id' | 'createdAt'>) => Promise<void>;
  updateAchievement: (id: string, updates: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;

  addPerformanceNote: (entry: Omit<PerformanceNote, 'id' | 'createdAt'>) => Promise<void>;
  deletePerformanceNote: (id: string) => Promise<void>;

  updateCareerGrowth: (employeeId: string, data: Partial<CareerGrowth>) => Promise<void>;

  addSkill: (entry: Omit<Skill, 'id' | 'updatedAt'>) => Promise<void>;
  updateSkill: (id: string, updates: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;

  addMoodCheckin: (entry: Omit<MoodCheckin, 'id' | 'createdAt'>) => Promise<void>;
  deleteMoodCheckin: (id: string) => Promise<void>;

  addActionItem: (entry: Omit<ActionItem, 'id' | 'createdAt'>) => Promise<void>;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<void>;
  deleteActionItem: (id: string) => Promise<void>;

  getModuleConfigs: (employeeId: string) => ModuleConfig[];
  updateModuleConfigs: (employeeId: string, configs: ModuleConfig[]) => Promise<void>;

  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { profile, isLoading: authLoading } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [performanceNotes, setPerformanceNotes] = useState<PerformanceNote[]>([]);
  const [careerGrowth, setCareerGrowth] = useState<CareerGrowth[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [moodCheckins, setMoodCheckins] = useState<MoodCheckin[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [moduleConfigs, setModuleConfigs] = useState<Record<string, ModuleConfig[]>>({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !profile) return;
    loadAll();
  }, [profile, authLoading]);

  async function loadAll() {
    setIsLoading(true);
    try {
      const [
        empRes, goalRes, teamGoalRes, oneOnOneRes, achieveRes,
        noteRes, careerRes, skillRes, moodRes, actionRes, moduleRes
      ] = await Promise.all([
        supabase.from('employees').select('*').order('id'),
        supabase.from('goals').select('*'),
        supabase.from('team_goals').select('*'),
        supabase.from('one_on_ones').select('*'),
        supabase.from('achievements').select('*'),
        supabase.from('performance_notes').select('*'),
        supabase.from('career_growth').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('mood_checkins').select('*'),
        supabase.from('action_items').select('*'),
        supabase.from('module_configs').select('*'),
      ]);

      const emps = (empRes.data || []).map(mapEmployee);
      setEmployees(emps);
      setGoals((goalRes.data || []).map(mapGoal));
      setTeamGoals((teamGoalRes.data || []).map(mapTeamGoal));
      setOneOnOnes((oneOnOneRes.data || []).map(mapOneOnOne));
      setAchievements((achieveRes.data || []).map(mapAchievement));
      setPerformanceNotes((noteRes.data || []).map(mapPerformanceNote));
      setCareerGrowth((careerRes.data || []).map(mapCareerGrowth));
      setSkills((skillRes.data || []).map(mapSkill));
      setMoodCheckins((moodRes.data || []).map(mapMoodCheckin));
      setActionItems((actionRes.data || []).map(mapActionItem));

      const configs: Record<string, ModuleConfig[]> = {};
      (moduleRes.data || []).forEach((r: any) => {
        if (!configs[r.employee_id]) configs[r.employee_id] = [];
        configs[r.employee_id].push(mapModuleConfig(r));
      });
      setModuleConfigs(configs);

      if (profile.role === 'employee' && profile.employee_id) {
        setSelectedEmployeeId(profile.employee_id);
      } else if (emps.length > 0) {
        setSelectedEmployeeId(emps[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const store: StoreState = {
    employees, goals, oneOnOnes, achievements, performanceNotes,
    careerGrowth, skills, moodCheckins, actionItems, moduleConfigs,
    selectedEmployeeId, teamGoals, isLoading,

    setSelectedEmployee: setSelectedEmployeeId,

    addGoal: useCallback(async (goal) => {
      const id = generateId();
      const { data } = await supabase.from('goals').insert({
        id, employee_id: goal.employeeId, title: goal.title, description: goal.description,
        status: goal.status, progress: goal.progress, timeframe: goal.timeframe,
        quarter: goal.quarter || '', linked_okr: goal.linkedOKR || '',
        created_at: now(), updated_at: now(),
      }).select().single();
      if (data) setGoals(prev => [...prev, mapGoal(data)]);
    }, []),

    updateGoal: useCallback(async (id, updates) => {
      const { data } = await supabase.from('goals').update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.progress !== undefined && { progress: updates.progress }),
        ...(updates.timeframe !== undefined && { timeframe: updates.timeframe }),
        ...(updates.quarter !== undefined && { quarter: updates.quarter }),
        updated_at: now(),
      }).eq('id', id).select().single();
      if (data) setGoals(prev => prev.map(g => g.id === id ? mapGoal(data) : g));
    }, []),

    deleteGoal: useCallback(async (id) => {
      await supabase.from('goals').delete().eq('id', id);
      setGoals(prev => prev.filter(g => g.id !== id));
    }, []),

    addTeamGoal: useCallback(async (goal) => {
      const id = generateId();
      const { data } = await supabase.from('team_goals').insert({
        id, title: goal.title, description: goal.description, status: goal.status,
        progress: goal.progress, timeframe: goal.timeframe, quarter: goal.quarter || '',
        created_at: now(), updated_at: now(),
      }).select().single();
      if (data) setTeamGoals(prev => [...prev, mapTeamGoal(data)]);
    }, []),

    updateTeamGoal: useCallback(async (id, updates) => {
      const { data } = await supabase.from('team_goals').update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.progress !== undefined && { progress: updates.progress }),
        ...(updates.timeframe !== undefined && { timeframe: updates.timeframe }),
        ...(updates.quarter !== undefined && { quarter: updates.quarter }),
        updated_at: now(),
      }).eq('id', id).select().single();
      if (data) setTeamGoals(prev => prev.map(g => g.id === id ? mapTeamGoal(data) : g));
    }, []),

    deleteTeamGoal: useCallback(async (id) => {
      await supabase.from('team_goals').delete().eq('id', id);
      setTeamGoals(prev => prev.filter(g => g.id !== id));
    }, []),

    addOneOnOne: useCallback(async (entry) => {
      const id = generateId();
      const { data } = await supabase.from('one_on_ones').insert({
        id, employee_id: entry.employeeId, date: entry.date, went_well: entry.wentWell,
        concerns: entry.concerns, manager_notes: entry.managerNotes,
        follow_ups: entry.followUps, pinned: entry.pinned,
        agenda_items: entry.agendaItems || [],
        created_at: now(),
      }).select().single();
      if (data) setOneOnOnes(prev => [...prev, mapOneOnOne(data)]);
    }, []),

    updateOneOnOne: useCallback(async (id, updates) => {
      const { data } = await supabase.from('one_on_ones').update({
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.wentWell !== undefined && { went_well: updates.wentWell }),
        ...(updates.concerns !== undefined && { concerns: updates.concerns }),
        ...(updates.managerNotes !== undefined && { manager_notes: updates.managerNotes }),
        ...(updates.followUps !== undefined && { follow_ups: updates.followUps }),
        ...(updates.pinned !== undefined && { pinned: updates.pinned }),
        ...(updates.agendaItems !== undefined && { agenda_items: updates.agendaItems }),
      }).eq('id', id).select().single();
      if (data) setOneOnOnes(prev => prev.map(e => e.id === id ? mapOneOnOne(data) : e));
    }, []),

    deleteOneOnOne: useCallback(async (id) => {
      await supabase.from('one_on_ones').delete().eq('id', id);
      setOneOnOnes(prev => prev.filter(e => e.id !== id));
    }, []),

    addAchievement: useCallback(async (entry) => {
      const id = generateId();
      const { data } = await supabase.from('achievements').insert({
        id, employee_id: entry.employeeId, title: entry.title, description: entry.description,
        date: entry.date, impact: entry.impact, tags: entry.tags, created_at: now(),
      }).select().single();
      if (data) setAchievements(prev => [...prev, mapAchievement(data)]);
    }, []),

    updateAchievement: useCallback(async (id, updates) => {
      const { data } = await supabase.from('achievements').update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.impact !== undefined && { impact: updates.impact }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
      }).eq('id', id).select().single();
      if (data) setAchievements(prev => prev.map(e => e.id === id ? mapAchievement(data) : e));
    }, []),

    deleteAchievement: useCallback(async (id) => {
      await supabase.from('achievements').delete().eq('id', id);
      setAchievements(prev => prev.filter(e => e.id !== id));
    }, []),

    addPerformanceNote: useCallback(async (entry) => {
      const id = generateId();
      const { data } = await supabase.from('performance_notes').insert({
        id, employee_id: entry.employeeId, content: entry.content,
        category: entry.category, created_at: now(),
      }).select().single();
      if (data) setPerformanceNotes(prev => [...prev, mapPerformanceNote(data)]);
    }, []),

    deletePerformanceNote: useCallback(async (id) => {
      await supabase.from('performance_notes').delete().eq('id', id);
      setPerformanceNotes(prev => prev.filter(e => e.id !== id));
    }, []),

    updateCareerGrowth: useCallback(async (employeeId, data) => {
      const existing = (await supabase.from('career_growth').select('id').eq('employee_id', employeeId).single()).data;
      if (existing) {
        const { data: updated } = await supabase.from('career_growth').update({
          ...(data.currentLevel !== undefined && { current_level: data.currentLevel }),
          ...(data.targetLevel !== undefined && { target_level: data.targetLevel }),
          ...(data.readinessScore !== undefined && { readiness_score: data.readinessScore }),
          ...(data.eligibleBy !== undefined && { eligible_by: data.eligibleBy }),
          ...(data.gaps !== undefined && { gaps: data.gaps }),
          ...(data.evidence !== undefined && { evidence: data.evidence }),
          updated_at: now(),
        }).eq('employee_id', employeeId).select().single();
        if (updated) setCareerGrowth(prev => prev.map(c => c.employeeId === employeeId ? mapCareerGrowth(updated) : c));
      } else {
        const id = generateId();
        const { data: inserted } = await supabase.from('career_growth').insert({
          id, employee_id: employeeId,
          current_level: data.currentLevel || '',
          target_level: data.targetLevel || '',
          readiness_score: data.readinessScore || 5,
          eligible_by: data.eligibleBy || '',
          gaps: data.gaps || '',
          evidence: data.evidence || [],
          updated_at: now(),
        }).select().single();
        if (inserted) setCareerGrowth(prev => [...prev, mapCareerGrowth(inserted)]);
      }
    }, []),

    addSkill: useCallback(async (entry) => {
      const id = generateId();
      const { data } = await supabase.from('skills').insert({
        id, employee_id: entry.employeeId, name: entry.name,
        rating: entry.rating, quarter: entry.quarter, updated_at: now(),
      }).select().single();
      if (data) setSkills(prev => [...prev, mapSkill(data)]);
    }, []),

    updateSkill: useCallback(async (id, updates) => {
      const { data } = await supabase.from('skills').update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.rating !== undefined && { rating: updates.rating }),
        ...(updates.quarter !== undefined && { quarter: updates.quarter }),
        updated_at: now(),
      }).eq('id', id).select().single();
      if (data) setSkills(prev => prev.map(s => s.id === id ? mapSkill(data) : s));
    }, []),

    deleteSkill: useCallback(async (id) => {
      await supabase.from('skills').delete().eq('id', id);
      setSkills(prev => prev.filter(s => s.id !== id));
    }, []),

    addMoodCheckin: useCallback(async (entry) => {
      const id = generateId();
      const { data } = await supabase.from('mood_checkins').insert({
        id, employee_id: entry.employeeId, date: entry.date,
        score: entry.score, notes: entry.notes, created_at: now(),
      }).select().single();
      if (data) setMoodCheckins(prev => [...prev, mapMoodCheckin(data)]);
    }, []),

    deleteMoodCheckin: useCallback(async (id) => {
      await supabase.from('mood_checkins').delete().eq('id', id);
      setMoodCheckins(prev => prev.filter(e => e.id !== id));
    }, []),

    addActionItem: useCallback(async (entry) => {
      const id = generateId();
      const { data } = await supabase.from('action_items').insert({
        id, employee_id: entry.employeeId, title: entry.title, owner: entry.owner,
        assigned_to: entry.assignedTo || '', due_date: entry.dueDate,
        status: entry.status, source_one_on_one_id: entry.sourceOneOnOneId || '',
        created_at: now(), completed_at: '',
      }).select().single();
      if (data) setActionItems(prev => [...prev, mapActionItem(data)]);
    }, []),

    updateActionItem: useCallback(async (id, updates) => {
      const { data } = await supabase.from('action_items').update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.dueDate !== undefined && { due_date: updates.dueDate }),
        ...(updates.owner !== undefined && { owner: updates.owner }),
        ...(updates.completedAt !== undefined && { completed_at: updates.completedAt }),
      }).eq('id', id).select().single();
      if (data) setActionItems(prev => prev.map(a => a.id === id ? mapActionItem(data) : a));
    }, []),

    deleteActionItem: useCallback(async (id) => {
      await supabase.from('action_items').delete().eq('id', id);
      setActionItems(prev => prev.filter(a => a.id !== id));
    }, []),

    getModuleConfigs: useCallback((employeeId: string) => {
      return moduleConfigs[employeeId] || [...DEFAULT_MODULES];
    }, [moduleConfigs]),

    updateModuleConfigs: useCallback(async (employeeId: string, configs: ModuleConfig[]) => {
      await supabase.from('module_configs').delete().eq('employee_id', employeeId);
      const rows = configs.map(c => ({
        id: generateId(), employee_id: employeeId,
        type: c.type, label: c.label, emoji: c.emoji,
        enabled: c.enabled, order: c.order,
      }));
      await supabase.from('module_configs').insert(rows);
      setModuleConfigs(prev => ({ ...prev, [employeeId]: configs }));
    }, []),

    addEmployee: useCallback(async (employee) => {
      const id = generateId();
      const { data } = await supabase.from('employees').insert({
        id, name: employee.name, role: employee.role,
        avatar_color: employee.avatarColor, start_date: employee.startDate,
        current_level: employee.currentLevel, target_level: employee.targetLevel,
      }).select().single();
      if (data) setEmployees(prev => [...prev, mapEmployee(data)]);
    }, []),

    updateEmployee: useCallback(async (id, updates) => {
      const { data } = await supabase.from('employees').update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.role !== undefined && { role: updates.role }),
        ...(updates.avatarColor !== undefined && { avatar_color: updates.avatarColor }),
        ...(updates.startDate !== undefined && { start_date: updates.startDate }),
        ...(updates.currentLevel !== undefined && { current_level: updates.currentLevel }),
        ...(updates.targetLevel !== undefined && { target_level: updates.targetLevel }),
      }).eq('id', id).select().single();
      if (data) setEmployees(prev => prev.map(e => e.id === id ? mapEmployee(data) : e));
    }, []),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
