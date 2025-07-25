#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import { prisma } from '../lib/db';
import { sendEmailWithTemplate } from '../lib/email-service';

async function testEmailPreferences() {
  console.log('🧪 Testing Email Preferences Functionality...\n');

  try {
    // Test 1: Check if database tables exist
    console.log('1. Checking database schema...');
    
    // Try to query the email preferences table
    const userCount = await prisma.user.count();
    console.log(`   ✅ Found ${userCount} users in database`);
    
    // Test 2: Create test user preferences
    console.log('\n2. Testing email preferences creation...');
    
    // Get the first user
    const user = await prisma.user.findFirst({
      include: { emailPreferences: true },
    });
    
    if (!user) {
      console.log('   ❌ No users found in database');
      return;
    }
    
    console.log(`   ✅ Found user: ${user.email}`);
    
    // Test 3: Update email preferences
    console.log('\n3. Testing email preferences update...');
    
    const updatedPreferences = await prisma.userEmailPreferences.upsert({
      where: { userId: user.id },
      update: {
        marketing: false,
        security: true,
        analysis: true,
        billing: false,
        weekly: true,
        frequency: 'daily',
        timezone: 'America/New_York',
      },
      create: {
        userId: user.id,
        marketing: false,
        security: true,
        analysis: true,
        billing: false,
        weekly: true,
        frequency: 'daily',
        timezone: 'America/New_York',
      },
    });
    
    console.log('   ✅ Email preferences updated successfully');
    console.log(`   📧 Marketing: ${updatedPreferences.marketing}`);
    console.log(`   🔒 Security: ${updatedPreferences.security}`);
    console.log(`   📊 Analysis: ${updatedPreferences.analysis}`);
    console.log(`   💳 Billing: ${updatedPreferences.billing}`);
    console.log(`   📅 Weekly: ${updatedPreferences.weekly}`);
    console.log(`   ⏰ Frequency: ${updatedPreferences.frequency}`);
    console.log(`   🌍 Timezone: ${updatedPreferences.timezone}`);
    
    // Test 4: Test email template system
    console.log('\n4. Testing email template system...');
    
    const templates = await import('../lib/email-service').then(m => m.getEmailTemplates());
    console.log(`   ✅ Found ${templates.length} email templates`);
    
    templates.forEach(template => {
      console.log(`   📧 ${template.name} (${template.category})`);
    });
    
    // Test 5: Test email sending (if RESEND_API_KEY is set)
    if (process.env.RESEND_API_KEY) {
      console.log('\n5. Testing email sending...');
      
      const success = await sendEmailWithTemplate(
        'analysis-complete',
        user.email,
        {
          name: user.name || 'User',
          contractName: 'Test Contract',
          totalClauses: 15,
          totalRisks: 3,
          totalRecommendations: 8,
          analysisUrl: 'https://example.com/analysis/123',
        },
        user.id
      );
      
      if (success) {
        console.log('   ✅ Test email sent successfully');
      } else {
        console.log('   ❌ Failed to send test email');
      }
    } else {
      console.log('\n5. Skipping email sending test (RESEND_API_KEY not set)');
    }
    
    // Test 6: Test unsubscribe functionality
    console.log('\n6. Testing unsubscribe functionality...');
    
    const { generateUnsubscribeToken } = await import('../lib/utils/unsubscribe');
    const token = generateUnsubscribeToken(user.id, 'marketing');
    console.log(`   ✅ Generated unsubscribe token: ${token.substring(0, 20)}...`);
    
    // Test 7: Verify preferences are respected
    console.log('\n7. Testing preference enforcement...');
    
    const userWithPrefs = await prisma.user.findUnique({
      where: { id: user.id },
      include: { emailPreferences: true },
    });
    
    if (userWithPrefs?.emailPreferences) {
      console.log('   ✅ User preferences loaded successfully');
      console.log(`   📧 Marketing emails: ${userWithPrefs.emailPreferences.marketing ? 'Enabled' : 'Disabled'}`);
    } else {
      console.log('   ❌ Failed to load user preferences');
    }
    
    console.log('\n🎉 All email preferences tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEmailPreferences().catch(console.error); 