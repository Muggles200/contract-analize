import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing', 'past_due'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get usage statistics for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const usageStats = await prisma.analysisResult.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
        createdAt: { gte: currentMonth }
      },
      _count: { id: true }
    });

    const contractsAnalyzed = usageStats.reduce((sum, stat) => {
      if (stat.status === 'COMPLETED') {
        return sum + stat._count.id;
      }
      return sum;
    }, 0);

    // Determine plan limits based on subscription
    let planLimits = {
      contractsLimit: 2, // Free tier
      plan: 'free'
    };

    if (subscription) {
      switch (subscription.stripePriceId) {
        case 'price_basic_monthly':
          planLimits = { contractsLimit: 10, plan: 'basic' };
          break;
        case 'price_pro_monthly':
          planLimits = { contractsLimit: 50, plan: 'pro' };
          break;
        case 'price_enterprise_monthly':
          planLimits = { contractsLimit: -1, plan: 'enterprise' }; // Unlimited
          break;
      }
    }

    const remainingContracts = planLimits.contractsLimit === -1 
      ? -1 
      : Math.max(0, planLimits.contractsLimit - contractsAnalyzed);

    return NextResponse.json({
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        plan: planLimits.plan,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        stripePriceId: subscription.stripePriceId
      } : null,
      usage: {
        contractsThisMonth: contractsAnalyzed,
        contractsLimit: planLimits.contractsLimit,
        remainingContracts,
        plan: planLimits.plan
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
} 
