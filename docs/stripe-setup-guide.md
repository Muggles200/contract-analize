# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe for subscription billing in Contract Analize.

## Prerequisites

- Stripe account (sign up at [stripe.com](https://stripe.com))
- Node.js and npm installed
- Environment variables configured

## Step 1: Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js
```

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Will be generated in step 4
STRIPE_PORTAL_CONFIGURATION_ID=bpc_... # Will be generated in step 3

# Application Configuration
NEXTAUTH_URL=http://localhost:3000 # Your app URL
```

## Step 3: Set Up Stripe Products and Pricing

Run the setup script to create products and pricing plans:

```bash
npx tsx scripts/setup-stripe.ts
```

This script will:
- Create products for Basic, Pro, and Enterprise plans
- Set up pricing ($29, $49, $99/month)
- Configure customer portal settings
- Create webhook endpoint
- Output the necessary IDs for environment variables

### Expected Output:

```
🎯 Stripe Setup Script for Contract Analize

🚀 Setting up Stripe products and pricing plans...

📦 Creating product: Basic Plan
✅ Product created: prod_...
💰 Price created: price_... (price_basic_monthly)
   Amount: $29.00/month

📦 Creating product: Pro Plan
✅ Product created: prod_...
💰 Price created: price_... (price_pro_monthly)
   Amount: $49.00/month

📦 Creating product: Enterprise Plan
✅ Product created: prod_...
💰 Price created: price_... (price_enterprise_monthly)
   Amount: $99.00/month

🔧 Setting up Customer Portal configuration...
✅ Customer Portal configuration created: bpc_...
📝 Add this ID to your STRIPE_PORTAL_CONFIGURATION_ID environment variable

🔗 Setting up webhook endpoint...
✅ Webhook endpoint created: we_...
🔑 Webhook secret: whsec_...
📝 Add the webhook secret to your STRIPE_WEBHOOK_SECRET environment variable

🎊 All done! Your Stripe integration is ready to use.
```

## Step 4: Update Environment Variables

Copy the generated IDs to your environment variables:

```env
STRIPE_WEBHOOK_SECRET=whsec_... # From webhook endpoint
STRIPE_PORTAL_CONFIGURATION_ID=bpc_... # From customer portal
```

## Step 5: Configure Stripe Dashboard Settings

### 5.1 Webhook Endpoint

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Verify the webhook endpoint was created: `https://your-domain.com/api/webhooks/stripe`
3. Ensure these events are enabled:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.updated`
   - `customer.deleted`

### 5.2 Customer Portal

1. Go to [Stripe Dashboard > Billing > Customer Portal](https://dashboard.stripe.com/billing/portal)
2. Verify the configuration was created
3. Customize the portal settings as needed:
   - Business profile
   - Allowed features
   - Branding

### 5.3 Payment Methods

1. Go to [Stripe Dashboard > Settings > Payment Methods](https://dashboard.stripe.com/settings/payment_methods)
2. Enable the payment methods you want to accept:
   - Credit cards (Visa, Mastercard, etc.)
   - ACH payments (US only)
   - SEPA Direct Debit (EU only)

## Step 6: Test the Integration

### 6.1 Test Cards

Use these test card numbers for testing:

```bash
# Successful payment
4242 4242 4242 4242

# Payment requires authentication
4000 0025 0000 3155

# Payment fails
4000 0000 0000 0002

# Expired card
4000 0000 0000 0069

# Incorrect CVC
4000 0000 0000 0127
```

### 6.2 Test Scenarios

1. **Create Subscription**
   - Go to billing page
   - Select a plan
   - Complete checkout with test card
   - Verify subscription is created

2. **Upgrade/Downgrade**
   - Change plan in billing dashboard
   - Verify proration is calculated correctly
   - Check subscription status updates

3. **Cancel Subscription**
   - Cancel subscription
   - Verify it's marked to cancel at period end
   - Test reactivation

4. **Payment Failure**
   - Use failing test card
   - Verify webhook handles payment failure
   - Check subscription status updates

## Step 7: Production Deployment

### 7.1 Switch to Live Keys

1. Get your live Stripe keys from the dashboard
2. Update environment variables:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

### 7.2 Update Webhook Endpoint

1. Create a new webhook endpoint for production
2. Update the webhook secret in environment variables
3. Test webhook delivery

### 7.3 Domain Verification

1. Add your production domain to Stripe settings
2. Verify domain ownership
3. Update NEXTAUTH_URL to production URL

## Step 8: Monitoring and Analytics

### 8.1 Stripe Dashboard

Monitor your business in the Stripe Dashboard:
- [Revenue](https://dashboard.stripe.com/analytics/revenue)
- [Subscriptions](https://dashboard.stripe.com/subscriptions)
- [Customers](https://dashboard.stripe.com/customers)
- [Webhooks](https://dashboard.stripe.com/webhooks)

### 8.2 Application Logs

Monitor webhook events in your application logs:
```bash
# Check webhook delivery
tail -f logs/webhook.log

# Monitor subscription events
grep "subscription" logs/app.log
```

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Check webhook secret is correct
   - Verify webhook endpoint URL
   - Ensure HTTPS is used in production

2. **Subscription Not Created**
   - Check Stripe secret key
   - Verify price IDs are correct
   - Check customer creation logic

3. **Payment Method Not Working**
   - Verify payment method is enabled in Stripe
   - Check card details are correct
   - Test with different test cards

4. **Customer Portal Not Loading**
   - Check portal configuration ID
   - Verify customer has active subscription
   - Check return URL is correct

### Debug Mode

Enable debug logging by setting:
```env
STRIPE_DEBUG=true
```

This will log all Stripe API calls to help with troubleshooting.

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** before processing events
3. **Use HTTPS** in production for all webhook endpoints
4. **Implement idempotency** for webhook handlers
5. **Log all billing events** for audit purposes
6. **Regularly rotate API keys** and webhook secrets

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Community](https://community.stripe.com)

## Next Steps

After completing the Stripe setup:

1. Test all billing flows thoroughly
2. Set up monitoring and alerting
3. Configure backup payment methods
4. Implement dunning management
5. Set up revenue recognition
6. Configure tax collection if needed 