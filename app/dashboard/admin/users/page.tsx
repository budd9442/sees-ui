import { getUsers } from '@/lib/actions/user-actions';
import { getAllPrograms } from '@/lib/actions/admin-programs';
import { UserTable } from '@/components/admin/users/user-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const { query = '', page } = await searchParams;
  const currentPage = Number(page) || 1;

  const [{ data: users, totalPages }, degreePrograms] = await Promise.all([
    getUsers({
      page: currentPage,
      search: query,
    }),
    getAllPrograms()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage system access, roles, and user accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users registered in the system including their roles and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            initialUsers={users || []}
            totalPages={totalPages || 1}
            degreePrograms={degreePrograms}
          />
        </CardContent>
      </Card>
    </div>
  );
}
