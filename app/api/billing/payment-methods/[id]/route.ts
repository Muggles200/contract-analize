import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { setAsDefault = false } = body;

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

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    if (paymentMethod.customer !== subscription.stripeCustomerId) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    if (setAsDefault) {
      // Update customer's default payment method
      await stripe.customers.update(subscription.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: id,
        },
      });

      // Update metadata on all payment methods to clear previous default
      const allPaymentMethods = await stripe.paymentMethods.list({
        customer: subscription.stripeCustomerId,
        type: 'card',
      });

      for (const pm of allPaymentMethods.data) {
        await stripe.paymentMethods.update(pm.id, {
          metadata: { isDefault: pm.id === id ? 'true' : 'false' },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    if (paymentMethod.customer !== subscription.stripeCustomerId) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Check if this is the default payment method
    if (paymentMethod.metadata?.isDefault === 'true') {
      return NextResponse.json(
        { error: 'Cannot delete default payment method. Please set another payment method as default first.' },
        { status: 400 }
      );
    }

    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
} 