import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home, UtensilsCrossed, ShoppingCart, ClipboardList,
  Bell, User, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { notificationsDB } from '../../lib/db';
import { useAppStore } from '../../store/appStore';
import { clsx } from 'clsx';
import Logo from '../ui/Logo';

const NAV_ITEMS = [
  { to: '/home',          icon: Home,            label: 'Home' },
  { to: '/menu',          icon: UtensilsCrossed, label: 'Menu' },
  { to: '/cart',          icon: ShoppingCart,    label: 'Cart' },
  { to: '/orders',        icon: ClipboardList,   label: 'My Orders' },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
  { to: '/profile',       icon: User,            label: 'Profile' },
];

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.itemCount());
  const notifVersion = useAppStore((s) => s.notifVersion);
  const unreadCount = user ? notificationsDB.getUnreadCount(user.id) : 0;

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <NavLink to="/home" className="flex items-center gap-2 group">
            <Logo size="sm" variant="full" />
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx('relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-charcoal-500 hover:bg-beige hover:text-charcoal'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
                {to === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                {to === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-charcoal-500">
                <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full border" />
                <span className="font-medium text-charcoal max-w-[120px] truncate">{user.name}</span>
              </div>
            )}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="btn-ghost p-2"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 page-enter">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 px-1 pb-safe" aria-label="Mobile navigation">
        <div className="flex justify-around">
          {NAV_ITEMS.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx('relative flex flex-col items-center gap-0.5 py-2 px-2 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-charcoal-400'
                )
              }
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {to === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                {to === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile bottom padding */}
      <div className="md:hidden h-16" />
    </div>
  );
}
