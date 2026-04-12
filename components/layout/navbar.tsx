'use client';

import { Bell, LogOut, Settings, User, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPublicSystemInfo } from '@/lib/actions/system-settings-actions';
import { getAcademicYears } from '@/lib/actions/academic-years';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { user, logout, selectedYearId, setSelectedYearId } = useAuthStore();
  const [systemInfo, setSystemInfo] = useState({ institutionName: 'SEES Platform', maintenanceMode: false });
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const notifications: any[] = [];
  const router = useRouter();

  useEffect(() => {
    getPublicSystemInfo().then(setSystemInfo);
    
    // Fetch academic years for non-student roles
    if (user && user.role !== 'student') {
        getAcademicYears().then(res => {
            if (res.success && res.data) {
                setAcademicYears(res.data);
                
                // Auto-initialize selectedYearId to the active one if currently null
                if (!selectedYearId) {
                    const activeYear = res.data.find((y: any) => y.isActive);
                    if (activeYear) {
                        setSelectedYearId(activeYear.id);
                    } else if (res.data.length > 0) {
                        setSelectedYearId(res.data[0].id);
                    }
                }
            }
        });
    }
  }, [user, selectedYearId, setSelectedYearId]);

  if (!user) return null;

  const userNotifications = notifications.filter((n) => n.userId === user.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await import('@/lib/actions').then(({ logoutAction }) => logoutAction());
    logout();
  };

  const isStaffOrAdmin = user.role !== 'student';

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1">
      <div className="px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-lg font-black tracking-tight text-primary">{systemInfo.institutionName}</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                  Academic Intelligence
                </p>
              </div>
            </div>

            {/* Academic Year Selector for Staff/Admin */}
            {isStaffOrAdmin && academicYears.length > 0 && (
                <div className="hidden lg:flex items-center gap-3 pl-8 border-l border-muted-foreground/10">
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                    <Select value={selectedYearId || ""} onValueChange={setSelectedYearId}>
                        <SelectTrigger className="w-[200px] h-9 bg-muted/30 border-none font-bold text-xs rounded-xl focus:ring-1">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-muted-foreground/10 shadow-xl">
                            {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id} className="text-xs font-medium py-2.5">
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <span>{year.label}</span>
                                        {year.isActive && (
                                            <Badge className="text-[8px] h-3 px-1 bg-green-500 hover:bg-green-500 border-none uppercase">Active</Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Quick Indicator for Students */}
            {!isStaffOrAdmin && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-dashed text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active Academic Cycle
                </div>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-muted/50 rounded-full transition-colors">
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
                <Button variant="ghost" className="gap-3 h-12 pr-4 pl-1 hover:bg-muted/50 rounded-full transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-black tracking-tight leading-none mb-1 capitalize">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                      {user.role} Context
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
