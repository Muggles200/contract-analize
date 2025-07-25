import crypto from 'crypto';

/**
 * Generate backup codes for two-factor authentication
 * @param count Number of backup codes to generate
 * @returns Array of backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Generate a device fingerprint from browser information
 * @param userAgent User agent string
 * @param screenResolution Screen resolution
 * @param timezone Timezone
 * @param language Language
 * @returns Device fingerprint hash
 */
export function generateDeviceFingerprint(
  userAgent: string,
  screenResolution?: string,
  timezone?: string,
  language?: string
): string {
  const fingerprintData = [
    userAgent,
    screenResolution || '',
    timezone || '',
    language || '',
    // Add more browser-specific data as needed
  ].join('|');
  
  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

/**
 * Validate IP address format
 * @param ip IP address to validate
 * @returns True if valid IP address
 */
export function isValidIPAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Check if an IP address is in a whitelist
 * @param ip IP address to check
 * @param whitelist Array of allowed IP addresses or CIDR ranges
 * @returns True if IP is in whitelist
 */
export function isIPInWhitelist(ip: string, whitelist: string[]): boolean {
  if (!isValidIPAddress(ip)) {
    return false;
  }
  
  return whitelist.some(allowedIP => {
    // Simple exact match for now
    // In production, you'd want to support CIDR ranges
    return allowedIP === ip;
  });
}

/**
 * Calculate risk level based on various factors
 * @param factors Risk factors to consider
 * @returns Risk level ('low', 'medium', 'high', 'critical')
 */
export function calculateRiskLevel(factors: {
  newLocation?: boolean;
  newDevice?: boolean;
  unusualTime?: boolean;
  failedAttempts?: number;
  suspiciousPatterns?: string[];
}): 'low' | 'medium' | 'high' | 'critical' {
  let riskScore = 0;
  
  if (factors.newLocation) riskScore += 2;
  if (factors.newDevice) riskScore += 3;
  if (factors.unusualTime) riskScore += 1;
  if (factors.failedAttempts && factors.failedAttempts > 3) riskScore += 4;
  if (factors.suspiciousPatterns && factors.suspiciousPatterns.length > 0) riskScore += 2;
  
  if (riskScore >= 8) return 'critical';
  if (riskScore >= 5) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

/**
 * Generate a secure random token
 * @param length Length of the token
 * @returns Random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for storage
 * @param data Data to hash
 * @returns Hashed data
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Check if a password meets security requirements
 * @param password Password to check
 * @returns Object with validation results
 */
export function validatePasswordSecurity(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += Math.min(password.length * 2, 20);
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 5;
  else errors.push('Password must contain at least one lowercase letter');
  
  if (/[A-Z]/.test(password)) score += 5;
  else errors.push('Password must contain at least one uppercase letter');
  
  if (/[0-9]/.test(password)) score += 5;
  else errors.push('Password must contain at least one number');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  else errors.push('Password must contain at least one special character');
  
  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
    score = Math.max(0, score - 20);
  }
  
  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
    score = Math.max(0, score - 10);
  }
  
  const isValid = errors.length === 0 && score >= 30;
  
  return {
    isValid,
    errors,
    score: Math.min(score, 100)
  };
}

/**
 * Generate a TOTP secret for two-factor authentication
 * @returns TOTP secret
 */
export function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString('base64').replace(/[^A-Z]/g, '').slice(0, 32);
}

/**
 * Format backup codes for display
 * @param codes Array of backup codes
 * @returns Formatted string
 */
export function formatBackupCodes(codes: string[]): string {
  return codes.map((code, index) => {
    const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
    return `${index + 1}. ${formattedCode}`;
  }).join('\n');
}

/**
 * Sanitize user input for security
 * @param input Input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Check if a session has expired
 * @param expiresAt Expiration timestamp
 * @returns True if session has expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Calculate session timeout in milliseconds
 * @param timeoutMinutes Timeout in minutes
 * @returns Timeout in milliseconds
 */
export function calculateSessionTimeout(timeoutMinutes: number): number {
  return timeoutMinutes * 60 * 1000;
} 