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
    const groupBy = searchParams.get('groupBy') || 'day' // day, week, month

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

    // Get usage statistics grouped by action
    const usageByAction = await prisma.usageLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true,
      },
    })

    // Get usage statistics over time
    const usageOverTime = await prisma.usageLog.groupBy({
      by: ['action', 'createdAt'],
      where,
      _count: {
        action: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Get contract type distribution
    const contractTypes = await prisma.contract.groupBy({
      by: ['contractType'],
      where: {
        userId: session.user.id,
        deletedAt: null,
        createdAt: {
          gte: startDate,
        },
        ...(organizationId && { organizationId }),
      },
      _count: {
        contractType: true,
      },
    })

    // Get analysis type distribution
    const analysisTypes = await prisma.analysisResult.groupBy({
      by: ['analysisType'],
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
        ...(organizationId && { organizationId }),
      },
      _count: {
        analysisType: true,
      },
    })

    // Get performance metrics
    const performanceMetrics = await prisma.analysisResult.aggregate({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
        processingTime: {
          not: null,
        },
        ...(organizationId && { organizationId }),
      },
      _avg: {
        processingTime: true,
        confidenceScore: true,
      },
      _min: {
        processingTime: true,
      },
      _max: {
        processingTime: true,
      },
    })

    // Process time series data
    const timeSeriesData = usageOverTime.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {}
      }
      acc[date][item.action] = item._count.action
      return acc
    }, {} as Record<string, Record<string, number>>)

    return NextResponse.json({
      usageByAction,
      timeSeriesData,
      contractTypes,
      analysisTypes,
      performanceMetrics,
      period,
      startDate,
      endDate: now,
    })
  } catch (error) {
    console.error('Error fetching usage analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 