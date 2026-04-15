'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { MoreHorizontal, Search, UserPlus } from 'lucide-react';
import { UserDialog } from './user-dialog';
import { toggleUserStatus, deleteUser, toggleHODStatus } from '@/lib/actions/user-actions';
import { toast } from 'sonner';

// Extended UserData interface to include potential flattened properties
interface UserData {
    user_id: string;
    email: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    status: string;
    created_at: Date;
    last_login_date: Date | null;
    role: string;
    // Student specific
    gpa?: number;
    level?: string;
    degree?: string;
    degreeId?: string;
    admissionYear?: number;
    // Staff specific
    staffNumber?: string;
    department?: string;
    type?: string;
    isHOD?: boolean;
}

interface UserTableProps {
    initialUsers: UserData[];
    totalPages: number;
    degreePrograms: any[];
    role?: 'student' | 'staff' | 'admin';
    currentLevel?: string;
}

export function UserTable({ initialUsers, totalPages, degreePrograms, role, currentLevel }: UserTableProps) {
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>(initialUsers);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Sync users when prop changes (re-fetch happened via server page)
    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const handleEdit = (user: UserData) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setDialogOpen(true);
    };

    const handleLevelFilter = (level: string) => {
        const params = new URLSearchParams(window.location.search);
        if (level === 'ALL') {
            params.delete('level');
        } else {
            params.set('level', level);
        }
        // Keep the tab param
        if (role) params.set('tab', role === 'admin' ? 'admins' : role === 'staff' ? 'staff' : 'students');

        router.push(`?${params.toString()}`);
    };

    const handleSearch = (term: string) => {
        setSearch(term);
        // Implement debounced search here or simple enter key for now
        // For simplicity, we just bind to keypress or allow local filtering if list is small?
        // But users are paginated. We need server search.
        const timer = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (term) params.set('query', term);
            else params.delete('query');
            router.push(`?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timer);
    };

    const handleToggleStatus = async (user: UserData) => {
        try {
            const result = await toggleUserStatus(user.user_id, user.status);
            if (result.success) {
                setUsers(users.map(u =>
                    u.user_id === user.user_id ? { ...u, status: result.newStatus! } : u
                ));
                toast.success(`User ${result.newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleToggleHOD = async (user: UserData) => {
        try {
            const result = await toggleHODStatus(user.user_id);
            if (result.success) {
                toast.success(`HOD status updated successfully`);
                router.refresh(); // Refresh to update the whole list in case another HOD was removed
            } else {
                toast.error("Failed to update HOD status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        defaultValue={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {role === 'student' && (
                        <div className="flex bg-muted p-1 rounded-md">
                            {['ALL', 'L1', 'L2', 'L3', 'L4', 'GRADUATE'].map((lvl) => (
                                <Button
                                    key={lvl}
                                    variant={currentLevel === lvl || (!currentLevel && lvl === 'ALL') ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handleLevelFilter(lvl)}
                                    className="text-xs h-7 px-2"
                                >
                                    {lvl === 'ALL' ? 'All' : lvl}
                                </Button>
                            ))}
                        </div>
                    )}
                    <Button onClick={handleCreate}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>

                            {/* Dynamic Headers based on Role */}
                            {role === 'student' && (
                                <>
                                    <TableHead>Degree</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>GPA</TableHead>
                                </>
                            )}
                            {role === 'staff' && (
                                <>
                                    <TableHead>Staff No</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Type</TableHead>
                                </>
                            )}

                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.user_id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {user.firstName && user.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user.username}
                                            </span>
                                            {user.isHOD && (
                                                <Badge variant="outline" className="text-[10px] py-0 px-1 bg-amber-50 text-amber-700 border-amber-200">
                                                    HOD
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>

                                {/* Dynamic Cells based on Role */}
                                {role === 'student' && (
                                    <>
                                        <TableCell>{user.degree || '-'}</TableCell>
                                        <TableCell>
                                            {user.level ? (
                                                <Badge variant="outline">{user.level}</Badge>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>{user.gpa?.toFixed(2) || '0.00'}</TableCell>
                                    </>
                                )}
                                {role === 'staff' && (
                                    <>
                                        <TableCell>{user.staffNumber || '-'}</TableCell>
                                        <TableCell>{user.department || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.type || 'ACADEMIC'}</Badge>
                                        </TableCell>
                                    </>
                                )}

                                <TableCell>
                                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.user_id)}>
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleEdit(user)}>Edit Details</DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleToggleStatus(user)}
                                                className={user.status === 'ACTIVE' ? "text-red-600" : "text-green-600"}
                                            >
                                                {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                            </DropdownMenuItem>
                                            {role === 'staff' && (
                                                <DropdownMenuItem onClick={() => handleToggleHOD(user)}>
                                                    {user.isHOD ? 'Remove HOD Status' : 'Set as HOD'}
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={async () => {
                                                    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                                                        try {
                                                            const result = await deleteUser(user.user_id);
                                                            if (result.success) {
                                                                setUsers(users.filter(u => u.user_id !== user.user_id));
                                                                toast.success("User deleted successfully");
                                                            } else {
                                                                toast.error(result.error || "Failed to delete user");
                                                                router.refresh(); // Refresh to restore UI state
                                                            }
                                                        } catch (error) {
                                                            toast.error("An error occurred during deletion");
                                                            router.refresh();
                                                        }
                                                    }
                                                }}
                                                className="text-red-600 font-medium"
                                            >
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <UserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={selectedUser}
                degreePrograms={degreePrograms}
            />
        </div >
    );
}
