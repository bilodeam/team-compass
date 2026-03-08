import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';

export function CareerGrowthModule({ employeeId }: { employeeId: string }) {
  const { careerGrowth, updateCareerGrowth, employees } = useStore();
  const emp = employees.find(e => e.id === employeeId);
  const data = careerGrowth.find(c => c.employeeId === employeeId) || {
    currentLevel: emp?.currentLevel || '',
    targetLevel: emp?.targetLevel || '',
    readinessScore: 5,
    eligibleBy: '',
    gaps: '',
    evidence: [],
  };

  const update = (field: string, value: any) => updateCareerGrowth(employeeId, { [field]: value });

  return (
    <CollapsibleModule emoji="📈" title="Career Growth & Promotion">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Current Level</label>
            <input value={data.currentLevel} onChange={(e) => update('currentLevel', e.target.value)} className="w-full mt-1 text-sm bg-muted border border-border rounded-md px-2.5 py-1.5 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Target Level</label>
            <input value={data.targetLevel} onChange={(e) => update('targetLevel', e.target.value)} className="w-full mt-1 text-sm bg-muted border border-border rounded-md px-2.5 py-1.5 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Promotion Readiness: <span className="text-primary font-bold text-sm">{data.readinessScore}/10</span>
          </label>
          <input type="range" min="1" max="10" value={data.readinessScore} onChange={(e) => update('readinessScore', Number(e.target.value))} className="w-full mt-1 accent-primary" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Not ready</span>
            <span>Ready to promote</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Eligible to Promote By</label>
          <input type="date" value={data.eligibleBy} onChange={(e) => update('eligibleBy', e.target.value)} className="w-full mt-1 text-xs bg-muted border border-border rounded-md px-2.5 py-1.5 text-card-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Gaps & What's Needed</label>
          <textarea value={data.gaps} onChange={(e) => update('gaps', e.target.value)} placeholder="Areas to develop..." className="w-full mt-1 text-xs bg-muted border border-border rounded-md px-2.5 py-1.5 text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px] resize-none" />
        </div>
      </div>
    </CollapsibleModule>
  );
}
