import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// Validation schema for email preferences
const emailPreferencesSchema = z.object({
  marketing: z.boolean(),
  security: z.boolean(),
  analysis: z.boolean(),
  billing: z.boolean(),
  weekly: z.boolean(),
  frequency: z.enum(['immediate', 'daily', 'weekly']),
  timezone: z.string().optional(),
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
      include: { emailPreferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return default preferences if none exist
    if (!user.emailPreferences) {
      const defaultPreferences = {
        marketing: true,
        security: true,
        analysis: true,
        billing: true,
        weekly: false,
        frequency: 'immediate' as const,
        timezone: 'UTC',
      };

      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json({
      marketing: user.emailPreferences.marketing,
      security: user.emailPreferences.security,
      analysis: user.emailPreferences.analysis,
      billing: user.emailPreferences.billing,
      weekly: user.emailPreferences.weekly,
      frequency: user.emailPreferences.frequency,
      timezone: user.emailPreferences.timezone,
    });

  } catch (error) {
    console.error('Error fetching email preferences:', error);
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
    const validatedData = emailPreferencesSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { emailPreferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update or create email preferences
    const emailPreferences = await prisma.userEmailPreferences.upsert({
      where: { userId: user.id },
      update: {
        marketing: validatedData.marketing,
        security: validatedData.security,
        analysis: validatedData.analysis,
        billing: validatedData.billing,
        weekly: validatedData.weekly,
        frequency: validatedData.frequency,
        timezone: validatedData.timezone || 'UTC',
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        marketing: validatedData.marketing,
        security: validatedData.security,
        analysis: validatedData.analysis,
        billing: validatedData.billing,
        weekly: validatedData.weekly,
        frequency: validatedData.frequency,
        timezone: validatedData.timezone || 'UTC',
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'email_preferences_updated',
        description: 'User updated email preferences',
        metadata: {
          marketing: validatedData.marketing,
          security: validatedData.security,
          analysis: validatedData.analysis,
          billing: validatedData.billing,
          weekly: validatedData.weekly,
          frequency: validatedData.frequency,
        },
      },
    });

    return NextResponse.json({
      message: 'Email preferences updated successfully',
      preferences: {
        marketing: emailPreferences.marketing,
        security: emailPreferences.security,
        analysis: emailPreferences.analysis,
        billing: emailPreferences.billing,
        weekly: emailPreferences.weekly,
        frequency: emailPreferences.frequency,
        timezone: emailPreferences.timezone,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 