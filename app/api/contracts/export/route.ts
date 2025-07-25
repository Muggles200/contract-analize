import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createObjectCsvWriter } from 'csv-writer';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contractIds, format = 'csv' } = body;

    if (!contractIds || !Array.isArray(contractIds) || contractIds.length === 0) {
      return NextResponse.json(
        { error: 'Contract IDs are required' },
        { status: 400 }
      );
    }

    // Fetch contracts with their analysis results
    const contracts = await prisma.contract.findMany({
      where: {
        id: { in: contractIds },
        userId: session.user.id,
        deletedAt: null
      },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            analysisType: true,
            createdAt: true,
            customParameters: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (contracts.length === 0) {
      return NextResponse.json(
        { error: 'No contracts found' },
        { status: 404 }
      );
    }

    // Generate CSV data
    const csvData = contracts.map(contract => {
      const latestAnalysis = contract.analysisResults[0];
      const metadata = contract.metadata as any;
      
      return {
        'Contract ID': contract.id,
        'File Name': contract.fileName,
        'File Size (MB)': (Number(contract.fileSize) / 1024 / 1024).toFixed(2),
        'Upload Date': contract.createdAt.toISOString().split('T')[0],
        'Contract Type': metadata?.contractType || 'Unknown',
        'Jurisdiction': metadata?.jurisdiction || 'Unknown',
        'Contract Value': metadata?.contractValue || 'Unknown',
        'Parties': metadata?.parties?.join(', ') || 'Unknown',
        'Analysis Status': latestAnalysis?.status || 'Not Analyzed',
        'Analysis Type': latestAnalysis?.analysisType || 'N/A',
        'Analysis Date': latestAnalysis?.createdAt ? latestAnalysis.createdAt.toISOString().split('T')[0] : 'N/A',
        'Page Count': metadata?.pageCount || 'Unknown',
        'Language': metadata?.language || 'Unknown',
      };
    });

    // Create CSV content
    const csvHeaders = Object.keys(csvData[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => 
        csvHeaders.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Log the export activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        activityType: 'contracts_exported',
        description: `Exported ${contracts.length} contracts`,
        metadata: {
          contractIds,
          format,
          exportCount: contracts.length,
        },
      },
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contracts-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Contract export error:', error);
    return NextResponse.json(
      { error: 'Failed to export contracts' },
      { status: 500 }
    );
  }
} 