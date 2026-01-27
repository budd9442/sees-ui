'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { CalendarEvent } from '@prisma/client';

export async function getCalendarEvents() {
    try {
        const events = await prisma.calendarEvent.findMany({
            orderBy: { startDate: 'asc' },
        });
        return { success: true, data: events };
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return { success: false, error: 'Failed to fetch calendar events' };
    }
}

export async function createCalendarEvent(data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    type: string;
    isRecurring: boolean;
    recurrencePattern?: string;
}) {
    try {
        const event = await prisma.calendarEvent.create({
            data: {
                title: data.title,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                type: data.type,
                isRecurring: data.isRecurring,
                recurrencePattern: data.recurrencePattern,
            },
        });
        revalidatePath('/dashboard/admin/academic-calendar');
        return { success: true, data: event };
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return { success: false, error: 'Failed to create calendar event' };
    }
}

export async function updateCalendarEvent(id: string, data: Partial<CalendarEvent>) {
    try {
        // Exclude id, createdAt, updatedAt
        const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data as any;

        const event = await prisma.calendarEvent.update({
            where: { id },
            data: updateData,
        });
        revalidatePath('/dashboard/admin/academic-calendar');
        return { success: true, data: event };
    } catch (error) {
        console.error('Error updating calendar event:', error);
        return { success: false, error: 'Failed to update calendar event' };
    }
}

export async function deleteCalendarEvent(id: string) {
    try {
        await prisma.calendarEvent.delete({ where: { id } });
        revalidatePath('/dashboard/admin/academic-calendar');
        return { success: true };
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        return { success: false, error: 'Failed to delete calendar event' };
    }
}
