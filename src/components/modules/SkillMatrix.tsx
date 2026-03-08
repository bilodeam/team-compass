import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CollapsibleModule } from '@/components/CollapsibleModule';
import { SkillRating } from '@/types/employee';
import { Plus, Trash2 } from 'lucide-react';

const RATING_STYLES: Record<SkillRating, string> = {
  developing: 'bg-warning/15 text-warning',
  proficient: 'bg-info/15 text-info',
  expert: 'bg-success/15 text-success',
};

const RATING_WIDTH: Record<SkillRating, string> = {
  developing: '33%',
  proficient: '66%',
  expert: '100%',
};

const RATING_COLORS: Record<SkillRating, string> = {
  developing: 'hsl(var(--warning))',
  proficient: 'hsl(var(--info))',
  expert: 'hsl(var(--success))',
};

export function SkillMatrix({ employeeId }: { employeeId: string }) {
  const { skills, addSkill, updateSkill, deleteSkill } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const empSkills = skills.filter(s => s.employeeId === employeeId).sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = () => {
    if (!name.trim()) return;
    addSkill({ employeeId, name, rating: 'developing', quarter: 'Q1 2026' });
    setName(''); setAdding(false);
  };

  // Simple radar chart using SVG
  const renderRadar = () => {
    if (empSkills.length < 3) return null;
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const count = Math.min(empSkills.length, 8);
    const displaySkills = empSkills.slice(0, count);

    const ratingValue: Record<SkillRating, number> = { developing: 0.33, proficient: 0.66, expert: 1 };

    const points = displaySkills.map((skill, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = radius * ratingValue[skill.rating];
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    });

    const gridLevels = [0.33, 0.66, 1];

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px] mx-auto">
        {gridLevels.map(level => (
          <polygon
            key={level}
            points={Array.from({ length: count }, (_, i) => {
              const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
              return `${center + radius * level * Math.cos(angle)},${center + radius * level * Math.sin(angle)}`;
            }).join(' ')}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
        ))}
        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        {displaySkills.map((skill, i) => {
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
          const lx = center + (radius + 16) * Math.cos(angle);
          const ly = center + (radius + 16) * Math.sin(angle);
          return (
            <text key={skill.id} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: '7px' }}>
              {skill.name.length > 10 ? skill.name.slice(0, 10) + '…' : skill.name}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <CollapsibleModule emoji="🧩" title="Skill Matrix" count={empSkills.length}>
      <div className="space-y-3">
        {renderRadar()}

        {empSkills.map(skill => (
          <div key={skill.id} className="flex items-center gap-3">
            <span className="text-xs text-card-foreground w-28 truncate shrink-0">{skill.name}</span>
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: RATING_WIDTH[skill.rating], backgroundColor: RATING_COLORS[skill.rating] }} />
            </div>
            <select
              value={skill.rating}
              onChange={(e) => updateSkill(skill.id, { rating: e.target.value as SkillRating })}
              className="text-[10px] bg-transparent border-none text-card-foreground focus:outline-none cursor-pointer"
            >
              <option value="developing">Developing</option>
              <option value="proficient">Proficient</option>
              <option value="expert">Expert</option>
            </select>
            <button onClick={() => deleteSkill(skill.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}

        {adding ? (
          <div className="flex items-center gap-2">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="Skill name..." className="flex-1 text-xs bg-muted border border-border rounded-md px-2.5 py-1.5 text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90">Add</button>
            <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Skill
          </button>
        )}
      </div>
    </CollapsibleModule>
  );
}
