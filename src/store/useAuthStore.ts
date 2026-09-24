import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  memberSince: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string, phone?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (email, name) =>
    set({
      isLoggedIn: true,
      user: {
        id: 'usr-' + Date.now(),
        name: name || email.split('@')[0],
        email,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      },
    }),
  signup: (name, email, phone) =>
    set({
      isLoggedIn: true,
      user: {
        id: 'usr-' + Date.now(),
        name,
        email,
        phone,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      },
    }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
