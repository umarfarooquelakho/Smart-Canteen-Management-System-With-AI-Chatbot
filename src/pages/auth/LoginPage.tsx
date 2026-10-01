import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { email: 'customer@demo.com', password: 'customer123', role: 'Customer', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { email: 'staff@demo.com',    password: 'staff123',    role: 'Staff',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { email: 'manager@demo.com',  password: 'manager123',  role: 'Manager',  color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { email: 'admin@demo.com',    password: 'admin123',    role: 'Admin',    color: 'bg-primary/10 text-primary border-primary/20' },
];

// ── Inline SVG logo icon matching the FataFat Food brand ─────────────────────
function FataFatIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Plate base */}
      <ellipse cx="28" cy="38" rx="17" ry="4" fill="#1a1a1a"/>
      {/* Cloche dome */}
      <path d="M11 36 Q28 14 45 36 Z" fill="#C94720"/>
      {/* Knob */}
      <circle cx="28" cy="16" r="3" fill="#C94720"/>
      {/* Speed lines */}
      <line x1="5"  y1="28" x2="13" y2="28" stroke="#C94720" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="3"  y1="33" x2="12" y2="33" stroke="#C94720" strokeWidth="2" strokeLinecap="round"/>
      <line x1="5"  y1="38" x2="13" y2="38" stroke="#C94720" strokeWidth="1.5" strokeLinecap="round"/>
      {/* QR box */}
      <rect x="37" y="22" width="12" height="12" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="1.5"/>
      <rect x="39" y="24" width="3" height="3" fill="#1a1a1a"/>
      <rect x="44" y="24" width="3" height="3" fill="#1a1a1a"/>
      <rect x="39" y="29" width="3" height="3" fill="#1a1a1a"/>
      <rect x="43" y="28" width="4" height="2" fill="#1a1a1a"/>
      <rect x="44" y="30" width="3" height="2" fill="#1a1a1a"/>
      {/* Teal sparkles */}
      <line x1="50" y1="22" x2="53" y2="19" stroke="#4F9D8A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="52" y1="27" x2="55" y2="26" stroke="#4F9D8A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="32" x2="53" y2="34" stroke="#4F9D8A" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, user, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'staff')   navigate('/staff/queue');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else if (user.role === 'admin')   navigate('/admin/dashboard');
      else navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) { toast.error('Please fill in all fields.'); return; }
    await login(email, password);
  };

  const quickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    clearError();
    setEmail(acc.email);
    setPassword(acc.password);
    await login(acc.email, acc.password);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — food photo + brand ───────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Food background image */}
        <img
          src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&h=1200&fit=crop&q=85"
          alt="Delicious food"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />

        {/* Brand card overlay */}
        <div className="relative z-10 flex flex-col justify-center pl-16 pr-8 lg:pl-20 w-full my-auto">
          {/* Logo card */}
          <div className="inline-flex items-center gap-3 bg-charcoal/80 backdrop-blur-sm rounded-2xl px-4 py-3 mb-6 self-start shadow-xl border border-white/10">
            <FataFatIcon className="h-10 w-10 shrink-0" />
            <div>
              {/* Brand name */}
              <div className="flex items-baseline leading-none">
                <span className="text-white font-black text-2xl tracking-tight">F</span>
                <span className="text-white font-black text-2xl tracking-tight">atafat</span>
                <span className="text-primary font-black text-2xl tracking-tight ml-1.5">Food</span>
              </div>
              <p className="text-charcoal-300 text-xs mt-0.5 font-medium">
                Bhook lagii? Fatafat karo!
              </p>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-white text-3xl lg:text-4xl font-black leading-tight drop-shadow-lg">
            Bhook lagii?<br />
            <span className="text-primary">Fatafat karo!</span>
          </h2>
          <p className="text-white/80 text-sm mt-3 max-w-sm leading-relaxed drop-shadow">
            Pre-order your favourite meals, get your digital token, and skip the queue.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="md:hidden flex items-center gap-3 mb-8 justify-center">
            <FataFatIcon className="h-10 w-10" />
            <div className="flex items-baseline">
              <span className="text-charcoal font-black text-2xl tracking-tight">Fatafat</span>
              <span className="text-primary font-black text-2xl tracking-tight ml-1">Food</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-charcoal mb-6">Sign in to your account</h1>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition ${error ? 'border-red-400' : 'border-charcoal-200'}`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-charcoal placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition ${error ? 'border-red-400' : 'border-charcoal-200'}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            {/* Sign In button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-600 active:scale-95 disabled:opacity-50 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-150 mt-2"
            >
              {isLoading ? <><LoadingSpinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-4 text-center text-sm text-charcoal-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* Divider */}
          <div className="my-6 border-t border-charcoal-100" />

          {/* Quick Demo Login */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-charcoal">Quick Demo Login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc)}
                  disabled={isLoading}
                  className="flex flex-col items-start gap-0.5 p-3 bg-white rounded-xl border border-charcoal-100 hover:border-primary/30 hover:shadow-sm transition-all text-left disabled:opacity-50"
                >
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${acc.color}`}>
                    {acc.role}
                  </span>
                  <span className="text-xs text-charcoal-500 truncate w-full mt-1">{acc.email}</span>
                  <span className="text-xs text-charcoal-300">{acc.password}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
