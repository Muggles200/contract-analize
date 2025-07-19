import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || '86400000'));

    // Create user with email verification disabled
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify email for now
        verificationToken: null, // No verification token needed
        verificationExpires: null,
      },
    });

    // Send welcome email (no verification required)
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Welcome to ContractAnalyze!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to ContractAnalyze!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Hi ${firstName},</p>
            </div>
            
            <div style="padding: 40px; background: white;">
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                Thank you for creating your account with ContractAnalyze! We're excited to help you streamline your contract review process with AI-powered analysis.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                Your account is now ready to use. You can start uploading and analyzing contracts right away!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Get Started
                </a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <h3 style="margin: 0 0 15px 0; color: #333;">What you can do with ContractAnalyze:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.6;">
                  <li>Upload and analyze contracts instantly</li>
                  <li>Identify potential risks and issues</li>
                  <li>Extract key clauses and terms</li>
                  <li>Get AI-powered recommendations</li>
                  <li>Collaborate with your team</li>
                </ul>
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
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'User registered successfully! You can now sign in to your account.',
        userId: user.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 