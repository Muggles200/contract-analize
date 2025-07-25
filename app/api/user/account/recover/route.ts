import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { NotificationService } from '@/lib/notification-service';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// Validation schema for account recovery request
const accountRecoverySchema = z.object({
  email: z.string().email('Valid email is required'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = accountRecoverySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        accountDeletion: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if account is scheduled for deletion
    const accountDeletion = user.accountDeletion;
    if (!accountDeletion) {
      return NextResponse.json(
        { error: 'Account is not scheduled for deletion' },
        { status: 400 }
      );
    }

    // Check if grace period has expired
    const now = new Date();
    const deletionDate = new Date(accountDeletion.scheduledFor);
    const daysRemaining = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return NextResponse.json(
        { error: 'Grace period has expired. Account recovery is no longer possible.' },
        { status: 400 }
      );
    }

    if (accountDeletion.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Account is not in a recoverable state' },
        { status: 400 }
      );
    }

    // Cancel the account deletion
    await prisma.accountDeletion.update({
      where: { id: accountDeletion.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledReason: validatedData.reason || 'User requested recovery',
      },
    });

    // Send recovery confirmation email
    await NotificationService.sendNotification({
      userId: user.id,
      type: 'email',
      title: 'Account Recovery Successful',
      message: 'Your account has been successfully recovered. You can now log in and access your account normally.',
      category: 'security_alert',
      priority: 'high',
      metadata: {
        recoveryDate: new Date().toISOString(),
        reason: validatedData.reason,
        daysRemaining: daysRemaining,
      },
      actionUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
    });

    // Log the account recovery activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'account_recovered',
        description: 'Account recovery successful',
        metadata: {
          reason: validatedData.reason,
          daysRemaining: daysRemaining,
          recoveryDate: new Date().toISOString(),
        },
      },
    });

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'account_recovered',
        eventData: {
          reason: validatedData.reason,
          daysRemaining: daysRemaining,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: 'Account recovered successfully. You can now log in to your account.',
      daysRemaining: daysRemaining,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error recovering account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get account recovery status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accountDeletion: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const accountDeletion = user.accountDeletion;
    if (!accountDeletion) {
      return NextResponse.json({
        isScheduledForDeletion: false,
        canRecover: false,
      });
    }

    const now = new Date();
    const deletionDate = new Date(accountDeletion.scheduledFor);
    const daysRemaining = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      isScheduledForDeletion: true,
      deletionDate: accountDeletion.scheduledFor,
      daysRemaining: Math.max(0, daysRemaining),
      reason: accountDeletion.reason,
      status: accountDeletion.status,
      canRecover: daysRemaining > 0 && accountDeletion.status === 'scheduled',
      userEmail: user.email,
    });

  } catch (error) {
    console.error('Error getting account recovery status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 