#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import { prisma } from '../lib/db';
import { NotificationService } from '../lib/notification-service';

async function testNotificationSettings() {
  console.log('🧪 Testing Notification Settings Functionality...\n');

  try {
    // Test 1: Check if database tables exist
    console.log('1. Checking database schema...');
    
    const userCount = await prisma.user.count();
    const notificationSettingsCount = await prisma.userNotificationSettings.count();
    const pushTokenCount = await prisma.pushToken.count();
    const notificationHistoryCount = await prisma.notificationHistory.count();
    
    console.log(`   ✅ Found ${userCount} users in database`);
    console.log(`   ✅ Found ${notificationSettingsCount} notification settings entries`);
    console.log(`   ✅ Found ${pushTokenCount} push tokens`);
    console.log(`   ✅ Found ${notificationHistoryCount} notification history entries`);
    
    // Test 2: Get first user for testing
    console.log('\n2. Getting test user...');
    
    const user = await prisma.user.findFirst({
      include: { 
        notificationSettings: true,
        pushTokens: true,
      },
    });
    
    if (!user) {
      console.log('   ❌ No users found in database');
      return;
    }
    
    console.log(`   ✅ Found user: ${user.email}`);
    console.log(`   📱 User has notification settings: ${!!user.notificationSettings}`);
    console.log(`   🔔 User has ${user.pushTokens.length} push tokens`);
    
    // Test 3: Test notification settings creation/update
    console.log('\n3. Testing notification settings...');
    
    const testSettings = {
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
        timezone: 'UTC',
      },
      soundEnabled: true,
      vibrationEnabled: true,
    };
    
    const notificationSettings = await prisma.userNotificationSettings.upsert({
      where: { userId: user.id },
      update: testSettings,
      create: {
        userId: user.id,
        ...testSettings,
      },
    });
    
    console.log(`   ✅ Created/updated notification settings for user ${user.id}`);
    console.log(`   📊 Browser notifications: ${notificationSettings.browser}`);
    console.log(`   📧 Email notifications: ${notificationSettings.email}`);
    console.log(`   🔔 Push notifications: ${notificationSettings.push}`);
    console.log(`   🤫 Quiet hours enabled: ${(notificationSettings.quietHours as any)?.enabled || false}`);
    
    // Test 4: Test push token registration
    console.log('\n4. Testing push token registration...');
    
    const testPushToken = await prisma.pushToken.create({
      data: {
        userId: user.id,
        token: 'test-push-token-' + Date.now(),
        deviceType: 'web',
        deviceId: 'test-device-' + Date.now(),
        userAgent: 'Test Browser/1.0',
        appVersion: '1.0.0',
        osVersion: 'Windows 10',
        isActive: true,
        lastUsed: new Date(),
      },
    });
    
    console.log(`   ✅ Created push token: ${testPushToken.id}`);
    console.log(`   📱 Device type: ${testPushToken.deviceType}`);
    console.log(`   🔑 Token: ${testPushToken.token.substring(0, 20)}...`);
    
    // Test 5: Test notification service
    console.log('\n5. Testing notification service...');
    
    const testNotification = {
      userId: user.id,
      type: 'email' as const,
      title: 'Test Notification',
      message: 'This is a test notification from the notification service.',
      category: 'analysis_complete' as const,
      priority: 'normal' as const,
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
      actionUrl: 'https://example.com/test',
    };
    
    const notificationResult = await NotificationService.sendNotification(testNotification);
    console.log(`   ✅ Notification sent successfully: ${notificationResult}`);
    
    // Test 6: Test notification history
    console.log('\n6. Testing notification history...');
    
    const notificationHistory = await prisma.notificationHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log(`   ✅ Found ${notificationHistory.length} notification history entries`);
    notificationHistory.forEach((notification, index) => {
      console.log(`      ${index + 1}. ${notification.title} (${notification.type}) - ${notification.status}`);
    });
    
    // Test 7: Test browser notification creation
    console.log('\n7. Testing browser notification creation...');
    
    const browserNotification = await prisma.notificationHistory.create({
      data: {
        userId: user.id,
        type: 'browser',
        title: 'Test Browser Notification',
        message: 'This is a test browser notification.',
        status: 'sent',
        metadata: { 
          test: true,
          category: 'new_features',
          priority: 'normal',
          actionUrl: 'https://example.com/browser-test',
        },
      },
    });
    
    console.log(`   ✅ Created browser notification: ${browserNotification.id}`);
    
    // Test 8: Test push notification creation
    console.log('\n8. Testing push notification creation...');
    
    const pushNotification = await prisma.notificationHistory.create({
      data: {
        userId: user.id,
        type: 'push',
        title: 'Test Push Notification',
        message: 'This is a test push notification.',
        status: 'sent',
        metadata: { 
          test: true,
          category: 'security_alert',
          priority: 'high',
          actionUrl: 'https://example.com/push-test',
          soundEnabled: true,
          vibrationEnabled: true,
        },
      },
    });
    
    console.log(`   ✅ Created push notification: ${pushNotification.id}`);
    
    // Test 9: Test notification statistics
    console.log('\n9. Testing notification statistics...');
    
    const notificationStats = await prisma.notificationHistory.groupBy({
      by: ['type', 'status'],
      where: { userId: user.id },
      _count: { type: true },
    });
    
    console.log('   ✅ Notification statistics:');
    notificationStats.forEach(stat => {
      console.log(`      ${stat.type} (${stat.status}): ${stat._count.type}`);
    });
    
    // Test 10: Test unread count
    console.log('\n10. Testing unread count...');
    
    const unreadCount = await NotificationService.getUnreadCount(user.id);
    console.log(`   ✅ Unread notifications: ${unreadCount}`);
    
    // Test 11: Test pending notifications
    console.log('\n11. Testing pending notifications...');
    
    const pendingBrowserNotifications = await NotificationService.getPendingBrowserNotifications(user.id);
    const pendingPushNotifications = await NotificationService.getPendingPushNotifications(user.id);
    
    console.log(`   ✅ Pending browser notifications: ${pendingBrowserNotifications.length}`);
    console.log(`   ✅ Pending push notifications: ${pendingPushNotifications.length}`);
    
    // Test 12: Test quiet hours functionality
    console.log('\n12. Testing quiet hours functionality...');
    
    const quietHours = notificationSettings.quietHours as any;
    if (quietHours?.enabled) {
      console.log(`   ✅ Quiet hours enabled: ${quietHours.start} - ${quietHours.end} (${quietHours.timezone})`);
      
      // Test quiet hours logic
      const now = new Date();
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: quietHours.timezone }));
      const currentHour = userTime.getHours();
      const currentMinute = userTime.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      const [startHour, startMinute] = quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = quietHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      let isInQuietHours = false;
      if (startTime > endTime) {
        isInQuietHours = currentTime >= startTime || currentTime <= endTime;
      } else {
        isInQuietHours = currentTime >= startTime && currentTime <= endTime;
      }
      
      console.log(`   📅 Current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
      console.log(`   🤫 In quiet hours: ${isInQuietHours}`);
    } else {
      console.log('   ⏰ Quiet hours disabled');
    }
    
    // Test 13: Cleanup test data
    console.log('\n13. Cleaning up test data...');
    
    await prisma.notificationHistory.delete({
      where: { id: browserNotification.id },
    });
    
    await prisma.notificationHistory.delete({
      where: { id: pushNotification.id },
    });
    
    await prisma.pushToken.delete({
      where: { id: testPushToken.id },
    });
    
    console.log('   ✅ Cleaned up test data');
    
    console.log('\n🎉 All notification settings tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testNotificationSettings().catch(console.error); 