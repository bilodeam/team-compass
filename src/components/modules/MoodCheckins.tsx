import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const MOOD_EMOJIS = ['😟', '😐', '🙂', '😊', '🤩'];

export function MoodCheckins({ employeeId }: { employeeId: string }) {
  const { moodCheckins, addMoodCheckin, deleteMoodCheckin } = useStore();
  const [adding, setAdding] = useState(false);
  const [score, setScore] = useState(3);
  const [notes, setNotes] = useState('');

  const entries = moodCheckins.filter(m => m.employeeId === employeeId).sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    addMoodCheckin({ employeeId, date: new Date().toISOString().split('T')[0], score, notes });
    setScore(3); setNotes(''); setAdding(false);
  };

  // Trend line
  const renderTrend = () => {
    if (entries.length < 2) return null;
    const recent = [...entries].reverse().slice(-12);
    const w = 280;
    const h = 50;
    const step = w / (recent.length - 1);

    const points = recent.map((m, i) => ({
      x: i * step,
      y: h - ((m.score - 1) / 4) * h,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

    return (
      <svg viewBox={`-4 -4 ${w + 8} ${h + 8}`} className="w-full max-w-[300px]">
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
        ))}
      </svg>
    );
  };

  return (
    <CollapsibleModule emoji="💬" title="Mood & Sentiment" count={entries.length}>
      <div className="space-y-3">
        {renderTrend()}

        {entries.slice(0, 10).map(m => (
          <div key={m.id} className="flex items-start gap-3 p-2 rounded-md bg-muted/50">
            <span className="text-xl">{MOOD_EMOJIS[m.score - 1]}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">{format(new Date(m.date), 'MMM d, yyyy')}</span>
              {m.notes && <p className="text-xs text-card-foreground mt-0.5">{m.notes}</p>}
            </div>
            <button onClick={() => deleteMoodCheckin(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}

        {adding ? (
          <div className="p-3 rounded-md border border-primary/30 bg-accent/30 space-y-2">
            <div className="flex items-center gap-2">
              {MOOD_EMOJIS.map((emoji, i) => (
                <button key={i} onClick={() => setScore(i + 1)} className={`text-2xl transition-transform ${score === i + 1 ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}>
                  {emoji}
                </button>
              ))}
            </div>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground" />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90">Add</button>
              <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" /> Log Check-in
          </button>
        )}

        <p className="text-[10px] text-muted-foreground italic">🔒 Completely private to you</p>
      </div>
    </CollapsibleModule>
  );
}
