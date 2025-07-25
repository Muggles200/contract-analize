import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for push token request
const pushTokenSchema = z.object({
  token: z.string(),
  deviceType: z.enum(['web', 'ios', 'android']).default('web'),
  deviceId: z.string().optional(),
  userAgent: z.string().optional(),
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
  isActive: z.boolean().default(true),
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
    const validatedData = pushTokenSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if token already exists
    const existingToken = await prisma.pushToken.findFirst({
      where: {
        userId: user.id,
        token: validatedData.token,
      },
    });

    if (existingToken) {
      // Update existing token
      await prisma.pushToken.update({
        where: { id: existingToken.id },
        data: {
          deviceType: validatedData.deviceType,
          deviceId: validatedData.deviceId,
          userAgent: validatedData.userAgent,
          appVersion: validatedData.appVersion,
          osVersion: validatedData.osVersion,
          isActive: validatedData.isActive,
          lastUsed: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new token
      await prisma.pushToken.create({
        data: {
          userId: user.id,
          token: validatedData.token,
          deviceType: validatedData.deviceType,
          deviceId: validatedData.deviceId,
          userAgent: validatedData.userAgent,
          appVersion: validatedData.appVersion,
          osVersion: validatedData.osVersion,
          isActive: validatedData.isActive,
          lastUsed: new Date(),
        },
      });
    }

    // Update notification settings to enable push notifications
    await prisma.userNotificationSettings.upsert({
      where: { userId: user.id },
      update: {
        push: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        push: true,
        browser: true,
        email: true,
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
        activityType: 'push_token_registered',
        description: 'Push notification token registered',
        metadata: {
          deviceType: validatedData.deviceType,
          deviceId: validatedData.deviceId,
          isActive: validatedData.isActive,
        },
      },
    });

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'push_token_registered',
        eventData: {
          deviceType: validatedData.deviceType,
          deviceId: validatedData.deviceId,
          isActive: validatedData.isActive,
        },
      },
    });

    return NextResponse.json({
      message: 'Push token registered successfully',
      deviceType: validatedData.deviceType,
      isActive: validatedData.isActive,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error registering push token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const deviceId = searchParams.get('deviceId');

    if (!token && !deviceId) {
      return NextResponse.json(
        { error: 'Token or device ID is required' },
        { status: 400 }
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

    // Build where clause
    const where: any = { userId: user.id };
    if (token) where.token = token;
    if (deviceId) where.deviceId = deviceId;

    // Delete push token(s)
    const deletedTokens = await prisma.pushToken.deleteMany({
      where,
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'push_token_deleted',
        description: 'Push notification token(s) deleted',
        metadata: {
          token: token,
          deviceId: deviceId,
          deletedCount: deletedTokens.count,
        },
      },
    });

    return NextResponse.json({
      message: 'Push token(s) deleted successfully',
      deletedCount: deletedTokens.count,
    });

  } catch (error) {
    console.error('Error deleting push token:', error);
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

    // Get all push tokens for the user
    const pushTokens = await prisma.pushToken.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        deviceType: true,
        deviceId: true,
        userAgent: true,
        appVersion: true,
        osVersion: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
      },
      orderBy: {
        lastUsed: 'desc',
      },
    });

    return NextResponse.json({
      tokens: pushTokens,
      totalCount: pushTokens.length,
    });

  } catch (error) {
    console.error('Error fetching push tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 