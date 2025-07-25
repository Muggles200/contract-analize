import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for notification settings
const notificationSettingsSchema = z.object({
  browser: z.boolean(),
  email: z.boolean(),
  push: z.boolean(),
  analysisComplete: z.boolean(),
  newFeatures: z.boolean(),
  securityAlerts: z.boolean(),
  billingUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: z.string().optional(),
  }).optional(),
  soundEnabled: z.boolean().optional(),
  vibrationEnabled: z.boolean().optional(),
});

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

    // Return default settings if none exist
    if (!user.notificationSettings) {
      const defaultSettings = {
        browser: true,
        email: true,
        push: false,
        analysisComplete: true,
        newFeatures: true,
        securityAlerts: true,
        billingUpdates: true,
        weeklyDigest: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC',
        },
        soundEnabled: true,
        vibrationEnabled: true,
      };

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json({
      browser: user.notificationSettings.browser,
      email: user.notificationSettings.email,
      push: user.notificationSettings.push,
      analysisComplete: user.notificationSettings.analysisComplete,
      newFeatures: user.notificationSettings.newFeatures,
      securityAlerts: user.notificationSettings.securityAlerts,
      billingUpdates: user.notificationSettings.billingUpdates,
      weeklyDigest: user.notificationSettings.weeklyDigest,
      quietHours: user.notificationSettings.quietHours || {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC',
      },
      soundEnabled: user.notificationSettings.soundEnabled ?? true,
      vibrationEnabled: user.notificationSettings.vibrationEnabled ?? true,
    });

  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const validatedData = notificationSettingsSchema.parse(body);

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

    // Update or create notification settings
    const notificationSettings = await prisma.userNotificationSettings.upsert({
      where: { userId: user.id },
      update: {
        browser: validatedData.browser,
        email: validatedData.email,
        push: validatedData.push,
        analysisComplete: validatedData.analysisComplete,
        newFeatures: validatedData.newFeatures,
        securityAlerts: validatedData.securityAlerts,
        billingUpdates: validatedData.billingUpdates,
        weeklyDigest: validatedData.weeklyDigest,
        quietHours: validatedData.quietHours || {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC',
        },
        soundEnabled: validatedData.soundEnabled ?? true,
        vibrationEnabled: validatedData.vibrationEnabled ?? true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        browser: validatedData.browser,
        email: validatedData.email,
        push: validatedData.push,
        analysisComplete: validatedData.analysisComplete,
        newFeatures: validatedData.newFeatures,
        securityAlerts: validatedData.securityAlerts,
        billingUpdates: validatedData.billingUpdates,
        weeklyDigest: validatedData.weeklyDigest,
        quietHours: validatedData.quietHours || {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC',
        },
        soundEnabled: validatedData.soundEnabled ?? true,
        vibrationEnabled: validatedData.vibrationEnabled ?? true,
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'notification_settings_updated',
        description: 'User updated notification settings',
        metadata: {
          browser: validatedData.browser,
          email: validatedData.email,
          push: validatedData.push,
          analysisComplete: validatedData.analysisComplete,
          newFeatures: validatedData.newFeatures,
          securityAlerts: validatedData.securityAlerts,
          billingUpdates: validatedData.billingUpdates,
          weeklyDigest: validatedData.weeklyDigest,
        },
      },
    });

    return NextResponse.json({
      message: 'Notification settings updated successfully',
      settings: {
        browser: notificationSettings.browser,
        email: notificationSettings.email,
        push: notificationSettings.push,
        analysisComplete: notificationSettings.analysisComplete,
        newFeatures: notificationSettings.newFeatures,
        securityAlerts: notificationSettings.securityAlerts,
        billingUpdates: notificationSettings.billingUpdates,
        weeklyDigest: notificationSettings.weeklyDigest,
        quietHours: notificationSettings.quietHours,
        soundEnabled: notificationSettings.soundEnabled,
        vibrationEnabled: notificationSettings.vibrationEnabled,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 