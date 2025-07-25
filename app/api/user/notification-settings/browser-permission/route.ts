import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for browser permission request
const browserPermissionSchema = z.object({
  permission: z.enum(['granted', 'denied', 'default']),
  userAgent: z.string().optional(),
  timestamp: z.string().datetime().optional(),
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
    const validatedData = browserPermissionSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { notificationSettings: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update notification settings with browser permission
    const notificationSettings = await prisma.userNotificationSettings.upsert({
      where: { userId: user.id },
      update: {
        browser: validatedData.permission === 'granted',
        browserPermission: validatedData.permission,
        browserPermissionUpdatedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        browser: validatedData.permission === 'granted',
        browserPermission: validatedData.permission,
        browserPermissionUpdatedAt: new Date(),
        email: true,
        push: false,
        analysisComplete: true,
        newFeatures: true,
        securityAlerts: true,
        billingUpdates: true,
        weeklyDigest: false,
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'browser_permission_updated',
        description: `Browser notification permission ${validatedData.permission}`,
        metadata: {
          permission: validatedData.permission,
          userAgent: validatedData.userAgent,
          timestamp: validatedData.timestamp,
        },
      },
    });

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'browser_permission_changed',
        eventData: {
          permission: validatedData.permission,
          userAgent: validatedData.userAgent,
        },
      },
    });

    return NextResponse.json({
      message: 'Browser permission updated successfully',
      permission: validatedData.permission,
      browserEnabled: notificationSettings.browser,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating browser permission:', error);
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
      include: { notificationSettings: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return current browser permission status
    const browserPermission = user.notificationSettings?.browserPermission || 'default';
    const browserEnabled = user.notificationSettings?.browser || false;
    const lastUpdated = user.notificationSettings?.browserPermissionUpdatedAt;

    return NextResponse.json({
      permission: browserPermission,
      browserEnabled,
      lastUpdated,
      canRequest: browserPermission === 'default',
    });

  } catch (error) {
    console.error('Error fetching browser permission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 