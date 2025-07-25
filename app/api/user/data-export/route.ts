import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createExportSchema = z.object({
  type: z.enum(['full', 'contracts', 'analyses', 'settings', 'gdpr-portability']),
  dataTypes: z.array(z.string()).min(1),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

// GET - List export requests
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const exportRequests = await prisma.dataExportRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      exportRequests: exportRequests.map(req => ({
        ...req,
        dataTypes: req.dataTypes as string[],
        dateRange: req.dateRange as any,
      })),
    });

  } catch (error) {
    console.error('Error fetching export requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create export request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createExportSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has too many pending requests
    const pendingCount = await prisma.dataExportRequest.count({
      where: {
        userId: user.id,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (pendingCount >= 3) {
      return NextResponse.json(
        { error: 'You have too many pending export requests. Please wait for some to complete.' },
        { status: 429 }
      );
    }

    // Create export request
    const exportRequest = await prisma.dataExportRequest.create({
      data: {
        userId: user.id,
        type: validatedData.type,
        status: 'pending',
        dataTypes: validatedData.dataTypes,
        dateRange: validatedData.dateRange,
        format: validatedData.format,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Log the export request
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'data_export_requested',
        description: `Data export requested: ${validatedData.type}`,
        metadata: {
          exportId: exportRequest.id,
          type: validatedData.type,
          format: validatedData.format,
          dataTypes: validatedData.dataTypes,
        },
      },
    });

    // Queue background job to process the export
    const { dataExportQueue, JOB_TYPES } = await import('@/lib/job-queue');
    
    if (dataExportQueue) {
      await dataExportQueue.add(JOB_TYPES.EXPORT_USER_DATA, {
        exportId: exportRequest.id,
        userId: user.id,
        type: validatedData.type,
        dataTypes: validatedData.dataTypes,
        format: validatedData.format,
        dateRange: validatedData.dateRange,
      }, {
        priority: 1, // High priority for user-initiated exports
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
    }

    return NextResponse.json({
      message: 'Export request created successfully',
      exportRequest: {
        ...exportRequest,
        dataTypes: exportRequest.dataTypes as string[],
        dateRange: exportRequest.dateRange as any,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error creating export request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 