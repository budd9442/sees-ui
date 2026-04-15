import { prisma } from '@/lib/db';

export type HodDepartmentScope = {
  department: string;
  deptModuleIds: string[];
  departmentStudentIds: string[];
};

/**
 * Resolves modules taught by staff in the same department and students
 * registered on those modules (same basis as HOD dashboard totals).
 */
export async function resolveHodDepartmentScope(staffUserId: string): Promise<HodDepartmentScope> {
  const staffRecord = await prisma.staff.findUnique({
    where: { staff_id: staffUserId },
  });

  if (!staffRecord) {
    throw new Error('Staff profile not found');
  }

  const deptString = staffRecord.department;

  const deptStaff = await prisma.staff.findMany({
    where: { department: deptString },
    include: {
      assignments: {
        where: { active: true },
        include: {
          module: {
            include: {
              module_registrations: { select: { student_id: true } },
            },
          },
        },
      },
    },
  });

  const deptModuleIds = new Set<string>();
  const departmentStudentIds = new Set<string>();

  for (const s of deptStaff) {
    for (const a of s.assignments) {
      const mod = a.module;
      if (!mod) continue;
      deptModuleIds.add(mod.module_id);
      for (const r of mod.module_registrations) {
        departmentStudentIds.add(r.student_id);
      }
    }
  }

  return {
    department: deptString,
    deptModuleIds: [...deptModuleIds],
    departmentStudentIds: [...departmentStudentIds],
  };
}
