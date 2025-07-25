import { Resend } from 'resend';
import { prisma } from './db';
import { generateUnsubscribeToken } from '@/lib/utils/unsubscribe';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  category: 'marketing' | 'security' | 'analysis' | 'billing' | 'weekly';
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
  category: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Email templates
const emailTemplates: Record<string, EmailTemplate> = {
  'analysis-complete': {
    id: 'analysis-complete',
    name: 'Analysis Complete',
    subject: 'Your contract analysis is ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Analysis Complete</h2>
        <p>Hello {{name}},</p>
        <p>Your contract analysis for "{{contractName}}" has been completed successfully.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Summary</h3>
          <ul>
            <li>Total Clauses: {{totalClauses}}</li>
            <li>Risks Identified: {{totalRisks}}</li>
            <li>Recommendations: {{totalRecommendations}}</li>
          </ul>
        </div>
        <a href="{{analysisUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Analysis</a>
        {{unsubscribeLink}}
      </div>
    `,
    text: `
      Analysis Complete

      Hello {{name}},

      Your contract analysis for "{{contractName}}" has been completed successfully.

      Summary:
      - Total Clauses: {{totalClauses}}
      - Risks Identified: {{totalRisks}}
      - Recommendations: {{totalRecommendations}}

      View your analysis: {{analysisUrl}}

      {{unsubscribeText}}
    `,
    category: 'analysis',
  },
  'security-alert': {
    id: 'security-alert',
    name: 'Security Alert',
    subject: 'Important security update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Security Alert</h2>
        <p>Hello {{name}},</p>
        <p>We detected {{eventType}} on your account.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Details</h3>
          <p><strong>Time:</strong> {{timestamp}}</p>
          <p><strong>Location:</strong> {{location}}</p>
          <p><strong>Device:</strong> {{device}}</p>
        </div>
        <p>If this wasn't you, please secure your account immediately.</p>
        <a href="{{securityUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Secure Account</a>
        {{unsubscribeLink}}
      </div>
    `,
    text: `
      Security Alert

      Hello {{name}},

      We detected {{eventType}} on your account.

      Details:
      - Time: {{timestamp}}
      - Location: {{location}}
      - Device: {{device}}

      If this wasn't you, please secure your account immediately.

      Secure your account: {{securityUrl}}

      {{unsubscribeText}}
    `,
    category: 'security',
  },
  'billing-update': {
    id: 'billing-update',
    name: 'Billing Update',
    subject: 'Billing information updated',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Billing Update</h2>
        <p>Hello {{name}},</p>
        <p>Your billing information has been updated successfully.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details</h3>
          <p><strong>Plan:</strong> {{planName}}</p>
          <p><strong>Next Billing:</strong> {{nextBilling}}</p>
          <p><strong>Amount:</strong> {{amount}}</p>
        </div>
        <a href="{{billingUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Billing</a>
        {{unsubscribeLink}}
      </div>
    `,
    text: `
      Billing Update

      Hello {{name}},

      Your billing information has been updated successfully.

      Account Details:
      - Plan: {{planName}}
      - Next Billing: {{nextBilling}}
      - Amount: {{amount}}

      View billing: {{billingUrl}}

      {{unsubscribeText}}
    `,
    category: 'billing',
  },
  'weekly-digest': {
    id: 'weekly-digest',
    name: 'Weekly Digest',
    subject: 'Your weekly contract analysis summary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Weekly Summary</h2>
        <p>Hello {{name}},</p>
        <p>Here's your weekly summary of contract analysis activity.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>This Week</h3>
          <ul>
            <li>Contracts Analyzed: {{contractsAnalyzed}}</li>
            <li>Total Risks Found: {{totalRisks}}</li>
            <li>Time Saved: {{timeSaved}}</li>
          </ul>
        </div>
        <a href="{{dashboardUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
        {{unsubscribeLink}}
      </div>
    `,
    text: `
      Weekly Summary

      Hello {{name}},

      Here's your weekly summary of contract analysis activity.

      This Week:
      - Contracts Analyzed: {{contractsAnalyzed}}
      - Total Risks Found: {{totalRisks}}
      - Time Saved: {{timeSaved}}

      View dashboard: {{dashboardUrl}}

      {{unsubscribeText}}
    `,
    category: 'weekly',
  },
  'marketing-newsletter': {
    id: 'marketing-newsletter',
    name: 'Newsletter',
    subject: 'Latest updates and tips for contract analysis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Contract Analysis Newsletter</h2>
        <p>Hello {{name}},</p>
        <p>Here are the latest updates and tips for better contract analysis.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Featured Content</h3>
          <ul>
            <li>{{featuredContent1}}</li>
            <li>{{featuredContent2}}</li>
            <li>{{featuredContent3}}</li>
          </ul>
        </div>
        <a href="{{newsletterUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Read More</a>
        {{unsubscribeLink}}
      </div>
    `,
    text: `
      Contract Analysis Newsletter

      Hello {{name}},

      Here are the latest updates and tips for better contract analysis.

      Featured Content:
      - {{featuredContent1}}
      - {{featuredContent2}}
      - {{featuredContent3}}

      Read more: {{newsletterUrl}}

      {{unsubscribeText}}
    `,
    category: 'marketing',
  },
};

// Check if user should receive emails of a specific category
async function shouldSendEmail(userId: string, category: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { emailPreferences: true },
  });

  if (!user || !user.emailPreferences) {
    return true; // Default to sending if no preferences set
  }

  switch (category) {
    case 'marketing':
      return user.emailPreferences.marketing;
    case 'security':
      return user.emailPreferences.security;
    case 'analysis':
      return user.emailPreferences.analysis;
    case 'billing':
      return user.emailPreferences.billing;
    case 'weekly':
      return user.emailPreferences.weekly;
    default:
      return true;
  }
}

// Generate unsubscribe link
function generateUnsubscribeLink(userId: string, category: string): string {
  const token = generateUnsubscribeToken(userId, category);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/user/unsubscribe?token=${token}&type=${category}`;
}

// Replace template variables
function replaceTemplateVariables(template: string, variables: Record<string, any>, userId?: string, category?: string): string {
  let result = template;
  
  // Replace basic variables
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  });

  // Add unsubscribe link if userId and category are provided
  if (userId && category) {
    const unsubscribeUrl = generateUnsubscribeLink(userId, category);
    const unsubscribeHtml = `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p>Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #3b82f6;">Unsubscribe</a></p>
      </div>
    `;
    const unsubscribeText = `\n\nDon't want to receive these emails? Unsubscribe: ${unsubscribeUrl}`;
    
    result = result.replace('{{unsubscribeLink}}', unsubscribeHtml);
    result = result.replace('{{unsubscribeText}}', unsubscribeText);
  }

  return result;
}

