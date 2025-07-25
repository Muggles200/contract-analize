import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { NotificationService } from '@/lib/notification-service';

// Validation schema for account deletion request
const accountDeletionSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().min(1, 'Confirmation is required'),
  reason: z.string().optional(),
  exportData: z.boolean().default(true),
});

// Grace period for account recovery (30 days)
const GRACE_PERIOD_DAYS = 30;

// Export user data before deletion
async function exportUserData(userId: string): Promise<any> {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        contracts: {
          include: {
            analysisResults: true,
          },
        },
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
        userActivities: {
          orderBy: { createdAt: 'desc' },
          take: 1000,
        },
        analyticsEvents: {
          orderBy: { timestamp: 'desc' },
          take: 1000,
        },
        notificationSettings: true,
        emailPreferences: true,

        pushTokens: true,
        scheduledReports: true,
        reportHistory: true,
      },
    });

    if (!userData) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    const exportData = {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      contracts: userData.contracts.map((contract: any) => ({
        id: contract.id,
        fileName: contract.fileName,
        contractType: contract.contractType,
        status: contract.status,
        createdAt: contract.createdAt,
        analysisResults: contract.analysisResults.map((result: any) => ({
          id: result.id,
          status: result.status,
          createdAt: result.createdAt,
          completedAt: result.completedAt,
        })),
      })),
      organizations: userData.organizationMemberships.map((membership: any) => ({
        organizationId: membership.organizationId,
        role: membership.role,
        joinedAt: membership.createdAt,
        organization: {
          name: membership.organization.name,
          description: membership.organization.description,
        },
      })),
      activity: userData.userActivities.map((activity: any) => ({
        id: activity.id,
        activityType: activity.activityType,
        description: activity.description,
        createdAt: activity.createdAt,
        metadata: activity.metadata,
      })),
      analytics: userData.analyticsEvents.map((event: any) => ({
        id: event.id,
        eventType: event.eventType,
        timestamp: event.timestamp,
        eventData: event.eventData,
      })),
      settings: {
        notifications: userData.notificationSettings,
        email: userData.emailPreferences,
      },
      reports: {
        scheduled: userData.scheduledReports.map((report: any) => ({
          id: report.id,
          name: report.name,
          frequency: report.frequency,
          createdAt: report.createdAt,
        })),
        history: userData.reportHistory.map(report => ({
          id: report.id,
          reportName: report.reportName,
          template: report.template,
          status: report.status,
          createdAt: report.createdAt,
        })),
      },
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

// Handle organization membership removal
async function handleOrganizationMemberships(userId: string): Promise<void> {
  try {
    // Get user's organization memberships
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true },
    });

    for (const membership of memberships) {
      // If user is the only owner, transfer ownership or delete organization
      if (membership.role === 'owner') {
        const otherMembers = await prisma.organizationMember.findMany({
          where: {
            organizationId: membership.organizationId,
            userId: { not: userId },
          },
        });

        if (otherMembers.length === 0) {
          // No other members, delete the organization
          await prisma.organization.delete({
            where: { id: membership.organizationId },
          });
        } else {
          // Transfer ownership to the first admin or member
          const newOwner = otherMembers.find(m => m.role === 'admin') || otherMembers[0];
                      await prisma.organizationMember.update({
            where: { id: newOwner.id },
            data: { role: 'owner' },
          });
        }
      }

      // Remove user from organization
              await prisma.organizationMember.delete({
        where: { id: membership.id },
      });
    }
  } catch (error) {
    console.error('Error handling organization memberships:', error);
    throw error;
  }
}

// Cancel user subscriptions
async function cancelUserSubscriptions(userId: string): Promise<void> {
  try {
    // Get user's active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
    });

    for (const subscription of subscriptions) {
      // Cancel subscription in Stripe (if applicable)
      if (subscription.stripeSubscriptionId) {
        try {
          // Note: In a real implementation, you would call Stripe API here
          console.log(`Would cancel Stripe subscription: ${subscription.stripeSubscriptionId}`);
        } catch (error) {
          console.error('Error canceling Stripe subscription:', error);
        }
      }

      // Update subscription status
              await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'canceled',
        },
      });
    }
  } catch (error) {
    console.error('Error canceling user subscriptions:', error);
    throw error;
  }
}

// Schedule account for deletion with grace period
async function scheduleAccountDeletion(userId: string, exportData: any, reason?: string): Promise<void> {
  try {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + GRACE_PERIOD_DAYS);

    await prisma.accountDeletion.create({
      data: {
        userId,
        scheduledFor: deletionDate,
        reason: reason || 'User requested deletion',
        status: 'scheduled',
      },
    });
  } catch (error) {
    console.error('Error scheduling account deletion:', error);
    throw error;
  }
}

// Send deletion confirmation email
async function sendDeletionConfirmation(userId: string, userEmail: string, exportData: any): Promise<void> {
  try {
    await NotificationService.sendNotification({
      userId,
      type: 'email',
      title: 'Account Deletion Confirmation',
      message: `Your account has been scheduled for deletion. You have ${GRACE_PERIOD_DAYS} days to recover your account if this was a mistake.`,
      category: 'security_alert',
      priority: 'high',
      metadata: {
        deletionDate: new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        gracePeriodDays: GRACE_PERIOD_DAYS,
        exportDataSize: JSON.stringify(exportData).length,
      },
      actionUrl: `${process.env.NEXTAUTH_URL}/auth/recover-account`,
    });
  } catch (error) {
    console.error('Error sending deletion confirmation:', error);
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

    const body = await request.json();
    
    // Validate the request body
    const validatedData = accountDeletionSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Account does not have a password set. Please use a different authentication method.' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      );
    }

    // Verify confirmation
    if (validatedData.confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE to confirm account deletion' },
        { status: 400 }
      );
    }

    // Export user data if requested
    let exportData = null;
    if (validatedData.exportData) {
      try {
        exportData = await exportUserData(user.id);
      } catch (error) {
        console.error('Error exporting user data:', error);
        // Continue with deletion even if export fails
      }
    }

    // Handle organization memberships
    await handleOrganizationMemberships(user.id);

    // Cancel user subscriptions
    await cancelUserSubscriptions(user.id);

    // Schedule account for deletion with grace period
    await scheduleAccountDeletion(user.id, exportData, validatedData.reason);

    // Send deletion confirmation email
    await sendDeletionConfirmation(user.id, user.email, exportData);

    // Log the account deletion activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'account_deletion_scheduled',
        description: 'Account scheduled for deletion',
        metadata: {
          reason: validatedData.reason,
          gracePeriodDays: GRACE_PERIOD_DAYS,
          exportData: !!exportData,
          scheduledFor: new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    });

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'account_deletion_scheduled',
        eventData: {
          reason: validatedData.reason,
          gracePeriodDays: GRACE_PERIOD_DAYS,
          exportData: !!exportData,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: `Account scheduled for deletion. You have ${GRACE_PERIOD_DAYS} days to recover your account if this was a mistake.`,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      deletionDate: new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      exportData: !!exportData,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error scheduling account deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get account deletion status
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

    // Check if account is scheduled for deletion
    const accountDeletion = await prisma.accountDeletion.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!accountDeletion) {
      return NextResponse.json({
        isScheduledForDeletion: false,
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
    });

  } catch (error) {
    console.error('Error getting account deletion status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 