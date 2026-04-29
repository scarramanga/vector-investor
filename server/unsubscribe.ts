/**
 * Unsubscribe token generation and verification using HMAC-SHA256.
 * Tokens are signed with UNSUBSCRIBE_SECRET and contain the user's email.
 */

import crypto from 'node:crypto';

function getSecret(): string {
  const secret = process.env['UNSUBSCRIBE_SECRET'];
  if (!secret) {
    throw new Error('UNSUBSCRIBE_SECRET is not set');
  }
  return secret;
}

/**
 * Generate a signed unsubscribe token for a given email.
 * Format: base64url(email):base64url(hmac)
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = getSecret();
  const emailEncoded = Buffer.from(email).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret).update(email).digest('base64url');
  return `${emailEncoded}.${hmac}`;
}

/**
 * Verify an unsubscribe token and return the email if valid.
 * Returns null if the token is invalid or tampered with.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const secret = getSecret();
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const emailEncoded = parts[0]!;
    const providedHmac = parts[1]!;

    const email = Buffer.from(emailEncoded, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', secret).update(email).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac))) {
      return null;
    }

    return email;
  } catch {
    return null;
  }
}

/**
 * Build the full unsubscribe URL for a given email.
 */
export function buildUnsubscribeUrl(email: string): string {
  const baseUrl = process.env['VECTOR_BASE_URL'] || 'https://vectorinvestor.app';
  const token = generateUnsubscribeToken(email);
  return `${baseUrl}/api/vector/unsubscribe?token=${encodeURIComponent(token)}`;
}
