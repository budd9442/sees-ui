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
  const deptModuleCodes = new Set<string>();
  const departmentStudentIds = new Set<string>();

  for (const s of deptStaff) {
    for (const a of s.assignments) {
      const mod = a.module;
      if (!mod) continue;
      deptModuleIds.add(mod.module_id);
      if (mod.code?.trim()) deptModuleCodes.add(mod.code.trim().toUpperCase());
      for (const r of mod.module_registrations) {
        departmentStudentIds.add(r.student_id);
      }
    }
  }

  // Some cohorts are registered against same module code but different module_id
  // (for example after academic-year module duplication). Include those students too.
  if (deptModuleCodes.size > 0) {
    const codeOr = [...deptModuleCodes].map((code) => ({
      module: { code: { equals: code, mode: 'insensitive' as const } },
    }));
    const codeBasedRegs = await prisma.moduleRegistration.findMany({
      where: {
        OR: codeOr,
      },
      select: { student_id: true },
    });
    for (const reg of codeBasedRegs) {
      departmentStudentIds.add(reg.student_id);
    }
  }

  return {
    department: deptString,
    deptModuleIds: [...deptModuleIds],
    departmentStudentIds: [...departmentStudentIds],
  };
}
