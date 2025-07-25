import { Job } from 'bull';
import { prisma } from '../db';
import { DataExportJobData, JOB_TYPES } from '../job-queue';
import { sendEmail } from '../email-service';

export async function processDataExport(job: Job<DataExportJobData>) {
  const { exportId, userId, type, dataTypes, format, dateRange } = job.data;

  try {
    console.log(`Processing data export ${exportId} for user ${userId}`);

    // Update export status to processing
    await prisma.dataExportRequest.update({
      where: { id: exportId },
      data: { status: 'processing' },
    });

    // Collect data based on data types
    const exportData: any = {
      exportId,
      userId,
      type,
      dataTypes,
      format,
      dateRange,
      createdAt: new Date().toISOString(),
      data: {},
    };

    // Build date filter
    const dateFilter = dateRange ? {
      createdAt: {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end),
      },
    } : {};

    // Collect profile data
    if (dataTypes.includes('profile')) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
          emailPreferences: true,
          notificationSettings: true,
          privacySettings: true,
          securitySettings: true,
        },
      });

      if (user) {
        exportData.data.profile = {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          preferences: user.preferences,
          emailPreferences: user.emailPreferences,
          notificationSettings: user.notificationSettings,
          privacySettings: user.privacySettings,
          securitySettings: user.securitySettings,
        };
      }
    }

    // Collect contracts data
    if (dataTypes.includes('contracts')) {
      const contracts = await prisma.contract.findMany({
        where: {
          userId,
          ...dateFilter,
        },
        include: {
          analysisResults: true,
          // tags: true, // tags is a string[]
        },
      });

      exportData.data.contracts = contracts;
    }

    // Collect analyses data
    if (dataTypes.includes('analyses')) {
      const analyses = await prisma.analysisResult.findMany({
        where: {
          userId,
          ...dateFilter,
        },
        include: {
          contract: {
            select: {
              id: true,
              contractName: true,
              fileName: true,
            },
          },
        },
      });

      exportData.data.analyses = analyses;
    }

    // Collect settings data
    if (dataTypes.includes('settings')) {
      const settings = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          preferences: true,
          emailPreferences: true,
          notificationSettings: true,
          privacySettings: true,
          securitySettings: true,
        },
      });

      if (settings) {
        exportData.data.settings = settings;
      }
    }

    // Collect activity data
    if (dataTypes.includes('activity')) {
      const activities = await prisma.userActivity.findMany({
        where: {
          userId,
          ...dateFilter,
        },
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit to last 1000 activities
      });

      exportData.data.activities = activities;
    }

    // Generate export file based on format
    let fileContent: string;
    let fileUrl: string;
    let fileSize: number;

    switch (format) {
      case 'json':
        fileContent = JSON.stringify(exportData, null, 2);
        fileUrl = `https://example.com/exports/${exportId}.json`;
        fileSize = Buffer.byteLength(fileContent, 'utf8');
        break;

      case 'csv':
        fileContent = generateCSV(exportData);
        fileUrl = `https://example.com/exports/${exportId}.csv`;
        fileSize = Buffer.byteLength(fileContent, 'utf8');
        break;

      case 'pdf':
        fileContent = generatePDF(exportData);
        fileUrl = `https://example.com/exports/${exportId}.pdf`;
        fileSize = Buffer.byteLength(fileContent, 'utf8');
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Update export request with completed status
    await prisma.dataExportRequest.update({
      where: { id: exportId },
      data: {
        status: 'completed',
        fileUrl,
        fileSize,
        completedAt: new Date(),
      },
    });

    // Send email notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user) {
      await sendEmail({
        to: user.email,
        template: 'export-ready',
        data: {
          userName: user.name || 'User',
          exportType: type,
          format: format.toUpperCase(),
          downloadUrl: fileUrl,
          fileSize: formatFileSize(fileSize),
        },
      });
    }

    console.log(`Data export ${exportId} completed successfully`);
    return { success: true, fileUrl, fileSize };

  } catch (error) {
    console.error(`Error processing data export ${exportId}:`, error);

    // Update export status to failed
    await prisma.dataExportRequest.update({
      where: { id: exportId },
      data: {
        status: 'failed',
      },
    });

    throw error;
  }
}

// Helper function to generate CSV format
function generateCSV(data: any): string {
  const lines: string[] = [];
  
  // Add header
  lines.push('Export ID,User ID,Type,Data Types,Format,Created At');
  lines.push(`${data.exportId},${data.userId},${data.type},"${data.dataTypes.join(',')}",${data.format},${data.createdAt}`);
  
  // Add data sections
  Object.entries(data.data).forEach(([section, sectionData]) => {
    lines.push(''); // Empty line for separation
    lines.push(`=== ${section.toUpperCase()} ===`);
    
    if (Array.isArray(sectionData)) {
      if (sectionData.length > 0) {
        const headers = Object.keys(sectionData[0]);
        lines.push(headers.join(','));
        sectionData.forEach((item: any) => {
          lines.push(headers.map(header => JSON.stringify(item[header] || '')).join(','));
        });
      }
    } else if (typeof sectionData === 'object') {
      Object.entries(sectionData || {}).forEach(([key, value]) => {
        lines.push(`${key},${JSON.stringify(value)}`);
      });
    }
  });
  
  return lines.join('\n');
}

// Helper function to generate PDF format (simplified)
function generatePDF(data: any): string {
  // In a real implementation, you would use a PDF library like puppeteer or jsPDF
  // For now, we'll return a simple text representation
  const lines: string[] = [];
  
  lines.push('CONTRACT ANALYZE - DATA EXPORT REPORT');
  lines.push('=====================================');
  lines.push('');
  lines.push(`Export ID: ${data.exportId}`);
  lines.push(`User ID: ${data.userId}`);
  lines.push(`Type: ${data.type}`);
  lines.push(`Format: ${data.format}`);
  lines.push(`Created: ${data.createdAt}`);
  lines.push('');
  
  Object.entries(data.data).forEach(([section, sectionData]) => {
    lines.push(`SECTION: ${section.toUpperCase()}`);
    lines.push('-'.repeat(50));
    
    if (Array.isArray(sectionData)) {
      lines.push(`Items: ${sectionData.length}`);
      sectionData.forEach((item: any, index: number) => {
        lines.push(`${index + 1}. ${JSON.stringify(item)}`);
      });
    } else if (typeof sectionData === 'object') {
      Object.entries(sectionData || {}).forEach(([key, value]) => {
        lines.push(`${key}: ${JSON.stringify(value)}`);
      });
    }
    lines.push('');
  });
  
  return lines.join('\n');
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Export job processor functions
export const dataExportProcessors = {
  [JOB_TYPES.EXPORT_USER_DATA]: processDataExport,
  [JOB_TYPES.EXPORT_CONTRACTS]: processDataExport,
  [JOB_TYPES.EXPORT_ANALYSES]: processDataExport,
  [JOB_TYPES.EXPORT_SETTINGS]: processDataExport,
  [JOB_TYPES.EXPORT_GDPR_DATA]: processDataExport,
}; 