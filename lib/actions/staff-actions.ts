'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { ConflictDetector } from '@/lib/services/conflict-detector';

/**
 * Update a lecture schedule (FR5.4)
 */
export async function updateLectureSchedule(data: {
    scheduleId: string;
    dayOfWeek?: string;
    location?: string;
    startTime?: string; // Format "HH:MM"
    endTime?: string;   // Format "HH:MM"
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const schedule = await prisma.lectureSchedule.findUnique({
        where: { schedule_id: data.scheduleId },
        include: { staff: true }
    });

    if (!schedule) throw new Error("Schedule not found.");

    // FR4 Authorization: Staff can only edit their own schedules
    if (schedule.staff_id !== session.user.id) {
        throw new Error("Unauthorized: You can only manage your own class schedules.");
    }

    // Convert HH:MM to Date for the DB
    const updateData: any = {
        day_of_week: data.dayOfWeek,
        location: data.location
    };

    if (data.startTime) {
        const [h, m] = data.startTime.split(':');
        const d = new Date(schedule.start_time);
        d.setHours(parseInt(h), parseInt(m));
        updateData.start_time = d;
    }

    if (data.endTime) {
        const [h, m] = data.endTime.split(':');
        const d = new Date(schedule.end_time);
        d.setHours(parseInt(h), parseInt(m));
        updateData.end_time = d;
    }

    // Production-Grade Conflict Detection
    const conflictResult = await ConflictDetector.validateSchedule({
        staffId: schedule.staff_id,
        roomId: updateData.location || schedule.location || 'Unknown',
        dayOfWeek: updateData.day_of_week || schedule.day_of_week,
        startTime: updateData.start_time || schedule.start_time,
        endTime: updateData.end_time || schedule.end_time,
        ignoreScheduleId: schedule.schedule_id
    });

    if (conflictResult.hasConflict) {
        throw new Error(conflictResult.reason);
    }

    await prisma.lectureSchedule.update({
        where: { schedule_id: data.scheduleId },
        data: updateData
    });

    revalidatePath('/dashboard/staff/schedule');
    return { success: true };
}

/**
 * Fetch Staff's Assigned Schedules
 */
export async function getStaffSchedules() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.lectureSchedule.findMany({
        where: { staff_id: session.user.id },
        include: { module: true }
    });
}
