'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  BarChart3,
  MessageSquare,
  MessageCircle,
  Calendar,
  Target,
  Users,
  Settings,
  FileText,
  TrendingUp,
  Shield,
  Database,
  ClipboardList,
  Briefcase,
  UserCheck,
  Award,
  CreditCard,
  AlertTriangle,
  Star,
  Upload,
  Edit,
  Clock,
  UserPlus,
  Cog,
  History,
  Eye,
  Download,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  Archive,
  Search,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navigationItems: NavItem[] = [
  // Student Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/student',
    icon: LayoutDashboard,
    roles: ['student'],
  },
  {
    title: 'Grades',
    href: '/dashboard/student/grades',
    icon: Award,
    roles: ['student'],
  },
  {
    title: 'Module Registration',
    href: '/dashboard/student/modules',
    icon: BookOpen,
    roles: ['student'],
  },
  {
    title: 'Pathway Selection',
    href: '/dashboard/student/pathway',
    icon: GraduationCap,
    roles: ['student'],
  },
  {
    title: 'Specialization',
    href: '/dashboard/student/specialization',
    icon: Star,
    roles: ['student'],
  },
  {
    title: 'My Schedule',
    href: '/dashboard/student/schedule',
    icon: Calendar,
    roles: ['student'],
  },
  {
    title: 'Academic Goals',
    href: '/dashboard/student/goals',
    icon: Target,
    roles: ['student'],
  },
  {
    title: 'Personalized Feedback',
    href: '/dashboard/student/personalized-feedback',
    icon: MessageCircle,
    roles: ['student'],
  },
  {
    title: 'Credit Progress',
    href: '/dashboard/student/credits',
    icon: CreditCard,
    roles: ['student'],
  },
  {
    title: 'Messages',
    href: '/dashboard/student/messages',
    icon: MessageSquare,
    roles: ['student'],
  },
  {
    title: 'Internship',
    href: '/dashboard/student/internship',
    icon: Briefcase,
    roles: ['student'],
  },
  {
    title: 'Anonymous Reports',
    href: '/dashboard/student/reports',
    icon: AlertTriangle,
    roles: ['student'],
  },
  {
    title: 'Rankings',
    href: '/dashboard/student/rankings',
    icon: TrendingUp,
    roles: ['student'],
  },

  // Staff Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/staff',
    icon: LayoutDashboard,
    roles: ['staff', 'advisor', 'hod'],
  },
  {
    title: 'My Modules',
    href: '/dashboard/staff/modules',
    icon: BookOpen,
    roles: ['staff', 'advisor', 'hod'],
  },
  {
    title: 'Grade Management',
    href: '/dashboard/staff/grades',
    icon: ClipboardList,
    roles: ['staff', 'advisor', 'hod'],
  },
  {
    title: 'Schedule',
    href: '/dashboard/staff/schedule',
    icon: Calendar,
    roles: ['staff', 'advisor', 'hod'],
  },
  {
    title: 'Analytics',
    href: '/dashboard/staff/analytics',
    icon: BarChart3,
    roles: ['staff', 'advisor', 'hod'],
  },

  // Advisor Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/advisor',
    icon: LayoutDashboard,
    roles: ['advisor', 'hod'],
  },
  {
    title: 'My Advisees',
    href: '/dashboard/advisor/students',
    icon: Users,
    roles: ['advisor', 'hod'],
  },

  {
    title: 'Academic Records',
    href: '/dashboard/advisor/records',
    icon: FileText,
    roles: ['advisor', 'hod'],
  },
  {
    title: 'Messages',
    href: '/dashboard/advisor/messages',
    icon: MessageSquare,
    roles: ['advisor', 'hod'],
  },

  // HOD Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/hod',
    icon: LayoutDashboard,
    roles: ['hod'],
  },
  {
    title: 'Analytics',
    href: '/dashboard/hod/analytics',
    icon: BarChart3,
    roles: ['hod'],
  },
  {
    title: 'Trend Analysis',
    href: '/dashboard/hod/trends',
    icon: TrendingUp,
    roles: ['hod'],
  },
  {
    title: 'Reports',
    href: '/dashboard/hod/reports',
    icon: FileText,
    roles: ['hod'],
  },
  {
    title: 'Rankings',
    href: '/dashboard/hod/rankings',
    icon: Star,
    roles: ['hod'],
  },
  {
    title: 'Eligible Students',
    href: '/dashboard/hod/eligible',
    icon: CheckCircle,
    roles: ['hod'],
  },
  {
    title: 'Pathway Allocation',
    href: '/dashboard/hod/pathways',
    icon: GraduationCap,
    roles: ['hod'],
  },

  // Admin Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    title: 'Bulk Enrollment',
    href: '/dashboard/admin/bulk-enroll',
    icon: UserPlus,
    roles: ['admin'],
  },
  {
    title: 'User Management',
    href: '/dashboard/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Programs Config',
    href: '/dashboard/admin/programs',
    icon: GraduationCap,
    roles: ['admin'],
  },
  {
    title: 'Module Management',
    href: '/dashboard/admin/modules',
    icon: BookOpen,
    roles: ['admin'],
  },
  {
    title: 'GPA Config',
    href: '/dashboard/admin/config/gpa',
    icon: Award,
    roles: ['admin'],
  },
  {
    title: 'Calendar Config',
    href: '/dashboard/admin/academic-calendar',
    icon: Calendar,
    roles: ['admin'],
  },
  {
    title: 'Notifications Config',
    href: '/dashboard/admin/config/notifications',
    icon: MessageSquare,
    roles: ['admin'],
  },
  {
    title: 'Reports Config',
    href: '/dashboard/admin/config/reports',
    icon: FileSpreadsheet,
    roles: ['admin'],
  },
  {
    title: 'Backup & Restore',
    href: '/dashboard/admin/backup',
    icon: Database,
    roles: ['admin'],
  },
  {
    title: 'Reports Review',
    href: '/dashboard/admin/reports-review',
    icon: Eye,
    roles: ['admin'],
  },
  {
    title: 'System Logs',
    href: '/dashboard/admin/logs',
    icon: History,
    roles: ['admin'],
  },
];

export function Sidebar({ featureFlags }: { featureFlags?: Record<string, boolean> }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  // Feature Key Mapping
  const FEATURE_KEYS: Record<string, string> = {
    '/dashboard/student/pathway': 'pathway_selection',
    '/dashboard/student/modules': 'module_registration',
    '/dashboard/student/specialization': 'specialization_selection',
    '/dashboard/student/reports': 'anonymous_reports',
  };

  const filteredItems = navigationItems.filter((item) => {
    // 1. Role Check
    if (item.roles && !item.roles.includes(user.role)) return false;

    // 2. Feature Flag Check
    const featureKey = FEATURE_KEYS[item.href];
    if (featureKey && featureFlags) {
      if (featureFlags[featureKey] === false) return false;
    }

    return true;
  });

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <ScrollArea className="h-full py-6">
        <nav className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
