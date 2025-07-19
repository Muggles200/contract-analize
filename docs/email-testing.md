# Email Testing Guide

This guide will help you test and verify that email sending functionality is working correctly in your ContractAnalyze application.

## Prerequisites

1. **Resend Account**: Make sure you have a Resend account at [resend.com](https://resend.com)
2. **API Key**: Get your API key from the [Resend Dashboard](https://resend.com/api-keys)
3. **Environment Setup**: Ensure your `RESEND_API_KEY` is configured in your environment

## Environment Configuration

Create or update your `.env` file with:

```env
RESEND_API_KEY=re_your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Methods

### Method 1: Web Interface (Recommended)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the test page:
   ```
   http://localhost:3000/test-email
   ```

3. Use the web interface to:
   - Check your configuration status
   - Send test emails with different templates
   - View detailed results and error messages

### Method 2: Command Line Script

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Run the test script:
   ```bash
   node scripts/test-email.js your-email@example.com
   ```

3. Check your inbox for the test email

### Method 3: Direct API Testing

You can also test the API endpoints directly:

#### Check Configuration
```bash
curl http://localhost:3000/api/test-email
```

#### Send Test Email
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "testType": "basic"}'
```

## Test Email Types

The application supports three types of test emails:

1. **Basic Test**: Simple email to verify basic functionality
2. **Verification Email**: Mimics the email verification template
3. **Welcome Email**: Mimics the welcome email template

## Troubleshooting

### Common Issues

#### 1. "RESEND_API_KEY is not configured"
- **Solution**: Make sure your `.env` file contains the correct API key
- **Check**: Verify the API key is valid in your Resend dashboard

#### 2. "Failed to send email" with API key error
- **Solution**: Verify your API key is active and has proper permissions
- **Check**: Go to [Resend Dashboard](https://resend.com/api-keys) and ensure the key is not revoked

#### 3. "Domain not verified" error
- **Solution**: Verify your sending domain in Resend
- **Steps**:
  1. Go to [Resend Domains](https://resend.com/domains)
  2. Add and verify your domain
  3. Update the `from` address in your email templates

#### 4. Emails not received
- **Check**: Look in spam/junk folders
- **Verify**: Check Resend dashboard for delivery status
- **Test**: Try with a different email address

### Debugging Steps

1. **Check Configuration**:
   ```bash
   curl http://localhost:3000/api/test-email
   ```

2. **Verify Environment Variables**:
   ```bash
   echo $RESEND_API_KEY
   ```

3. **Check Resend Dashboard**:
   - Go to [Resend Dashboard](https://resend.com)
   - Check API key status
   - Review email logs and delivery status

4. **Test with Different Email**:
   - Try with a Gmail, Outlook, or other major provider
   - Check if the issue is specific to certain email providers

## Production Testing

Before deploying to production:

1. **Domain Verification**: Ensure your production domain is verified in Resend
2. **API Key**: Use a production API key (different from development)
3. **Rate Limits**: Be aware of Resend's rate limits
4. **Monitoring**: Set up email delivery monitoring

## Email Templates

The application uses these email templates:

- **Registration**: Welcome email with verification link
- **Email Verification**: Verification link for new users
- **Password Reset**: Password reset link
- **Resend Verification**: New verification link for unverified users

All templates are styled consistently with the application's branding and include proper error handling.

## Security Considerations

- Never commit API keys to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys
- Monitor email sending logs for suspicious activity
- Implement rate limiting for email endpoints

## Support

If you continue to have issues:

1. Check the [Resend Documentation](https://resend.com/docs)
2. Review the application logs for detailed error messages
3. Verify your Resend account status and billing
4. Contact Resend support if the issue persists 