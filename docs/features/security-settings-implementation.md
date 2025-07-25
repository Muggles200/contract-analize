# Security Settings Implementation

## Overview

The Security Settings section provides comprehensive account security features including two-factor authentication, session management, audit logging, and advanced security controls.

## Features Implemented

### 1. Two-Factor Authentication (2FA)
- **TOTP Support**: Time-based One-Time Password using authenticator apps
- **QR Code Generation**: Easy setup with QR code scanning
- **Backup Codes**: 10 secure backup codes for account recovery
- **Multiple Methods**: Support for TOTP, SMS, and email (extensible)

### 2. Session Management
- **Active Session Tracking**: Monitor all active sessions across devices
- **Session Termination**: Terminate individual or all sessions
- **Session Timeout**: Configurable session timeout (15 minutes to 24 hours)
- **Device Information**: Track device type, location, and IP address

### 3. Security Notifications
- **Login Notifications**: Get notified when someone logs into your account
- **Suspicious Activity Alerts**: Receive alerts about unusual account activity
- **Real-time Monitoring**: Continuous security event monitoring

### 4. IP Address Whitelist
- **IP Restriction**: Allow access only from specific IP addresses
- **Dynamic Management**: Add/remove IP addresses from whitelist
- **Security Enhancement**: Additional layer of access control

### 5. Device Fingerprinting
- **Device Tracking**: Monitor device characteristics for security
- **Anomaly Detection**: Identify suspicious device access patterns
- **Risk Assessment**: Calculate risk levels based on device behavior

### 6. Security Audit Logs
- **Event Logging**: Comprehensive logging of all security events
- **Risk Level Classification**: Events categorized by risk (low, medium, high, critical)
- **Historical Data**: Maintain audit trail for compliance and monitoring

### 7. Additional Security Controls
- **Password Requirements**: Require password for sensitive changes
- **API Access Control**: Manage API access permissions
- **Security Review**: Track last security review date

## Database Schema

### New Models Added

