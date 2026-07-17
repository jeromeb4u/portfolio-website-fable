import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // These ship native/platform binaries. Bundling them bakes in whatever OS
  // built the app (e.g. Windows) — deploying that .next to a Linux server
  // then fails with "Cannot find module". Marking them external means Node
  // resolves them from the deploy target's own node_modules at runtime.
  serverExternalPackages: ['sharp', 'pg', '@libsql/client'],
  // @google/model-viewer ships pre-built ESM but some bundler setups need it
  // explicitly transpiled/traced rather than treated as a pure external.
  transpilePackages: ['@google/model-viewer'],
  async headers() {
    return [
      {
        // Admin panel must never be indexed. Path must match routes.admin in payload.config.ts.
        source: '/backstage/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
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

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
