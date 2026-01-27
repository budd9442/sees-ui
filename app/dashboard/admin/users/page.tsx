import { getUsers } from '@/lib/actions/user-actions';
import { getAllPrograms } from '@/lib/actions/admin-programs';
import { UserTable } from '@/components/admin/users/user-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    tab?: string;
    level?: string;
  }>;
}) {
  const { query = '', page, tab = 'students', level } = await searchParams;
  const currentPage = Number(page) || 1;

  // We fetch specific data based on the active tab/role to optimize
  // But for now, we can just fetch all or filter by role in the server action
  // Let's create separate data fetches for each tab to ensure isolation and proper pagination per tab if needed
  // Or simpler: The page reloads on tab change (via Link or router), so we just fetch for the current 'tab' (which maps to role)

  const activeRole = tab === 'admins' ? 'admin' : (tab === 'staff' ? 'staff' : 'student');

  const [{ data: users, totalPages }, degreePrograms] = await Promise.all([
    getUsers({
      page: currentPage,
      search: query,
      role: activeRole,
      level: activeRole === 'student' ? level : undefined
    }),
    getAllPrograms()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system access, roles, and user accounts.
          </p>
        </div>
        {/* We might want a global Add User button or specific per tab. 
              The UserTable has one, but maybe better here? 
              Leaving it in UserTable for now as it handles the dialog state. */}
      </div>

      <Tabs defaultValue={tab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <Link href="/dashboard/admin/users?tab=students">
              <TabsTrigger value="students">Students</TabsTrigger>
            </Link>
            <Link href="/dashboard/admin/users?tab=staff">
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </Link>
            <Link href="/dashboard/admin/users?tab=admins">
              <TabsTrigger value="admins">Admins</TabsTrigger>
            </Link>
          </TabsList>
        </div>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage student accounts, academic levels, and degree paths.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                initialUsers={users || []}
                totalPages={totalPages || 1}
                degreePrograms={degreePrograms}
                role="student"
                currentLevel={level}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff</CardTitle>
              <CardDescription>
                Manage academic and administrative staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                initialUsers={users || []}
                totalPages={totalPages || 1}
                degreePrograms={degreePrograms}
                role="staff"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                Manage system administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                initialUsers={users || []}
                totalPages={totalPages || 1}
                degreePrograms={degreePrograms}
                role="admin"
              />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
