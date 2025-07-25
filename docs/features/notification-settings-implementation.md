# Notification Settings Implementation

## Overview

The Notification Settings system provides comprehensive notification management capabilities, including multiple notification channels, customizable preferences, quiet hours, and real-time notification delivery.

## Features

### ✅ Completed Features

1. **API Endpoints**
   - `GET /api/user/notification-settings` - Retrieve notification preferences
   - `PUT /api/user/notification-settings` - Update notification preferences
   - `GET /api/user/notification-settings/browser-permission` - Get browser permission status
   - `POST /api/user/notification-settings/browser-permission` - Update browser permission
   - `GET /api/user/notification-settings/push-token` - Get push tokens
   - `POST /api/user/notification-settings/push-token` - Register push token
   - `DELETE /api/user/notification-settings/push-token` - Delete push token
   - `GET /api/user/notification-settings/history` - Get notification history
   - `DELETE /api/user/notification-settings/history` - Clear notification history

2. **Notification Channels**
   - **Browser Notifications** - Real-time notifications in the browser
   - **Email Notifications** - Email-based notifications via Resend
   - **Push Notifications** - Mobile and web push notifications

3. **Notification Types**
   - Analysis Complete - When contract analysis is finished
   - New Features - When new features are released
   - Security Alerts - Important security updates
   - Billing Updates - Subscription and payment notifications
   - Weekly Digest - Weekly activity summaries

4. **Advanced Features**
   - **Quiet Hours** - Set times when notifications are paused
   - **Sound & Vibration** - Customize notification delivery
   - **Notification History** - Track all sent notifications
   - **Real-time Delivery** - Instant notification delivery
   - **Preference Enforcement** - Respect user notification preferences

## API Usage

### Get Notification Settings

```typescript
const response = await fetch('/api/user/notification-settings');
const settings = await response.json();

// Response format:
{
  browser: boolean,
  email: boolean,
  push: boolean,
  analysisComplete: boolean,
  newFeatures: boolean,
  securityAlerts: boolean,
  billingUpdates: boolean,
  weeklyDigest: boolean,
  quietHours: {
    enabled: boolean,
    start: string, // HH:MM format
    end: string,   // HH:MM format
    timezone: string,
  },
  soundEnabled: boolean,
  vibrationEnabled: boolean,
}
```

### Update Notification Settings

```typescript
const response = await fetch('/api/user/notification-settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    browser: true,
    email: true,
    push: false,
    analysisComplete: true,
    newFeatures: true,
    securityAlerts: true,
    billingUpdates: true,
    weeklyDigest: false,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York',
    },
    soundEnabled: true,
    vibrationEnabled: true,
  })
});
```

### Browser Permission Management

```typescript
// Get current browser permission status
const response = await fetch('/api/user/notification-settings/browser-permission');
const status = await response.json();

// Update browser permission
const response = await fetch('/api/user/notification-settings/browser-permission', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    permission: 'granted', // 'granted', 'denied', 'default'
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  })
});
```

### Push Token Management

```typescript
// Register push token
const response = await fetch('/api/user/notification-settings/push-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'push-token-from-service-worker',
    deviceType: 'web', // 'web', 'ios', 'android'
    deviceId: 'unique-device-id',
    userAgent: navigator.userAgent,
    appVersion: '1.0.0',
    osVersion: 'Windows 10',
    isActive: true,
  })
});

// Get user's push tokens
const response = await fetch('/api/user/notification-settings/push-token');
const tokens = await response.json();

// Delete push token
const response = await fetch('/api/user/notification-settings/push-token?token=token-to-delete', {
  method: 'DELETE'
});
```

### Notification History

```typescript
// Get notification history with pagination and filtering
const response = await fetch('/api/user/notification-settings/history?page=1&limit=20&type=email&status=sent');
const history = await response.json();

// Clear notification history
const response = await fetch('/api/user/notification-settings/history?olderThan=30', {
  method: 'DELETE'
});
```

## Notification Service

### Send Notifications

