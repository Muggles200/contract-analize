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

    if (!currentSubscription.cancelAtPeriodEnd) {
      return NextResponse.json({ error: 'Subscription is not scheduled for cancellation' }, { status: 400 });
    }

    // For now, update the subscription to remove cancellation
    // In a real implementation, you would call Stripe API to reactivate the subscription
    
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });

    // Real Stripe implementation would look like this:
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const subscription = await stripe.subscriptions.update(
      currentSubscription.stripeSubscriptionId!,
      {
        cancel_at_period_end: false,
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
    */
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
} 