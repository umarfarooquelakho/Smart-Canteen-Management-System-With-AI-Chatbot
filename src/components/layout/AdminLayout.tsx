import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Tag, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import { useState } from 'react';
import Logo from '../ui/Logo';

const NAV = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/categories', icon: Tag,             label: 'Categories' },
  { to: '/admin/logs',       icon: FileText,        label: 'System Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const Sidebar = () => (
    <aside className="flex flex-col w-64 bg-charcoal min-h-screen">
      <div className="p-5 border-b border-charcoal-700">
        <Logo size="sm" variant="full" dark />
      </div>

      <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSideOpen(false)}
            className={({ isActive }) =>
              clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-charcoal-700">
        {user && (
          <div className="flex items-center gap-2 mb-3">
            <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-charcoal-400 capitalize">{user.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-700 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-beige flex">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-charcoal/60" onClick={() => setSideOpen(false)} />
          <div className="relative z-10"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between bg-charcoal border-b border-charcoal-700 px-4 py-3">
          <Logo size="sm" variant="full" dark />
          <button onClick={() => setSideOpen(true)} className="text-white p-2">
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

