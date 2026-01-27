'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { getAllFeatureFlags, setFeatureFlag } from '@/lib/services/feature-flags';

// --- Feature Flags ---

export async function getSystemFeatureFlags() {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");
    return await getAllFeatureFlags();
}

export async function updateSystemFeatureFlag(key: string, value: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await setFeatureFlag(key, value);
    revalidatePath('/dashboard/admin/academic-calendar');
    revalidatePath('/dashboard/student'); // To update student guards
}

// --- Academic Years ---

export async function getAcademicYears() {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    return await prisma.academicYear.findMany({
        orderBy: { start_date: 'desc' },
        include: {
            semesters: true,
            intakes: {
                include: { degree_program: true }
            }
        }
    });
}

export async function createAcademicYear(data: { label: string; startDate: string; endDate: string }) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await prisma.academicYear.create({
        data: {
            label: data.label,
            start_date: new Date(data.startDate),
            end_date: new Date(data.endDate),
            active: false // Default to inactive
        }
    });
    revalidatePath('/dashboard/admin/academic-calendar');
}

export async function toggleAcademicYearActive(id: string, isActive: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    if (isActive) {
        // Deactivate all others first to ensure only one active year
        await prisma.academicYear.updateMany({
            where: { active: true },
            data: { active: false }
        });
    }

    await prisma.academicYear.update({
        where: { academic_year_id: id },
        data: { active: isActive }
    });
    revalidatePath('/dashboard/admin/academic-calendar');
}

// --- Semesters ---

export async function createSemester(yearId: string, data: { label: string; startDate: string; endDate: string }) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    await prisma.semester.create({
        data: {
            academic_year_id: yearId,
            label: data.label,
            start_date: new Date(data.startDate),
            end_date: new Date(data.endDate)
        }
    });
    revalidatePath('/dashboard/admin/academic-calendar');
}

export async function deleteSemester(semesterId: string) {
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

    // Check for dependencies (registrations/grades) would be good, but schema handles constraints 
    // or we let it fail if in use.
    try {
        await prisma.semester.delete({
            where: { semester_id: semesterId }
        });
        revalidatePath('/dashboard/admin/academic-calendar');
    } catch (error) {
        throw new Error("Cannot delete semester that has registrations or grades.");
    }
}
