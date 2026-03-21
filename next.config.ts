import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

/** Security headers applied to every response. */
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block the site from being embedded in iframes (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Limit referrer information sent on navigation
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features that are not used by this site
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enforce HTTPS for 1 year (only sent over HTTPS by browsers)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
];

// Base Next.js config
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Prevent the client-side router from serving stale RSC payloads when
  // navigating back to a dynamic route (e.g. switching filter categories).
  staleTimes: { dynamic: 0, static: 180 },
  images: {
    // Explicit domains (simple allow-list) plus remotePatterns (granular). Either works; keeping both for clarity.
    domains: ['images.unsplash.com', 'placehold.co'],
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'djfeucuujeenuvappydk.supabase.co', port: '', pathname: '/storage/v1/object/public/**' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'fs', 'path', 'gray-matter'];
    }
    return config;
  },
};

// MDX plugin
const withMDX = createMDX({ extension: /\.mdx?$/ });

// Export merged config so MDX + images domains coexist
export default withMDX({
  ...nextConfig,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});
