import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { 
  generateCSVExport, 
  generateJSONExport, 
  fetchReportData,
  ExportOptions 
} from '@/lib/export-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const exportRequest = await prisma.dataExportRequest.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!exportRequest) {
      return NextResponse.json(
        { error: 'Export request not found' },
        { status: 404 }
      );
    }

    if (exportRequest.status !== 'completed') {
      return NextResponse.json(
        { error: 'Export is not ready for download' },
        { status: 400 }
      );
    }

    if (!exportRequest.fileUrl) {
      return NextResponse.json(
        { error: 'Export file not found' },
        { status: 404 }
      );
    }

    // Check if export has expired
    if (exportRequest.expiresAt && new Date() > exportRequest.expiresAt) {
      // Mark as expired
      await prisma.dataExportRequest.update({
        where: { id: id },
        data: { status: 'expired' },
      });

      return NextResponse.json(
        { error: 'Export file has expired' },
        { status: 410 }
      );
    }

    // Log the download
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'data_export_downloaded',
        description: `Data export downloaded: ${exportRequest.type}`,
        metadata: {
          exportId: id,
          type: exportRequest.type,
          format: exportRequest.format,
        },
      },
    });

    // Generate real export data based on the export request
    const options: ExportOptions = {
      format: exportRequest.format as 'pdf' | 'csv' | 'json',
      template: 'data-export',
      dateRange: exportRequest.dateRange as { start: string; end: string },
      reportType: exportRequest.type,
      userId: user.id
    };

    let fileBuffer: Buffer;
    let contentType: string;

    switch (exportRequest.format) {
      case 'json':
        // Generate JSON export with all user data
        const jsonData = await generateUserDataExport(user.id, exportRequest.dataTypes as string[], options.dateRange);
        fileBuffer = await generateJSONExport(jsonData, options);
        contentType = 'application/json';
        break;

      case 'csv':
        // Generate CSV export with all user data
        const csvData = await generateUserDataForCSV(user.id, exportRequest.dataTypes as string[], options.dateRange);
        fileBuffer = await generateCSVExport(csvData, options);
        contentType = 'text/csv';
        break;

      case 'pdf':
        // Generate PDF export with report data
        const reportData = await fetchReportData(options);
        const { generatePDFReport } = await import('@/lib/export-utils');
        fileBuffer = await generatePDFReport(reportData, options);
        contentType = 'application/pdf';
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }

    const filename = `export-${exportRequest.id}.${exportRequest.format}`;
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate comprehensive user data for JSON export
async function generateUserDataExport(userId: string, dataTypes: string[], dateRange: { start: string; end: string }) {
  const where = {
    userId,
    createdAt: {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    }
  };

  const exportData: any = {
    user: await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })
  };

  // Add requested data types
  if (dataTypes.includes('contracts')) {
    exportData.contracts = await prisma.contract.findMany({
      where: { ...where, deletedAt: null },
      include: {
        analysisResults: true
      }
    });
  }

  if (dataTypes.includes('analyses')) {
    exportData.analyses = await prisma.analysisResult.findMany({
      where,
      include: {
        contract: {
          select: { fileName: true, fileSize: true }
        }
      }
    });
  }

  if (dataTypes.includes('usage')) {
    exportData.usage = await prisma.usageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  if (dataTypes.includes('activities')) {
    exportData.activities = await prisma.userActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  if (dataTypes.includes('preferences')) {
    exportData.preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });
    exportData.emailPreferences = await prisma.userEmailPreferences.findUnique({
      where: { userId }
    });
    exportData.notificationSettings = await prisma.userNotificationSettings.findUnique({
      where: { userId }
    });
  }

  return exportData;
}

// Generate user data formatted for CSV export
async function generateUserDataForCSV(userId: string, dataTypes: string[], dateRange: { start: string; end: string }) {
  const where = {
    userId,
    createdAt: {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    }
  };

  const csvData: any[] = [];

  if (dataTypes.includes('contracts')) {
    const contracts = await prisma.contract.findMany({
      where: { ...where, deletedAt: null },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    contracts.forEach(contract => {
      csvData.push({
        type: 'contract',
        id: contract.id,
        fileName: contract.fileName,
        fileSize: contract.fileSize,
        contractType: contract.contractType,
        uploadDate: contract.createdAt,
        lastAnalysisDate: contract.analysisResults[0]?.createdAt || null,
        analysisCount: contract.analysisResults.length,
        status: contract.analysisResults[0]?.status || 'not_analyzed'
      });
    });
  }

  if (dataTypes.includes('analyses')) {
    const analyses = await prisma.analysisResult.findMany({
      where,
      include: {
        contract: {
          select: { fileName: true }
        }
      }
    });

    analyses.forEach(analysis => {
      csvData.push({
        type: 'analysis',
        id: analysis.id,
        contractFileName: analysis.contract.fileName,
        analysisType: analysis.analysisType,
        status: analysis.status,
        processingTime: analysis.processingTime,
        tokensUsed: analysis.tokensUsed,
        estimatedCost: analysis.estimatedCost,
        highRiskCount: analysis.highRiskCount,
        criticalRiskCount: analysis.criticalRiskCount,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt
      });
    });
  }

  if (dataTypes.includes('usage')) {
    const usage = await prisma.usageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    usage.forEach(log => {
      csvData.push({
        type: 'usage',
        id: log.id,
        action: log.action,
        metadata: JSON.stringify(log.metadata),
        timestamp: log.createdAt
      });
    });
  }

  return csvData;
} 