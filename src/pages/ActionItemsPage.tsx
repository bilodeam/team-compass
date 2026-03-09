import { useStore } from '@/store/useStore';
import { format, isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Clock, AlertTriangle, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActionItemsPage() {
  const navigate = useNavigate();
  const { employees, actionItems, updateActionItem, deleteActionItem } = useStore();

  // Calculate action items with overdue status
  const allActionItems = actionItems.map(item => {
    if (item.status !== 'completed' && item.dueDate && isPast(parseISO(item.dueDate))) {
      return { ...item, status: 'overdue' as const };
    }
    return item;
  });

  const activeItems = allActionItems.filter(item => item.status !== 'completed');
  const completedItems = allActionItems.filter(item => item.status === 'completed');

  const handleStatusChange = (itemId: string, newStatus: string) => {
    updateActionItem(itemId, { status: newStatus as any });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

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
                <CheckSquare className="h-6 w-6 text-primary" />
                Action Items
              </h1>
              <p className="text-muted-foreground">Manage all team action items</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {activeItems.length} active • {completedItems.length} completed
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Active Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Active Items ({activeItems.length})
              </CardTitle>
              <CardDescription>
                Tasks that need attention from you or your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active action items. Great job staying on top of things! 🎉
                </p>
              ) : (
                <div className="space-y-3">
                  {activeItems.map((item) => {
                    const employee = employees.find(emp => emp.id === item.employeeId);
                    const isOverdue = item.status === 'overdue';
                    
                    return (
                      <div key={item.id} className={`p-4 rounded-lg border ${isOverdue ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                                {item.title}
                              </h3>
                              <Badge variant="outline" className={getStatusColor(item.status)}>
                                {getStatusIcon(item.status)}
                                {item.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                <strong>Assigned to:</strong> {employee?.name || 'Unknown'}
                              </span>
                              <span>
                                <strong>Owner:</strong> {item.owner === 'manager' ? 'You' : 'Employee'}
                              </span>
                              {item.dueDate && (
                                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                                  <strong>Due:</strong> {format(parseISO(item.dueDate), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Select value={item.status} onValueChange={(value) => handleStatusChange(item.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteActionItem(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Completed Items ({completedItems.length})
              </CardTitle>
                <CardDescription>
                  Recently completed action items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedItems.slice(0, 10).map((item) => {
                    const employee = employees.find(emp => emp.id === item.employeeId);
                    
                    return (
                      <div key={item.id} className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-muted-foreground line-through">
                                {item.title}
                              </h3>
                              <Badge variant="outline" className={getStatusColor('completed')}>
                                <Check className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{employee?.name || 'Unknown'}</span>
                              <span>{item.owner === 'manager' ? 'You' : 'Employee'}</span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleStatusChange(item.id, 'pending')}
                            className="text-muted-foreground hover:text-primary"
                          >
                            Reopen
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {completedItems.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Showing recent 10 of {completedItems.length} completed items
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