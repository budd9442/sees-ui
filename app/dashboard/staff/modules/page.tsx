export const dynamic = "force-dynamic";
import { getStaffAssignedModules } from '@/lib/actions/staff-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function StaffModulesPage() {
  const modules = await getStaffAssignedModules();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Modules</h1>
        <p className="text-muted-foreground mt-1">
          Manage your assigned modules and student grades.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module: any, index: number) => (
          <Card key={module.assignment_id ?? `${module.module_id}-${index}`} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {module.code}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[10px] px-2 py-0">
                      {module.academicYear}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-1">{module.name}</CardTitle>
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {module.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{module.enrolledCount} Enrolled</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/dashboard/staff/roster/${module.module_id}`}>
                  Manage Roster <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {modules.length === 0 && (
          <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-muted-foreground">You are not assigned to any modules this semester.</p>
          </div>
        )}
      </div>
    </div>
  );
}
