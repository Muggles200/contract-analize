import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { analysisIds, format = 'pdf' } = body;

    if (!analysisIds || !Array.isArray(analysisIds) || analysisIds.length === 0) {
      return NextResponse.json(
        { error: 'Analysis IDs are required' },
        { status: 400 }
      );
    }

    if (!['pdf', 'csv', 'json', 'excel'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      );
    }

    // Fetch analyses with their results
    const analyses = await prisma.analysisResult.findMany({
      where: {
        id: { in: analysisIds },
        userId: session.user.id
      },
      include: {
        contract: {
          select: {
            fileName: true,
            fileSize: true,
            metadata: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (analyses.length === 0) {
      return NextResponse.json(
        { error: 'No analyses found' },
        { status: 404 }
      );
    }

    // Prepare export data
    const exportData = {
      analyses: analyses.map(analysis => ({
        id: analysis.id,
        status: analysis.status,
        analysisType: analysis.analysisType,
        createdAt: analysis.createdAt,
        contract: analysis.contract,
        results: analysis.results,
        customParameters: analysis.customParameters,
      })),
      exportInfo: {
        exportedAt: new Date().toISOString(),
        totalAnalyses: analyses.length,
        format,
        userId: session.user.id,
      }
    };

    let exportContent: Buffer;
    let contentType: string;
    let fileName: string;

    // Generate export based on format
    switch (format) {
      case 'json':
        exportContent = Buffer.from(JSON.stringify(exportData, null, 2));
        contentType = 'application/json';
        fileName = `analysis-export-${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'csv':
        // Simple CSV export
        const csvHeaders = ['ID', 'Status', 'Analysis Type', 'Created At', 'Contract Name', 'File Size'];
        const csvRows = analyses.map(analysis => [
          analysis.id,
          analysis.status,
          analysis.analysisType,
          analysis.createdAt.toISOString(),
          analysis.contract.fileName,
          Number(analysis.contract.fileSize)
        ]);
        const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
        exportContent = Buffer.from(csvContent);
        contentType = 'text/csv';
        fileName = `analysis-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'excel':
        // For Excel, we'll use CSV format but with .xlsx extension
        const excelHeaders = ['ID', 'Status', 'Analysis Type', 'Created At', 'Contract Name', 'File Size'];
        const excelRows = analyses.map(analysis => [
          analysis.id,
          analysis.status,
          analysis.analysisType,
          analysis.createdAt.toISOString(),
          analysis.contract.fileName,
          Number(analysis.contract.fileSize)
        ]);
        const excelContent = [excelHeaders, ...excelRows].map(row => row.join(',')).join('\n');
        exportContent = Buffer.from(excelContent);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `analysis-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;

      case 'pdf':
        // Simple text-based PDF export
        const pdfContent = `Analysis Results Export\n\n` +
          `Generated: ${new Date().toLocaleString()}\n` +
          `Total Analyses: ${analyses.length}\n\n` +
          analyses.map(analysis => 
            `ID: ${analysis.id}\n` +
            `Status: ${analysis.status}\n` +
            `Type: ${analysis.analysisType}\n` +
            `Contract: ${analysis.contract.fileName}\n` +
            `Created: ${analysis.createdAt.toLocaleString()}\n` +
            `---`
          ).join('\n\n');
        exportContent = Buffer.from(pdfContent);
        contentType = 'application/pdf';
        fileName = `analysis-export-${new Date().toISOString().split('T')[0]}.pdf`;
        break;

      default:
        throw new Error('Unsupported export format');
    }

    // Log the export activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        activityType: 'analysis_exported',
        description: `Exported ${analyses.length} analysis results`,
        metadata: {
          analysisIds,
          format,
          exportCount: analyses.length,
          fileName,
        },
      },
    });

    return new NextResponse(exportContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Analysis export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analysis results' },
      { status: 500 }
    );
  }
} 