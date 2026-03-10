import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ClipboardList, Lock, Trash2, Download, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';

// ─── Config ────────────────────────────────────────────────────────────────
const JSONBIN_KEY = '$2a$10$4XBuzRlSsNfSfc.xD58ZWOpzy5.av2aeY/PUDckl6JdzIuH2Lnt/u';
const BIN_ID = '69aa37c443b1c97be9b83a7a';
const MANAGER_PASSWORD = 'manager123'; // ← change this to your real password

const PROJECTS = [
  { id: 'p1',  title: 'Improve Vehicles Star Ratings' },
  { id: 'p2',  title: 'Vehicles Training & Development' },
  { id: 'p3',  title: 'Define & Enforce T&P ICR-DSP-CR Process' },
  { id: 'p4',  title: 'Revisit PD Process by PDC & Complexity' },
  { id: 'p5',  title: 'Product Development Innovation' },
  { id: 'p6',  title: 'Value Engineering (VE)' },
  { id: 'p7',  title: 'Vehicles Community' },
  { id: 'p8',  title: 'D3 Parts Library Database' },
  { id: 'p9',  title: 'Refine MOA Handoff Process' },
  { id: 'p10', title: 'Sample Comment Tracking' },
  { id: 'p11', title: 'Reduce Post-FPR Changes and Tool Modifications' },
  { id: 'p12', title: 'Diecast Performance within Playsets' },
  { id: 'p13', title: 'AI' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Low interest',
  2: 'Some interest',
  3: 'Interested',
  4: 'Very interested',
  5: 'Top priority',
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface Rating { projectId: string; title: string; rating: number; }
interface Submission { employeeId: string; employeeName: string; submittedAt: string; ratings: Rating[]; }
interface BinData { submissions: Submission[]; }

// ─── JSONBin helpers ─────────────────────────────────────────────────────────
async function fetchBin(): Promise<BinData> {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: { 'X-Master-Key': JSONBIN_KEY },
  });
  const json = await res.json();
  return json.record as BinData;
}

