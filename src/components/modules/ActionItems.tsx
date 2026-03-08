import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { ActionOwner, ActionStatus } from '@/types/employee';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

const STATUS_STYLES: Record<ActionStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/15 text-info',
  completed: 'bg-success/15 text-success',
  overdue: 'bg-destructive/15 text-destructive',
};

export function ActionItems({ employeeId }: { employeeId: string }) {
  const { actionItems, addActionItem, updateActionItem, deleteActionItem } = useStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState<ActionOwner>('employee');
  const [dueDate, setDueDate] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const allItems = actionItems.filter(a => a.employeeId === employeeId);

  // Auto-mark overdue
  const items = allItems.map(item => {
    if (item.status !== 'completed' && item.dueDate && isPast(parseISO(item.dueDate))) {
      return { ...item, status: 'overdue' as ActionStatus };
    }
    return item;
  });

  const active = items.filter(i => i.status !== 'completed').sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return (a.dueDate || '').localeCompare(b.dueDate || '');
  });

  const completed = items.filter(i => i.status === 'completed').sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  const overdueCount = active.filter(i => i.status === 'overdue').length;

  const handleAdd = () => {
    if (!title.trim()) return;
    addActionItem({ employeeId, title, owner, dueDate, status: 'pending' });
    setTitle(''); setOwner('employee'); setDueDate(''); setAdding(false);
  };

  const toggleComplete = (id: string, current: ActionStatus) => {
    if (current === 'completed') {
      updateActionItem(id, { status: 'pending', completedAt: undefined });
    } else {
      updateActionItem(id, { status: 'completed', completedAt: new Date().toISOString() });
    }
  };

  return (
    <CollapsibleModule emoji="✅" title="Action Items" count={active.length}>
      <div className="space-y-3">
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive font-medium">{overdueCount} overdue item{overdueCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {active.map(item => (
          <div key={item.id} className="flex items-start gap-2.5 p-2 rounded-md bg-muted/50 border border-border">
            <button onClick={() => toggleComplete(item.id, item.status)} className="mt-0.5 w-4 h-4 rounded border border-border hover:border-primary transition-colors shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-card-foreground">{item.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>{item.status}</span>
                <span className="text-[10px] text-muted-foreground">{item.owner === 'manager' ? '👤 You' : '👤 Employee'}</span>
                {item.dueDate && <span className="text-[10px] text-muted-foreground">Due {format(parseISO(item.dueDate), 'MMM d')}</span>}
              </div>
            </div>
            <button onClick={() => deleteActionItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}

        {adding ? (
          <div className="p-3 rounded-md border border-primary/30 bg-accent/30 space-y-2">
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Action item..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground" />
            <div className="flex items-center gap-2 flex-wrap">
              <select value={owner} onChange={(e) => setOwner(e.target.value as ActionOwner)} className="text-xs bg-muted border border-border rounded px-2 py-1 text-card-foreground">
                <option value="employee">Employee</option>
                <option value="manager">Manager (me)</option>
              </select>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-xs bg-muted border border-border rounded px-2 py-1 text-card-foreground" />
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90">Add</button>
              <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Action Item
          </button>
        )}

        {completed.length > 0 && (
          <button onClick={() => setShowCompleted(!showCompleted)} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {showCompleted ? 'Hide' : 'Show'} {completed.length} completed
          </button>
        )}

        {showCompleted && completed.map(item => (
          <div key={item.id} className="flex items-start gap-2.5 p-2 rounded-md opacity-50">
            <button onClick={() => toggleComplete(item.id, item.status)} className="mt-0.5 w-4 h-4 rounded bg-success/20 border border-success/30 flex items-center justify-center shrink-0">
              <span className="text-[8px] text-success">✓</span>
            </button>
            <p className="text-xs text-muted-foreground line-through flex-1">{item.title}</p>
          </div>
        ))}
      </div>
    </CollapsibleModule>
  );
}
