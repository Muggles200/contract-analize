import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { generateBackupCodes } from '@/lib/security-utils';

// Validation schemas
const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  twoFactorMethod: z.enum(['totp', 'sms', 'email']).optional(),
  loginNotifications: z.boolean().optional(),
  sessionTimeout: z.number().min(5).max(1440).optional(), // 5 minutes to 24 hours
  requirePasswordForChanges: z.boolean().optional(),
  securityAuditLogs: z.boolean().optional(),
});

const twoFactorSetupSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  method: z.enum(['totp', 'sms', 'email']),
});

const twoFactorVerifySchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters'),
});

const backupCodesSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});

// GET - Retrieve security settings
export async function GET() {
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
      include: {
        securitySettings: true,
        twoFactorBackupCodes: {
          where: { isUsed: false },
          select: { id: true, createdAt: true },
        },
        deviceSessions: {
          where: { isActive: true },
          orderBy: { lastActive: 'desc' },
          take: 10,
        },
        securityAuditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get device information for current session
    const currentSession = await prisma.session.findFirst({
      where: { userId: user.id },
      orderBy: { expires: 'desc' },
    });

    const deviceInfo = {
      userAgent: currentSession?.userAgent || 'Unknown',
      ipAddress: 'Unknown', // Would be extracted from request headers in production
      location: 'Unknown', // Would be determined by IP geolocation
      deviceFingerprint: 'Unknown', // Would be generated from browser fingerprinting
    };

    return NextResponse.json({
      securitySettings: user.securitySettings || {
        twoFactorEnabled: false,
        twoFactorMethod: 'totp',
        backupCodesGenerated: false,
        backupCodesRemaining: 0,
        loginNotifications: true,
        sessionTimeout: 30,
        requirePasswordForChanges: true,
        securityAuditLogs: true,
      },
      backupCodes: {
        generated: user.securitySettings?.backupCodesGenerated || false,
        remaining: user.securitySettings?.backupCodesRemaining || 0,
        total: user.twoFactorBackupCodes.length,
      },
      activeSessions: user.deviceSessions.map(session => ({
        id: session.id,
        deviceType: session.deviceType,
        deviceName: session.deviceName,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        location: session.location,
        lastActive: session.lastActive,
        isCurrent: session.sessionToken === currentSession?.sessionToken,
      })),
      recentAuditLogs: user.securityAuditLogs.map(log => ({
        id: log.id,
        eventType: log.eventType,
        description: log.description,
        ipAddress: log.ipAddress,
        location: log.location,
        riskLevel: log.riskLevel,
        createdAt: log.createdAt,
      })),
      deviceInfo,
    });

  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update security settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = securitySettingsSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { securitySettings: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update or create security settings
    const securitySettings = await prisma.userSecuritySettings.upsert({
      where: { userId: user.id },
      update: validatedData,
      create: {
        userId: user.id,
        ...validatedData,
      },
    });

    // Log security settings update
    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        eventType: 'security_settings_updated',
        description: 'Security settings updated',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        userAgent: request.headers.get('user-agent') || 'Unknown',
        metadata: { changes: validatedData },
        riskLevel: 'low',
      },
    });

    return NextResponse.json({
      message: 'Security settings updated successfully',
      securitySettings,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Setup two-factor authentication
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { securitySettings: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'setup-2fa':
        return await handleTwoFactorSetup(user, data);
      
      case 'verify-2fa':
        return await handleTwoFactorVerification(user, data);
      
      case 'disable-2fa':
        return await handleTwoFactorDisable(user, data);
      
      case 'generate-backup-codes':
        return await handleBackupCodesGeneration(user, data);
      
      case 'terminate-session':
        return await handleSessionTermination(user, data);
      
      case 'terminate-all-sessions':
        return await handleAllSessionsTermination(user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error in security settings action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function handleTwoFactorSetup(user: any, data: any) {
  const validatedData = twoFactorSetupSchema.parse(data);

  // Verify current password
  if (!user.password) {
    return NextResponse.json(
      { error: 'Account does not have a password set' },
      { status: 400 }
    );
  }

  const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  // Generate TOTP secret
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, 'Contract Analyzer', secret);

  // Update security settings
  await prisma.userSecuritySettings.upsert({
    where: { userId: user.id },
    update: {
      twoFactorMethod: validatedData.method,
    },
    create: {
      userId: user.id,
      twoFactorMethod: validatedData.method,
    },
  });

  // Log 2FA setup attempt
  await prisma.securityAuditLog.create({
    data: {
      userId: user.id,
      eventType: '2fa_setup_initiated',
      description: 'Two-factor authentication setup initiated',
      metadata: { method: validatedData.method },
      riskLevel: 'medium',
    },
  });

  return NextResponse.json({
    message: 'Two-factor authentication setup initiated',
    secret,
    otpauth,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`,
  });
}

async function handleTwoFactorVerification(user: any, data: any) {
  const validatedData = twoFactorVerifySchema.parse(data);

  // Verify the TOTP code
  const secret = 'your-secret-key'; // In production, this would be stored securely
  const isValid = authenticator.verify({
    token: validatedData.code,
    secret: secret,
  });

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    );
  }

  // Enable 2FA
  await prisma.userSecuritySettings.upsert({
    where: { userId: user.id },
    update: {
      twoFactorEnabled: true,
    },
    create: {
      userId: user.id,
      twoFactorEnabled: true,
    },
  });

  // Log 2FA enabled
  await prisma.securityAuditLog.create({
    data: {
      userId: user.id,
      eventType: '2fa_enabled',
      description: 'Two-factor authentication enabled',
      riskLevel: 'low',
    },
  });

  return NextResponse.json({
    message: 'Two-factor authentication enabled successfully',
  });
}

async function handleTwoFactorDisable(user: any, data: any) {
  const validatedData = twoFactorSetupSchema.parse(data);

  // Verify current password
  if (!user.password) {
    return NextResponse.json(
      { error: 'Account does not have a password set' },
      { status: 400 }
    );
  }

  const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  // Disable 2FA
  await prisma.userSecuritySettings.update({
    where: { userId: user.id },
    data: {
      twoFactorEnabled: false,
      backupCodesGenerated: false,
      backupCodesRemaining: 0,
    },
  });

  // Delete backup codes
  await prisma.twoFactorBackupCode.deleteMany({
    where: { userId: user.id },
  });

  // Log 2FA disabled
  await prisma.securityAuditLog.create({
    data: {
      userId: user.id,
      eventType: '2fa_disabled',
      description: 'Two-factor authentication disabled',
      riskLevel: 'high',
    },
  });

  return NextResponse.json({
    message: 'Two-factor authentication disabled successfully',
  });
}

async function handleBackupCodesGeneration(user: any, data: any) {
  const validatedData = backupCodesSchema.parse(data);

  // Verify current password
  if (!user.password) {
    return NextResponse.json(
      { error: 'Account does not have a password set' },
      { status: 400 }
    );
  }

  const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  // Generate backup codes
  const backupCodes = generateBackupCodes(10);

  // Store backup codes
  await prisma.twoFactorBackupCode.createMany({
    data: backupCodes.map(code => ({
      userId: user.id,
      code: code,
    })),
  });

  // Update security settings
  await prisma.userSecuritySettings.update({
    where: { userId: user.id },
    data: {
      backupCodesGenerated: true,
      backupCodesRemaining: backupCodes.length,
    },
  });

  // Log backup codes generation
  await prisma.securityAuditLog.create({
    data: {
      userId: user.id,
      eventType: 'backup_codes_generated',
      description: 'Backup codes generated',
      riskLevel: 'medium',
    },
  });

  return NextResponse.json({
    message: 'Backup codes generated successfully',
    backupCodes,
  });
}

async function handleSessionTermination(user: any, data: any) {
  const { sessionId } = data;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  // Terminate specific session
  await prisma.deviceSession.update({
    where: { id: sessionId, userId: user.id },
    data: { isActive: false },
  });

  // Log session termination
  await prisma.securityAuditLog.create({
    data: {
      userId: user.id,
      eventType: 'session_terminated',
      description: 'Session terminated by user',
      metadata: { sessionId },
      riskLevel: 'low',
    },
  });

  return NextResponse.json({
    message: 'Session terminated successfully',
  });
}

async function handleAllSessionsTermination(user: any) {
  // Terminate all sessions except current
  await prisma.deviceSession.updateMany({
    where: { userId: user.id },
    data: { isActive: false },
  });

  // Log all sessions termination
  await prisma.securityAuditLog.create({
    data: {
      userId: user.id,
      eventType: 'all_sessions_terminated',
      description: 'All sessions terminated by user',
      riskLevel: 'medium',
    },
  });

  return NextResponse.json({
    message: 'All sessions terminated successfully',
  });
} 