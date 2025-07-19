import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'application/rtf'
];

const uploadSchema = z.object({
  contractName: z.string().optional(),
  contractType: z.string().optional(),
  tags: z.string().optional(), // JSON string that will be parsed
});

async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 25MB limit'
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF, DOCX, DOC, TXT, or RTF files.'
    };
  }

  // Basic virus scanning - in production, you'd want to integrate with a proper service
  // For now, we'll just check file extension
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf'];
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'File extension not supported'
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contractName = formData.get('contractName') as string;
    const contractType = formData.get('contractType') as string;
    const tagsString = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = await validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Parse tags
    let tags: string[] = [];
    try {
      if (tagsString) {
        tags = JSON.parse(tagsString);
      }
    } catch (error) {
      console.warn('Failed to parse tags:', error);
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true
    });

    if (!session.user.id) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Save to database
    const contract = await prisma.contract.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileSize: BigInt(file.size),
        fileType: file.type,
        blobUrl: blob.url,
        status: 'pending',
        contractName: contractName || file.name,
        contractType: contractType || null,
        tags: tags,
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          blobId: blob.pathname,
        }
      },
      include: {
        analysisResults: true,
      },
    });

    // Log the upload
    await prisma.usageLog.create({
      data: {
        userId: session.user.id,
        action: 'contract_upload',
        resourceType: 'contract',
        resourceId: contract.id,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          contractType: contractType,
        }
      }
    });

    return NextResponse.json({
      success: true,
      contractId: contract.id,
      fileName: file.name,
      fileSize: file.size,
      uploadUrl: blob.url,
      analysisStatus: 'pending',
      estimatedTime: 120 // 2 minutes estimated processing time
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
} 