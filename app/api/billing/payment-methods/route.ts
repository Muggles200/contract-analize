import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getStripeClient, getPaymentMethodsForCustomer } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription to find Stripe customer ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing', 'past_due', 'canceled'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await getPaymentMethodsForCustomer(subscription.stripeCustomerId);

    // Transform Stripe payment methods to our format
    const formattedPaymentMethods = paymentMethods.map(pm => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4 || '',
      brand: pm.card?.brand || '',
      expMonth: pm.card?.exp_month || 0,
      expYear: pm.card?.exp_year || 0,
      isDefault: pm.metadata?.isDefault === 'true' || false,
    }));

    return NextResponse.json({ paymentMethods: formattedPaymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentMethodId, setAsDefault = false } = body;

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }

    // Get user's subscription to find Stripe customer ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing', 'past_due', 'canceled'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const stripe = getStripeClient();

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripeCustomerId,
    });

    // Set as default if requested
    if (setAsDefault) {
      await stripe.customers.update(subscription.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update metadata on the payment method
      await stripe.paymentMethods.update(paymentMethodId, {
        metadata: { isDefault: 'true' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
} 