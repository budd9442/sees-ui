import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Student } from '@/types';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  selectedYearId: string | null;
  logout: () => void;
  hasRole: (roles: User['role'][]) => boolean;
  setUser: (user: User | null) => void;
  setSelectedYearId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      selectedYearId: null,

      logout: () => {
        set({ user: null, isAuthenticated: false, selectedYearId: null });
      },

      hasRole: (roles: User['role'][]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setSelectedYearId: (id: string | null) => {
        set({ selectedYearId: id });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
