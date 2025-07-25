import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { NotificationService } from '@/lib/notification-service';

// Validation schema for password change request
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Password strength validation
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Check password history (prevent reuse of recent passwords)
async function checkPasswordHistory(userId: string, newPassword: string): Promise<{ canUse: boolean; error?: string }> {
  try {
    // Get recent password history (last 5 passwords)
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    // Check if new password matches any recent password
    for (const historyEntry of passwordHistory) {
      const isMatch = await bcrypt.compare(newPassword, historyEntry.passwordHash);
      if (isMatch) {
        return {
          canUse: false,
          error: 'Password cannot be the same as any of your last 5 passwords',
        };
      }
    }
    
    return { canUse: true };
  } catch (error) {
    console.error('Error checking password history:', error);
    return { canUse: true }; // Allow if history check fails
  }
}

// Save password to history
async function savePasswordToHistory(userId: string, passwordHash: string): Promise<void> {
  try {
    await prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash,
      },
    });
    
    // Keep only last 10 password entries
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: 10,
    });
    
    if (passwordHistory.length > 0) {
      await prisma.passwordHistory.deleteMany({
        where: {
          id: { in: passwordHistory.map(entry => entry.id) },
        },
      });
    }
  } catch (error) {
    console.error('Error saving password to history:', error);
  }
}

// Invalidate all user sessions
async function invalidateUserSessions(userId: string): Promise<void> {
  try {
    // Delete all sessions for the user to force re-authentication
    await prisma.session.deleteMany({
      where: { userId },
    });
    
    // Log session invalidation
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'sessions_invalidated',
        description: 'All sessions invalidated due to password change',
        metadata: {
          reason: 'password_change',
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error invalidating user sessions:', error);
  }
}

// Send security notification
async function sendSecurityNotification(userId: string, userEmail: string, deviceInfo: any): Promise<void> {
  try {
    await NotificationService.sendNotification({
      userId,
      type: 'email',
      title: 'Password Changed Successfully',
      message: 'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
      category: 'security_alert',
      priority: 'high',
      metadata: {
        deviceInfo,
        timestamp: new Date().toISOString(),
        action: 'password_change',
      },
      actionUrl: `${process.env.NEXTAUTH_URL}/dashboard/security`,
    });
  } catch (error) {
    console.error('Error sending security notification:', error);
  }
}

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
    
    // Validate the request body
    const validatedData = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Account does not have a password set. Please use a different authentication method.' },
        { status: 400 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is different from current password
    const isNewPasswordSame = await bcrypt.compare(validatedData.newPassword, user.password);
    if (isNewPasswordSame) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Validate password strength
    const strengthValidation = validatePasswordStrength(validatedData.newPassword);
    if (!strengthValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet strength requirements', details: strengthValidation.errors },
        { status: 400 }
      );
    }

    // Check password history
    const historyCheck = await checkPasswordHistory(user.id, validatedData.newPassword);
    if (!historyCheck.canUse) {
      return NextResponse.json(
        { error: historyCheck.error },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // Save password to history
    await savePasswordToHistory(user.id, newPasswordHash);

    // Invalidate all user sessions
    await invalidateUserSessions(user.id);

    // Get device information for security notification
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'Unknown';
    
    const deviceInfo = {
      userAgent,
      ipAddress,
      timestamp: new Date().toISOString(),
    };

    // Send security notification
    await sendSecurityNotification(user.id, user.email, deviceInfo);

    // Log the password change activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'password_changed',
        description: 'User changed their password',
        metadata: {
          deviceInfo,
          passwordChangedAt: new Date().toISOString(),
        },
      },
    });

    // Log analytics event
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'password_changed',
        eventData: {
          deviceInfo,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: 'Password changed successfully. You will be logged out of all devices for security.',
      requiresReauth: true,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 