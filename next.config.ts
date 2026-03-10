import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

// Base Next.js config
const nextConfig: NextConfig = {
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
