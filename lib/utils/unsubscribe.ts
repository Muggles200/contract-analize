import crypto from 'crypto';

/**
 * Generate unsubscribe token for email preferences
 */
export function generateUnsubscribeToken(userId: string, emailType?: string): string {
  const payload = `${userId}:${emailType || 'all'}`;
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify unsubscribe token
 */
export function verifyUnsubscribeToken(token: string, userId: string, emailType?: string): boolean {
  const expectedToken = generateUnsubscribeToken(userId, emailType);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
} 