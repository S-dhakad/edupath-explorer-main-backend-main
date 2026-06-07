"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMediaPublicBase = resolveMediaPublicBase;
exports.buildMediaAbsoluteUrl = buildMediaAbsoluteUrl;
function isLocalHost(host) {
    const h = host.toLowerCase();
    return h.includes('localhost') || h.startsWith('127.0.0.1') || h.startsWith('[::1]');
}
function resolveMediaPublicBase(req, configuredBase = '') {
    const host = req.get('host') || '';
    if (host && isLocalHost(host)) {
        return `${req.protocol}://${host}`.replace(/\/$/, '');
    }
    const base = configuredBase.replace(/\/$/, '');
    if (base)
        return base;
    return `${req.protocol}://${host || 'localhost:3000'}`.replace(/\/$/, '');
}
function buildMediaAbsoluteUrl(req, relativePath, configuredBase = '') {
    const origin = resolveMediaPublicBase(req, configuredBase);
    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${origin}${path}`;
}
//# sourceMappingURL=media-url.js.map