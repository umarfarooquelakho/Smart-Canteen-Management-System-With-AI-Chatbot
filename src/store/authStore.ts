import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { usersDB } from '../lib/db';
import { DEMO_PASSWORDS } from '../data/seed';
import { nanoid } from '../utils/nanoid';
import { sendWelcomeEmail } from '../services/emailService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (changes: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 600)); // realistic delay

        const user = usersDB.getByEmail(email);
        if (!user) {
          set({ isLoading: false, error: 'No account found with that email address.' });
          return;
        }

        // Check password (demo passwords from seed + any registered users)
        const stored = DEMO_PASSWORDS[email] ?? localStorage.getItem(`sc_pwd_${email}`);
        if (!stored || stored !== password) {
          set({ isLoading: false, error: 'Incorrect password. Please try again.' });
          return;
        }

        if (user.account_status !== 'active') {
          set({ isLoading: false, error: 'Your account has been suspended. Contact admin.' });
          return;
        }

        set({ user, isLoading: false, error: null });
      },

      logout: () => {
        set({ user: null, error: null });
      },

      signUp: async (name, email, password) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 600));

        const existing = usersDB.getByEmail(email);
        if (existing) {
          set({ isLoading: false, error: 'An account with this email already exists.' });
          return;
        }

        const newUser: User = {
          id: `user-${nanoid()}`,
          name,
          email,
          role: 'customer',
          account_status: 'active',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          created_at: new Date().toISOString(),
        };

        usersDB.create(newUser);
        localStorage.setItem(`sc_pwd_${email}`, password);

        // Send welcome email (fire-and-forget — never blocks sign-up)
        sendWelcomeEmail(newUser);

        set({ user: newUser, isLoading: false, error: null });
      },

      updateProfile: (changes) => {
        const { user } = get();
        if (!user) return;
        const updated = usersDB.update(user.id, changes);
        if (updated) set({ user: updated });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'fatafat_food_auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

