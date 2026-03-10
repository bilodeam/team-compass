import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Users, ArrowLeft } from 'lucide-react';

interface EmployeeOption {
  id: string;
  name: string;
  role: string;
  avatar_color: string;
  email: string;
}

// Map employee id to their auth email
const EMPLOYEE_EMAILS: Record<string, string> = {
  'manager': 'manager@teamcompass.com',
  'emp-1': 'andrew@teamcompass.com',
  'emp-2': 'anjali@teamcompass.com',
  'emp-3': 'binh@teamcompass.com',
  'emp-4': 'dan@teamcompass.com',
  'emp-5': 'josh@teamcompass.com',
  'emp-6': 'sean@teamcompass.com',
};

export default function LoginPage() {
  const { signIn } = useAuth();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [picked, setPicked] = useState<EmployeeOption | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Load employees directly from Supabase (no auth needed for this)
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('employees')
        .select('id, name, role, avatar_color')
        .order('id');
      if (data) {
        setEmployees(data.map(e => ({
          ...e,
          email: EMPLOYEE_EMAILS[e.id] || '',
        })));
      }
      setLoadingEmployees(false);
    }
    load();
  }, []);

  async function handleLogin() {
    if (!picked || !password.trim()) return;
    setLoading(true);
    setError('');
    const email = picked.id === 'manager'
      ? EMPLOYEE_EMAILS['manager']
      : EMPLOYEE_EMAILS[picked.id];
    const err = await signIn(email, password.trim());
    if (err) {
      setError('Wrong password, try again');
      setLoading(false);
    }
  }

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('');

  // ── Step 1: Pick your name ──────────────────────────────────────────────
  if (!picked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Team Compass</h1>
            <p className="text-muted-foreground text-sm mt-1">Who are you?</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select your name</CardTitle>
              <CardDescription>Tap your name to continue</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEmployees ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => setPicked(emp)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                        style={{ backgroundColor: emp.avatar_color }}
                      >
                        {initials(emp.name)}
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.role}</div>
                      </div>
                    </button>
                  ))}

                  {/* Manager tile */}
                  <button
                    type="button"
                    onClick={() => setPicked({ id: 'manager', name: 'Maxence', role: 'Manager', avatar_color: 'hsl(240, 50%, 50%)', email: EMPLOYEE_EMAILS['manager'] })}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border bg-muted/30 hover:border-primary/50 hover:shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-primary">
                      M
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">Manager</div>
                      <div className="text-xs text-muted-foreground">Team Lead</div>
                    </div>
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Contact your manager if you need access
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Enter password ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-3 shadow-md"
            style={{ backgroundColor: picked.avatar_color }}
          >
            {initials(picked.name)}
          </div>
          <h1 className="text-xl font-bold">Hi, {picked.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your password to continue</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                autoFocus
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={loading || !password.trim()}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </Button>
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={() => { setPicked(null); setPassword(''); setError(''); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Not you?
        </button>
      </div>
    </div>
  );
}
