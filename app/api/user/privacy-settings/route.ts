import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const privacySettingsSchema = z.object({
  dataSharing: z.boolean().optional(),
  analytics: z.boolean().optional(),
  marketing: z.boolean().optional(),
  dataRetention: z.number().min(30).max(3650).optional(), // 30 days to 10 years
  gdprCompliance: z.boolean().optional(),
  dataPortability: z.boolean().optional(),
  rightToBeForgotten: z.boolean().optional(),
  privacyPolicyAccepted: z.boolean().optional(),
  dataProcessingConsent: z.object({
    necessary: z.boolean(),
    analytics: z.boolean(),
    marketing: z.boolean(),
    thirdParty: z.boolean(),
  }).optional(),
});

// GET - Retrieve privacy settings
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
      include: {
        preferences: true,
        emailPreferences: true,
        privacySettings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return privacy settings if they exist, otherwise return defaults
    if (user.privacySettings) {
      return NextResponse.json({
        ...user.privacySettings,
        dataProcessingConsent: user.privacySettings.dataProcessingConsent as any,
      });
    }

    // Return default privacy settings if none exist
    const defaultSettings = {
      dataSharing: false,
      analytics: true,
      marketing: false,
      dataRetention: 365,
      gdprCompliance: true,
      dataPortability: true,
      rightToBeForgotten: true,
      privacyPolicyAccepted: false,
      dataProcessingConsent: {
        necessary: true,
        analytics: false,
        marketing: false,
        thirdParty: false,
      },
    };

    return NextResponse.json(defaultSettings);

  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update privacy settings
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
    const validatedData = privacySettingsSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        preferences: true,
        emailPreferences: true,
        privacySettings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update privacy settings
    const updatedPrivacySettings = await prisma.userPrivacySettings.upsert({
      where: { userId: user.id },
      update: {
        dataSharing: validatedData.dataSharing,
        analytics: validatedData.analytics,
        marketing: validatedData.marketing,
        dataRetention: validatedData.dataRetention,
        gdprCompliance: validatedData.gdprCompliance,
        dataPortability: validatedData.dataPortability,
        rightToBeForgotten: validatedData.rightToBeForgotten,
        privacyPolicyAccepted: validatedData.privacyPolicyAccepted,
        privacyPolicyAcceptedAt: validatedData.privacyPolicyAccepted ? new Date() : null,
        dataProcessingConsent: validatedData.dataProcessingConsent,
      },
      create: {
        userId: user.id,
        dataSharing: validatedData.dataSharing ?? false,
        analytics: validatedData.analytics ?? true,
        marketing: validatedData.marketing ?? false,
        dataRetention: validatedData.dataRetention ?? 365,
        gdprCompliance: validatedData.gdprCompliance ?? true,
        dataPortability: validatedData.dataPortability ?? true,
        rightToBeForgotten: validatedData.rightToBeForgotten ?? true,
        privacyPolicyAccepted: validatedData.privacyPolicyAccepted ?? false,
        privacyPolicyAcceptedAt: validatedData.privacyPolicyAccepted ? new Date() : null,
        dataProcessingConsent: validatedData.dataProcessingConsent ?? {
          necessary: true,
          analytics: false,
          marketing: false,
          thirdParty: false,
        },
      },
    });

    // Update email preferences based on privacy settings
    if (validatedData.marketing !== undefined) {
      await prisma.userEmailPreferences.upsert({
        where: { userId: user.id },
        update: {
          marketing: validatedData.marketing,
        },
        create: {
          userId: user.id,
          marketing: validatedData.marketing,
        },
      });
    }

    // Log privacy settings update
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'privacy_settings_updated',
        description: 'Privacy settings updated',
        metadata: { changes: validatedData },
      },
    });

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
      settings: updatedPrivacySettings,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 