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

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
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

    if (!currentSubscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No Stripe subscription found' }, { status: 404 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Update subscription in Stripe
    const subscription = await stripe?.subscriptions.update(
      currentSubscription.stripeSubscriptionId,
      {
        items: [{
          id: currentSubscription.stripeSubscriptionId,
          price: `price_${planId}_monthly`,
        }],
        proration_behavior: 'create_prorations',
        metadata: {
          userId: session.user.id,
          planId: planId,
        },
      }
    );

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        stripePriceId: `price_${planId}_monthly`,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription downgraded successfully',
      planId,
      subscription: subscription
    });
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to downgrade subscription' },
      { status: 500 }
    );
  }
} 
