import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ batchId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as any).email?.includes('admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { batchId } = await params;

        const batch = await prisma.bulkEnrollmentBatch.findUnique({
            where: { batch_id: batchId },
            include: {
                records: {
                    orderBy: { created_at: 'asc' }
                }
            }
        });

        if (!batch) {
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        }

        return NextResponse.json(batch);
    } catch (error) {
        console.error('Failed to fetch batch details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch batch details' },
            { status: 500 }
        );
    }
}
