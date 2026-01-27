import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
