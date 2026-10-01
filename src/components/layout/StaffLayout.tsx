import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { QrCode, LogOut, List } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import Logo from '../ui/Logo';

export default function StaffLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-beige text-charcoal flex flex-col">
      {/* Staff Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="full" />
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">Kitchen Staff</span>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/staff/queue"
              className={({ isActive }) =>
                clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-white shadow-sm' : 'text-charcoal-600 hover:bg-beige hover:text-charcoal'
                )
              }
            >
              <List className="h-4 w-4" /> Kitchen Queue
            </NavLink>
            <NavLink
              to="/staff/verify"
              className={({ isActive }) =>
                clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-white shadow-sm' : 'text-charcoal-600 hover:bg-beige hover:text-charcoal'
                )
              }
            >
              <QrCode className="h-4 w-4" /> Verify Token
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <img src={user.avatar_url} alt={user.name} className="h-7 w-7 rounded-full border" />
                <span className="text-charcoal font-medium">{user.name}</span>
              </div>
            )}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-charcoal-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 page-enter">
        <Outlet />
      </main>
    </div>
  );
}

