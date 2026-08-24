import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

// Content-Security-Policy, scoped to what this app actually loads:
// Supabase (auth/storage), PostHog (analytics), optional Google Analytics,
// next/font (self-hosted, same-origin). 'unsafe-inline' is required for
// script-src (the theme no-flash bootstrap script and conditional GA tags
// use dangerouslySetInnerHTML without a nonce) and for style-src (several
// components set inline `style` attributes) — tightening these to a
// nonce-based policy is a follow-up, not a blocker for a first CSP.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://placehold.co https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.posthog.com https://www.google-analytics.com",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** Security headers applied to every response. */
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block third-party sites from framing us (clickjacking), but allow the
  // site to frame itself — desktop mode embeds its own pages in iframes.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Limit referrer information sent on navigation
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features that are not used by this site
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enforce HTTPS for 1 year (only sent over HTTPS by browsers)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  // Restrict where scripts/styles/connections/frames can come from
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
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
  experimental: {
    // Prevent the client-side router from serving stale RSC payloads when
    // navigating back to a dynamic route (e.g. switching filter categories).
    staleTimes: { dynamic: 0, static: 180 },
  },
  images: {
    // Explicit domains (simple allow-list) plus remotePatterns (granular). Either works; keeping both for clarity.
    domains: ['images.unsplash.com', 'placehold.co', 'hfazxdhdnozlgnxfowpy.supabase.co'],
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'djfeucuujeenuvappydk.supabase.co', port: '', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'hfazxdhdnozlgnxfowpy.supabase.co', port: '', pathname: '/storage/v1/object/public/**' },
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
