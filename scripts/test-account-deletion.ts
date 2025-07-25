#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function testAccountDeletion() {
  console.log('🧪 Testing Account Deletion Functionality...\n');

  try {
    // Test 1: Check if database tables exist
    console.log('1. Checking database schema...');
    
    const userCount = await prisma.user.count();
    const accountDeletionCount = await prisma.accountDeletion.count();
    const organizationMemberCount = await prisma.organizationMember.count();
    const subscriptionCount = await prisma.subscription.count();
    
    console.log(`   ✅ Found ${userCount} users in database`);
    console.log(`   ✅ Found ${accountDeletionCount} account deletion records`);
    console.log(`   ✅ Found ${organizationMemberCount} organization memberships`);
    console.log(`   ✅ Found ${subscriptionCount} subscriptions`);
    
    // Test 2: Get first user for testing
    console.log('\n2. Getting test user...');
    
    const user = await prisma.user.findFirst({
      include: { 
        accountDeletion: true,
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
        contracts: {
          take: 5,
        },
        subscriptions: {
          where: {
            status: { in: ['active', 'trialing', 'past_due'] },
          },
        },
      },
    });
    
    if (!user) {
      console.log('   ❌ No users found in database');
      return;
    }
    
    console.log(`   ✅ Found user: ${user.email}`);
    console.log(`   🔐 User has password: ${!!user.password}`);
    console.log(`   🗑️ User has ${user.accountDeletion ? 1 : 0} deletion records`);
    console.log(`   🏢 User has ${user.organizationMemberships.length} organization memberships`);
    console.log(`   📄 User has ${user.contracts.length} contracts`);
    console.log(`   💳 User has ${user.subscriptions.length} active subscriptions`);
    
    // Test 3: Test data export functionality
    console.log('\n3. Testing data export functionality...');
    
    const exportData = await exportUserData(user.id);
    console.log(`   ✅ Exported user data: ${JSON.stringify(exportData).length} characters`);
    console.log(`   📊 Export includes:`);
    console.log(`      - User info: ${!!exportData.user}`);
    console.log(`      - Contracts: ${exportData.contracts.length}`);
    console.log(`      - Organizations: ${exportData.organizations.length}`);
    console.log(`      - Activity: ${exportData.activity.length}`);
    console.log(`      - Analytics: ${exportData.analytics.length}`);
    console.log(`      - Settings: ${!!exportData.settings}`);
    console.log(`      - Reports: ${exportData.reports.scheduled.length} scheduled, ${exportData.reports.history.length} history`);
    
    // Test 4: Test organization membership handling
    console.log('\n4. Testing organization membership handling...');
    
    if (user.organizationMemberships.length > 0) {
      console.log(`   📋 User has ${user.organizationMemberships.length} organization memberships:`);
      user.organizationMemberships.forEach((membership: any, index: number) => {
        console.log(`      ${index + 1}. ${membership.organization.name} (${membership.role})`);
      });
      
      // Test ownership transfer logic
      const ownershipMembership = user.organizationMemberships.find((m: any) => m.role === 'owner');
      if (ownershipMembership) {
        const otherMembers = await prisma.organizationMember.findMany({
          where: {
            organizationId: ownershipMembership.organizationId,
            userId: { not: user.id },
          },
        });
        
        console.log(`   👑 User is owner of "${ownershipMembership.organization.name}"`);
        console.log(`   👥 Organization has ${otherMembers.length} other members`);
        
        if (otherMembers.length === 0) {
          console.log(`   🗑️ Organization would be deleted (no other members)`);
        } else {
          console.log(`   🔄 Ownership would be transferred to: ${otherMembers[0].role}`);
        }
      }
    } else {
      console.log('   ℹ️ User has no organization memberships');
    }
    
    // Test 5: Test subscription cancellation
    console.log('\n5. Testing subscription cancellation...');
    
    if (user.subscriptions.length > 0) {
      console.log(`   💳 User has ${user.subscriptions.length} active subscriptions:`);
      user.subscriptions.forEach((subscription, index) => {
        console.log(`      ${index + 1}. ${subscription.stripeSubscriptionId || 'No Stripe ID'} (${subscription.status})`);
      });
      
      // Test subscription cancellation logic
      for (const subscription of user.subscriptions) {
        if (subscription.stripeSubscriptionId) {
          console.log(`   🔄 Would cancel Stripe subscription: ${subscription.stripeSubscriptionId}`);
        }
        console.log(`   📝 Would update subscription status to 'canceled'`);
      }
    } else {
      console.log('   ℹ️ User has no active subscriptions');
    }
    
    // Test 6: Test account deletion scheduling
    console.log('\n6. Testing account deletion scheduling...');
    
    const gracePeriodDays = 30;
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + gracePeriodDays);
    
    const accountDeletion = await prisma.accountDeletion.create({
      data: {
        userId: user.id,
        scheduledFor: deletionDate,
        reason: 'Test account deletion',
        status: 'scheduled',
      },
    });
    
    console.log(`   ✅ Created account deletion record: ${accountDeletion.id}`);
    console.log(`   📅 Scheduled for: ${accountDeletion.scheduledFor}`);
    console.log(`   ⏰ Grace period: ${gracePeriodDays} days`);
    console.log(`   📊 Export data prepared: ${!!exportData}`);
    
    // Test 7: Test account recovery functionality
    console.log('\n7. Testing account recovery functionality...');
    
    const now = new Date();
    const scheduledDate = new Date(accountDeletion.scheduledFor);
    const daysRemaining = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`   ⏰ Days remaining: ${daysRemaining}`);
    console.log(`   🔄 Can recover: ${daysRemaining > 0 && accountDeletion.status === 'scheduled'}`);
    
    if (daysRemaining > 0 && accountDeletion.status === 'scheduled') {
      // Cancel the deletion
      await prisma.accountDeletion.update({
        where: { id: accountDeletion.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledReason: 'Test recovery',
        },
      });
      
      console.log('   ✅ Account deletion cancelled successfully');
    }
    
    // Test 8: Test notification sending simulation
    console.log('\n8. Testing notification sending simulation...');
    
    const notificationData = {
      userId: user.id,
      type: 'email' as const,
      title: 'Test Account Deletion Notification',
      message: 'This is a test notification for account deletion.',
      category: 'security_alert' as const,
      priority: 'high' as const,
      metadata: {
        test: true,
        action: 'account_deletion_test',
        gracePeriodDays: gracePeriodDays,
        timestamp: new Date().toISOString(),
      },
    };
    
    console.log('   📧 Account deletion notification data prepared');
    console.log(`   📋 Title: ${notificationData.title}`);
    console.log(`   📋 Category: ${notificationData.category}`);
    console.log(`   📋 Priority: ${notificationData.priority}`);
    console.log(`   📋 Grace Period: ${gracePeriodDays} days`);
    
    // Test 9: Test activity logging
    console.log('\n9. Testing activity logging...');
    
    const activityLog = await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'account_deletion_test',
        description: 'Test account deletion functionality',
        metadata: {
          test: true,
          gracePeriodDays: gracePeriodDays,
          exportData: !!exportData,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    console.log(`   ✅ Created activity log: ${activityLog.id}`);
    console.log(`   📝 Activity type: ${activityLog.activityType}`);
    console.log(`   📝 Description: ${activityLog.description}`);
    
    // Test 10: Test analytics events
    console.log('\n10. Testing analytics events...');
    
    const analyticsEvent = await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'account_deletion_test',
        eventData: {
          test: true,
          gracePeriodDays: gracePeriodDays,
          exportData: !!exportData,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    console.log(`   ✅ Created analytics event: ${analyticsEvent.id}`);
    console.log(`   📊 Event type: ${analyticsEvent.eventType}`);
    
    // Test 11: Check recent activities
    console.log('\n11. Checking recent activities...');
    
    const recentActivities = await prisma.userActivity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log(`   ✅ Found ${recentActivities.length} recent activities:`);
    recentActivities.forEach((activity, index) => {
      console.log(`      ${index + 1}. ${activity.activityType} - ${activity.description}`);
    });
    
    // Test 12: Cleanup test data
    console.log('\n12. Cleaning up test data...');
    
    // Delete test account deletion record
    await prisma.accountDeletion.deleteMany({
      where: {
        userId: user.id,
        reason: 'Test account deletion',
      },
    });
    
    // Delete test activities
    await prisma.userActivity.deleteMany({
      where: {
        userId: user.id,
        description: { contains: 'Test' },
      },
    });
    
    // Delete test analytics events
    await prisma.analyticsEvent.deleteMany({
      where: {
        userId: user.id,
        eventType: 'account_deletion_test',
      },
    });
    
    console.log('   ✅ Cleaned up test data');
    
    console.log('\n🎉 All account deletion tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export user data function (copied from API)
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
        passwordHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
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

// Run the test
testAccountDeletion().catch(console.error); 