```typescript
import { NotificationService } from '@/lib/notification-service';

const notificationData = {
  userId: 'user-id',
  type: 'email', // 'email', 'browser', 'push'
  title: 'Analysis Complete',
  message: 'Your contract analysis is ready for review.',
  category: 'analysis_complete', // 'analysis_complete', 'new_features', 'security_alert', 'billing_update', 'weekly_digest', 'general'
  priority: 'normal', // 'low', 'normal', 'high', 'urgent'
  metadata: {
    contractId: 'contract-id',
    analysisId: 'analysis-id',
  },
  actionUrl: 'https://app.example.com/analysis/123',
  imageUrl: 'https://example.com/notification-icon.png',
};

const success = await NotificationService.sendNotification(notificationData);
```

### Get Notification Statistics

```typescript
// Get unread notifications count
const unreadCount = await NotificationService.getUnreadCount(userId);

// Get pending browser notifications
const pendingBrowserNotifications = await NotificationService.getPendingBrowserNotifications(userId);

// Get pending push notifications
const pendingPushNotifications = await NotificationService.getPendingPushNotifications(userId);

// Mark notification as read
await NotificationService.markAsRead(notificationId, userId);
```

## Database Schema

### UserNotificationSettings Table

```sql
model UserNotificationSettings {
  id                    String    @id @default(cuid())
  userId                String    @unique
  browser               Boolean   @default(true)
  email                 Boolean   @default(true)
  push                  Boolean   @default(false)
  analysisComplete      Boolean   @default(true)
  newFeatures           Boolean   @default(true)
  securityAlerts        Boolean   @default(true)
  billingUpdates        Boolean   @default(true)
  weeklyDigest          Boolean   @default(false)
  quietHours            Json?     // { enabled: boolean, start: string, end: string, timezone: string }
  soundEnabled          Boolean   @default(true)
  vibrationEnabled      Boolean   @default(true)
  browserPermission     String?   // 'granted', 'denied', 'default'
  browserPermissionUpdatedAt DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([browserPermission])
  @@map("user_notification_settings")
}
```

### PushToken Table

```sql
model PushToken {
  id          String    @id @default(cuid())
  userId      String
  token       String
  deviceType  String    @default("web") // 'web', 'ios', 'android'
  deviceId    String?
  userAgent   String?
  appVersion  String?
  osVersion   String?
  isActive    Boolean   @default(true)
  lastUsed    DateTime  @default(now())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([deviceType])
  @@index([isActive])
  @@map("push_tokens")
}
```

### NotificationHistory Table

```sql
model NotificationHistory {
  id          String    @id @default(cuid())
  userId      String
  type        String    // 'email', 'browser', 'push'
  title       String
  message     String
  category    String    // 'analysis_complete', 'new_features', 'security_alert', 'billing_update', 'weekly_digest', 'general'
  priority    String    @default("normal") // 'low', 'normal', 'high', 'urgent'
  status      String    @default("sent") // 'sent', 'delivered', 'failed', 'read'
  metadata    Json?
  readAt      DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
  @@map("notification_history")
}
```

## Notification Preferences

### Channel Preferences

- **Browser Notifications**: Receive notifications in the browser when the site is open
- **Email Notifications**: Receive notifications via email
- **Push Notifications**: Receive push notifications on devices (requires permission)

### Type Preferences

- **Analysis Complete**: Notifications when contract analysis is finished
- **New Features**: Notifications about new features and improvements
- **Security Alerts**: Important security updates and account activity
- **Billing Updates**: Subscription changes, payment confirmations, invoices
- **Weekly Digest**: Weekly summary of contract analysis activity

### Advanced Preferences

- **Quiet Hours**: Set times when notifications are paused
- **Sound Enabled**: Play sound for browser and push notifications
- **Vibration Enabled**: Vibrate device for push notifications

## Quiet Hours Implementation

### Time Format

Quiet hours use 24-hour format (HH:MM):
- Start time: `22:00` (10:00 PM)
- End time: `08:00` (8:00 AM)

### Timezone Support

Supported timezones include:
- UTC
- America/New_York (Eastern Time)
- America/Chicago (Central Time)
- America/Denver (Mountain Time)
- America/Los_Angeles (Pacific Time)
- Europe/London
- Europe/Paris
- Asia/Tokyo

### Overnight Quiet Hours

