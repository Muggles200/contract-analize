# Email Preferences Implementation

## Overview

The Email Preferences system provides a comprehensive solution for managing user email communication preferences, including granular control over different email types, frequency settings, and unsubscribe functionality.

## Features

### ✅ Completed Features

1. **Database Schema**
   - `UserEmailPreferences` table with all preference fields
   - `UserNotificationSettings` table for future notification preferences
   - Proper relationships and indexing

2. **API Endpoints**
   - `GET /api/user/email-preferences` - Retrieve user preferences
   - `PUT /api/user/email-preferences` - Update user preferences
   - `GET /api/user/unsubscribe` - Web-based unsubscribe
   - `POST /api/user/unsubscribe` - API-based unsubscribe

3. **Email Service Integration**
   - Resend integration with webhook support
   - Email template management system
   - Automatic unsubscribe link generation
   - Preference enforcement

4. **Webhook Support**
   - `POST /api/webhooks/resend` - Handle Resend webhook events
   - Automatic preference updates on bounces/complaints
   - Email delivery tracking

5. **UI Components**
   - Enhanced EmailPreferences component with real-time saving
   - Frequency controls (immediate, daily, weekly)
   - Timezone selection
   - Loading states and error handling

## Database Schema

### UserEmailPreferences Table

```sql
model UserEmailPreferences {
  id              String   @id @default(cuid())
  userId          String   @unique
  marketing       Boolean  @default(true)
  security        Boolean  @default(true)
  analysis        Boolean  @default(true)
  billing         Boolean  @default(true)
  weekly          Boolean  @default(false)
  frequency       String   @default("immediate") // immediate, daily, weekly
  timezone        String?  @default("UTC")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("user_email_preferences")
}
```

## API Usage

### Get Email Preferences

```typescript
const response = await fetch('/api/user/email-preferences');
const preferences = await response.json();

// Response format:
{
  marketing: boolean,
  security: boolean,
  analysis: boolean,
  billing: boolean,
  weekly: boolean,
  frequency: 'immediate' | 'daily' | 'weekly',
  timezone: string
}
```

### Update Email Preferences

```typescript
const response = await fetch('/api/user/email-preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    marketing: false,
    security: true,
    analysis: true,
    billing: false,
    weekly: true,
    frequency: 'daily',
    timezone: 'America/New_York'
  })
});
```

### Unsubscribe via Web

```
GET /api/user/unsubscribe?token=<token>&type=<emailType>
```

### Unsubscribe via API

```typescript
const response = await fetch('/api/user/unsubscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'unsubscribe_token',
    emailType: 'marketing' // optional, defaults to 'all'
  })
});
```

## Email Service Usage

### Send Email with Template

```typescript
import { sendEmailWithTemplate } from '@/lib/email-service';

const success = await sendEmailWithTemplate(
  'analysis-complete',
  'user@example.com',
  {
    name: 'John Doe',
    contractName: 'Service Agreement',
    totalClauses: 15,
    totalRisks: 3,
    totalRecommendations: 8,
    analysisUrl: 'https://app.example.com/analysis/123'
  },
  'user_id_here'
);
```

### Send Custom Email

```typescript
import { sendCustomEmail } from '@/lib/email-service';

const success = await sendCustomEmail({
  to: 'user@example.com',
  subject: 'Custom Email Subject',
  html: '<h1>Custom HTML</h1>',
  text: 'Custom text version',
  category: 'marketing',
  userId: 'user_id_here',
  metadata: { customField: 'value' }
});
```

## Available Email Templates

1. **analysis-complete** - Notify when contract analysis is complete
2. **security-alert** - Security-related notifications
3. **billing-update** - Billing and subscription updates
4. **weekly-digest** - Weekly summary emails
5. **marketing-newsletter** - Marketing and promotional content

## Environment Variables

```env
# Required for email functionality
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_WEBHOOK_SECRET=your_webhook_secret

# Required for unsubscribe functionality
UNSUBSCRIBE_SECRET=your_unsubscribe_secret

# Required for unsubscribe links
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Webhook Events Handled

The Resend webhook handles the following events:

- `email.delivered` - Email successfully delivered
- `email.delivery_delayed` - Email delivery delayed
- `email.bounced` - Email bounced (hard bounces disable all emails)
- `email.complained` - Email marked as spam (disables marketing emails)
- `email.opened` - Email opened
- `email.clicked` - Email link clicked
- `email.unsubscribed` - User unsubscribed (disables all emails)

## Testing

Run the test script to verify functionality:

```bash
npm run tsx scripts/test-email-preferences.ts
```

## Security Features

1. **Token-based Unsubscribe** - Secure HMAC-based tokens for unsubscribe links
2. **Webhook Verification** - Signature verification for Resend webhooks
3. **Preference Enforcement** - Automatic email blocking based on user preferences
4. **Activity Logging** - All email-related activities are logged for audit

## Future Enhancements

1. **Email Frequency Scheduling** - Implement actual digest scheduling
2. **Advanced Templates** - Drag-and-drop email template builder
3. **A/B Testing** - Email template testing capabilities
4. **Analytics Dashboard** - Email performance metrics
5. **Bulk Email Management** - Admin tools for bulk email operations

## Integration Points

### With Analysis System

```typescript
// Send analysis completion email
await sendEmailWithTemplate(
  'analysis-complete',
  user.email,
  {
    name: user.name,
    contractName: contract.fileName,
    totalClauses: analysis.totalClauses,
    totalRisks: analysis.totalRisks,
    totalRecommendations: analysis.totalRecommendations,
    analysisUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analysis/${analysis.id}`
  },
  user.id
);
```

### With Billing System

```typescript
// Send billing update email
await sendEmailWithTemplate(
  'billing-update',
  user.email,
  {
    name: user.name,
    planName: subscription.planName,
    nextBilling: subscription.currentPeriodEnd,
    amount: subscription.amount,
    billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
  },
  user.id
);
```

## Troubleshooting

### Common Issues

1. **Emails not sending** - Check RESEND_API_KEY and RESEND_FROM_EMAIL
2. **Unsubscribe links not working** - Verify UNSUBSCRIBE_SECRET and NEXT_PUBLIC_APP_URL
3. **Webhooks not receiving** - Ensure RESEND_WEBHOOK_SECRET is set and webhook URL is configured in Resend
4. **Preferences not saving** - Check database connection and user authentication

### Debug Mode

Enable debug logging by setting:

```env
DEBUG_EMAILS=true
```

This will log all email operations to the console.

## Migration Notes

When deploying this feature:

1. Run database migration: `npx prisma migrate dev --name add-email-preferences`
2. Set up Resend webhook URL: `https://yourdomain.com/api/webhooks/resend`
3. Configure environment variables
4. Test unsubscribe functionality
5. Monitor webhook events in logs 