import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Target, CheckSquare, Users, Calendar, AlertCircle, Pencil } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { useState } from 'react';
import { ActionStatus } from '@/types/employee';

export default function TeamDashboard() {
  const { employees, teamGoals, actionItems, updateActionItem } = useStore();
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ assignedTo: '', status: '' as ActionStatus });

  // Process action items with overdue status
  const allActionItems = actionItems.map(item => {
    if (item.status !== 'completed' && item.dueDate && isPast(parseISO(item.dueDate))) {
      return { ...item, status: 'overdue' as const };
    }
    return item;
  });

  const pendingActions = allActionItems.filter(item => item.status !== 'completed');
  const overdueActions = allActionItems.filter(item => item.status === 'overdue');

  const handleEditAction = (actionId: string, assignedTo?: string, status?: ActionStatus) => {
    setEditingAction(actionId);
    setEditForm({ 
      assignedTo: assignedTo || '', 
      status: status || 'pending' 
    });
  };

  const handleSaveAction = () => {
    if (editingAction) {
      updateActionItem(editingAction, {
        assignedTo: editForm.assignedTo || undefined,
        status: editForm.status
      });
      setEditingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'at-risk': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'done': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'blocked': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="font-heading text-2xl text-foreground">Team Dashboard</h1>
            <Badge variant="secondary" className="ml-2">{employees.length} members</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Overview of team goals and key actions</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Team Goals Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Team Goals
              <Badge variant="outline">{teamGoals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamGoals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No team goals set yet</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {teamGoals.map((goal) => (
                  <div key={goal.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground">{goal.title}</h3>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{goal.timeframe}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Key Actions
              <Badge variant="outline">{pendingActions.length}</Badge>
              {overdueActions.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {overdueActions.length} overdue
                </Badge>
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
                    <div 
                      key={action.id} 
                      className={`border rounded-lg p-4 space-y-3 ${isOverdue ? 'border-destructive/30 bg-destructive/5' : 'border-border'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            For: {employee?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(action.status)}>
                            {action.status}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditAction(action.id, action.assignedTo, action.status)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Action Item</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label htmlFor="assignedTo">Assigned To</Label>
                                  <Input
                                    id="assignedTo"
                                    value={editForm.assignedTo}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                                    placeholder="Enter person's name"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as ActionStatus }))}>
                                    <SelectTrigger id="status">
                                      <SelectValue />
                                    </SelectTrigger>
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
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            Owner: {action.owner === 'manager' ? 'Manager' : 'Employee'}
                          </span>
                          {action.assignedTo && (
                            <span className="font-medium text-foreground">
                              Assigned: {action.assignedTo}
                            </span>
                          )}
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