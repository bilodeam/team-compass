import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { AchievementTag, ImpactLevel } from '@/types/employee';
import { Plus, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';

const IMPACT_STYLES: Record<ImpactLevel, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/15 text-info',
  high: 'bg-warning/15 text-warning',
  exceptional: 'bg-primary/15 text-primary',
};

const TAG_STYLES: Record<AchievementTag, string> = {
  technical: 'bg-info/10 text-info',
  leadership: 'bg-primary/10 text-primary',
  collaboration: 'bg-success/10 text-success',
  delivery: 'bg-warning/10 text-warning',
};

export function Achievements({ employeeId }: { employeeId: string }) {
  const { achievements, addAchievement, deleteAchievement, employees } = useStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState<ImpactLevel>('medium');
  const [tags, setTags] = useState<AchievementTag[]>([]);

  const entries = achievements.filter(a => a.employeeId === employeeId).sort((a, b) => b.date.localeCompare(a.date));
  const emp = employees.find(e => e.id === employeeId);

  const handleAdd = () => {
    if (!title.trim()) return;
    addAchievement({ employeeId, title, description, date: new Date().toISOString().split('T')[0], impact, tags });
    setTitle(''); setDescription(''); setImpact('medium'); setTags([]); setAdding(false);
  };

  const toggleTag = (tag: AchievementTag) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const exportBragDoc = () => {
    const lines = [`# ${emp?.name} — Achievement Log (Brag Doc)\n`];
    entries.forEach(a => {
      lines.push(`## ${a.title}`);
      lines.push(`Date: ${a.date} | Impact: ${a.impact} | Tags: ${a.tags.join(', ')}`);
      if (a.description) lines.push(a.description);
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${emp?.name.replace(/\s/g, '_')}_brag_doc.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CollapsibleModule emoji="🏆" title="Achievements" count={entries.length}>
      <div className="space-y-3">
        {entries.length > 0 && (
          <button onClick={exportBragDoc} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Download className="h-3.5 w-3.5" /> Export Brag Doc
          </button>
        )}

        {entries.map(a => (
          <div key={a.id} className="p-3 rounded-md bg-muted/50 border border-border space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-sm font-medium text-card-foreground">{a.title}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{format(new Date(a.date), 'MMM d, yyyy')}</span>
              </div>
              <button onClick={() => deleteAchievement(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${IMPACT_STYLES[a.impact]}`}>{a.impact}</span>
              {a.tags.map(t => <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full ${TAG_STYLES[t]}`}>{t}</span>)}
            </div>
          </div>
        ))}

        {adding ? (
          <div className="p-3 rounded-md border border-primary/30 bg-accent/30 space-y-2">
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Achievement title..." className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground focus:outline-none text-card-foreground" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-muted-foreground" />
            <div className="flex items-center gap-2 flex-wrap">
              <select value={impact} onChange={(e) => setImpact(e.target.value as ImpactLevel)} className="text-xs bg-muted border border-border rounded px-2 py-1 text-card-foreground">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="exceptional">Exceptional</option>
              </select>
              {(['technical', 'leadership', 'collaboration', 'delivery'] as AchievementTag[]).map(t => (
                <button key={t} onClick={() => toggleTag(t)} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${tags.includes(t) ? TAG_STYLES[t] + ' border-current' : 'border-border text-muted-foreground'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90">Add</button>
              <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Achievement
          </button>
        )}
      </div>
    </CollapsibleModule>
  );
}
