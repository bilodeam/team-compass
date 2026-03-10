import { useStore } from '@/store/useStore';
import { Users, Target, Plus, CheckSquare, AlertCircle, ClipboardList, LogOut, KeyRound } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoalStatus, GoalTimeframe } from '@/types/employee';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export function EmployeeSidebar() {
  const navigate = useNavigate();
  const { isManager, profile, signOut } = useAuth();
  const { employees, selectedEmployeeId, setSelectedEmployee, teamGoals, addTeamGoal, actionItems } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', status: 'on-track' as GoalStatus, progress: 0, timeframe: 'quarterly' as GoalTimeframe, quarter: '' });

  // Change password state
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePassword() {
    setPwError('');
    if (pwForm.newPassword.length < 4) {
      setPwError('Password must be at least 4 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
    setPwLoading(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess(true);
      setPwForm({ newPassword: '', confirm: '' });
      setTimeout(() => {
        setPwSuccess(false);
        setPwOpen(false);
      }, 2000);
    }
  }

  const visibleActionItems = isManager
    ? actionItems
    : actionItems.filter(item => item.employeeId === profile?.employee_id);

  const allActionItems = visibleActionItems.map(item => {
    if (item.status !== 'completed' && item.dueDate && isPast(parseISO(item.dueDate))) {
      return { ...item, status: 'overdue' as const };
    }
    return item;
  });

  const pendingItems = allActionItems.filter(item => item.status !== 'completed').slice(0, 5);
  const overdueCount = allActionItems.filter(item => item.status === 'overdue').length;

  const currentEmployee = !isManager
    ? employees.find(e => e.id === profile?.employee_id)
    : null;

  // Separate Maxence (emp-0) from the rest of the team
  const managerEmployee = employees.find(e => e.id === 'emp-0');
  const teamEmployees = employees.filter(e => e.id !== 'emp-0');

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-sidebar flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-border">
        <h1 className="font-heading text-xl text-sidebar-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-sidebar-primary" />
          Pit Crew
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isManager ? 'Manager view' : currentEmployee?.name || 'Employee view'}
        </p>
      </div>

      {/* Nav buttons */}
      <div className="p-3 border-b border-border space-y-1.5">
        {isManager && (
          <Button variant="default" className="w-full justify-start gap-2" onClick={() => navigate('/team')}>
            <Target className="h-4 w-4" />
            Team Overview
          </Button>
        )}
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/goals-survey')}>
          <ClipboardList className="h-4 w-4" />
          Goals Survey
        </Button>
      </div>

      {/* Manager: employee list */}
      {isManager && (
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">

          {/* Maxence — special "You" card */}
          {managerEmployee && (
            <>
              <button
                onClick={() => setSelectedEmployee(managerEmployee.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 border ${
                  selectedEmployeeId === managerEmployee.id
                    ? 'bg-primary/10 border-primary/30 text-sidebar-accent-foreground'
                    : 'border-primary/20 bg-primary/5 text-sidebar-foreground hover:bg-primary/10'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ backgroundColor: managerEmployee.avatarColor, color: 'white' }}
                >
                  {managerEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{managerEmployee.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{managerEmployee.currentLevel}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium shrink-0">You</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Team</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {/* Rest of the team */}
          {teamEmployees.map((emp) => {
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
      )}

      {/* Employee self card — employee only */}
      {!isManager && currentEmployee && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ backgroundColor: currentEmployee.avatarColor, color: 'white' }}
            >
              {currentEmployee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{currentEmployee.name}</div>
              <div className="text-xs text-muted-foreground truncate">{currentEmployee.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Team Goals — manager only */}
      {isManager && (
        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/team')}
              className="text-sm font-semibold text-sidebar-foreground flex items-center gap-1.5 hover:text-sidebar-primary transition-colors"
            >
              <Target className="h-3.5 w-3.5 text-sidebar-primary" />
              Team Goals
            </button>
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
                        <SelectTrigger id="timeframe"><SelectValue /></SelectTrigger>
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
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {teamGoals.length === 0 ? null : (
              teamGoals.map((goal) => {
                const statusColors = {
                  'on-track': 'bg-green-500/10 text-green-700',
                  'at-risk': 'bg-yellow-500/10 text-yellow-700',
                  'done': 'bg-blue-500/10 text-blue-700',
                  'blocked': 'bg-red-500/10 text-red-700',
                };
                return (
                  <button
                    key={goal.id}
                    onClick={() => navigate('/team')}
                    className="w-full text-left bg-sidebar-accent/30 rounded p-2 text-xs hover:bg-sidebar-accent/50 transition-colors"
                  >
                    <div className="font-medium text-sidebar-foreground truncate">{goal.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[goal.status]}`}>{goal.status}</span>
                      <span className="text-muted-foreground">{goal.progress}%</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className={cn("p-3 border-t border-border")}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => isManager ? navigate('/actions') : undefined}
            className={cn(
              "text-sm font-semibold text-sidebar-foreground flex items-center gap-1.5 transition-colors",
              isManager && "hover:text-sidebar-primary cursor-pointer"
            )}
          >
            <CheckSquare className="h-3.5 w-3.5 text-sidebar-primary" />
            {isManager ? 'Key Actions' : 'My Actions'}
            {overdueCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {overdueCount}
              </span>
            )}
          </button>
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-destructive/10 border border-destructive/20 mb-2">
            <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
            <span className="text-[10px] text-destructive font-medium">
              {overdueCount} overdue item{overdueCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {pendingItems.length === 0 ? null : (
            pendingItems.map((item) => {
              const employee = employees.find(emp => emp.id === item.employeeId);
              const isOverdue = item.status === 'overdue';
              return (
                <div key={item.id} className={`bg-sidebar-accent/30 rounded p-2 text-xs ${isOverdue ? 'border border-destructive/30' : ''}`}>
                  <div className={`font-medium truncate ${isOverdue ? 'text-destructive' : 'text-sidebar-foreground'}`}>
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                    {isManager && <span>{employee?.name || 'Unknown'}</span>}
                    <span>{item.owner === 'manager' ? (isManager ? 'You' : 'Manager') : 'You'}</span>
                  </div>
                  {item.dueDate && (
                    <div className={`text-[10px] mt-0.5 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                      Due {format(parseISO(item.dueDate), 'MMM d')}
                    </div>
                  )}
                </div>
              );
            })
          )}
          {visibleActionItems.filter(item => item.status !== 'completed').length > 5 && (
            <p className="text-[10px] text-muted-foreground">
              +{visibleActionItems.filter(item => item.status !== 'completed').length - 5} more items
            </p>
          )}
        </div>
      </div>

      {/* Footer — change password + sign out */}
      <div className="mt-auto border-t border-border p-3 space-y-1">
        <Dialog open={pwOpen} onOpenChange={(open) => { setPwOpen(open); setPwError(''); setPwSuccess(false); setPwForm({ newPassword: '', confirm: '' }); }}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
              <KeyRound className="h-4 w-4" />
              Change password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>Enter your new password below.</DialogDescription>
            </DialogHeader>
            {pwSuccess ? (
              <div className="py-6 text-center">
                <p className="text-emerald-600 font-medium">✓ Password updated successfully!</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 4 characters"
                    value={pwForm.newPassword}
                    onChange={e => { setPwForm(p => ({ ...p, newPassword: e.target.value })); setPwError(''); }}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat new password"
                    value={pwForm.confirm}
                    onChange={e => { setPwForm(p => ({ ...p, confirm: e.target.value })); setPwError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                  />
                </div>
                {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              </div>
            )}
            {!pwSuccess && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setPwOpen(false)}>Cancel</Button>
                <Button onClick={handleChangePassword} disabled={pwLoading || !pwForm.newPassword || !pwForm.confirm}>
                  {pwLoading ? 'Saving…' : 'Update Password'}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>

        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2 px-2">
          {isManager ? 'Manager · Team Compass' : 'Employee · Team Compass'}
        </p>
      </div>
    </aside>
  );
}
