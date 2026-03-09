import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { Plus, Search, MessageSquare, ClipboardList, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OneOnOneEntry } from '@/components/modules/oneOnOnes/OneOnOneEntry';

export function OneOnOneRecaps({ employeeId }: { employeeId: string }) {
  const { oneOnOnes, addOneOnOne, updateOneOnOne, deleteOneOnOne } = useStore();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    agendaItems: [] as string[],
    wentWell: '',
    concerns: '',
    managerNotes: '',
    followUps: '',
  });

  const entries = oneOnOnes
    .filter(e => e.employeeId === employeeId)
    .filter(e =>
      !search ||
      [...(e.agendaItems || []), e.wentWell, e.concerns, e.managerNotes, e.followUps].some(f =>
        f?.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.date.localeCompare(a.date);
    });

  const handleAdd = () => {
    if (!form.agendaItems.length && !form.wentWell.trim() && !form.concerns.trim()) return;
    addOneOnOne({ employeeId, ...form, pinned: false });
    setForm({
      date: new Date().toISOString().split('T')[0],
      agendaItems: [],
      wentWell: '',
      concerns: '',
      managerNotes: '',
      followUps: '',
    });
    setNewAgendaItem('');
    setAdding(false);
  };

  const addAgendaToForm = () => {
    if (!newAgendaItem.trim()) return;
    setForm(prev => ({ ...prev, agendaItems: [...prev.agendaItems, newAgendaItem.trim()] }));
    setNewAgendaItem('');
  };

  const removeAgendaFromForm = (index: number) => {
    setForm(prev => ({ ...prev, agendaItems: prev.agendaItems.filter((_, i) => i !== index) }));
  };

  const addAgendaToExisting = (entryId: string, item: string) => {
    const entry = oneOnOnes.find(e => e.id === entryId);
    if (!entry || !item.trim()) return;
    updateOneOnOne(entryId, { agendaItems: [...(entry.agendaItems || []), item.trim()] });
  };

  const removeAgendaFromExisting = (entryId: string, index: number) => {
    const entry = oneOnOnes.find(e => e.id === entryId);
    if (!entry) return;
    updateOneOnOne(entryId, { agendaItems: (entry.agendaItems || []).filter((_, i) => i !== index) });
  };

  return (
    <CollapsibleModule emoji="📅" title="1-on-1" count={entries.length}>
      <div className="space-y-3">
        {entries.length > 2 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 1-on-1s..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted border border-border rounded-md text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {entries.map(entry => (
          <OneOnOneEntry
            key={entry.id}
            entry={entry}
            onTogglePin={() => updateOneOnOne(entry.id, { pinned: !entry.pinned })}
            onDelete={() => deleteOneOnOne(entry.id)}
            onUpdateRecap={(updates) => updateOneOnOne(entry.id, updates)}
            onAddAgenda={(item) => addAgendaToExisting(entry.id, item)}
            onRemoveAgenda={(index) => removeAgendaFromExisting(entry.id, index)}
          />
        ))}

        {adding ? (
          <div className="p-3 rounded-md border border-primary/30 bg-accent/30 space-y-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="text-xs bg-muted border border-border rounded px-2 py-1 text-card-foreground"
            />

            <Tabs defaultValue="agenda" className="w-full">
              <TabsList className="w-full h-8">
                <TabsTrigger value="agenda" className="flex-1 text-xs gap-1.5">
                  <ClipboardList className="h-3 w-3" /> Agenda
                </TabsTrigger>
                <TabsTrigger value="recap" className="flex-1 text-xs gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Recap
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agenda" className="space-y-2 mt-2">
                {form.agendaItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-card-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="flex-1">{item}</span>
                    <button onClick={() => removeAgendaFromForm(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={newAgendaItem}
                    onChange={(e) => setNewAgendaItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAgendaToForm())}
                    placeholder="Add a talking point..."
                    className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground border-b border-border py-1"
                  />
                  <button onClick={addAgendaToForm} className="text-xs text-primary hover:text-primary/80">Add</button>
                </div>
              </TabsContent>

              <TabsContent value="recap" className="space-y-2 mt-2">
                <textarea value={form.wentWell} onChange={(e) => setForm({ ...form, wentWell: e.target.value })} placeholder="What went well..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
                <textarea value={form.concerns} onChange={(e) => setForm({ ...form, concerns: e.target.value })} placeholder="Concerns raised..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
                <textarea value={form.managerNotes} onChange={(e) => setForm({ ...form, managerNotes: e.target.value })} placeholder="Manager notes..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
                <textarea value={form.followUps} onChange={(e) => setForm({ ...form, followUps: e.target.value })} placeholder="Follow-ups..." className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[40px] resize-none" />
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90">Save</button>
              <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" /> New 1-on-1
          </button>
        )}
      </div>
    </CollapsibleModule>
  );
}
