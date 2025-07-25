import { NextRequest, NextResponse } from 'next/server'; 
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/utils/unsubscribe';

// Validation schema for unsubscribe request
const unsubscribeSchema = z.object({
  token: z.string(),
  emailType: z.enum(['marketing', 'security', 'analysis', 'billing', 'weekly', 'all']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const emailType = searchParams.get('type') as any;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing unsubscribe token' },
        { status: 400 }
      );
    }

    // Find user by token (this is a simplified approach - in production you'd store tokens)
    // For now, we'll decode the token to get user info
    const users = await prisma.user.findMany({
      include: { emailPreferences: true },
    });

    let targetUser = null;
    let targetEmailType = emailType || 'all';

    // Find user by verifying token against all users (not efficient, but works for demo)
    for (const user of users) {
      if (verifyUnsubscribeToken(token, user.id, targetEmailType)) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 400 }
      );
    }

    // Update email preferences based on unsubscribe type
    const updateData: any = {};
    
    if (targetEmailType === 'all') {
      updateData.marketing = false;
      updateData.security = false;
      updateData.analysis = false;
      updateData.billing = false;
      updateData.weekly = false;
    } else {
      updateData[targetEmailType] = false;
    }

    await prisma.userEmailPreferences.upsert({
      where: { userId: targetUser.id },
      update: updateData,
      create: {
        userId: targetUser.id,
        marketing: targetEmailType === 'all' ? false : (targetEmailType === 'marketing' ? false : true),
        security: targetEmailType === 'all' ? false : (targetEmailType === 'security' ? false : true),
        analysis: targetEmailType === 'all' ? false : (targetEmailType === 'analysis' ? false : true),
        billing: targetEmailType === 'all' ? false : (targetEmailType === 'billing' ? false : true),
        weekly: targetEmailType === 'all' ? false : (targetEmailType === 'weekly' ? false : true),
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: targetUser.id,
        activityType: 'email_unsubscribed',
        description: `Unsubscribed from ${targetEmailType} emails`,
        metadata: {
          emailType: targetEmailType,
          token: token,
        },
      },
    });

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: targetUser.id,
        eventType: 'email_unsubscribed',
        eventData: {
          emailType: targetEmailType,
          method: 'web_link',
        },
      },
    });

    // Return HTML page for unsubscribe confirmation
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed Successfully</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
          }
          .icon {
            width: 64px;
            height: 64px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            color: white;
            font-size: 32px;
          }
          h1 {
            color: #111827;
            margin-bottom: 16px;
            font-size: 24px;
            font-weight: 600;
          }
          p {
            color: #6b7280;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .button {
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          .button:hover {
            background: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✓</div>
          <h1>Successfully Unsubscribed</h1>
          <p>
            You have been successfully unsubscribed from ${targetEmailType === 'all' ? 'all emails' : `${targetEmailType} emails`}.
            You can manage your email preferences anytime from your account settings.
          </p>
          <a href="/dashboard/profile" class="button">Manage Email Preferences</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error processing unsubscribe request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = unsubscribeSchema.parse(body);

    // Find user by token (same logic as GET)
    const users = await prisma.user.findMany({
      include: { emailPreferences: true },
    });

    let targetUser = null;
    let targetEmailType = validatedData.emailType || 'all';

    for (const user of users) {
      if (verifyUnsubscribeToken(validatedData.token, user.id, targetEmailType)) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 400 }
      );
    }

    // Update email preferences
    const updateData: any = {};
    
    if (targetEmailType === 'all') {
      updateData.marketing = false;
      updateData.security = false;
      updateData.analysis = false;
      updateData.billing = false;
      updateData.weekly = false;
    } else {
      updateData[targetEmailType] = false;
    }

    await prisma.userEmailPreferences.upsert({
      where: { userId: targetUser.id },
      update: updateData,
      create: {
        userId: targetUser.id,
        marketing: targetEmailType === 'all' ? false : (targetEmailType === 'marketing' ? false : true),
        security: targetEmailType === 'all' ? false : (targetEmailType === 'security' ? false : true),
        analysis: targetEmailType === 'all' ? false : (targetEmailType === 'analysis' ? false : true),
        billing: targetEmailType === 'all' ? false : (targetEmailType === 'billing' ? false : true),
        weekly: targetEmailType === 'all' ? false : (targetEmailType === 'weekly' ? false : true),
      },
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: targetUser.id,
        activityType: 'email_unsubscribed',
        description: `Unsubscribed from ${targetEmailType} emails via API`,
        metadata: {
          emailType: targetEmailType,
          token: validatedData.token,
        },
      },
    });

    return NextResponse.json({
      message: 'Successfully unsubscribed',
      emailType: targetEmailType,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error processing unsubscribe request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 