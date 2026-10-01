import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, Clock,
  BarChart2, LogOut, Menu, ChefHat,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import { useState } from 'react';
import Logo from '../ui/Logo';

const NAV = [
  { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/manager/menu',      icon: UtensilsCrossed, label: 'Menu Management' },
  { to: '/manager/slots',     icon: Clock,           label: 'Pickup Slots' },
  { to: '/manager/analytics', icon: BarChart2,       label: 'Analytics' },
];

export default function ManagerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const Sidebar = ({ mobile = false }) => (
    <aside className={clsx(
      'flex flex-col bg-white border-r shadow-sm',
      mobile ? 'w-64' : 'hidden lg:flex w-64 min-h-screen'
    )}>
      <div className="p-5 border-b">
        <Logo size="sm" variant="full" />
      </div>

      <nav className="flex-1 p-4 space-y-1" aria-label="Manager navigation">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSideOpen(false)}
            className={({ isActive }) =>
              clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-charcoal-600 hover:bg-beige hover:text-charcoal'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        {user && (
          <div className="flex items-center gap-2 mb-3">
            <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-charcoal truncate">{user.name}</div>
              <div className="text-xs text-charcoal-400 capitalize">{user.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal-500 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-beige flex">
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setSideOpen(false)} />
          <div className="relative z-10"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-charcoal">Manager Portal</span>
          </div>
          <button onClick={() => setSideOpen(true)} className="btn-ghost p-2">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <main className="flex-1 p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


