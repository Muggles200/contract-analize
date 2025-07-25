#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import { getStripeClient, getCustomerByUserId, getPaymentMethodsForCustomer } from '../lib/stripe';
import { prisma } from '../lib/db';

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  try {
    // Test 1: Check Stripe configuration
    console.log('1. Checking Stripe configuration...');
    
    const stripe = getStripeClient();
    console.log('   ✅ Stripe client initialized successfully');
    
    // Test 2: Check if we have any users with subscriptions
    console.log('\n2. Checking for users with subscriptions...');
    
    const usersWithSubscriptions = await prisma.subscription.findMany({
      where: {
        stripeCustomerId: { not: null },
        status: { in: ['active', 'trialing', 'past_due', 'canceled'] }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      take: 5
    });
    
    if (usersWithSubscriptions.length === 0) {
      console.log('   ⚠️ No users with Stripe subscriptions found');
      console.log('   💡 You may need to create a subscription first');
      return;
    }
    
    console.log(`   ✅ Found ${usersWithSubscriptions.length} users with subscriptions`);
    
    // Test 3: Test customer retrieval
    console.log('\n3. Testing customer retrieval...');
    
    const testUser = usersWithSubscriptions[0];
    console.log(`   Testing with user: ${testUser.user.email}`);
    
    const customer = await getCustomerByUserId(testUser.user.id);
    if (customer) {
      console.log(`   ✅ Found Stripe customer: ${customer.id}`);
      console.log(`   📧 Customer email: ${customer.email}`);
      console.log(`   📅 Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
    } else {
      console.log('   ❌ No Stripe customer found for user');
    }
    
    // Test 4: Test payment methods retrieval
    console.log('\n4. Testing payment methods retrieval...');
    
    if (customer) {
      const paymentMethods = await getPaymentMethodsForCustomer(customer.id);
      console.log(`   ✅ Found ${paymentMethods.length} payment methods`);
      
      paymentMethods.forEach((pm, index) => {
        console.log(`   💳 Payment Method ${index + 1}:`);
        console.log(`      ID: ${pm.id}`);
        console.log(`      Type: ${pm.type}`);
        if (pm.card) {
          console.log(`      Card: ${pm.card.brand} •••• ${pm.card.last4}`);
          console.log(`      Expires: ${pm.card.exp_month}/${pm.card.exp_year}`);
        }
        console.log(`      Default: ${pm.metadata?.isDefault === 'true' ? 'Yes' : 'No'}`);
      });
    }
    
    // Test 5: Test API endpoints
    console.log('\n5. Testing API endpoints...');
    
    // Test payment methods endpoint
    try {
      const response = await fetch('http://localhost:3000/api/billing/payment-methods', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Payment methods API: ${data.paymentMethods?.length || 0} methods returned`);
      } else {
        console.log(`   ❌ Payment methods API: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('   ⚠️ Payment methods API: Server not running or not accessible');
    }
    
    // Test invoices endpoint
    try {
      const response = await fetch('http://localhost:3000/api/billing/invoices', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Invoices API: ${data.invoices?.length || 0} invoices returned`);
      } else {
        console.log(`   ❌ Invoices API: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log('   ⚠️ Invoices API: Server not running or not accessible');
    }
    
    console.log('\n🎉 Stripe integration test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Stripe integration:', error);
    
    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
      console.log('\n📋 Troubleshooting:');
      console.log('1. Make sure STRIPE_SECRET_KEY is set in your .env.local file');
      console.log('2. Ensure the key is valid and has the correct permissions');
      console.log('3. Check if you\'re using the correct environment (test/live)');
    }
  }
}

// Run the test
testStripeIntegration().catch(console.error); 