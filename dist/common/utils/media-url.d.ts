import type { Request } from 'express';
export declare function resolveMediaPublicBase(req: Request, configuredBase?: string): string;
export declare function buildMediaAbsoluteUrl(req: Request, relativePath: string, configuredBase?: string): string;
