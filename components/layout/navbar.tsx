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
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPublicSystemInfo } from '@/lib/actions/system-settings-actions';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [systemInfo, setSystemInfo] = useState({ institutionName: 'SEES Platform', maintenanceMode: false });
  const notifications: any[] = [];
  const router = useRouter();

  useEffect(() => {
    getPublicSystemInfo().then(setSystemInfo);
  }, []);

  if (!user) return null;

  const userNotifications = notifications.filter((n) => n.userId === user.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    // 1. Call server action to destroy session
    // We import this dynamically to avoid server-action-in-client-component issues if not bundled correctly
    await import('@/lib/actions').then(({ logoutAction }) => logoutAction());

    // 2. Clear client state
    logout();
  };



  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">

              <div>
                <h1 className="text-lg font-bold">{systemInfo.institutionName}</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Academic Intelligence System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {userNotifications.slice(0, 5).length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    userNotifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b cursor-pointer hover:bg-accent ${!notification.isRead ? 'bg-accent/50' : ''
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
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
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
