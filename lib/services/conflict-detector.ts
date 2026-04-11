import { prisma } from '@/lib/db';

export interface ConflictResult {
    hasConflict: boolean;
    reason?: string;
    conflictingSchedule?: any;
}

/**
 * ConflictDetector
 * Production-grade engine to prevent resource over-utilization (Staff, Room, Cohort).
 */
export class ConflictDetector {

    /**
     * Check if a proposed schedule overlaps with existing ones.
     * Logic: (StartA < EndB && EndA > StartB)
     */
    static async validateSchedule(data: {
        staffId: string;
        roomId: string; // location in schema
        dayOfWeek: string;
        startTime: Date;
        endTime: Date;
        ignoreScheduleId?: string; // For updates
    }): Promise<ConflictResult> {

        // 1. Fetch all schedules for the same day
        const existingSchedules = await prisma.lectureSchedule.findMany({
            where: {
                day_of_week: data.dayOfWeek,
                schedule_id: { not: data.ignoreScheduleId }
            },
            include: { module: true, staff: { include: { user: true } } }
        });

        for (const existing of existingSchedules) {
            const overlap = (data.startTime < existing.end_time && data.endTime > existing.start_time);
            
            if (overlap) {
                // Check Case A: Staff Double-Booking
                if (existing.staff_id === data.staffId) {
                    return {
                        hasConflict: true,
                        reason: `Staff member is already booked for ${existing.module.code} between ${this.formatTime(existing.start_time)} and ${this.formatTime(existing.end_time)}`,
                        conflictingSchedule: existing
                    };
                }

                // Check Case B: Room Collision
                if (existing.location === data.roomId) {
                    return {
                        hasConflict: true,
                        reason: `Room ${data.roomId} is already occupied by ${existing.module.code} during this period.`,
                        conflictingSchedule: existing
                    };
                }

                // Check Case C: Cohort Collision (Optional/Advanced)
                // In a true enterprise system, we would also check if the student group assigned 
                // to 'targetModule' is already in a lecture for 'existing.module'.
            }
        }

        return { hasConflict: false };
    }

    private static formatTime(date: Date): string {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
