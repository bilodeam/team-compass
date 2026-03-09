import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import {
  Employee, Goal, OneOnOne, Achievement, PerformanceNote,
  CareerGrowth, Skill, MoodCheckin, ActionItem, ModuleConfig, DEFAULT_MODULES, TeamGoal
} from '@/types/employee';
import { SEED_EMPLOYEES } from '@/data/seedEmployees';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
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

  setSelectedEmployee: (id: string) => void;

  // CRUD helpers
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addTeamGoal: (goal: Omit<TeamGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTeamGoal: (id: string, updates: Partial<TeamGoal>) => void;
  deleteTeamGoal: (id: string) => void;

  addOneOnOne: (entry: Omit<OneOnOne, 'id' | 'createdAt'>) => void;
  updateOneOnOne: (id: string, updates: Partial<OneOnOne>) => void;
  deleteOneOnOne: (id: string) => void;

  addAchievement: (entry: Omit<Achievement, 'id' | 'createdAt'>) => void;
  updateAchievement: (id: string, updates: Partial<Achievement>) => void;
  deleteAchievement: (id: string) => void;

  addPerformanceNote: (entry: Omit<PerformanceNote, 'id' | 'createdAt'>) => void;
  deletePerformanceNote: (id: string) => void;

  updateCareerGrowth: (employeeId: string, data: Partial<CareerGrowth>) => void;

  addSkill: (entry: Omit<Skill, 'id' | 'updatedAt'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;

  addMoodCheckin: (entry: Omit<MoodCheckin, 'id' | 'createdAt'>) => void;
  deleteMoodCheckin: (id: string) => void;

  addActionItem: (entry: Omit<ActionItem, 'id' | 'createdAt'>) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (id: string) => void;

  getModuleConfigs: (employeeId: string) => ModuleConfig[];
  updateModuleConfigs: (employeeId: string, configs: ModuleConfig[]) => void;

  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('em-employees', SEED_EMPLOYEES));
  const [goals, setGoals] = useState<Goal[]>(() => loadFromStorage('em-goals', []));
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>(() => loadFromStorage('em-1on1s', []));
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadFromStorage('em-achievements', []));
  const [performanceNotes, setPerformanceNotes] = useState<PerformanceNote[]>(() => loadFromStorage('em-perfnotes', []));
  const [careerGrowth, setCareerGrowth] = useState<CareerGrowth[]>(() => loadFromStorage('em-career', []));
  const [skills, setSkills] = useState<Skill[]>(() => loadFromStorage('em-skills', []));
  const [moodCheckins, setMoodCheckins] = useState<MoodCheckin[]>(() => loadFromStorage('em-mood', []));
  const [actionItems, setActionItems] = useState<ActionItem[]>(() => loadFromStorage('em-actions', []));
  const [moduleConfigs, setModuleConfigs] = useState<Record<string, ModuleConfig[]>>(() => loadFromStorage('em-modules', {}));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(() => loadFromStorage('em-selected', SEED_EMPLOYEES[0]?.id || null));

  // Persist all state
  useEffect(() => { saveToStorage('em-employees', employees); }, [employees]);
  useEffect(() => { saveToStorage('em-goals', goals); }, [goals]);
  useEffect(() => { saveToStorage('em-1on1s', oneOnOnes); }, [oneOnOnes]);
  useEffect(() => { saveToStorage('em-achievements', achievements); }, [achievements]);
  useEffect(() => { saveToStorage('em-perfnotes', performanceNotes); }, [performanceNotes]);
  useEffect(() => { saveToStorage('em-career', careerGrowth); }, [careerGrowth]);
  useEffect(() => { saveToStorage('em-skills', skills); }, [skills]);
  useEffect(() => { saveToStorage('em-mood', moodCheckins); }, [moodCheckins]);
  useEffect(() => { saveToStorage('em-actions', actionItems); }, [actionItems]);
  useEffect(() => { saveToStorage('em-modules', moduleConfigs); }, [moduleConfigs]);
  useEffect(() => { saveToStorage('em-selected', selectedEmployeeId); }, [selectedEmployeeId]);

  const now = () => new Date().toISOString();

  const store: StoreState = {
    employees, goals, oneOnOnes, achievements, performanceNotes,
    careerGrowth, skills, moodCheckins, actionItems, moduleConfigs, selectedEmployeeId,

    setSelectedEmployee: setSelectedEmployeeId,

    addGoal: useCallback((goal) => setGoals(prev => [...prev, { ...goal, id: generateId(), createdAt: now(), updatedAt: now() }]), []),
    updateGoal: useCallback((id, updates) => setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: now() } : g)), []),
    deleteGoal: useCallback((id) => setGoals(prev => prev.filter(g => g.id !== id)), []),

    addOneOnOne: useCallback((entry) => setOneOnOnes(prev => [...prev, { ...entry, id: generateId(), createdAt: now() }]), []),
    updateOneOnOne: useCallback((id, updates) => setOneOnOnes(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e)), []),
    deleteOneOnOne: useCallback((id) => setOneOnOnes(prev => prev.filter(e => e.id !== id)), []),

    addAchievement: useCallback((entry) => setAchievements(prev => [...prev, { ...entry, id: generateId(), createdAt: now() }]), []),
    updateAchievement: useCallback((id, updates) => setAchievements(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e)), []),
    deleteAchievement: useCallback((id) => setAchievements(prev => prev.filter(e => e.id !== id)), []),

    addPerformanceNote: useCallback((entry) => setPerformanceNotes(prev => [...prev, { ...entry, id: generateId(), createdAt: now() }]), []),
    deletePerformanceNote: useCallback((id) => setPerformanceNotes(prev => prev.filter(e => e.id !== id)), []),

    updateCareerGrowth: useCallback((employeeId, data) => {
      setCareerGrowth(prev => {
        const existing = prev.find(c => c.employeeId === employeeId);
        if (existing) {
          return prev.map(c => c.employeeId === employeeId ? { ...c, ...data, updatedAt: now() } : c);
        }
        return [...prev, { id: generateId(), employeeId, currentLevel: '', targetLevel: '', readinessScore: 5, eligibleBy: '', gaps: '', evidence: [], updatedAt: now(), ...data }];
      });
    }, []),

    addSkill: useCallback((entry) => setSkills(prev => [...prev, { ...entry, id: generateId(), updatedAt: now() }]), []),
    updateSkill: useCallback((id, updates) => setSkills(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: now() } : s)), []),
    deleteSkill: useCallback((id) => setSkills(prev => prev.filter(s => s.id !== id)), []),

    addMoodCheckin: useCallback((entry) => setMoodCheckins(prev => [...prev, { ...entry, id: generateId(), createdAt: now() }]), []),
    deleteMoodCheckin: useCallback((id) => setMoodCheckins(prev => prev.filter(e => e.id !== id)), []),

    addActionItem: useCallback((entry) => setActionItems(prev => [...prev, { ...entry, id: generateId(), createdAt: now() }]), []),
    updateActionItem: useCallback((id, updates) => setActionItems(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a)), []),
    deleteActionItem: useCallback((id) => setActionItems(prev => prev.filter(a => a.id !== id)), []),

    getModuleConfigs: useCallback((employeeId: string) => {
      return moduleConfigs[employeeId] || [...DEFAULT_MODULES];
    }, [moduleConfigs]),

    updateModuleConfigs: useCallback((employeeId: string, configs: ModuleConfig[]) => {
      setModuleConfigs(prev => ({ ...prev, [employeeId]: configs }));
    }, []),

    addEmployee: useCallback((employee) => setEmployees(prev => [...prev, { ...employee, id: generateId() }]), []),
    updateEmployee: useCallback((id, updates) => setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e)), []),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
