import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { NoteCategory } from '@/types/employee';
import { Plus, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

const CAT_STYLES: Record<NoteCategory, string> = {
  concern: 'bg-destructive/15 text-destructive',
  positive: 'bg-success/15 text-success',
  neutral: 'bg-muted text-muted-foreground',
  fyi: 'bg-info/15 text-info',
};

export function PerformanceNotes({ employeeId }: { employeeId: string }) {
  const { performanceNotes, addPerformanceNote, deletePerformanceNote } = useStore();
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('neutral');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<NoteCategory | 'all'>('all');

  const entries = performanceNotes
    .filter(n => n.employeeId === employeeId)
    .filter(n => filterCat === 'all' || n.category === filterCat)
    .filter(n => !search || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleAdd = () => {
    if (!content.trim()) return;
    addPerformanceNote({ employeeId, content, category });
    setContent(''); setCategory('neutral'); setAdding(false);
  };

  return (
    <CollapsibleModule emoji="📝" title="Performance Notes" count={entries.length}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {entries.length > 2 && (
            <div className="relative flex-1 min-w-[120px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted border border-border rounded-md text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          )}
          {(['all', 'concern', 'positive', 'neutral', 'fyi'] as const).map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${filterCat === c ? (c === 'all' ? 'bg-foreground/10 text-foreground border-foreground/20' : CAT_STYLES[c] + ' border-current') : 'border-border text-muted-foreground'}`}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>

        {entries.map(note => (
          <div key={note.id} className="p-3 rounded-md bg-muted/50 border border-border flex items-start gap-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${CAT_STYLES[note.category]}`}>{note.category}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-card-foreground">{note.content}</p>
              <span className="text-[10px] text-muted-foreground">{format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
            <button onClick={() => deletePerformanceNote(note.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}

        {adding ? (
          <div className="p-3 rounded-md border border-primary/30 bg-accent/30 space-y-2">
            <textarea autoFocus value={content} onChange={(e) => setContent(e.target.value)} placeholder="Note..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[60px] resize-none" />
            <div className="flex items-center gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value as NoteCategory)} className="text-xs bg-muted border border-border rounded px-2 py-1 text-card-foreground">
                <option value="positive">Positive</option>
                <option value="concern">Concern</option>
                <option value="neutral">Neutral</option>
                <option value="fyi">FYI</option>
              </select>
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90">Add</button>
              <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Note
          </button>
        )}

        <p className="text-[10px] text-muted-foreground italic">🔒 Private — never shown to employee</p>
      </div>
    </CollapsibleModule>
  );
}
