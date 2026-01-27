'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { FeatureFlag } from '@prisma/client';

export async function getFeatureFlags() {
    try {
        const flags = await prisma.featureFlag.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: flags };
    } catch (error) {
        console.error('Error fetching feature flags:', error);
        return { success: false, error: 'Failed to fetch feature flags' };
    }
}

export async function createFeatureFlag(data: {
    name: string;
    key: string;
    description?: string;
    isEnabled: boolean;
    targetRoles: string[];
    startDate?: Date;
    endDate?: Date;
}) {
    try {
        const flag = await prisma.featureFlag.create({
            data: {
                name: data.name,
                key: data.key,
                description: data.description,
                isEnabled: data.isEnabled,
                targetRoles: data.targetRoles,
                startDate: data.startDate,
                endDate: data.endDate
            },
        });
        revalidatePath('/dashboard/admin/academic-calendar');
        return { success: true, data: flag };
    } catch (error) {
        console.error('Error creating feature flag:', error);
        return { success: false, error: 'Failed to create feature flag' };
    }
}

export async function updateFeatureFlag(id: string, data: Partial<FeatureFlag>) {
    try {
        // Exclude id, createdAt, updatedAt from data update
        const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data as any;

        const flag = await prisma.featureFlag.update({
            where: { id },
            data: updateData,
        });
        revalidatePath('/dashboard/admin/academic-calendar');
        return { success: true, data: flag };
    } catch (error) {
        console.error('Error updating feature flag:', error);
        return { success: false, error: 'Failed to update feature flag' };
    }
}

export async function toggleFeatureFlag(id: string) {
    try {
        const flag = await prisma.featureFlag.findUnique({ where: { id } });
        if (!flag) throw new Error('Feature flag not found');

        const updatedFlag = await prisma.featureFlag.update({
            where: { id },
            data: { isEnabled: !flag.isEnabled },
        });
        revalidatePath('/dashboard/admin/academic-calendar');
        return { success: true, data: updatedFlag };
    } catch (error) {
        console.error('Error toggling feature flag:', error);
        return { success: false, error: 'Failed to toggle feature flag' };
    }
}

export async function deleteFeatureFlag(id: string) {
    try {
        await prisma.featureFlag.delete({ where: { id } });
        revalidatePath('/dashboard/admin/academic-calendar');
        return { success: true };
    } catch (error) {
        console.error('Error deleting feature flag:', error);
        return { success: false, error: 'Failed to delete feature flag' };
    }
}

export async function checkFeatureFlag(key: string, userRole?: string) {
    try {
        const flag = await prisma.featureFlag.findUnique({ where: { key } });

        if (!flag) return false; // Default to false if flag doesn't exist
        if (!flag.isEnabled) return false;

        // Check dates if set
        const now = new Date();
        if (flag.startDate && now < flag.startDate) return false;
        if (flag.endDate && now > flag.endDate) return false;

        // Check roles if restricted and role is provided
        if (userRole && flag.targetRoles.length > 0) {
            const normalizedUserRole = userRole.toLowerCase();
            const normalizedTargetRoles = flag.targetRoles.map(r => r.toLowerCase());

            if (!normalizedTargetRoles.includes(normalizedUserRole)) return false;
        }

        return true;
    } catch (error) {
        console.error('Error checking feature flag:', error);
        return false; // Fail safe
    }
}
