import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const period = searchParams.get('period') || 'month' // week, month, year

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Build where clause
    const where: any = {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
      },
    }

    if (organizationId) {
      where.organizationId = organizationId
    }

    // Get overview statistics
    const [
      totalContracts,
      totalAnalyses,
      contractsThisPeriod,
      analysesThisPeriod,
      usageStats,
      recentActivity,
    ] = await Promise.all([
      // Total contracts (all time)
      prisma.contract.count({
        where: {
          userId: session.user.id,
          deletedAt: null,
          ...(organizationId && { organizationId }),
        },
      }),
      
      // Total analyses (all time)
      prisma.analysisResult.count({
        where: {
          userId: session.user.id,
          ...(organizationId && { organizationId }),
        },
      }),
      
      // Contracts this period
      prisma.contract.count({
        where: {
          ...where,
          deletedAt: null,
        },
      }),
      
      // Analyses this period
      prisma.analysisResult.count({
        where,
      }),
      
      // Usage statistics
      prisma.usageLog.groupBy({
        by: ['action'],
        where: {
          userId: session.user.id,
          createdAt: {
            gte: startDate,
          },
          ...(organizationId && { organizationId }),
        },
        _count: {
          action: true,
        },
        orderBy: {
          action: 'asc',
        },
      }),
      
      // Recent activity
      prisma.userActivity.findMany({
        where: {
          userId: session.user.id,
          ...(organizationId && { organizationId }),
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    // Calculate trends (mock data for now)
    const trends = {
      contracts: '+12%',
      analyses: '+8%',
      uploads: '+15%',
      views: '+5%',
    }

    return NextResponse.json({
      overview: {
        totalContracts,
        totalAnalyses,
        contractsThisPeriod,
        analysesThisPeriod,
        trends,
      },
      usage: usageStats,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 