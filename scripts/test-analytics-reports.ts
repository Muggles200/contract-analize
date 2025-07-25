#!/usr/bin/env tsx

import { resolve } from 'path';

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('⚠️ Could not load .env.local file:', (error as Error).message);
}

import { prisma } from '../lib/db';

async function testAnalyticsReports() {
  console.log('🧪 Testing Analytics Reports Functionality...\n');

  try {
    // Test 1: Check if database tables exist
    console.log('1. Checking database schema...');
    
    const userCount = await prisma.user.count();
    const reportHistoryCount = await prisma.reportHistory.count();
    const scheduledReportCount = await prisma.scheduledReport.count();
    
    console.log(`   ✅ Found ${userCount} users in database`);
    console.log(`   ✅ Found ${reportHistoryCount} report history entries`);
    console.log(`   ✅ Found ${scheduledReportCount} scheduled reports`);
    
    // Test 2: Get first user for testing
    console.log('\n2. Getting test user...');
    
    const user = await prisma.user.findFirst({
      include: { 
        reportHistory: true,
        scheduledReports: true,
      },
    });
    
    if (!user) {
      console.log('   ❌ No users found in database');
      return;
    }
    
    console.log(`   ✅ Found user: ${user.email}`);
    console.log(`   📊 User has ${user.reportHistory.length} report history entries`);
    console.log(`   📅 User has ${user.scheduledReports.length} scheduled reports`);
    
    // Test 3: Test report generation
    console.log('\n3. Testing report generation...');
    
    const testReport = await prisma.reportHistory.create({
      data: {
        userId: user.id,
        reportName: 'Test Overview Report',
        template: 'overview',
        reportType: 'summary',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          end: new Date().toISOString(),
        },
        status: 'processing',
        metadata: {
          test: true,
          generatedAt: new Date().toISOString(),
        },
      },
    });
    
    console.log(`   ✅ Created test report with ID: ${testReport.id}`);
    
    // Test 4: Test report data generation
    console.log('\n4. Testing report data generation...');
    
    // Simulate the data generation process
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date();
    
    const where = {
      userId: user.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };
    
    // Generate overview data
    const [
      totalContracts,
      totalAnalyses,
      contractsThisPeriod,
      analysesThisPeriod,
      usageStats,
    ] = await Promise.all([
      prisma.contract.count({
        where: {
          userId: user.id,
          deletedAt: null,
        },
      }),
      prisma.analysisResult.count({
        where: {
          userId: user.id,
        },
      }),
      prisma.contract.count({
        where: {
          ...where,
          deletedAt: null,
        },
      }),
      prisma.analysisResult.count({ where }),
      prisma.usageLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),
    ]);
    
    console.log('   ✅ Generated overview data:');
    console.log(`      📄 Total contracts: ${totalContracts}`);
    console.log(`      🔍 Total analyses: ${totalAnalyses}`);
    console.log(`      📄 Contracts this period: ${contractsThisPeriod}`);
    console.log(`      🔍 Analyses this period: ${analysesThisPeriod}`);
    console.log(`      📊 Usage stats: ${usageStats.length} action types`);
    
    // Test 5: Test different report templates
    console.log('\n5. Testing different report templates...');
    
    const templates = ['overview', 'usage', 'performance', 'cost', 'risk'];
    
    for (const template of templates) {
      console.log(`   📋 Testing ${template} template...`);
      
      // Generate template-specific data
      let templateData: any = {};
      
      switch (template) {
        case 'overview':
          templateData = {
            totalContracts,
            totalAnalyses,
            contractsThisPeriod,
            analysesThisPeriod,
            usageStats,
          };
          break;
          
        case 'usage':
          const usageByAction = await prisma.usageLog.groupBy({
            by: ['action'],
            where,
            _count: { action: true },
          });
          templateData = { usageByAction };
          break;
          
        case 'performance':
          const performanceMetrics = await prisma.analysisResult.aggregate({
            where: {
              ...where,
              processingTime: { not: null },
            },
            _avg: { processingTime: true, confidenceScore: true },
          });
          templateData = { performanceMetrics };
          break;
          
        case 'cost':
          const costMetrics = await prisma.analysisResult.aggregate({
            where: {
              ...where,
              estimatedCost: { not: null },
            },
            _sum: { estimatedCost: true },
            _avg: { estimatedCost: true },
          });
          templateData = { costMetrics };
          break;
          
        case 'risk':
          const riskDistribution = await prisma.analysisResult.groupBy({
            by: ['highRiskCount', 'criticalRiskCount'],
            where: {
              ...where,
              highRiskCount: { not: null },
            },
            _count: { highRiskCount: true },
          });
          templateData = { riskDistribution };
          break;
      }
      
      console.log(`      ✅ Generated ${template} data with ${Object.keys(templateData).length} data points`);
    }
    
    // Test 6: Test report status updates
    console.log('\n6. Testing report status updates...');
    
    await prisma.reportHistory.update({
      where: { id: testReport.id },
      data: {
        status: 'completed',
        metadata: {
          ...(testReport.metadata as any || {}),
          completedAt: new Date().toISOString(),
          dataPoints: ['contracts', 'analyses', 'usage'],
        },
      },
    });
    
    const updatedReport = await prisma.reportHistory.findUnique({
      where: { id: testReport.id },
    });
    
    console.log(`   ✅ Updated report status to: ${updatedReport?.status}`);
    
    // Test 7: Test report statistics
    console.log('\n7. Testing report statistics...');
    
    const reportStats = await prisma.reportHistory.groupBy({
      by: ['status'],
      where: {
        userId: user.id,
      },
      _count: {
        status: true,
      },
    });
    
    console.log('   ✅ Report statistics:');
    reportStats.forEach(stat => {
      console.log(`      ${stat.status}: ${stat._count.status}`);
    });
    
    // Test 8: Test pagination
    console.log('\n8. Testing pagination...');
    
    const reports = await prisma.reportHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    console.log(`   ✅ Retrieved ${reports.length} reports with pagination`);
    
    // Test 9: Test report metadata
    console.log('\n9. Testing report metadata...');
    
    const reportWithMetadata = await prisma.reportHistory.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        reportName: true,
        template: true,
        reportType: true,
        dateRange: true,
        status: true,
        metadata: true,
        createdAt: true,
      },
    });
    
    if (reportWithMetadata) {
      console.log('   ✅ Report metadata:');
      console.log(`      Name: ${reportWithMetadata.reportName}`);
      console.log(`      Template: ${reportWithMetadata.template}`);
      console.log(`      Type: ${reportWithMetadata.reportType}`);
      console.log(`      Status: ${reportWithMetadata.status}`);
      console.log(`      Created: ${reportWithMetadata.createdAt.toISOString()}`);
    }
    
    // Test 10: Cleanup test data
    console.log('\n10. Cleaning up test data...');
    
    await prisma.reportHistory.delete({
      where: { id: testReport.id },
    });
    
    console.log('   ✅ Cleaned up test report');
    
    console.log('\n🎉 All analytics reports tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAnalyticsReports().catch(console.error); 