import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

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

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (unreadOnly) {
      where.status = 'unread';
    }

    // Fetch notifications from both tables
    const [inAppNotifications, historyNotifications] = await Promise.all([
      // In-app notifications
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      // Notification history (for browser/push notifications)
      prisma.notificationHistory.findMany({
        where: {
          userId: user.id,
          type: { in: ['browser', 'push'] },
          ...(unreadOnly ? { readAt: null } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    // Combine and format notifications
    const notifications = [
      ...inAppNotifications.map(notification => ({
        id: notification.id,
        type: mapNotificationType(notification.type),
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt,
        read: notification.status === 'read',
        data: notification.data,
        source: 'in-app' as const,
      })),
      ...historyNotifications.map(notification => ({
        id: notification.id,
        type: mapNotificationType(notification.type),
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt,
        read: notification.readAt !== null,
        data: notification.metadata,
        source: notification.type as 'browser' | 'push',
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Get unread count
    const unreadCount = await Promise.all([
      prisma.notification.count({
        where: { userId: user.id, status: 'unread' },
      }),
      prisma.notificationHistory.count({
        where: { 
          userId: user.id, 
          type: { in: ['browser', 'push'] },
          readAt: null,
        },
      }),
    ]);

    const totalUnread = unreadCount[0] + unreadCount[1];

    return NextResponse.json({
      notifications,
      unreadCount: totalUnread,
      hasMore: notifications.length === limit,
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Map database notification types to UI types
function mapNotificationType(dbType: string): 'success' | 'warning' | 'info' | 'error' {
  switch (dbType) {
    case 'success':
    case 'analysis_complete':
      return 'success';
    case 'warning':
    case 'storage_warning':
    case 'billing_update':
      return 'warning';
    case 'error':
    case 'security_alert':
      return 'error';
    case 'info':
    case 'new_features':
    case 'weekly_digest':
    case 'browser':
    case 'push':
    default:
      return 'info';
  }
} 