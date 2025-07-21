import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
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
        userId: userId,
        status: { in: ['active', 'trialing'] }
      }
    });

    if (!currentSubscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // For now, return success since Stripe is not fully integrated
    // In a real implementation, you would call Stripe API to change the subscription
    
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
      planId
    });

    // Real Stripe implementation would look like this:
    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const subscription = await stripe.subscriptions.update(
      currentSubscription.stripeSubscriptionId!,
      {
        items: [{
          id: currentSubscription.stripeSubscriptionId!,
          price: `price_${planId}_monthly`,
        }],
        proration_behavior: 'create_prorations',
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
      subscription: subscription
    });
    */
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to downgrade subscription' },
      { status: 500 }
    );
  }
} 