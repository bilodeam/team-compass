import { useStore } from '@/store/useStore';
import { Users, Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { GoalStatus, GoalTimeframe } from '@/types/employee';

export function EmployeeSidebar() {
  const { employees, selectedEmployeeId, setSelectedEmployee, teamGoals, addTeamGoal, updateTeamGoal, deleteTeamGoal } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', status: 'on-track' as GoalStatus, progress: 0, timeframe: 'quarterly' as GoalTimeframe, quarter: '' });

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-sidebar flex flex-col">
      <div className="p-5 border-b border-border">
        <h1 className="font-heading text-xl text-sidebar-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-sidebar-primary" />
          Team Dashboard
        </h1>
        <p className="text-xs text-muted-foreground mt-1">6 direct reports</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {employees.map((emp) => {
          const isActive = emp.id === selectedEmployeeId;
          const initials = emp.name.split(' ').map(n => n[0]).join('');
          return (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-soft'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ backgroundColor: emp.avatarColor, color: 'white' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{emp.name}</div>
                <div className="text-xs text-muted-foreground truncate">{emp.role}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Private · Local Only</p>
      </div>
    </aside>
  );
}
