import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: analysisId } = await params;
    const body = await request.json();
    const { format = 'pdf' } = body;

    // Validate format
    const validFormats = ['pdf', 'excel', 'json', 'summary'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      );
    }

    // Get analysis result
    const analysis = await prisma.analysisResult.findFirst({
      where: {
        id: analysisId,
        status: 'COMPLETED',
        OR: [
          { userId: session.user.id },
          { organizationId: session.user.organizationId }
        ]
      },
      include: {
        contract: {
          select: {
            fileName: true,
            fileSize: true,
            createdAt: true,
            metadata: true
          }
        }
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found or not completed' },
        { status: 404 }
      );
    }

    // Generate export based on format
    let exportData: any;
    let contentType: string;
    let fileName: string;

    switch (format) {
      case 'pdf':
        exportData = await generatePDFExport(analysis);
        contentType = 'application/pdf';
        fileName = `analysis-${analysisId}.pdf`;
        break;

      case 'excel':
        exportData = await generateExcelExport(analysis);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `analysis-${analysisId}.xlsx`;
        break;

      case 'json':
        exportData = await generateJSONExport(analysis);
        contentType = 'application/json';
        fileName = `analysis-${analysisId}.json`;
        break;

      case 'summary':
        exportData = await generateSummaryExport(analysis);
        contentType = 'text/plain';
        fileName = `analysis-${analysisId}-summary.txt`;
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }

    // Create response with appropriate headers
    const response = new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    });

    return response;

  } catch (error) {
    console.error('Error exporting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to export analysis' },
      { status: 500 }
    );
  }
}

/**
 * Generate PDF export
 */
async function generatePDFExport(analysis: any): Promise<Buffer> {
  // In a real implementation, you would use a library like puppeteer or jsPDF
  // to generate a proper PDF report
  
  const pdfContent = `
Analysis Report
==============

Contract: ${analysis.contract.fileName}
Analysis Type: ${analysis.analysisType}
Date: ${analysis.completedAt?.toLocaleDateString()}
Processing Time: ${analysis.processingTime ? Math.round(analysis.processingTime / 1000) : 0}s
Confidence Score: ${analysis.confidenceScore ? Math.round(analysis.confidenceScore * 100) : 0}%

Executive Summary
================
${analysis.summary || 'No summary available'}

Key Statistics
==============
- Total Clauses: ${analysis.totalClauses || 0}
- Total Risks: ${analysis.totalRisks || 0}
- Total Recommendations: ${analysis.totalRecommendations || 0}
- High Risk Count: ${analysis.highRiskCount || 0}
- Critical Risk Count: ${analysis.criticalRiskCount || 0}

Detailed Results
===============
${JSON.stringify(analysis.results, null, 2)}
  `;

  // For now, return a simple text buffer (in production, generate actual PDF)
  return Buffer.from(pdfContent, 'utf-8');
}

/**
 * Generate Excel export
 */
async function generateExcelExport(analysis: any): Promise<Buffer> {
  // In a real implementation, you would use a library like exceljs or xlsx
  // to generate a proper Excel file with multiple sheets
  
  const excelData = {
    summary: {
      contract: analysis.contract.fileName,
      analysisType: analysis.analysisType,
      date: analysis.completedAt?.toLocaleDateString(),
      processingTime: analysis.processingTime ? Math.round(analysis.processingTime / 1000) : 0,
      confidenceScore: analysis.confidenceScore ? Math.round(analysis.confidenceScore * 100) : 0,
      summary: analysis.summary
    },
    clauses: analysis.results?.clauses || [],
    risks: analysis.results?.risks || [],
    recommendations: analysis.results?.recommendations || []
  };

  // For now, return JSON as CSV-like format (in production, generate actual Excel)
  const csvContent = Object.entries(excelData).map(([sheet, data]) => {
    if (Array.isArray(data)) {
      if (data.length === 0) return `${sheet}\nNo data available\n`;
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => Object.values(item).join(','));
      return `${sheet}\n${headers}\n${rows.join('\n')}\n`;
    } else {
      return `${sheet}\n${JSON.stringify(data, null, 2)}\n`;
    }
  }).join('\n');

  return Buffer.from(csvContent, 'utf-8');
}

/**
 * Generate JSON export
 */
async function generateJSONExport(analysis: any): Promise<Buffer> {
  const exportData = {
    metadata: {
      id: analysis.id,
      contractId: analysis.contractId,
      analysisType: analysis.analysisType,
      status: analysis.status,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
      processingTime: analysis.processingTime,
      tokensUsed: analysis.tokensUsed,
      estimatedCost: analysis.estimatedCost,
      confidenceScore: analysis.confidenceScore
    },
    contract: analysis.contract,
    summary: analysis.summary,
    results: analysis.results,
    statistics: {
      totalClauses: analysis.totalClauses,
      totalRisks: analysis.totalRisks,
      totalRecommendations: analysis.totalRecommendations,
      highRiskCount: analysis.highRiskCount,
      criticalRiskCount: analysis.criticalRiskCount
    }
  };

  return Buffer.from(JSON.stringify(exportData, null, 2), 'utf-8');
}

/**
 * Generate summary export
 */
async function generateSummaryExport(analysis: any): Promise<Buffer> {
  const summaryContent = `
CONTRACT ANALYSIS SUMMARY
=========================

Contract Information:
- File Name: ${analysis.contract.fileName}
- Analysis Type: ${analysis.analysisType}
- Analysis Date: ${analysis.completedAt?.toLocaleDateString()}
- Processing Time: ${analysis.processingTime ? Math.round(analysis.processingTime / 1000) : 0} seconds
- Confidence Score: ${analysis.confidenceScore ? Math.round(analysis.confidenceScore * 100) : 0}%

EXECUTIVE SUMMARY
================
${analysis.summary || 'No summary available'}

KEY FINDINGS
===========
- Total Clauses Identified: ${analysis.totalClauses || 0}
- Total Risks Detected: ${analysis.totalRisks || 0}
- Total Recommendations: ${analysis.totalRecommendations || 0}
- High Priority Risks: ${analysis.highRiskCount || 0}
- Critical Risks: ${analysis.criticalRiskCount || 0}

RISK ASSESSMENT
==============
${analysis.results?.risks?.length > 0 
  ? analysis.results.risks.map((risk: any, index: number) => 
      `${index + 1}. ${risk.title} (${risk.severity.toUpperCase()})\n   ${risk.description}\n`
    ).join('\n')
  : 'No risks identified'
}

TOP RECOMMENDATIONS
==================
${analysis.results?.recommendations?.length > 0
  ? analysis.results.recommendations
      .filter((rec: any) => rec.priority === 'high')
      .slice(0, 5)
      .map((rec: any, index: number) =>
        `${index + 1}. ${rec.title}\n   ${rec.description}\n`
      ).join('\n')
  : 'No high-priority recommendations'
}

IMPORTANT CLAUSES
================
${analysis.results?.clauses?.length > 0
  ? analysis.results.clauses
      .filter((clause: any) => clause.importance === 'high')
      .slice(0, 5)
      .map((clause: any, index: number) =>
        `${index + 1}. ${clause.title} (${clause.category})\n   ${clause.description}\n`
      ).join('\n')
  : 'No high-importance clauses identified'
}

---
Generated on: ${new Date().toLocaleString()}
Analysis ID: ${analysis.id}
  `;

  return Buffer.from(summaryContent, 'utf-8');
} 