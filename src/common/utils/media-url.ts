import type { Request } from 'express';

function isLocalHost(host: string): boolean {
  const h = host.toLowerCase();
  return h.includes('localhost') || h.startsWith('127.0.0.1') || h.startsWith('[::1]');
}

/** Upload responses & media URLs: local server always uses request origin, not remote PUBLIC_MEDIA_BASE. */
export function resolveMediaPublicBase(req: Request, configuredBase = ''): string {
  const host = req.get('host') || '';
  if (host && isLocalHost(host)) {
    return `${req.protocol}://${host}`.replace(/\/$/, '');
  }
  const base = configuredBase.replace(/\/$/, '');
  if (base) return base;
  return `${req.protocol}://${host || 'localhost:3000'}`.replace(/\/$/, '');
}

export function buildMediaAbsoluteUrl(req: Request, relativePath: string, configuredBase = ''): string {
  const origin = resolveMediaPublicBase(req, configuredBase);
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${origin}${path}`;
}
