import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const signature = headersList.get('resend-signature');
    const payload = await request.text();

    // Verify webhook signature
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!signature || !verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    // Handle different webhook events
    switch (event.type) {
      case 'email.delivered':
        await handleEmailDelivered(event);
        break;
      
      case 'email.delivery_delayed':
        await handleEmailDeliveryDelayed(event);
        break;
      
      case 'email.bounced':
        await handleEmailBounced(event);
        break;
      
      case 'email.complained':
        await handleEmailComplained(event);
        break;
      
      case 'email.opened':
        await handleEmailOpened(event);
        break;
      
      case 'email.clicked':
        await handleEmailClicked(event);
        break;
      
      case 'email.unsubscribed':
        await handleEmailUnsubscribed(event);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Resend webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleEmailDelivered(event: any) {
  console.log('Email delivered:', event.data.email_id);
  
  // Log email delivery event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'email_delivered',
      eventData: {
        emailId: event.data.email_id,
        to: event.data.to,
        from: event.data.from,
        subject: event.data.subject,
        timestamp: event.data.created_at,
      },
    },
  });
}

async function handleEmailDeliveryDelayed(event: any) {
  console.log('Email delivery delayed:', event.data.email_id);
  
  // Log email delivery delay event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'email_delivery_delayed',
      eventData: {
        emailId: event.data.email_id,
        to: event.data.to,
        from: event.data.from,
        subject: event.data.subject,
        reason: event.data.reason,
        timestamp: event.data.created_at,
      },
    },
  });
}

async function handleEmailBounced(event: any) {
  console.log('Email bounced:', event.data.email_id);
  
  // Log email bounce event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'email_bounced',
      eventData: {
        emailId: event.data.email_id,
        to: event.data.to,
        from: event.data.from,
        subject: event.data.subject,
        reason: event.data.reason,
        timestamp: event.data.created_at,
      },
    },
  });

  // Update user email preferences if this is a hard bounce
  if (event.data.reason === 'hard_bounce') {
    const user = await prisma.user.findFirst({
      where: { email: event.data.to },
    });

    if (user) {
      // Disable email notifications for this user
      await prisma.userEmailPreferences.upsert({
        where: { userId: user.id },
        update: {
          marketing: false,
          security: false,
          analysis: false,
          billing: false,
          weekly: false,
        },
        create: {
          userId: user.id,
          marketing: false,
          security: false,
          analysis: false,
          billing: false,
          weekly: false,
        },
      });

      // Log the activity
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'email_bounce_detected',
          description: 'Email notifications disabled due to hard bounce',
          metadata: {
            emailId: event.data.email_id,
            reason: event.data.reason,
          },
        },
      });
    }
  }
}

async function handleEmailComplained(event: any) {
  console.log('Email complained:', event.data.email_id);
  
  // Log email complaint event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'email_complained',
      eventData: {
        emailId: event.data.email_id,
        to: event.data.to,
        from: event.data.from,
        subject: event.data.subject,
        timestamp: event.data.created_at,
      },
    },
  });

  // Update user email preferences to disable marketing emails
  const user = await prisma.user.findFirst({
    where: { email: event.data.to },
  });

  if (user) {
    await prisma.userEmailPreferences.upsert({
      where: { userId: user.id },
      update: {
        marketing: false,
      },
      create: {
        userId: user.id,
        marketing: false,
        security: true,
        analysis: true,
        billing: true,
        weekly: false,
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'email_complaint_received',
        description: 'Marketing emails disabled due to complaint',
        metadata: {
          emailId: event.data.email_id,
        },
      },
    });
  }
}

async function handleEmailOpened(event: any) {
  console.log('Email opened:', event.data.email_id);
  
  // Log email open event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'email_opened',
      eventData: {
        emailId: event.data.email_id,
        to: event.data.to,
        from: event.data.from,
        subject: event.data.subject,
        timestamp: event.data.created_at,
      },
    },
  });
}

async function handleEmailClicked(event: any) {
  console.log('Email clicked:', event.data.email_id);
  
  // Log email click event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'email_clicked',
      eventData: {
        emailId: event.data.email_id,
        to: event.data.to,
        from: event.data.from,
        subject: event.data.subject,
        url: event.data.url,
        timestamp: event.data.created_at,
      },
    },
  });
}

async function handleEmailUnsubscribed(event: any) {
  console.log('Email unsubscribed:', event.data.email_id);
  
  // Log email unsubscribe event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'email_unsubscribed',
      eventData: {
        emailId: event.data.email_id,
        to: event.data.to,
        from: event.data.from,
        subject: event.data.subject,
        timestamp: event.data.created_at,
      },
    },
  });

  // Update user email preferences to disable all emails
  const user = await prisma.user.findFirst({
    where: { email: event.data.to },
  });

  if (user) {
    await prisma.userEmailPreferences.upsert({
      where: { userId: user.id },
      update: {
        marketing: false,
        security: false,
        analysis: false,
        billing: false,
        weekly: false,
      },
      create: {
        userId: user.id,
        marketing: false,
        security: false,
        analysis: false,
        billing: false,
        weekly: false,
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'email_unsubscribed',
        description: 'All email notifications disabled due to unsubscribe',
        metadata: {
          emailId: event.data.email_id,
        },
      },
    });
  }
} 