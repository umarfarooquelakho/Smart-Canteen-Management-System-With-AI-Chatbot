import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Logo from '../../components/ui/Logo';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [formError, setFormError] = useState('');
  const { signUp, user, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError('');
    if (!name.trim()) return setFormError('Please enter your name.');
    if (!email.trim()) return setFormError('Please enter your email.');
    if (password.length < 6) return setFormError('Password must be at least 6 characters.');
    if (password !== confirm) return setFormError('Passwords do not match.');
    await signUp(name.trim(), email.trim(), password);
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" variant="full" />
          </div>
          <p className="text-charcoal-400 mt-2 text-sm">Join FataFat Food today</p>
        </div>

        <div className="card shadow-card-hover">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="label">Full Name</label>
                <input
                  id="name" type="text" autoComplete="name"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="input" placeholder="Alex Johnson" disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email" type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input" placeholder="you@example.com" disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10" placeholder="Min. 6 characters" disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                    aria-label={showPwd ? 'Hide' : 'Show'}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="label">Confirm Password</label>
                <input
                  id="confirm" type="password" autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="input" placeholder="Repeat password" disabled={isLoading}
                />
              </div>

              {(formError || error) && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">
                  {formError || error}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn-primary w-full btn-lg">
                {isLoading ? <><LoadingSpinner size="sm" /> Creating account...</> : 'Create Account'}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-charcoal-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

