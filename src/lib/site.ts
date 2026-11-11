/** Public address of the site (no trailing slash). */
// SITE_URL is read when the server starts (a Docker image is built once and run on many addresses);
// NEXT_PUBLIC_SITE_URL is only the fallback for development, because Next bakes it in at build time.
export const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const absoluteUrl = (path = '/'): string => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
