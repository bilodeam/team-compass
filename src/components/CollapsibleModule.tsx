import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleModuleProps {
  emoji: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

export function CollapsibleModule({ emoji, title, children, defaultOpen = true, count }: CollapsibleModuleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="bg-card rounded-lg border border-border shadow-soft animate-fade-in">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{emoji}</span>
          <h2 className="font-heading text-base text-card-foreground">{title}</h2>
          {count !== undefined && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
}
