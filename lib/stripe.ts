import Stripe from 'stripe';

// Initialize Stripe client
let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
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

export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
  }
  return key;
}

// Helper function to format currency amounts
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Convert from cents
}

// Helper function to validate Stripe webhook signature
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return getStripeClient().webhooks.constructEvent(body, signature, secret);
}

// Helper function to get customer by user ID
export async function getCustomerByUserId(userId: string): Promise<Stripe.Customer | null> {
  try {
    const customers = await getStripeClient().customers.list({
      limit: 100,
    });
    
    // Filter by metadata on the client side
    const customer = customers.data.find(c => c.metadata?.userId === userId);
    return customer || null;
  } catch (error) {
    console.error('Error fetching customer by user ID:', error);
    return null;
  }
}

// Helper function to create or get customer
export async function createOrGetCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  try {
    // Try to find existing customer
    const existingCustomer = await getCustomerByUserId(userId);
    
    if (existingCustomer) {
      return existingCustomer;
    }
    
    // Create new customer
    const customer = await getStripeClient().customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating or getting customer:', error);
    throw error;
  }
}

// Helper function to get subscription by user ID
export async function getSubscriptionByUserId(userId: string): Promise<Stripe.Subscription | null> {
  try {
    const customer = await getCustomerByUserId(userId);
    if (!customer) return null;
    
    const subscriptions = await getStripeClient().subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'all',
    });
    
    return subscriptions.data[0] || null;
  } catch (error) {
    console.error('Error fetching subscription by user ID:', error);
    return null;
  }
}

// Helper function to get payment methods for customer
export async function getPaymentMethodsForCustomer(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await getStripeClient().paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    return paymentMethods.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
}

// Helper function to get invoices for customer
export async function getInvoicesForCustomer(
  customerId: string,
  limit: number = 10,
  startingAfter?: string
): Promise<{
  invoices: Stripe.Invoice[];
  hasMore: boolean;
}> {
  try {
    const invoices = await getStripeClient().invoices.list({
      customer: customerId,
      limit,
      starting_after: startingAfter,
      expand: ['data.subscription'],
    });
    
    return {
      invoices: invoices.data,
      hasMore: invoices.has_more,
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return {
      invoices: [],
      hasMore: false,
    };
  }
} 