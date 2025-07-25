import { prisma } from './db';
import { NotificationService } from './notification-service';

export interface CreateNotificationOptions {
  userId: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  category?: 'analysis_complete' | 'new_features' | 'security_alert' | 'billing_update' | 'weekly_digest' | 'general';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  actionUrl?: string;
  imageUrl?: string;
  sendEmail?: boolean;
  sendBrowser?: boolean;
  sendPush?: boolean;
}

/**
 * Create a notification and optionally send it through various channels
 */
export async function createNotification(options: CreateNotificationOptions) {
  const {
    userId,
    type,
    title,
    message,
    category = 'general',
    priority = 'normal',
    metadata = {},
    actionUrl,
    imageUrl,
    sendEmail = false,
    sendBrowser = false,
    sendPush = false,
  } = options;

  try {
    // Create in-app notification
    const inAppNotification = await prisma.notification.create({
      data: {
        userId,
        type: mapUITypeToDBType(type),
        title,
        message,
        data: {
          category,
          priority,
          actionUrl,
          imageUrl,
          ...metadata,
        },
        status: 'unread',
      },
    });

    // Send through notification channels if requested
    const notificationPromises = [];

    if (sendEmail) {
      const emailData = {
        userId,
        type: 'email' as const,
        title,
        message,
        category,
        priority,
        metadata: {
          ...metadata,
          actionUrl,
          imageUrl,
        },
        actionUrl,
        imageUrl,
      };
      notificationPromises.push(NotificationService.sendNotification(emailData));
    }

    if (sendBrowser) {
      const browserData = {
        userId,
        type: 'browser' as const,
        title,
        message,
        category,
        priority,
        metadata: {
          ...metadata,
          actionUrl,
          imageUrl,
        },
        actionUrl,
        imageUrl,
      };
      notificationPromises.push(NotificationService.sendNotification(browserData));
    }

    if (sendPush) {
      const pushData = {
        userId,
        type: 'push' as const,
        title,
        message,
        category,
        priority,
        metadata: {
          ...metadata,
          actionUrl,
          imageUrl,
        },
        actionUrl,
        imageUrl,
      };
      notificationPromises.push(NotificationService.sendNotification(pushData));
    }

    // Wait for all notifications to be sent
    if (notificationPromises.length > 0) {
      await Promise.allSettled(notificationPromises);
    }

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'notification_created',
        description: `Notification created: ${title}`,
        metadata: {
          notificationId: inAppNotification.id,
          type,
          category,
          priority,
        },
      },
    });

    return inAppNotification;

  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create an analysis complete notification
 */
export async function createAnalysisCompleteNotification(
  userId: string,
  contractId: string,
  contractName: string,
  analysisId: string,
  results: any
) {
  const highRiskCount = results.highRiskCount || 0;
  const criticalRiskCount = results.criticalRiskCount || 0;
  
  let type: 'success' | 'warning' | 'error' = 'success';
  let message = `Analysis completed for "${contractName}". `;
  
  if (criticalRiskCount > 0) {
    type = 'error';
    message += `Found ${criticalRiskCount} critical risks that require immediate attention.`;
  } else if (highRiskCount > 0) {
    type = 'warning';
    message += `Found ${highRiskCount} high-risk items to review.`;
  } else {
    message += 'No significant risks detected.';
  }

  return createNotification({
    userId,
    type,
    title: 'Analysis Complete',
    message,
    category: 'analysis_complete',
    priority: criticalRiskCount > 0 ? 'high' : 'normal',
    metadata: {
      contractId,
      contractName,
      analysisId,
      highRiskCount,
      criticalRiskCount,
      totalRisks: highRiskCount + criticalRiskCount,
    },
    actionUrl: `/dashboard/analysis/${analysisId}`,
    sendEmail: true,
    sendBrowser: true,
  });
}

/**
 * Create a storage warning notification
 */
export async function createStorageWarningNotification(
  userId: string,
  currentUsage: number,
  limit: number,
  percentage: number
) {
  return createNotification({
    userId,
    type: 'warning',
    title: 'Storage Warning',
    message: `You're using ${percentage}% of your storage (${currentUsage}MB / ${limit}MB). Consider upgrading your plan for more space.`,
    category: 'billing_update',
    priority: 'normal',
    metadata: {
      currentUsage,
      limit,
      percentage,
    },
    actionUrl: '/dashboard/billing',
    sendEmail: true,
    sendBrowser: true,
  });
}

/**
 * Create a new feature notification
 */
export async function createNewFeatureNotification(
  userId: string,
  featureName: string,
  description: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: 'info',
    title: 'New Feature Available',
    message: `${featureName}: ${description}`,
    category: 'new_features',
    priority: 'low',
    metadata: {
      featureName,
    },
    actionUrl,
    sendEmail: false,
    sendBrowser: true,
  });
}

/**
 * Create a security alert notification
 */
export async function createSecurityAlertNotification(
  userId: string,
  alertType: string,
  description: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: 'error',
    title: 'Security Alert',
    message: description,
    category: 'security_alert',
    priority: 'high',
    metadata: {
      alertType,
    },
    actionUrl,
    sendEmail: true,
    sendBrowser: true,
    sendPush: true,
  });
}

/**
 * Create a billing update notification
 */
export async function createBillingUpdateNotification(
  userId: string,
  updateType: string,
  message: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: 'info',
    title: 'Billing Update',
    message,
    category: 'billing_update',
    priority: 'normal',
    metadata: {
      updateType,
    },
    actionUrl,
    sendEmail: true,
    sendBrowser: true,
  });
}

/**
 * Get notification statistics for a user
 */
export async function getNotificationStats(userId: string) {
  const [totalNotifications, unreadNotifications, notificationTypes] = await Promise.all([
    prisma.notification.count({
      where: { userId },
    }),
    prisma.notification.count({
      where: { userId, status: 'unread' },
    }),
    prisma.notification.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
    }),
  ]);

  return {
    total: totalNotifications,
    unread: unreadNotifications,
    read: totalNotifications - unreadNotifications,
    types: notificationTypes.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  const [inAppResult, historyResult] = await Promise.all([
    prisma.notification.updateMany({
      where: { userId, status: 'unread' },
      data: { status: 'read', readAt: new Date() },
    }),
    prisma.notificationHistory.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    }),
  ]);

  return {
    inAppUpdated: inAppResult.count,
    historyUpdated: historyResult.count,
  };
}

/**
 * Delete old notifications (cleanup utility)
 */
export async function cleanupOldNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const [inAppResult, historyResult] = await Promise.all([
    prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['read', 'dismissed'] },
      },
    }),
    prisma.notificationHistory.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['sent', 'delivered'] },
      },
    }),
  ]);

  return {
    inAppDeleted: inAppResult.count,
    historyDeleted: historyResult.count,
  };
}

// Helper function to map UI notification types to database types
function mapUITypeToDBType(uiType: 'success' | 'warning' | 'info' | 'error'): string {
  switch (uiType) {
    case 'success':
      return 'analysis_complete';
    case 'warning':
      return 'storage_warning';
    case 'error':
      return 'security_alert';
    case 'info':
    default:
      return 'general';
  }
} 