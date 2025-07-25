import { jsPDF } from 'jspdf';
import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';
import { prisma } from './db';
import { formatCurrency } from './stripe';
import { AnalysisStatus } from './generated/prisma';

export interface ReportData {
  overview?: any;
  usage?: any;
  performance?: any;
  cost?: any;
  risk?: any;
  custom?: any;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  template: string;
  dateRange: { start: string; end: string };
  reportType: string;
  userId: string;
  organizationId?: string;
}

// Generate PDF report using jsPDF
export async function generatePDFReport(data: ReportData, options: ExportOptions): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Contract Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Add report metadata
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Type: ${options.reportType}`, margin, yPosition);
  yPosition += 10;
  doc.text(`Date Range: ${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}`, margin, yPosition);
  yPosition += 10;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 20;

  // Add overview section
  if (data.overview) {
    yPosition = addSection(doc, 'Overview', data.overview, yPosition, pageWidth, margin);
  }

  // Add usage section
  if (data.usage) {
    yPosition = addSection(doc, 'Usage Analytics', data.usage, yPosition, pageWidth, margin);
  }

  // Add performance section
  if (data.performance) {
    yPosition = addSection(doc, 'Performance Metrics', data.performance, yPosition, pageWidth, margin);
  }

  // Add cost section
  if (data.cost) {
    yPosition = addSection(doc, 'Cost Analysis', data.cost, yPosition, pageWidth, margin);
  }

  // Add risk section
  if (data.risk) {
    yPosition = addSection(doc, 'Risk Assessment', data.risk, yPosition, pageWidth, margin);
  }

  // Add footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Generated by Contract Analize', pageWidth / 2, pageHeight - 10, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

// Generate PDF using Puppeteer (for more complex layouts)
export async function generatePDFWithPuppeteer(htmlContent: string, options: ExportOptions): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// Generate CSV export
export async function generateCSVExport(data: any[], options: ExportOptions): Promise<Buffer> {
  if (!data || data.length === 0) {
    return Buffer.from('No data available');
  }

  const headers = Object.keys(data[0]).map(key => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  }));

  const csvWriter = createObjectCsvWriter({
    path: 'temp-export.csv',
    header: headers
  });

  await csvWriter.writeRecords(data);

  // Read the file and return as buffer
  const fs = require('fs');
  const csvContent = fs.readFileSync('temp-export.csv', 'utf8');
  fs.unlinkSync('temp-export.csv'); // Clean up

  return Buffer.from(csvContent);
}

// Generate JSON export
export async function generateJSONExport(data: any, options: ExportOptions): Promise<Buffer> {
  const exportData = {
    metadata: {
      exportType: options.reportType,
      dateRange: options.dateRange,
      generatedAt: new Date().toISOString(),
      userId: options.userId,
      organizationId: options.organizationId
    },
    data: data
  };

  return Buffer.from(JSON.stringify(exportData, null, 2));
}

// Helper function to add sections to PDF
function addSection(doc: jsPDF, title: string, data: any, yPosition: number, pageWidth: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }

  // Add section title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPosition);
  yPosition += 15;

  // Add section content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      
      const text = `${key}: ${formatValue(value)}`;
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      
      for (const line of lines) {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    }
  } else {
    const text = String(data);
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    for (const line of lines) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    }
  }

  return yPosition + 10;
}

// Helper function to format values for PDF
function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

// Fetch real data for reports
export async function fetchReportData(options: ExportOptions): Promise<ReportData> {
  const where = {
    userId: options.userId,
    createdAt: {
      gte: new Date(options.dateRange.start),
      lte: new Date(options.dateRange.end)
    }
  };

  const [contracts, analyses, usageStats] = await Promise.all([
    prisma.contract.findMany({
      where: { ...where, deletedAt: null },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    }),
    prisma.analysisResult.findMany({
      where,
      include: {
        contract: {
          select: { fileName: true }
        }
      }
    }),
    prisma.usageLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true }
    })
  ]);

  const overview = {
    totalContracts: contracts.length,
    totalAnalyses: analyses.length,
    averageAnalysisTime: analyses.length > 0 ? 
      analyses.reduce((sum, a) => sum + (a.processingTime || 0), 0) / analyses.length : 0,
    successRate: analyses.length > 0 ? 
      (analyses.filter(a => a.status === AnalysisStatus.COMPLETED).length / analyses.length * 100).toFixed(1) + '%' : '0%'
  };

  const usage = {
    uploads: usageStats.find(s => s.action === 'contract_upload')?._count.action || 0,
    analyses: usageStats.find(s => s.action === 'analysis_started')?._count.action || 0,
    exports: usageStats.find(s => s.action === 'export_downloaded')?._count.action || 0,
    logins: usageStats.find(s => s.action === 'user_login')?._count.action || 0
  };

  const performance = {
    averageTokensUsed: analyses.length > 0 ? 
      analyses.reduce((sum, a) => sum + (a.tokensUsed || 0), 0) / analyses.length : 0,
    totalCost: analyses.reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0),
    fastestAnalysis: Math.min(...analyses.map(a => a.processingTime || 0)),
    slowestAnalysis: Math.max(...analyses.map(a => a.processingTime || 0))
  };

  const risk = {
    highRiskContracts: analyses.filter(a => (a.highRiskCount || 0) > 0).length,
    criticalRiskContracts: analyses.filter(a => (a.criticalRiskCount || 0) > 0).length,
    totalRisks: analyses.reduce((sum, a) => sum + (a.highRiskCount || 0) + (a.criticalRiskCount || 0), 0),
    riskiestContract: contracts.find(c => 
      c.analysisResults[0]?.highRiskCount === Math.max(...analyses.map(a => a.highRiskCount || 0))
    )?.fileName || 'N/A'
  };

  return {
    overview,
    usage,
    performance,
    risk
  };
}

// Generate HTML template for Puppeteer
export function generateHTMLTemplate(data: ReportData, options: ExportOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Contract Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
        .metric-label { font-size: 12px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Contract Analysis Report</h1>
        <p>Report Type: ${options.reportType} | Date Range: ${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>

      ${data.overview ? `
        <div class="section">
          <h2>Overview</h2>
          <div class="metric">
            <div class="metric-value">${data.overview.totalContracts}</div>
            <div class="metric-label">Total Contracts</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.overview.totalAnalyses}</div>
            <div class="metric-label">Total Analyses</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.overview.successRate}</div>
            <div class="metric-label">Success Rate</div>
          </div>
        </div>
      ` : ''}

      ${data.usage ? `
        <div class="section">
          <h2>Usage Analytics</h2>
          <div class="metric">
            <div class="metric-value">${data.usage.uploads}</div>
            <div class="metric-label">Contract Uploads</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.usage.analyses}</div>
            <div class="metric-label">Analyses Started</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.usage.exports}</div>
            <div class="metric-label">Exports Downloaded</div>
          </div>
        </div>
      ` : ''}

      ${data.performance ? `
        <div class="section">
          <h2>Performance Metrics</h2>
          <div class="metric">
            <div class="metric-value">${formatCurrency(data.performance.totalCost * 100)}</div>
            <div class="metric-label">Total Cost</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.performance.averageTokensUsed.toFixed(0)}</div>
            <div class="metric-label">Avg Tokens Used</div>
          </div>
        </div>
      ` : ''}

      ${data.risk ? `
        <div class="section">
          <h2>Risk Assessment</h2>
          <div class="metric">
            <div class="metric-value">${data.risk.highRiskContracts}</div>
            <div class="metric-label">High Risk Contracts</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.risk.criticalRiskContracts}</div>
            <div class="metric-label">Critical Risk Contracts</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.risk.totalRisks}</div>
            <div class="metric-label">Total Risks Identified</div>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>Generated by Contract Analize</p>
      </div>
    </body>
    </html>
  `;
} 