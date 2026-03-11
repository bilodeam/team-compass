import { useStore } from '@/store/useStore';
import { Users, Target, LogOut, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export function EmployeeSidebar() {
  const navigate = useNavigate();
  const { employees, selectedEmployeeId, setSelectedEmployee } = useStore();
  const { signOut } = useAuth();

  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePassword() {
    if (newPassword.length < 4) {
      setPwError('Password must be at least 4 characters');
      return;
    }
    setPwLoading(true);
    setPwError('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess(true);
      setNewPassword('');
      setTimeout(() => {
        setPwDialogOpen(false);
        setPwSuccess(false);
      }, 1500);
    }
  }

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-sidebar flex flex-col">
      <div className="p-5 border-b border-border">
        <h1 className="font-heading text-xl text-sidebar-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-sidebar-primary" />
          Team Dashboard
        </h1>
        <p className="text-xs text-muted-foreground mt-1">6 direct reports</p>
      </div>

      <div className="p-3 border-b border-border">
        <Button
          variant="default"
          className="w-full justify-start gap-2"
          onClick={() => navigate('/team')}
        >
          <Target className="h-4 w-4" />
          Team Overview
        </Button>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {employees.map((emp) => {
          const isActive = emp.id === selectedEmployeeId;
          const initials = emp.name.split(' ').map(n => n[0]).join('');
          return (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-soft'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ backgroundColor: emp.avatarColor, color: 'white' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{emp.name}</div>
                <div className="text-xs text-muted-foreground truncate">{emp.role}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Dialog open={pwDialogOpen} onOpenChange={(o) => { setPwDialogOpen(o); if (!o) { setNewPassword(''); setPwError(''); setPwSuccess(false); } }}>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Change password
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>Enter a new password for your account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min. 4 characters"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                />
              </div>
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-green-600">Password updated!</p>}
            </div>
            <DialogFooter>
              <Button onClick={handleChangePassword} disabled={pwLoading || !newPassword.trim()}>
                {pwLoading ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Sign out
        </button>

        <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 pt-2">Private · Local Only</p>
      </div>
    </aside>
  );
}
