import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Student } from '@/types';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  selectedYearId: string | null;
  activeRole: User['role'] | null;
  logout: () => void;
  hasRole: (roles: User['role'][]) => boolean;
  setUser: (user: User | null) => void;
  setSelectedYearId: (id: string | null) => void;
  setActiveRole: (role: User['role'] | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      selectedYearId: null,
      activeRole: null,

      logout: () => {
        set({ user: null, isAuthenticated: false, selectedYearId: null, activeRole: null });
      },

      hasRole: (roles: User['role'][]) => {
        const { user, activeRole } = get();
        // Check active perspective first if available, otherwise fallback to base role
        const roleToCheck = activeRole || user?.role;
        return roleToCheck ? roles.includes(roleToCheck) : false;
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user, activeRole: user?.role || null });
      },

      setSelectedYearId: (id: string | null) => {
        set({ selectedYearId: id });
      },

      setActiveRole: (role: User['role'] | null) => {
        set({ activeRole: role });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
