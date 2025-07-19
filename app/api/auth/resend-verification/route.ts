import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || '86400000'));

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    // Extract first name from user name
    const firstName = user.name?.split(' ')[0] || 'there';

    // Send new verification email
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Verify your email - ContractAnalyze',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Hi ${firstName},</p>
            </div>
            
            <div style="padding: 40px; background: white;">
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                We received a request to resend your email verification link. Please click the button below to verify your email address:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                This verification link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                  Having trouble? You can also copy and paste this link into your browser:
                </p>
                <p style="margin: 10px 0 0 0; color: #667eea; font-size: 12px; word-break: break-all;">
                  ${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}
                </p>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">
                © 2024 ContractAnalyze. All rights reserved.<br>
                If you have any questions, please contact us at support@contractanalize.com
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 