#### UserSecuritySettings
```prisma
model UserSecuritySettings {
  id                           String    @id @default(cuid())
  userId                       String    @unique
  twoFactorEnabled             Boolean   @default(false)
  twoFactorMethod              String    @default("totp")
  backupCodesGenerated         Boolean   @default(false)
  backupCodesRemaining         Int       @default(0)
  loginNotifications           Boolean   @default(true)
  suspiciousActivityAlerts     Boolean   @default(true)
  sessionTimeout               Int       @default(30)
  requirePasswordForChanges    Boolean   @default(true)
  allowApiAccess               Boolean   @default(false)
  ipWhitelist                  String[]  @default([])
  deviceFingerprinting         Boolean   @default(true)
  securityAuditLogs            Boolean   @default(true)
  lastSecurityReview           DateTime?
  createdAt                    DateTime  @default(now())
  updatedAt                    DateTime  @updatedAt
  user                         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### TwoFactorBackupCode
```prisma
model TwoFactorBackupCode {
  id           String   @id @default(cuid())
  userId       String
  code         String   @unique
  isUsed       Boolean  @default(false)
  usedAt       DateTime?
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### SecurityAuditLog
```prisma
model SecurityAuditLog {
  id              String   @id @default(cuid())
  userId          String
  eventType       String
  description     String
  ipAddress       String?
  userAgent       String?
  deviceFingerprint String?
  location        String?
  metadata        Json?
  riskLevel       String   @default("low")
  createdAt       DateTime @default(now())
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### DeviceSession
```prisma
model DeviceSession {
  id              String   @id @default(cuid())
  userId          String
  sessionToken    String   @unique
  deviceType      String
  deviceName      String?
  deviceId        String?
  userAgent       String?
  ipAddress       String?
  location        String?
  deviceFingerprint String?
  isActive        Boolean  @default(true)
  lastActive      DateTime @default(now())
  expiresAt       DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### GET /api/user/security-settings
Retrieves current security settings and related data.

**Response:**
```json
{
  "securitySettings": {
    "twoFactorEnabled": false,
    "twoFactorMethod": "totp",
    "backupCodesGenerated": false,
    "backupCodesRemaining": 0,
    "loginNotifications": true,
    "suspiciousActivityAlerts": true,
    "sessionTimeout": 30,
    "requirePasswordForChanges": true,
    "allowApiAccess": false,
    "ipWhitelist": [],
    "deviceFingerprinting": true,
    "securityAuditLogs": true
  },
  "backupCodes": {
    "generated": false,
    "remaining": 0,
    "total": 0
  },
  "activeSessions": [...],
  "recentAuditLogs": [...],
  "deviceInfo": {...}
}
```

### POST /api/user/security-settings
Updates security settings.

**Request Body:**
```json
{
  "twoFactorEnabled": true,
  "loginNotifications": true,
  "sessionTimeout": 60,
  "ipWhitelist": ["192.168.1.1"]
}
```

### PUT /api/user/security-settings
Handles 2FA setup and session management actions.

**Actions:**
- `setup-2fa`: Initialize 2FA setup
- `verify-2fa`: Verify and enable 2FA
- `disable-2fa`: Disable 2FA
- `generate-backup-codes`: Generate backup codes
- `terminate-session`: Terminate specific session
- `terminate-all-sessions`: Terminate all sessions

## Security Utilities

### Key Functions

#### generateBackupCodes(count: number)
Generates secure backup codes for 2FA recovery.

#### generateDeviceFingerprint(userAgent, screenResolution, timezone, language)
Creates a unique device fingerprint for security tracking.

#### calculateRiskLevel(factors)
Calculates risk level based on various security factors.

#### validatePasswordSecurity(password)
Validates password strength and security requirements.

#### generateTOTPSecret()
Generates TOTP secret for 2FA setup.

## Component Features

### SecuritySettings Component

#### Two-Factor Authentication
- **Setup Flow**: Step-by-step 2FA setup with QR code
- **Verification**: Real-time code verification
- **Backup Codes**: Secure backup code generation and management
- **Disable Option**: Secure 2FA deactivation

#### Session Management
- **Active Sessions**: Display all active sessions with device info
- **Session Control**: Terminate individual or all sessions
- **Timeout Configuration**: Adjustable session timeout settings

#### Security Notifications
- **Toggle Controls**: Enable/disable security notifications
- **Real-time Updates**: Immediate notification preference changes

#### IP Whitelist
- **Dynamic Management**: Add/remove IP addresses
- **Validation**: IP address format validation
- **Visual Feedback**: Clear display of whitelisted IPs

#### Audit Logs
- **Event Display**: Show recent security events
- **Risk Classification**: Color-coded risk levels
- **Detailed Information**: Event details with timestamps

## Security Best Practices

### 1. Password Security
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, and special characters
- Protection against common passwords
- No repeated character sequences

### 2. Two-Factor Authentication
- TOTP-based authentication
- Secure backup code generation
- QR code for easy setup
- Multiple verification methods

### 3. Session Security
- Configurable session timeouts
- Device fingerprinting
- IP address tracking
- Automatic session termination

### 4. Audit and Monitoring
- Comprehensive event logging
- Risk level assessment
- Real-time security monitoring
- Historical data retention

### 5. Access Control
- IP address whitelisting
- Device-based restrictions
- API access management
- Password requirements for changes

## Implementation Notes

### Dependencies
- `otplib`: TOTP implementation
- `qrcode`: QR code generation
- `bcryptjs`: Password hashing
- `crypto`: Cryptographic functions

### Security Considerations
- All sensitive data is hashed before storage
- Backup codes are generated securely
- Session tokens are cryptographically secure
- IP addresses are validated before storage

### Performance Optimizations
- Indexed database queries for fast retrieval
- Efficient session management
- Optimized audit log queries
- Minimal API response payloads

## Future Enhancements

### Planned Features
1. **SMS/Email 2FA**: Additional 2FA methods
2. **Hardware Security Keys**: FIDO2/U2F support
3. **Advanced Threat Detection**: Machine learning-based anomaly detection
4. **Security Score**: User security rating system
5. **Compliance Reporting**: GDPR/SOC2 compliance features
6. **Integration APIs**: Third-party security tool integration

### Scalability Considerations
- Database indexing for large audit logs
- Efficient session cleanup processes
- Caching for frequently accessed settings
- Horizontal scaling support

## Testing

### Test Coverage
- Unit tests for security utilities
- Integration tests for API endpoints
- Component tests for UI interactions
- Security tests for vulnerability assessment

### Test Scenarios
- 2FA setup and verification flows
- Session management operations
- Backup code generation and usage
- Security event logging
- IP whitelist management

## Deployment

### Environment Variables
```env
# Security settings
SECURITY_SESSION_TIMEOUT=30
SECURITY_MAX_LOGIN_ATTEMPTS=5
SECURITY_BACKUP_CODES_COUNT=10
SECURITY_AUDIT_LOG_RETENTION_DAYS=90
```

### Database Migration
```bash
npx prisma db push
npx prisma generate
```

### Monitoring
- Security event alerts
- Failed authentication monitoring
- Session anomaly detection
- API rate limiting

## Conclusion

The Security Settings implementation provides a comprehensive security framework that protects user accounts through multiple layers of security controls. The system is designed to be user-friendly while maintaining high security standards and compliance requirements. 