async function saveBin(data: BinData): Promise<void> {
  await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_KEY },
    body: JSON.stringify(data),
  });
}

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ['Who are you?', 'Select', 'Rate', 'Confirm'];
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((label, i) => {
        const state = i + 1 < step ? 'done' : i + 1 === step ? 'active' : 'inactive';
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              state === 'active' ? 'bg-primary text-primary-foreground' :
              state === 'done'   ? 'bg-primary/20 text-primary' :
                                   'bg-muted text-muted-foreground'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                state === 'active' ? 'bg-primary-foreground text-primary' :
                state === 'done'   ? 'bg-primary text-primary-foreground' :
                                     'bg-muted-foreground/30 text-muted-foreground'
              }`}>
                {state === 'done' ? '✓' : i + 1}
              </span>
              {label}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-0.5 rounded ${state === 'done' ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Star rating widget ──────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`h-6 w-6 transition-colors ${n <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EMPLOYEE SURVEY
// ════════════════════════════════════════════════════════════════════════════
function EmployeeSurvey({ onManagerClick }: { onManagerClick: () => void }) {
  const { employees } = useStore();
  const [step, setStep] = useState(1);
  const [pickedEmployee, setPickedEmployee] = useState<{ id: string; name: string; avatarColor: string } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [customText, setCustomText] = useState('');
  const [customAdded, setCustomAdded] = useState<{ id: string; title: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allProjects = customAdded ? [...PROJECTS, customAdded] : PROJECTS;
  const selectedProjects = allProjects.filter(p => selected.includes(p.id));
  const ratedCount = selectedProjects.filter(p => ratings[p.id]).length;
  const progress = selectedProjects.length > 0 ? Math.round((ratedCount / selectedProjects.length) * 100) : 0;

  function toggleProject(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function addCustom() {
    if (!customText.trim()) return;
    const custom = { id: 'custom-' + Date.now(), title: customText.trim() };
    setCustomAdded(custom);
    setSelected(prev => [...prev, custom.id]);
    setCustomText('');
  }

  async function handleSubmit() {
    if (!pickedEmployee) return;
    setSubmitting(true);
    try {
      const data = await fetchBin();
      const submission: Submission = {
        employeeId: pickedEmployee.id,
        employeeName: pickedEmployee.name,
        submittedAt: new Date().toISOString(),
        ratings: selectedProjects.map(p => ({ projectId: p.id, title: p.title, rating: ratings[p.id] || 0 })),
      };
      await saveBin({ submissions: [...(data.submissions || []), submission] });
      setSubmitted(true);
    } catch {
      alert('Error submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubmitted(false);
    setStep(1);
    setPickedEmployee(null);
    setSelected([]);
    setRatings({});
    setCustomAdded(null);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Thanks, {pickedEmployee?.name.split(' ')[0]}!</h2>
        <p className="text-muted-foreground mb-6">Your goals have been submitted successfully.</p>
        <Button variant="outline" onClick={reset}>Submit another response</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-border bg-card px-6">
        <StepBar step={step} />
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Step 1: Pick your name ── */}
          {step === 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Who are you?</CardTitle>
                  <CardDescription>Tap your name to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {employees.map(emp => {
                      const initials = emp.name.split(' ').map((n: string) => n[0]).join('');
                      const isPicked = pickedEmployee?.id === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setPickedEmployee({ id: emp.id, name: emp.name, avatarColor: emp.avatarColor })}
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            isPicked
                              ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                              : 'border-border bg-card hover:border-muted-foreground/40 hover:shadow-sm'
                          }`}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                            style={{ backgroundColor: emp.avatarColor }}
                          >
                            {initials}
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">{emp.role}</div>
                          </div>
                          {isPicked && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button disabled={!pickedEmployee} onClick={() => setStep(2)}>Select projects →</Button>
              </div>
            </>
          )}

          {/* ── Step 2: Project selection ── */}
          {step === 2 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Which projects interest you for 2026?</CardTitle>
                  <CardDescription>Select all that apply — you'll rate them next</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {PROJECTS.map(p => {
                      const isSelected = selected.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProject(p.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all text-sm font-medium ${
                            isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-muted-foreground/40'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold transition-all ${
                            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                          {p.title}
                        </button>
                      );
                    })}
                    {customAdded ? (
                      <button
                        type="button"
                        onClick={() => toggleProject(customAdded.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all text-sm font-medium ${
                          selected.includes(customAdded.id) ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-muted-foreground/40'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          selected.includes(customAdded.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                        }`}>
                          {selected.includes(customAdded.id) && '✓'}
                        </div>
                        {customAdded.title}
                        <Badge variant="secondary" className="ml-auto text-[10px]">suggested</Badge>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border bg-muted/30">
                        <Input
                          placeholder="Suggest a project…"
                          value={customText}
                          onChange={e => setCustomText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCustom()}
                          className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
                        />
                        <Button size="sm" variant="secondary" onClick={addCustom} disabled={!customText.trim()}>Add</Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground"><strong className="text-foreground">{selected.length}</strong> selected</span>
                    <button type="button" onClick={() => setSelected(PROJECTS.map(p => p.id))} className="text-xs text-primary underline">Select all</button>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button disabled={selected.length === 0} onClick={() => setStep(3)}>Rate my selections →</Button>
              </div>
            </>
          )}

          {/* ── Step 3: Star ratings ── */}
          {step === 3 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Rate your interest in each project</CardTitle>
                  <CardDescription>1 star = low interest · 5 stars = top priority</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Progress value={progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{ratedCount} / {selectedProjects.length} rated</span>
                  </div>
                  {selectedProjects.map(p => (
                    <div key={p.id} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${ratings[p.id] ? 'border-yellow-300/50 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-border'}`}>
                      <div>
                        <div className="font-medium text-sm">{p.title}</div>
                        {ratings[p.id] && <div className="text-xs text-yellow-600 font-medium mt-0.5">{RATING_LABELS[ratings[p.id]]}</div>}
                      </div>
                      <StarRating value={ratings[p.id] || 0} onChange={n => setRatings(prev => ({ ...prev, [p.id]: n }))} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button disabled={ratedCount < selectedProjects.length} onClick={() => setStep(4)}>Review & submit →</Button>
              </div>
            </>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 4 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Review your submission</CardTitle>
                  <CardDescription>
                    Submitting as{' '}
                    <span className="font-semibold" style={{ color: pickedEmployee?.avatarColor }}>{pickedEmployee?.name}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...selectedProjects].sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0)).map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                          <span className="text-sm font-medium">{p.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{RATING_LABELS[ratings[p.id]]}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} className={`h-3.5 w-3.5 ${n <= ratings[p.id] ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
                <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit goals ✓'}</Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-border p-4 text-center">
        <button type="button" onClick={onManagerClick} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mx-auto">
          <Lock className="h-3 w-3" /> Manager view
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MANAGER DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function ManagerDashboard({ onLogout }: { onLogout: () => void }) {
  const { employees } = useStore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'selections' | 'rating'>('selections');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBin();
      setSubmissions(data.submissions || []);
    } catch {
      alert('Error loading data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const projectStats = PROJECTS.map(p => {
    const subs = submissions.filter(s => s.ratings.find(r => r.projectId === p.id || r.title === p.title));
    const rated = subs.map(s => s.ratings.find(r => r.projectId === p.id || r.title === p.title)!.rating);
    const avg = rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : 0;
    const dist = [1,2,3,4,5].map(n => rated.filter(r => r === n).length);
    return { ...p, selections: subs.length, avg: avg ? avg.toFixed(1) : null, dist, employeeNames: subs.map(s => s.employeeName) };
  });

  const customSubs = submissions.flatMap(s =>
    s.ratings.filter(r => !PROJECTS.find(p => p.id === r.projectId || p.title === r.title))
      .map(r => ({ ...r, employee: s.employeeName }))
  );

  const submittedIds = new Set(submissions.map(s => s.employeeId));
  const notSubmitted = employees.filter(e => !submittedIds.has(e.id));

  const sorted = [...projectStats].sort((a, b) =>
    sortBy === 'rating' ? parseFloat(b.avg || '0') - parseFloat(a.avg || '0') : b.selections - a.selections
  );

  async function deleteSubmission(idx: number) {
    if (!confirm(`Delete submission from "${submissions[idx].employeeName}"? This cannot be undone.`)) return;
    const updated = submissions.filter((_, i) => i !== idx);
    await saveBin({ submissions: updated });
    setSubmissions(updated);
    setExpandedIdx(null);
  }

  function exportCSV() {
    const now = new Date();
    const rows = [
      ['2026 GOALS — PRODUCT ENGINEERING SURVEY'],
      ['Exported: ' + now.toLocaleString()],
      ['Total Submissions: ' + submissions.length],
      [],
      ['Employee', 'Submitted At', ...PROJECTS.map(p => p.title), 'Custom Suggestion'],
    ];
    submissions.forEach(s => {
      const custom = s.ratings.find(r => !PROJECTS.find(p => p.id === r.projectId || p.title === r.title));
      rows.push([
        s.employeeName,
        new Date(s.submittedAt).toLocaleString(),
        ...PROJECTS.map(p => { const r = s.ratings.find(x => x.projectId === p.id || x.title === p.title); return r ? String(r.rating) : '—'; }),
        custom ? `${custom.title} (${custom.rating}★)` : '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `2026-goals-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Manager Dashboard</h2>
            <p className="text-sm text-muted-foreground">{submissions.length} of {employees.length} submitted</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="gap-1.5 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading submissions…</div>
        ) : (
          <>
            {/* Who hasn't submitted */}
            {notSubmitted.length > 0 && (
              <Card className="border-yellow-300/50 bg-yellow-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-yellow-700">⏳ Waiting on {notSubmitted.length} team member{notSubmitted.length > 1 ? 's' : ''}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {notSubmitted.map(e => {
                      const initials = e.name.split(' ').map((n: string) => n[0]).join('');
                      return (
                        <div key={e.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-yellow-200">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: e.avatarColor }}>{initials}</div>
                          <span className="text-xs font-medium">{e.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project rankings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Rankings</CardTitle>
                    <CardDescription>Sorted by team interest</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {(['selections', 'rating'] as const).map(s => (
                      <Button key={s} size="sm" variant={sortBy === s ? 'default' : 'outline'} onClick={() => setSortBy(s)}>
                        {s === 'selections' ? 'By Selections' : 'By Rating'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sorted.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                      <span className="text-lg font-bold text-muted-foreground w-6 text-center">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{p.title}</div>
                        {p.employeeNames.length > 0 && <div className="text-xs text-muted-foreground truncate">{p.employeeNames.join(', ')}</div>}
                        {p.dist.some(n => n > 0) && (
                          <div className="flex gap-2 mt-1">
                            {p.dist.map((c, i) => c > 0 && <span key={i} className="text-[10px] text-muted-foreground">★{i+1}: {c}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 text-center shrink-0">
                        <div><div className="text-lg font-bold">{p.selections}</div><div className="text-[10px] text-muted-foreground">selections</div></div>
                        <div><div className="text-lg font-bold text-yellow-500">{p.avg || '—'}</div><div className="text-[10px] text-muted-foreground">avg ★</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom suggestions */}
            {customSubs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Suggestions</CardTitle>
                  <CardDescription>Projects suggested by team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {customSubs.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <span className="text-sm font-medium">{c.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">by {c.employee}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => <Star key={n} className={`h-3.5 w-3.5 ${n <= c.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All submissions */}
            <Card>
              <CardHeader>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>Click a row to see full details</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No submissions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((s, i) => {
                      const emp = employees.find(e => e.id === s.employeeId);
                      const initials = s.employeeName.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase();
                      const avg = s.ratings.length ? (s.ratings.reduce((a, b) => a + b.rating, 0) / s.ratings.length).toFixed(1) : '—';
                      const isOpen = expandedIdx === i;
                      return (
                        <div key={i} className="rounded-lg border border-border overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedIdx(isOpen ? null : i)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: emp?.avatarColor || '#6366f1' }}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{s.employeeName}</div>
                              <div className="text-xs text-muted-foreground">{new Date(s.submittedAt).toLocaleString()} · {s.ratings.length} project{s.ratings.length !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-yellow-500">{avg} ★</span>
                              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </button>
                          {isOpen && (
                            <div className="border-t border-border p-3 bg-muted/30">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                {[...s.ratings].sort((a, b) => b.rating - a.rating).map((r, ri) => (
                                  <div key={ri} className="flex items-center justify-between p-2 rounded bg-card border border-border">
                                    <span className="text-xs font-medium truncate flex-1 mr-2">{r.title}</span>
                                    <div className="flex gap-0.5 shrink-0">
                                      {[1,2,3,4,5].map(n => <Star key={n} className={`h-3 w-3 ${n <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <Button size="sm" variant="destructive" onClick={() => deleteSubmission(i)} className="gap-1.5">
                                  <Trash2 className="h-3.5 w-3.5" /> Delete submission
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function GoalsSurveyPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'survey' | 'manager'>('survey');
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  function tryLogin() {
    if (password === MANAGER_PASSWORD) {
      setView('manager');
      setLoginOpen(false);
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="flex items-center p-5 gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {view === 'manager' ? 'Goals Survey — Manager View' : '2026 Goals Survey'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {view === 'manager' ? 'Review team submissions and rankings' : 'Product Engineering Team · Share your priorities for 2026'}
            </p>
          </div>
        </div>
      </div>

      {view === 'survey' ? (
        <EmployeeSurvey onManagerClick={() => setLoginOpen(true)} />
      ) : (
        <ManagerDashboard onLogout={() => setView('survey')} />
      )}

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Manager Access</DialogTitle>
            <DialogDescription>Enter your manager password to view submissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="mgr-password">Password</Label>
              <Input
                id="mgr-password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
                onKeyDown={e => e.key === 'Enter' && tryLogin()}
                className={passwordError ? 'border-destructive' : ''}
                autoFocus
              />
              {passwordError && <p className="text-xs text-destructive mt-1">Incorrect password</p>}
            </div>
            <Button className="w-full" onClick={tryLogin}>Unlock</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