// Send email using template
export async function sendEmailWithTemplate(
  templateId: string,
  to: string,
  variables: Record<string, any>,
  userId?: string
): Promise<boolean> {
  try {
    const template = emailTemplates[templateId];
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Check if user should receive this type of email
    if (userId && !(await shouldSendEmail(userId, template.category))) {
      console.log(`User ${userId} has opted out of ${template.category} emails`);
      return false;
    }

    // Replace template variables
    const html = replaceTemplateVariables(template.html, variables, userId, template.category);
    const text = replaceTemplateVariables(template.text, variables, userId, template.category);

    // Send email via Resend
    const emailData: any = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: [to],
      subject: replaceTemplateVariables(template.subject, variables),
      html: html,
      text: text,
    };

    // Add unsubscribe header only if userId is provided
    if (userId) {
      emailData.headers = {
        'List-Unsubscribe': generateUnsubscribeLink(userId, template.category),
      };
    }

    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error('Failed to send email:', result.error);
      return false;
    }

    // Log email sent event
    if (userId) {
      await prisma.analyticsEvent.create({
        data: {
          userId: userId,
          eventType: 'email_sent',
          eventData: {
            templateId: templateId,
            category: template.category,
            emailId: result.data?.id,
          },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Send custom email
export async function sendCustomEmail(emailData: EmailData): Promise<boolean> {
  try {
    // Check if user should receive this type of email
    if (emailData.userId && !(await shouldSendEmail(emailData.userId, emailData.category))) {
      console.log(`User ${emailData.userId} has opted out of ${emailData.category} emails`);
      return false;
    }

    // Add unsubscribe link if userId is provided
    let html = emailData.html;
    let text = emailData.text;
    
    if (emailData.userId) {
      const unsubscribeUrl = generateUnsubscribeLink(emailData.userId, emailData.category);
      html += `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #3b82f6;">Unsubscribe</a></p>
        </div>
      `;
      text += `\n\nDon't want to receive these emails? Unsubscribe: ${unsubscribeUrl}`;
    }

    // Send email via Resend
    const resendData: any = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: [emailData.to],
      subject: emailData.subject,
      html: html,
      text: text,
    };

    // Add unsubscribe header only if userId is provided
    if (emailData.userId) {
      resendData.headers = {
        'List-Unsubscribe': generateUnsubscribeLink(emailData.userId, emailData.category),
      };
    }

    const result = await resend.emails.send(resendData);

    if (result.error) {
      console.error('Failed to send email:', result.error);
      return false;
    }

    // Log email sent event
    if (emailData.userId) {
      await prisma.analyticsEvent.create({
        data: {
          userId: emailData.userId,
          eventType: 'email_sent',
          eventData: {
            category: emailData.category,
            emailId: result.data?.id,
            metadata: emailData.metadata,
          },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Get all available templates
export function getEmailTemplates(): EmailTemplate[] {
  return Object.values(emailTemplates);
}

// Get template by ID
export function getEmailTemplate(templateId: string): EmailTemplate | null {
  return emailTemplates[templateId] || null;
}

// Simplified sendEmail function for job processors
export async function sendEmail({
  to,
  template,
  data,
  priority = 'normal',
}: {
  to: string;
  template: string;
  data: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}): Promise<boolean> {
  try {
    // Get the template
    const emailTemplate = getEmailTemplate(template);
    if (!emailTemplate) {
      console.error(`Email template not found: ${template}`);
      return false;
    }

    // Replace template variables
    const html = replaceTemplateVariables(emailTemplate.html, data);
    const text = replaceTemplateVariables(emailTemplate.text, data);

    // Send the email
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@contract-analyze.com',
      to: [to],
      subject: emailTemplate.subject,
      html,
      text,
    });

    if (result.error) {
      console.error('Error sending email:', result.error);
      return false;
    }

    console.log(`Email sent successfully to ${to} using template ${template}`);
    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
} 