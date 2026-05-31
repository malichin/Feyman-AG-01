/** @type {import('next').NextConfig} */

// next-pwa v5 uses webpack config which conflicts with Turbopack in Next.js 16.
// We use a custom service worker (public/sw.js) instead of next-pwa auto-generation.
// The PWA manifest is linked in the layout and the sw is registered manually.

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

module.exports = nextConfig;
