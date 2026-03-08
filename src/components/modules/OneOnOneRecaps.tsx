import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { Plus, Trash2, Pin, Search } from 'lucide-react';
import { format } from 'date-fns';

export function OneOnOneRecaps({ employeeId }: { employeeId: string }) {
  const { oneOnOnes, addOneOnOne, updateOneOnOne, deleteOneOnOne } = useStore();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], wentWell: '', concerns: '', managerNotes: '', followUps: '' });

  const entries = oneOnOnes
    .filter(e => e.employeeId === employeeId)
    .filter(e => !search || [e.wentWell, e.concerns, e.managerNotes, e.followUps].some(f => f.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.date.localeCompare(a.date);
    });

  const handleAdd = () => {
    if (!form.wentWell.trim() && !form.concerns.trim()) return;
    addOneOnOne({ employeeId, ...form, pinned: false });
    setForm({ date: new Date().toISOString().split('T')[0], wentWell: '', concerns: '', managerNotes: '', followUps: '' });
    setAdding(false);
  };

  return (
    <CollapsibleModule emoji="📅" title="1-on-1 Recaps" count={entries.length}>
      <div className="space-y-3">
        {entries.length > 2 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recaps..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted border border-border rounded-md text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {entries.map(entry => (
          <div key={entry.id} className={`p-3 rounded-md border space-y-2 ${entry.pinned ? 'border-primary/30 bg-accent/20' : 'border-border bg-muted/50'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-card-foreground">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateOneOnOne(entry.id, { pinned: !entry.pinned })} className={`transition-colors ${entry.pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  <Pin className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => deleteOneOnOne(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {entry.wentWell && <div><span className="text-[10px] uppercase tracking-wider text-success font-medium">Went Well</span><p className="text-xs text-card-foreground mt-0.5">{entry.wentWell}</p></div>}
            {entry.concerns && <div><span className="text-[10px] uppercase tracking-wider text-warning font-medium">Concerns</span><p className="text-xs text-card-foreground mt-0.5">{entry.concerns}</p></div>}
            {entry.managerNotes && <div><span className="text-[10px] uppercase tracking-wider text-info font-medium">Manager Notes</span><p className="text-xs text-card-foreground mt-0.5">{entry.managerNotes}</p></div>}
            {entry.followUps && <div><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Follow-ups</span><p className="text-xs text-card-foreground mt-0.5">{entry.followUps}</p></div>}
          </div>
        ))}

        {adding ? (
          <div className="p-3 rounded-md border border-primary/30 bg-accent/30 space-y-2">
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="text-xs bg-muted border border-border rounded px-2 py-1 text-card-foreground" />
            <textarea value={form.wentWell} onChange={(e) => setForm({...form, wentWell: e.target.value})} placeholder="What went well..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
            <textarea value={form.concerns} onChange={(e) => setForm({...form, concerns: e.target.value})} placeholder="Concerns raised..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
            <textarea value={form.managerNotes} onChange={(e) => setForm({...form, managerNotes: e.target.value})} placeholder="Manager notes..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
            <textarea value={form.followUps} onChange={(e) => setForm({...form, followUps: e.target.value})} placeholder="Follow-ups..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90">Add</button>
              <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add 1-on-1 Recap
          </button>
        )}
      </div>
    </CollapsibleModule>
  );
}
