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
  const { employees, selectedEmployeeId, getModuleConfigs, actionItems } = useStore();
  const employee = employees.find(e => e.id === selectedEmployeeId);

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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
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

        {/* Modules */}
        {configs.map(config => {
          const Component = MODULE_COMPONENTS[config.type];
          return <Component key={config.type} employeeId={employee.id} />;
        })}
      </div>
    </div>
  );
}
