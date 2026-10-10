/**
 * Strips accidental copy-paste prefixes like "email-", "email: ", "mail-", or leading hyphens.
 */
export function sanitizeEmail(rawEmail?: string | null): string {
  if (!rawEmail) return '';
  return rawEmail
    .trim()
    .toLowerCase()
    .replace(/^(email|mail|e-mail)\s*[:=\-–—\s]+/i, '')
    .replace(/^[-–—\s]+/, '')
    .trim();
}
