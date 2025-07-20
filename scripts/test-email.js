const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailSending() {
  console.log('🧪 Testing Email Sending Configuration...\n');

  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY environment variable is not set');
    console.log('\nTo fix this:');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add: RESEND_API_KEY=re_your_actual_api_key_here');
    console.log('3. Get your API key from: https://resend.com/api-keys');
    return;
  }

  console.log('✅ RESEND_API_KEY is configured');
  console.log(`🔑 API Key prefix: ${process.env.RESEND_API_KEY.substring(0, 3)}...`);

  // Get email from command line argument or use default
  const email = process.argv[2] || 'test@example.com';
  
  if (!email.includes('@')) {
    console.error('❌ Please provide a valid email address as an argument');
    console.log('Usage: node scripts/test-email.js your-email@example.com');
    return;
  }

  console.log(`📧 Testing with email: ${email}\n`);

  try {
    console.log('📤 Sending test email...');

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Email Test - ContractAnalyze',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Email Test Successful!</h1>
          </div>
          
          <div style="padding: 40px; background: white;">
            <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
              🎉 Congratulations! Your email sending configuration is working correctly.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                ✅ Email System Working
              </div>
            </div>
            
            <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
              This test email was sent at: ${new Date().toLocaleString()}
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              © 2024 ContractAnalyze. All rights reserved.<br>
              This is a test email to verify your configuration.
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`📧 Email ID: ${result.data?.id}`);
    console.log(`📬 Sent to: ${email}`);
    console.log(`⏰ Sent at: ${new Date().toISOString()}`);
    
    console.log('\n🎉 Your email configuration is working perfectly!');
    console.log('📱 Check your inbox for the test email.');

  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure your RESEND_API_KEY is valid and active');
    } else if (error.message.includes('domain')) {
      console.log('\n💡 Make sure your sending domain is verified in Resend');
    }
  }
}

// Run the test
testEmailSending().catch(console.error); 