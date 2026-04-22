import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * @swagger
 * /api/admin/programs:
 *   get:
 *     summary: Get active programs
 *     description: Returns a list of all active degree programs.
 *     responses:
 *       200:
 *         description: Successfully fetched programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   program_id:
 *                     type: string
 *                   code:
 *                     type: string
 *                   name:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
    try {
        const programs = await prisma.degreeProgram.findMany({
            where: { active: true },
            select: {
                program_id: true,
                code: true,
                name: true,
            },
            orderBy: { code: 'asc' }
        });

        return NextResponse.json(programs);
    } catch (error) {
        console.error('Failed to fetch programs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch programs' },
            { status: 500 }
        );
    }
}
