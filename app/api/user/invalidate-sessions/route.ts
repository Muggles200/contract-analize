import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for session invalidation request
const invalidateSessionsSchema = z.object({
  reason: z.enum(['password_change', 'security_alert', 'user_request', 'admin_action']).optional(),
  keepCurrentSession: z.boolean().default(false),
});

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
    
    // Validate the request body
    const validatedData = invalidateSessionsSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Invalidate all user sessions by deleting them from the Session table
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Log session invalidation
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'sessions_invalidated',
        description: `All sessions invalidated - ${validatedData.reason || 'user_request'}`,
        metadata: {
          reason: validatedData.reason || 'user_request',
          keepCurrentSession: validatedData.keepCurrentSession,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'sessions_invalidated',
        eventData: {
          reason: validatedData.reason || 'user_request',
          keepCurrentSession: validatedData.keepCurrentSession,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: 'All sessions have been invalidated successfully',
      requiresReauth: true,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error invalidating sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get recent session activities
    const sessionActivities = await prisma.userActivity.findMany({
      where: {
        userId: user.id,
        activityType: { in: ['sessions_invalidated', 'login', 'logout'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Check if user has any active sessions
    const activeSessions = await prisma.session.findMany({
      where: { userId: user.id },
      take: 1,
    });

    return NextResponse.json({
      sessionActivities,
      currentSessionValid: activeSessions.length > 0,
    });

  } catch (error) {
    console.error('Error fetching session information:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 