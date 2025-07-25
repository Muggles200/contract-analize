import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET - Get export request status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    return NextResponse.json({
      exportRequest: {
        ...exportRequest,
        dataTypes: exportRequest.dataTypes as string[],
        dateRange: exportRequest.dateRange as any,
      },
    });

  } catch (error) {
    console.error('Error fetching export request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete export request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    // Delete the export request
    await prisma.dataExportRequest.delete({
      where: { id: id },
    });

    // Log the deletion
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'data_export_deleted',
        description: `Data export deleted: ${exportRequest.type}`,
        metadata: {
          exportId: id,
          type: exportRequest.type,
        },
      },
    });

    return NextResponse.json({
      message: 'Export request deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting export request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 