import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Student } from '@/types';

// Hardcoded mock users - no external dependencies
const hardcodedUsers: (User | Student)[] = [
  // Demo student (matches hardcoded-data test student)
  {
    id: 'STU001',
    email: 'buddhika.bandara@kln.ac.lk',
    firstName: 'buddhika',
    lastName: 'Bandara',
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
  // Demo student (L1 - no specialization yet)
  {
    id: 'STU002',
    email: 'uditha.sandeepa@kln.ac.lk',
    firstName: 'Uditha',
    lastName: 'Sandeepa',
    role: 'student',
    isActive: true,
    studentId: 'STU002',
    academicYear: 'L1',
    degreeProgram: 'MIT',
    // No specialization for L1 students
    currentGPA: 3.2,
    totalCredits: 30,
    academicClass: 'Second Class Upper',
    pathwayLocked: false,
    enrollmentDate: '2025-09-01',
    enrollmentStatus: 'enrolled',
  } as Student,
  // Demo student (IT - no specialization)
  {
    id: 'STU003',
    email: 'akalanka.senanayake@kln.ac.lk',
    firstName: 'Akalanka',
    lastName: 'Senanayake',
    role: 'student',
    isActive: true,
    studentId: 'STU003',
    academicYear: 'L3',
    degreeProgram: 'IT',
    // No specialization for IT program
    currentGPA: 4.0,
    totalCredits: 95,
    academicClass: 'First Class',
    pathwayLocked: true,
    enrollmentDate: '2022-09-01',
    enrollmentStatus: 'enrolled',
  } as Student,
  // Demo student (L4 with specialization)
  {
    id: 'STU004',
    email: 'chanith.adikari@kln.ac.lk',
    firstName: 'Chanith',
    lastName: 'Adikari',
    role: 'student',
    isActive: true,
    studentId: 'STU004',
    academicYear: 'L4',
    degreeProgram: 'MIT',
    specialization: 'IS',
    currentGPA: 3.8,
    totalCredits: 120,
    academicClass: 'First Class',
    pathwayLocked: true,
    enrollmentDate: '2021-09-01',
    enrollmentStatus: 'enrolled',
  } as Student,
  // Demo staff/teaching roles
  {
    id: 'STAFF001',
    email: 'tharuka.subhashi@kln.ac.lk',
    firstName: 'Ms.',
    lastName: 'Tharuka Subhashi',
    name: 'Ms. Tharuka Subhashi',
    role: 'staff',
    isActive: true,
  },
  {
    id: 'STAFF002',
    email: 'akila.pallepitiya@kln.ac.lk',
    firstName: 'Prof.',
    lastName: 'Akila Pallepitiya',
    name: 'Prof. Akila Pallepitiya',
    role: 'staff',
    isActive: true,
  },
  {
    id: 'STAFF003',
    email: 'thasuni.induma@kln.ac.lk',
    firstName: 'Ms.',
    lastName: 'Thasuni Induma',
    name: 'Ms. Thasuni Induma',
    role: 'staff',
    isActive: true,
  },
  // Academic advisors
  {
    id: 'ADV001',
    email: 'ama.v2@kln.ac.lk',
    firstName: 'Ms.',
    lastName: 'Ama v2',
    name: 'Ms. Ama v2',
    role: 'advisor',
    isActive: true,
  },
  {
    id: 'ADV002',
    email: 'akila.pallepitiya@kln.ac.lk',
    firstName: 'Prof.',
    lastName: 'Akila Pallepitiya',
    name: 'Prof. Akila Pallepitiya',
    role: 'advisor',
    isActive: true,
  },
  // HOD
  {
    id: 'HOD001',
    email: 'yonali.kavindya@kln.ac.lk',
    firstName: 'Dr.',
    lastName: 'Yonali Kavindya',
    name: 'Dr. Yonali Kavindya',
    role: 'hod',
    isActive: true,
  },
  // Admin
  {
    id: 'ADMIN001',
    email: 'admin@kln.ac.lk',
    firstName: 'System',
    lastName: 'Administrator',
    name: 'System Administrator',
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
  setUser: (user: User) => void;
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

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
