import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  generatePDFReport, 
  generatePDFWithPuppeteer, 
  generateHTMLTemplate,
  fetchReportData,
  ExportOptions 
} from '@/lib/export-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { template, dateRange, reportType, organizationId, usePuppeteer = false } = body;

    // Validate required parameters
    if (!template || !dateRange || !reportType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate date range
    if (!dateRange.start || !dateRange.end) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    const options: ExportOptions = {
      format: 'pdf',
      template,
      dateRange,
      reportType,
      userId: session.user.id,
      organizationId
    };

    // Fetch real report data
    const reportData = await fetchReportData(options);

    let pdfBuffer: Buffer;

    if (usePuppeteer) {
      // Generate PDF using Puppeteer for more complex layouts
      const htmlContent = generateHTMLTemplate(reportData, options);
      pdfBuffer = await generatePDFWithPuppeteer(htmlContent, options);
    } else {
      // Generate PDF using jsPDF for simpler layouts
      pdfBuffer = await generatePDFReport(reportData, options);
    }

    const filename = `${template}-report-${dateRange.start}-${dateRange.end}-${reportType}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 