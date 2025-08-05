import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for consent preferences
const consentSchema = z.object({
  preferences: z.object({
    necessary: z.boolean(),
    analytics: z.boolean(),
    marketing: z.boolean(),
    functional: z.boolean(),
  }),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().nullable(),
});

const updateConsentSchema = z.object({
  preferences: z.object({
    necessary: z.boolean(),
    analytics: z.boolean(),
    marketing: z.boolean(),
    functional: z.boolean(),
  }),
});

// GET - Retrieve user's current consent preferences
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      // For non-authenticated users, return null (they'll use localStorage)
      return NextResponse.json({ consent: null });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cookieConsent: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || !user.cookieConsent.length) {
      return NextResponse.json({ consent: null });
    }

    const latestConsent = user.cookieConsent[0];
    
    return NextResponse.json({
      consent: {
        preferences: latestConsent.preferences,
        timestamp: latestConsent.createdAt,
        version: latestConsent.version,
      },
    });

  } catch (error) {
    console.error('Error fetching consent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save new consent preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = consentSchema.parse(body);

    // Get IP address from request headers
    const ipAddress = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown';

    const session = await auth();

    // For authenticated users, save to database
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        // Save consent record
        const consentRecord = await prisma.cookieConsent.create({
          data: {
            userId: user.id,
            preferences: validatedData.preferences,
            ipAddress,
            userAgent: validatedData.userAgent || request.headers.get('user-agent') || 'unknown',
            version: '1.0', // Cookie policy version
          },
        });

        // Log the consent activity
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            activityType: 'cookie_consent_given',
            description: 'User provided cookie consent preferences',
            metadata: {
              preferences: validatedData.preferences,
              consentId: consentRecord.id,
              ipAddress,
            },
          },
        });

        return NextResponse.json({
          message: 'Consent saved successfully',
          consentId: consentRecord.id,
        });
      }
    }

    // For non-authenticated users or if database save fails, 
    // still return success (they'll use localStorage)
    return NextResponse.json({
      message: 'Consent preferences received',
      consentId: null,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error saving consent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing consent preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateConsentSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get IP address from request headers
    const ipAddress = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown';

    // Create new consent record (we keep history)
    const consentRecord = await prisma.cookieConsent.create({
      data: {
        userId: user.id,
        preferences: validatedData.preferences,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        version: '1.0',
      },
    });

    // Log the consent update activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'cookie_consent_updated',
        description: 'User updated cookie consent preferences',
        metadata: {
          preferences: validatedData.preferences,
          consentId: consentRecord.id,
          ipAddress,
        },
      },
    });

    return NextResponse.json({
      message: 'Consent updated successfully',
      consentId: consentRecord.id,
      preferences: validatedData.preferences,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error updating consent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Withdraw consent (for GDPR compliance)
export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a consent withdrawal record
    const withdrawalRecord = await prisma.cookieConsent.create({
      data: {
        userId: user.id,
        preferences: {
          necessary: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        ipAddress: 'consent-withdrawn',
        userAgent: 'consent-withdrawn',
        version: '1.0',
      },
    });

    // Log the consent withdrawal
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'cookie_consent_withdrawn',
        description: 'User withdrew cookie consent',
        metadata: {
          consentId: withdrawalRecord.id,
          reason: 'user_request',
        },
      },
    });

    return NextResponse.json({
      message: 'Consent withdrawn successfully',
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
      },
    });

  } catch (error) {
    console.error('Error withdrawing consent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 