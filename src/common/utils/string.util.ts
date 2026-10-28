/**
 * Escapes regex special characters to prevent ReDoS and invalid regular expression SyntaxErrors.
 */
export function escapeRegex(input: string): string {
  if (!input) return '';
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
