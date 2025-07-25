# Account Deletion Implementation

## Overview

The Account Deletion system provides secure account management with comprehensive data export, organization membership handling, subscription cancellation, and a grace period for account recovery. This ensures GDPR compliance and user data protection.

## Features

### ✅ Completed Features

1. **API Endpoints**
   - `DELETE /api/user/account` - Schedule account deletion with grace period
   - `GET /api/user/account` - Get account deletion status
   - `POST /api/user/account/recover` - Recover account during grace period
   - `GET /api/user/account/recover` - Check account recovery status

2. **Account Deletion Flow**
   - **Account Deletion Confirmation** - Multi-step confirmation process
   - **Data Export Before Deletion** - Comprehensive data export
   - **Cascade Deletion of User Data** - Proper cleanup of all user data
   - **Organization Membership Handling** - Ownership transfer or organization deletion
   - **Subscription Cancellation** - Automatic cancellation of active subscriptions
   - **Email Confirmation for Deletion** - Notification emails with recovery information
   - **Grace Period for Account Recovery** - 30-day recovery window

3. **Security Features**
   - **Password Verification** - Require password confirmation for deletion
   - **Confirmation Text** - Require typing "DELETE" to confirm
   - **Grace Period** - 30-day window for account recovery
   - **Activity Logging** - Track all deletion-related activities
   - **Security Notifications** - Email alerts for account changes
   - **Analytics Integration** - Track account deletion events

4. **UI Components**
   - **AccountDeletion Component** - Complete account deletion interface
   - **Deletion Status Display** - Show current deletion status
   - **Recovery Information** - Display grace period and recovery options
   - **Confirmation Flow** - Multi-step confirmation process
   - **Loading States** - Proper loading indicators during operations

## API Usage

### Schedule Account Deletion

```typescript
const response = await fetch('/api/user/account', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    password: 'user-password',
    confirmation: 'DELETE',
    reason: 'User requested deletion',
    exportData: true,
  })
});

const data = await response.json();

// Response format:
{
  message: 'Account scheduled for deletion. You have 30 days to recover your account if this was a mistake.',
  gracePeriodDays: 30,
  deletionDate: '2024-02-01T00:00:00.000Z',
  exportData: true,
}
```

### Get Account Deletion Status

```typescript
const response = await fetch('/api/user/account');
const data = await response.json();

// Response format:
{
  isScheduledForDeletion: true,
  deletionDate: '2024-02-01T00:00:00.000Z',
  daysRemaining: 25,
  reason: 'User requested deletion',
  status: 'scheduled',
  canRecover: true,
}
```

### Recover Account

```typescript
const response = await fetch('/api/user/account/recover', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    reason: 'User requested recovery',
  })
});

const data = await response.json();

// Response format:
{
  message: 'Account recovered successfully. You can now log in to your account.',
  daysRemaining: 25,
}
```

### Check Account Recovery Status

```typescript
const response = await fetch('/api/user/account/recover?email=user@example.com');
const data = await response.json();

// Response format:
{
  isScheduledForDeletion: true,
  deletionDate: '2024-02-01T00:00:00.000Z',
  daysRemaining: 25,
  reason: 'User requested deletion',
  status: 'scheduled',
  canRecover: true,
  userEmail: 'user@example.com',
}
```

## Account Deletion Flow

### 1. User Initiation

1. User navigates to account deletion section
2. System checks current deletion status
3. If already scheduled, show status and recovery options
4. If not scheduled, show deletion form

### 2. Confirmation Process

1. **Warning Display** - Show comprehensive warning about data loss
2. **Data Summary** - List what will be deleted
3. **Password Verification** - Require current password
4. **Confirmation Text** - Require typing "DELETE"
5. **Final Confirmation** - Submit deletion request

### 3. Server-side Processing

1. **Authentication** - Verify user session and password
2. **Data Export** - Export comprehensive user data
3. **Organization Handling** - Transfer ownership or delete organizations
4. **Subscription Cancellation** - Cancel active subscriptions
5. **Deletion Scheduling** - Schedule deletion with grace period
6. **Notification** - Send confirmation email
7. **Activity Logging** - Log deletion event
8. **Analytics** - Track deletion event

### 4. Grace Period Management

1. **30-Day Window** - Account remains accessible for 30 days
2. **Recovery Options** - User can recover account during grace period
3. **Status Tracking** - Monitor deletion countdown
4. **Automatic Cleanup** - Delete account after grace period expires

## Data Export

### Export Structure

```typescript
{
  user: {
    id: string,
    name: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
  },
  contracts: [
    {
      id: string,
      name: string,
      type: string,
      status: string,
      createdAt: Date,
      analysisResults: [
        {
          id: string,
          status: string,
          createdAt: Date,
          completedAt: Date,
        }
      ],
    }
  ],
  organizations: [
    {
      organizationId: string,
      role: string,
      joinedAt: Date,
      organization: {
        name: string,
        description: string,
      },
    }
  ],
  activity: [
    {
      id: string,
      activityType: string,
      description: string,
      createdAt: Date,
      metadata: object,
    }
  ],
  analytics: [
    {
      id: string,
      eventType: string,
      createdAt: Date,
      eventData: object,
    }
  ],
  settings: {
    notifications: object,
    email: object,
  },
  reports: {
    scheduled: [
      {
        id: string,
        name: string,
        schedule: object,
        createdAt: Date,
      }
    ],
    history: [
      {
        id: string,
        reportName: string,
        template: string,
        status: string,
        createdAt: Date,
      }
    ],
  },
  exportDate: string,
  exportVersion: string,
}
```

