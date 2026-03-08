import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { Goal, GoalStatus, GoalTimeframe } from '@/types/employee';
import { Plus, Trash2 } from 'lucide-react';

const STATUS_STYLES: Record<GoalStatus, string> = {
  'on-track': 'bg-success/15 text-success',
  'at-risk': 'bg-warning/15 text-warning',
  'done': 'bg-muted text-muted-foreground',
  'blocked': 'bg-destructive/15 text-destructive',
};

const STATUS_LABELS: Record<GoalStatus, string> = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'done': 'Done',
  'blocked': 'Blocked',
};

export function GoalTracker({ employeeId }: { employeeId: string }) {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState<GoalTimeframe>('quarterly');

  const empGoals = goals.filter(g => g.employeeId === employeeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal({ employeeId, title, description, status: 'on-track', progress: 0, timeframe, quarter: 'Q1 2026', linkedOKR: '' });
    setTitle(''); setDescription(''); setAdding(false);
  };

  return (
    <CollapsibleModule emoji="🎯" title="Goal Tracker" count={empGoals.length}>
      <div className="space-y-3">
        {empGoals.map(goal => (
          <div key={goal.id} className="p-3 rounded-md bg-muted/50 border border-border space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-card-foreground">{goal.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[goal.status]}`}>
                    {STATUS_LABELS[goal.status]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{goal.timeframe} · {goal.quarter}</span>
                </div>
                {goal.description && <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>}
              </div>
              <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-8 text-right">{goal.progress}%</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['on-track', 'at-risk', 'done', 'blocked'] as GoalStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => updateGoal(goal.id, { status: s })}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    goal.status === s ? STATUS_STYLES[s] + ' border-current' : 'border-border text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={goal.progress}
                onChange={(e) => updateGoal(goal.id, { progress: Number(e.target.value) })}
                className="ml-auto w-20 h-1 accent-primary"
              />
            </div>
          </div>
        ))}

        {adding ? (
          <div className="p-3 rounded-md border border-primary/30 bg-accent/30 space-y-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title..."
              className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground focus:outline-none text-card-foreground"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-muted-foreground"
            />
            <div className="flex items-center gap-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as GoalTimeframe)}
                className="text-xs bg-muted border border-border rounded px-2 py-1 text-card-foreground"
              >
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90 transition-opacity">Add</button>
              <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Goal
          </button>
        )}
      </div>
    </CollapsibleModule>
  );
}
