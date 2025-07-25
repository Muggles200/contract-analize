import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      if (!stripe) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Get or create subscription in database
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
      },
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: subscription.status,
          currentPeriodStart: new Date(Number((subscription as any).current_period_start) * 1000),
          currentPeriodEnd: new Date(Number((subscription as any).current_period_end) * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          stripePriceId: subscription.items.data[0]?.price.id,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId: userId,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          status: subscription.status,
          currentPeriodStart: new Date(Number((subscription as any).current_period_start) * 1000),
          currentPeriodEnd: new Date(Number((subscription as any).current_period_end) * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
    }

    console.log(`Subscription created for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update subscription in database
    await prisma.subscription.updateMany({
      where: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(Number((subscription as any).current_period_start) * 1000),
        currentPeriodEnd: new Date(Number((subscription as any).current_period_end) * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripePriceId: subscription.items.data[0]?.price.id,
        updatedAt: new Date(),
      },
    });

    console.log(`Subscription updated for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update subscription status in database
    await prisma.subscription.updateMany({
      where: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: 'canceled',
        updatedAt: new Date(),
      },
    });

    console.log(`Subscription deleted for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!(invoice as any).subscription) return;
    if (!stripe) return;

    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update subscription status
    await prisma.subscription.updateMany({
      where: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: subscription.status,
        updatedAt: new Date(),
      },
    });

    console.log(`Payment succeeded for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!(invoice as any).subscription) return;
    if (!stripe) return;

    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update subscription status
    await prisma.subscription.updateMany({
      where: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: subscription.status,
        updatedAt: new Date(),
      },
    });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // You could send an email notification here
    console.log(`Trial will end for user ${userId}`);
  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
} 