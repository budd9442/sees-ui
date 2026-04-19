'use client';

import { Bell, LogOut, Settings, User, Check, Trash2 } from 'lucide-react';
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
import { useEffect, useState, useCallback } from 'react';
import { 
  getUserNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  clearAllNotifications 
} from '@/lib/actions/notification-actions';
import { toast } from 'sonner';

export function Navbar() {
  const { user, logout, activeRole, setActiveRole } = useAuthStore();
  const [systemInfo, setSystemInfo] = useState({ institutionName: 'SEES Platform', maintenanceMode: false });
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [notifs, count] = await Promise.all([
        getUserNotifications(10),
        getUnreadNotificationCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    getPublicSystemInfo().then(setSystemInfo);

    if (user) {
      getAcademicYears().then(res => {
        if (res.success && res.data) {
          setAcademicYears(res.data);
        }
      });
      
      fetchNotifications();
      
      // Polling for new notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  if (!user) return null;

  const handleLogout = async () => {
    await import('@/lib/actions').then(({ logoutAction }) => logoutAction());
    logout();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
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
                    <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 overflow-hidden shadow-2xl border-muted-foreground/10 bg-background/95 backdrop-blur-md">
                <div className="p-4 bg-muted/20 border-b flex items-center justify-between">
                    <DropdownMenuLabel className="p-0 text-sm font-bold">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearAll}
                        className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Clear All
                      </Button>
                    )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center text-sm text-muted-foreground bg-muted/5">
                        <Bell className="h-10 w-10 mx-auto mb-3 opacity-20 text-primary" />
                        <p className="font-semibold text-foreground/70 tracking-tight">Clean Slate</p>
                        <p className="text-xs mt-1 text-muted-foreground/60 tracking-normal">No new notifications at the moment.</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                        className={cn(
                          "group p-4 border-b last:border-0 cursor-pointer transition-all duration-200",
                          !notification.isRead ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "opacity-80 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                            !notification.isRead ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                                <p className={cn("text-xs font-bold leading-none", !notification.isRead ? "text-foreground" : "text-muted-foreground")}>
                                {notification.title}
                                </p>
                                {!notification.isRead && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-0.5" />
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground/90 leading-relaxed font-medium line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-wider mt-2">
                                {new Date(notification.sentAt).toLocaleDateString()} at {new Date(notification.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 bg-muted/10 text-center border-t">
                    <Link 
                      href="/dashboard/notifications" 
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
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
