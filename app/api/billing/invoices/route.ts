import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get subscription to find Stripe customer ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing', 'past_due', 'canceled'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription?.stripeCustomerId) {
      // Return empty invoices if no subscription
      return NextResponse.json({
        invoices: [],
        total: 0,
        hasMore: false
      });
    }

    // For now, return mock invoice data since we don't have Stripe fully integrated
    // In a real implementation, you would fetch this from Stripe API
    const mockInvoices = [
      {
        id: 'inv_001',
        number: 'INV-2024-001',
        amount: 29.00,
        currency: 'usd',
        status: 'paid',
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Basic Plan - January 2024',
        pdfUrl: null,
        hostedInvoiceUrl: null
      },
      {
        id: 'inv_002',
        number: 'INV-2024-002',
        amount: 29.00,
        currency: 'usd',
        status: 'paid',
        created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Basic Plan - December 2023',
        pdfUrl: null,
        hostedInvoiceUrl: null
      }
    ];

    // Apply pagination
    const paginatedInvoices = mockInvoices.slice(offset, offset + limit);
    const hasMore = offset + limit < mockInvoices.length;

    return NextResponse.json({
      invoices: paginatedInvoices,
      total: mockInvoices.length,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
} 