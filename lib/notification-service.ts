import { prisma } from './db';
import { sendEmailWithTemplate } from './email-service';

export interface NotificationData {
  userId: string;
  type: 'email' | 'browser' | 'push';
  title: string;
  message: string;
  category: 'analysis_complete' | 'new_features' | 'security_alert' | 'billing_update' | 'weekly_digest' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  actionUrl?: string;
  imageUrl?: string;
}

export interface NotificationPreferences {
  browser: boolean;
  email: boolean;
  push: boolean;
  analysisComplete: boolean;
  newFeatures: boolean;
  securityAlerts: boolean;
  billingUpdates: boolean;
  weeklyDigest: boolean;
  quietHours?: any; // JSON field from database
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export class NotificationService {
  /**
   * Send a notification to a user
   */
  static async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      // Get user notification preferences
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { notificationSettings: true },
      });

      if (!user) {
        console.error('User not found for notification:', data.userId);
        return false;
      }

      const preferences = user.notificationSettings;
      if (!preferences) {
        console.log('No notification preferences found for user:', data.userId);
        return false;
      }

      // Check if notification type is enabled
      if (!this.isNotificationTypeEnabled(data.category, preferences)) {
        console.log(`Notification type ${data.category} is disabled for user ${data.userId}`);
        return false;
      }

      // Check quiet hours
      if (this.isInQuietHours(preferences.quietHours)) {
        console.log(`Notification blocked due to quiet hours for user ${data.userId}`);
        return false;
      }

      // Send notification based on type
      const results = await Promise.allSettled([
        this.sendEmailNotification(data, preferences, user.email),
        this.sendBrowserNotification(data, preferences),
        this.sendPushNotification(data, preferences),
      ]);

      // Log notification history
      await this.logNotificationHistory(data, results);

      // Check if at least one notification was sent successfully
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      return successCount > 0;

    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    data: NotificationData,
    preferences: NotificationPreferences,
    userEmail: string
  ): Promise<boolean> {
    if (!preferences.email) {
      return false;
    }

    try {
      // Map notification category to email template
      const templateMap: Record<string, string> = {
        analysis_complete: 'analysis-complete',
        new_features: 'new-features',
        security_alert: 'security-alert',
        billing_update: 'billing-update',
        weekly_digest: 'weekly-digest',
        general: 'general-notification',
      };

      const templateId = templateMap[data.category] || 'general-notification';

      const emailVariables = {
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        imageUrl: data.imageUrl,
        ...data.metadata,
      };

      const success = await sendEmailWithTemplate(
        templateId,
        userEmail,
        emailVariables,
        data.userId
      );

      return success;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send browser notification
   */
  private static async sendBrowserNotification(
    data: NotificationData,
    preferences: NotificationPreferences
  ): Promise<boolean> {
    if (!preferences.browser) {
      return false;
    }

    try {
      // For now, just log browser notifications to history
      await prisma.notificationHistory.create({
        data: {
          userId: data.userId,
          type: 'browser',
          title: data.title,
          message: data.message,
          status: 'sent',
          metadata: {
            category: data.category,
            priority: data.priority,
            actionUrl: data.actionUrl,
            imageUrl: data.imageUrl,
            ...data.metadata,
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating browser notification:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(
    data: NotificationData,
    preferences: NotificationPreferences
  ): Promise<boolean> {
    if (!preferences.push) {
      return false;
    }

    try {
      // Get user's push tokens
      const pushTokens = await prisma.pushToken.findMany({
        where: {
          userId: data.userId,
          isActive: true,
        },
      });

      if (pushTokens.length === 0) {
        return false;
      }

      // For now, just log push notifications to history
      await prisma.notificationHistory.create({
        data: {
          userId: data.userId,
          type: 'push',
          title: data.title,
          message: data.message,
          status: 'sent',
          metadata: {
            category: data.category,
            priority: data.priority,
            actionUrl: data.actionUrl,
            imageUrl: data.imageUrl,
            soundEnabled: preferences.soundEnabled ?? true,
            vibrationEnabled: preferences.vibrationEnabled ?? true,
            pushTokenCount: pushTokens.length,
            ...data.metadata,
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating push notification:', error);
      return false;
    }
  }

  /**
   * Check if notification type is enabled
   */
  private static isNotificationTypeEnabled(
    category: string,
    preferences: NotificationPreferences
  ): boolean {
    const categoryMap: Record<string, keyof NotificationPreferences> = {
      analysis_complete: 'analysisComplete',
      new_features: 'newFeatures',
      security_alert: 'securityAlerts',
      billing_update: 'billingUpdates',
      weekly_digest: 'weeklyDigest',
    };

    const preferenceKey = categoryMap[category];
    return preferenceKey ? preferences[preferenceKey] : true;
  }

  /**
   * Check if current time is in quiet hours
   */
  private static isInQuietHours(quietHours?: any): boolean {
    if (!quietHours || !quietHours.enabled) {
      return false;
    }

    try {
      const now = new Date();
      const userTimezone = quietHours.timezone || 'UTC';
      
      // Convert current time to user's timezone
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      const currentHour = userTime.getHours();
      const currentMinute = userTime.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      // Parse quiet hours
      const [startHour, startMinute] = quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = quietHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      // Handle overnight quiet hours
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      } else {
        return currentTime >= startTime && currentTime <= endTime;
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  }

  /**
   * Log notification history
   */
  private static async logNotificationHistory(
    data: NotificationData,
    results: PromiseSettledResult<boolean>[]
  ): Promise<void> {
    try {
      const [emailResult, browserResult, pushResult] = results;
      
      // Log email notification
      if (data.type === 'email' || emailResult.status === 'fulfilled') {
        await prisma.notificationHistory.create({
          data: {
            userId: data.userId,
            type: 'email',
            title: data.title,
            message: data.message,
            status: emailResult.status === 'fulfilled' && emailResult.value ? 'sent' : 'failed',
            metadata: {
              category: data.category,
              priority: data.priority,
              ...data.metadata,
              success: emailResult.status === 'fulfilled' && emailResult.value,
            },
          },
        });
      }

      // Log browser notification
      if (data.type === 'browser' || browserResult.status === 'fulfilled') {
        await prisma.notificationHistory.create({
          data: {
            userId: data.userId,
            type: 'browser',
            title: data.title,
            message: data.message,
            status: browserResult.status === 'fulfilled' && browserResult.value ? 'sent' : 'failed',
            metadata: {
              category: data.category,
              priority: data.priority,
              ...data.metadata,
              success: browserResult.status === 'fulfilled' && browserResult.value,
            },
          },
        });
      }

      // Log push notification
      if (data.type === 'push' || pushResult.status === 'fulfilled') {
        await prisma.notificationHistory.create({
          data: {
            userId: data.userId,
            type: 'push',
            title: data.title,
            message: data.message,
            status: pushResult.status === 'fulfilled' && pushResult.value ? 'sent' : 'failed',
            metadata: {
              category: data.category,
              priority: data.priority,
              ...data.metadata,
              success: pushResult.status === 'fulfilled' && pushResult.value,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error logging notification history:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await prisma.notificationHistory.updateMany({
        where: {
          id: notificationId,
          userId: userId,
        },
        data: {
          status: 'read',
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notificationHistory.count({
        where: {
          userId: userId,
          status: 'sent',
        },
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get pending browser notifications
   */
  static async getPendingBrowserNotifications(userId: string): Promise<any[]> {
    try {
      const notifications = await prisma.notificationHistory.findMany({
        where: {
          userId: userId,
          type: 'browser',
          status: 'sent',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      return notifications;
    } catch (error) {
      console.error('Error getting pending browser notifications:', error);
      return [];
    }
  }

  /**
   * Get pending push notifications
   */
  static async getPendingPushNotifications(userId: string): Promise<any[]> {
    try {
      const notifications = await prisma.notificationHistory.findMany({
        where: {
          userId: userId,
          type: 'push',
          status: 'sent',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      return notifications;
    } catch (error) {
      console.error('Error getting pending push notifications:', error);
      return [];
    }
  }
} 