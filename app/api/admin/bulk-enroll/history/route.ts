import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

/**
 * @swagger
 * /api/admin/bulk-enroll/history:
 *   get:
 *     summary: Get bulk enrollment history
 *     description: Returns a paginated list of bulk enrollment batches.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched history
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as any).email?.includes('admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.filename = { contains: search, mode: 'insensitive' };
        }

        const [batches, total] = await Promise.all([
            prisma.bulkEnrollmentBatch.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    _count: {
                        select: { records: true }
                    }
                }
            }),
            prisma.bulkEnrollmentBatch.count({ where })
        ]);

        return NextResponse.json({
            batches,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Failed to fetch enrollment history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch enrollment history' },
            { status: 500 }
        );
    }
}
