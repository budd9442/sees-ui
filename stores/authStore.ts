import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Student } from '@/types';

// Hardcoded mock users - no external dependencies
const hardcodedUsers: (User | Student)[] = [
  {
    id: 'STU001',
    email: 'alice@university.edu',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'student',
    isActive: true,
    studentId: 'STU001',
    academicYear: 'L2',
    degreeProgram: 'MIT',
    specialization: 'BSE',
    currentGPA: 3.65,
    totalCredits: 65,
    academicClass: 'Second Class Upper',
    pathwayLocked: true,
    enrollmentDate: '2023-09-01',
    enrollmentStatus: 'enrolled',
  } as Student,
  {
    id: 'STAFF001',
    email: 'sarah.wilson@university.edu',
    firstName: 'Prof. Sarah',
    lastName: 'Wilson',
    role: 'staff',
    isActive: true,
  },
  {
    id: 'ADV001',
    email: 'michael.smith@university.edu',
    firstName: 'Dr. Michael',
    lastName: 'Smith',
    role: 'advisor',
    isActive: true,
  },
  {
    id: 'HOD001',
    email: 'john.anderson@university.edu',
    firstName: 'Prof. John',
    lastName: 'Anderson',
    role: 'hod',
    isActive: true,
  },
  {
    id: 'ADMIN001',
    email: 'admin@university.edu',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    isActive: true,
  },
];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasRole: (roles: User['role'][]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string) => {
        // Simple hardcoded authentication - any password works
        const user = hardcodedUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }

        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      hasRole: (roles: User['role'][]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
