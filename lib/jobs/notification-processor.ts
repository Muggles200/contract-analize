import { Job } from 'bull';
import { prisma } from '../db';
import { NotificationJobData, JOB_TYPES } from '../job-queue';

export async function processNotificationJob(job: Job<NotificationJobData>) {
  const { userId, type, title, message, data, priority } = job.data;

  try {
    console.log(`Processing notification job ${job.id} for user ${userId}`);

    // Check user notification preferences
    const userNotificationSettings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    if (userNotificationSettings) {
      // Check if this type of notification is allowed
      const isAllowed = checkNotificationPermission(type, userNotificationSettings);
      if (!isAllowed) {
        console.log(`Notification ${type} blocked by user preferences for user ${userId}`);
        return { success: true, blocked: true, reason: 'user_preferences' };
      }
    }

    // Process notification based on type
    let result;
    switch (type) {
      case 'push':
        result = await processPushNotification(job);
        break;
      case 'browser':
        result = await processBrowserNotification(job);
        break;
      case 'in-app':
        result = await processInAppNotification(job);
        break;
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }

    // Log successful notification
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'notification_sent',
        description: `Notification sent: ${type}`,
        metadata: {
          type,
          title,
          message,
          priority,
          success: true,
        },
      },
    });

    console.log(`Notification job ${job.id} completed successfully`);
    return { success: true, result };

  } catch (error) {
    console.error(`Error processing notification job ${job.id}:`, error);

    // Log failed notification
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'notification_failed',
        description: `Notification failed: ${type}`,
        metadata: {
          type,
          title,
          message,
          priority,
          error: (error as any).message,
        },
      },
    });

    throw error;
  }
}

// Check if notification is allowed based on user preferences
function checkNotificationPermission(type: string, settings: any): boolean {
  switch (type) {
    case 'push':
      return settings.push ?? false;
    case 'browser':
      return settings.browser ?? false;
    case 'in-app':
      return settings.email ?? true; // In-app notifications are usually allowed
    default:
      return true;
  }
}

// Process push notification
async function processPushNotification(job: Job<NotificationJobData>) {
  const { userId, title, message, data } = job.data;

  try {
    // Get user's push tokens
    const pushTokens = await prisma.pushToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });

    if (!pushTokens || pushTokens.length === 0) {
      console.log(`No push tokens found for user ${userId}`);
      return { success: false, reason: 'no_push_tokens' };
    }

    // In a real implementation, you would send to a push notification service
    // like Firebase Cloud Messaging, OneSignal, or similar
    console.log(`Sending push notification to ${pushTokens.length} devices for user ${userId}`);
    
    // Simulate push notification sending
    const results = await Promise.all(
      pushTokens.map(async (pt) => {
        // Simulate API call to push service
        await new Promise(resolve => setTimeout(resolve, 100));
        return { token: pt.token, success: true };
      })
    );

    return {
      success: true,
      sentTo: results.length,
      results,
    };

  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

// Process browser notification
async function processBrowserNotification(job: Job<NotificationJobData>) {
  const { userId, title, message, data } = job.data;

  try {
    // Get user's browser notification settings
    const browserSettings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
      select: { browser: true, soundEnabled: true, vibrationEnabled: true },
    });

    if (!browserSettings?.browser) {
      console.log(`Browser notifications disabled for user ${userId}`);
      return { success: false, reason: 'browser_notifications_disabled' };
    }

    // In a real implementation, you would store this for the next time the user
    // visits the website, or use a service like OneSignal for web push notifications
    console.log(`Browser notification queued for user ${userId}: ${title}`);

    // Store notification for web delivery
    await prisma.notification.create({
      data: {
        userId,
        type: 'browser',
        title,
        message,
        data: data || {},
        status: 'pending',
        scheduledFor: new Date(),
      },
    });

    return {
      success: true,
      queued: true,
    };

  } catch (error) {
    console.error('Error processing browser notification:', error);
    throw error;
  }
}

// Process in-app notification
async function processInAppNotification(job: Job<NotificationJobData>) {
  const { userId, title, message, data } = job.data;

  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'in-app',
        title,
        message,
        data: data || {},
        status: 'unread',
        createdAt: new Date(),
      },
    });

    return {
      success: true,
      notificationId: notification.id,
    };

  } catch (error) {
    console.error('Error creating in-app notification:', error);
    throw error;
  }
}

// Specific notification job processors
export async function processAnalysisCompleteNotification(job: Job<NotificationJobData>) {
  const { userId, data } = job.data;

  try {
    // Get user notification preferences
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    if (!settings?.analysisComplete) {
      return { success: true, blocked: true, reason: 'user_preferences' };
    }

    // Send notification
    await processNotificationJob(job);

    return { success: true };

  } catch (error) {
    console.error('Error sending analysis complete notification:', error);
    throw error;
  }
}

export async function processNewFeatureNotification(job: Job<NotificationJobData>) {
  const { userId, data } = job.data;

  try {
    // Get user notification preferences
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    if (!settings?.newFeatures) {
      return { success: true, blocked: true, reason: 'user_preferences' };
    }

    // Send notification
    await processNotificationJob(job);

    return { success: true };

  } catch (error) {
    console.error('Error sending new feature notification:', error);
    throw error;
  }
}

export async function processSecurityAlertNotification(job: Job<NotificationJobData>) {
  const { userId, data } = job.data;

  try {
    // Security alerts are always sent regardless of preferences
    await processNotificationJob(job);

    return { success: true };

  } catch (error) {
    console.error('Error sending security alert notification:', error);
    throw error;
  }
}

export async function processBillingUpdateNotification(job: Job<NotificationJobData>) {
  const { userId, data } = job.data;

  try {
    // Get user notification preferences
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    if (!settings?.billingUpdates) {
      return { success: true, blocked: true, reason: 'user_preferences' };
    }

    // Send notification
    await processNotificationJob(job);

    return { success: true };

  } catch (error) {
    console.error('Error sending billing update notification:', error);
    throw error;
  }
}

// Export job processor functions
export const notificationProcessors = {
  [JOB_TYPES.SEND_PUSH_NOTIFICATION]: processPushNotification,
  [JOB_TYPES.SEND_BROWSER_NOTIFICATION]: processBrowserNotification,
  [JOB_TYPES.SEND_IN_APP_NOTIFICATION]: processInAppNotification,
}; 