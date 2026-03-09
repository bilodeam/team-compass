import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  MessageSquare,
  Pin,
  Trash2,
  X,
} from 'lucide-react';

export type OneOnOneEntryModel = {
  id: string;
  date: string;
  pinned: boolean;
  agendaItems?: string[];
  wentWell: string;
  concerns: string;
  managerNotes: string;
  followUps: string;
};

export function OneOnOneEntry({
  entry,
  onTogglePin,
  onDelete,
  onUpdateRecap,
  onAddAgenda,
  onRemoveAgenda,
}: {
  entry: OneOnOneEntryModel;
  onTogglePin: () => void;
  onDelete: () => void;
  onUpdateRecap: (updates: Partial<Pick<OneOnOneEntryModel, 'wentWell' | 'concerns' | 'managerNotes' | 'followUps'>>) => void;
  onAddAgenda: (item: string) => void;
  onRemoveAgenda: (index: number) => void;
}) {
  const [newItem, setNewItem] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [editingRecap, setEditingRecap] = useState(false);
  const [recapForm, setRecapForm] = useState({
    wentWell: entry.wentWell,
    concerns: entry.concerns,
    managerNotes: entry.managerNotes,
    followUps: entry.followUps,
  });

  const agendaPreview = useMemo(() => {
    const items = entry.agendaItems ?? [];
    if (items.length === 0) return 'No agenda';

    const first = items[0] ?? '';
    const rest = items.length - 1;
    return rest > 0 ? `${first} (+${rest})` : first;
  }, [entry.agendaItems]);

  const hasRecap = Boolean(entry.wentWell || entry.concerns || entry.managerNotes || entry.followUps);

  return (
    <div
      className={`p-3 rounded-md border ${
        entry.pinned ? 'border-primary/30 bg-accent/20' : 'border-border bg-muted/50'
      } ${expanded ? 'space-y-2' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1.5 min-w-0 text-left"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}

          <span className="text-xs font-medium text-card-foreground whitespace-nowrap">
            {format(new Date(entry.date), 'MMM d, yyyy')}
          </span>

          {!expanded && (
            <span className="text-xs text-muted-foreground truncate">— {agendaPreview}</span>
          )}
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onTogglePin}
            className={`transition-colors ${
              entry.pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
            aria-label={entry.pinned ? 'Unpin 1-on-1' : 'Pin 1-on-1'}
            title={entry.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete 1-on-1"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Agenda Section */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-primary font-medium flex items-center gap-1">
              <ClipboardList className="h-3 w-3" /> Agenda
            </span>
            {(entry.agendaItems || []).map((item, i) => (
              <div key={i} className="group flex items-center gap-2 text-xs text-card-foreground pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                <span className="flex-1">{item}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAgenda(i)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove agenda item"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-2 pl-1">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItem.trim()) {
                    e.preventDefault();
                    onAddAgenda(newItem);
                    setNewItem('');
                  }
                }}
                placeholder="Add talking point..."
                className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground border-b border-transparent focus:border-border py-0.5"
              />
            </div>
          </div>

          {/* Recap Section */}
          <div className="space-y-1.5 pt-1 border-t border-border/50">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Recap
            </span>
            {!editingRecap ? (
              <>
                {hasRecap ? (
                  <div className="space-y-1.5">
                    {entry.wentWell && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-success font-medium">Went Well</span>
                        <p className="text-xs text-card-foreground mt-0.5">{entry.wentWell}</p>
                      </div>
                    )}
                    {entry.concerns && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-warning font-medium">Concerns</span>
                        <p className="text-xs text-card-foreground mt-0.5">{entry.concerns}</p>
                      </div>
                    )}
                    {entry.managerNotes && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-info font-medium">Manager Notes</span>
                        <p className="text-xs text-card-foreground mt-0.5">{entry.managerNotes}</p>
                      </div>
                    )}
                    {entry.followUps && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Follow-ups</span>
                        <p className="text-xs text-card-foreground mt-0.5">{entry.followUps}</p>
                      </div>
                    )}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setRecapForm({
                      wentWell: entry.wentWell,
                      concerns: entry.concerns,
                      managerNotes: entry.managerNotes,
                      followUps: entry.followUps,
                    });
                    setEditingRecap(true);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {hasRecap ? 'Edit recap' : '+ Add recap notes'}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={recapForm.wentWell}
                  onChange={(e) => setRecapForm((p) => ({ ...p, wentWell: e.target.value }))}
                  placeholder="What went well..."
                  className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[32px] resize-none"
                />
                <textarea
                  value={recapForm.concerns}
                  onChange={(e) => setRecapForm((p) => ({ ...p, concerns: e.target.value }))}
                  placeholder="Concerns raised..."
                  className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[32px] resize-none"
                />
                <textarea
                  value={recapForm.managerNotes}
                  onChange={(e) => setRecapForm((p) => ({ ...p, managerNotes: e.target.value }))}
                  placeholder="Manager notes..."
                  className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[32px] resize-none"
                />
                <textarea
                  value={recapForm.followUps}
                  onChange={(e) => setRecapForm((p) => ({ ...p, followUps: e.target.value }))}
                  placeholder="Follow-ups..."
                  className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none text-card-foreground min-h-[32px] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateRecap(recapForm);
                      setEditingRecap(false);
                    }}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRecap(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
