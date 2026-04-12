import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Student } from '@/types';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  hasRole: (roles: User['role'][]) => boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      hasRole: (roles: User['role'][]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
