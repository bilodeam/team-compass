import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Target, CheckSquare, Users, Calendar, AlertCircle, Pencil, Home, Plus, UserPlus, TrendingUp } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { useState } from 'react';
import { ActionStatus, GoalStatus } from '@/types/employee';
import { Link, useNavigate } from 'react-router-dom';

const AVATAR_COLORS = [
  'hsl(220, 70%, 55%)', 'hsl(160, 60%, 45%)', 'hsl(340, 65%, 50%)',
  'hsl(30, 75%, 50%)', 'hsl(270, 60%, 55%)', 'hsl(190, 70%, 45%)',
];

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; bar: string }> = {
  'on-track': { label: 'On Track', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', bar: 'bg-emerald-500' },
  'at-risk':  { label: 'At Risk',  color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',   bar: 'bg-amber-500'   },
  'done':     { label: 'Done',     color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',       bar: 'bg-blue-500'    },
  'blocked':  { label: 'Blocked',  color: 'bg-red-500/10 text-red-700 border-red-500/20',          bar: 'bg-red-500'     },
};

export default function TeamDashboard() {
  const { employees, goals, teamGoals, actionItems, updateActionItem, addEmployee, setSelectedEmployee } = useStore();
  const navigate = useNavigate();
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ assignedTo: '', status: '' as ActionStatus });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', startDate: '' });
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all');

  // Process action items with overdue status
  const allActionItems = actionItems.map(item => {
    if (item.status !== 'completed' && item.dueDate && isPast(parseISO(item.dueDate))) {
      return { ...item, status: 'overdue' as const };
    }
    return item;
  });

  const pendingActions = allActionItems.filter(item => item.status !== 'completed');
  const overdueActions = allActionItems.filter(item => item.status === 'overdue');

  // All individual goals across all employees
  const allGoals = goals.filter(g => statusFilter === 'all' || g.status === statusFilter);

  // Stats
  const totalGoals = goals.length;
  const onTrackCount = goals.filter(g => g.status === 'on-track').length;
  const atRiskCount = goals.filter(g => g.status === 'at-risk').length;
  const doneCount = goals.filter(g => g.status === 'done').length;
  const blockedCount = goals.filter(g => g.status === 'blocked').length;
  const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / totalGoals) : 0;

  const handleEditAction = (actionId: string, assignedTo?: string, status?: ActionStatus) => {
    setEditingAction(actionId);
    setEditForm({ assignedTo: assignedTo || '', status: status || 'pending' });
  };

  const handleSaveAction = () => {
    if (editingAction) {
      updateActionItem(editingAction, { assignedTo: editForm.assignedTo || undefined, status: editForm.status });
      setEditingAction(null);
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name.trim()) return;
    const color = AVATAR_COLORS[employees.length % AVATAR_COLORS.length];
    addEmployee({
      name: newEmployee.name.trim(),
      role: newEmployee.role.trim() || 'Product Engineer',
      avatarColor: color,
      startDate: newEmployee.startDate || new Date().toISOString().split('T')[0],
      currentLevel: '',
      targetLevel: '',
    });
    setNewEmployee({ name: '', role: '', startDate: '' });
    setIsAddOpen(false);
  };

  const handleEmployeeClick = (id: string) => {
    setSelectedEmployee(id);
    navigate('/');
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': case 'completed': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'at-risk': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'done': case 'in-progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'blocked': case 'overdue': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="font-heading text-2xl text-foreground">Team Dashboard</h1>
              <Badge variant="secondary" className="ml-2">{employees.length} members</Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/"><Home className="h-4 w-4 mr-2" />Home</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">Overview of team goals and key actions</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Team Members
                <Badge variant="outline">{employees.length}</Badge>
              </CardTitle>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Employee</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="emp-name">Name *</Label>
                      <Input id="emp-name" value={newEmployee.name} onChange={e => setNewEmployee(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
                    </div>
                    <div>
                      <Label htmlFor="emp-role">Role</Label>
                      <Input id="emp-role" value={newEmployee.role} onChange={e => setNewEmployee(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Product Engineer" />
                    </div>
                    <div>
                      <Label htmlFor="emp-start">Start Date</Label>
                      <Input id="emp-start" type="date" value={newEmployee.startDate} onChange={e => setNewEmployee(p => ({ ...p, startDate: e.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddEmployee} disabled={!newEmployee.name.trim()}>Add Employee</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map(emp => {
                const empGoals = goals.filter(g => g.employeeId === emp.id);
                const empOnTrack = empGoals.filter(g => g.status === 'on-track').length;
                const empAtRisk = empGoals.filter(g => g.status === 'at-risk').length;
                const empBlocked = empGoals.filter(g => g.status === 'blocked').length;
                return (
                  <button
                    key={emp.id}
                    onClick={() => handleEmployeeClick(emp.id)}
                    className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent/50"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback style={{ backgroundColor: emp.avatarColor }} className="text-white text-sm font-semibold">
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{emp.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp.currentLevel ? `${emp.role} ${emp.currentLevel}` : emp.role}</p>
                      {empGoals.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">{empGoals.length} goal{empGoals.length !== 1 ? 's' : ''}</span>
                          {empOnTrack > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">{empOnTrack} on track</span>}
                          {empAtRisk > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700">{empAtRisk} at risk</span>}
                          {empBlocked > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-700">{empBlocked} blocked</span>}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Goals — individual goals from all employees */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Team Goals</CardTitle>
                <Badge variant="outline">{totalGoals}</Badge>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-2 flex-wrap">
                {totalGoals > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    Avg {avgProgress}% complete
                  </div>
                )}
                <button onClick={() => setStatusFilter('all')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${statusFilter === 'all' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>All</button>
                <button onClick={() => setStatusFilter('on-track')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${statusFilter === 'on-track' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-border text-muted-foreground hover:border-emerald-400'}`}>On Track {onTrackCount > 0 && `(${onTrackCount})`}</button>
                <button onClick={() => setStatusFilter('at-risk')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${statusFilter === 'at-risk' ? 'bg-amber-500 text-white border-amber-500' : 'border-border text-muted-foreground hover:border-amber-400'}`}>At Risk {atRiskCount > 0 && `(${atRiskCount})`}</button>
                <button onClick={() => setStatusFilter('blocked')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${statusFilter === 'blocked' ? 'bg-red-600 text-white border-red-600' : 'border-border text-muted-foreground hover:border-red-400'}`}>Blocked {blockedCount > 0 && `(${blockedCount})`}</button>
                <button onClick={() => setStatusFilter('done')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${statusFilter === 'done' ? 'bg-blue-600 text-white border-blue-600' : 'border-border text-muted-foreground hover:border-blue-400'}`}>Done {doneCount > 0 && `(${doneCount})`}</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {allGoals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {statusFilter === 'all' ? 'No goals added yet — add them in each employee profile' : `No ${statusFilter} goals`}
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {allGoals.map((goal) => {
                  const emp = employees.find(e => e.id === goal.employeeId);
                  const cfg = STATUS_CONFIG[goal.status];
                  return (
                    <button
                      key={goal.id}
                      onClick={() => emp && handleEmployeeClick(emp.id)}
                      className="group text-left border border-border rounded-xl p-4 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all bg-card"
                    >
                      {/* Owner + status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {emp && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: emp.avatarColor }}
                            >
                              {getInitials(emp.name)}
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground truncate">{emp?.name || 'Unknown'}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Title */}
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{goal.description}</p>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{goal.timeframe}{goal.quarter ? ` · ${goal.quarter}` : ''}</span>
                          <span className="font-medium text-foreground">{goal.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${cfg.bar}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Key Actions
              <Badge variant="outline">{pendingActions.length}</Badge>
              {overdueActions.length > 0 && (
                <Badge variant="destructive" className="ml-2">{overdueActions.length} overdue</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingActions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending actions</p>
            ) : (
              <div className="space-y-3">
                {pendingActions.map((action) => {
                  const employee = employees.find(emp => emp.id === action.employeeId);
                  const isOverdue = action.status === 'overdue';
                  return (
                    <div key={action.id} className={`border rounded-lg p-4 space-y-3 ${isOverdue ? 'border-destructive/30 bg-destructive/5' : 'border-border'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {employee && (
                            <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                              <AvatarFallback style={{ backgroundColor: employee.avatarColor }} className="text-white text-[10px] font-semibold">
                                {getInitials(employee.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="min-w-0">
                            <h3 className={`font-semibold text-sm ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>{action.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{employee?.name || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={getActionStatusColor(action.status)}>{action.status}</Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleEditAction(action.id, action.assignedTo, action.status)} className="h-8 w-8 p-0">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Action Item</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label htmlFor="assignedTo">Assigned To</Label>
                                  <Input id="assignedTo" value={editForm.assignedTo} onChange={(e) => setEditForm(prev => ({ ...prev, assignedTo: e.target.value }))} placeholder="Enter person's name" />
                                </div>
                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as ActionStatus }))}>
                                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingAction(null)}>Cancel</Button>
                                <Button onClick={handleSaveAction}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">Owner: {action.owner === 'manager' ? 'Manager' : 'Employee'}</span>
                          {action.assignedTo && <span className="font-medium text-foreground">Assigned: {action.assignedTo}</span>}
                        </div>
                        {action.dueDate && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Calendar className="h-3 w-3" />
                            <span>Due {format(parseISO(action.dueDate), 'MMM d, yyyy')}</span>
                            {isOverdue && <AlertCircle className="h-3 w-3" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}