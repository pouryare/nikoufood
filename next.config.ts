import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

// Files that rarely change: browsers and Arvan's servers may keep them for 30 days (and show the old copy for one more day while checking for a new one).
const longCache = [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }]

const nextConfig: NextConfig = {
  // One self-contained server folder: what the Docker image runs on the VPS.
  output: 'standalone',
  poweredByHeader: false,
  // Keep local files that are not part of the site (uploads, passwords in .env, tools, deploy files) out of the standalone folder.
  outputFileTracingExcludes: {
    '*': ['./media/**', './out/**', './tools/**', './deploy/**', './scripts/**', './.github/**', './.env*', './Dockerfile', './docker-compose*.yml', './README.md', './tsconfig.tsbuildinfo'],
  },
  // Lets addresses that match no page show the site's own 404 (there is no single root layout because of the admin).
  experimental: { globalNotFound: true },
  agentRules: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Keep each optimized picture for 31 days instead of the short default, so it is made once and then served from disk.
    minimumCacheTTL: 2678400,
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/brand/**' }, { pathname: '/home/**' }],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/brand/:path*', headers: longCache },
      { source: '/home/:path*', headers: longCache },
      { source: '/sounds/:path*', headers: longCache },
      { source: '/api/media/file/:path*', headers: longCache },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