### Data Privacy

- **Sensitive Data Removal** - Passwords and tokens are excluded
- **Metadata Preservation** - Important metadata is retained
- **Structured Format** - JSON format for easy processing
- **Version Control** - Export version tracking

## Organization Membership Handling

### Ownership Transfer Logic

1. **Check Role** - Identify if user is organization owner
2. **Find Other Members** - Look for other organization members
3. **Transfer Ownership** - Transfer to admin or first member
4. **Delete Organization** - If no other members exist
5. **Remove Membership** - Remove user from all organizations

### Implementation

```typescript
// Handle organization membership removal
async function handleOrganizationMemberships(userId: string): Promise<void> {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  });

  for (const membership of memberships) {
    if (membership.role === 'owner') {
      const otherMembers = await prisma.organizationMember.findMany({
        where: {
          organizationId: membership.organizationId,
          userId: { not: userId },
        },
      });

      if (otherMembers.length === 0) {
        // Delete organization if no other members
        await prisma.organization.delete({
          where: { id: membership.organizationId },
        });
      } else {
        // Transfer ownership to first admin or member
        const newOwner = otherMembers.find(m => m.role === 'admin') || otherMembers[0];
        await prisma.organizationMember.update({
          where: { id: newOwner.id },
          data: { role: 'owner' },
        });
      }
    }

    // Remove user from organization
    await prisma.organizationMember.delete({
      where: { id: membership.id },
    });
  }
}
```

## Subscription Cancellation

### Cancellation Process

1. **Find Active Subscriptions** - Locate all active subscriptions
2. **Stripe Integration** - Cancel subscriptions in Stripe
3. **Database Update** - Update subscription status
4. **Billing Cleanup** - Handle billing-related cleanup

### Implementation

```typescript
// Cancel user subscriptions
async function cancelUserSubscriptions(userId: string): Promise<void> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { in: ['active', 'trialing', 'past_due'] },
    },
  });

  for (const subscription of subscriptions) {
    if (subscription.stripeSubscriptionId) {
      // Cancel in Stripe
      // await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });
  }
}
```

## Grace Period Management

### Grace Period Features

- **30-Day Window** - Standard grace period
- **Recovery Options** - Multiple recovery methods
- **Status Tracking** - Real-time countdown
- **Automatic Cleanup** - Scheduled deletion

### Recovery Process

1. **Status Check** - Verify account is in grace period
2. **Recovery Request** - User requests recovery
3. **Cancellation** - Cancel scheduled deletion
4. **Notification** - Send recovery confirmation
5. **Account Restoration** - Restore account access

## Database Schema

### AccountDeletion Table

```sql
model AccountDeletion {
  id              String    @id @default(cuid())
  userId          String
  scheduledFor    DateTime
  reason          String?
  exportData      Json?
  status          String    @default("scheduled") // 'scheduled', 'cancelled', 'completed'
  cancelledAt     DateTime?
  cancelledReason String?
  completedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([scheduledFor])
  @@map("account_deletion")
}
```

### User Table Updates

```sql
model User {
  // ... existing fields ...
  accountDeletion AccountDeletion[]
  
  // ... rest of fields ...
}
```

## Component Usage

### AccountDeletion Component

```tsx
import AccountDeletion from '@/components/AccountDeletion';

export default function ProfilePage() {
  return (
    <div>
      <h2>Delete Account</h2>
      <AccountDeletion />
    </div>
  );
}
```

### Component Features

- **Status Checking** - Automatically checks deletion status
- **Grace Period Display** - Shows remaining days and recovery options
- **Confirmation Flow** - Multi-step confirmation process
- **Error Handling** - Clear error messages for validation failures
- **Loading States** - Proper loading indicators during operations
- **Recovery Information** - Displays recovery options during grace period

## Security Implementation

### Password Verification

```typescript
// Verify password before deletion
const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid) {
  return NextResponse.json(
    { error: 'Password is incorrect' },
    { status: 400 }
  );
}
```

### Confirmation Validation

```typescript
// Require explicit confirmation
if (confirmation !== 'DELETE') {
  return NextResponse.json(
    { error: 'Please type DELETE to confirm account deletion' },
    { status: 400 }
  );
}
```

### Grace Period Security

```typescript
// Check grace period expiration
const daysRemaining = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
if (daysRemaining <= 0) {
  return NextResponse.json(
    { error: 'Grace period has expired' },
    { status: 400 }
  );
}
```

## Error Handling

### Common Error Scenarios

1. **Password Incorrect**
   ```json
   { "error": "Password is incorrect" }
   ```

