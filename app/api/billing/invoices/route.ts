import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getStripeClient, getInvoicesForCustomer } from '@/lib/stripe';

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

    // Fetch invoices from Stripe
    const { invoices, hasMore } = await getInvoicesForCustomer(
      subscription.stripeCustomerId,
      limit,
      offset > 0 ? `inv_${offset}` : undefined
    );

    // Transform Stripe invoices to our format
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000).toISOString(),
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      description: invoice.description || 'Invoice for subscription',
      pdfUrl: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      total: invoices.length,
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
