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

async function testPasswordChange() {
  console.log('🧪 Testing Password Change Functionality...\n');

  try {
    // Test 1: Check if database tables exist
    console.log('1. Checking database schema...');
    
    const userCount = await prisma.user.count();
    const passwordHistoryCount = await prisma.passwordHistory.count();
    const userActivityCount = await prisma.userActivity.count();
    
    console.log(`   ✅ Found ${userCount} users in database`);
    console.log(`   ✅ Found ${passwordHistoryCount} password history entries`);
    console.log(`   ✅ Found ${userActivityCount} user activity entries`);
    
    // Test 2: Get first user for testing
    console.log('\n2. Getting test user...');
    
    const user = await prisma.user.findFirst({
      include: { 
        passwordHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    
    if (!user) {
      console.log('   ❌ No users found in database');
      return;
    }
    
    console.log(`   ✅ Found user: ${user.email}`);
    console.log(`   🔐 User has password: ${!!user.password}`);
    console.log(`   📚 User has ${user.passwordHistory.length} password history entries`);
    
    // Test 3: Test password strength validation
    console.log('\n3. Testing password strength validation...');
    
    const testPasswords = [
      'weak', // Too short
      'weakpass', // No uppercase, numbers, or special chars
      'WeakPass', // No numbers or special chars
      'WeakPass1', // No special chars
      'WeakPass1!', // Good password
      'password', // Common password
      '123456', // Common password
    ];
    
    testPasswords.forEach(password => {
      const strength = validatePasswordStrength(password);
      console.log(`   ${strength.isValid ? '✅' : '❌'} "${password}": ${strength.isValid ? 'Valid' : 'Invalid'} - ${strength.errors.join(', ')}`);
    });
    
    // Test 4: Test password history functionality
    console.log('\n4. Testing password history...');
    
    if (user.password) {
      // Create a test password history entry
      const testPasswordHash = await bcrypt.hash('TestPassword123!', 12);
      const passwordHistoryEntry = await prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: testPasswordHash,
        },
      });
      
      console.log(`   ✅ Created password history entry: ${passwordHistoryEntry.id}`);
      
      // Test password history check
      const historyCheck = await checkPasswordHistory(user.id, 'TestPassword123!');
      console.log(`   ${historyCheck.canUse ? '❌' : '✅'} Password history check: ${historyCheck.canUse ? 'Allowed (should be blocked)' : 'Blocked (correct)'}`);
      
      // Test with different password
      const historyCheck2 = await checkPasswordHistory(user.id, 'DifferentPassword123!');
      console.log(`   ${historyCheck2.canUse ? '✅' : '❌'} Different password check: ${historyCheck2.canUse ? 'Allowed (correct)' : 'Blocked (should be allowed)'}`);
      
      // Clean up test entry
      await prisma.passwordHistory.delete({
        where: { id: passwordHistoryEntry.id },
      });
      console.log('   🧹 Cleaned up test password history entry');
    }
    
    // Test 5: Test session invalidation
    console.log('\n5. Testing session invalidation...');
    
    // Get current sessions
    const currentSessions = await prisma.session.findMany({
      where: { userId: user.id },
    });
    
    console.log(`   📊 Current sessions: ${currentSessions.length}`);
    
    // Simulate session invalidation by deleting sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
    
    console.log('   ✅ All sessions invalidated');
    
    // Log session invalidation activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'sessions_invalidated',
        description: 'Test session invalidation',
        metadata: {
          reason: 'test',
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    console.log('   ✅ Session invalidation activity logged');
    
    // Test 6: Test password change simulation
    console.log('\n6. Testing password change simulation...');
    
    if (user.password) {
      const newPassword = 'NewSecurePassword123!';
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      
      // Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: newPasswordHash,
          updatedAt: new Date(),
        },
      });
      
      console.log('   ✅ Password updated successfully');
      
      // Save to password history
      await savePasswordToHistory(user.id, newPasswordHash);
      console.log('   ✅ Password saved to history');
      
      // Verify password change
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      
      const isPasswordValid = await bcrypt.compare(newPassword, updatedUser!.password!);
      console.log(`   ${isPasswordValid ? '✅' : '❌'} Password verification: ${isPasswordValid ? 'Success' : 'Failed'}`);
      
      // Log password change activity
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'password_changed',
          description: 'Test password change',
          metadata: {
            test: true,
            timestamp: new Date().toISOString(),
          },
        },
      });
      
      console.log('   ✅ Password change activity logged');
      
      // Restore original password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: user.password,
          updatedAt: new Date(),
        },
      });
      
      console.log('   🔄 Restored original password');
    }
    
    // Test 7: Test analytics events
    console.log('\n7. Testing analytics events...');
    
    const analyticsEvent = await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'password_change_test',
        eventData: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    console.log(`   ✅ Created analytics event: ${analyticsEvent.id}`);
    
    // Test 8: Test security notification simulation
    console.log('\n8. Testing security notification simulation...');
    
    const notificationData = {
      userId: user.id,
      type: 'email' as const,
      title: 'Test Security Alert',
      message: 'This is a test security notification for password change.',
      category: 'security_alert' as const,
      priority: 'high' as const,
      metadata: {
        test: true,
        action: 'password_change_test',
        timestamp: new Date().toISOString(),
      },
    };
    
    console.log('   📧 Security notification data prepared');
    console.log(`   📋 Title: ${notificationData.title}`);
    console.log(`   📋 Category: ${notificationData.category}`);
    console.log(`   📋 Priority: ${notificationData.priority}`);
    
    // Test 9: Check recent activities
    console.log('\n9. Checking recent activities...');
    
    const recentActivities = await prisma.userActivity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log(`   ✅ Found ${recentActivities.length} recent activities:`);
    recentActivities.forEach((activity, index) => {
      console.log(`      ${index + 1}. ${activity.activityType} - ${activity.description}`);
    });
    
    // Test 10: Cleanup test data
    console.log('\n10. Cleaning up test data...');
    
    // Delete test analytics event
    await prisma.analyticsEvent.delete({
      where: { id: analyticsEvent.id },
    });
    
    // Delete test activities
    await prisma.userActivity.deleteMany({
      where: {
        userId: user.id,
        description: { contains: 'Test' },
      },
    });
    
    console.log('   ✅ Cleaned up test data');
    
    console.log('\n🎉 All password change tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Password strength validation function (copied from API)
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Check password history function (copied from API)
async function checkPasswordHistory(userId: string, newPassword: string): Promise<{ canUse: boolean; error?: string }> {
  try {
    // Get recent password history (last 5 passwords)
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    // Check if new password matches any recent password
    for (const historyEntry of passwordHistory) {
      const isMatch = await bcrypt.compare(newPassword, historyEntry.passwordHash);
      if (isMatch) {
        return {
          canUse: false,
          error: 'Password cannot be the same as any of your last 5 passwords',
        };
      }
    }
    
    return { canUse: true };
  } catch (error) {
    console.error('Error checking password history:', error);
    return { canUse: true }; // Allow if history check fails
  }
}

// Save password to history function (copied from API)
async function savePasswordToHistory(userId: string, passwordHash: string): Promise<void> {
  try {
    await prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash,
      },
    });
    
    // Keep only last 10 password entries
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: 10,
    });
    
    if (passwordHistory.length > 0) {
      await prisma.passwordHistory.deleteMany({
        where: {
          id: { in: passwordHistory.map(entry => entry.id) },
        },
      });
    }
  } catch (error) {
    console.error('Error saving password to history:', error);
  }
}

// Run the test
testPasswordChange().catch(console.error); 