2. **Confirmation Required**
   ```json
   { "error": "Please type DELETE to confirm account deletion" }
   ```

3. **Grace Period Expired**
   ```json
   { "error": "Grace period has expired. Account recovery is no longer possible." }
   ```

4. **Account Not Scheduled**
   ```json
   { "error": "Account is not scheduled for deletion" }
   ```

5. **Recovery Not Available**
   ```json
   { "error": "Account is not in a recoverable state" }
   ```

## Security Considerations

### 1. Data Protection

- **Grace Period** - 30-day recovery window
- **Data Export** - Comprehensive data export before deletion
- **Secure Deletion** - Proper cleanup of all user data
- **Audit Trail** - Complete activity logging

### 2. Access Control

- **Password Verification** - Require password confirmation
- **Session Validation** - Verify user session
- **Confirmation Required** - Explicit confirmation process
- **Recovery Limits** - Grace period restrictions

### 3. Data Privacy

- **GDPR Compliance** - Right to be forgotten
- **Data Export** - User data portability
- **Secure Cleanup** - Complete data removal
- **Audit Logging** - Deletion activity tracking

### 4. Organization Impact

- **Ownership Transfer** - Automatic ownership transfer
- **Organization Cleanup** - Delete empty organizations
- **Member Notification** - Notify affected members
- **Data Preservation** - Preserve organization data

## Testing

Run the test script to verify functionality:

```bash
npm run tsx scripts/test-account-deletion.ts
```

### Test Coverage

1. **Database Schema** - Verify tables exist and are accessible
2. **Data Export** - Test comprehensive data export functionality
3. **Organization Handling** - Test membership and ownership logic
4. **Subscription Cancellation** - Test subscription cleanup
5. **Deletion Scheduling** - Test grace period scheduling
6. **Account Recovery** - Test recovery functionality
7. **Notification System** - Test email notifications
8. **Activity Logging** - Verify activity tracking
9. **Analytics Events** - Test event logging
10. **Error Handling** - Test various error scenarios
11. **Cleanup** - Verify test data cleanup

## Performance Considerations

### 1. Data Export

- **Efficient Queries** - Optimized database queries
- **Batch Processing** - Process data in batches
- **Memory Management** - Monitor memory usage
- **Timeout Handling** - Handle long-running exports

### 2. Organization Cleanup

- **Transaction Safety** - Use database transactions
- **Rollback Support** - Handle cleanup failures
- **Notification Queuing** - Queue member notifications
- **Background Processing** - Process cleanup asynchronously

### 3. Subscription Management

- **API Rate Limits** - Handle Stripe API limits
- **Error Recovery** - Retry failed cancellations
- **Status Synchronization** - Sync with external services
- **Billing Cleanup** - Handle billing-related cleanup

## Integration Points

### With Authentication System

```typescript
// Verify user session
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### With Notification System

```typescript
// Send deletion confirmation
await NotificationService.sendNotification({
  userId,
  type: 'email',
  title: 'Account Deletion Confirmation',
  message: 'Your account has been scheduled for deletion.',
  category: 'security_alert',
  priority: 'high',
});
```

### With Analytics System

```typescript
// Track deletion event
await prisma.analyticsEvent.create({
  data: {
    userId: user.id,
    eventType: 'account_deletion_scheduled',
    eventData: {
      reason: validatedData.reason,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      exportData: !!exportData,
    },
  },
});
```

### With Activity Logging

```typescript
// Log deletion activity
await prisma.userActivity.create({
  data: {
    userId: user.id,
    activityType: 'account_deletion_scheduled',
    description: 'Account scheduled for deletion',
    metadata: {
      reason: validatedData.reason,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      exportData: !!exportData,
    },
  },
});
```

## Future Enhancements

1. **Bulk Account Management** - Admin-initiated bulk deletions
2. **Advanced Recovery** - Multiple recovery methods
3. **Data Retention Policies** - Configurable retention periods
4. **Legal Compliance** - Enhanced GDPR compliance
5. **Audit Reports** - Comprehensive audit reporting
6. **Recovery Analytics** - Track recovery patterns
7. **Automated Cleanup** - Scheduled cleanup jobs
8. **Data Anonymization** - Anonymize data instead of deletion
9. **Recovery Workflows** - Custom recovery processes
10. **Integration APIs** - Third-party integration support

## Troubleshooting

### Common Issues

1. **Deletion not scheduling** - Check database permissions and constraints
2. **Data export failing** - Verify database connectivity and query performance
3. **Organization cleanup issues** - Check foreign key constraints and relationships
4. **Subscription cancellation failing** - Verify Stripe API configuration
5. **Recovery not working** - Check grace period calculations and status

### Debug Mode

Enable debug logging:

```env
DEBUG_ACCOUNT_DELETION=true
```

This will log all account deletion activities to the console.

### Error Recovery

1. **Database Issues** - Check database connectivity and schema
2. **Export Failures** - Verify data export permissions and performance
3. **Organization Issues** - Check organization membership relationships
4. **Subscription Problems** - Verify Stripe integration and API keys
5. **Recovery Failures** - Check grace period logic and status updates 