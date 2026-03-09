import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, ArrowLeft, Plus, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { GoalStatus, GoalTimeframe } from '@/types/employee';

export default function GoalsPage() {
  const navigate = useNavigate();
  const { teamGoals, addTeamGoal, updateTeamGoal, deleteTeamGoal } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    description: '', 
    status: 'on-track' as GoalStatus, 
    progress: 0, 
    timeframe: 'quarterly' as GoalTimeframe, 
    quarter: '' 
  });

  const handleStatusChange = (goalId: string, newStatus: GoalStatus) => {
    updateTeamGoal(goalId, { status: newStatus });
  };

  const handleProgressChange = (goalId: string, newProgress: number) => {
    updateTeamGoal(goalId, { progress: newProgress });
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'on-track': return 'bg-secondary/80 text-secondary-foreground border-secondary';
      case 'at-risk': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'done': return 'bg-primary/10 text-primary border-primary/20';
      case 'blocked': return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const activeGoals = teamGoals.filter(goal => goal.status !== 'done');
  const completedGoals = teamGoals.filter(goal => goal.status === 'done');

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Team Goals
              </h1>
              <p className="text-muted-foreground">Track and manage team objectives</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {activeGoals.length} active • {completedGoals.length} completed
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Goal
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
                    <Input 
                      id="title" 
                      value={newGoal.title} 
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newGoal.description} 
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeframe">Timeframe</Label>
                      <Select 
                        value={newGoal.timeframe} 
                        onValueChange={(v) => setNewGoal({ ...newGoal, timeframe: v as GoalTimeframe })}
                      >
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
                      <Input 
                        id="quarter" 
                        placeholder="Q1 2026" 
                        value={newGoal.quarter} 
                        onChange={(e) => setNewGoal({ ...newGoal, quarter: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    addTeamGoal(newGoal);
                    setNewGoal({ title: '', description: '', status: 'on-track', progress: 0, timeframe: 'quarterly', quarter: '' });
                    setDialogOpen(false);
                  }}>
                    Add Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Active Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Active Goals ({activeGoals.length})
              </CardTitle>
              <CardDescription>
                Current team objectives and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active goals. Create your first team goal to get started! 🎯
                </p>
              ) : (
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <div key={goal.id} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{goal.title}</h3>
                            <Badge variant="outline" className={getStatusColor(goal.status)}>
                              {goal.status.replace('-', ' ')}
                            </Badge>
                            {goal.quarter && (
                              <Badge variant="secondary">
                                {goal.quarter}
                              </Badge>
                            )}
                          </div>
                          
                          {goal.description && (
                            <p className="text-muted-foreground mb-3">
                              {goal.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium">Progress:</span>
                            <Progress value={goal.progress} className="flex-1" />
                            <span className="text-sm text-muted-foreground min-w-[3rem]">
                              {goal.progress}%
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              <strong>Timeframe:</strong> {goal.timeframe}
                            </span>
                            <span>
                              <strong>Created:</strong> {format(new Date(goal.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <Select 
                            value={goal.status} 
                            onValueChange={(value) => handleStatusChange(goal.id, value as GoalStatus)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on-track">On Track</SelectItem>
                              <SelectItem value="at-risk">At Risk</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select 
                            value={goal.progress.toString()} 
                            onValueChange={(value) => handleProgressChange(goal.id, parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 11 }, (_, i) => i * 10).map((progress) => (
                                <SelectItem key={progress} value={progress.toString()}>
                                  {progress}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteTeamGoal(goal.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Completed Goals ({completedGoals.length})
                </CardTitle>
                <CardDescription>
                  Successfully achieved team objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedGoals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="p-4 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-muted-foreground">
                              {goal.title}
                            </h3>
                            <Badge variant="outline" className={getStatusColor('done')}>
                              Completed
                            </Badge>
                            {goal.quarter && (
                              <Badge variant="secondary">
                                {goal.quarter}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Progress value={100} className="flex-1" />
                            <span className="text-sm text-muted-foreground">100%</span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Completed on {format(new Date(goal.updatedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleStatusChange(goal.id, 'on-track')}
                          className="text-muted-foreground hover:text-primary"
                        >
                          Reopen
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {completedGoals.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing recent 5 of {completedGoals.length} completed goals
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}