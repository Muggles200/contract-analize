import Stripe from 'stripe';
import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

// Initialize Stripe client lazily
let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
  }
  return stripe;
}

const plans = [
  {
    name: 'Basic Plan',
    description: 'Perfect for small businesses and individuals',
    price: 2900, // $29.00 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      '10 contract analyses per month',
      'Advanced AI analysis',
      'Priority support',
      'PDF & Word export',
      'Email notifications',
      'Basic analytics'
    ],
    metadata: {
      planId: 'basic',
      contractsLimit: '10',
      usersLimit: '1',
      storageLimit: '1GB'
    }
  },
  {
    name: 'Pro Plan',
    description: 'Ideal for growing teams and businesses',
    price: 4900, // $49.00 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      '50 contract analyses per month',
      'Advanced AI analysis',
      'Priority support',
      'All export formats',
      'Advanced analytics',
      'Team collaboration',
      'Custom branding',
      'API access'
    ],
    metadata: {
      planId: 'pro',
      contractsLimit: '50',
      usersLimit: '5',
      storageLimit: '10GB'
    }
  },
  {
    name: 'Enterprise Plan',
    description: 'For large organizations with unlimited needs',
    price: 9900, // $99.00 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited contract analyses',
      'Advanced AI analysis',
      '24/7 priority support',
      'All export formats',
      'Advanced analytics',
      'Unlimited team members',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee'
    ],
    metadata: {
      planId: 'enterprise',
      contractsLimit: 'unlimited',
      usersLimit: 'unlimited',
      storageLimit: '100GB'
    }
  }
];

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products and pricing plans...\n');

    for (const plan of plans) {
      console.log(`📦 Creating product: ${plan.name}`);
      
      // Create product
      const product = await getStripeClient().products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      });

      console.log(`✅ Product created: ${product.id}`);

      // Create price
      const price = await getStripeClient().prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: plan.currency,
        recurring: {
          interval: plan.interval as 'month' | 'year',
        },
        metadata: {
          planId: plan.metadata.planId,
          priceId: `price_${plan.metadata.planId}_monthly`,
        },
      });

      console.log(`💰 Price created: ${price.id} (${price.metadata.priceId})`);
      console.log(`   Amount: $${(plan.price / 100).toFixed(2)}/${plan.interval}\n`);
    }

    console.log('🎉 Stripe setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the price IDs above to your environment variables');
    console.log('2. Set up webhook endpoint in Stripe Dashboard');
    console.log('3. Configure customer portal settings');
    console.log('4. Test the integration with test cards');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error);
    process.exit(1);
  }
}

async function setupCustomerPortal() {
  try {
    console.log('\n🔧 Setting up Customer Portal configuration...');

    const configuration = await getStripeClient().billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your Contract Analize subscription',
        privacy_policy_url: `${process.env.NEXTAUTH_URL}/privacy`,
        terms_of_service_url: `${process.env.NEXTAUTH_URL}/terms`,
      },
      features: {
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          proration_behavior: 'none',
        },

        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price'],
          proration_behavior: 'create_prorations',
        },
        payment_method_update: {
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
      },
    });

    console.log(`✅ Customer Portal configuration created: ${configuration.id}`);
    console.log('📝 Add this ID to your STRIPE_PORTAL_CONFIGURATION_ID environment variable\n');

    return configuration.id;
  } catch (error) {
    console.error('❌ Error setting up Customer Portal:', error);
    return null;
  }
}

async function setupWebhookEndpoint() {
  try {
    console.log('\n🔗 Setting up webhook endpoint...');

    const webhookEndpoint = await getStripeClient().webhookEndpoints.create({
      url: `${process.env.NEXTAUTH_URL}/api/webhooks/stripe`,
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'customer.subscription.trial_will_end',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'customer.updated',
        'customer.deleted',
      ],
      metadata: {
        environment: process.env.NODE_ENV || 'development',
      },
    });

    console.log(`✅ Webhook endpoint created: ${webhookEndpoint.id}`);
    console.log(`🔑 Webhook secret: ${webhookEndpoint.secret}`);
    console.log('📝 Add the webhook secret to your STRIPE_WEBHOOK_SECRET environment variable\n');

    return webhookEndpoint.secret;
  } catch (error) {
    console.error('❌ Error setting up webhook endpoint:', error);
    return null;
  }
}

async function main() {
  console.log('🎯 Stripe Setup Script for Contract Analize\n');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY environment variable is required');
    process.exit(1);
  }

  if (!process.env.NEXTAUTH_URL) {
    console.error('❌ NEXTAUTH_URL environment variable is required');
    process.exit(1);
  }

  // Setup products and prices
  await setupStripeProducts();
  
  // Setup customer portal
  await setupCustomerPortal();
  
  // Setup webhook endpoint
  await setupWebhookEndpoint();

  console.log('🎊 All done! Your Stripe integration is ready to use.');
  console.log('\n📚 Documentation: https://stripe.com/docs');
  console.log('🧪 Test cards: https://stripe.com/docs/testing#cards');
}

if (require.main === module) {
  main().catch(console.error);
} 