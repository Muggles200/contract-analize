import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // email, browser, push
    const status = searchParams.get('status'); // sent, delivered, failed, read
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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
    const where: any = {
      userId: user.id,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get notification history with pagination
    const [notifications, totalCount] = await Promise.all([
      prisma.notificationHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.notificationHistory.count({ where }),
    ]);

    // Get notification statistics
    const notificationStats = await prisma.notificationHistory.groupBy({
      by: ['type', 'status'],
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: {
        type: true,
      },
    });

    // Process statistics
    const stats = {
      total: totalCount,
      last30Days: notificationStats.reduce((acc, stat) => acc + stat._count.type, 0),
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    notificationStats.forEach(stat => {
      stats.byType[stat.type] = (stats.byType[stat.type] || 0) + stat._count.type;
      stats.byStatus[stat.status] = (stats.byStatus[stat.status] || 0) + stat._count.type;
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats,
      filters: {
        type,
        status,
        startDate,
        endDate,
      },
    });

  } catch (error) {
    console.error('Error fetching notification history:', error);
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
    const notificationId = searchParams.get('id');
    const olderThan = searchParams.get('olderThan'); // Delete notifications older than X days

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let deletedCount = 0;

    if (notificationId) {
      // Delete specific notification
      const deleted = await prisma.notificationHistory.deleteMany({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });
      deletedCount = deleted.count;
    } else if (olderThan) {
      // Delete notifications older than specified days
      const cutoffDate = new Date(Date.now() - parseInt(olderThan) * 24 * 60 * 60 * 1000);
      const deleted = await prisma.notificationHistory.deleteMany({
        where: {
          userId: user.id,
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
      deletedCount = deleted.count;
    } else {
      return NextResponse.json(
        { error: 'Notification ID or olderThan parameter is required' },
        { status: 400 }
      );
    }

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'notification_history_cleared',
        description: 'Notification history cleared',
        metadata: {
          notificationId,
          olderThan,
          deletedCount,
        },
      },
    });

    return NextResponse.json({
      message: 'Notification history cleared successfully',
      deletedCount,
    });

  } catch (error) {
    console.error('Error clearing notification history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 