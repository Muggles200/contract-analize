import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, testType = 'basic' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY is not configured' },
        { status: 500 }
      );
    }

    let emailContent;
    let subject;

    switch (testType) {
      case 'verification':
        subject = 'Email Verification Test - ContractAnalyze';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Email Verification Test</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Test Email</p>
            </div>
            
            <div style="padding: 40px; background: white;">
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                This is a test email to verify that your email sending configuration is working correctly.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  ✅ Email System Working
                </div>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                If you received this email, your Resend configuration is properly set up!
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">
                © 2024 ContractAnalyze. All rights reserved.<br>
                This is a test email sent at ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `;
        break;

      case 'welcome':
        subject = 'Welcome Test - ContractAnalyze';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to ContractAnalyze!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Test User</p>
            </div>
            
            <div style="padding: 40px; background: white;">
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                This is a test welcome email to verify that your email sending configuration is working correctly.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                To get started, please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  🎉 Test Verification
                </div>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">
                © 2024 ContractAnalyze. All rights reserved.<br>
                This is a test email sent at ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `;
        break;

      default:
        subject = 'Email Test - ContractAnalyze';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Email Test</h1>
            </div>
            
            <div style="padding: 40px; background: white;">
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                This is a basic test email to verify that your email sending configuration is working correctly.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  ✅ Test Successful
                </div>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">
                © 2024 ContractAnalyze. All rights reserved.
              </p>
            </div>
          </div>
        `;
    }

    // Send test email
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: subject,
      html: emailContent,
    });

    return NextResponse.json(
      { 
        message: 'Test email sent successfully',
        emailId: result.data?.id,
        testType: testType,
        sentTo: email,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check configuration
export async function GET() {
  const hasApiKey = !!process.env.RESEND_API_KEY;
  const apiKeyPrefix = process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A';
  
  return NextResponse.json({
    configured: hasApiKey,
    apiKeyPrefix: hasApiKey ? apiKeyPrefix : null,
    message: hasApiKey 
      ? 'Resend API key is configured' 
      : 'RESEND_API_KEY environment variable is not set'
  });
} 