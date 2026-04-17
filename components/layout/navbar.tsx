'use client';

import { Bell, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import { getPublicSystemInfo } from '@/lib/actions/system-settings-actions';
import { getAcademicYears } from '@/lib/actions/academic-years';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { user, logout, activeRole, setActiveRole } = useAuthStore();
  const [systemInfo, setSystemInfo] = useState({ institutionName: 'SEES Platform', maintenanceMode: false });
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const notifications: any[] = [];
  const router = useRouter();

  useEffect(() => {
    getPublicSystemInfo().then(setSystemInfo);

    // Fetch academic years for lightweight header context.
    if (user) {
      getAcademicYears().then(res => {
        if (res.success && res.data) {
          setAcademicYears(res.data);
        }
      });
    }
  }, [user]);

  if (!user) return null;

  const userNotifications = notifications.filter((n) => n.userId === user.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await import('@/lib/actions').then(({ logoutAction }) => logoutAction());
    logout();
  };

  const isStaffOrAdmin = user.role !== 'student';
  const activeAcademicYearLabel =
    academicYears.find((y: any) => y.isActive)?.label ||
    academicYears[0]?.label ||
    'Academic Year';

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-background via-background to-primary/5 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-foreground">{systemInfo.institutionName}</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.16em] font-semibold">
                  Academic Intelligence
                </p>
              </div>
            </div>

            {/* HOD Perspective Toggle - Premium Pill Design */}
            {user.isHOD && (
                <div className="hidden xl:flex items-center ml-4 relative bg-muted/50 p-1 rounded-full border border-border shadow-sm">
                    <div className="relative flex">
                        <button
                            onClick={() => {
                                setActiveRole('staff');
                                router.push('/dashboard/staff');
                            }}
                            className={cn(
                                "relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-300 flex items-center gap-2",
                                activeRole === 'staff' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutDashboard className="h-3 w-3" />
                            Academic View
                        </button>
                        <button
                            onClick={() => {
                                setActiveRole('hod');
                                router.push('/dashboard/hod');
                            }}
                            className={cn(
                                "relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-300 flex items-center gap-2",
                                activeRole === 'hod' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShieldCheck className="h-3 w-3" />
                            Dept. Head View
                        </button>

                        <AnimatePresence>
                            <motion.div
                                layoutId="perspective-indicator"
                                className="absolute inset-y-0 rounded-full shadow-md bg-primary shadow-primary/30"
                                initial={false}
                                animate={{
                                    x: activeRole === 'hod' ? '100%' : '0%',
                                    width: '50%'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </AnimatePresence>
                    </div>
                </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Quick Indicator for Students */}
            {!isStaffOrAdmin && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border text-xs font-semibold uppercase tracking-wide text-foreground/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    {activeAcademicYearLabel}
                </div>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full border border-transparent hover:border-border hover:bg-muted/70 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute right-1 top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center border-2 border-background"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 overflow-hidden shadow-2xl border-muted-foreground/10">
                <div className="p-4 bg-muted/5 border-b">
                    <DropdownMenuLabel className="p-0 text-sm font-bold">Notifications</DropdownMenuLabel>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {userNotifications.slice(0, 5).length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-10" />
                        <p className="font-medium">All caught up</p>
                    </div>
                  ) : (
                    userNotifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="font-bold text-xs">
                              {notification.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-3 h-12 pr-4 pl-1 rounded-full border border-transparent hover:border-border hover:bg-muted/70 transition-colors">
                  <Avatar className="h-10 w-10 border border-border shadow-sm">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold tracking-tight leading-none mb-1 capitalize">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-muted-foreground/10">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/dashboard/profile" className="flex items-center font-medium py-2">
                    <User className="mr-3 h-4 w-4 text-muted-foreground" />
                    Profile Detail
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/dashboard/settings" className="flex items-center font-medium py-2">
                    <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-3 h-4 w-4" />
                  Terminated Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