The system handles overnight quiet hours correctly:
- If start time > end time (e.g., 22:00 to 08:00), it spans midnight
- If start time < end time (e.g., 09:00 to 17:00), it's within the same day

## Real-time Notification Delivery

### Browser Notifications

1. **Permission Request**: Request browser notification permission
2. **Token Registration**: Register push token with the server
3. **Real-time Delivery**: Deliver notifications via WebSocket or polling
4. **Status Tracking**: Track notification delivery and read status

### Push Notifications

1. **Service Worker**: Register service worker for push notifications
2. **Token Management**: Register and manage push tokens
3. **Push Service**: Use Firebase Cloud Messaging or similar service
4. **Delivery Tracking**: Track delivery and engagement metrics

### Email Notifications

1. **Template System**: Use predefined email templates
2. **Preference Enforcement**: Respect user email preferences
3. **Delivery Tracking**: Track email delivery and open rates
4. **Unsubscribe Support**: Provide unsubscribe links

## Notification Categories

### Analysis Complete

- **Trigger**: When contract analysis is finished
- **Content**: Analysis results summary with action link
- **Priority**: Normal
- **Channels**: Email, Browser, Push

### New Features

- **Trigger**: When new features are released
- **Content**: Feature announcement with details
- **Priority**: Low
- **Channels**: Email, Browser

### Security Alerts

- **Trigger**: Security-related events (login from new device, etc.)
- **Content**: Security alert with action required
- **Priority**: High
- **Channels**: Email, Browser, Push

### Billing Updates

- **Trigger**: Subscription changes, payments, invoices
- **Content**: Billing information with payment links
- **Priority**: Normal
- **Channels**: Email, Browser

### Weekly Digest

- **Trigger**: Weekly scheduled summary
- **Content**: Weekly activity summary
- **Priority**: Low
- **Channels**: Email

## Testing

Run the test script to verify functionality:

```bash
npm run tsx scripts/test-notification-settings.ts
```

## Performance Considerations

### 1. Database Optimization

- Use proper indexes on frequently queried fields
- Implement pagination for notification history
- Use aggregation queries for statistics

### 2. Real-time Delivery

- Use WebSocket connections for browser notifications
- Implement efficient polling for push notifications
- Cache notification preferences

### 3. Rate Limiting

- Implement rate limiting for notification sending
- Respect quiet hours and user preferences
- Batch notifications when possible

## Security Features

### 1. Permission Management

- Secure browser permission handling
- Token-based push notification authentication
- User preference validation

### 2. Data Protection

- Encrypt sensitive notification data
- Implement proper access controls
- Log all notification activities

### 3. Privacy Compliance

- Respect user notification preferences
- Provide easy unsubscribe options
- Comply with GDPR requirements

## Future Enhancements

1. **Advanced Scheduling** - Custom notification schedules
2. **Notification Templates** - User-customizable templates
3. **Smart Notifications** - AI-powered notification timing
4. **Cross-platform Sync** - Sync preferences across devices
5. **Notification Analytics** - Detailed delivery and engagement metrics
6. **Bulk Operations** - Bulk notification management
7. **Notification Groups** - Group-based notification preferences
8. **Emergency Notifications** - Override quiet hours for urgent notifications

## Integration Points

### With Email System

```typescript
// Send notification via email
await sendEmailWithTemplate(
  'notification-template',
  user.email,
  notificationData,
  user.id
);
```

### With Analytics

```typescript
// Track notification events
await prisma.analyticsEvent.create({
  data: {
    userId: user.id,
    eventType: 'notification_sent',
    eventData: notificationData,
  },
});
```

### With User Activity

```typescript
// Log notification activities
await prisma.userActivity.create({
  data: {
    userId: user.id,
    activityType: 'notification_preferences_updated',
    description: 'User updated notification preferences',
    metadata: updatedPreferences,
  },
});
```

## Troubleshooting

### Common Issues

1. **Browser notifications not working** - Check browser permissions and HTTPS requirement
2. **Push notifications failing** - Verify service worker registration and token validity
3. **Email notifications not sending** - Check email service configuration and user preferences
4. **Quiet hours not working** - Verify timezone settings and time format

### Debug Mode

Enable debug logging:

```env
DEBUG_NOTIFICATIONS=true
```

This will log all notification activities to the console. 