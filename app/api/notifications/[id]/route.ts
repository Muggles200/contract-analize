import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'read' or 'dismiss'

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let result;

    if (action === 'read') {
      // Try to mark as read in both tables
      const [inAppResult, historyResult] = await Promise.allSettled([
        prisma.notification.updateMany({
          where: {
            id,
            userId: user.id,
            status: 'unread',
          },
          data: {
            status: 'read',
            readAt: new Date(),
          },
        }),
        prisma.notificationHistory.updateMany({
          where: {
            id,
            userId: user.id,
            readAt: null,
          },
          data: {
            readAt: new Date(),
          },
        }),
      ]);

      const inAppUpdated = inAppResult.status === 'fulfilled' && inAppResult.value.count > 0;
      const historyUpdated = historyResult.status === 'fulfilled' && historyResult.value.count > 0;

      if (!inAppUpdated && !historyUpdated) {
        return NextResponse.json(
          { error: 'Notification not found or already read' },
          { status: 404 }
        );
      }

      result = { action: 'read', success: true };

    } else if (action === 'dismiss') {
      // Try to dismiss in both tables
      const [inAppResult, historyResult] = await Promise.allSettled([
        prisma.notification.updateMany({
          where: {
            id,
            userId: user.id,
          },
          data: {
            status: 'dismissed',
          },
        }),
        prisma.notificationHistory.updateMany({
          where: {
            id,
            userId: user.id,
          },
          data: {
            status: 'dismissed',
          },
        }),
      ]);

      const inAppUpdated = inAppResult.status === 'fulfilled' && inAppResult.value.count > 0;
      const historyUpdated = historyResult.status === 'fulfilled' && historyResult.value.count > 0;

      if (!inAppUpdated && !historyUpdated) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      result = { action: 'dismiss', success: true };

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "read" or "dismiss"' },
        { status: 400 }
      );
    }

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: `notification_${action}`,
        description: `Notification ${action}: ${id}`,
        metadata: {
          notificationId: id,
          action,
        },
      },
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Try to delete from both tables
    const [inAppResult, historyResult] = await Promise.allSettled([
      prisma.notification.deleteMany({
        where: {
          id,
          userId: user.id,
        },
      }),
      prisma.notificationHistory.deleteMany({
        where: {
          id,
          userId: user.id,
        },
      }),
    ]);

    const inAppDeleted = inAppResult.status === 'fulfilled' && inAppResult.value.count > 0;
    const historyDeleted = historyResult.status === 'fulfilled' && historyResult.value.count > 0;

    if (!inAppDeleted && !historyDeleted) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'notification_deleted',
        description: `Notification deleted: ${id}`,
        metadata: {
          notificationId: id,
        },
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 