import { useStore } from '@/store/useStore';
import { Users, Target, Plus, CheckSquare, AlertCircle } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
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

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-sidebar-foreground flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-sidebar-primary" />
            Team Goals
          </h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Goal</DialogTitle>
                <DialogDescription>Create a new goal for the entire team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select value={newGoal.timeframe} onValueChange={(v) => setNewGoal({ ...newGoal, timeframe: v as GoalTimeframe })}>
                      <SelectTrigger id="timeframe">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quarter">Quarter (optional)</Label>
                    <Input id="quarter" placeholder="Q1 2026" value={newGoal.quarter} onChange={(e) => setNewGoal({ ...newGoal, quarter: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  addTeamGoal(newGoal);
                  setNewGoal({ title: '', description: '', status: 'on-track', progress: 0, timeframe: 'quarterly', quarter: '' });
                  setDialogOpen(false);
                }}>Add Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {teamGoals.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No team goals yet</p>
          ) : (
            teamGoals.map((goal) => {
              const statusColors = {
                'on-track': 'bg-green-500/10 text-green-700',
                'at-risk': 'bg-yellow-500/10 text-yellow-700',
                'done': 'bg-blue-500/10 text-blue-700',
                'blocked': 'bg-red-500/10 text-red-700',
              };
              return (
                <div key={goal.id} className="bg-sidebar-accent/30 rounded p-2 text-xs">
                  <div className="font-medium text-sidebar-foreground truncate">{goal.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[goal.status]}`}>
                      {goal.status}
                    </span>
                    <span className="text-muted-foreground">{goal.progress}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Private · Local Only</p>
      </div>
    </aside>
  );
}
