import { useStore } from '@/store/useStore';
import { Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function EmployeeSidebar() {
  const navigate = useNavigate();
  const { employees, selectedEmployeeId, setSelectedEmployee } = useStore();

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

      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Private · Local Only</p>
      </div>
    </aside>
  );
}
