import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { textExtractionService } from '@/lib/text-extraction';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const options = JSON.parse(formData.get('options') as string || '{}');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Extract text using the service
    const extractionResult = await textExtractionService.extractText(
      fileBuffer,
      file.name,
      {
        enableOCR: options.enableOCR !== false,
        enableImageProcessing: options.enableImageProcessing !== false,
        maxPages: options.maxPages || 100,
        confidenceThreshold: options.confidenceThreshold || 0.7,
        ocrLanguage: options.ocrLanguage || 'eng',
        imageQuality: options.imageQuality || 300,
      }
    );

    return NextResponse.json({
      success: true,
      result: extractionResult,
    });

  } catch (error) {
    console.error('Text extraction API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const options = JSON.parse(searchParams.get('options') || '{}');

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    // Download file from URL
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to download file from URL' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer());
    const fileName = url.split('/').pop() || 'unknown';

    // Extract text using the service
    const extractionResult = await textExtractionService.extractText(
      fileBuffer,
      fileName,
      {
        enableOCR: options.enableOCR !== false,
        enableImageProcessing: options.enableImageProcessing !== false,
        maxPages: options.maxPages || 100,
        confidenceThreshold: options.confidenceThreshold || 0.7,
        ocrLanguage: options.ocrLanguage || 'eng',
        imageQuality: options.imageQuality || 300,
      }
    );

    return NextResponse.json({
      success: true,
      result: extractionResult,
    });

  } catch (error) {
    console.error('Text extraction API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from URL' },
      { status: 500 }
    );
  }
} 