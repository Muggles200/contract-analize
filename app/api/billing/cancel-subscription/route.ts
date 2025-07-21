import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: { in: ['active', 'trialing'] }
      }
    });

    if (!currentSubscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // For now, update the subscription to cancel at period end
    // In a real implementation, you would call Stripe API to cancel the subscription
    
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period'
    });

    // Real Stripe implementation would look like this:
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const subscription = await stripe.subscriptions.update(
      currentSubscription.stripeSubscriptionId!,
      {
        cancel_at_period_end: true,
      }
    );

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      subscription: subscription
    });
    */
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 