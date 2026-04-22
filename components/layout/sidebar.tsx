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
  ShieldCheck,
  Scale,
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
    title: 'Grade Management',
    href: '/dashboard/staff/grades',
    icon: ClipboardList,
    roles: ['staff', 'advisor', 'hod'],
  },
  {
    title: 'My Modules',
    href: '/dashboard/staff/modules',
    icon: BookOpen,
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
  {
    title: 'Report builder',
    href: '/dashboard/staff/analytics/builder',
    icon: FileSpreadsheet,
    roles: ['staff', 'advisor', 'hod'],
  },
  {
    title: 'Messages',
    href: '/dashboard/staff/messages',
    icon: MessageSquare,
    roles: ['staff', 'advisor', 'hod'],
  },
  {
    title: 'Reports Review',
    href: '/dashboard/staff/reports-review',
    icon: Eye,
    roles: ['staff', 'advisor'],
  },


  // HOD Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/hod',
    icon: LayoutDashboard,
    roles: ['hod'],
  },
  {
    title: 'Messages',
    href: '/dashboard/hod/messages',
    icon: MessageSquare,
    roles: ['hod'],
  },
  {
    title: 'Analytics',
    href: '/dashboard/hod/analytics',
    icon: BarChart3,
    roles: ['hod'],
  },
  {
    title: 'Report builder',
    href: '/dashboard/hod/analytics/builder',
    icon: FileSpreadsheet,
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
    title: 'Graduation rules',
    href: '/dashboard/hod/graduation-rules',
    icon: Scale,
    roles: ['hod'],
  },
  {
    title: 'Selections',
    href: '/dashboard/hod/pathways',
    icon: GraduationCap,
    roles: ['hod'],
  },
  {
    title: 'Module registration',
    href: '/dashboard/hod/module-registration',
    icon: BookOpen,
    roles: ['hod'],
  },
  {
    title: 'Batch management',
    href: '/dashboard/hod/batches',
    icon: Users,
    roles: ['hod'],
  },
  {
    title: 'Reports Review',
    href: '/dashboard/hod/reports-review',
    icon: Eye,
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
    title: 'Messages',
    href: '/dashboard/admin/messages',
    icon: MessageSquare,
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
    title: 'Academic Governance',
    href: '/dashboard/admin/config/academic',
    icon: Shield,
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
    title: 'Graduation rules',
    href: '/dashboard/hod/graduation-rules',
    icon: Scale,
    roles: ['admin'],
  },
  {
    title: 'Credit Rules',
    href: '/dashboard/admin/config/credits',
    icon: ShieldCheck,
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
    icon: Cog,
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
    title: 'Analytics Builder',
    href: '/dashboard/admin/analytics',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    title: 'System Logs',
    href: '/dashboard/admin/logs',
    icon: History,
    roles: ['admin'],
  },
  {
    title: 'API Docs',
    href: '/dashboard/admin/docs',
    icon: FileText,
    roles: ['admin'],
  },

];

export function Sidebar({ featureFlags }: { featureFlags?: Record<string, boolean> }) {
  const pathname = usePathname();
  const { user, activeRole } = useAuthStore();

  if (!user) return null;

  // Feature Key Mapping (pathway/specialization visibility is HOD-controlled via selection rounds, not flags)
  const FEATURE_KEYS: Record<string, string> = {
    '/dashboard/student/reports': 'anonymous_reports',
  };

  const filteredItems = navigationItems.filter((item) => {
    const currentPerspective = activeRole || user.role;
    const normalizedLevel = String(user.currentLevel ?? '').trim().toUpperCase().replace(/\s+/g, '');
    const isLevel1Student = normalizedLevel === 'L1' || normalizedLevel === 'LEVEL1';

    // 1. Perspective/Role Check
    if (item.roles && !item.roles.includes(currentPerspective)) return false;

    // 2. Strict Perspective Isolation (URL-Prefix Based)
    // Ensure we only show items belonging to the current perspective's path
    const perspectivePath = `/dashboard/${currentPerspective}`;

    // Allow certain shared paths or items that explicitly include the role
    const isSharedPath = item.roles?.includes(currentPerspective);

    // Most items should start with their role path
    // Special case: 'staff' also includes 'advisor' items in their view
    if (currentPerspective === 'staff' || currentPerspective === 'advisor') {
      if (!item.href.startsWith('/dashboard/staff')) return false;
    } else {
      // For HOD/Student/Admin, be strict but allow explicitly tagged shared items
      if (!item.href.startsWith(perspectivePath) && !isSharedPath) return false;
    }

    // 2. Feature Flag Check
    const featureKey = FEATURE_KEYS[item.href];
    if (featureKey && featureFlags) {
      if (featureFlags[featureKey] === false) return false;
    }

    // IT students do not have specialization tracks; hide this entry.
    if (
      currentPerspective === 'student' &&
      item.href === '/dashboard/student/specialization' &&
      (user.degreeProgram === 'IT' || isLevel1Student)
    ) {
      return false;
    }

    return true;
  });

  const currentPerspective = (activeRole || user.role || 'student').toUpperCase();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r border-primary/15 bg-gradient-to-b from-muted/40 to-background shadow-sm">
      <ScrollArea className="h-full py-5">
        <div className="px-3 pb-3">
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Active Workspace</p>
            <p className="text-sm font-bold text-foreground">{currentPerspective}</p>
          </div>
        </div>
        <nav className="space-y-1.5 px-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/80 hover:bg-background hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
