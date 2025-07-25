import { Job } from 'bull';
import { prisma } from '../db';
import { EmailJobData, JOB_TYPES } from '../job-queue';
import { sendEmail } from '../email-service';

export async function processEmailJob(job: Job<EmailJobData>) {
  const { userId, email, template, data, priority } = job.data;

  try {
    console.log(`Processing email job ${job.id} for user ${userId}`);

    // Check if user has email preferences that might block this email
    const userEmailPreferences = await prisma.userEmailPreferences.findUnique({
      where: { userId },
    });

    if (userEmailPreferences) {
      // Check if this type of email is allowed
      const isAllowed = checkEmailPermission(template, userEmailPreferences);
      if (!isAllowed) {
        console.log(`Email ${template} blocked by user preferences for user ${userId}`);
        return { success: true, blocked: true, reason: 'user_preferences' };
      }
    }

    // Send the email
    const result = await sendEmail({
      to: email,
      template,
      data,
      priority,
    });

    // Log successful email
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'email_sent',
        description: `Email sent: ${template}`,
        metadata: {
          template,
          email,
          priority,
          success: true,
        },
      },
    });

    console.log(`Email job ${job.id} completed successfully`);
    return { success: true, result };

  } catch (error) {
    console.error(`Error processing email job ${job.id}:`, error);

    // Log failed email
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'email_failed',
        description: `Email failed: ${template}`,
        metadata: {
          template,
          email,
          priority,
          error: (error as any).message,
        },
      },
    });

    throw error;
  }
}

// Check if email is allowed based on user preferences
function checkEmailPermission(template: string, preferences: any): boolean {
  switch (template) {
    case 'welcome':
    case 'email-verification':
    case 'password-reset':
      return true; // Always allow critical emails

    case 'export-ready':
    case 'analysis-complete':
      return preferences.analysis ?? true;

    case 'weekly-digest':
      return preferences.weekly ?? false;

    case 'billing-reminder':
      return preferences.billing ?? true;

    case 'marketing':
      return preferences.marketing ?? false;

    default:
      return true; // Allow by default
  }
}

// Specific email job processors
export async function processWelcomeEmail(job: Job<EmailJobData>) {
  const { userId, email, data } = job.data;

  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Send welcome email
    await sendEmail({
      to: email,
      template: 'welcome',
      data: {
        userName: user.name || 'User',
        ...data,
      },
    });

    // Update user activity
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'welcome_email_sent',
        description: 'Welcome email sent',
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export async function processPasswordResetEmail(job: Job<EmailJobData>) {
  const { userId, email, data } = job.data;

  try {
    // Send password reset email
    await sendEmail({
      to: email,
      template: 'password-reset',
      data: {
        resetUrl: data.resetUrl,
        expiresIn: data.expiresIn || '1 hour',
      },
    });

    // Log the password reset request
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'password_reset_email_sent',
        description: 'Password reset email sent',
        metadata: {
          email,
          expiresIn: data.expiresIn,
        },
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function processExportReadyEmail(job: Job<EmailJobData>) {
  const { userId, email, data } = job.data;

  try {
    // Send export ready email
    await sendEmail({
      to: email,
      template: 'export-ready',
      data: {
        userName: data.userName,
        exportType: data.exportType,
        format: data.format,
        downloadUrl: data.downloadUrl,
        fileSize: data.fileSize,
        expiresIn: '30 days',
      },
    });

    // Log the export notification
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'export_ready_email_sent',
        description: 'Export ready email sent',
        metadata: {
          exportType: data.exportType,
          format: data.format,
          fileSize: data.fileSize,
        },
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending export ready email:', error);
    throw error;
  }
}

export async function processAnalysisCompleteEmail(job: Job<EmailJobData>) {
  const { userId, email, data } = job.data;

  try {
    // Send analysis complete email
    await sendEmail({
      to: email,
      template: 'analysis-complete',
      data: {
        userName: data.userName,
        contractName: data.contractName,
        analysisId: data.analysisId,
        viewUrl: data.viewUrl,
        summary: data.summary,
      },
    });

    // Log the analysis notification
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'analysis_complete_email_sent',
        description: 'Analysis complete email sent',
        metadata: {
          contractName: data.contractName,
          analysisId: data.analysisId,
        },
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending analysis complete email:', error);
    throw error;
  }
}

export async function processWeeklyDigestEmail(job: Job<EmailJobData>) {
  const { userId, email, data } = job.data;

  try {
    // Get user's weekly activity
    const weeklyStats = await prisma.userActivity.groupBy({
      by: ['activityType'],
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      _count: {
        activityType: true,
      },
    });

    // Send weekly digest email
    await sendEmail({
      to: email,
      template: 'weekly-digest',
      data: {
        userName: data.userName,
        weeklyStats,
        newFeatures: data.newFeatures || [],
        tips: data.tips || [],
      },
    });

    // Log the weekly digest
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'weekly_digest_sent',
        description: 'Weekly digest email sent',
        metadata: {
          weeklyStats,
        },
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending weekly digest email:', error);
    throw error;
  }
}

export async function processBillingReminderEmail(job: Job<EmailJobData>) {
  const { userId, email, data } = job.data;

  try {
    // Send billing reminder email
    await sendEmail({
      to: email,
      template: 'billing-reminder',
      data: {
        userName: data.userName,
        amount: data.amount,
        dueDate: data.dueDate,
        invoiceUrl: data.invoiceUrl,
        paymentUrl: data.paymentUrl,
      },
    });

    // Log the billing reminder
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: 'billing_reminder_sent',
        description: 'Billing reminder email sent',
        metadata: {
          amount: data.amount,
          dueDate: data.dueDate,
        },
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Error sending billing reminder email:', error);
    throw error;
  }
}

// Export job processor functions
export const emailProcessors = {
  [JOB_TYPES.SEND_WELCOME_EMAIL]: processWelcomeEmail,
  [JOB_TYPES.SEND_PASSWORD_RESET]: processPasswordResetEmail,
  [JOB_TYPES.SEND_EMAIL_VERIFICATION]: processEmailJob,
  [JOB_TYPES.SEND_EXPORT_READY]: processExportReadyEmail,
  [JOB_TYPES.SEND_ANALYSIS_COMPLETE]: processAnalysisCompleteEmail,
  [JOB_TYPES.SEND_WEEKLY_DIGEST]: processWeeklyDigestEmail,
  [JOB_TYPES.SEND_BILLING_REMINDER]: processBillingReminderEmail,
}; 