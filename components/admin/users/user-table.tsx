'use client';

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Search, UserPlus } from 'lucide-react';
import { UserDialog } from './user-dialog';
import { toggleUserStatus } from '@/lib/actions/user-actions';
import { toast } from 'sonner';

// We'll define a type for the user data coming from our server action
interface UserData {
    user_id: string;
    email: string;
    username: string;
    first_name?: string | null;
    last_name?: string | null;
    status: string;
    created_at: Date;
    last_login_date: Date | null;
    role: string;
}

interface UserTableProps {
    initialUsers: UserData[];
    totalPages: number;
    degreePrograms: any[];
}

export function UserTable({ initialUsers, totalPages, degreePrograms }: UserTableProps) {
    const [users, setUsers] = useState<UserData[]>(initialUsers);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const handleEdit = (user: UserData) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setDialogOpen(true);
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button onClick={handleCreate}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.user_id}>
                                <TableCell>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {user.first_name && user.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : user.username}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.last_login_date ? new Date(user.last_login_date).toLocaleDateString() : 'Never'}
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
        </div>
    );
}
