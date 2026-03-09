import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { GoalTracker } from '@/components/modules/GoalTracker';
import { OneOnOneRecaps } from '@/components/modules/OneOnOneRecaps';
import { Achievements } from '@/components/modules/Achievements';
import { PerformanceNotes } from '@/components/modules/PerformanceNotes';
import { CareerGrowthModule } from '@/components/modules/CareerGrowth';
import { SkillMatrix } from '@/components/modules/SkillMatrix';
import { MoodCheckins } from '@/components/modules/MoodCheckins';
import { ActionItems } from '@/components/modules/ActionItems';
import { ModuleType } from '@/types/employee';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MODULE_COMPONENTS: Record<ModuleType, React.ComponentType<{ employeeId: string }>> = {
  'goals': GoalTracker,
  'one-on-ones': OneOnOneRecaps,
  'achievements': Achievements,
  'performance-notes': PerformanceNotes,
  'career-growth': CareerGrowthModule,
  'skill-matrix': SkillMatrix,
  'mood-checkins': MoodCheckins,
  'action-items': ActionItems,
};

export function EmployeeProfile() {
  const { employees, selectedEmployeeId, getModuleConfigs, actionItems, updateEmployee } = useStore();
  const employee = employees.find(e => e.id === selectedEmployeeId);
  const [activeTab, setActiveTab] = useState<ModuleType>('goals');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    team: '',
    currentLevel: '',
    startDate: '',
    targetLevel: ''
  });

  useEffect(() => {
    if (employee) {
      setEditForm({
        name: employee.name,
        role: employee.role,
        team: employee.team,
        currentLevel: employee.currentLevel,
        startDate: employee.startDate,
        targetLevel: employee.targetLevel
      });
    }
  }, [employee]);

  const handleSave = () => {
    if (employee) {
      updateEmployee(employee.id, editForm);
      setEditOpen(false);
    }
  };

  if (!employee) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="font-heading text-lg">Select a team member</p>
      </div>
    );
  }

  const configs = getModuleConfigs(employee.id).filter(m => m.enabled).sort((a, b) => a.order - b.order);
  const initials = employee.name.split(' ').map(n => n[0]).join('');
  const overdueActions = actionItems.filter(a => a.employeeId === employee.id && a.status !== 'completed' && a.dueDate && new Date(a.dueDate) < new Date()).length;

  // Set default active tab to first enabled module
  if (configs.length > 0 && !configs.find(c => c.type === activeTab)) {
    setActiveTab(configs[0].type);
  }

  const ActiveComponent = MODULE_COMPONENTS[activeTab];

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full max-w-5xl mx-auto px-6 py-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
            style={{ backgroundColor: employee.avatarColor, color: 'white' }}
          >
            {initials}
          </div>
          <div>
            <h1 className="font-heading text-2xl text-foreground">{employee.name}</h1>
            <p className="text-sm text-muted-foreground">
              {employee.role} · {employee.team} · {employee.currentLevel}
              <span className="mx-1.5">·</span>
              Joined {format(new Date(employee.startDate), 'MMM yyyy')}
            </p>
          </div>
          {overdueActions > 0 && (
            <div className="ml-auto px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
              {overdueActions} overdue
            </div>
          )}
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
          {configs.map(config => (
            <button
              key={config.type}
              onClick={() => setActiveTab(config.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === config.type
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <span className="text-base">{config.emoji}</span>
              {config.label}
            </button>
          ))}
        </div>

        {/* Active Module Content */}
        <div className="flex-1 overflow-y-auto">
          {ActiveComponent && <ActiveComponent employeeId={employee.id} />}
        </div>
      </div>
    </div>
  );
}
