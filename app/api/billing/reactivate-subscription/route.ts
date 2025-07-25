import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing'] }
      }
    });

    if (!currentSubscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    if (!currentSubscription.cancelAtPeriodEnd) {
      return NextResponse.json({ error: 'Subscription is not scheduled for cancellation' }, { status: 400 });
    }

    if (!currentSubscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No Stripe subscription found' }, { status: 404 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Reactivate subscription in Stripe
    const subscription = await stripe.subscriptions.update(
      currentSubscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
        metadata: {
          userId: session.user.id,
          reactivatedAt: new Date().toISOString(),
        },
      }
    );

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: subscription
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
} 
